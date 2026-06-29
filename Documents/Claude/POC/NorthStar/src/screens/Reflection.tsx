import { BottomNav } from '@/components/layout/BottomNav'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { reflectionRepository } from '@/db/repositories'
import { goalRepository } from '@/db/repositories'
import { identityRepository } from '@/db/repositories'
import { ritualRepository } from '@/db/repositories'
import { profileRepository } from '@/db/repositories'
import { useAppStore } from '@/stores/appStore'
import type { Reflection, Goal, IdentityStatement } from '@/db/schema'
import MoodPicker from '@/components/ui/MoodPicker'
import TextareaField from '@/components/ui/TextareaField'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import LoadingScreen from '@/components/ui/LoadingScreen'

const today = () => new Date().toISOString().split('T')[0]

type Phase = 'loading' | 'question' | 'form' | 'done'

interface FormState {
  mood?: 1 | 2 | 3 | 4 | 5
  gratitude: string
  wins: string
  lessons: string
  journalText: string
}

interface FormErrors {
  mood?: string
  gratitude?: string
  wins?: string
  lessons?: string
}

const fadeVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: 'easeIn' as const } },
}

export default function Reflection() {
  const navigate = useNavigate()
  const setNightDone = useAppStore((s) => s.setNightDone)

  const [phase, setPhase] = useState<Phase>('loading')
  const [didMakeFutureProud, setDidMakeFutureProud] = useState<boolean>(false)
  const [firstGoal, setFirstGoal] = useState<Goal | null>(null)
  const [firstIdentity, setFirstIdentity] = useState<IdentityStatement | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [existingReflection, setExistingReflection] = useState<Reflection | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormState>({
    mood: undefined,
    gratitude: '',
    wins: '',
    lessons: '',
    journalText: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    async function init() {
      const date = today()
      const [reflection, goals, identities, ritualDone, profile] = await Promise.all([
        reflectionRepository.getByDate(date).catch(() => undefined),
        goalRepository.getAll().catch(() => []),
        identityRepository.getAll().catch(() => []),
        ritualRepository.getCompletionByDate(date, 'night').catch(() => undefined),
        profileRepository.get().catch(() => undefined),
      ])

      setFirstGoal(goals.filter((g) => g.status === 'active')[0] ?? null)
      setFirstIdentity(identities[0] ?? null)
      setUserName(profile?.name ?? '')

      if (reflection || (ritualDone && !ritualDone.skipped)) {
        setExistingReflection(reflection ?? null)
        setNightDone(true)
        setPhase('done')
      } else {
        setPhase('question')
      }
    }
    init()
  }, [setNightDone])

  function handleProudChoice(proud: boolean) {
    setDidMakeFutureProud(proud)
    setPhase('form')
  }

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.mood) e.mood = 'Please select how today felt'
    if (!form.gratitude.trim()) e.gratitude = 'Please share one thing you are grateful for'
    if (!form.wins.trim()) e.wins = 'Please share one win from today'
    if (!form.lessons.trim()) e.lessons = 'Please share one lesson from today'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    if (!form.mood) return
    setSaving(true)
    try {
      const date = today()
      await reflectionRepository.save({
        date,
        mood: form.mood,
        gratitude: form.gratitude.trim(),
        wins: form.wins.trim(),
        lessons: form.lessons.trim(),
        journalText: form.journalText.trim() || undefined,
        didMakeFutureProud,
      })
      await ritualRepository.markComplete(date, 'night')
      setNightDone(true)
      setPhase('done')
    } finally {
      setSaving(false)
    }
  }

  if (phase === 'loading') return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <AnimatePresence mode="wait">
        {phase === 'question' && (
          <motion.div
            key="question"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex flex-col items-center justify-center px-6 max-w-lg mx-auto text-center"
          >
            <p className="text-[#6b6880] text-3xl mb-8">🌙</p>

            <h1 className="text-2xl font-semibold text-[#f0ede8] leading-snug mb-10">
              Did today's actions make
              <br />
              Future You proud?
            </h1>

            <div className="flex gap-4 w-full mb-6">
              <button
                onClick={() => handleProudChoice(true)}
                className="flex-1 py-4 rounded-2xl border-2 border-[#c9a96e] text-[#c9a96e] font-semibold text-base hover:bg-[#c9a96e]/10 transition-colors active:scale-95"
              >
                YES, proud of today
              </button>
              <button
                onClick={() => handleProudChoice(false)}
                className="flex-1 py-4 rounded-2xl border-2 border-[#2a2a3e] text-[#6b6880] font-semibold text-base hover:border-[#4a4a5e] transition-colors active:scale-95"
              >
                Not quite
              </button>
            </div>

            {firstGoal && (
              <p className="text-[#6b6880] text-sm italic">
                "You said you want to {firstGoal.title}. Was today aligned?"
              </p>
            )}
          </motion.div>
        )}

        {phase === 'form' && (
          <motion.div
            key="form"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="px-6 pb-24 pt-10 max-w-lg mx-auto"
          >
            <div className="mb-8 text-center">
              <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-1">Night Reflection</p>
              <h2 className="text-xl font-semibold text-[#f0ede8]">How was today?</h2>
            </div>

            <div className="flex flex-col gap-6">
              {/* Mood */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <MoodPicker
                  value={form.mood}
                  onChange={(mood) => {
                    setForm((f) => ({ ...f, mood }))
                    setErrors((e) => ({ ...e, mood: undefined }))
                  }}
                />
                {errors.mood && <p className="text-red-400 text-xs mt-2">{errors.mood}</p>}
              </div>

              {/* Gratitude */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <TextareaField
                  label="One thing I'm grateful for"
                  placeholder="My daughter's laugh at dinner tonight."
                  value={form.gratitude}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, gratitude: v }))
                    setErrors((e) => ({ ...e, gratitude: undefined }))
                  }}
                  error={errors.gratitude}
                  rows={3}
                />
              </div>

              {/* Wins */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <TextareaField
                  label="Today's win"
                  placeholder="I ran before 7am even when I didn't feel like it."
                  value={form.wins}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, wins: v }))
                    setErrors((e) => ({ ...e, wins: undefined }))
                  }}
                  error={errors.wins}
                  rows={3}
                />
              </div>

              {/* Lessons */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <TextareaField
                  label="What did I learn?"
                  placeholder="I lead better when I'm well-rested."
                  value={form.lessons}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, lessons: v }))
                    setErrors((e) => ({ ...e, lessons: undefined }))
                  }}
                  error={errors.lessons}
                  rows={3}
                />
              </div>

              {/* Optional */}
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <TextareaField
                  label="Anything else? (optional)"
                  placeholder="Thoughts, observations, anything on your mind..."
                  value={form.journalText}
                  onChange={(v) => setForm((f) => ({ ...f, journalText: v }))}
                  rows={4}
                />
              </div>

              <GoldButton onClick={handleSave} loading={saving} fullWidth>
                Save Reflection →
              </GoldButton>
            </div>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex flex-col items-center justify-center px-6 max-w-lg mx-auto text-center"
          >
            <p className="text-[#c9a96e] text-3xl mb-8">✦</p>

            <h1 className="text-2xl font-semibold text-[#f0ede8] mb-4">
              Rest well{userName ? `, ${userName.split(' ')[0]}` : ''}.
            </h1>

            <p className="text-[#6b6880] text-base leading-relaxed mb-8">
              You reflected. That already makes you different from who you were this morning.
            </p>

            {(existingReflection?.didMakeFutureProud === false || (!existingReflection && !didMakeFutureProud)) && (
              <p className="text-[#6b6880] text-sm italic mb-8">
                Tomorrow is another chance. Future You is still being built.
              </p>
            )}

            {firstIdentity && (
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-10 w-full">
                <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-2">You are</p>
                <p className="text-[#c9a96e] text-base font-medium">{firstIdentity.text}</p>
              </div>
            )}

            <GhostButton onClick={() => navigate('/')} fullWidth>
              Back to Home
            </GhostButton>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
