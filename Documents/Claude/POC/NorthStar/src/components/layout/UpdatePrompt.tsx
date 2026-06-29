import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // vite-plugin-pwa fires this event when a new SW is waiting
    const handler = () => setShowUpdate(true)
    document.addEventListener('swUpdated', handler)
    return () => document.removeEventListener('swUpdated', handler)
  }, [])

  function reload() {
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-[#1a1a2e] border border-[#c9a96e] rounded-2xl p-4 flex items-center justify-between shadow-xl"
        >
          <div>
            <p className="text-[#f0ede8] text-sm font-semibold">Update available</p>
            <p className="text-[#6b6880] text-xs">A new version of InnerFire is ready.</p>
          </div>
          <button
            onClick={reload}
            className="bg-[#c9a96e] text-[#0f0f1a] text-sm font-bold px-4 py-2 rounded-xl ml-4 flex-shrink-0"
          >
            Update
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
