import { useState } from 'react'
import { X } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'
import StepLayout from './StepLayout'

const EXAMPLES = [
  'I am a disciplined athlete',
  'I am a present father',
  'I am a lifelong learner',
]

interface IdentityStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function IdentityStep({ onNext, onBack, currentStep, totalSteps }: IdentityStepProps) {
  const { saveFormData, formData } = useOnboardingStore()
  const [statements, setStatements] = useState<string[]>(
    (formData.identityStatements as string[]) ?? []
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const add = (text: string) => {
    const trimmed = text.trim()
    if (trimmed.length < 5) {
      setError('At least 5 characters required')
      return
    }
    if (statements.length >= 10) {
      setError('Maximum 10 identity statements')
      return
    }
    if (statements.includes(trimmed)) {
      setError('Already added')
      return
    }
    setStatements((prev) => [...prev, trimmed])
    setInput('')
    setError('')
  }

  const remove = (idx: number) => {
    setStatements((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleNext = () => {
    if (statements.length === 0) {
      setError('Add at least one identity statement')
      return
    }
    saveFormData('identityStatements', statements)
    onNext()
  }

  return (
    <StepLayout
      title="Who Are You Becoming?"
      subtitle="Identity drives behaviour. Define the person you are becoming — not who you wish you were."
      onNext={handleNext}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        {/* Example chips */}
        <div>
          <p className="text-[#6b6880] text-xs mb-2">Tap to add examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => add(ex)}
                disabled={statements.includes(ex)}
                className="px-3 py-1.5 rounded-full border border-[#c9a96e] text-[#c9a96e] text-xs disabled:opacity-40"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add(input)}
            placeholder="I am a..."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 flex-1 focus:outline-none focus:border-[#c9a96e] text-sm"
          />
          <button
            onClick={() => add(input)}
            className="px-4 py-2 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-xl text-sm"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}

        {/* Added statements */}
        {statements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {statements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c9a96e] bg-[#1a1a2e] text-sm text-[#f0ede8]"
              >
                <span>{s}</span>
                <button onClick={() => remove(i)}>
                  <X size={12} className="text-[#6b6880]" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-[#6b6880] text-xs">
          {statements.length}/10 statements added
          {statements.length === 0 && ' — minimum 1 required'}
        </p>
      </div>
    </StepLayout>
  )
}
