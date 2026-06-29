import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { identityRepository } from '@/db/repositories'
import type { IdentityStatement } from '@/db/schema'
import LoadingScreen from '@/components/ui/LoadingScreen'
import EmptyState from '@/components/ui/EmptyState'
import { BottomNav } from '@/components/layout/BottomNav'

const EXAMPLES = [
  'I am a disciplined and healthy athlete.',
  'I am a present and loving father/mother.',
  'I am a lifelong learner.',
]

export default function Identity() {
  const navigate = useNavigate()
  const [statements, setStatements] = useState<IdentityStatement[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    const data = await identityRepository.getAll()
    setStatements(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (text: string) => {
    const trimmed = text.trim()
    if (trimmed.length < 5) { setError('Statement must be at least 5 characters.'); return }
    if (trimmed.length > 200) { setError('Statement must be 200 characters or fewer.'); return }
    setError('')
    await identityRepository.save(trimmed)
    setInputText('')
    await load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this identity statement?')) return
    await identityRepository.archive(id)
    await load()
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] pb-24">
      <div className="px-4 max-w-lg mx-auto pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-[#6b6880] hover:text-[#f0ede8] transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#f0ede8]">Identity Builder</h1>
            <p className="text-xs text-[#6b6880] mt-0.5">Define the person you are becoming — not who you were.</p>
          </div>
        </div>

        {/* Add section */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-6">
          <label className="text-xs tracking-widest uppercase text-[#6b6880] mb-2 block">New Statement</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => { setInputText(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd(inputText)}
              placeholder="I am a disciplined and healthy athlete."
              className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 flex-1 focus:outline-none focus:border-[#c9a96e] transition-colors text-sm"
            />
            <button
              onClick={() => handleAdd(inputText)}
              className="px-4 py-2 bg-[#c9a96e] text-[#0f0f1a] rounded-xl font-semibold text-sm whitespace-nowrap hover:bg-[#b8935a] transition-colors"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Example chips — shown when list is empty */}
        {statements.length === 0 && (
          <div className="mb-6">
            <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => handleAdd(ex)}
                  className="border border-[#2a2a3e] text-[#6b6880] text-sm px-3 py-2 rounded-full cursor-pointer hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Statement list */}
        {statements.length === 0 ? (
          <EmptyState message="Add your first identity statement above." />
        ) : (
          <AnimatePresence>
            {statements.map((stmt, i) => (
              <motion.div
                key={stmt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0ede8] text-base font-medium">{stmt.text}</p>
                  <p className="text-[#6b6880] text-xs mt-1">Drag to reorder</p>
                </div>
                <button
                  onClick={() => handleDelete(stmt.id)}
                  className="text-[#6b6880] hover:text-red-400 transition-colors mt-0.5 shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Philosophy reminder */}
        <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] p-4 rounded-r-xl text-[#6b6880] text-sm italic mt-4 mb-6">
          Identity drives behaviour. These statements shape how you show up every day.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
