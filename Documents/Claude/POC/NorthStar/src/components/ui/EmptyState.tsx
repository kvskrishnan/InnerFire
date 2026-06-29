import GoldButton from './GoldButton'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <p className="text-[#6b6880] text-sm">{message}</p>
      {actionLabel && onAction && (
        <GoldButton onClick={onAction}>{actionLabel}</GoldButton>
      )}
    </div>
  )
}
