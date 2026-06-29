import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import { goalRepository, pillarRepository, identityRepository } from '@/db/repositories'
import { GoalSchema } from '@/lib/validation/schemas'
import type { z } from 'zod'
type GoalFormData = z.infer<typeof GoalSchema>
import type { Goal, LifePillar, IdentityStatement } from '@/db/schema'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import LoadingScreen from '@/components/ui/LoadingScreen'
import EmptyState from '@/components/ui/EmptyState'
import { BottomNav } from '@/components/layout/BottomNav'

export default function Goals() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPillar = searchParams.get('pillar') ?? 'all'

  const [goals, setGoals] = useState<Goal[]>([])
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [identities, setIdentities] = useState<IdentityStatement[]>([])
  const [loading, setLoading] = useState(true)
  const [activePillar, setActivePillar] = useState(initialPillar)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('07:00')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<GoalFormData>({
    resolver: zodResolver(GoalSchema) as any,
    defaultValues: { status: 'active' },
  })

  const load = async () => {
    const [g, p, i] = await Promise.all([
      goalRepository.getAll().catch(() => []),
      pillarRepository.getAll().catch(() => []),
      identityRepository.getAll().catch(() => []),
    ])
    setGoals(g)
    setPillars(p)
    setIdentities(i)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onSubmit: SubmitHandler<GoalFormData> = async (data) => {
    setSaving(true)
    await goalRepository.save({
      ...data,
      sortOrder: goals.length,
      status: data.status ?? 'active',
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    })
    reset()
    setReminderEnabled(false)
    setReminderTime('07:00')
    setShowForm(false)
    await load()
    setSaving(false)
  }

  const filtered = activePillar === 'all'
    ? goals
    : goals.filter(g => g.pillarId === activePillar)

  const getPillar = (id: string) => pillars.find(p => p.id === id)

  if (loading) return <LoadingScreen />

  const inputCls = 'bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors'
  const selectCls = 'bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors'

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#6b6880] hover:text-[#f0ede8]">
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1 text-[#c9a96e] text-sm font-medium"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        <h1 className="text-2xl font-bold text-[#f0ede8] mb-1">Your Goals</h1>
        <p className="text-[#6b6880] text-sm mb-5">Every goal must have a WHY.</p>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          <button
            onClick={() => setActivePillar('all')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activePillar === 'all'
                ? 'bg-[#c9a96e] text-[#0f0f1a]'
                : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6880]'
            }`}
          >
            All
          </button>
          {pillars.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activePillar === p.id
                  ? 'bg-[#c9a96e] text-[#0f0f1a]'
                  : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6880]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Add Goal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-5"
            >
              <h2 className="text-[#c9a96e] text-sm tracking-widest uppercase mb-4">New Goal</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <input
                    {...register('title')}
                    placeholder="Goal title"
                    className={inputCls}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <select {...register('pillarId')} className={selectCls}>
                    <option value="">Select a life pillar…</option>
                    {pillars.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.pillarId && <p className="text-red-400 text-xs mt-1">{errors.pillarId.message}</p>}
                </div>

                <div>
                  <label className="text-xs text-[#c9a96e] tracking-widest uppercase mb-2 block">
                    WHY does this matter to Future You?
                  </label>
                  <textarea
                    {...register('why')}
                    rows={3}
                    placeholder="Because…"
                    className={`${inputCls} border-l-4 border-l-[#c9a96e] resize-none`}
                  />
                  {errors.why && <p className="text-red-400 text-xs mt-1">{errors.why.message}</p>}
                </div>

                {identities.length > 0 && (
                  <div>
                    <select {...register('identityStatementId')} className={selectCls}>
                      <option value="">Link an identity statement (optional)</option>
                      {identities.map(i => (
                        <option key={i.id} value={i.id}>{i.text}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <input
                    {...register('targetDate')}
                    type="date"
                    className={inputCls}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Daily Reminder */}
                <div className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[#f0ede8] text-sm font-semibold">Daily Reminder</p>
                      <p className="text-[#6b6880] text-xs mt-0.5">Get a spirit notification to take action</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReminderEnabled(e => !e)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${reminderEnabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${reminderEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {reminderEnabled && (
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={e => setReminderTime(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-[#c9a96e]/40 rounded-xl px-4 py-3 text-[#f0ede8] text-sm focus:outline-none focus:border-[#c9a96e]"
                    />
                  )}
                  {reminderEnabled && reminderTime && (
                    <p className="text-[#6b6880] text-xs mt-2">
                      You'll receive a motivational nudge at {reminderTime} every day.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <div className="flex-1">
                    <GoldButton type="submit" loading={saving} fullWidth>Save Goal</GoldButton>
                  </div>
                  <div className="flex-1">
                    <GhostButton onClick={() => { setShowForm(false); reset() }} fullWidth>Cancel</GhostButton>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        {filtered.length === 0 ? (
          <EmptyState
            message="No goals yet. Every great journey starts with a clear destination."
            actionLabel="Add Your First Goal"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <motion.div>
            {filtered.map((goal, idx) => {
              const pillar = getPillar(goal.pillarId)
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3 cursor-pointer hover:border-[#c9a96e]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {pillar && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: pillar.color }}
                        />
                      )}
                      <span className="text-[#f0ede8] font-semibold truncate">{goal.title}</span>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      goal.status === 'completed'
                        ? 'text-[#c9a96e] bg-[#c9a96e]/10'
                        : goal.status === 'paused'
                        ? 'text-[#6b6880] bg-[#6b6880]/10'
                        : 'text-[#10b981] bg-[#10b981]/10'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  {goal.why && (
                    <p className="text-[#6b6880] text-sm italic line-clamp-2 mt-1 ml-4">{goal.why}</p>
                  )}
                  {goal.targetDate && (
                    <p className="text-[#6b6880] text-xs mt-2 ml-4">
                      Target: {new Date(goal.targetDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
