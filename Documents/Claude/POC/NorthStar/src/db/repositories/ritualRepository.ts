import { db } from '../dexie'
import type { RitualCompletion } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().split('T')[0]

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

export const ritualRepository = {
  async getCompletionByDate(date: string, type: 'morning' | 'night'): Promise<RitualCompletion | undefined> {
    return db.ritualCompletions
      .where('[date+type]')
      .equals([date, type])
      .first()
      .catch(() =>
        db.ritualCompletions
          .filter(r => r.date === date && r.type === type)
          .first()
      )
  },

  async markComplete(date: string, type: 'morning' | 'night'): Promise<void> {
    const existing = await ritualRepository.getCompletionByDate(date, type)
    if (existing) {
      await db.ritualCompletions.update(existing.id, { skipped: false, completedAt: now() })
    } else {
      const completion: RitualCompletion = {
        id: uid(),
        date,
        type,
        completedAt: now(),
        skipped: false,
      }
      await db.ritualCompletions.add(completion)
    }
  },

  async markSkipped(date: string, type: 'morning' | 'night'): Promise<void> {
    const existing = await ritualRepository.getCompletionByDate(date, type)
    if (existing) {
      await db.ritualCompletions.update(existing.id, { skipped: true, completedAt: undefined })
    } else {
      const completion: RitualCompletion = {
        id: uid(),
        date,
        type,
        skipped: true,
      }
      await db.ritualCompletions.add(completion)
    }
  },

  async getStreak(type: 'morning' | 'night'): Promise<number> {
    let streak = 0
    let dayOffset = 0
    while (true) {
      const date = dateOffset(dayOffset)
      const completion = await ritualRepository.getCompletionByDate(date, type)
      if (!completion || completion.skipped) break
      streak++
      dayOffset++
    }
    return streak
  },
}
