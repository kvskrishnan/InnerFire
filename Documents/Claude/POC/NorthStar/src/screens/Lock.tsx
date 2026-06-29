import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'
import { settingsRepository } from '@/db/repositories'
import { pinCrypto } from '@/lib/crypto/pinCrypto'
import { useAuthStore } from '@/stores/authStore'
import { clearAllData } from '@/seed/sampleData'
import type { SecuritySettings } from '@/db/schema'

const shakeVariants = {
  shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  idle: { x: 0 },
}

export default function Lock() {
  const navigate = useNavigate()
  const unlock = useAuthStore((s) => s.unlock)

  const [security, setSecurity] = useState<SecuritySettings | null | undefined>(undefined)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shakeState, setShakeState] = useState<'idle' | 'shake'>('idle')
  const [showForgotConfirm, setShowForgotConfirm] = useState(false)

  useEffect(() => {
    settingsRepository.getSecurity().then((s) => setSecurity(s ?? null))
  }, [])

  useEffect(() => {
    if (pin.length === 4 && security) {
      verifyPin(pin)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  async function verifyPin(entered: string) {
    if (!security) return
    const ok = await pinCrypto.verifyPin(entered, security.pinHash, security.pinSalt)
    if (ok) {
      unlock()
      navigate('/')
    } else {
      setShakeState('shake')
      setError('Incorrect PIN')
      setTimeout(() => {
        setShakeState('idle')
        setError('')
        setPin('')
      }, 2000)
    }
  }

  function handleKey(digit: string) {
    if (pin.length < 4) setPin((p) => p + digit)
  }

  function handleBackspace() {
    setPin((p) => p.slice(0, -1))
  }

  async function handleForgotConfirm() {
    await clearAllData()
    unlock()
    navigate('/')
  }

  // Loading
  if (security === undefined) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#c9a96e] border-t-transparent animate-spin" />
      </div>
    )
  }

  // No PIN set
  if (security === null) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center px-6 gap-6">
        <p className="text-[#6b6880] text-xs tracking-widest uppercase">✦</p>
        <div className="text-center space-y-2">
          <p className="text-[#f0ede8] text-lg font-medium">No PIN has been set.</p>
          <p className="text-[#6b6880] text-sm">Go to Settings to set up a PIN.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="px-5 py-2.5 rounded-xl bg-[#1a1a2e] border border-[#2a2a3e] text-[#c9a96e] text-sm font-medium"
          >
            Go to Settings
          </button>
          <button
            onClick={() => { unlock(); navigate('/') }}
            className="px-5 py-2.5 rounded-xl bg-[#c9a96e] text-[#0f0f1a] text-sm font-semibold"
          >
            Enter App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center px-6 gap-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <p className="text-[#6b6880] text-xs tracking-widest uppercase">✦ InnerFire</p>
        <div>
          <p className="text-[#f0ede8] text-lg font-semibold">Your journal is private.</p>
          <p className="text-[#6b6880] text-sm mt-1">Enter your PIN to continue.</p>
        </div>
      </div>

      {/* Dots */}
      <motion.div
        className="flex gap-4"
        variants={shakeVariants}
        animate={shakeState}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              i < pin.length
                ? 'bg-[#c9a96e] border-[#c9a96e]'
                : 'bg-transparent border-[#2a2a3e]'
            }`}
          />
        ))}
      </motion.div>

      {/* Error */}
      <div className="h-5">
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button
            key={d}
            onClick={() => handleKey(d)}
            className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] text-xl font-medium flex items-center justify-center cursor-pointer hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
          >
            {d}
          </button>
        ))}
        {/* Backspace */}
        <button
          onClick={handleBackspace}
          className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] flex items-center justify-center cursor-pointer hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
        >
          <Delete size={20} />
        </button>
        {/* 0 */}
        <button
          onClick={() => handleKey('0')}
          className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] text-xl font-medium flex items-center justify-center cursor-pointer hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
        >
          0
        </button>
        {/* Confirm */}
        <button
          onClick={() => pin.length === 4 && verifyPin(pin)}
          disabled={pin.length < 4}
          className={`w-16 h-16 rounded-full border flex items-center justify-center text-xl font-medium transition-colors active:scale-95 ${
            pin.length === 4
              ? 'bg-[#c9a96e] border-[#c9a96e] text-[#0f0f1a] cursor-pointer'
              : 'bg-[#1a1a2e] border-[#2a2a3e] text-[#6b6880] cursor-not-allowed'
          }`}
        >
          ✓
        </button>
      </div>

      {/* Forgot PIN */}
      <div className="mt-2 text-center">
        {!showForgotConfirm ? (
          <button
            onClick={() => setShowForgotConfirm(true)}
            className="text-[#6b6880] text-sm underline underline-offset-2"
          >
            Forgot PIN?
          </button>
        ) : (
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 max-w-xs text-center space-y-3">
            <p className="text-[#f0ede8] text-sm font-medium">Reset the app?</p>
            <p className="text-[#6b6880] text-xs">
              This will clear all your data and reset the app. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowForgotConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-[#0f0f1a] border border-[#2a2a3e] text-[#6b6880] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotConfirm}
                className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium"
              >
                Yes, reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
