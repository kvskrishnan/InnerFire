import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { motivationRepository } from '@/db/repositories'
import type { MotivationAsset } from '@/db/schema'
import GoldButton from '@/components/ui/GoldButton'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { BottomNav } from '@/components/layout/BottomNav'

type FilterTab = 'all' | 'quotes' | 'favorites'

const SUGGESTED_QUOTES = [
  'We are what we repeatedly do. Excellence is not an act, but a habit. — Aristotle',
  'The man who moves a mountain begins by carrying away small stones. — Confucius',
  'Your life does not get better by chance. It gets better by change. — Jim Rohn',
]

export default function Vault() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<MotivationAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [quoteText, setQuoteText] = useState('')
  const [author, setAuthor] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const data = await motivationRepository.getAll()
    setAssets(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filteredAssets = assets.filter(a => {
    if (filter === 'quotes') return a.type === 'quote'
    if (filter === 'favorites') return a.isFavorite
    return true
  })

  const favorites = assets.filter(a => a.isFavorite)
  const nonFavorites = filteredAssets.filter(a => !a.isFavorite)

  const handleAddQuote = async () => {
    if (!quoteText.trim()) return
    setSaving(true)
    const text = quoteText.trim() + (author.trim() ? ` — ${author.trim()}` : '')
    await motivationRepository.save({ type: 'quote', text, category: 'quote', isFavorite })
    setQuoteText('')
    setAuthor('')
    setIsFavorite(false)
    await load()
    setSaving(false)
  }

  const handleAddSuggested = async (quote: string) => {
    await motivationRepository.save({ type: 'quote', text: quote, category: 'quote', isFavorite: false })
    await load()
  }

  const handleToggleFavorite = async (id: string) => {
    await motivationRepository.toggleFavorite(id)
    await load()
  }

  const handleDelete = async (id: string) => {
    await motivationRepository.delete(id)
    await load()
  }

  if (loading) return <LoadingScreen />

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'favorites', label: 'Favorites' },
  ]

  const AssetCard = ({ asset }: { asset: MotivationAsset }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-3"
    >
      <p className="text-[#f0ede8] text-base italic leading-relaxed mb-3">&ldquo;{asset.text}&rdquo;</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => handleToggleFavorite(asset.id)}
          className="transition-colors"
          aria-label="Toggle favorite"
        >
          <Star
            size={18}
            className={asset.isFavorite ? 'text-[#c9a96e] fill-[#c9a96e]' : 'text-[#6b6880]'}
          />
        </button>
        <button
          onClick={() => handleDelete(asset.id)}
          className="text-[#6b6880] hover:text-red-400 transition-colors"
          aria-label="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="pt-6 pb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#6b6880] mb-4">
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-[#f0ede8]">Motivation Vault</h1>
          <p className="text-[#6b6880] text-sm mt-1">What moves you. What drives you. What reminds you why.</p>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-[#c9a96e] text-[#0f0f1a] font-semibold'
                  : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6880]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add quote section */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-5">
          <textarea
            rows={2}
            value={quoteText}
            onChange={e => setQuoteText(e.target.value)}
            placeholder="Enter a quote that moves you..."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors resize-none mb-2"
          />
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="— Aristotle"
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] transition-colors mb-3"
          />
          <label className="flex items-center gap-2 text-sm text-[#6b6880] mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFavorite}
              onChange={e => setIsFavorite(e.target.checked)}
              className="accent-[#c9a96e]"
            />
            <Star size={14} className="text-[#c9a96e]" />
            Mark as favorite
          </label>
          <GoldButton onClick={handleAddQuote} disabled={saving || !quoteText.trim()} fullWidth>
            Add Quote
          </GoldButton>
        </div>

        {/* Asset list */}
        {assets.length === 0 ? (
          <div>
            <p className="text-[#6b6880] text-sm text-center mb-4">No quotes yet. Try one of these to get started:</p>
            {SUGGESTED_QUOTES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggested(q)}
                className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3 w-full text-left hover:border-[#c9a96e] transition-colors"
              >
                <p className="text-[#f0ede8] text-sm italic leading-relaxed">&ldquo;{q}&rdquo;</p>
                <p className="text-[#c9a96e] text-xs mt-2">Tap to add</p>
              </button>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {/* Favorites section */}
            {filter !== 'favorites' && favorites.length > 0 && (
              <div>
                <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">Your Favourites</p>
                {favorites.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}

            {/* Non-favorites (or all when filter is favorites) */}
            {filter === 'favorites'
              ? filteredAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)
              : nonFavorites.map(asset => <AssetCard key={asset.id} asset={asset} />)
            }
          </AnimatePresence>
        )}

        {/* Philosophy note */}
        <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] rounded-r-2xl p-4 mt-4 mb-2">
          <p className="text-[#6b6880] text-sm leading-relaxed">
            On your hardest days, this vault will remind you who you are and why you started.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
