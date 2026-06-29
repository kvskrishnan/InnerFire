import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Bell } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import StepLayout from './StepLayout'

const DEFAULT_PILLARS = [
  { id: 'health', name: 'Health', icon: '💪' },
  { id: 'mind', name: 'Mind', icon: '🧠' },
  { id: 'career', name: 'Career', icon: '🚀' },
  { id: 'wealth', name: 'Wealth', icon: '💰' },
  { id: 'relationships', name: 'Relationships', icon: '❤️' },
  { id: 'spirituality', name: 'Spirituality', icon: '🌿' },
  { id: 'growth', name: 'Personal Growth', icon: '🌱' },
  { id: 'contribution', name: 'Contribution', icon: '🤝' },
]

const goalSchema = z.object({
  title: z.string().min(3, 'Goal title is required'),
  pillarId: z.string().min(1, 'Please select a life pillar'),
  why: z.string().min(10, 'Your WHY must be at least 10 characters'),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalItem {
  id: string
  title: string
  pillarId: string
  why: string
  reminderEnabled: boolean
  reminderTime: string
}

interface Pillar {
  id: string
  name: string
  icon: string
}

interface GoalsStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function GoalsStep({ onNext, onBack, currentStep, totalSteps }: GoalsStepProps) {
  const { saveFormData, formData } = useOnboardingStore()
  // Use pillars selected in PillarsStep; fall back to full default list so
  // the dropdown is never empty regardless of navigation order
  const pillars: Pillar[] = ((formData.pillars as Pillar[]) ?? []).length > 0
    ? (formData.pillars as Pillar[])
    : DEFAULT_PILLARS
  const [goals, setGoals] = useState<GoalItem[]>((formData.goals as GoalItem[]) ?? [])
  const [showForm, setShowForm] = useState(goals.length === 0)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('07:00')
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  })

  const onAddGoal = (data: GoalFormData) => {
    setGoals(prev => [...prev, {
      id: crypto.randomUUID(),
      title: data.title,
      pillarId: data.pillarId,
      why: data.why,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : '',
    }])
    reset()
    setReminderEnabled(false)
    setReminderTime('07:00')
    setShowForm(false)
    setError('')
  }

  const remove = (id: string) => setGoals(prev => prev.filter(g => g.id !== id))

  const handleNext = () => {
    if (goals.length === 0) { setError('Add at least one goal to continue'); return }
    saveFormData('goals', goals)
    onNext()
  }

  const getPillarName = (id: string) => pillars.find(p => p.id === id)?.name ?? id

  const formatTime = (t: string) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return (
    <StepLayout
      title="Your First Goals"
      subtitle="A goal without a WHY is just a wish. Set your goal, your reason, and when you want to be reminded."
      onNext={handleNext}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        <p className="text-[#6b6880] text-xs">Start with 1–3 meaningful goals. You can add more later.</p>

        {/* Goal list */}
        {goals.map(goal => (
          <div key={goal.id} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[#f0ede8] text-sm font-medium">{goal.title}</p>
              <p className="text-[#c9a96e] text-xs mt-0.5">{getPillarName(goal.pillarId)}</p>
              <p className="text-[#6b6880] text-xs mt-1 italic line-clamp-2">"{goal.why}"</p>
              {goal.reminderEnabled && goal.reminderTime && (
                <div className="flex items-center gap-1 mt-2">
                  <Bell size={10} className="text-[#c9a96e]" />
                  <span className="text-[#c9a96e] text-[10px]">Daily at {formatTime(goal.reminderTime)}</span>
                </div>
              )}
            </div>
            <button onClick={() => remove(goal.id)} className="flex-shrink-0 mt-0.5">
              <X size={14} className="text-[#6b6880]" />
            </button>
          </div>
        ))}

        {error && <p className="text-red-400 text-xs">{error}</p>}

        {/* Add goal form */}
        {showForm ? (
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 space-y-3">

            {/* Goal title */}
            <div>
              <label className="text-[#6b6880] text-xs tracking-widest uppercase mb-1.5 block">Goal</label>
              <input
                {...register('title')}
                placeholder="e.g. Run a half marathon"
                className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] text-sm"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Pillar */}
            <div>
              <label className="text-[#6b6880] text-xs tracking-widest uppercase mb-1.5 block">Life Pillar</label>
              <select
                {...register('pillarId')}
                className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] text-sm"
              >
                <option value="">Select a pillar</option>
                {pillars.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
              {errors.pillarId && <p className="text-red-400 text-xs mt-1">{errors.pillarId.message}</p>}
            </div>

            {/* WHY */}
            <div>
              <label className="text-[#c9a96e] text-xs tracking-widest uppercase mb-1.5 block">Your WHY ✦</label>
              <textarea
                {...register('why')}
                rows={3}
                placeholder="Why does this matter to Future You? Be honest — this is the fuel."
                className="bg-[#0f0f1a] border border-[#c9a96e]/50 rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] resize-none text-sm leading-relaxed"
              />
              {errors.why && <p className="text-red-400 text-xs mt-1">{errors.why.message}</p>}
            </div>

            {/* Daily Reminder */}
            <div className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className={reminderEnabled ? 'text-[#c9a96e]' : 'text-[#6b6880]'} />
                  <div>
                    <p className="text-[#f0ede8] text-xs font-medium">Daily Reminder</p>
                    <p className="text-[#6b6880] text-[10px]">Get a push notification to take action</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(e => !e)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${reminderEnabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {reminderEnabled && (
                <div className="mt-3 pt-3 border-t border-[#2a2a3e]">
                  <label className="text-[#6b6880] text-[10px] tracking-widest uppercase mb-1.5 block">Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="bg-[#1a1a2e] border border-[#c9a96e]/40 rounded-xl px-3 py-2 text-[#f0ede8] text-sm focus:outline-none focus:border-[#c9a96e] w-full"
                  />
                  <p className="text-[#6b6880] text-[10px] mt-1.5">
                    You'll receive a motivational push at {formatTime(reminderTime)} every day.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmit(onAddGoal)}
                className="flex-1 py-3 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-xl text-sm"
              >
                Add Goal
              </button>
              {goals.length > 0 && (
                <button
                  onClick={() => { setShowForm(false); reset() }}
                  className="px-4 py-3 bg-[#0f0f1a] border border-[#2a2a3e] text-[#6b6880] rounded-xl text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border border-dashed border-[#2a2a3e] hover:border-[#c9a96e] rounded-xl text-[#6b6880] hover:text-[#c9a96e] text-sm transition-colors"
          >
            + Add another goal
          </button>
        )}
      </div>
    </StepLayout>
  )
}
