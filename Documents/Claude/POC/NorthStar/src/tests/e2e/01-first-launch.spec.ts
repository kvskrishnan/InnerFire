import { test, expect } from '@playwright/test'
import { clearAndReset } from './helpers'

test.describe('First Launch', () => {
  test.beforeEach(async ({ page }) => {
    await clearAndReset(page)
  })

  test('shows FirstLaunch screen on fresh install', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('NorthStar')).toBeVisible()
    await expect(page.getByText("Don't track your habits")).toBeVisible()
    await expect(page.getByText('Begin Your Journey')).toBeVisible()
    await expect(page.getByText('Explore with Sample Data')).toBeVisible()
  })

  test('Explore with Sample Data loads dashboard', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Explore with Sample Data').click()
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.getByText('Alex')).toBeVisible({ timeout: 5000 })
  })

  test('Begin Your Journey navigates to onboarding', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Begin Your Journey').click()
    await page.waitForURL('/onboarding')
    await expect(page.getByText(/Begin/)).toBeVisible({ timeout: 5000 })
  })
})
