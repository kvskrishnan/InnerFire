import { BottomNav } from '@/components/layout/BottomNav'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import VisionCard from '@/components/vision/VisionCard'
import { useVisionData } from '@/hooks/useVisionData'

export default function Vision() {
  const navigate = useNavigate()
  const { profile, identityStatements, goals, quote, morningStreak, loading } = useVisionData()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <span className="text-[#c9a96e] text-4xl animate-pulse">✦</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[#c9a96e] text-4xl mb-6">✦</span>
        <p className="text-[#f0ede8] text-xl font-semibold mb-2">No vision found.</p>
        <p className="text-[#6b6880] text-sm mb-8">Complete onboarding to build your vision.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="bg-[#c9a96e] text-[#0f0f1a] font-semibold px-8 py-3 rounded-full text-sm tracking-wide"
        >
          Begin Onboarding
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] relative">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigate('/')}
          className="text-[#6b6880] text-sm flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      {/* Edit links overlay */}
      <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
        <button
          onClick={() => navigate('/onboarding?edit=mission')}
          className="text-[#c9a96e] text-xs tracking-wide"
        >
          Edit Mission
        </button>
        <button
          onClick={() => navigate('/identity')}
          className="text-[#c9a96e] text-xs tracking-wide"
        >
          Edit Identity
        </button>
        <button
          onClick={() => navigate('/goals')}
          className="text-[#c9a96e] text-xs tracking-wide"
        >
          Edit Goals
        </button>
      </div>

      <VisionCard
        profile={profile}
        identityStatements={identityStatements}
        goals={goals}
        morningStreak={morningStreak}
        quote={quote}
        mode="standalone"
      />

      {/* Emergency Mode link */}
      <motion.div
        className="px-6 pb-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={() => navigate('/emergency')}
          className="text-red-900/70 text-sm hover:text-red-700/80 transition-colors"
        >
          Feeling low? Open Emergency Mode
        </button>
      </motion.div>
      <BottomNav />
    </div>
  )
}
