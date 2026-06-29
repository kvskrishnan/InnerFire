import { useNavigate } from 'react-router-dom'

export function EmergencyFab() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/emergency')}
      title="Emergency Mode"
      className="fixed bottom-20 right-4 w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center shadow-lg z-50 text-white text-xl"
    >
      ⚡
    </button>
  )
}
