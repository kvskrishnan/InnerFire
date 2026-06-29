import { db } from '../dexie'
import type { FutureLetter } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().split('T')[0]

export const letterRepository = {
  async getAll(): Promise<FutureLetter[]> {
    return db.futureLetters.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<FutureLetter | undefined> {
    return db.futureLetters.get(id)
  },

  async getDue(): Promise<FutureLetter[]> {
    const todayStr = today()
    return db.futureLetters
      .where('deliveryDate')
      .belowOrEqual(todayStr)
      .toArray()
      .then(letters => letters.filter(l => !l.unlockedAt))
  },

  async save(data: Omit<FutureLetter, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureLetter> {
    const letter: FutureLetter = {
      id: uid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.futureLetters.add(letter)
    return letter
  },

  async update(id: string, data: Partial<FutureLetter>): Promise<void> {
    await db.futureLetters.update(id, { ...data, updatedAt: now() })
  },

  async delete(id: string): Promise<void> {
    await db.futureLetters.delete(id)
  },

  async unlock(id: string): Promise<void> {
    await db.futureLetters.update(id, { unlockedAt: now(), updatedAt: now() })
  },
}
