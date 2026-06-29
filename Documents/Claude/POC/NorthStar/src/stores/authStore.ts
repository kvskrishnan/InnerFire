import { create } from 'zustand'

interface AuthState {
  isLocked: boolean
  isPinSetup: boolean
  isDemoMode: boolean
  lastActivityAt: number
  autoLockMinutes: number

  unlock(): void
  lock(): void
  setPinSetup(value: boolean): void
  setDemoMode(value: boolean): void
  updateActivity(): void
  setAutoLockMinutes(minutes: number): void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLocked: false,
  isPinSetup: false,
  isDemoMode: false,
  lastActivityAt: Date.now(),
  autoLockMinutes: 5,

  unlock: () => set({ isLocked: false, lastActivityAt: Date.now() }),
  lock: () => set({ isLocked: true }),
  setPinSetup: (value) => set({ isPinSetup: value }),
  setDemoMode: (value) => set({ isDemoMode: value }),
  updateActivity: () => set({ lastActivityAt: Date.now() }),
  setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
}))
