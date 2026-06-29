import { create } from 'zustand'

type RitualType = 'morning' | 'night' | null

interface AppState {
  currentDate: string           // YYYY-MM-DD, today
  activeRitual: RitualType
  hasCompletedOnboarding: boolean
  morningRitualDoneToday: boolean
  nightReflectionDoneToday: boolean

  setCurrentDate(date: string): void
  setActiveRitual(ritual: RitualType): void
  setOnboardingComplete(value: boolean): void
  setMorningDone(value: boolean): void
  setNightDone(value: boolean): void
}

export const useAppStore = create<AppState>((set) => ({
  currentDate: new Date().toISOString().split('T')[0],
  activeRitual: null,
  hasCompletedOnboarding: false,
  morningRitualDoneToday: false,
  nightReflectionDoneToday: false,

  setCurrentDate: (date) => set({ currentDate: date }),
  setActiveRitual: (ritual) => set({ activeRitual: ritual }),
  setOnboardingComplete: (value) => set({ hasCompletedOnboarding: value }),
  setMorningDone: (value) => set({ morningRitualDoneToday: value }),
  setNightDone: (value) => set({ nightReflectionDoneToday: value }),
}))
