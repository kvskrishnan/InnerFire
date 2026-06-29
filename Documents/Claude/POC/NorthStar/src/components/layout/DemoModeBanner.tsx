import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { clearAllData } from '@/seed/sampleData'

export default function DemoModeBanner() {
  const navigate = useNavigate()
  const isDemoMode = useAuthStore((s) => s.isDemoMode)
  const setDemoMode = useAuthStore((s) => s.setDemoMode)
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)

  if (!isDemoMode) return null

  async function handleBegin() {
    await clearAllData()
    setDemoMode(false)
    setOnboardingComplete(false)
    navigate('/onboarding')
  }

  return (
    <div className="w-full bg-[#1a1a2e] border-b border-[#2a2a3e] px-4 py-2 flex items-center justify-between text-sm">
      <span className="text-[#6b6880]">
        <span className="text-[#c9a96e]">Sample data</span> — exploring as Alex Chen
      </span>
      <button
        onClick={handleBegin}
        className="text-[#c9a96e] text-xs font-medium underline-offset-2 hover:underline"
      >
        Start my journey →
      </button>
    </div>
  )
}
