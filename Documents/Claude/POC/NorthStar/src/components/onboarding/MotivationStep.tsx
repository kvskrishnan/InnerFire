import { useState } from 'react'
import { X } from 'lucide-react'
import { openExternal } from '@/lib/openExternal'
import { useOnboardingStore } from '@/stores/onboardingStore'
import StepLayout from './StepLayout'

const SUGGESTED = [
  'We are what we repeatedly do. Excellence is not an act, but a habit. — Aristotle',
  'The man who moves a mountain begins by carrying away small stones. — Confucius',
  'Your life does not get better by chance. It gets better by change. — Jim Rohn',
]

interface MotivationStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function MotivationStep({ onNext, onBack, currentStep, totalSteps }: MotivationStepProps) {
  const { saveFormData, formData } = useOnboardingStore()
  const [quotes, setQuotes] = useState<string[]>((formData.quotes as string[]) ?? [])
  const [input, setInput] = useState('')

  const goals = (formData.goals as Array<{ title: string }>) ?? []
  const goalKeyword = goals[0]?.title ?? 'personal growth discipline'
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`motivational quotes for "${goalKeyword}"`)}&udm=50`

  const add = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || quotes.includes(trimmed)) return
    setQuotes((prev) => [...prev, trimmed])
    setInput('')
  }

  const remove = (idx: number) => setQuotes((prev) => prev.filter((_, i) => i !== idx))

  const handleNext = () => {
    saveFormData('quotes', quotes)
    onNext()
  }

  return (
    <StepLayout
      title="Your Motivation Vault"
      subtitle="Add quotes that move you. These will appear in your Vision Card and Emergency Mode."
      onNext={handleNext}
      onBack={onBack}
      nextLabel="Continue"
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[#c9a96e] text-xs uppercase tracking-widest">Optional</p>
          <button
            type="button"
            onClick={() => openExternal(searchUrl)}
            className="flex items-center gap-1 text-[#c9a96e] text-xs hover:underline"
          >
            ✦ Find quotes via Google AI →
          </button>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-[#6b6880] text-xs mb-2">Tap to add:</p>
          <div className="space-y-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => add(q)}
                disabled={quotes.includes(q)}
                className="w-full text-left p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#6b6880] text-xs leading-relaxed disabled:opacity-40"
              >
                {q}
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
            placeholder="Add your own quote..."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 flex-1 focus:outline-none focus:border-[#c9a96e] text-sm"
          />
          <button
            onClick={() => add(input)}
            className="px-4 py-2 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-xl text-sm"
          >
            Add
          </button>
        </div>

        {/* Added quotes */}
        {quotes.length > 0 && (
          <div className="space-y-2">
            {quotes.map((q, i) => (
              <div key={i} className="flex gap-2 items-start bg-[#1a1a2e] border border-[#c9a96e] rounded-xl p-3">
                <p className="flex-1 text-[#f0ede8] text-xs leading-relaxed">{q}</p>
                <button onClick={() => remove(i)} className="shrink-0 mt-0.5">
                  <X size={12} className="text-[#6b6880]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StepLayout>
  )
}
