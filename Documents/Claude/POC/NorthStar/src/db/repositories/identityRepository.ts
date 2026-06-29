import { db } from '../dexie'
import type { IdentityStatement } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const identityRepository = {
  async getAll(): Promise<IdentityStatement[]> {
    const all = await db.identityStatements.toArray()
    return all
      .filter(s => !s.archivedAt)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  async save(text: string, pillarId?: string): Promise<IdentityStatement> {
    const existing = await db.identityStatements.toArray()
    const maxOrder = existing.reduce((max, s) => Math.max(max, s.sortOrder), -1)
    const statement: IdentityStatement = {
      id: uid(),
      text,
      pillarId,
      sortOrder: maxOrder + 1,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.identityStatements.add(statement)
    return statement
  },

  async update(id: string, data: Partial<IdentityStatement>): Promise<void> {
    await db.identityStatements.update(id, { ...data, updatedAt: now() })
  },

  async archive(id: string): Promise<void> {
    await db.identityStatements.update(id, { archivedAt: now(), updatedAt: now() })
  },

  async reorder(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) => db.identityStatements.update(id, { sortOrder: index, updatedAt: now() }))
    )
  },
}
