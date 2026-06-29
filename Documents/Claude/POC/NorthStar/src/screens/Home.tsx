import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import {
  profileRepository,
  goalRepository,
  pillarRepository,
  reflectionRepository,
  identityRepository,
  letterRepository,
  ritualRepository,
} from '@/db/repositories'
import { useAuthStore } from '@/stores/authStore'
import type { UserProfile, Goal, LifePillar, Reflection, IdentityStatement, FutureLetter } from '@/db/schema'
import { BottomNav } from '@/components/layout/BottomNav'
import { EmergencyFab } from '@/components/layout/EmergencyFab'

const moodColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#14b8a6',
  5: '#c9a96e',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const todayStr = () => new Date().toISOString().split('T')[0]

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface DashboardData {
  profile: UserProfile | undefined
  goals: Goal[]
  pillars: LifePillar[]
  reflections: Reflection[]
  identities: IdentityStatement[]
  dueLetters: FutureLetter[]
  morningStreak: number
  morningDone: boolean
  nightDone: boolean
}

export default function Home() {
  const navigate = useNavigate()
  const lock = useAuthStore(s => s.lock)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const t = todayStr()
    async function loadDashboard() {
      const [profile, goals, pillars, reflections, identities, dueLetters, morningStreak, morningCompletion, nightCompletion] = await Promise.all([
        profileRepository.get().catch(() => undefined),
        goalRepository.getAll().catch(() => [] as Goal[]),
        pillarRepository.getAll().catch(() => [] as LifePillar[]),
        reflectionRepository.getRecent(7).catch(() => [] as Reflection[]),
        identityRepository.getAll().catch(() => [] as IdentityStatement[]),
        letterRepository.getDue().catch(() => [] as FutureLetter[]),
        ritualRepository.getStreak('morning').catch(() => 0),
        ritualRepository.getCompletionByDate(t, 'morning').catch(() => undefined),
        ritualRepository.getCompletionByDate(t, 'night').catch(() => undefined),
      ])
      setData({
        profile,
        goals: (goals as Goal[]).filter(g => g.status === 'active'),
        pillars: pillars as LifePillar[],
        reflections: reflections as Reflection[],
        identities: (identities as IdentityStatement[]).filter(i => !i.archivedAt),
        dueLetters: dueLetters as FutureLetter[],
        morningStreak: morningStreak as number,
        morningDone: !!(morningCompletion && !(morningCompletion as { skipped: boolean }).skipped),
        nightDone: !!(nightCompletion && !(nightCompletion as { skipped: boolean }).skipped),
      })
      setLoading(false)
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#c9a96e] text-3xl font-bold"
        >
          ✦
        </motion.span>
      </div>
    )
  }

  const name = data?.profile?.name ?? 'Friend'
  const goals = data?.goals ?? []
  const pillars = data?.pillars ?? []
  const reflections = data?.reflections ?? []
  const identities = data?.identities ?? []
  const dueLetters = data?.dueLetters ?? []
  const morningDone = data?.morningDone ?? false
  const nightDone = data?.nightDone ?? false
  const morningStreak = data?.morningStreak ?? 0

  const reflectionByDate: Record<string, Reflection> = {}
  for (const r of reflections) {
    reflectionByDate[r.date] = r
  }

  const goalsByPillar: Record<string, number> = {}
  for (const g of goals) {
    goalsByPillar[g.pillarId] = (goalsByPillar[g.pillarId] ?? 0) + 1
  }

  const last7Days = getLast7Days()
  const currentHour = new Date().getHours()
  const showNightCTA = currentHour >= 18

  const handleLock = () => {
    lock()
    navigate('/lock')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 pt-4 max-w-lg mx-auto">

        {/* 1. Top bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[#c9a96e] text-sm font-bold tracking-widest">✦ NorthStar</span>
          <button onClick={handleLock} className="text-[#6b6880] hover:text-[#c9a96e] transition-colors">
            <Lock size={18} />
          </button>
        </div>

        {/* 2. Greeting */}
        <div className="mb-6">
          <h1 className="text-[#f0ede8] text-2xl font-bold">{getGreeting()}, {name}.</h1>
          <p className="text-[#6b6880] text-sm mt-1">{formatDate()}</p>
          {morningStreak > 0 && (
            <p className="text-[#c9a96e] text-xs mt-1">🔥 {morningStreak}-day morning streak</p>
          )}
        </div>

        {/* 3. Morning ritual CTA */}
        {!morningDone ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/morning')}
            className="border border-[#c9a96e] rounded-2xl p-4 cursor-pointer mb-6"
          >
            <p className="text-[#c9a96e] font-semibold text-sm">✦  Start your morning ritual</p>
            <p className="text-[#6b6880] text-xs mt-1">Your Vision Card is waiting →</p>
          </motion.div>
        ) : (
          <div className="mb-6">
            <span className="text-[#c9a96e] text-xs border border-[#c9a96e]/40 rounded-full px-3 py-1">
              ✓ Morning ritual complete
            </span>
          </div>
        )}

        {/* Daily Goal Review CTA */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/flashcards')}
          className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 cursor-pointer mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0ede8] font-semibold text-sm">⚡ Daily Goal Review</p>
              <p className="text-[#6b6880] text-xs mt-1">Confront your WHY. Commit to today.</p>
            </div>
            <span className="text-[#c9a96e] text-lg">→</span>
          </div>
        </motion.div>

        {/* Weekly Report CTA */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/weekly-report')}
          className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 cursor-pointer mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0ede8] font-semibold text-sm">📊 Weekly Report</p>
              <p className="text-[#6b6880] text-xs mt-1">See how consistent you've been this week.</p>
            </div>
            <span className="text-[#c9a96e] text-lg">→</span>
          </div>
        </motion.div>

        {/* 4. Life Pillars */}
        {pillars.length > 0 && (
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-2">Your Life Pillars</p>
            <div className="flex overflow-x-auto pb-1 -mx-1 px-1">
              {pillars.map(pillar => {
                const count = goalsByPillar[pillar.id] ?? 0
                return (
                  <div
                    key={pillar.id}
                    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-3 py-3 mr-3 flex-shrink-0 min-w-[100px]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <span className="text-[#f0ede8] text-xs font-medium truncate">{pillar.name}</span>
                    </div>
                    {count > 0 ? (
                      <span className="text-xs font-bold" style={{ color: pillar.color }}>
                        {count} goal{count !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[#6b6880] text-xs">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 5. Active Goals */}
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-2">Your Goals</p>
          {goals.length === 0 ? (
            <div
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 text-center cursor-pointer"
              onClick={() => navigate('/goals')}
            >
              <p className="text-[#6b6880] text-sm">No goals yet — add your first goal</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {goals.slice(0, 3).map(goal => {
                  const pillar = pillars.find(p => p.id === goal.pillarId)
                  return (
                    <motion.div
                      key={goal.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/goals/${goal.id}`)}
                      className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {pillar && (
                            <span
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: pillar.color }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-[#f0ede8] text-sm font-semibold">{goal.title}</p>
                            {goal.why && (
                              <p className="text-[#6b6880] text-xs italic mt-1 line-clamp-2">{goal.why}</p>
                            )}
                            <span className="inline-block mt-2 text-[10px] tracking-widest uppercase text-[#c9a96e] border border-[#c9a96e]/40 rounded-full px-2 py-0.5">
                              Active
                            </span>
                          </div>
                        </div>
                        <span className="text-[#6b6880] text-lg flex-shrink-0">→</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <Link to="/goals" className="block text-right text-[#c9a96e] text-xs mt-3">
                View all goals →
              </Link>
            </>
          )}
        </div>

        {/* 6. Mood / This Week */}
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">This Week</p>
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-1">
              {last7Days.map((date) => {
                const reflection = reflectionByDate[date]
                const dayIndex = new Date(date + 'T12:00:00').getDay()
                const moodEmojis: Record<number,string> = { 1:'😞', 2:'😕', 3:'😐', 4:'😊', 5:'😄' }
                return (
                  <div key={date} className="flex flex-col items-center gap-2">
                    <span className="text-[#6b6880] text-xs font-medium">{DAY_LABELS[dayIndex]}</span>
                    <button
                      onClick={() => reflection && navigate('/reflection')}
                      title={reflection ? `Mood: ${moodEmojis[reflection.mood]}` : 'No reflection'}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95"
                      style={
                        reflection
                          ? { backgroundColor: moodColors[reflection.mood] + '33', border: `2px solid ${moodColors[reflection.mood]}` }
                          : { border: '2px solid #2a2a3e', backgroundColor: 'transparent' }
                      }
                    >
                      {reflection ? <span className="text-xl leading-none">{moodEmojis[reflection.mood]}</span> : null}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-[#2a2a3e]">
              {[['😄','Great'],['😊','Good'],['😐','Okay'],['😕','Low'],['😞','Hard']].map(([emoji, label]) => (
                <span key={label} className="text-[#6b6880] text-[10px] flex items-center gap-1">
                  <span>{emoji}</span>{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Identity */}
        {identities.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs tracking-widest uppercase text-[#6b6880]">You Are</p>
              <Link to="/identity" className="text-[#c9a96e] text-xs">Edit →</Link>
            </div>
            <div className="flex overflow-x-auto pb-1 -mx-1 px-1">
              {identities.slice(0, 5).map(item => (
                <span
                  key={item.id}
                  className="border border-[#c9a96e] text-[#c9a96e] text-sm px-3 py-1 rounded-full mr-2 flex-shrink-0 whitespace-nowrap"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 8. Due Future Letters */}
        {dueLetters.length > 0 && (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/letters')}
            className="border border-[#c9a96e] rounded-2xl p-4 cursor-pointer mb-6"
          >
            <p className="text-[#c9a96e] font-semibold text-sm">📬  A letter from your past self</p>
            <p className="text-[#6b6880] text-xs mt-1">"{dueLetters[0].title}" is ready</p>
          </motion.div>
        )}

        {/* 9. Night Reflection CTA */}
        {showNightCTA && (
          !nightDone ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/reflection')}
              className="border border-[#2a2a3e] rounded-2xl p-4 cursor-pointer mb-6"
            >
              <p className="text-[#f0ede8] font-semibold text-sm">🌙  Evening reflection</p>
              <p className="text-[#6b6880] text-xs mt-1">Did today's actions make Future You proud?</p>
            </motion.div>
          ) : (
            <div className="mb-6">
              <span className="text-[#6b6880] text-xs border border-[#2a2a3e] rounded-full px-3 py-1">
                ✓ Reflection complete
              </span>
            </div>
          )
        )}

      </div>

      <EmergencyFab />
      <BottomNav />
    </div>
  )
}
