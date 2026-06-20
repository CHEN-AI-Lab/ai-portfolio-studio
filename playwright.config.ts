import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3300',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cd apps/web && npx next dev -p 3300',
    url: 'http://localhost:3300/zh-CN',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})