import { z } from 'zod'

export const UserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mission: z.string().min(10, 'Mission must be meaningful (at least 10 characters)'),
  vision: z.string().min(10, 'Vision must be meaningful'),
  lifePurpose: z.string().min(10, 'Life purpose must be meaningful'),
  personalWhy: z.string().min(10, 'Your WHY must be meaningful'),
  birthDate: z.string().optional(),
  lifespan: z.number().min(50).max(120).optional(),
})

export const IdentityStatementSchema = z.object({
  text: z.string().min(5, 'Identity statement must be at least 5 characters').max(200),
  pillarId: z.string().optional(),
})

export const GoalSchema = z.object({
  title: z.string().min(3, 'Goal title is required'),
  pillarId: z.string().min(1, 'Please select a life pillar'),
  why: z.string().min(10, 'Your WHY is required — it must be meaningful (at least 10 characters)'),
  identityStatementId: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
})

export const ReflectionSchema = z.object({
  date: z.string(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  gratitude: z.string().min(1, 'Please share one thing you are grateful for'),
  wins: z.string().min(1, 'Please share one win from today'),
  lessons: z.string().min(1, 'Please share one lesson from today'),
  journalText: z.string().optional(),
  didMakeFutureProud: z.boolean(),
})

export const JournalEntrySchema = z.object({
  date: z.string(),
  text: z.string().min(1, 'Journal entry cannot be empty'),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  tags: z.array(z.string()).optional(),
  pillarId: z.string().optional(),
  goalId: z.string().optional(),
})

export const FutureLetterSchema = z.object({
  title: z.string().min(1, 'Letter title is required'),
  body: z.string().min(10, 'Letter must have content'),
  deliveryDate: z.string().refine(
    (d) => new Date(d) > new Date(),
    'Delivery date must be in the future',
  ),
})

export const LifePillarSchema = z.object({
  name: z.string().min(1, 'Pillar name is required').max(50),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Invalid color'),
})

export const PinSchema = z
  .object({
    pin: z
      .string()
      .length(4, 'PIN must be exactly 4 digits')
      .regex(/^\d{4}$/, 'PIN must be 4 numbers'),
    confirmPin: z.string().length(4),
  })
  .refine((d) => d.pin === d.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  })

export const NotificationScheduleSchema = z.object({
  type: z.enum(['morning', 'evening', 'custom']),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  enabled: z.boolean(),
  message: z.string().optional(),
})

// Inferred types
export type UserProfileFormData = z.infer<typeof UserProfileSchema>
export type GoalFormData = z.infer<typeof GoalSchema>
export type ReflectionFormData = z.infer<typeof ReflectionSchema>
export type JournalEntryFormData = z.infer<typeof JournalEntrySchema>
export type FutureLetterFormData = z.infer<typeof FutureLetterSchema>
export type PinFormData = z.infer<typeof PinSchema>
export type IdentityStatementFormData = z.infer<typeof IdentityStatementSchema>
export type NotificationScheduleFormData = z.infer<typeof NotificationScheduleSchema>
