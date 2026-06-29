import { useState } from 'react'
import { motion } from 'framer-motion'
import { db } from '@/db/dexie'
import { useOnboardingStore } from '@/stores/onboardingStore'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { saveFormData } = useOnboardingStore()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleBegin = async () => {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name to continue'); return }
    saveFormData('name', trimmed)
    await db.onboardingProgress.put({
      id: 'singleton',
      currentStep: 1,
      totalSteps: 10,
      completed: false,
      data: { name: trimmed },
    })
    onNext()
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full"
      >
        {/* Fire icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.85, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="text-6xl mb-4"
        >
          🔥
        </motion.div>

        <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-3">✦ InnerFire ✦</p>
        <h1 className="text-4xl font-bold text-[#f0ede8] mb-4 leading-tight">
          Welcome to<br />InnerFire
        </h1>

        <div className="space-y-3 text-[#6b6880] text-sm leading-relaxed mb-8">
          <p>InnerFire is not a habit tracker. It is a mirror for your identity.</p>
          <p>Here you define who you are, what you believe, and where you are going — and return to that truth every single day.</p>
          <p>This is about becoming the person Future You will be proud of.</p>
        </div>

        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-8 text-left">
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-2">Remember</p>
          <p className="text-[#f0ede8] text-sm italic leading-relaxed">
            "Most people overestimate what they can do in a year and underestimate what they can do in a decade."
          </p>
        </div>

        {/* Name input */}
        <div className="mb-6 text-left">
          <label className="block text-[#6b6880] text-xs tracking-widest uppercase mb-2">
            What should we call you?
          </label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleBegin()}
            placeholder="Your first name"
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] focus:border-[#c9a96e] rounded-xl px-4 py-3 text-[#f0ede8] placeholder-[#6b6880] text-sm focus:outline-none"
            autoComplete="given-name"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleBegin}
          className="w-full py-4 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-2xl text-base"
        >
          Let's Begin →
        </motion.button>
      </motion.div>
    </div>
  )
}
