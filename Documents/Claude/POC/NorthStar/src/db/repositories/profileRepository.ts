import { db } from '../dexie'
import type { UserProfile } from '../schema'

const PROFILE_ID = 'singleton'
const now = () => new Date().toISOString()

export const profileRepository = {
  async get(): Promise<UserProfile | undefined> {
    return db.userProfile.get(PROFILE_ID)
  },

  async save(data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const profile: UserProfile = {
      id: PROFILE_ID,
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.userProfile.put(profile)
    return profile
  },

  async update(data: Partial<UserProfile>): Promise<void> {
    await db.userProfile.update(PROFILE_ID, { ...data, updatedAt: now() })
  },
}
