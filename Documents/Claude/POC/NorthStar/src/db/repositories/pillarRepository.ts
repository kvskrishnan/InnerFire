import { db } from '../dexie'
import type { LifePillar } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

const DEFAULT_PILLARS: Omit<LifePillar, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Health', color: '#ef4444', sortOrder: 0, isDefault: true },
  { name: 'Mind', color: '#8b5cf6', sortOrder: 1, isDefault: true },
  { name: 'Career', color: '#3b82f6', sortOrder: 2, isDefault: true },
  { name: 'Wealth', color: '#f59e0b', sortOrder: 3, isDefault: true },
  { name: 'Relationships', color: '#ec4899', sortOrder: 4, isDefault: true },
  { name: 'Spirituality', color: '#10b981', sortOrder: 5, isDefault: true },
  { name: 'Personal Growth', color: '#6366f1', sortOrder: 6, isDefault: true },
  { name: 'Contribution', color: '#14b8a6', sortOrder: 7, isDefault: true },
]

export const pillarRepository = {
  async getAll(): Promise<LifePillar[]> {
    return db.lifePillars
      .orderBy('sortOrder')
      .toArray()
  },

  async save(data: Omit<LifePillar, 'id' | 'createdAt' | 'updatedAt'>): Promise<LifePillar> {
    const pillar: LifePillar = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.lifePillars.add(pillar)
    return pillar
  },

  async update(id: string, data: Partial<LifePillar>): Promise<void> {
    await db.lifePillars.update(id, { ...data, updatedAt: now() })
  },

  async reorder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) => db.lifePillars.update(id, { sortOrder: index, updatedAt: now() }))
    )
  },

  async seedDefaults(): Promise<void> {
    const existing = await db.lifePillars.where('isDefault').equals(1).count()
    if (existing > 0) return
    const pillars: LifePillar[] = DEFAULT_PILLARS.map(p => ({
      id: uid(),
      ...p,
      createdAt: now(),
      updatedAt: now(),
    }))
    await db.lifePillars.bulkAdd(pillars)
  },
}
