import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { profileRepository, settingsRepository } from '@/db/repositories'
import type { UserProfile, AppSettings } from '@/db/schema'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { BottomNav } from '@/components/layout/BottomNav'
import GoldButton from '@/components/ui/GoldButton'

// ---------- Helpers ----------

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ---------- Disabled State ----------

function DisabledState({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 text-center flex flex-col gap-4">
      <p className="text-[#f0ede8] font-medium">The Life Timeline is hidden.</p>
      <p className="text-[#6b6880] text-sm leading-relaxed">
        This is a reflection tool — not a countdown. Enable it only if it inspires you.
      </p>
      <div className="pt-2">
        <GoldButton onClick={onEnable}>Enable Timeline</GoldButton>
      </div>
    </div>
  )
}

// ---------- Birth Date Prompt ----------

function BirthDatePrompt({ onSave }: { onSave: (date: string) => void }) {
  const [value, setValue] = useState('')

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-6 flex flex-col gap-4">
      <p className="text-[#f0ede8] font-medium">Set your birth date</p>
      <p className="text-[#6b6880] text-sm">
        Your birth date is needed to display your Life Timeline.
      </p>
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl px-4 py-3 text-[#f0ede8] text-sm focus:outline-none focus:border-[#c9a96e]"
      />
      <GoldButton onClick={() => value && onSave(value)} disabled={!value}>
        Save
      </GoldButton>
    </div>
  )
}

// ---------- Life Grid ----------

function LifeGrid({ age, lifespan }: { age: number; lifespan: number }) {
  const total = lifespan
  const lived = Math.min(age, total)
  const ahead = total - lived

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[#c9a96e] text-sm tracking-widest uppercase text-center">
        You are {age} years old
      </p>

      {/* Dot grid */}
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < lived
                  ? 'bg-[#c9a96e]'
                  : 'bg-[#2a2a3e] border border-[#3a3a4e]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4 text-sm">
        <span className="text-[#c9a96e]">{lived} years lived</span>
        <span className="text-[#6b6880]">·</span>
        <span className="text-[#6b6880]">{ahead} years ahead</span>
      </div>

      {/* Reflection note */}
      <div className="border-l-4 border-[#c9a96e] pl-5 py-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4">
        <p className="text-[#f0ede8] text-sm leading-relaxed">
          Each dot that is lit represents a year you have already lived. The ones ahead are
          unwritten.
        </p>
        <p className="text-[#c9a96e] text-sm mt-3 font-medium">What will you do with them?</p>
      </div>
    </div>
  )
}

// ---------- Main Screen ----------

export default function Timeline() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const load = async () => {
    const [prof, s] = await Promise.all([profileRepository.get().catch(() => undefined), settingsRepository.getApp().catch(() => ({ id: 'singleton', darkMode: true, lifeTimelineEnabled: false, autoLockMinutes: 5, createdAt: '', updatedAt: '' }))])
    setProfile(prof ?? null)
    setSettings(s)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleEnable = async () => {
    await settingsRepository.saveApp({ lifeTimelineEnabled: true })
    setSettings((prev) => prev ? { ...prev, lifeTimelineEnabled: true } : prev)
  }

  const handleDisable = async () => {
    await settingsRepository.saveApp({ lifeTimelineEnabled: false })
    setSettings((prev) => prev ? { ...prev, lifeTimelineEnabled: false } : prev)
  }

  const handleSaveBirthDate = async (date: string) => {
    await profileRepository.update({ birthDate: date })
    setProfile((prev) => prev ? { ...prev, birthDate: date } : prev)
  }

  if (loading) return <LoadingScreen />

  const enabled = settings?.lifeTimelineEnabled ?? false
  const age = profile?.birthDate ? calculateAge(profile.birthDate) : null
  const lifespan = profile?.lifespan ?? 80

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-[#6b6880] hover:text-[#f0ede8] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#f0ede8]">Life Timeline</h1>
            <p className="text-[#6b6880] text-sm">A reflection on the gift of time.</p>
          </div>
        </div>

        {/* Content */}
        {!enabled ? (
          <DisabledState onEnable={handleEnable} />
        ) : age === null ? (
          <BirthDatePrompt onSave={handleSaveBirthDate} />
        ) : (
          <>
            <LifeGrid age={age} lifespan={lifespan} />
            <div className="mt-8 text-center">
              <button
                onClick={handleDisable}
                className="text-[#6b6880] text-sm hover:text-[#f0ede8] transition-colors"
              >
                Hide Timeline
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
