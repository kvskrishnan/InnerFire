import { db } from '@/db/dexie'
import type {
  UserProfile, IdentityStatement, LifePillar, Goal,
  Reflection, JournalEntry, FutureLetter, MotivationAsset,
  AppSettings, OnboardingProgress
} from '@/db/schema'

// Helper
const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const today = () => new Date().toISOString().split('T')[0]
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
const monthsFromNow = (n: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d.toISOString().split('T')[0]
}

// === PERSONA: Alex Chen ===
export const SAMPLE_PROFILE: Omit<UserProfile, 'id'> = {
  name: 'Alex Chen',
  mission: 'To lead with integrity, grow relentlessly, and be fully present for my family and team.',
  vision: 'I am a healthy, disciplined engineering leader who creates meaningful technology and raises confident, kind children.',
  lifePurpose: 'To prove that a man can be both ambitious and deeply present — building a legacy of excellence and love.',
  personalWhy: 'My children will one day look back and see that their father chose growth over comfort, presence over distraction, and purpose over routine.',
  birthDate: '1988-04-12',
  lifespan: 85,
  createdAt: now(),
  updatedAt: now(),
}

export const SAMPLE_PILLARS: Omit<LifePillar, 'id'>[] = [
  { name: 'Health', icon: '💪', color: '#ef4444', sortOrder: 0, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Mind', icon: '🧠', color: '#8b5cf6', sortOrder: 1, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Career', icon: '🚀', color: '#3b82f6', sortOrder: 2, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Wealth', icon: '💰', color: '#f59e0b', sortOrder: 3, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Relationships', icon: '❤️', color: '#ec4899', sortOrder: 4, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Spirituality', icon: '🌿', color: '#10b981', sortOrder: 5, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Personal Growth', icon: '🌱', color: '#6366f1', sortOrder: 6, isDefault: true, createdAt: now(), updatedAt: now() },
  { name: 'Contribution', icon: '🤝', color: '#14b8a6', sortOrder: 7, isDefault: true, createdAt: now(), updatedAt: now() },
]

export const SAMPLE_IDENTITY_STATEMENTS: Omit<IdentityStatement, 'id'>[] = [
  { text: 'I am a disciplined and healthy athlete.', sortOrder: 0, createdAt: now(), updatedAt: now() },
  { text: 'I am an engineering leader who inspires my team.', sortOrder: 1, createdAt: now(), updatedAt: now() },
  { text: 'I am a present and loving father.', sortOrder: 2, createdAt: now(), updatedAt: now() },
  { text: 'I am financially responsible and building lasting wealth.', sortOrder: 3, createdAt: now(), updatedAt: now() },
  { text: 'I am constantly learning and growing every day.', sortOrder: 4, createdAt: now(), updatedAt: now() },
]

// Goals — pillarId will be resolved at seed time using pillar names
export const SAMPLE_GOALS_DATA = [
  {
    title: 'Run a half marathon',
    pillarName: 'Health',
    why: 'I want the energy and physical strength to keep up with my children as they grow, and to model discipline for them. Every training run is a message to my future self.',
    status: 'active' as const,
    sortOrder: 0,
    targetDate: monthsFromNow(4),
  },
  {
    title: 'Lead the platform rewrite to completion',
    pillarName: 'Career',
    why: 'This project defines my leadership legacy at the company. Delivering it well will open the door to the next level and prove I can lead through complexity.',
    status: 'active' as const,
    sortOrder: 0,
    targetDate: monthsFromNow(3),
  },
  {
    title: 'Read 12 books this year',
    pillarName: 'Mind',
    why: 'The leaders I admire most are all voracious readers. My thinking is only as good as the ideas I expose myself to. Reading is non-negotiable growth.',
    status: 'active' as const,
    sortOrder: 0,
    targetDate: monthsFromNow(8),
  },
  {
    title: 'Build a 6-month emergency fund',
    pillarName: 'Wealth',
    why: 'Financial security gives my family options and me peace of mind. I cannot lead well when I am anxious about money. This is about freedom.',
    status: 'active' as const,
    sortOrder: 0,
    targetDate: monthsFromNow(6),
  },
  {
    title: 'Weekly date nights with my wife',
    pillarName: 'Relationships',
    why: 'My marriage is the foundation everything else is built on. If I succeed everywhere else but fail here, I have failed at what matters most.',
    status: 'active' as const,
    sortOrder: 0,
  },
]

export const SAMPLE_REFLECTIONS_DATA = [0, 1, 2, 3, 4, 5, 6].map((daysBack) => ({
  date: daysAgo(daysBack),
  mood: ([4, 3, 5, 4, 2, 4, 5][daysBack] as 1|2|3|4|5),
  gratitude: [
    'My daughter laughed so hard at dinner tonight that I almost cried.',
    'My team shipped a clean PR without me having to chase anyone.',
    'I ran 8km this morning and felt alive.',
    'My wife made time for me even though her week was harder than mine.',
    'I had a quiet hour to read and think.',
    'A former colleague reached out to say my mentorship changed his career.',
    'I woke up healthy and with purpose.',
  ][daysBack],
  wins: [
    'Completed a 5km run before 7am.',
    'Gave clear, kind feedback to a struggling team member.',
    'Finished chapter 3 of Atomic Habits.',
    'Said no to a meeting that didn\'t need me.',
    'Did 20 minutes of meditation.',
    'Cooked dinner for the family.',
    'Reviewed and updated my goals.',
  ][daysBack],
  lessons: [
    'I am more productive when I protect the first 90 minutes of my morning.',
    'People grow faster when feedback is timely and specific.',
    'Rest is not laziness — it is part of the system.',
    'Presence is a skill that must be practised, not assumed.',
    'Saying no is saying yes to something more important.',
    'Small consistent acts matter more than grand gestures.',
    'My WHY keeps me going when motivation fades.',
  ][daysBack],
  didMakeFutureProud: [true, true, true, false, true, true, true][daysBack],
  createdAt: now(),
  updatedAt: now(),
}))

export const SAMPLE_JOURNAL_ENTRIES_DATA = [
  {
    date: daysAgo(1),
    text: 'I have been thinking about the kind of leader I want to be in five years. Not just technically strong, but someone whose team looks back and says he made them better humans, not just better engineers. That is the standard I am holding myself to.',
    mood: 4 as const,
    tags: ['leadership', 'vision', 'career'],
  },
  {
    date: daysAgo(3),
    text: 'Ran 7km today. Did not want to start. Every part of me wanted to stay in bed. But I remembered what I wrote in my WHY — that my children will see what their father chose. Got up. Ran. Came back different.',
    mood: 5 as const,
    tags: ['health', 'discipline', 'running'],
  },
  {
    date: daysAgo(5),
    text: 'Hard day. Project timelines slipped. Team morale is fragile. I felt the pull to blame, to spiral, to catastrophise. Instead I made tea, pulled up my mission statement, and asked: what would the version of me I am becoming do right now? The answer was clear. Lead. Stabilise. Listen.',
    mood: 3 as const,
    tags: ['leadership', 'resilience', 'hard days'],
  },
  {
    date: daysAgo(8),
    text: 'Put the phone down at 6pm and played with my son for two hours. No emails, no Slack. Just Lego and laughter. This is what I am building everything for. I need to remember this feeling on the days when work feels like everything.',
    mood: 5 as const,
    tags: ['family', 'relationships', 'presence'],
  },
  {
    date: daysAgo(12),
    text: 'Started the emergency fund tracking spreadsheet. It is not glamorous. But discipline in the small things creates capacity for the big things. Financial freedom is a form of self-respect.',
    mood: 4 as const,
    tags: ['wealth', 'discipline', 'money'],
  },
]

export const SAMPLE_FUTURE_LETTERS = [
  {
    title: 'To Alex in 12 months',
    body: `Dear Alex,

I am writing this on a Tuesday morning before the kids wake up. I want you to know where we started, so you can fully appreciate where we arrived.

Right now, I am committing to the half marathon. To reading more than I scroll. To being present at dinner. To building the emergency fund month by month. None of this is glamorous. All of it is the point.

I hope by the time you read this, you have run the race. Led the team through the rewrite. Said yes to fewer things and been more fully present for the ones that matter.

But most of all, I hope you are proud. Not because of titles or metrics — but because of who you chose to become, one small decision at a time.

Keep going.

— Alex, ${today()}`,
    deliveryDate: monthsFromNow(12),
  },
  {
    title: 'To Alex in 3 months',
    body: `Dear Alex,

Three months from now I expect you to have run at least 4 long runs, to have had 12 date nights, and to have had one real, vulnerable conversation with someone on your team.

The question is not whether you can do it. The question is whether you will choose to.

You already know the answer.

— Alex, ${today()}`,
    deliveryDate: monthsFromNow(3),
  },
]

export const SAMPLE_MOTIVATION_QUOTES: Omit<MotivationAsset, 'id'>[] = [
  { type: 'quote', text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle', category: 'discipline', isFavorite: true, createdAt: now() },
  { type: 'quote', text: 'The man who moves a mountain begins by carrying away small stones. — Confucius', category: 'persistence', isFavorite: true, createdAt: now() },
  { type: 'quote', text: 'Do not wish it was easier. Wish you were better. — Jim Rohn', category: 'growth', isFavorite: false, createdAt: now() },
  { type: 'quote', text: 'Your life does not get better by chance. It gets better by change. — Jim Rohn', category: 'growth', isFavorite: true, createdAt: now() },
  { type: 'quote', text: 'Identity is destiny. — Tony Robbins', category: 'identity', isFavorite: false, createdAt: now() },
]

// Main seed function
export async function seedSampleData(): Promise<void> {
  await clearAllData()

  // Profile
  await db.userProfile.put({ id: 'singleton', ...SAMPLE_PROFILE })

  // Onboarding marked complete
  await db.onboardingProgress.put({
    id: 'singleton',
    currentStep: 10,
    totalSteps: 10,
    completed: true,
    data: {},
  })

  // App settings
  await db.appSettings.put({
    id: 'singleton',
    darkMode: true,
    lifeTimelineEnabled: false,
    autoLockMinutes: 5,
    createdAt: now(),
    updatedAt: now(),
  })

  // Pillars — seed with IDs so goals can reference them
  const pillarIds: Record<string, string> = {}
  for (const p of SAMPLE_PILLARS) {
    const id = uid()
    pillarIds[p.name] = id
    await db.lifePillars.put({ id, ...p })
  }

  // Identity statements
  for (const stmt of SAMPLE_IDENTITY_STATEMENTS) {
    await db.identityStatements.put({ id: uid(), ...stmt })
  }

  // Goals
  for (const g of SAMPLE_GOALS_DATA) {
    const { pillarName, ...rest } = g
    await db.goals.put({
      id: uid(),
      pillarId: pillarIds[pillarName] ?? '',
      ...rest,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  // Reflections
  for (const r of SAMPLE_REFLECTIONS_DATA) {
    await db.reflections.put({ id: uid(), ...r })
  }

  // Journal entries
  for (const j of SAMPLE_JOURNAL_ENTRIES_DATA) {
    await db.journalEntries.put({ id: uid(), ...j, createdAt: now(), updatedAt: now() })
  }

  // Future letters
  for (const l of SAMPLE_FUTURE_LETTERS) {
    await db.futureLetters.put({ id: uid(), ...l, createdAt: now(), updatedAt: now() })
  }

  // Motivation quotes
  for (const q of SAMPLE_MOTIVATION_QUOTES) {
    await db.motivationAssets.put({ id: uid(), ...q })
  }
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.userProfile.clear(),
    db.onboardingProgress.clear(),
    db.identityStatements.clear(),
    db.lifePillars.clear(),
    db.goals.clear(),
    db.routines.clear(),
    db.dailyActions.clear(),
    db.reflections.clear(),
    db.journalEntries.clear(),
    db.motivationAssets.clear(),
    db.futureLetters.clear(),
    db.notificationSchedules.clear(),
    db.ritualCompletions.clear(),
    db.appSettings.clear(),
    db.securitySettings.clear(),
  ])
}
