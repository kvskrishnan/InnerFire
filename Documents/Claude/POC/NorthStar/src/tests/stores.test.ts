import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { act } from '@testing-library/react'

describe('authStore', () => {
  beforeEach(() => {
    act(() => useAuthStore.setState({ isLocked: false, isPinSetup: false, isDemoMode: false }))
  })

  it('starts unlocked', () => {
    expect(useAuthStore.getState().isLocked).toBe(false)
  })

  it('lock() sets isLocked to true', () => {
    act(() => useAuthStore.getState().lock())
    expect(useAuthStore.getState().isLocked).toBe(true)
  })

  it('unlock() sets isLocked to false', () => {
    act(() => {
      useAuthStore.getState().lock()
      useAuthStore.getState().unlock()
    })
    expect(useAuthStore.getState().isLocked).toBe(false)
  })

  it('setDemoMode updates isDemoMode', () => {
    act(() => useAuthStore.getState().setDemoMode(true))
    expect(useAuthStore.getState().isDemoMode).toBe(true)
  })
})

describe('onboardingStore', () => {
  beforeEach(() => {
    act(() => useOnboardingStore.getState().reset())
  })

  it('starts at step 1', () => {
    expect(useOnboardingStore.getState().currentStep).toBe(1)
  })

  it('next() advances step', () => {
    act(() => useOnboardingStore.getState().next())
    expect(useOnboardingStore.getState().currentStep).toBe(2)
  })

  it('back() decrements step, not below 1', () => {
    act(() => useOnboardingStore.getState().back())
    expect(useOnboardingStore.getState().currentStep).toBe(1)
  })

  it('saveFormData persists key-value', () => {
    act(() => useOnboardingStore.getState().saveFormData('mission', 'Lead with love'))
    expect(useOnboardingStore.getState().formData.mission).toBe('Lead with love')
  })
})
