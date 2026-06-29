import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { pinCrypto } from '@/lib/crypto/pinCrypto'
import { db } from '@/db/dexie'
import StepLayout from './StepLayout'

interface PinStepProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  currentStep: number
  totalSteps: number
}

export default function PinStep({ onNext, onBack, onSkip, currentStep, totalSteps }: PinStepProps) {
  const { saveFormData } = useOnboardingStore()
  const [phase, setPhase] = useState<'enter' | 'confirm'>('enter')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [shake, setShake] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const current = phase === 'enter' ? pin : confirmPin
  const setCurrent = phase === 'enter' ? setPin : setConfirmPin

  const handleKey = (digit: string) => {
    if (current.length < 4) {
      setCurrent((prev) => prev + digit)
    }
  }

  const handleDelete = () => {
    setCurrent((prev) => prev.slice(0, -1))
  }

  const handleNext = async () => {
    if (current.length < 4) return

    if (phase === 'enter') {
      setPhase('confirm')
      return
    }

    // Confirm phase
    if (confirmPin !== pin) {
      setShake(true)
      setErrorMsg("PINs don't match — try again")
      setTimeout(() => {
        setShake(false)
        setPin('')
        setConfirmPin('')
        setPhase('enter')
        setErrorMsg('')
      }, 800)
      return
    }

    // Save PIN
    const { hash, salt } = await pinCrypto.hashPin(pin)
    await db.securitySettings.put({
      id: 'singleton',
      pinHash: hash,
      pinSalt: salt,
      biometricEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    saveFormData('pinSet', true)
    onNext()
  }

  // Auto-advance when 4 digits entered
  const handleDigit = (d: string) => {
    if (current.length >= 4) return
    const next = current + d
    setCurrent(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (phase === 'enter') {
          setPhase('confirm')
        } else {
          // trigger confirm check
          if (next !== pin) {
            setShake(true)
            setErrorMsg("PINs don't match — try again")
            setTimeout(() => {
              setShake(false)
              setPin('')
              setConfirmPin('')
              setPhase('enter')
              setErrorMsg('')
            }, 800)
          } else {
            pinCrypto.hashPin(pin).then(({ hash, salt }) => {
              db.securitySettings.put({
                id: 'singleton',
                pinHash: hash,
                pinSalt: salt,
                biometricEnabled: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              saveFormData('pinSet', true)
              onNext()
            })
          }
        }
      }, 150)
    }
  }

  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <StepLayout
      title="Protect Your Privacy"
      subtitle="Set a 4-digit PIN to keep your InnerFire private. Your data never leaves this device."
      onNext={handleNext}
      onBack={onBack}
      nextLabel={phase === 'enter' ? 'Set PIN' : 'Confirm PIN'}
      nextDisabled={current.length < 4}
      showSkip
      onSkip={onSkip}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-8">
        <div className="text-center">
          <p className="text-[#6b6880] text-sm mb-4">
            {phase === 'enter' ? 'Enter your 4-digit PIN' : 'Confirm your PIN'}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={shake ? { x: [0, -8, 8, -8, 8, 0], opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
              transition={{ duration: shake ? 0.4 : 0.2 }}
              className="flex justify-center gap-4 mb-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < current.length
                      ? 'bg-[#c9a96e] border-[#c9a96e]'
                      : 'border-[#2a2a3e] bg-transparent'
                  }`}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {errorMsg && <p className="text-red-400 text-xs mt-2">{errorMsg}</p>}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {KEYS.map((key, idx) => {
            if (key === '') return <div key={idx} />
            if (key === 'del') {
              return (
                <button
                  key={idx}
                  onClick={handleDelete}
                  className="w-full h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] flex items-center justify-center"
                >
                  <Delete size={18} />
                </button>
              )
            }
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDigit(key)}
                className="w-full h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] text-xl font-medium"
              >
                {key}
              </motion.button>
            )
          })}
        </div>
      </div>
    </StepLayout>
  )
}
