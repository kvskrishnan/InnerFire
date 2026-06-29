import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Providers from './providers'
import AppRoutes from './routes'
import FirstLaunch from '@/components/layout/FirstLaunch'
import DemoModeBanner from '@/components/layout/DemoModeBanner'
import OfflineIndicator from '@/components/layout/OfflineIndicator'
import UpdatePrompt from '@/components/layout/UpdatePrompt'
import { db } from '@/db/dexie'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { requestNotificationPermission, checkGoalReminders } from '@/lib/notifications/goalReminderService'

function AppContent() {
  const navigate = useNavigate()
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)

  // Auto-lock on inactivity
  const isLocked = useAuthStore((s) => s.isLocked)
  const autoLockMinutes = useAuthStore((s) => s.autoLockMinutes)
  const lock = useAuthStore((s) => s.lock)
  const updateActivity = useAuthStore((s) => s.updateActivity)
  const isPinSetup = useAuthStore((s) => s.isPinSetup)

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    async function checkFirstLaunch() {
      const progress = await db.onboardingProgress.get('singleton')
      if (!progress) {
        setIsFirstLaunch(true)
        return
      }
      if (progress.completed) {
        setOnboardingComplete(true)
        setIsFirstLaunch(false)
      } else {
        setOnboardingComplete(false)
        setIsFirstLaunch(false)
        if (window.location.pathname !== '/onboarding') {
          navigateRef.current('/onboarding', { replace: true })
        }
      }
    }
    checkFirstLaunch()
  }, [setOnboardingComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Never auto-lock during onboarding or when no PIN is configured
    if (autoLockMinutes === 0 || !isPinSetup || !hasCompletedOnboarding) return

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const
    const onActivity = () => updateActivity()
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }))

    const interval = setInterval(() => {
      const store = useAuthStore.getState()
      if (store.isPinSetup && !store.isLocked && store.autoLockMinutes > 0) {
        const idleMs = Date.now() - store.lastActivityAt
        if (idleMs > store.autoLockMinutes * 60 * 1000) {
          lock()
        }
      }
    }, 30_000) // check every 30s

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity))
      clearInterval(interval)
    }
  }, [autoLockMinutes, isPinSetup, hasCompletedOnboarding, lock, updateActivity])

  // Redirect to lock screen when locked
  useEffect(() => {
    if (isLocked && window.location.pathname !== '/lock') {
      navigate('/lock', { replace: true })
    }
  }, [isLocked, navigate])

  // Listen for NAVIGATE messages from the service worker (iOS notification tap fix)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && event.data.url) {
        navigate(event.data.url.replace(window.location.origin, ''))
      }
    }
    navigator.serviceWorker.addEventListener('message', onSwMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage)
  }, [navigate])

  // Request notification permission and start reminder polling
  const reminderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!hasCompletedOnboarding) return

    async function setupNotifications() {
      const granted = await requestNotificationPermission()
      if (!granted) return

      // Run immediately in case a reminder was due before app opened
      checkGoalReminders()

      // Register periodic background sync (Android Chrome only)
      if ('serviceWorker' in navigator) {
        try {
          const sw = await navigator.serviceWorker.ready
          // @ts-ignore
          if ('periodicSync' in sw) {
            // @ts-ignore
            await sw.periodicSync.register('goal-reminders', { minInterval: 60 * 60 * 1000 })
          }
        } catch {
          // Not supported — foreground polling handles it
        }
      }
    }

    // Delay permission prompt slightly so it doesn't fire mid-render
    const setupTimer = setTimeout(() => setupNotifications(), 1500)

    // Poll every 60s while app is open
    if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current)
    reminderIntervalRef.current = setInterval(() => {
      checkGoalReminders()
    }, 60_000)

    // Fire immediately whenever screen is unlocked / app comes to foreground
    // This is the key fix for iOS: JS is suspended when screen locks,
    // so we catch any missed reminders the instant the user returns
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkGoalReminders()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(setupTimer)
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [hasCompletedOnboarding])

  if (isFirstLaunch === null) {
    // Still checking DB — plain dark screen, no spinner so it doesn't flash
    // when Home.tsx immediately shows its own loading state
    return <div className="min-h-screen bg-[#0f0f1a]" />
  }

  if (isFirstLaunch && !hasCompletedOnboarding) {
    return <FirstLaunch onBeginJourney={() => setIsFirstLaunch(false)} />
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <OfflineIndicator />
      <UpdatePrompt />
      <DemoModeBanner />
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}
