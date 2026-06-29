import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Delete, CheckCircle } from 'lucide-react'
import { settingsRepository } from '@/db/repositories'
import { sendTestNotification, requestNotificationPermission } from '@/lib/notifications/goalReminderService'
import { pinCrypto } from '@/lib/crypto/pinCrypto'
import { BottomNav } from '@/components/layout/BottomNav'
import type { AppSettings, SecuritySettings } from '@/db/schema'

// ── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${value ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'}`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5"
        animate={{ left: value ? '26px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ── PIN keypad (reusable inline) ─────────────────────────────────────────────
const shakeVariants = {
  shake: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  idle: { x: 0 },
}

type PinSetupStep = 'enter' | 'confirm'

function PinSetup({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<PinSetupStep>('enter')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPin] = useState('')
  const [shakeState, setShakeState] = useState<'idle' | 'shake'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (pin.length === 4) {
      if (step === 'enter') {
        setFirstPin(pin)
        setPin('')
        setStep('confirm')
      } else {
        if (pin === firstPin) {
          savePin(pin)
        } else {
          setShakeState('shake')
          setError("PINs didn't match")
          setTimeout(() => {
            setShakeState('idle')
            setError('')
            setPin('')
            setFirstPin('')
            setStep('enter')
          }, 1500)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  async function savePin(p: string) {
    const { hash, salt } = await pinCrypto.hashPin(p)
    await settingsRepository.saveSecurity({ pinHash: hash, pinSalt: salt, biometricEnabled: false })
    onComplete()
  }

  function handleKey(digit: string) {
    if (pin.length < 4) setPin((prev) => prev + digit)
  }

  return (
    <div className="mt-4 bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 space-y-5">
      <div className="text-center">
        <p className="text-[#f0ede8] text-sm font-medium">
          {step === 'enter' ? 'Enter new PIN' : 'Confirm PIN'}
        </p>
      </div>

      <motion.div className="flex gap-3 justify-center" variants={shakeVariants} animate={shakeState}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
              i < pin.length ? 'bg-[#c9a96e] border-[#c9a96e]' : 'bg-transparent border-[#2a2a3e]'
            }`}
          />
        ))}
      </motion.div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button
            key={d}
            onClick={() => handleKey(d)}
            className="h-12 rounded-full bg-[#0f0f1a] border border-[#2a2a3e] text-[#f0ede8] text-lg font-medium flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="h-12 rounded-full bg-[#0f0f1a] border border-[#2a2a3e] text-[#f0ede8] flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
        >
          <Delete size={16} />
        </button>
        <button
          onClick={() => handleKey('0')}
          className="h-12 rounded-full bg-[#0f0f1a] border border-[#2a2a3e] text-[#f0ede8] text-lg font-medium flex items-center justify-center hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95"
        >
          0
        </button>
        <button
          onClick={onCancel}
          className="h-12 rounded-full bg-[#0f0f1a] border border-[#2a2a3e] text-[#6b6880] text-sm flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-colors active:scale-95"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs tracking-widest uppercase text-[#6b6880] mb-3 mt-6">{label}</p>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2a2a3e] last:border-0">
      <div className="flex-1 mr-3">{left}</div>
      {right}
    </div>
  )
}

// ── Main Settings screen ──────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate()

  const [appSettings, setAppSettings] = useState<AppSettings | null>(null)
  const [security, setSecurity] = useState<SecuritySettings | null | undefined>(undefined)
  const [showPinSetup, setShowPinSetup] = useState(false)

  const autoLockOptions = [
    { label: '1 min', value: 1 },
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: 'Never', value: 0 },
  ]

  useEffect(() => {
    settingsRepository.getApp().then(setAppSettings)
    settingsRepository.getSecurity().then((s) => setSecurity(s ?? null))
  }, [])

  async function updateApp(partial: Partial<AppSettings>) {
    await settingsRepository.saveApp(partial)
    setAppSettings((prev) => prev ? { ...prev, ...partial } : null)
  }

  function handlePinComplete() {
    settingsRepository.getSecurity().then((s) => setSecurity(s ?? null))
    setShowPinSetup(false)
  }

  if (!appSettings || security === undefined) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#c9a96e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 pt-12 pb-2">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-[#6b6880] hover:text-[#f0ede8] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-[#f0ede8]">Settings</h1>
        </div>

        {/* ── SECURITY ─────────────────────────────────────────────────── */}
        <SectionLabel label="Security" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4">
          {/* PIN Lock */}
          <Row
            left={
              <div>
                <p className="text-[#f0ede8] text-sm font-medium">PIN Lock</p>
                {security ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle size={12} className="text-green-400" />
                    <p className="text-green-400 text-xs">PIN is active</p>
                  </div>
                ) : (
                  <p className="text-[#6b6880] text-xs mt-0.5">No PIN set</p>
                )}
              </div>
            }
            right={
              <button
                onClick={() => setShowPinSetup((v) => !v)}
                className="text-[#c9a96e] text-xs font-medium border border-[#c9a96e] rounded-lg px-3 py-1.5"
              >
                {security ? 'Change PIN' : 'Set up PIN'}
              </button>
            }
          />

          {showPinSetup && (
            <PinSetup onComplete={handlePinComplete} onCancel={() => setShowPinSetup(false)} />
          )}

          {/* Auto-lock */}
          <Row
            left={
              <div>
                <p className="text-[#f0ede8] text-sm font-medium">Lock after inactivity</p>
              </div>
            }
          />
          <div className="flex gap-2 pb-3 flex-wrap">
            {autoLockOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateApp({ autoLockMinutes: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  appSettings.autoLockMinutes === opt.value
                    ? 'bg-[#c9a96e] text-[#0f0f1a]'
                    : 'bg-[#1a1a2e] border border-[#2a2a3e] text-[#6b6880]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── DISPLAY ──────────────────────────────────────────────────── */}
        <SectionLabel label="Display" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4">
          <Row
            left={
              <div>
                <p className="text-[#f0ede8] text-sm font-medium">Dark Mode</p>
                <p className="text-[#6b6880] text-xs mt-0.5">Dark mode is always on in this version</p>
              </div>
            }
            right={<Toggle value={true} onChange={() => {}} disabled />}
          />
          <Row
            left={
              <p className="text-[#f0ede8] text-sm font-medium">Life Timeline</p>
            }
            right={
              <Toggle
                value={appSettings.lifeTimelineEnabled}
                onChange={(v) => updateApp({ lifeTimelineEnabled: v })}
              />
            }
          />
        </div>

        {/* ── RITUALS ──────────────────────────────────────────────────── */}
        <SectionLabel label="Rituals" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4">
          <Row
            left={
              <div>
                <p className="text-[#f0ede8] text-sm font-medium">Morning Reminder</p>
                <p className="text-[#6b6880] text-xs mt-0.5">Daily check-in prompt</p>
              </div>
            }
            right={
              <input
                type="time"
                defaultValue="07:00"
                className="bg-[#0f0f1a] border border-[#2a2a3e] text-[#f0ede8] text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-[#c9a96e]"
              />
            }
          />
          <Row
            left={
              <div>
                <p className="text-[#f0ede8] text-sm font-medium">Evening Reflection</p>
                <p className="text-[#6b6880] text-xs mt-0.5">End-of-day review</p>
              </div>
            }
            right={
              <input
                type="time"
                defaultValue="21:00"
                className="bg-[#0f0f1a] border border-[#2a2a3e] text-[#f0ede8] text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-[#c9a96e]"
              />
            }
          />
        </div>

        {/* ── NOTIFICATIONS ────────────────────────────────────────────── */}
        <SectionLabel label="Notifications" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4">
          <button
            onClick={async () => {
              await requestNotificationPermission()
              await sendTestNotification()
            }}
            className="w-full text-left py-3 text-[#f0ede8] text-sm font-medium flex items-center justify-between"
          >
            Send test notification
            <span className="text-[#c9a96e] text-xs">Tap to verify →</span>
          </button>
        </div>
        <p className="text-[#6b6880] text-xs px-1 -mt-3">
          If no notification appears, open iOS Settings → InnerFire → Notifications and ensure they are enabled.
        </p>

        {/* ── DATA ─────────────────────────────────────────────────────── */}
        <SectionLabel label="Data" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4">
          <button
            onClick={() => navigate('/data')}
            className="w-full text-left py-3 border-b border-[#2a2a3e] text-[#f0ede8] text-sm font-medium flex items-center justify-between"
          >
            Export my data
            <span className="text-[#6b6880]">→</span>
          </button>
          <button
            onClick={() => navigate('/data')}
            className="w-full text-left py-3 border-b border-[#2a2a3e] text-[#f0ede8] text-sm font-medium flex items-center justify-between"
          >
            Import data
            <span className="text-[#6b6880]">→</span>
          </button>
          <button
            onClick={() => navigate('/data')}
            className="w-full text-left py-3 text-red-400 text-sm font-medium flex items-center justify-between"
          >
            Delete all data
            <span className="text-red-400 opacity-60">→</span>
          </button>
        </div>

        {/* ── ABOUT ────────────────────────────────────────────────────── */}
        <SectionLabel label="About" />
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl px-4 py-4 space-y-1.5">
          <p className="text-[#6b6880] text-sm">InnerFire v1.0.0</p>
          <p className="text-[#6b6880] text-sm">Built for intentional living</p>
          <p className="text-[#6b6880] text-sm">All data stored locally on this device</p>
          <p className="text-[#6b6880] text-sm">No account. No cloud. No tracking.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
