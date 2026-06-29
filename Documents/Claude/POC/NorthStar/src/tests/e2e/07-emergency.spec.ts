import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Emergency Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
    await page.goto('/emergency')
  })

  test('shows Strength tab by default', async ({ page }) => {
    await expect(page.getByText('YOUR WHY')).toBeVisible({ timeout: 5000 })
  })

  test('Breathe tab shows breathing exercise', async ({ page }) => {
    await page.getByText('Breathe').click()
    await expect(page.getByText(/Tap to begin|Breathe in/)).toBeVisible()
  })

  test('Remind Me tab shows quotes', async ({ page }) => {
    await page.getByText('Remind Me').click()
    await expect(page.locator('text=/Excellence|mountain|better/').first()).toBeVisible({ timeout: 3000 })
  })

  test('X button navigates back', async ({ page }) => {
    await page.locator('button').filter({ hasText: /×|✕/ }).first().click()
    await page.waitForURL('/')
  })
})
