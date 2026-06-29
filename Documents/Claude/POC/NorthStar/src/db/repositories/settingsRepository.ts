import { db } from '../dexie'
import type { AppSettings, SecuritySettings } from '../schema'

const SETTINGS_ID = 'singleton'
const SECURITY_ID = 'singleton'
const now = () => new Date().toISOString()

const DEFAULT_APP_SETTINGS: AppSettings = {
  id: SETTINGS_ID,
  darkMode: true,
  lifeTimelineEnabled: false,
  autoLockMinutes: 5,
  createdAt: now(),
  updatedAt: now(),
}

export const settingsRepository = {
  async getApp(): Promise<AppSettings> {
    const settings = await db.appSettings.get(SETTINGS_ID)
    if (!settings) {
      const defaults: AppSettings = { ...DEFAULT_APP_SETTINGS, createdAt: now(), updatedAt: now() }
      await db.appSettings.put(defaults)
      return defaults
    }
    return settings
  },

  async saveApp(data: Partial<AppSettings>): Promise<void> {
    const existing = await db.appSettings.get(SETTINGS_ID)
    if (existing) {
      await db.appSettings.update(SETTINGS_ID, { ...data, updatedAt: now() })
    } else {
      const settings: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        ...data,
        id: SETTINGS_ID,
        createdAt: now(),
        updatedAt: now(),
      }
      await db.appSettings.put(settings)
    }
  },

  async getSecurity(): Promise<SecuritySettings | undefined> {
    return db.securitySettings.get(SECURITY_ID)
  },

  async saveSecurity(data: Omit<SecuritySettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const security: SecuritySettings = {
      id: SECURITY_ID,
      ...data,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.securitySettings.put(security)
  },

  async updateSecurity(data: Partial<SecuritySettings>): Promise<void> {
    await db.securitySettings.update(SECURITY_ID, { ...data, updatedAt: now() })
  },
}
