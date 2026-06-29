export const notificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  },

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('[notificationService] Notifications are not supported in this browser.')
      return 'denied'
    }
    return Notification.requestPermission()
  },

  async showNow(title: string, body: string, icon?: string): Promise<void> {
    if (!this.isSupported()) {
      console.warn('[notificationService] Notifications not supported; skipping showNow.')
      return
    }
    if (Notification.permission !== 'granted') {
      console.warn('[notificationService] Permission not granted; skipping showNow.')
      return
    }
    new Notification(title, { body, icon })
  },

  async schedule(title: string, body: string, time: Date): Promise<void> {
    if (!this.isSupported()) {
      console.warn('[notificationService] Notifications not supported; skipping schedule.')
      return
    }
    if (Notification.permission !== 'granted') {
      console.warn('[notificationService] Permission not granted; skipping schedule.')
      return
    }

    const delay = time.getTime() - Date.now()

    if (delay < 0) {
      console.warn('[notificationService] Scheduled time is in the past; skipping.')
      return
    }

    // NOTE: setTimeout only works while the browser tab is open. For persistent
    // scheduling that survives tab close / browser restarts, a Service Worker
    // with the Push API (or Background Sync) is required — that is on the
    // future roadmap for NorthStar.
    if (delay > 24 * 60 * 60 * 1000) {
      console.warn(
        '[notificationService] Scheduled time is more than 24 h away. ' +
          'setTimeout-based scheduling is unreliable beyond the current session. ' +
          'Persistent push notifications via Service Worker are needed for this use-case.',
      )
    }

    setTimeout(() => {
      this.showNow(title, body).catch(console.error)
    }, delay)
  },
}
