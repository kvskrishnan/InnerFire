import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Night Reflection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
    await page.goto('/reflection')
  })

  test('shows the big question', async ({ page }) => {
    await expect(page.getByText('Did today\'s actions make Future You proud')).toBeVisible({ timeout: 5000 })
  })

  test('YES moves to reflection form', async ({ page }) => {
    await page.getByText('YES').click()
    await expect(page.getByText(/grateful for/i)).toBeVisible({ timeout: 3000 })
  })

  test('can complete a full reflection', async ({ page }) => {
    // Phase 1
    await page.getByText('YES').click()

    // Phase 2 — fill form
    // Select mood (click 4th emoji circle)
    await page.locator('.cursor-pointer').nth(3).click()

    await page.getByPlaceholder(/grateful/i).fill('My family and my health.')
    await page.getByPlaceholder(/win/i).fill('Completed a 5km run.')
    await page.getByPlaceholder(/learn/i).fill('Consistency beats perfection.')

    await page.getByRole('button', { name: /save reflection/i }).click()

    // Phase 3 — closing
    await expect(page.getByText(/Rest well/)).toBeVisible({ timeout: 5000 })
  })
})
