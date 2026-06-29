import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Target, BookOpen, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart2, label: 'Report', path: '/weekly-report' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-[#1a1a2e] border-t border-[#2a2a3e] flex justify-around py-3 z-50">
      {navItems.map(({ icon: Icon, label, path }) => {
        const isActive = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a2e] rounded-lg px-2"
          >
            <Icon
              size={20}
              className={isActive ? 'text-[#c9a96e]' : 'text-[#6b6880]'}
            />
            <span
              className={`text-[10px] tracking-wide ${isActive ? 'text-[#c9a96e]' : 'text-[#6b6880]'}`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
