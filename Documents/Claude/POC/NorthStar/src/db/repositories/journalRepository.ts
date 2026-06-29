import { db } from '../dexie'
import type { JournalEntry } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const journalRepository = {
  async getAll(): Promise<JournalEntry[]> {
    return db.journalEntries
      .orderBy('createdAt')
      .reverse()
      .toArray()
  },

  async getById(id: string): Promise<JournalEntry | undefined> {
    return db.journalEntries.get(id)
  },

  async save(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.journalEntries.add(entry)
    return entry
  },

  async update(id: string, data: Partial<JournalEntry>): Promise<void> {
    await db.journalEntries.update(id, { ...data, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.journalEntries.delete(id)
  },

  async search(query: string): Promise<JournalEntry[]> {
    const lower = query.toLowerCase()
    return db.journalEntries
      .filter(entry => entry.text.toLowerCase().includes(lower))
      .toArray()
      .then(items => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async getByPillar(pillarId: string): Promise<JournalEntry[]> {
    return db.journalEntries
      .where('pillarId')
      .equals(pillarId)
      .toArray()
      .then(items => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async getByMood(mood: number): Promise<JournalEntry[]> {
    return db.journalEntries
      .where('mood')
      .equals(mood)
      .toArray()
      .then(items => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },
}
