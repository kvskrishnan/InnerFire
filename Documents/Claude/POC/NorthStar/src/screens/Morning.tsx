import { BottomNav } from '@/components/layout/BottomNav'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ritualRepository } from '@/db/repositories'
import { useAppStore } from '@/stores/appStore'
import VisionCard from '@/components/vision/VisionCard'
import { useVisionData } from '@/hooks/useVisionData'
import FlashCardsEmbed from '@/components/goals/FlashCardsEmbed'

type Phase = 'vision' | 'flashcards' | 'intention'

const today = () => new Date().toISOString().split('T')[0]

export default function Morning() {
  const navigate = useNavigate()
  const { profile, identityStatements, goals, quote, morningStreak, loading } = useVisionData()
  const setMorningDone = useAppStore((s) => s.setMorningDone)
  const [phase, setPhase] = useState<Phase>('vision')
  const [intention, setIntention] = useState('')
  const [saving, setSaving] = useState(false)

  // Redirect if already done today
  useEffect(() => {
    ritualRepository.getCompletionByDate(today(), 'morning').then((c) => {
      if (c && !c.skipped) {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  async function completeMorning(intentionText?: string) {
    setSaving(true)
    try {
      await ritualRepository.markComplete(today(), 'morning')
      setMorningDone(true)
    } finally {
      setSaving(false)
      navigate('/', { replace: true })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <span className="text-[#c9a96e] text-4xl animate-pulse">✦</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[#c9a96e] text-4xl mb-6">✦</span>
        <p className="text-[#f0ede8] text-xl font-semibold mb-2">Your story hasn't started yet.</p>
        <p className="text-[#6b6880] text-sm mb-8">Complete onboarding to unlock your morning ritual.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-[#c9a96e] text-[#0f0f1a] font-semibold px-8 py-3 rounded-full text-sm tracking-wide"
        >
          Begin Onboarding
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <AnimatePresence mode="wait">
        {phase === 'vision' && (
          <motion.div
            key="vision"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col min-h-screen"
          >
            <div className="flex-1">
              <VisionCard
                profile={profile}
                identityStatements={identityStatements}
                goals={goals}
                morningStreak={morningStreak}
                quote={quote}
                mode="morning"
              />
            </div>

            {/* CTA area */}
            <div className="px-6 pb-10 pt-4 bg-[#0f0f1a] space-y-3">
              <button
                onClick={() => setPhase('flashcards')}
                className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide"
              >
                I Choose Growth Today
              </button>
              <button
                onClick={() => completeMorning()}
                className="w-full text-[#6b6880] text-sm py-2"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'flashcards' && (
          <motion.div
            key="flashcards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FlashCardsEmbed onComplete={() => setPhase('intention')} />
          </motion.div>
        )}

        {phase === 'intention' && (
          <motion.div
            key="intention"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-[#0f0f1a] flex flex-col px-6 py-16"
          >
            <div className="flex-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-4">
                  Daily Intention
                </p>
                <h2 className="text-[#f0ede8] text-2xl font-bold mb-3 leading-snug">
                  What will make today meaningful?
                </h2>
                <p className="text-[#6b6880] text-sm mb-8">
                  One sentence. Your commitment to Future You.
                </p>
                <textarea
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="Today I will..."
                  rows={4}
                  className="w-full bg-[#1a1a2e] border border-[#2a2a3e] focus:border-[#c9a96e] rounded-xl px-4 py-3 text-[#f0ede8] placeholder-[#6b6880] text-base resize-none outline-none transition-colors duration-200"
                />
              </motion.div>
            </div>

            <div className="space-y-3 mt-8">
              <button
                onClick={() => completeMorning(intention)}
                disabled={saving}
                className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Begin My Day →'}
              </button>
              <button
                onClick={() => completeMorning()}
                disabled={saving}
                className="w-full text-[#6b6880] text-sm py-2"
              >
                Skip intention
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
