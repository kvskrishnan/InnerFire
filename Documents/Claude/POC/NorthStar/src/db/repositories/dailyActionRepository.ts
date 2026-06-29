import { db } from '../dexie'
import type { DailyAction } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().split('T')[0]

export const dailyActionRepository = {
  async getTodayForGoal(goalId: string): Promise<DailyAction | undefined> {
    const all = await db.dailyActions.where('date').equals(today()).toArray()
    return all.find(a => a.goalId === goalId)
  },

  async markComplete(goalId: string, title: string): Promise<void> {
    const existing = await dailyActionRepository.getTodayForGoal(goalId)
    if (existing) {
      await db.dailyActions.update(existing.id, { completed: true, completedAt: now() })
    } else {
      await db.dailyActions.add({
        id: uid(), goalId, title, date: today(),
        completed: true, completedAt: now(), createdAt: now(),
      })
    }
  },

  async markNotYet(goalId: string, title: string): Promise<void> {
    const existing = await dailyActionRepository.getTodayForGoal(goalId)
    if (!existing) {
      await db.dailyActions.add({
        id: uid(), goalId, title, date: today(),
        completed: false, createdAt: now(),
      })
    }
  },

  async getTodayAll(): Promise<DailyAction[]> {
    return db.dailyActions.where('date').equals(today()).toArray()
  },

  async getByDateRange(startDate: string, endDate: string): Promise<DailyAction[]> {
    const all = await db.dailyActions.toArray()
    return all.filter(a => a.date >= startDate && a.date <= endDate)
  },

  async getStreak(goalId: string): Promise<number> {
    let streak = 0
    let offset = 0
    while (true) {
      const d = new Date()
      d.setDate(d.getDate() - offset)
      const dateStr = d.toISOString().split('T')[0]
      const all = await db.dailyActions.where('date').equals(dateStr).toArray()
      const action = all.find(a => a.goalId === goalId && a.completed)
      if (!action) break
      streak++
      offset++
    }
    return streak
  },
}
