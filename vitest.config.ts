import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    testTransformMode: { web: ['**/*.{ts,tsx}'] },
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, 'shared'),
    },
  },
})