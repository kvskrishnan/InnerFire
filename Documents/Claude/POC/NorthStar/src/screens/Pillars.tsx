import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { pillarRepository, goalRepository } from '@/db/repositories'
import type { LifePillar, Goal } from '@/db/schema'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { BottomNav } from '@/components/layout/BottomNav'

const COLOR_PRESETS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1',
]

export default function Pillars() {
  const navigate = useNavigate()
  const [pillars, setPillars] = useState<LifePillar[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PRESETS[3])
  const [nameError, setNameError] = useState('')

  const load = async () => {
    const [p, g] = await Promise.all([pillarRepository.getAll().catch(() => []), goalRepository.getAll().catch(() => [])])
    setPillars(p)
    setGoals(g)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const goalCount = (pillarId: string) =>
    goals.filter(g => g.pillarId === pillarId).length

  const handleAddPillar = async () => {
    if (!newName.trim()) { setNameError('Please enter a pillar name.'); return }
    setNameError('')
    await pillarRepository.save({
      name: newName.trim(),
      color: newColor,
      sortOrder: pillars.length,
      isDefault: false,
    })
    setNewName('')
    setNewColor(COLOR_PRESETS[3])
    setAddOpen(false)
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
            <h1 className="text-xl font-semibold text-[#f0ede8]">Life Pillars</h1>
            <p className="text-xs text-[#6b6880] mt-0.5">The domains of your life. Your goals live within these pillars.</p>
          </div>
        </div>

        {/* Pillar cards */}
        {pillars.map((pillar, i) => {
          const count = goalCount(pillar.id)
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/goals?pillar=${pillar.id}`)}
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3 flex items-center gap-3 cursor-pointer hover:border-[#3a3a5e] transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: pillar.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#f0ede8] text-base font-semibold">{pillar.name}</p>
              </div>
              <span className="bg-[#0f0f1a] text-[#c9a96e] text-xs px-2 py-1 rounded-full whitespace-nowrap">
                {count > 0 ? `${count} goal${count !== 1 ? 's' : ''}` : 'No goals'}
              </span>
              <ChevronRight size={16} className="text-[#6b6880] shrink-0" />
            </motion.div>
          )
        })}

        {/* Add pillar section */}
        <div className="mt-4 mb-6">
          {!addOpen ? (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 text-[#6b6880] hover:text-[#c9a96e] transition-colors text-sm"
            >
              <Plus size={16} />
              Add a pillar
            </button>
          ) : (
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
              <label className="text-xs tracking-widest uppercase text-[#6b6880] mb-2 block">Pillar Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setNameError('') }}
                placeholder="e.g. Adventure"
                className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors text-sm mb-3"
              />
              {nameError && <p className="text-red-400 text-xs mb-2">{nameError}</p>}

              <label className="text-xs tracking-widest uppercase text-[#6b6880] mb-2 block">Colour</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === color ? 'border-[#c9a96e] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddPillar}
                  className="px-4 py-2 bg-[#c9a96e] text-[#0f0f1a] rounded-xl font-semibold text-sm hover:bg-[#b8935a] transition-colors"
                >
                  Add Pillar
                </button>
                <button
                  onClick={() => { setAddOpen(false); setNewName(''); setNameError('') }}
                  className="px-4 py-2 border border-[#2a2a3e] text-[#6b6880] rounded-xl text-sm hover:text-[#f0ede8] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Life balance note */}
        <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] p-4 rounded-r-xl text-[#6b6880] text-sm italic mb-6">
          True balance is not equal time in each pillar — it is intentional attention to each.
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
