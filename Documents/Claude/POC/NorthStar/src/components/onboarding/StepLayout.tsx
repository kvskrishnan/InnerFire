import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

interface StepLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showSkip?: boolean
  onSkip?: () => void
  currentStep: number
  totalSteps: number
}

export default function StepLayout({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  nextDisabled = false,
  showSkip = false,
  onSkip,
  currentStep,
  totalSteps,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        {currentStep > 1 ? (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8]"
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <span className="text-[#6b6880] text-sm">
          {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-36 max-w-lg mx-auto w-full" style={{ overscrollBehaviorY: 'none' }}>
        <h1 className="text-2xl font-bold text-[#f0ede8] mb-2">{title}</h1>
        {subtitle && <p className="text-[#6b6880] text-sm leading-relaxed mb-6">{subtitle}</p>}
        {children}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-[#2a2a3e] p-6 max-w-lg mx-auto">
        <motion.button
          onClick={onNext}
          disabled={nextDisabled}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextLabel}
        </motion.button>
        {showSkip && (
          <button
            onClick={onSkip}
            className="w-full mt-3 text-sm text-[#6b6880] text-center"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
