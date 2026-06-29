function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const dateUtils = {
  today(): string {
    return toDateStr(new Date())
  },

  now(): string {
    return new Date().toISOString()
  },

  format(date: string, pattern: 'short' | 'long' | 'relative' = 'short'): string {
    const d = new Date(date)

    if (pattern === 'relative') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const target = new Date(date)
      target.setHours(0, 0, 0, 0)
      const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diff === 0) return 'Today'
      if (diff === 1) return 'Tomorrow'
      if (diff === -1) return 'Yesterday'
      if (diff > 1 && diff < 7) return `In ${diff} days`
      if (diff < -1 && diff > -7) return `${Math.abs(diff)} days ago`
    }

    if (pattern === 'long') {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }

    // short
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  },

  isToday(date: string): boolean {
    return date.slice(0, 10) === toDateStr(new Date())
  },

  isPast(date: string): boolean {
    return new Date(date) < new Date()
  },

  isFuture(date: string): boolean {
    return new Date(date) > new Date()
  },

  daysBetween(a: string, b: string): number {
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
  },

  addDays(date: string, days: number): string {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return toDateStr(d)
  },

  getWeekDates(date: string): string[] {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((day + 6) % 7)) // shift to Monday
    return Array.from({ length: 7 }, (_, i) => {
      const curr = new Date(monday)
      curr.setDate(monday.getDate() + i)
      return toDateStr(curr)
    })
  },
}
