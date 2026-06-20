import { test, expect } from '@playwright/test'

test.describe('AI Portfolio Studio', () => {
  test('homepage loads with Chinese text', async ({ page }) => {
    await page.goto('/zh-CN')
    await expect(page.locator('h1')).toContainText('AI 创艺工坊')
    await expect(page.locator('nav')).toContainText('首页')
  })

  test('homepage loads with English text', async ({ page }) => {
    await page.goto('/en')
    await expect(page.locator('h1')).toContainText('AI Creative Studio')
    await expect(page.locator('nav')).toContainText('Home')
  })

  test('navigates to works page', async ({ page }) => {
    await page.goto('/zh-CN')
    await page.getByRole('link', { name: '作品' }).first().click()
    await expect(page).toHaveURL(/\/zh-CN\/works/)
  })

  test('admin page shows password gate', async ({ page }) => {
    await page.goto('/zh-CN/admin')
    await expect(page.getByText('管理后台')).toBeVisible()
    await expect(page.getByText('解锁')).toBeVisible()
  })
})