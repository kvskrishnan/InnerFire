import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus } from 'lucide-react'
import { journalRepository, pillarRepository } from '@/db/repositories'
import type { JournalEntry, LifePillar } from '@/db/schema'
import { BottomNav } from '@/components/layout/BottomNav'
import EmptyState from '@/components/ui/EmptyState'
import LoadingScreen from '@/components/ui/LoadingScreen'

const MOOD_MAP: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄',
}

const MOOD_VALUES = [1, 2, 3, 4, 5] as const

export default function Journal() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<number | null>(null)
  const [pillarFilter, setPillarFilter] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadAll = useCallback(async () => {
    const [all, allPillars] = await Promise.all([
      journalRepository.getAll().catch(() => []),
      pillarRepository.getAll().catch(() => []),
    ])
    setEntries(all)
    setPillars(allPillars)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (value.trim()) {
        const results = await journalRepository.search(value.trim())
        setEntries(results)
      } else {
        const all = await journalRepository.getAll()
        setEntries(all)
      }
      setMoodFilter(null)
      setPillarFilter(null)
    }, 300)
  }

  const clearSearch = async () => {
    setQuery('')
    const all = await journalRepository.getAll()
    setEntries(all)
  }

  const filtered = entries.filter((e) => {
    if (moodFilter !== null && e.mood !== moodFilter) return false
    if (pillarFilter !== null && e.pillarId !== pillarFilter) return false
    return true
  })

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto pt-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#f0ede8]">Journal</h1>
            <p className="text-[#6b6880] text-sm mt-0.5">Private. Local. Yours.</p>
          </div>
          <button
            onClick={() => navigate('/journal/new')}
            className="flex items-center gap-1 text-[#c9a96e] text-sm font-medium mt-1"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6880]" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search entries..."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] pl-9 pr-9 py-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6880]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button
            onClick={() => { setMoodFilter(null); setPillarFilter(null) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
              moodFilter === null && pillarFilter === null
                ? 'border-[#c9a96e] text-[#c9a96e]'
                : 'border-[#2a2a3e] text-[#6b6880]'
            }`}
          >
            All
          </button>
          {MOOD_VALUES.map((m) => (
            <button
              key={m}
              onClick={() => { setMoodFilter(moodFilter === m ? null : m); setPillarFilter(null) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                moodFilter === m
                  ? 'border-[#c9a96e] bg-[#c9a96e]/10'
                  : 'border-[#2a2a3e]'
              }`}
            >
              {MOOD_MAP[m]}
            </button>
          ))}
          {pillars.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPillarFilter(pillarFilter === p.id ? null : p.id); setMoodFilter(null) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                pillarFilter === p.id
                  ? 'border-[#c9a96e] text-[#c9a96e]'
                  : 'border-[#2a2a3e] text-[#6b6880]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Entry list */}
        {filtered.length === 0 ? (
          <EmptyState
            message="Your journal is empty. Write your first entry — Future You will thank you."
            actionLabel="Write First Entry"
            onAction={() => navigate('/journal/new')}
          />
        ) : (
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => navigate(`/journal/${entry.id}`)}
                className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#6b6880] text-xs">
                    {new Date(entry.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                  {entry.mood && (
                    <span className="text-base">{MOOD_MAP[entry.mood]}</span>
                  )}
                </div>
                <p className="text-[#f0ede8] text-sm line-clamp-3 mt-1">{entry.text}</p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[#6b6880] text-xs border border-[#2a2a3e] rounded-full px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
