import { motion } from 'framer-motion'
import { db } from '@/db/dexie'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const handleBegin = async () => {
    // Write a record immediately so App.tsx knows onboarding is in progress
    // and won't show FirstLaunch again if the tab reloads mid-onboarding
    await db.onboardingProgress.put({
      id: 'singleton',
      currentStep: 1,
      totalSteps: 10,
      completed: false,
      data: {},
    })
    onNext()
  }
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-6">✦ NorthStar ✦</p>
        <h1 className="text-4xl font-bold text-[#f0ede8] mb-4 leading-tight">
          Welcome to<br />NorthStar
        </h1>

        <div className="space-y-3 text-[#6b6880] text-sm leading-relaxed mb-10">
          <p>NorthStar is not a habit tracker. It is a mirror for your identity.</p>
          <p>Here you define who you are, what you believe, and where you are going — and return to that truth every single day.</p>
          <p>This is about becoming the person Future You will be proud of.</p>
        </div>

        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-10 text-left">
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-2">Remember</p>
          <p className="text-[#f0ede8] text-sm italic leading-relaxed">
            "Most people overestimate what they can do in a year and underestimate what they can do in a decade."
          </p>
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
