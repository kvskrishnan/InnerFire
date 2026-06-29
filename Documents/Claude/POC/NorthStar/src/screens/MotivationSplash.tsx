import { BottomNav } from '@/components/layout/BottomNav'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, type Transition } from 'framer-motion'
import { goalRepository, identityRepository, motivationRepository } from '@/db/repositories'
import type { Goal, IdentityStatement } from '@/db/schema'

const FALLBACK_QUOTES = [
  { text: 'We are what we repeatedly do. Excellence is not an act, but a habit.', author: 'Aristotle' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'Do something today that your future self will thank you for.', author: '' },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: 'James Clear' },
]

function stagger(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: 'easeOut' } as Transition,
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-[#c9a96e] text-sm animate-pulse">Loading...</div>
    </div>
  )
}

function FallbackScreen() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center px-6 text-center gap-8">
      <p className="text-[#c9a96e] text-4xl">✦</p>
      <p className="text-xl italic leading-relaxed text-[#f0ede8]">
        "You set a goal. Now take one step."
      </p>
      <button
        onClick={() => navigate('/goals')}
        className="text-[#c9a96e] underline text-sm"
      >
        Go to my goals →
      </button>
    </div>
  )
}

export default function MotivationSplash() {
  const navigate = useNavigate()
  const { goalId } = useParams<{ goalId: string }>()
  const [loading, setLoading] = useState(true)
  const [goal, setGoal] = useState<Goal | undefined>()
  const [identity, setIdentity] = useState<IdentityStatement | undefined>()
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null)

  useEffect(() => {
    if (!goalId) {
      setLoading(false)
      return
    }

    // Handle test notification gracefully
    if (goalId === 'test') {
      setGoal({
        id: 'test',
        title: 'Your Goals',
        why: 'You started NorthStar because you knew you were capable of more. Every notification is a reminder of that decision.',
        status: 'active',
        pillarId: '',
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Goal)
      const pool = FALLBACK_QUOTES
      setQuote(pool[Math.floor(Math.random() * pool.length)])
      setLoading(false)
      return
    }

    void (async () => {
      const [loadedGoal, identities, quotes] = await Promise.all([
        goalRepository.getById(goalId).catch(() => undefined),
        identityRepository.getAll().catch(() => [] as IdentityStatement[]),
        motivationRepository.getFavorites().catch(() => []),
      ])

      setGoal(loadedGoal)

      const activeIdentities = identities.filter(i => !i.archivedAt)
      setIdentity(activeIdentities[0])

      const savedQuotes = quotes.filter(q => q.type === 'quote' && q.text)
      const quotePool =
        savedQuotes.length > 0
          ? savedQuotes.map(q => ({ text: q.text!, author: '' }))
          : FALLBACK_QUOTES
      setQuote(quotePool[Math.floor(Math.random() * quotePool.length)])

      setLoading(false)
    })()
  }, [goalId])

  if (loading) return <LoadingScreen />
  if (!goal) return <FallbackScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col">
      {/* Animated gold line */}
      <motion.div
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        className="h-0.5 bg-[#c9a96e] w-full"
      />

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
        <motion.p
          {...stagger(0.4)}
          className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-8 text-center"
        >
          Your Reminder
        </motion.p>

        <motion.p
          {...stagger(0.5)}
          className="text-[#6b6880] text-xs tracking-widest uppercase mb-4"
        >
          {goal.title}
        </motion.p>

        <motion.div {...stagger(0.7)} className="mb-10">
          <p className="text-[#c9a96e] text-[10px] tracking-widest uppercase mb-3">Your Why</p>
          <div className="border-l-4 border-[#c9a96e] pl-6">
            <p className="text-[#f0ede8] text-2xl italic leading-relaxed">
              {goal.why ?? 'You set this goal for a reason. Trust yourself.'}
            </p>
          </div>
        </motion.div>

        {identity && (
          <motion.div {...stagger(1.0)} className="mb-8">
            <p className="text-[#6b6880] text-[10px] tracking-widest uppercase mb-2">You Are</p>
            <p className="text-[#c9a96e] text-lg italic">{identity.text}</p>
          </motion.div>
        )}

        {quote && (
          <motion.div {...stagger(1.2)} className="mb-12">
            <p className="text-[#6b6880] text-sm italic leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            {quote.author && (
              <p className="text-[#6b6880] text-xs mt-1">— {quote.author}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, type: 'spring', stiffness: 300, damping: 25 }}
        className="px-6 pb-10 pt-4 border-t border-[#1a1a2e] bg-[#0f0f1a]"
      >
        <button
          onClick={() => navigate(`/flashcards?goalId=${goal.id}`)}
          className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide"
        >
          🔥&nbsp; I&apos;m ready. Let&apos;s go →
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-[#6b6880] text-sm mt-4 py-2"
        >
          Not today
        </button>
      </motion.div>
      <BottomNav />
    </div>
  )
}
