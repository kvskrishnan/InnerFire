import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { openExternal } from '@/lib/openExternal'
import { db } from '@/db/dexie'
import StepLayout from './StepLayout'

const schema = z.object({
  mission: z.string().min(10, 'Mission must be at least 10 characters'),
  vision: z.string().min(10, 'Vision must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

interface MissionStepProps {
  onNext: () => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export default function MissionStep({ onNext, onBack, currentStep, totalSteps }: MissionStepProps) {
  const { saveFormData, formData } = useOnboardingStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mission: (formData.mission as string) ?? '',
      vision: (formData.vision as string) ?? '',
    },
  })

  const mission = watch('mission') ?? ''
  const vision = watch('vision') ?? ''

  const onSubmit = async (data: FormData) => {
    saveFormData('mission', data.mission)
    saveFormData('vision', data.vision)
    await db.onboardingProgress.put({
      id: 'singleton',
      currentStep,
      totalSteps,
      completed: false,
      data: { mission: data.mission, vision: data.vision },
    })
    onNext()
  }

  return (
    <StepLayout
      title="Your Mission & Vision"
      subtitle="The most powerful people on earth know exactly who they are and where they're going."
      onNext={handleSubmit(onSubmit)}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#f0ede8] mb-2">Personal Mission</label>
          <textarea
            {...register('mission')}
            rows={4}
            placeholder="To lead with integrity, inspire my team, and be fully present for my family."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] resize-none text-sm"
          />
          <div className="flex justify-between mt-1">
            {errors.mission ? (
              <p className="text-red-400 text-xs">{errors.mission.message}</p>
            ) : (
              <p className="text-[#6b6880] text-xs">At least 10 characters</p>
            )}
            <p className="text-[#6b6880] text-xs">{mission.length}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#f0ede8]">Vision Statement</label>
            {mission.length >= 10 && (
              <button
                type="button"
                onClick={() => openExternal(`https://www.google.com/search?q=${encodeURIComponent(`personal vision statement inspiration: "${mission}"`)}&udm=50`)}
                className="flex items-center gap-1 text-[#c9a96e] text-xs hover:underline"
              >
                ✦ Inspire me via Google →
              </button>
            )}
          </div>
          <textarea
            {...register('vision')}
            rows={4}
            placeholder="I am a healthy, disciplined leader who builds meaningful things and raises confident children."
            className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-[#f0ede8] placeholder-[#6b6880] p-3 w-full focus:outline-none focus:border-[#c9a96e] resize-none text-sm"
          />
          <div className="flex justify-between mt-1">
            {errors.vision ? (
              <p className="text-red-400 text-xs">{errors.vision.message}</p>
            ) : (
              <p className="text-[#6b6880] text-xs">At least 10 characters</p>
            )}
            <p className="text-[#6b6880] text-xs">{vision.length}</p>
          </div>
          {mission.length >= 10 && (
            <p className="text-[#6b6880] text-[10px] mt-1.5">
              💡 Tap "Inspire me" to search Google AI for vision statement ideas based on your mission.
            </p>
          )}
        </div>
      </div>
    </StepLayout>
  )
}
