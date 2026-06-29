import { BottomNav } from '@/components/layout/BottomNav'
export default function Actions() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8] flex flex-col items-center justify-center p-6">
      <p className="text-[#6b6880] text-sm tracking-widest uppercase mb-2">InnerFire</p>
      <h1 className="text-2xl font-semibold text-[#f0ede8] mb-1">Daily Actions</h1>
      <p className="text-[#6b6880] text-sm">Coming in Phase 4</p>
      <BottomNav />
    </div>
  )
}
