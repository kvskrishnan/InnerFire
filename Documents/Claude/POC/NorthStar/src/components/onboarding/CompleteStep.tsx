import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAppStore } from '@/stores/appStore'
import { db } from '@/db/dexie'

interface Pillar {
  id: string
  name: string
  icon: string
  color: string
}

interface GoalItem {
  id: string
  title: string
  pillarId: string
  why: string
  reminderEnabled?: boolean
  reminderTime?: string
}

export default function CompleteStep() {
  const navigate = useNavigate()
  const { formData, markComplete } = useOnboardingStore()
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const mission = (formData.mission as string) ?? ''
  const identityStatements = (formData.identityStatements as string[]) ?? []
  const firstIdentity = identityStatements[0] ?? ''

  useEffect(() => {
    let cancelled = false
    const saveAll = async () => {
      if (cancelled) return
      setSaving(true)
      try {
        const now = new Date().toISOString()

        // User profile
        await db.userProfile.put({
          id: 'singleton',
          name: (formData.name as string) ?? 'You',
          mission: (formData.mission as string) ?? '',
          vision: (formData.vision as string) ?? '',
          lifePurpose: (formData.lifePurpose as string) ?? '',
          personalWhy: (formData.personalWhy as string) ?? '',
          createdAt: now,
          updatedAt: now,
        })

        // Clear any existing data from demo/sample mode before saving onboarding data
        await Promise.all([
          db.lifePillars.clear(),
          db.identityStatements.clear(),
          db.goals.clear(),
          db.motivationAssets.clear(),
        ])

        // Pillars
        const pillars = (formData.pillars as Pillar[]) ?? []
        if (pillars.length > 0) {
          await db.lifePillars.bulkPut(
            pillars.map((p, i) => ({
              id: p.id,
              name: p.name,
              icon: p.icon,
              color: p.color,
              sortOrder: i,
              isDefault: true,
              createdAt: now,
              updatedAt: now,
            }))
          )
        }

        // Identity statements — stable IDs so double-invoke (React StrictMode) upserts, not duplicates
        const statements = (formData.identityStatements as string[]) ?? []
        if (statements.length > 0) {
          await db.identityStatements.bulkPut(
            statements.map((text, i) => ({
              id: `onboarding-identity-${i}`,
              text,
              sortOrder: i,
              createdAt: now,
              updatedAt: now,
            }))
          )
        }

        // Goals
        const goals = (formData.goals as GoalItem[]) ?? []
        if (goals.length > 0) {
          await db.goals.bulkPut(
            goals.map((g, i) => ({
              id: g.id,
              title: g.title,
              pillarId: g.pillarId,
              why: g.why,
              status: 'active' as const,
              sortOrder: i,
              reminderEnabled: g.reminderEnabled ?? false,
              reminderTime: g.reminderTime ?? '',
              createdAt: now,
              updatedAt: now,
            }))
          )
        }

        // Quotes / motivation assets
        const quotes = (formData.quotes as string[]) ?? []
        if (quotes.length > 0) {
          await db.motivationAssets.bulkPut(
            quotes.map((text, i) => ({
              id: `onboarding-quote-${i}`,
              type: 'quote' as const,
              text,
              category: 'onboarding',
              isFavorite: false,
              createdAt: now,
            }))
          )
        }

        // Notification schedules
        const notifs = formData.notifications as {
          morningTime: string
          eveningTime: string
          morningEnabled: boolean
          eveningEnabled: boolean
        } | undefined

        if (notifs) {
          await db.notificationSchedules.bulkPut([
            {
              id: 'morning',
              type: 'morning' as const,
              time: notifs.morningTime,
              enabled: notifs.morningEnabled,
              createdAt: now,
              updatedAt: now,
            },
            {
              id: 'evening',
              type: 'evening' as const,
              time: notifs.eveningTime,
              enabled: notifs.eveningEnabled,
              createdAt: now,
              updatedAt: now,
            },
          ])
        }

        // Mark onboarding complete
        await db.onboardingProgress.put({
          id: 'singleton',
          currentStep: 10,
          totalSteps: 10,
          completed: true,
          data: formData,
        })

        markComplete()
        setOnboardingComplete(true)
        setSaved(true)
      } catch (err) {
        console.error('Error saving onboarding data', err)
        setSaved(true) // still allow proceeding
      } finally {
        setSaving(false)
      }
    }

    saveAll()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full"
      >
        {/* Animated star */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-5xl mb-6"
        >
          ✦
        </motion.div>

        <h1 className="text-3xl font-bold text-[#f0ede8] mb-3">
          You're ready.
        </h1>
        <p className="text-[#6b6880] text-sm leading-relaxed mb-8">
          Your InnerFire is set. Every day from here is a step toward Future You.
        </p>

        {/* Mini Vision Card */}
        {(mission || firstIdentity) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a2e] border border-[#c9a96e] rounded-2xl p-5 mb-8 text-left"
          >
            <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-3">Your Vision Card</p>
            {mission && (
              <p className="text-[#f0ede8] text-sm leading-relaxed mb-3 italic">"{mission}"</p>
            )}
            {firstIdentity && (
              <p className="text-[#c9a96e] text-xs">{firstIdentity}</p>
            )}
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/morning')}
          disabled={saving}
          className="w-full py-4 bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-2xl text-base disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Begin My First Day →'}
        </motion.button>
      </motion.div>
    </div>
  )
}
