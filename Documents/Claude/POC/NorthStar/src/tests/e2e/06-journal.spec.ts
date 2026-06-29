import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
    await page.goto('/journal')
  })

  test('shows existing journal entries', async ({ page }) => {
    await expect(page.getByText(/running|leadership|meditation/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('can create a new journal entry', async ({ page }) => {
    await page.getByText('New Entry').click()
    await page.waitForURL('/journal/new')

    await page.locator('textarea').fill('Today was a good day. I chose growth over comfort and it felt right.')
    await page.getByRole('button', { name: /save entry/i }).click()

    await page.waitForURL('/journal')
    await expect(page.getByText('Today was a good day')).toBeVisible()
  })
})
