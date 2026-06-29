import { describe, it, expect } from 'vitest'
import {
  GoalSchema,
  PinSchema,
  UserProfileSchema,
  ReflectionSchema,
  FutureLetterSchema,
  IdentityStatementSchema,
} from '@/lib/validation/schemas'

describe('GoalSchema', () => {
  it('requires a WHY of at least 10 characters', () => {
    const result = GoalSchema.safeParse({ title: 'Run 5k', pillarId: 'abc', why: 'short' })
    expect(result.success).toBe(false)
  })

  it('accepts a valid goal with WHY', () => {
    const result = GoalSchema.safeParse({
      title: 'Run a half marathon',
      pillarId: 'health-id',
      why: 'I want the strength and energy to lead my family and model discipline for my children.',
    })
    expect(result.success).toBe(true)
  })

  it('requires a pillarId', () => {
    const result = GoalSchema.safeParse({ title: 'Goal', pillarId: '', why: 'A meaningful why here' })
    expect(result.success).toBe(false)
  })

  it('sets default status to active', () => {
    const result = GoalSchema.safeParse({ title: 'Goal', pillarId: 'x', why: 'A meaningful why here' })
    expect(result.success && result.data.status).toBe('active')
  })
})

describe('PinSchema', () => {
  it('requires exactly 4 digits', () => {
    expect(PinSchema.safeParse({ pin: '123', confirmPin: '123' }).success).toBe(false)
    expect(PinSchema.safeParse({ pin: '12345', confirmPin: '12345' }).success).toBe(false)
    expect(PinSchema.safeParse({ pin: '1234', confirmPin: '1234' }).success).toBe(true)
  })

  it('rejects non-numeric PINs', () => {
    expect(PinSchema.safeParse({ pin: 'abcd', confirmPin: 'abcd' }).success).toBe(false)
  })

  it('rejects mismatched PINs', () => {
    const result = PinSchema.safeParse({ pin: '1234', confirmPin: '5678' })
    expect(result.success).toBe(false)
  })
})

describe('UserProfileSchema', () => {
  it('requires mission of at least 10 characters', () => {
    const r = UserProfileSchema.safeParse({
      name: 'Alex',
      mission: 'short',
      vision: 'long enough vision here',
      lifePurpose: 'long enough purpose here',
      personalWhy: 'long enough why here',
    })
    expect(r.success).toBe(false)
  })

  it('accepts a valid profile', () => {
    const r = UserProfileSchema.safeParse({
      name: 'Alex Chen',
      mission: 'To lead with integrity and be present for my family.',
      vision: 'I am a healthy disciplined leader who builds meaningful things.',
      lifePurpose: 'To prove ambition and presence can coexist.',
      personalWhy: 'My children will see their father chose growth over comfort.',
    })
    expect(r.success).toBe(true)
  })
})

describe('IdentityStatementSchema', () => {
  it('requires at least 5 characters', () => {
    expect(IdentityStatementSchema.safeParse({ text: 'hi' }).success).toBe(false)
    expect(IdentityStatementSchema.safeParse({ text: 'I am a disciplined athlete.' }).success).toBe(true)
  })
})

describe('FutureLetterSchema', () => {
  it('requires delivery date in the future', () => {
    const past = '2020-01-01'
    const r = FutureLetterSchema.safeParse({ title: 'Letter', body: 'Dear future me, this is a letter.', deliveryDate: past })
    expect(r.success).toBe(false)
  })

  it('accepts future delivery date', () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
    const r = FutureLetterSchema.safeParse({ title: 'Letter', body: 'Dear future me, this is a letter.', deliveryDate: future })
    expect(r.success).toBe(true)
  })
})

describe('ReflectionSchema', () => {
  it('accepts valid reflection with mood 1-5', () => {
    const valid = {
      date: '2026-06-28',
      mood: 4 as const,
      gratitude: 'Something',
      wins: 'A win',
      lessons: 'A lesson',
      didMakeFutureProud: true,
    }
    expect(ReflectionSchema.safeParse(valid).success).toBe(true)
  })

  it('requires gratitude, wins, and lessons', () => {
    const invalid = {
      date: '2026-06-28',
      mood: 3 as const,
      gratitude: '',
      wins: '',
      lessons: '',
      didMakeFutureProud: false,
    }
    expect(ReflectionSchema.safeParse(invalid).success).toBe(false)
  })
})
