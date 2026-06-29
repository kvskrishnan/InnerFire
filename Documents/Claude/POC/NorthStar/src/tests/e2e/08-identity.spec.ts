import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Identity Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
    await page.goto('/identity')
  })

  test('shows existing identity statements', async ({ page }) => {
    await expect(page.getByText(/disciplined|athlete|leader/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('can add a new identity statement', async ({ page }) => {
    await page.getByPlaceholder(/I am a/i).fill('I am a patient and loving father.')
    await page.getByRole('button', { name: /add/i }).click()
    await expect(page.getByText('I am a patient and loving father.')).toBeVisible()
  })
})
