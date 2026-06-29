import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  currentStep: number
  totalSteps: number
  isComplete: boolean
  formData: Record<string, unknown>

  next(): void
  back(): void
  setStep(step: number): void
  markComplete(): void
  saveFormData(key: string, value: unknown): void
  reset(): void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      totalSteps: 10,
      isComplete: false,
      formData: {},

      next: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps) })),
      back: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
      setStep: (step) => set({ currentStep: step }),
      markComplete: () => set({ isComplete: true }),
      saveFormData: (key, value) => set((s) => ({ formData: { ...s.formData, [key]: value } })),
      reset: () => set({ currentStep: 1, isComplete: false, formData: {} }),
    }),
    { name: 'ns_onboarding' }
  )
)
