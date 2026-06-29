import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import {
  profileRepository,
  motivationRepository,
  identityRepository,
  goalRepository,
} from '@/db/repositories'
import type { UserProfile, MotivationAsset, IdentityStatement, Goal } from '@/db/schema'
import LoadingScreen from '@/components/ui/LoadingScreen'

// ---------- Constants ----------

const FALLBACK_QUOTES = [
  {
    text: 'We are what we repeatedly do. Excellence is not an act, but a habit.',
    author: 'Aristotle',
  },
  {
    text: 'The man who moves a mountain begins by carrying away small stones.',
    author: 'Confucius',
  },
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
  },
]

type Tab = 'strength' | 'breathe' | 'remind'
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale'

interface Quote {
  text: string
  author: string
}

// ---------- Strength Tab ----------

function StrengthTab({
  profile,
  identities,
  goals,
  quotes,
}: {
  profile: UserProfile | null
  identities: IdentityStatement[]
  goals: Goal[]
  quotes: Quote[]
}) {
  const navigate = useNavigate()
  const activeGoal = goals.find((g) => g.status === 'active')
  const firstQuote = quotes[0]

  return (
    <div className="flex flex-col gap-8 pb-8">
      <p className="text-[#6b6880] text-sm tracking-widest uppercase text-center">
        {profile?.name ?? 'You'}
      </p>

      {profile?.personalWhy && (
        <div>
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-3">Your Why</p>
          <div className="border-l-4 border-[#c9a96e] pl-5 py-3">
            <p className="text-[#f0ede8] text-xl italic leading-loose">{profile.personalWhy}</p>
          </div>
        </div>
      )}

      {identities.length > 0 && (
        <div>
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-3">You Are</p>
          <div className="flex flex-wrap">
            {identities.map((id) => (
              <span
                key={id.id}
                className="border border-[#c9a96e] text-[#c9a96e] text-sm px-3 py-1 rounded-full mr-2 mb-2 inline-block"
              >
                {id.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeGoal && (
        <div>
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-3">Your Goal</p>
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
            <p className="text-[#f0ede8] font-medium mb-2">"{activeGoal.title}"</p>
            {activeGoal.why && (
              <p className="text-[#6b6880] text-sm italic">WHY: "{activeGoal.why}"</p>
            )}
          </div>
        </div>
      )}

      {firstQuote && (
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 text-center">
          <p className="text-[#6b6880] text-sm italic leading-relaxed">"{firstQuote.text}"</p>
          {firstQuote.author && (
            <p className="text-[#c9a96e] text-xs mt-2">— {firstQuote.author}</p>
          )}
        </div>
      )}

      <p
        className="text-[#6b6880] text-sm text-center cursor-pointer hover:text-[#f0ede8] transition-colors"
        onClick={() => navigate('/')}
      >
        Back to Home
      </p>
    </div>
  )
}

// ---------- Breathe Tab ----------

function BreatheTab() {
  const [phase, setPhase] = useState<BreathPhase>('idle')
  const [countdown, setCountdown] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [done, setDone] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const addTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => () => clearAll(), [])

  const runCountdown = (start: number, onTick: (n: number) => void, onDone: () => void) => {
    let count = start
    const tick = () => {
      count--
      if (count > 0) {
        onTick(count)
        addTimeout(tick, 1000)
      } else {
        onDone()
      }
    }
    addTimeout(tick, 1000)
  }

  const startCycle = (cycleNum: number) => {
    if (cycleNum > 3) {
      setDone(true)
      setPhase('idle')
      return
    }
    setCycle(cycleNum)

    setPhase('inhale')
    setCountdown(4)
    runCountdown(
      4,
      (n) => setCountdown(n),
      () => {
        setPhase('hold')
        setCountdown(7)
        runCountdown(
          7,
          (n) => setCountdown(n),
          () => {
            setPhase('exhale')
            setCountdown(8)
            runCountdown(
              8,
              (n) => setCountdown(n),
              () => startCycle(cycleNum + 1),
            )
          },
        )
      },
    )
  }

  const handleStart = () => {
    if (phase !== 'idle') return
    clearAll()
    setDone(false)
    startCycle(1)
  }

  const handleReset = () => {
    clearAll()
    setPhase('idle')
    setCountdown(0)
    setCycle(0)
    setDone(false)
  }

  const phaseLabel = () => {
    if (done) return "Well done. You're ready."
    switch (phase) {
      case 'idle':
        return 'Tap to begin'
      case 'inhale':
        return `Breathe in... (${countdown})`
      case 'hold':
        return `Hold... (${countdown})`
      case 'exhale':
        return `Breathe out... (${countdown})`
    }
  }

  const circleScale = phase === 'inhale' || phase === 'hold' ? 1.5 : 1
  const circleDuration =
    phase === 'inhale' ? 4 : phase === 'hold' ? 0.1 : phase === 'exhale' ? 8 : 0.3

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-8 min-h-[60vh]">
      <motion.div
        className="w-32 h-32 rounded-full bg-[#c9a96e]/20 border-2 border-[#c9a96e]"
        style={{ filter: 'blur(1px)', cursor: phase === 'idle' ? 'pointer' : 'default' }}
        animate={{ scale: circleScale }}
        transition={{ duration: circleDuration, ease: 'easeInOut' }}
        onClick={phase === 'idle' ? handleStart : undefined}
      />

      <div className="text-center">
        <p className="text-[#f0ede8] text-lg">{phaseLabel()}</p>
        {cycle > 0 && !done && (
          <p className="text-[#6b6880] text-sm mt-2">Cycle {cycle} of 3</p>
        )}
        {done && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[#c9a96e] text-2xl">✓</span>
            <button
              onClick={handleReset}
              className="text-[#6b6880] text-sm hover:text-[#f0ede8] transition-colors mt-2"
            >
              Start again
            </button>
          </div>
        )}
        {phase === 'idle' && !done && (
          <p className="text-[#6b6880] text-sm mt-2">4 · 7 · 8 breathing</p>
        )}
      </div>
    </div>
  )
}

// ---------- Remind Me Tab ----------

function RemindTab({ quotes }: { quotes: Quote[] }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const displayQuotes = quotes.length > 0 ? quotes : FALLBACK_QUOTES

  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + displayQuotes.length) % displayQuotes.length)
  }
  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % displayQuotes.length)
  }

  const current = displayQuotes[index]

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-3xl p-8 mx-4"
          >
            <p className="text-[#f0ede8] text-xl italic leading-relaxed text-center">
              "{current.text}"
            </p>
            {current.author && (
              <p className="text-[#c9a96e] text-sm text-center mt-4">— {current.author}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <button
          onClick={prev}
          className="text-[#6b6880] hover:text-[#f0ede8] transition-colors"
        >
          ← Prev
        </button>
        <span className="text-[#6b6880]">
          {index + 1} / {displayQuotes.length}
        </span>
        <button
          onClick={next}
          className="text-[#6b6880] hover:text-[#f0ede8] transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ---------- Main Screen ----------

const TABS: { id: Tab; label: string }[] = [
  { id: 'strength', label: '💪 Strength' },
  { id: 'breathe', label: '🌬 Breathe' },
  { id: 'remind', label: '✦ Remind Me' },
]

export default function Emergency() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('strength')

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [identities, setIdentities] = useState<IdentityStatement[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    Promise.all([
      profileRepository.get().catch(() => undefined),
      motivationRepository.getFavorites().catch(() => []),
      identityRepository.getAll().catch(() => []),
      goalRepository.getAll().catch(() => []),
    ]).then(([prof, favs, ids, gs]) => {
      setProfile(prof ?? null)
      setIdentities(ids.filter((i) => !i.archivedAt))
      setGoals(gs)
      const quoteAssets = (favs as MotivationAsset[])
        .filter((a) => a.type === 'quote' && a.text)
        .map((a) => ({ text: a.text!, author: '' }))
      setQuotes(quoteAssets)
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col">
      {/* Close button */}
      <div className="flex justify-end p-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="text-[#6b6880] hover:text-[#f0ede8] transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 max-w-lg mx-auto w-full pb-28" style={{ overscrollBehaviorY: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'strength' && (
              <StrengthTab
                profile={profile}
                identities={identities}
                goals={goals}
                quotes={quotes}
              />
            )}
            {activeTab === 'breathe' && <BreatheTab />}
            {activeTab === 'remind' && <RemindTab quotes={quotes} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tab bar — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-[#2a2a3e] px-2 py-3 z-50">
        <div className="flex justify-around max-w-lg mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-3 py-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-[#c9a96e] border-b-2 border-[#c9a96e]'
                  : 'text-[#6b6880]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
