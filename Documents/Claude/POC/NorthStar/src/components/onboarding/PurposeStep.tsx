import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { openExternal } from '@/lib/openExternal'
import { db } from '@/db/dexie'
import StepLayout from './StepLayout'

const schema = z.object({
  lifePurpose: z.string().min(10, 'Life purpose must be at least 10 characters'),
  personalWhy: z.string().min(10, 'Your WHY must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

interface PurposeStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

const PURPOSE_EXAMPLES = [
  "To prove that a person can be both ambitious and deeply present — building a legacy of excellence and love.",
  "To use my skills and energy to lift others up, leave every room better than I found it, and grow every single day.",
  "To live fully, love deeply, and lead by example so my family always knows what's possible.",
  "To create meaningful work that outlasts me and to be the kind of person my younger self would look up to.",
  "To turn my struggles into strength and my strength into service for the people around me.",
]

const WHY_EXAMPLES = [
  "My children will look back and see that their father chose growth over comfort — every single day.",
  "Because I have been given gifts I haven't fully used yet, and I refuse to leave this world without using them.",
  "So that one day I can look back without regret — knowing I gave everything I had to the things that matter most.",
  "Because the people depending on me deserve the best version of me, not the comfortable version.",
  "I want to prove to myself that discipline and love are not opposites — that you can work hard and still be present.",
]

interface ExamplePickerProps {
  examples: string[]
  onSelect: (text: string) => void
  field: 'lifePurpose' | 'personalWhy'
}

function ExamplePicker({ examples, onSelect, field }: ExamplePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-[#c9a96e] text-xs flex items-center gap-1 hover:underline"
      >
        {open ? '▲ Hide examples' : '✦ See examples — tap to use'}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onSelect(ex); setOpen(false) }}
              className="w-full text-left bg-[#0f0f1a] border border-[#2a2a3e] hover:border-[#c9a96e] rounded-xl px-3 py-2.5 text-[#6b6880] hover:text-[#f0ede8] text-xs italic leading-relaxed transition-colors"
            >
              "{ex}"
            </button>
          ))}
          <button
            type="button"
            onClick={() => openExternal(`https://www.google.com/search?q=${encodeURIComponent(field === 'lifePurpose' ? 'personal life purpose statement examples inspiration' : 'personal WHY statement examples Simon Sinek inspiration')}&udm=50`)}
            className="flex items-center gap-1 text-[#c9a96e] text-xs hover:underline pt-1"
          >
            ✦ Search Google AI for more inspiration →
          </button>
        </div>
      )}
    </div>
  )
}

export default function PurposeStep({ onNext, onBack, currentStep, totalSteps }: PurposeStepProps) {
  const { saveFormData, formData } = useOnboardingStore()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lifePurpose: (formData.lifePurpose as string) ?? '',
      personalWhy: (formData.personalWhy as string) ?? '',
    },
  })

  const lifePurpose = watch('lifePurpose') ?? ''
  const personalWhy = watch('personalWhy') ?? ''

  const onSubmit = async (data: FormData) => {
    saveFormData('lifePurpose', data.lifePurpose)
    saveFormData('personalWhy', data.personalWhy)
    await db.onboardingProgress.put({
      id: 'singleton',
      currentStep,
      totalSteps,
      completed: false,
      data: { ...formData, lifePurpose: data.lifePurpose, personalWhy: data.personalWhy },
    })
    onNext()
  }

  return (
    <StepLayout
      title="Your Life Purpose & WHY"
      subtitle="Purpose gives direction. Your WHY gives you fuel on the hard days."
      onNext={handleSubmit(onSubmit)}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">

        {/* Life Purpose */}
        <div>
          <label className="block text-sm font-medium text-[#f0ede8] mb-2">Life Purpose</label>
          <textarea
            {...register('lifePurpose')}
            rows={4}
            placeholder="To prove that a person can be both ambitious and deeply present..."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] resize-none text-sm"
          />
          <div className="flex justify-between mt-1">
            {errors.lifePurpose
              ? <p className="text-red-400 text-xs">{errors.lifePurpose.message}</p>
              : <p className="text-[#6b6880] text-xs">At least 10 characters</p>
            }
            <p className="text-[#6b6880] text-xs">{lifePurpose.length}</p>
          </div>
          <ExamplePicker
            examples={PURPOSE_EXAMPLES}
            field="lifePurpose"
            onSelect={text => setValue('lifePurpose', text, { shouldValidate: true })}
          />
        </div>

        {/* Personal WHY */}
        <div>
          <label className="block text-sm font-medium text-[#c9a96e] mb-2">Personal WHY</label>
          <textarea
            {...register('personalWhy')}
            rows={4}
            placeholder="My children will look back and see that their father chose growth over comfort."
            className="bg-[#1a1a2e] border border-[#c9a96e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] resize-none text-sm"
          />
          <div className="flex justify-between mt-1">
            {errors.personalWhy
              ? <p className="text-red-400 text-xs">{errors.personalWhy.message}</p>
              : <p className="text-[#6b6880] text-xs">At least 10 characters</p>
            }
            <p className="text-[#6b6880] text-xs">{personalWhy.length}</p>
          </div>
          <ExamplePicker
            examples={WHY_EXAMPLES}
            field="personalWhy"
            onSelect={text => setValue('personalWhy', text, { shouldValidate: true })}
          />
        </div>

        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4">
          <p className="text-[#6b6880] text-xs leading-relaxed">
            💡 Use an example as a starting point — then edit it in your own words. Your WHY appears in every reminder and flash card.
          </p>
        </div>

      </div>
    </StepLayout>
  )
}
