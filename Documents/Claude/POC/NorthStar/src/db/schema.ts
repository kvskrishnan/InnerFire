export interface UserProfile {
  id: string
  name: string
  photoBlob?: Blob
  birthDate?: string
  lifespan?: number
  mission: string
  vision: string
  lifePurpose: string
  personalWhy: string
  createdAt: string
  updatedAt: string
}

export interface OnboardingProgress {
  id: string
  currentStep: number
  totalSteps: number
  completed: boolean
  skippedAt?: string
  data: Record<string, unknown>
}

export interface IdentityStatement {
  id: string
  text: string
  pillarId?: string
  archivedAt?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface LifePillar {
  id: string
  name: string
  icon?: string
  color: string
  sortOrder: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  title: string
  pillarId: string
  why: string
  identityStatementId?: string
  targetDate?: string
  status: 'active' | 'completed' | 'paused'
  sortOrder: number
  createdAt: string
  updatedAt: string
  archivedAt?: string
  reminderEnabled?: boolean
  reminderTime?: string
}

export interface Routine {
  id: string
  goalId?: string
  title: string
  frequency: 'daily' | 'weekly' | 'custom'
  time?: string
  createdAt: string
  updatedAt: string
}

export interface DailyAction {
  id: string
  routineId?: string
  goalId?: string
  title: string
  date: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

export interface Reflection {
  id: string
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  gratitude: string
  wins: string
  lessons: string
  journalText?: string
  photoBlob?: Blob
  didMakeFutureProud: boolean
  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  date: string
  text: string
  mood?: 1 | 2 | 3 | 4 | 5
  tags?: string[]
  pillarId?: string
  goalId?: string
  createdAt: string
  updatedAt: string
}

export interface MotivationAsset {
  id: string
  type: 'photo' | 'video' | 'audio' | 'quote'
  blob?: Blob
  text?: string
  category: string
  isFavorite: boolean
  createdAt: string
}

export interface FutureLetter {
  id: string
  title: string
  body: string
  deliveryDate: string
  unlockedAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationSchedule {
  id: string
  type: 'morning' | 'evening' | 'custom'
  time: string
  enabled: boolean
  message?: string
  createdAt: string
  updatedAt: string
}

export interface RitualCompletion {
  id: string
  date: string
  type: 'morning' | 'night'
  completedAt?: string
  skipped: boolean
}

export interface AppSettings {
  id: string
  darkMode: boolean
  lifeTimelineEnabled: boolean
  autoLockMinutes: number
  createdAt: string
  updatedAt: string
}

export interface SecuritySettings {
  id: string
  pinHash: string
  pinSalt: string
  biometricEnabled: boolean
  createdAt: string
  updatedAt: string
}
