import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/db/dexie'
import { clearAllData } from '@/seed/sampleData'
import GoldButton from '@/components/ui/GoldButton'
import GhostButton from '@/components/ui/GhostButton'
import { BottomNav } from '@/components/layout/BottomNav'

export default function DataManagement() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function clearMessages() {
    setSuccess(null)
    setError(null)
  }

  async function handleExport() {
    clearMessages()
    setIsExporting(true)
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        userProfile: await db.userProfile.toArray(),
        onboardingProgress: await db.onboardingProgress.toArray(),
        identityStatements: await db.identityStatements.toArray(),
        lifePillars: await db.lifePillars.toArray(),
        goals: await db.goals.toArray(),
        routines: await db.routines.toArray(),
        dailyActions: await db.dailyActions.toArray(),
        reflections: await db.reflections.toArray(),
        journalEntries: await db.journalEntries.toArray(),
        motivationAssets: await db.motivationAssets.toArray(),
        futureLetters: await db.futureLetters.toArray(),
        notificationSchedules: await db.notificationSchedules.toArray(),
        ritualCompletions: await db.ritualCompletions.toArray(),
        appSettings: await db.appSettings.toArray(),
        // Note: securitySettings excluded for security
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `northstar-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setSuccess('✓ Data exported successfully')
    } catch (e) {
      setError('Export failed. Please try again.')
      console.error(e)
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImport(file: File) {
    clearMessages()
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.version || !data.userProfile) {
        setError('This does not appear to be a valid NorthStar export file.')
        setIsImporting(false)
        return
      }

      await clearAllData()

      if (data.userProfile?.length) await db.userProfile.bulkPut(data.userProfile)
      if (data.identityStatements?.length) await db.identityStatements.bulkPut(data.identityStatements)
      if (data.lifePillars?.length) await db.lifePillars.bulkPut(data.lifePillars)
      if (data.goals?.length) await db.goals.bulkPut(data.goals)
      if (data.reflections?.length) await db.reflections.bulkPut(data.reflections)
      if (data.journalEntries?.length) await db.journalEntries.bulkPut(data.journalEntries)
      if (data.motivationAssets?.length) await db.motivationAssets.bulkPut(data.motivationAssets)
      if (data.futureLetters?.length) await db.futureLetters.bulkPut(data.futureLetters)
      if (data.notificationSchedules?.length) await db.notificationSchedules.bulkPut(data.notificationSchedules)
      if (data.ritualCompletions?.length) await db.ritualCompletions.bulkPut(data.ritualCompletions)
      if (data.appSettings?.length) await db.appSettings.bulkPut(data.appSettings)
      if (data.onboardingProgress?.length) await db.onboardingProgress.bulkPut(data.onboardingProgress)

      setSuccess('Data imported successfully. Reloading...')
      setTimeout(() => window.location.reload(), 1500)
    } catch (e) {
      setError('Import failed. The file may be corrupted or invalid.')
      console.error(e)
      setIsImporting(false)
    }
  }

  async function handleDeleteAll() {
    setIsDeleting(true)
    clearMessages()
    try {
      await clearAllData()
      navigate('/')
    } catch (e) {
      setError('Delete failed. Please try again.')
      console.error(e)
      setIsDeleting(false)
    }
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

        <h1 className="text-2xl font-semibold text-[#f0ede8] mb-1">Your Data</h1>
        <p className="text-[#6b6880] text-sm mb-6">Everything lives on this device. You own it.</p>

        {/* Status banners */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/30 text-green-400 rounded-xl p-3 mb-4 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* EXPORT */}
        <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">Export</p>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-6">
          <p className="text-[#f0ede8] text-sm mb-4 leading-relaxed">
            Export all your NorthStar data as a JSON file.
            You can import it later to restore your data.
          </p>
          <GoldButton onClick={handleExport} loading={isExporting} fullWidth>
            Download My Data
          </GoldButton>
        </div>

        {/* IMPORT */}
        <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">Import</p>
        <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-4 mb-6">
          <p className="text-[#f0ede8] text-sm mb-4 leading-relaxed">
            <span className="text-yellow-400">⚠</span> Importing will replace all current data.
            Make sure to export first if you want to keep your current data.
          </p>
          <GhostButton
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            {isImporting ? 'Importing...' : 'Import from File'}
          </GhostButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
        </div>

        {/* DANGER ZONE */}
        <p className="text-[#6b6880] text-xs tracking-widest uppercase mb-3">Danger Zone</p>
        <div className="bg-[#1a1a2e] border border-red-900/40 rounded-2xl p-4 mb-6">
          <p className="text-[#f0ede8] font-medium mb-2">Delete all data</p>
          <p className="text-[#6b6880] text-sm mb-4 leading-relaxed">
            This will permanently erase everything in NorthStar.
            Your journal, goals, reflections — everything.
            This cannot be undone.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-transparent border border-red-500 text-red-400 font-medium rounded-2xl py-3 px-6 hover:bg-red-500/10 transition-colors w-full"
            >
              Delete All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-medium text-center">Are you absolutely sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white font-medium rounded-2xl py-3 hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 bg-transparent border border-[#2a2a3e] text-[#f0ede8] font-medium rounded-2xl py-3 hover:border-[#c9a96e] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
