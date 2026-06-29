import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { seedSampleData } from '@/seed/sampleData'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { useState } from 'react'

interface FirstLaunchProps {
  onBeginJourney?: () => void
}

export default function FirstLaunch({ onBeginJourney }: FirstLaunchProps) {
  const navigate = useNavigate()
  const setDemoMode = useAuthStore((s) => s.setDemoMode)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const [loading, setLoading] = useState(false)

  async function handleDemo() {
    setLoading(true)
    await seedSampleData()
    setDemoMode(true)
    setOnboardingComplete(true)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-6 py-12">
      {/* Logo / Brand */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-16"
      >
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-4xl font-bold text-[#f0ede8] tracking-tight mb-3">
          InnerFire
        </h1>
        <p className="text-[#6b6880] text-base leading-relaxed max-w-xs mx-auto">
          Ignite your identity.<br />
          <span className="text-[#c9a96e]">Become the person you were meant to be.</span>
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-xs flex flex-col gap-4"
      >
        <button
          type="button"
          onClick={() => { onBeginJourney?.(); navigate('/onboarding') }}
          className="w-full py-4 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-2xl text-base tracking-wide hover:bg-[#d4b87e] transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
        >
          Begin Your Journey
        </button>

        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          aria-disabled={loading}
          className="w-full py-4 bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] font-medium rounded-2xl text-base tracking-wide hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a]"
        >
          {loading ? 'Loading sample data...' : 'Explore with Sample Data'}
        </button>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-[#6b6880] text-xs text-center max-w-xs"
      >
        Everything stays on your device. No account. No cloud. No tracking.
      </motion.p>
    </div>
  )
}
