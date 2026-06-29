import { Page } from '@playwright/test'

export async function seedDemoData(page: Page) {
  // Click "Explore with Sample Data" if FirstLaunch is showing
  const demoBtn = page.getByText('Explore with Sample Data')
  if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await demoBtn.click()
    await page.waitForURL('/', { timeout: 10000 })
  }
}

export async function clearAndReset(page: Page) {
  // Must be on a page (not about:blank) before touching IndexedDB
  await page.goto('/')
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('NorthStarDB')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    })
  })
  await page.reload()
}
