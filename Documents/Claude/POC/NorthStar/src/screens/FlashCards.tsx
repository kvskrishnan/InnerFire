import { BottomNav } from '@/components/layout/BottomNav'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  goalRepository,
  pillarRepository,
  identityRepository,
  dailyActionRepository,
} from '@/db/repositories'
import type { Goal, LifePillar, IdentityStatement, DailyAction } from '@/db/schema'
import GoalFlashCard from '@/components/goals/GoalFlashCard'

type Response = 'yes' | 'notyet' | 'skip'

export default function FlashCards() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focusGoalId = searchParams.get('goalId')
  const [loading, setLoading] = useState(true)
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [identities, setIdentities] = useState<IdentityStatement[]>([])
  const [todayActions, setTodayActions] = useState<DailyAction[]>([])
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [sessionDone, setSessionDone] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  useEffect(() => {
    async function load() {
      const [goals, pils, ids, actions] = await Promise.all([
        goalRepository.getAll().catch(() => [] as Goal[]),
        pillarRepository.getAll().catch(() => [] as LifePillar[]),
        identityRepository.getAll().catch(() => [] as IdentityStatement[]),
        dailyActionRepository.getTodayAll().catch(() => [] as DailyAction[]),
      ])
      const active = (goals as Goal[]).filter(g => g.status === 'active')
      const streakMap: Record<string, number> = {}
      for (const g of active) {
        streakMap[g.id] = await dailyActionRepository.getStreak(g.id).catch(() => 0)
      }
      setActiveGoals(active)
      setPillars(pils as LifePillar[])
      setIdentities((ids as IdentityStatement[]).filter(i => !i.archivedAt))
      setTodayActions(actions as DailyAction[])
      setStreaks(streakMap)
      setLoading(false)

      // Jump to the goal from the notification if provided
      if (focusGoalId) {
        const idx = active.findIndex(g => g.id === focusGoalId)
        if (idx > 0) setCurrentIndex(idx)
      }
    }
    load()
  }, [focusGoalId])

  function advance() {
    if (currentIndex + 1 >= activeGoals.length) {
      setSessionDone(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  async function handleYes(goal: Goal) {
    await dailyActionRepository.markComplete(goal.id, goal.title).catch(() => {})
    setResponses(r => ({ ...r, [goal.id]: 'yes' }))
    advance()
  }

  async function handleNotYet(goal: Goal) {
    await dailyActionRepository.markNotYet(goal.id, goal.title).catch(() => {})
    setResponses(r => ({ ...r, [goal.id]: 'notyet' }))
    advance()
  }

  function handleSkip(goalId: string) {
    setResponses(r => ({ ...r, [goalId]: 'skip' }))
    advance()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <span className="text-[#c9a96e] text-4xl animate-pulse">✦</span>
      </div>
    )
  }

  if (activeGoals.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[#c9a96e] text-4xl mb-6">✦</span>
        <p className="text-[#f0ede8] text-xl font-semibold mb-2">No active goals yet.</p>
        <p className="text-[#6b6880] text-sm mb-8">Your goals give these flash cards their power.</p>
        <button
          onClick={() => navigate('/goals')}
          className="bg-[#c9a96e] text-[#0f0f1a] font-bold px-8 py-3 rounded-2xl text-sm tracking-wide"
        >
          Add your first goal →
        </button>
      </div>
    )
  }

  const yesCount = Object.values(responses).filter(r => r === 'yes').length
  const notyetCount = Object.values(responses).filter(r => r === 'notyet').length
  const skipCount = Object.values(responses).filter(r => r === 'skip').length

  if (sessionDone) {
    const activeIdentities = identities.filter(i => !i.archivedAt)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-6 text-center"
      >
        <span className="text-[#c9a96e] text-4xl mb-6">✦</span>
        <h2 className="text-[#f0ede8] text-2xl font-bold mb-8">You showed up.</h2>

        <div className="w-full max-w-sm bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-8 text-left space-y-2">
          {yesCount > 0 && (
            <p className="text-green-400 text-sm">✓ {yesCount} goal{yesCount !== 1 ? 's' : ''} — you took a step</p>
          )}
          {notyetCount > 0 && (
            <p className="text-[#c9a96e] text-sm">→ {notyetCount} goal{notyetCount !== 1 ? 's' : ''} — not yet today</p>
          )}
          {skipCount > 0 && (
            <p className="text-[#6b6880] text-sm">○ {skipCount} goal{skipCount !== 1 ? 's' : ''} — skipped</p>
          )}
        </div>

        {activeIdentities.length > 0 && (
          <div className="mb-8 space-y-1">
            {activeIdentities.map(id => (
              <p key={id.id} className="text-[#c9a96e] italic text-base">"{id.text}"</p>
            ))}
          </div>
        )}

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => navigate('/morning')}
            className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide"
          >
            Start my day →
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-[#6b6880] text-sm py-2"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    )
  }

  const goal = activeGoals[currentIndex]
  const pillar = pillars.find(p => p.id === goal.pillarId)
  const identityStatement = goal.identityStatementId
    ? identities.find(i => i.id === goal.identityStatementId)
    : undefined
  const todayAction = todayActions.find(a => a.goalId === goal.id)
  const streak = streaks[goal.id] ?? 0

  function handleClose() {
    if (Object.keys(responses).length > 0) {
      setConfirmLeave(true)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={handleClose}
          className="text-[#6b6880] text-lg w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
        <span className="text-[#6b6880] text-xs tracking-widest uppercase">Daily Goal Review</span>
        <div className="w-8" />
      </div>

      {/* Confirm leave dialog */}
      {confirmLeave && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-sm">
            <p className="text-[#f0ede8] font-semibold mb-2">Leave session?</p>
            <p className="text-[#6b6880] text-sm mb-6">Your progress so far will be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLeave(false)}
                className="flex-1 border border-[#2a2a3e] text-[#6b6880] py-3 rounded-xl text-sm"
              >
                Stay
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-[#c9a96e] text-[#0f0f1a] font-bold py-3 rounded-xl text-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <GoalFlashCard
          key={currentIndex}
          goal={goal}
          pillar={pillar}
          identityStatement={identityStatement}
          cardIndex={currentIndex + 1}
          totalCards={activeGoals.length}
          todayAction={todayAction}
          streak={streak}
          onYes={() => handleYes(goal)}
          onNotYet={() => handleNotYet(goal)}
          onSkip={() => handleSkip(goal.id)}
        />
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
