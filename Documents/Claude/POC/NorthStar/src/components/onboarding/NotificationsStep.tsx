import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import StepLayout from './StepLayout'

interface NotificationsStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function NotificationsStep({ onNext, onBack, currentStep, totalSteps }: NotificationsStepProps) {
  const { saveFormData } = useOnboardingStore()
  const [morningTime, setMorningTime] = useState('07:00')
  const [eveningTime, setEveningTime] = useState('21:00')
  const [morningEnabled, setMorningEnabled] = useState(true)
  const [eveningEnabled, setEveningEnabled] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle')

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported')
      return
    }
    const result = await Notification.requestPermission()
    setPermissionStatus(result === 'granted' ? 'granted' : 'denied')
  }

  const handleNext = () => {
    saveFormData('notifications', {
      morningTime,
      eveningTime,
      morningEnabled,
      eveningEnabled,
    })
    onNext()
  }

  return (
    <StepLayout
      title="Your Daily Rituals"
      subtitle="NorthStar will gently remind you to start and end each day with intention."
      onNext={handleNext}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        {/* Morning */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0ede8] text-sm font-medium">🌅 Morning Reminder</p>
              <p className="text-[#6b6880] text-xs">Start your day with intention</p>
            </div>
            <button
              onClick={() => setMorningEnabled(!morningEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${morningEnabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${morningEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {morningEnabled && (
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] text-sm"
            />
          )}
        </div>

        {/* Evening */}
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f0ede8] text-sm font-medium">🌙 Evening Reflection</p>
              <p className="text-[#6b6880] text-xs">End your day with clarity</p>
            </div>
            <button
              onClick={() => setEveningEnabled(!eveningEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${eveningEnabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${eveningEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          {eveningEnabled && (
            <input
              type="time"
              value={eveningTime}
              onChange={(e) => setEveningTime(e.target.value)}
              className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl text-[#f0ede8] p-3 w-full focus:outline-none focus:border-[#c9a96e] text-sm"
            />
          )}
        </div>

        {/* Permission */}
        <div className="space-y-2">
          <p className="text-[#6b6880] text-xs">
            To receive reminders, we need permission to send notifications. Your data stays on this device.
          </p>
          {permissionStatus === 'idle' && (
            <button
              onClick={requestPermission}
              className="w-full py-3 bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] rounded-2xl text-sm"
            >
              Allow Notifications
            </button>
          )}
          {permissionStatus === 'granted' && (
            <p className="text-green-400 text-xs">✓ Notifications enabled</p>
          )}
          {(permissionStatus === 'denied' || permissionStatus === 'unsupported') && (
            <p className="text-[#6b6880] text-xs">
              {permissionStatus === 'unsupported'
                ? 'Notifications are not supported on this device.'
                : 'Notification permission denied. You can enable it in your device settings.'}
            </p>
          )}
        </div>

        <p className="text-[#6b6880] text-xs">You can change these anytime in Settings.</p>
      </div>
    </StepLayout>
  )
}
