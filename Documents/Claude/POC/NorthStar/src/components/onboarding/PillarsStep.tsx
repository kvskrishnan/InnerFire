import { useState } from 'react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import StepLayout from './StepLayout'

const DEFAULT_PILLARS = [
  { id: 'health', name: 'Health', icon: '💪', color: '#e05f5f' },
  { id: 'mind', name: 'Mind', icon: '🧠', color: '#7c6ee0' },
  { id: 'career', name: 'Career', icon: '🚀', color: '#4a90d9' },
  { id: 'wealth', name: 'Wealth', icon: '💰', color: '#c9a96e' },
  { id: 'relationships', name: 'Relationships', icon: '❤️', color: '#e07ba0' },
  { id: 'spirituality', name: 'Spirituality', icon: '🌿', color: '#5db87a' },
  { id: 'growth', name: 'Personal Growth', icon: '🌱', color: '#4abfa0' },
  { id: 'contribution', name: 'Contribution', icon: '🤝', color: '#d4845a' },
]

interface PillarsStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function PillarsStep({ onNext, onBack, currentStep, totalSteps }: PillarsStepProps) {
  const { saveFormData, formData } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>(
    (formData.selectedPillarIds as string[]) ?? DEFAULT_PILLARS.map((p) => p.id)
  )
  const [error, setError] = useState('')

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setError('')
  }

  const handleNext = () => {
    if (selected.length < 3) {
      setError('Please select at least 3 pillars')
      return
    }
    saveFormData('selectedPillarIds', selected)
    saveFormData('pillars', DEFAULT_PILLARS.filter((p) => selected.includes(p.id)))
    onNext()
  }

  return (
    <StepLayout
      title="Your Life Pillars"
      subtitle="These are the domains of your life. All your goals will live within these pillars."
      onNext={handleNext}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-3">
        {DEFAULT_PILLARS.map((pillar) => {
          const isSelected = selected.includes(pillar.id)
          return (
            <button
              key={pillar.id}
              onClick={() => toggle(pillar.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#c9a96e] bg-[#1a1a2e]'
                  : 'border-[#2a2a3e] bg-[#1a1a2e] opacity-60'
              }`}
              style={{ borderLeftWidth: '4px', borderLeftColor: isSelected ? pillar.color : '#2a2a3e' }}
            >
              <span className="text-2xl">{pillar.icon}</span>
              <span className={`font-medium text-sm ${isSelected ? 'text-[#f0ede8]' : 'text-[#6b6880]'}`}>
                {pillar.name}
              </span>
              <div className="ml-auto">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#c9a96e] bg-[#c9a96e]' : 'border-[#2a2a3e] bg-transparent'
                  }`}
                >
                  {isSelected && <span className="text-[#0f0f1a] text-xs font-bold leading-none">✓</span>}
                </div>
              </div>
            </button>
          )
        })}

        {error && <p className="text-red-400 text-xs">{error}</p>}
        <p className="text-[#6b6880] text-xs">You can add custom pillars later.</p>
      </div>
    </StepLayout>
  )
}
