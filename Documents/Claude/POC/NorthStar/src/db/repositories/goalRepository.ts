import { db } from '../dexie'
import type { Goal } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const goalRepository = {
  async getAll(): Promise<Goal[]> {
    const all = await db.goals.toArray()
    return all
      .filter(g => !g.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async getById(id: string): Promise<Goal | undefined> {
    return db.goals.get(id)
  },

  async save(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    const goal: Goal = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.goals.add(goal)
    return goal
  },

  async update(id: string, data: Partial<Goal>): Promise<void> {
    await db.goals.update(id, { ...data, updatedAt: now() })
  },

  async archive(id: string): Promise<void> {
    await db.goals.update(id, { archivedAt: now(), updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.goals.delete(id)
  },

  async getByPillar(pillarId: string): Promise<Goal[]> {
    const all = await db.goals.where('pillarId').equals(pillarId).toArray()
    return all
      .filter(g => !g.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },
}
