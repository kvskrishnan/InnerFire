import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Smartphone, Zap, Heart } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'

const pillars = [
  {
    icon: Zap,
    title: 'Not a habit tracker',
    body: 'Most apps remind you what to do. InnerFire reminds you who you are. There is a difference — and that difference is everything.',
  },
  {
    icon: Heart,
    title: 'Your WHY is the fuel',
    body: 'Life gets busy. Days blur. Slowly, without noticing, you forget not just your goals — but the reason you set them. That reason is what InnerFire protects.',
  },
  {
    icon: Smartphone,
    title: 'A flash card for your soul',
    body: 'Every notification is a spark. Tap it and you see your goal, your WHY, your identity — not a checkbox, but a mirror. That is what reignites the spirit.',
  },
  {
    icon: Shield,
    title: '100% offline. Always.',
    body: 'Your goals, your WHY, your identity — locked inside your device. No server. No account. No company storing your dreams in a database somewhere. Only you can see it.',
  },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-28 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 pt-12 pb-6">
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full bg-[#1a1a2e] border border-[#2a2a3e] flex items-center justify-center text-[#6b6880] hover:text-[#f0ede8] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-[#f0ede8]">About InnerFire</h1>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="text-6xl mb-4"
          >
            🔥
          </motion.div>
          <h2 className="text-2xl font-bold text-[#f0ede8] mb-3">InnerFire</h2>
          <p className="text-[#c9a96e] text-sm italic leading-relaxed">
            "Don't track your habits.<br />Become the person you were meant to be."
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 mb-6"
        >
          <p className="text-[#f0ede8] text-sm leading-relaxed">
            InnerFire was built for one reason — because we don't fail our goals due to laziness.
            We fail them because we forget <span className="text-[#c9a96e] font-medium">why</span> they mattered in the first place.
          </p>
          <p className="text-[#6b6880] text-sm leading-relaxed mt-3">
            Life gets busy. Days blur into weeks. And slowly, without even noticing, the fire that once made you say "I want to change my life" — quietly goes out.
          </p>
          <p className="text-[#f0ede8] text-sm leading-relaxed mt-3">
            InnerFire exists to reignite that spark. Every single day.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="space-y-3 mb-8">
          {pillars.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 flex gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-[#c9a96e]" />
              </div>
              <div>
                <p className="text-[#f0ede8] text-sm font-semibold mb-1">{title}</p>
                <p className="text-[#6b6880] text-xs leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Privacy badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-[#0f0f1a] border border-[#c9a96e]/30 rounded-2xl p-5 mb-6 text-center"
        >
          <p className="text-[#c9a96e] text-xs tracking-widest uppercase mb-2">Privacy Promise</p>
          <p className="text-[#f0ede8] text-sm font-medium mb-1">Your data never leaves your phone</p>
          <p className="text-[#6b6880] text-xs leading-relaxed">
            No server. No account. No subscription. No tracking.{'\n'}
            Delete the app and it's gone forever.{'\n'}
            That's how private it is.
          </p>
        </motion.div>

        {/* Version */}
        <div className="text-center">
          <p className="text-[#6b6880] text-xs">InnerFire v1.0.0</p>
          <p className="text-[#6b6880] text-xs mt-1">Built with ❤️ for intentional living</p>
        </div>

      </div>
      <BottomNav />
    </div>
  )
}
