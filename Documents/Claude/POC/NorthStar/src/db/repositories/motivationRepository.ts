import { db } from '../dexie'
import type { MotivationAsset } from '../schema'

const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

export const motivationRepository = {
  async getAll(): Promise<MotivationAsset[]> {
    return db.motivationAssets.orderBy('createdAt').reverse().toArray()
  },

  async getFavorites(): Promise<MotivationAsset[]> {
    return db.motivationAssets
      .where('isFavorite')
      .equals(1)
      .toArray()
      .then(items => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async getByCategory(category: string): Promise<MotivationAsset[]> {
    return db.motivationAssets
      .where('category')
      .equals(category)
      .toArray()
      .then(items => items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },

  async save(data: Omit<MotivationAsset, 'id' | 'createdAt'>): Promise<MotivationAsset> {
    const asset: MotivationAsset = {
      id: uid(),
      ...data,
      createdAt: now(),
    }
    await db.motivationAssets.add(asset)
    return asset
  },

  async delete(id: string): Promise<void> {
    await db.motivationAssets.delete(id)
  },

  async toggleFavorite(id: string): Promise<void> {
    const asset = await db.motivationAssets.get(id)
    if (asset) {
      await db.motivationAssets.update(id, { isFavorite: !asset.isFavorite })
    }
  },
}
