import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { goalRepository } from '@/db/repositories/goalRepository'
import { dailyActionRepository } from '@/db/repositories/dailyActionRepository'
import { reflectionRepository } from '@/db/repositories/reflectionRepository'
import type { Goal, Reflection } from '@/db/schema'
import { BottomNav } from '@/components/layout/BottomNav'

type DayStatus = 'yes' | 'notyet' | 'skip' | null

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const moodColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#14b8a6',
  5: '#c9a96e',
}

const moodEmojis: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄',
}

function getLast7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function formatDateRange(days: string[]): string {
  const fmt = (d: string) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(days[0])} – ${fmt(days[6])}`
}

function getConsistencyMessage(pct: number): string {
  if (pct >= 80) return 'Extraordinary. You are becoming the person you set out to be.'
  if (pct >= 60) return 'Strong week. Keep the momentum going.'
  if (pct >= 40) return 'You showed up more than half the time. Build on that.'
  if (pct >= 1) return 'A rough week. Tomorrow is a fresh start.'
  return 'This is your invitation to begin.'
}

interface WeeklyData {
  activeGoals: Goal[]
  goalWeekMap: Record<string, Record<string, DayStatus>>
  consistencyPct: number
  totalYes: number
  totalPossible: number
  bestGoal: Goal | undefined
  bestGoalYes: number
  reflectionByDate: Record<string, Reflection>
  last7: string[]
}

export default function WeeklyReport() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [weekData, setWeekData] = useState<WeeklyData | null>(null)

  useEffect(() => {
    async function load() {
      const last7 = getLast7Days()
      const startDate = last7[0]
      const endDate = last7[6]

      const [goals, weekActions, reflections] = await Promise.all([
        goalRepository.getAll().catch(() => [] as Goal[]),
        dailyActionRepository.getByDateRange(startDate, endDate).catch(() => []),
        reflectionRepository.getRecent(7).catch(() => [] as Reflection[]),
      ])

      const activeGoals = (goals as Goal[]).filter(g => g.status === 'active')

      const goalWeekMap: Record<string, Record<string, DayStatus>> = {}
      for (const goal of activeGoals) {
        goalWeekMap[goal.id] = {}
        for (const date of last7) {
          const action = weekActions.find(a => a.goalId === goal.id && a.date === date)
          if (!action) goalWeekMap[goal.id][date] = null
          else if (action.completed) goalWeekMap[goal.id][date] = 'yes'
          else goalWeekMap[goal.id][date] = 'notyet'
        }
      }

      const totalPossible = activeGoals.length * 7
      const totalYes = Object.values(goalWeekMap)
        .flatMap(m => Object.values(m))
        .filter(v => v === 'yes').length
      const consistencyPct = totalPossible > 0 ? Math.round((totalYes / totalPossible) * 100) : 0

      let bestGoal: Goal | undefined = activeGoals[0]
      let bestGoalYes = 0
      for (const g of activeGoals) {
        const yesCount = Object.values(goalWeekMap[g.id] ?? {}).filter(v => v === 'yes').length
        if (yesCount > bestGoalYes) {
          bestGoalYes = yesCount
          bestGoal = g
        }
      }

      const reflectionByDate: Record<string, Reflection> = {}
      for (const r of reflections as Reflection[]) {
        reflectionByDate[r.date] = r
      }

      setWeekData({
        activeGoals,
        goalWeekMap,
        consistencyPct,
        totalYes,
        totalPossible,
        bestGoal,
        bestGoalYes,
        reflectionByDate,
        last7,
      })
      setLoading(false)
    }
    load()
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

  const {
    activeGoals,
    goalWeekMap,
    consistencyPct,
    totalYes,
    totalPossible,
    bestGoal,
    bestGoalYes,
    reflectionByDate,
    last7,
  } = weekData!

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 pt-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => navigate(-1)}
            className="text-[#6b6880] hover:text-[#c9a96e] transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
          <div className="text-right">
            <p className="text-[#f0ede8] font-semibold text-sm">Weekly Report</p>
          </div>
        </div>
        <p className="text-[#6b6880] text-xs mb-6 text-right">{formatDateRange(last7)}</p>

        {/* Section 1: Consistency Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-[#c9a96e] rounded-2xl p-6 mb-6 text-center"
        >
          <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-4">This Week</p>
          <p className="text-6xl font-bold text-[#c9a96e] mb-3">{consistencyPct}%</p>
          <p className="text-[#6b6880] text-sm mb-4 italic">
            {totalPossible > 0
              ? `You showed up ${totalYes} of ${totalPossible} possible times.`
              : 'Add goals to start tracking.'}
          </p>
          {/* Progress bar */}
          <div className="w-full bg-[#2a2a3e] rounded-full h-2 mb-4">
            <div
              className="bg-[#c9a96e] h-2 rounded-full transition-all duration-700"
              style={{ width: `${consistencyPct}%` }}
            />
          </div>
          <p className="text-[#f0ede8] text-sm">{getConsistencyMessage(consistencyPct)}</p>
        </motion.div>

        {/* Section 2: Goal-by-Goal Breakdown */}
        {activeGoals.length > 0 && (
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">Your Goals This Week</p>
            <div className="flex flex-col gap-3">
              {activeGoals.map((goal, idx) => {
                const dayMap = goalWeekMap[goal.id] ?? {}
                const yesCount = Object.values(dayMap).filter(v => v === 'yes').length
                const isGoldBadge = yesCount >= 5

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-[#c9a96e] flex-shrink-0" />
                        <p className="text-[#f0ede8] text-sm font-semibold truncate">{goal.title}</p>
                      </div>
                      <span className={`text-xs font-bold ml-2 flex-shrink-0 ${isGoldBadge ? 'text-[#c9a96e]' : 'text-[#6b6880]'}`}>
                        {yesCount}/7
                      </span>
                    </div>

                    {/* Day dots */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {last7.map((date, i) => {
                        const status = dayMap[date]
                        const dayIndex = new Date(date + 'T12:00:00').getDay()
                        // Convert Sunday=0 to Mon-first label index
                        const labelIdx = dayIndex === 0 ? 6 : dayIndex - 1

                        let dotClass = ''
                        let content: string | null = null

                        if (status === 'yes') {
                          dotClass = 'bg-green-500/20 border-green-500 text-green-400'
                          content = '✓'
                        } else if (status === 'notyet') {
                          dotClass = 'bg-red-500/20 border-red-500 text-red-400'
                          content = '✗'
                        } else if (status === 'skip') {
                          dotClass = 'border-[#2a2a3e] text-[#6b6880]'
                          content = '○'
                        } else {
                          dotClass = 'border-[#1a1a2e] text-[#2a2a3e]'
                          content = '·'
                        }

                        return (
                          <div key={date} className="flex flex-col items-center gap-1">
                            <span className="text-[#6b6880] text-[10px]">{DAY_LABELS[labelIdx]}</span>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${dotClass}`}>
                              {content}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {goal.why && (
                      <p className="text-[#6b6880] text-xs italic truncate mt-1">"{goal.why}"</p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 3: Mood Trend */}
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">Mood This Week</p>
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-1">
              {last7.map((date) => {
                const reflection = reflectionByDate[date]
                const dayIndex = new Date(date + 'T12:00:00').getDay()
                const labelIdx = dayIndex === 0 ? 6 : dayIndex - 1
                return (
                  <div key={date} className="flex flex-col items-center gap-2">
                    <span className="text-[#6b6880] text-xs font-medium">{DAY_LABELS[labelIdx]}</span>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={
                        reflection
                          ? { backgroundColor: moodColors[reflection.mood] + '33', border: `2px solid ${moodColors[reflection.mood]}` }
                          : { border: '2px solid #2a2a3e', backgroundColor: 'transparent' }
                      }
                    >
                      {reflection ? (
                        <span className="text-xl leading-none">{moodEmojis[reflection.mood]}</span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Best Goal Spotlight */}
        {bestGoal && bestGoalYes >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-[#c9a96e] bg-[#c9a96e]/5 rounded-2xl p-5 mb-6"
          >
            <p className="text-xs tracking-widest uppercase text-[#c9a96e] mb-3">⭐ Best This Week</p>
            <p className="text-[#f0ede8] font-semibold text-base mb-1">"{bestGoal.title}"</p>
            <p className="text-[#6b6880] text-sm mb-3">
              You showed up {bestGoalYes} day{bestGoalYes !== 1 ? 's' : ''} out of 7
            </p>
            <button
              onClick={() => navigate(`/goals/${bestGoal.id}`)}
              className="text-[#c9a96e] text-sm font-semibold"
            >
              Keep going →
            </button>
          </motion.div>
        )}

        {/* Section 5: Closing Line */}
        <div className="text-center py-6">
          <p className="text-[#6b6880] text-sm italic leading-relaxed">
            "Every day you showed up is a vote for<br />who you are becoming."
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
