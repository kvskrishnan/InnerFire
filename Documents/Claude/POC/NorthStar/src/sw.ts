import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown[] }

// Take over immediately so the old SW (which had clientsClaim) is replaced fast
self.addEventListener('install', () => { self.skipWaiting() })

precacheAndRoute(self.__WB_MANIFEST)

// Handle goal reminder messages from the app
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'GOAL_REMINDER') {
    const { goalId, title, body, notifUrl } = event.data as { goalId: string; title: string; body: string; notifUrl?: string }
    const url = notifUrl ?? `/motivation/${goalId}`
    event.waitUntil(
      self.registration.showNotification(`⚡ ${title}`, {
        body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: `goal-${goalId}`,
        data: { url },
        requireInteraction: false,
        actions: [
          { action: 'open', title: "🔥 I'm ready" },
          { action: 'snooze', title: '⏰ Later' },
        ],
      } as NotificationOptions)
    )
  }
})

interface PeriodicSyncEvent extends Event {
  tag: string
  waitUntil(promise: Promise<void>): void
}

// Periodic background sync (Android Chrome only)
self.addEventListener('periodicsync', (event: Event) => {
  const syncEvent = event as PeriodicSyncEvent
  if (syncEvent.tag === 'goal-reminders') {
    syncEvent.waitUntil(checkAndNotify())
  }
})

async function checkAndNotify(): Promise<void> {
  const db = await openDB()
  if (!db) return

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const goals = await getAllGoals(db)
  for (const goal of goals) {
    if (!goal.reminderEnabled || goal.reminderTime !== currentTime || goal.status !== 'active') continue

    const key = `notified:${goal.id}:${today}:${currentTime}`
    const cache = await caches.open('goal-notif-dedup')
    const existing = await cache.match(key)
    if (existing) continue
    await cache.put(key, new Response('1'))

    const spiritLine = buildSpiritLine(goal.why ?? '')
    await self.registration.showNotification(`⚡ ${goal.title}`, {
      body: spiritLine,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: `goal-${goal.id}`,
      data: { url: `/motivation/${goal.id}` },
      actions: [
        { action: 'open', title: "🔥 I'm ready" },
        { action: 'snooze', title: '⏰ Later' },
      ],
    } as NotificationOptions)
  }
}

function buildSpiritLine(why: string): string {
  if (!why) return 'Your goals are waiting. Take one step today.'
  const firstSentence = why.split(/[.!?]/)[0].trim()
  const short = firstSentence.length > 120 ? firstSentence.slice(0, 117) + '...' : firstSentence
  const prefixes = [
    'Time to show up. Remember why: ',
    'Your future self is watching. ',
    'One step. Right now. ',
    'This is your moment. ',
    'Do it for the reason you started: ',
  ]
  return prefixes[new Date().getDay() % prefixes.length] + short
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open('InnerFireDB', 1)
    req.onerror = () => resolve(null)
    req.onsuccess = () => resolve(req.result)
  })
}

interface GoalRecord {
  id: string
  title: string
  why?: string
  reminderTime?: string
  reminderEnabled?: boolean
  status: string
  archivedAt?: string
}

function getAllGoals(db: IDBDatabase): Promise<GoalRecord[]> {
  return new Promise((resolve) => {
    const tx = db.transaction('goals', 'readonly')
    const req = tx.objectStore('goals').getAll()
    req.onerror = () => resolve([])
    req.onsuccess = () => resolve(
      ((req.result ?? []) as GoalRecord[]).filter(g => !g.archivedAt)
    )
  })
}

// Handle notification click — open motivation splash
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'snooze') return

  const url = (event.notification.data as { url?: string })?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
      const existing = clients.find(c => c.url.startsWith(self.location.origin))
      if (existing) {
        await existing.focus()
        // client.navigate() is Chrome-only and fails silently on iOS Safari.
        // postMessage triggers React Router navigation inside the app instead.
        existing.postMessage({ type: 'NAVIGATE', url })
      } else {
        // App not open — open a new window (works on iOS PWA)
        await self.clients.openWindow(url)
      }
    })
  )
})
