import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Mail, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { letterRepository } from '@/db/repositories'
import { FutureLetterSchema, type FutureLetterFormData } from '@/lib/validation/schemas'
import type { FutureLetter } from '@/db/schema'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { BottomNav } from '@/components/layout/BottomNav'

function addMonths(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

function formatDelivery(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isUnlocked(letter: FutureLetter): boolean {
  if (letter.unlockedAt) return true
  return new Date(letter.deliveryDate) <= new Date()
}

export default function Letters() {
  const navigate = useNavigate()
  const [letters, setLetters] = useState<FutureLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FutureLetterFormData>({
    resolver: zodResolver(FutureLetterSchema),
  })

  const load = async () => {
    const data = await letterRepository.getAll()
    setLetters(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (data: FutureLetterFormData) => {
    await letterRepository.save(data)
    reset()
    setShowForm(false)
    await load()
  }

  const handleUnlockEarly = async (id: string) => {
    if (window.confirm('Unlock this letter early? This cannot be undone.')) {
      await letterRepository.unlock(id)
      await load()
    }
  }

  const handleDelete = async (id: string) => {
    await letterRepository.delete(id)
    setExpandedId(null)
    await load()
  }

  const watchDeliveryDate = watch('deliveryDate')

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-6 pb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6b6880] mb-4">
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-[#f0ede8]">Future Letters</h1>
          <p className="text-[#6b6880] text-sm mt-1">Write to the person you are becoming.</p>
        </div>

        {/* Write button */}
        <div className="mb-4">
        <GoldButton onClick={() => setShowForm(v => !v)} fullWidth>
          {showForm ? 'Cancel' : '+ Write a Letter'}
        </GoldButton>
        </div>

        {/* Compose form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-5">
                {/* Title */}
                <div className="mb-3">
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="To me in 6 months"
                    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors"
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                {/* Body */}
                <div className="mb-3 border-l-4 border-[#c9a96e] pl-4">
                  <textarea
                    {...register('body')}
                    rows={8}
                    placeholder={'Dear future me,\n\nI am writing this on...'}
                    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors resize-none"
                  />
                  {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body.message}</p>}
                </div>

                {/* Delivery date */}
                <div className="mb-3">
                  <label className="text-[#6b6880] text-xs uppercase tracking-widest mb-2 block">Deliver on</label>
                  <input
                    {...register('deliveryDate')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors"
                  />
                  {errors.deliveryDate && <p className="text-red-400 text-xs mt-1">{errors.deliveryDate.message}</p>}

                  {/* Quick presets */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[
                      { label: '1 month', months: 1 },
                      { label: '3 months', months: 3 },
                      { label: '6 months', months: 6 },
                      { label: '1 year', months: 12 },
                    ].map(({ label, months }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setValue('deliveryDate', addMonths(months), { shouldValidate: true })}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          watchDeliveryDate === addMonths(months)
                            ? 'bg-[#c9a96e] text-[#0f0f1a] border-[#c9a96e] font-semibold'
                            : 'border-[#2a2a3e] text-[#6b6880] hover:border-[#c9a96e]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <GoldButton type="submit" disabled={isSubmitting} fullWidth>
                      Seal &amp; Send
                    </GoldButton>
                  </div>
                  <div className="flex-1">
                    <GhostButton onClick={() => { reset(); setShowForm(false) }} fullWidth>
                      Cancel
                    </GhostButton>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letters list */}
        {letters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6b6880] text-sm">No letters yet. Write your first letter to Future You.</p>
          </div>
        ) : (
          <AnimatePresence>
            {letters.map(letter => {
              const unlocked = isUnlocked(letter)
              const isExpanded = expandedId === letter.id

              return (
                <motion.div
                  key={letter.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-[#1a1a2e] border rounded-2xl p-4 mb-3 ${
                    unlocked ? 'border-[#c9a96e]' : 'border-[#2a2a3e]'
                  }`}
                >
                  {unlocked ? (
                    /* Unlocked state */
                    <div>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : letter.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-[#c9a96e]" />
                          <span className="text-[#f0ede8] font-semibold">{letter.title}</span>
                        </div>
                        <span className="bg-[#c9a96e] text-[#0f0f1a] text-xs font-bold px-2 py-0.5 rounded-full">
                          OPEN
                        </span>
                      </div>
                      <p className="text-[#6b6880] text-xs mt-1">
                        From {new Date(letter.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 border-t border-[#2a2a3e] pt-4">
                              <p className="text-[#f0ede8] text-base leading-relaxed whitespace-pre-wrap">
                                {letter.body}
                              </p>
                              <button
                                onClick={() => handleDelete(letter.id)}
                                className="flex items-center gap-1.5 text-[#6b6880] hover:text-red-400 text-sm mt-4 transition-colors"
                              >
                                <Trash2 size={14} />
                                Delete letter
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Locked state */
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lock size={16} className="text-[#6b6880]" />
                        <span className="text-[#f0ede8] font-semibold">{letter.title}</span>
                      </div>
                      <p className="text-[#6b6880] text-sm">
                        Sealed until {formatDelivery(letter.deliveryDate)}
                      </p>
                      <button
                        onClick={() => handleUnlockEarly(letter.id)}
                        className="text-[#6b6880] hover:text-[#c9a96e] text-xs mt-2 transition-colors underline"
                      >
                        Unlock early
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}

        {/* Philosophy note */}
        <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] rounded-r-2xl p-4 mt-4 mb-2">
          <p className="text-[#6b6880] text-sm leading-relaxed">
            The person reading this letter will have been shaped by every decision you make today.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
