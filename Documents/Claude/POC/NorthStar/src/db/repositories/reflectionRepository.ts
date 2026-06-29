import { db } from '../dexie'
import type { Reflection } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const reflectionRepository = {
  async getByDate(date: string): Promise<Reflection | undefined> {
    return db.reflections.where('date').equals(date).first()
  },

  async getRecent(days: number): Promise<Reflection[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return db.reflections
      .where('date')
      .aboveOrEqual(cutoffStr)
      .toArray()
      .then(items => items.sort((a, b) => b.date.localeCompare(a.date)))
  },

  async save(data: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reflection> {
    const reflection: Reflection = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.reflections.add(reflection)
    return reflection
  },

  async update(id: string, data: Partial<Reflection>): Promise<void> {
    await db.reflections.update(id, { ...data, updatedAt: now() })
  },
}
