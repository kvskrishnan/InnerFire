import { useState, useEffect } from 'react'
import {
  profileRepository,
  identityRepository,
  goalRepository,
  motivationRepository,
  ritualRepository,
} from '@/db/repositories'
import type { UserProfile, IdentityStatement, Goal } from '@/db/schema'

export function useVisionData() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [identityStatements, setIdentityStatements] = useState<IdentityStatement[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [quote, setQuote] = useState<string>('')
  const [morningStreak, setMorningStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, identity, g, assets, streak] = await Promise.all([
        profileRepository.get().catch(() => undefined),
        identityRepository.getAll().catch(() => [] as IdentityStatement[]),
        goalRepository.getAll().catch(() => [] as Goal[]),
        motivationRepository.getFavorites().catch(() => []),
        ritualRepository.getStreak('morning').catch(() => 0),
      ])
      setProfile(p ?? null)
      setIdentityStatements(identity)
      setGoals(g.filter(g => g.status === 'active'))
      const quotes = assets.filter(a => a.type === 'quote' && a.text)
      setQuote(
        quotes.length > 0
          ? quotes[Math.floor(Math.random() * quotes.length)].text!
          : 'Every decision shapes Future You.'
      )
      setMorningStreak(streak)
      setLoading(false)
    }
    load()
  }, [])

  return { profile, identityStatements, goals, quote, morningStreak, loading }
}
