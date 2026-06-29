import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const screens = {
  Home: lazy(() => import('@/screens/Home')),
  Onboarding: lazy(() => import('@/screens/Onboarding')),
  Lock: lazy(() => import('@/screens/Lock')),
  Morning: lazy(() => import('@/screens/Morning')),
  Vision: lazy(() => import('@/screens/Vision')),
  Identity: lazy(() => import('@/screens/Identity')),
  Pillars: lazy(() => import('@/screens/Pillars')),
  Goals: lazy(() => import('@/screens/Goals')),
  GoalDetail: lazy(() => import('@/screens/GoalDetail')),
  Actions: lazy(() => import('@/screens/Actions')),
  Reflection: lazy(() => import('@/screens/Reflection')),
  Journal: lazy(() => import('@/screens/Journal')),
  JournalEntry: lazy(() => import('@/screens/JournalEntry')),
  Vault: lazy(() => import('@/screens/Vault')),
  Letters: lazy(() => import('@/screens/Letters')),
  Emergency: lazy(() => import('@/screens/Emergency')),
  Timeline: lazy(() => import('@/screens/Timeline')),
  Notifications: lazy(() => import('@/screens/Notifications')),
  Settings: lazy(() => import('@/screens/Settings')),
  DataManagement: lazy(() => import('@/screens/DataManagement')),
  FlashCards: lazy(() => import('@/screens/FlashCards')),
  MotivationSplash: lazy(() => import('@/screens/MotivationSplash')),
  WeeklyReport: lazy(() => import('@/screens/WeeklyReport')),
}

function ScreenFallback() {
  // Plain dark screen — no spinner, no text. Avoids the visible flash
  // between App's loading state and the actual screen loading.
  return <div className="min-h-screen bg-[#0f0f1a]" />
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <Routes>
        <Route path="/" element={<screens.Home />} />
        <Route path="/onboarding" element={<screens.Onboarding />} />
        <Route path="/lock" element={<screens.Lock />} />
        <Route path="/morning" element={<screens.Morning />} />
        <Route path="/vision" element={<screens.Vision />} />
        <Route path="/identity" element={<screens.Identity />} />
        <Route path="/pillars" element={<screens.Pillars />} />
        <Route path="/goals" element={<screens.Goals />} />
        <Route path="/goals/:id" element={<screens.GoalDetail />} />
        <Route path="/actions" element={<screens.Actions />} />
        <Route path="/reflection" element={<screens.Reflection />} />
        <Route path="/journal" element={<screens.Journal />} />
        <Route path="/journal/:id" element={<screens.JournalEntry />} />
        <Route path="/vault" element={<screens.Vault />} />
        <Route path="/letters" element={<screens.Letters />} />
        <Route path="/emergency" element={<screens.Emergency />} />
        <Route path="/timeline" element={<screens.Timeline />} />
        <Route path="/notifications" element={<screens.Notifications />} />
        <Route path="/settings" element={<screens.Settings />} />
        <Route path="/data" element={<screens.DataManagement />} />
        <Route path="/flashcards" element={<screens.FlashCards />} />
        <Route path="/motivation/:goalId" element={<screens.MotivationSplash />} />
        <Route path="/weekly-report" element={<screens.WeeklyReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
