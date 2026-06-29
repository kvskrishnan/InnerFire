import { ReactNode } from 'react'

interface GoldButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export default function GoldButton({
  onClick,
  disabled,
  loading,
  children,
  fullWidth,
  type = 'button',
}: GoldButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={`bg-[#c9a96e] text-[#0f0f1a] font-semibold rounded-2xl py-4 text-base tracking-wide hover:bg-[#d4b87e] transition-colors active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f1a] ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {loading ? '...' : children}
    </button>
  )
}
