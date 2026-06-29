import Dexie, { type Table } from 'dexie'
import type {
  UserProfile,
  OnboardingProgress,
  IdentityStatement,
  LifePillar,
  Goal,
  Routine,
  DailyAction,
  Reflection,
  JournalEntry,
  MotivationAsset,
  FutureLetter,
  NotificationSchedule,
  RitualCompletion,
  AppSettings,
  SecuritySettings,
} from './schema'

export class InnerFireDatabase extends Dexie {
  userProfile!: Table<UserProfile>
  onboardingProgress!: Table<OnboardingProgress>
  identityStatements!: Table<IdentityStatement>
  lifePillars!: Table<LifePillar>
  goals!: Table<Goal>
  routines!: Table<Routine>
  dailyActions!: Table<DailyAction>
  reflections!: Table<Reflection>
  journalEntries!: Table<JournalEntry>
  motivationAssets!: Table<MotivationAsset>
  futureLetters!: Table<FutureLetter>
  notificationSchedules!: Table<NotificationSchedule>
  ritualCompletions!: Table<RitualCompletion>
  appSettings!: Table<AppSettings>
  securitySettings!: Table<SecuritySettings>

  constructor() {
    super('InnerFireDB')
    this.version(1).stores({
      userProfile: 'id, createdAt',
      onboardingProgress: 'id',
      identityStatements: 'id, pillarId, sortOrder, archivedAt, createdAt',
      lifePillars: 'id, sortOrder, isDefault',
      goals: 'id, pillarId, identityStatementId, status, sortOrder, archivedAt, createdAt',
      routines: 'id, goalId, createdAt',
      dailyActions: 'id, routineId, goalId, date, completed, createdAt',
      reflections: 'id, date, mood, createdAt',
      journalEntries: 'id, date, mood, pillarId, goalId, createdAt',
      motivationAssets: 'id, type, category, isFavorite, createdAt',
      futureLetters: 'id, deliveryDate, unlockedAt, createdAt',
      notificationSchedules: 'id, type, enabled',
      ritualCompletions: 'id, date, type',
      appSettings: 'id',
      securitySettings: 'id',
    })
  }
}

export const db = new InnerFireDatabase()
