import { goalRepository } from '@/db/repositories'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Builds every HH:MM between lastCheckMs and nowMs (max 30 min lookback).
// This ensures reminders set for e.g. 07:33 are caught even if iOS
// suspended the app from 07:30 and the user unlocks at 07:36.
function getMissedTimeSlots(): string[] {
  const nowMs = Date.now()
  const lastMs = parseInt(localStorage.getItem('ns_lastReminderCheck') ?? '0', 10)
  // Never look back more than 30 minutes
  const fromMs = Math.max(lastMs, nowMs - 30 * 60_000)
  localStorage.setItem('ns_lastReminderCheck', String(nowMs))

  const seen = new Set<string>()
  for (let t = fromMs; t <= nowMs; t += 60_000) {
    const d = new Date(t)
    seen.add(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
  }
  // Always include the current minute
  const now = new Date(nowMs)
  seen.add(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
  return [...seen]
}

// Called on: app start, every 60s interval, and on visibilitychange (unlock)
export async function checkGoalReminders(): Promise<void> {
  if (Notification.permission !== 'granted') return

  const today = new Date().toISOString().split('T')[0]
  const slots = getMissedTimeSlots()

  const goals = await goalRepository.getAll().catch(() => [])
  const candidates = goals.filter(
    g => g.status === 'active' && g.reminderEnabled && g.reminderTime && slots.includes(g.reminderTime)
  )

  for (const goal of candidates) {
    // One notification per goal per calendar day
    const key = `ns_notified:${goal.id}:${today}`
    if (localStorage.getItem(key)) continue
    localStorage.setItem(key, goal.reminderTime ?? '')
    fireGoalNotification(goal.id, goal.title, goal.why ?? '')
  }
}

export async function sendTestNotification(): Promise<void> {
  if (Notification.permission !== 'granted') {
    await requestNotificationPermission()
  }
  if (Notification.permission !== 'granted') return

  fireGoalNotification('test', 'NorthStar', "Your goals don't care about your excuses. Today is the day.", '/motivation/test')
}

function fireGoalNotification(goalId: string, title: string, why: string, url?: string): void {
  const spiritLine = buildSpiritLine(why)
  const notifUrl = url ?? `/motivation/${goalId}`

  // Always try SW first — required for iOS PWA installed to home screen
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'GOAL_REMINDER',
      goalId,
      title,
      body: spiritLine,
      notifUrl,
    })
    return
  }

  // Fallback: direct Notification API (works in foreground / desktop)
  try {
    const notif = new Notification(`⚡ ${title}`, {
      body: spiritLine,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: `goal-${goalId}`,
    })
    notif.onclick = () => {
      window.focus()
      history.pushState(null, '', notifUrl)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  } catch {
    // Notification blocked or not supported
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
