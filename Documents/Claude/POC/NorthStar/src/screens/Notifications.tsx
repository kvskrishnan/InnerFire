import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Moon, Info } from 'lucide-react'
import { db } from '@/db/dexie'
import { notificationService } from '@/lib/notifications/notificationService'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import { BottomNav } from '@/components/layout/BottomNav'

interface RitualSchedule {
  time: string
  enabled: boolean
}

export default function Notifications() {
  const navigate = useNavigate()
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    notificationService.getPermissionStatus(),
  )
  const [morning, setMorning] = useState<RitualSchedule>({ time: '07:00', enabled: true })
  const [evening, setEvening] = useState<RitualSchedule>({ time: '21:00', enabled: true })
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  useEffect(() => {
    async function loadSchedules() {
      const schedules = await db.notificationSchedules.toArray()
      const morningSchedule = schedules.find((s) => s.type === 'morning')
      const eveningSchedule = schedules.find((s) => s.type === 'evening')
      if (morningSchedule) {
        setMorning({ time: morningSchedule.time, enabled: morningSchedule.enabled })
      }
      if (eveningSchedule) {
        setEvening({ time: eveningSchedule.time, enabled: eveningSchedule.enabled })
      }
    }
    loadSchedules()
  }, [])

  async function handleRequestPermission() {
    setIsRequestingPermission(true)
    const result = await notificationService.requestPermission()
    setPermissionStatus(result)
    setIsRequestingPermission(false)
  }

  async function handleSave() {
    setSuccess(null)
    setIsSaving(true)
    try {
      await db.notificationSchedules.clear()
      const now = new Date().toISOString()
      await db.notificationSchedules.bulkAdd([
        {
          id: crypto.randomUUID(),
          type: 'morning',
          time: morning.time,
          enabled: morning.enabled,
          message: 'Start your day with intention',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          type: 'evening',
          time: evening.time,
          enabled: evening.enabled,
          message: 'Close your day with gratitude',
          createdAt: now,
          updatedAt: now,
        },
      ])
      setSuccess('✓ Schedules saved')
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTestNotification() {
    await notificationService.showNow('InnerFire', 'Future You is waiting.')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-[#f0ede8]">
      <div className="px-4 pb-24 max-w-lg mx-auto pt-6">
        {/* Header */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-[#6b6880] mb-6 hover:text-[#f0ede8] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Settings</span>
        </button>

        <h1 className="text-2xl font-semibold text-[#f0ede8] mb-1">Ritual Schedules</h1>
        <p className="text-[#6b6880] text-sm mb-6">Your day, shaped with intention.</p>

        {/* Permission status banner */}
        {permissionStatus === 'granted' && (
          <div className="bg-green-900/30 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
            <span>✓ Notifications enabled</span>
          </div>
        )}
        {permissionStatus === 'denied' && (
          <div className="bg-orange-900/30 border border-orange-500/30 text-orange-400 rounded-xl p-3 mb-4 text-sm">
            <p className="font-medium">✗ Notifications blocked</p>
            <p className="text-xs mt-1 text-orange-300">Enable in your browser settings to receive reminders.</p>
          </div>
        )}
        {(permissionStatus === 'default' || permissionStatus === 'unsupported') && (
          <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-3 mb-4">
            <GhostButton onClick={handleRequestPermission} fullWidth>
              {isRequestingPermission ? 'Requesting...' : 'Allow Notifications'}
            </GhostButton>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Morning Ritual */}
        <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">Morning Ritual</p>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Sun size={20} className="text-[#c9a96e] flex-shrink-0" />
              <div>
                <p className="text-[#f0ede8] font-medium">Morning Ritual</p>
                <p className="text-[#6b6880] text-xs mt-0.5">Start your day with intention</p>
              </div>
            </div>
            <button
              onClick={() => setMorning((p) => ({ ...p, enabled: !p.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                morning.enabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  morning.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            <label className="text-[#6b6880] text-xs mb-1 block">Time</label>
            <input
              type="time"
              value={morning.time}
              onChange={(e) => setMorning((p) => ({ ...p, time: e.target.value }))}
              className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl px-3 py-2 text-[#f0ede8] text-sm focus:outline-none focus:border-[#c9a96e] transition-colors"
            />
          </div>
        </div>

        {/* Evening Reflection */}
        <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3 mt-6">Evening Reflection</p>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-[#c9a96e] flex-shrink-0" />
              <div>
                <p className="text-[#f0ede8] font-medium">Evening Reflection</p>
                <p className="text-[#6b6880] text-xs mt-0.5">Close your day with gratitude</p>
              </div>
            </div>
            <button
              onClick={() => setEvening((p) => ({ ...p, enabled: !p.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                evening.enabled ? 'bg-[#c9a96e]' : 'bg-[#2a2a3e]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  evening.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            <label className="text-[#6b6880] text-xs mb-1 block">Time</label>
            <input
              type="time"
              value={evening.time}
              onChange={(e) => setEvening((p) => ({ ...p, time: e.target.value }))}
              className="bg-[#0f0f1a] border border-[#2a2a3e] rounded-xl px-3 py-2 text-[#f0ede8] text-sm focus:outline-none focus:border-[#c9a96e] transition-colors"
            />
          </div>
        </div>

        {/* Save button */}
        <GoldButton onClick={handleSave} loading={isSaving} fullWidth>
          Save Schedules
        </GoldButton>

        {/* How it works */}
        <div className="mt-6 bg-[#1a1a2e] border-l-2 border-[#c9a96e] rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-[#c9a96e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#f0ede8] text-sm font-medium mb-1">How it works</p>
              <p className="text-[#6b6880] text-xs leading-relaxed">
                Reminders are scheduled locally. They work while the app is open. For persistent reminders, install
                InnerFire as an app on your device.
              </p>
            </div>
          </div>
        </div>

        {/* Test notification */}
        <div className="mt-4">
          <GhostButton onClick={handleTestNotification} fullWidth>
            Send test notification
          </GhostButton>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
