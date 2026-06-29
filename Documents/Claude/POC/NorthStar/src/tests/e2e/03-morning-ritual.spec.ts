import { test, expect } from '@playwright/test'
import { seedDemoData } from './helpers'

test.describe('Morning Ritual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedDemoData(page)
  })

  test('morning screen shows vision card content', async ({ page }) => {
    await page.goto('/morning')
    await expect(page.getByText(/I Choose Growth Today/)).toBeVisible({ timeout: 5000 })
  })

  test('I Choose Growth Today advances to intention phase', async ({ page }) => {
    await page.goto('/morning')
    await page.getByText('I Choose Growth Today').click()
    await expect(page.getByText('What will make today meaningful')).toBeVisible()
  })

  test('Begin My Day completes ritual and redirects to dashboard', async ({ page }) => {
    await page.goto('/morning')
    await page.getByText('I Choose Growth Today').click()
    await page.getByText('Begin My Day').click()
    await page.waitForURL('/')
  })
})
