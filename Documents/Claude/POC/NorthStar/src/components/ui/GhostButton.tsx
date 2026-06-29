import { ReactNode } from 'react'

interface GhostButtonProps {
  onClick?: () => void
  children: ReactNode
  fullWidth?: boolean
}

export default function GhostButton({ onClick, children, fullWidth }: GhostButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-[#1a1a2e] border border-[#2a2a3e] text-[#f0ede8] font-medium rounded-2xl py-4 text-base hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors active:scale-95 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  )
}
