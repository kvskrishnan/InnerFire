import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
    await page.goto('/goals')
  })

  test('shows existing goals from sample data', async ({ page }) => {
    await expect(page.getByText('Run a half marathon')).toBeVisible({ timeout: 5000 })
  })

  test('can add a new goal with WHY', async ({ page }) => {
    await page.getByText('Add Goal').click()
    await page.getByPlaceholder(/goal title/i).fill('Learn to meditate daily')

    // Select a pillar
    await page.locator('select').first().selectOption({ index: 1 })

    // Fill WHY
    await page.getByPlaceholder(/why does this matter/i).fill('I want the mental clarity and emotional regulation to be a better leader and father.')

    await page.getByRole('button', { name: /save goal/i }).click()
    await expect(page.getByText('Learn to meditate daily')).toBeVisible()
  })

  test('goal without WHY cannot be saved', async ({ page }) => {
    await page.getByText('Add Goal').click()
    await page.getByPlaceholder(/goal title/i).fill('Empty goal')
    await page.locator('select').first().selectOption({ index: 1 })
    // Don't fill WHY
    await page.getByRole('button', { name: /save goal/i }).click()
    // Should still be on goals page (not navigated away)
    await expect(page.url()).toContain('/goals')
    // Form should still be visible
    await expect(page.getByPlaceholder(/goal title/i)).toBeVisible()
  })
})
