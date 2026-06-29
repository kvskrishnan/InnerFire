import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  goalRepository,
  pillarRepository,
  identityRepository,
  dailyActionRepository,
} from '@/db/repositories'
import type { Goal, LifePillar, IdentityStatement, DailyAction } from '@/db/schema'
import GoalFlashCard from './GoalFlashCard'

interface FlashCardsEmbedProps {
  onComplete: () => void
}

type Response = 'yes' | 'notyet' | 'skip'

export default function FlashCardsEmbed({ onComplete }: FlashCardsEmbedProps) {
  const [loading, setLoading] = useState(true)
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [identities, setIdentities] = useState<IdentityStatement[]>([])
  const [todayActions, setTodayActions] = useState<DailyAction[]>([])
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})

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

      // No active goals — skip straight to onComplete
      if (active.length === 0) {
        onComplete()
      }
    }
    load()
  }, [onComplete])

  function advance() {
    if (currentIndex + 1 >= activeGoals.length) {
      onComplete()
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
    return null
  }

  const goal = activeGoals[currentIndex]
  const pillar = pillars.find(p => p.id === goal.pillarId)
  const identityStatement = goal.identityStatementId
    ? identities.find(i => i.id === goal.identityStatementId)
    : undefined
  const todayAction = todayActions.find(a => a.goalId === goal.id)
  const streak = streaks[goal.id] ?? 0

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative">
      {/* Skip all link */}
      <div className="absolute top-4 right-5 z-10">
        <button
          onClick={onComplete}
          className="text-[#6b6880] text-xs underline underline-offset-2"
        >
          Skip all →
        </button>
      </div>

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
    </div>
  )
}
