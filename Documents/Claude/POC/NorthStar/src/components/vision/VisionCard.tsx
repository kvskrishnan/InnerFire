import { motion } from 'framer-motion'
import type { UserProfile, IdentityStatement, Goal } from '@/db/schema'

interface VisionCardProps {
  profile: UserProfile | null
  identityStatements: IdentityStatement[]
  goals: Goal[]
  morningStreak?: number
  quote?: string
  mode: 'morning' | 'standalone'
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase()
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface FocusGoal {
  goal: Goal
  label: string       // e.g. "Coming up in 12 min" | "Starting now" | "Today's Focus"
  timeTag?: string    // e.g. "7:00 AM"
}

// Picks the most relevant goal based on current time and reminder schedule.
// If goals have reminder times, finds the next upcoming one.
// Falls back to the first active goal if no reminders are set.
function pickFocusGoal(goals: Goal[]): FocusGoal | null {
  if (goals.length === 0) return null

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const scheduled = goals
    .filter(g => g.reminderEnabled && g.reminderTime)
    .sort((a, b) => (a.reminderTime ?? '').localeCompare(b.reminderTime ?? ''))

  if (scheduled.length === 0) {
    return { goal: goals[0], label: "Today's Focus" }
  }

  // Next upcoming reminder
  const upcoming = scheduled.find(g => (g.reminderTime ?? '') >= currentTime)

  if (upcoming) {
    const [h, m] = (upcoming.reminderTime ?? '00:00').split(':').map(Number)
    const reminderMs = new Date().setHours(h, m, 0, 0)
    const diffMins = Math.round((reminderMs - now.getTime()) / 60_000)
    const hour12 = h % 12 === 0 ? 12 : h % 12
    const ampm = h < 12 ? 'AM' : 'PM'
    const timeTag = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`

    let label: string
    if (diffMins <= 0) label = 'Starting now'
    else if (diffMins === 1) label = 'Coming up in 1 min'
    else if (diffMins < 60) label = `Coming up in ${diffMins} min`
    else label = `Scheduled for ${timeTag}`

    return { goal: upcoming, label, timeTag }
  }

  // All reminders have passed — show the last one of the day
  const last = scheduled[scheduled.length - 1]
  return { goal: last, label: 'Done for today ✓' }
}

export default function VisionCard({
  profile,
  identityStatements,
  goals,
  morningStreak = 0,
  quote,
  mode,
}: VisionCardProps) {
  const firstName = profile?.name?.split(' ')[0] ?? 'Friend'
  const focus = pickFocusGoal(goals)
  const displayQuote = quote ?? 'Every decision shapes Future You.'

  return (
    <motion.div
      className="flex flex-col justify-between px-6 py-12 min-h-screen bg-[#0f0f1a]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top: Date */}
      <motion.p
        className="text-[#6b6880] text-sm tracking-widest uppercase"
        variants={itemVariants}
      >
        {formatDate()}
      </motion.p>

      {/* Middle content */}
      <div className="flex-1 flex flex-col justify-center mt-10 space-y-10">
        {/* Star + Greeting */}
        <motion.div variants={itemVariants}>
          <div className="text-[#c9a96e] text-3xl mb-2">✦</div>
          <h1 className="text-[#f0ede8] text-3xl font-bold">
            {getGreeting()}, {firstName}.
          </h1>
        </motion.div>

        {/* Mission */}
        {profile?.mission && (
          <motion.div variants={itemVariants}>
            <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-2">
              Your Mission
            </p>
            <p className="text-[#f0ede8] text-xl leading-relaxed font-medium">
              {profile.mission}
            </p>
          </motion.div>
        )}

        {/* Identity Statements */}
        {identityStatements.length > 0 && (
          <motion.div variants={itemVariants}>
            <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">
              You Are
            </p>
            <div className="flex flex-wrap gap-2">
              {identityStatements.map((stmt) => (
                <span
                  key={stmt.id}
                  className="border border-[#c9a96e] text-[#c9a96e] text-sm px-3 py-1 rounded-full"
                >
                  {stmt.text}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Time-aware Focus Goal */}
        {focus && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[#6b6880] text-xs tracking-widest uppercase">
                {focus.label}
              </p>
              {focus.timeTag && (
                <span className="text-[10px] text-[#c9a96e] border border-[#c9a96e]/40 rounded-full px-2 py-0.5">
                  {focus.timeTag}
                </span>
              )}
            </div>
            <p className="text-[#f0ede8] text-lg font-semibold">{focus.goal.title}</p>
            {focus.goal.why && (
              <p className="text-[#6b6880] text-sm italic mt-1 leading-relaxed line-clamp-2">
                "{focus.goal.why}"
              </p>
            )}
          </motion.div>
        )}

        {/* Quote */}
        <motion.p
          className="text-[#6b6880] text-sm italic leading-relaxed"
          variants={itemVariants}
        >
          "{displayQuote}"
        </motion.p>
      </div>

      {/* Bottom: Streak */}
      {morningStreak > 0 && (
        <motion.p
          className="text-[#6b6880] text-sm mt-8"
          variants={itemVariants}
        >
          🔥 {morningStreak} {morningStreak === 1 ? 'day' : 'days'} of morning rituals
        </motion.p>
      )}
    </motion.div>
  )
}
