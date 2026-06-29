import { BottomNav } from '@/components/layout/BottomNav'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { journalRepository, pillarRepository } from '@/db/repositories'
import type { JournalEntry, LifePillar } from '@/db/schema'
import GoldButton from '@/components/ui/GoldButton'
import LoadingScreen from '@/components/ui/LoadingScreen'
import MoodPicker from '@/components/ui/MoodPicker'

const today = () => new Date().toISOString().split('T')[0]

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [pillars, setPillars] = useState<LifePillar[]>([])

  // form state
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTags, setShowTags] = useState(false)
  const [showPillar, setShowPillar] = useState(false)
  const [pillarId, setPillarId] = useState<string>('')
  const [error, setError] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const load = async () => {
      const allPillars = await pillarRepository.getAll()
      setPillars(allPillars)

      if (!isNew && id) {
        const existing = await journalRepository.getById(id)
        if (existing) {
          setEntry(existing)
          setMood(existing.mood)
          setText(existing.text)
          setTags(existing.tags ?? [])
          setPillarId(existing.pillarId ?? '')
          if (existing.tags && existing.tags.length > 0) setShowTags(true)
          if (existing.pillarId) setShowPillar(true)
        }
      }
      setLoading(false)
    }
    load()
  }, [id, isNew])

  const autoGrow = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    if (!text.trim()) {
      setError('Write something first.')
      return
    }
    setError('')
    setSaving(true)
    try {
      if (isNew) {
        await journalRepository.save({
          date: today(),
          text: text.trim(),
          mood,
          tags: tags.length > 0 ? tags : undefined,
          pillarId: pillarId || undefined,
        })
      } else if (id) {
        await journalRepository.update(id, {
          text: text.trim(),
          mood,
          tags: tags.length > 0 ? tags : undefined,
          pillarId: pillarId || undefined,
        })
      }
      navigate('/journal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || isNew) return
    const confirmed = window.confirm('Delete this entry? This cannot be undone.')
    if (!confirmed) return
    await journalRepository.delete(id)
    navigate('/journal')
  }

  if (loading) return <LoadingScreen />

  const displayDate = isNew
    ? new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : entry
    ? new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-32 max-w-lg mx-auto pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/journal')}
            className="text-[#6b6880] flex items-center gap-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg font-semibold text-[#f0ede8]">
              {isNew ? 'New Entry' : 'Edit Entry'}
            </h1>
            <p className="text-[#6b6880] text-xs mt-0.5">{displayDate}</p>
          </div>
          {!isNew ? (
            <button onClick={handleDelete} className="text-[#6b6880] active:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-6"
        >
          {/* Mood */}
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
            <MoodPicker value={mood} onChange={(m) => setMood(m)} />
          </div>

          {/* Text */}
          <div>
            <textarea
              ref={textareaRef}
              rows={10}
              value={text}
              onChange={(e) => { setText(e.target.value); autoGrow() }}
              onInput={autoGrow}
              placeholder="What's on your mind? What happened today? How are you feeling?"
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors resize-none"
            />
            {error && (
              <p className="text-red-400 text-xs mt-1">{error}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            {!showTags ? (
              <button
                onClick={() => setShowTags(true)}
                className="text-[#c9a96e] text-sm"
              >
                ＋ Add tags
              </button>
            ) : (
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">Tags</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs border border-[#2a2a3e] rounded-full px-2 py-0.5 text-[#f0ede8]"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-[#6b6880] ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {tags.length < 10 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag() }
                    }}
                    placeholder="Type a tag and press Enter"
                    className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-2 w-full text-sm focus:outline-none focus:border-[#c9a96e] transition-colors"
                  />
                )}
              </div>
            )}
          </div>

          {/* Pillar link */}
          <div>
            {!showPillar ? (
              <button
                onClick={() => setShowPillar(true)}
                className="text-[#c9a96e] text-sm"
              >
                ＋ Link to a pillar
              </button>
            ) : (
              <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
                <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">Life Pillar</p>
                <select
                  value={pillarId}
                  onChange={(e) => setPillarId(e.target.value)}
                  className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors"
                >
                  <option value="">None</option>
                  {pillars.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Privacy note (new only) */}
          {isNew && (
            <p className="text-[#6b6880] text-xs text-center">
              🔒 This entry stays on your device. Never uploaded.
            </p>
          )}
        </motion.div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-[#2a2a3e] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <GoldButton onClick={handleSave} loading={saving} fullWidth>
            Save Entry
          </GoldButton>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
