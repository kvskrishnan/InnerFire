import { describe, it, expect } from 'vitest'
import { dateUtils } from '@/lib/dates/dateUtils'

describe('dateUtils', () => {
  it('today returns YYYY-MM-DD format', () => {
    const today = dateUtils.today()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('isToday returns true for today', () => {
    expect(dateUtils.isToday(dateUtils.today())).toBe(true)
  })

  it('isToday returns false for yesterday', () => {
    const yesterday = dateUtils.addDays(dateUtils.today(), -1)
    expect(dateUtils.isToday(yesterday)).toBe(false)
  })

  it('isPast returns true for past dates', () => {
    expect(dateUtils.isPast('2020-01-01')).toBe(true)
  })

  it('isFuture returns true for future dates', () => {
    const future = dateUtils.addDays(dateUtils.today(), 10)
    expect(dateUtils.isFuture(future)).toBe(true)
  })

  it('daysBetween calculates correctly', () => {
    expect(dateUtils.daysBetween('2026-01-01', '2026-01-11')).toBe(10)
  })

  it('addDays adds days correctly', () => {
    expect(dateUtils.addDays('2026-01-01', 5)).toBe('2026-01-06')
  })

  it('getWeekDates returns 7 dates', () => {
    const week = dateUtils.getWeekDates(dateUtils.today())
    expect(week).toHaveLength(7)
    week.forEach(d => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/))
  })
})
