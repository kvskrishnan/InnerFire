import { AnimatePresence, motion } from 'framer-motion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import WelcomeStep from '@/components/onboarding/WelcomeStep'
import MissionStep from '@/components/onboarding/MissionStep'
import PurposeStep from '@/components/onboarding/PurposeStep'
import IdentityStep from '@/components/onboarding/IdentityStep'
import PillarsStep from '@/components/onboarding/PillarsStep'
import GoalsStep from '@/components/onboarding/GoalsStep'
import MotivationStep from '@/components/onboarding/MotivationStep'
import NotificationsStep from '@/components/onboarding/NotificationsStep'
import PinStep from '@/components/onboarding/PinStep'
import CompleteStep from '@/components/onboarding/CompleteStep'

const TOTAL_STEPS = 10

const slideVariants = {
  enterForward: { x: '100%', opacity: 0 },
  enterBackward: { x: '-100%', opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitForward: { x: '-100%', opacity: 0 },
  exitBackward: { x: '100%', opacity: 0 },
}

export default function Onboarding() {
  const { currentStep, next, back } = useOnboardingStore()

  const sharedProps = {
    onNext: next,
    onBack: back,
    currentStep,
    totalSteps: TOTAL_STEPS,
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={next} />
      case 2:
        return <MissionStep {...sharedProps} />
      case 3:
        return <PurposeStep {...sharedProps} />
      case 4:
        return <IdentityStep {...sharedProps} />
      case 5:
        return <PillarsStep {...sharedProps} />
      case 6:
        return <GoalsStep {...sharedProps} />
      case 7:
        return <MotivationStep {...sharedProps} />
      case 8:
        return <NotificationsStep {...sharedProps} />
      case 9:
        return <PinStep {...sharedProps} onSkip={next} />
      case 10:
        return <CompleteStep />
      default:
        return <WelcomeStep onNext={next} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] overflow-hidden relative">
      {/* Progress bar */}
      {currentStep < TOTAL_STEPS && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#1a1a2e] z-50">
          <motion.div
            className="h-full bg-[#c9a96e]"
            layoutId="progress"
            animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="enterForward"
          animate="center"
          exit="exitForward"
          variants={slideVariants}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
