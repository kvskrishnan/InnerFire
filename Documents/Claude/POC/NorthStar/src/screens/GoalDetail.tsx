import { BottomNav } from '@/components/layout/BottomNav'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreVertical, X } from 'lucide-react'
import { goalRepository, pillarRepository, identityRepository } from '@/db/repositories'
import { GoalSchema } from '@/lib/validation/schemas'
import type { z } from 'zod'
type GoalFormData = z.infer<typeof GoalSchema>
import type { Goal, LifePillar, IdentityStatement } from '@/db/schema'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function GoalDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [goal, setGoal] = useState<Goal | null | undefined>(undefined)
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [identities, setIdentities] = useState<IdentityStatement[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingWhy, setEditingWhy] = useState(false)
  const [whyDraft, setWhyDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('07:00')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<GoalFormData>({ resolver: zodResolver(GoalSchema) as any })

  const load = async () => {
    const [g, p, i] = await Promise.all([
      goalRepository.getById(id!).catch(() => undefined),
      pillarRepository.getAll().catch(() => []),
      identityRepository.getAll().catch(() => []),
    ])
    setGoal(g ?? null)
    setPillars(p)
    setIdentities(i)
    if (g) {
      setWhyDraft(g.why)
      setReminderEnabled(g.reminderEnabled ?? false)
      setReminderTime(g.reminderTime ?? '07:00')
      reset({
        title: g.title,
        pillarId: g.pillarId,
        why: g.why,
        identityStatementId: g.identityStatementId ?? '',
        targetDate: g.targetDate ?? '',
        status: g.status,
      })
    }
  }

  useEffect(() => { load() }, [id])

  const pillar = goal ? pillars.find(p => p.id === goal.pillarId) : undefined
  const identity = goal?.identityStatementId
    ? identities.find(i => i.id === goal.identityStatementId)
    : undefined

  const handleMarkComplete = async () => {
    if (!goal) return
    setSaving(true)
    await goalRepository.update(goal.id, { status: 'completed' })
    await load()
    setSaving(false)
  }

  const handleArchive = async () => {
    if (!goal) return
    await goalRepository.archive(goal.id)
    navigate('/goals')
  }

  const handleSaveWhy = async () => {
    if (!goal) return
    setSaving(true)
    await goalRepository.update(goal.id, { why: whyDraft })
    setEditingWhy(false)
    await load()
    setSaving(false)
  }

  const onEditSubmit: SubmitHandler<GoalFormData> = async (data) => {
    if (!goal) return
    setSaving(true)
    await goalRepository.update(goal.id, {
      ...data,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
    })
    setShowEdit(false)
    await load()
    setSaving(false)
  }

  const inputCls = 'bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors'
  const selectCls = 'bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors'

  if (goal === undefined) return <LoadingScreen />

  if (goal === null) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center p-6">
        <p className="text-[#6b6880] mb-4">Goal not found.</p>
        <GhostButton onClick={() => navigate('/goals')}>Back to Goals</GhostButton>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/goals')} className="p-2 -ml-2 text-[#6b6880] hover:text-[#f0ede8]">
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-2 text-[#6b6880] hover:text-[#f0ede8]"
            >
              <MoreVertical size={20} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="absolute right-0 top-10 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl z-50 overflow-hidden min-w-[160px]"
                >
                  <button
                    onClick={() => { setShowEdit(true); setShowMenu(false) }}
                    className="block w-full text-left px-4 py-3 text-sm text-[#f0ede8] hover:bg-[#2a2a3e] transition-colors"
                  >
                    Edit Goal
                  </button>
                  <button
                    onClick={() => { handleArchive(); setShowMenu(false) }}
                    className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[#2a2a3e] transition-colors"
                  >
                    Archive Goal
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pillar color bar */}
        {pillar && (
          <div
            className="w-full h-1 rounded-full mb-5"
            style={{ backgroundColor: pillar.color }}
          />
        )}

        {/* Goal Hero */}
        <h1 className="text-2xl font-bold text-[#f0ede8] mb-3 leading-tight">{goal.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {pillar && (
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: `${pillar.color}20`, color: pillar.color }}
            >
              {pillar.name}
            </span>
          )}
          <span className={`text-xs px-3 py-1 rounded-full ${
            goal.status === 'completed'
              ? 'text-[#c9a96e] bg-[#c9a96e]/10'
              : goal.status === 'paused'
              ? 'text-[#6b6880] bg-[#6b6880]/10'
              : 'text-[#10b981] bg-[#10b981]/10'
          }`}>
            {goal.status}
          </span>
        </div>

        {goal.targetDate && (
          <p className="text-[#6b6880] text-sm mb-6">
            Target: {new Date(goal.targetDate).toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {/* WHY section */}
        <div className="mb-6">
          <p className="text-xs tracking-widest uppercase text-[#c9a96e] mb-3">Your Why</p>
          <AnimatePresence mode="wait">
            {editingWhy ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <textarea
                  value={whyDraft}
                  onChange={e => setWhyDraft(e.target.value)}
                  rows={4}
                  className={`${inputCls} border-l-4 border-l-[#c9a96e] resize-none`}
                />
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <GoldButton onClick={handleSaveWhy} loading={saving} fullWidth>Save WHY</GoldButton>
                  </div>
                  <div className="flex-1">
                    <GhostButton onClick={() => { setEditingWhy(false); setWhyDraft(goal.why) }} fullWidth>Cancel</GhostButton>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingWhy(true)}
                className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] p-5 rounded-r-2xl cursor-pointer hover:bg-[#1f1f38] transition-colors"
              >
                <p className="text-[#f0ede8] text-lg italic leading-relaxed">{goal.why}</p>
                <p className="text-[#6b6880] text-xs mt-3">Tap to edit your WHY</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Identity */}
        {identity && (
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-2">You Are</p>
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3">
              <p className="text-[#f0ede8] text-sm italic">"{identity.text}"</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          {goal.status === 'active' && (
            <GoldButton onClick={handleMarkComplete} loading={saving} fullWidth>
              Mark Complete
            </GoldButton>
          )}
          <GhostButton onClick={() => setShowEdit(true)} fullWidth>Edit Goal</GhostButton>
        </div>

        {/* Edit Form */}
        <AnimatePresence>
          {showEdit && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#c9a96e] text-sm tracking-widest uppercase">Edit Goal</h2>
                <button onClick={() => setShowEdit(false)} className="text-[#6b6880] hover:text-[#f0ede8]">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                <div>
                  <input {...register('title')} placeholder="Goal title" className={inputCls} />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <select {...register('pillarId')} className={selectCls}>
                    {pillars.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#c9a96e] tracking-widest uppercase mb-2 block">WHY</label>
                  <textarea
                    {...register('why')}
                    rows={3}
                    className={`${inputCls} border-l-4 border-l-[#c9a96e] resize-none`}
                  />
                  {errors.why && <p className="text-red-400 text-xs mt-1">{errors.why.message}</p>}
                </div>
                <div>
                  <select {...register('status')} className={selectCls}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
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
                    <GoldButton type="submit" loading={saving} fullWidth>Save Changes</GoldButton>
                  </div>
                  <div className="flex-1">
                    <GhostButton onClick={() => setShowEdit(false)} fullWidth>Cancel</GhostButton>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivation reminder */}
        <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] p-5 rounded-r-2xl">
          <p className="text-[#6b6880] text-sm italic leading-relaxed">
            Remember why you started.<br />
            Future You is built by this decision — right now.
          </p>
        </div>

      </div>
      <BottomNav />
    </div>
  )
}
