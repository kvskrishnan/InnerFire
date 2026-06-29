import { motion } from 'framer-motion'
import type { Goal, LifePillar, IdentityStatement, DailyAction } from '@/db/schema'

interface GoalFlashCardProps {
  goal: Goal
  pillar?: LifePillar
  identityStatement?: IdentityStatement
  cardIndex: number
  totalCards: number
  todayAction?: DailyAction
  streak: number
  onYes: () => void
  onNotYet: () => void
  onSkip: () => void
}

export default function GoalFlashCard({
  goal,
  pillar,
  identityStatement,
  cardIndex,
  totalCards,
  todayAction,
  streak,
  onYes,
  onNotYet,
  onSkip,
}: GoalFlashCardProps) {
  const progressPct = (cardIndex / totalCards) * 100

  const alreadyDone = !!todayAction

  return (
    <motion.div
      key={goal.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#0f0f1a] flex flex-col"
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-[#1a1a2e] w-full">
        <div
          className="h-full bg-[#c9a96e] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Top chips row */}
      <div className="flex items-center justify-between px-5 pt-4">
        {pillar ? (
          <span
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium"
            style={{
              backgroundColor: pillar.color + '33',
              color: pillar.color,
              borderColor: pillar.color + '66',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: pillar.color }}
            />
            {pillar.name}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[#6b6880] text-xs">
          {cardIndex} of {totalCards}
        </span>
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 flex flex-col justify-center px-5 py-8">
        {/* Goal title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-[#c9a96e] text-sm font-medium mb-5 tracking-wide"
        >
          {goal.title}
        </motion.p>

        {/* WHY block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] tracking-widest uppercase text-[#c9a96e] mb-2">Your Why</p>
          <div className="border-l-4 border-[#c9a96e] bg-[#1a1a2e] p-5 rounded-r-2xl mb-6">
            <p className="text-[#f0ede8] text-lg italic leading-loose">
              "{goal.why || 'No why set yet.'}"
            </p>
          </div>
        </motion.div>

        {/* Identity statement */}
        {identityStatement && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <p className="text-[10px] tracking-widest uppercase text-[#6b6880] mb-1">You Are</p>
            <p className="text-[#c9a96e] text-base italic">"{identityStatement.text}"</p>
          </motion.div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[#c9a96e]/70 text-sm mt-2"
          >
            🔥 {streak}-day streak
          </motion.p>
        )}
      </div>

      {/* Bottom action area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-5 pb-28 pt-4 bg-[#0f0f1a]"
      >
        {alreadyDone ? (
          <div className="space-y-4">
            {todayAction!.completed ? (
              <div className="text-center">
                <p className="text-green-400 font-semibold text-base">✓ You took a step today.</p>
                <p className="text-[#6b6880] text-sm mt-1">Well done.</p>
              </div>
            ) : (
              <p className="text-[#6b6880] text-sm text-center">You marked this as not yet.</p>
            )}
            <button
              onClick={onSkip}
              className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide"
            >
              Next →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onYes}
              className="w-full bg-[#c9a96e] text-[#0f0f1a] font-bold py-4 rounded-2xl text-base tracking-wide"
            >
              Yes, I took a step today →
            </button>
            <div className="flex justify-between px-2">
              <button
                onClick={onNotYet}
                className="text-[#6b6880] text-sm underline underline-offset-2"
              >
                Not yet today
              </button>
              <button
                onClick={onSkip}
                className="text-[#6b6880] text-sm underline underline-offset-2"
              >
                Skip for now →
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
