import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Offline behaviour', () => {
  test('app loads and shows offline indicator when offline', async ({ page, context }) => {
    await page.goto('/')
    await seedDemoData(page)

    // Go offline
    await context.setOffline(true)

    await page.reload()

    // App should still load (service worker cache)
    await expect(page.getByText(/NorthStar|Alex/i).first()).toBeVisible({ timeout: 8000 })

    // Offline indicator should show
    await expect(page.getByText(/offline/i)).toBeVisible({ timeout: 3000 })

    // Go back online
    await context.setOffline(false)
  })
})
