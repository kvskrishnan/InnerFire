import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
  })

  test('shows greeting with user name', async ({ page }) => {
    await expect(page.getByText(/Good (morning|afternoon|evening), Alex/)).toBeVisible({ timeout: 5000 })
  })

  test('shows life pillars', async ({ page }) => {
    await expect(page.getByText('Health')).toBeVisible()
    await expect(page.getByText('Career')).toBeVisible()
  })

  test('shows active goals', async ({ page }) => {
    await expect(page.getByText('Run a half marathon')).toBeVisible()
  })

  test('bottom nav navigates to Goals', async ({ page }) => {
    await page.getByRole('link', { name: /goals/i }).click()
    await page.waitForURL('/goals')
  })

  test('bottom nav navigates to Journal', async ({ page }) => {
    await page.getByRole('link', { name: /journal/i }).click()
    await page.waitForURL('/journal')
  })

  test('emergency FAB navigates to Emergency screen', async ({ page }) => {
    await page.locator('a[href="/emergency"]').click()
    await page.waitForURL('/emergency')
  })
})
