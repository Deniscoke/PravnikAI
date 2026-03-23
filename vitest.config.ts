import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Default environment for pure-logic tests (validators, promptBuilder, route)
    environment: 'node',
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    // UI tests with userEvent type into many fields — raise from 5s default
    testTimeout: 15000,
    exclude: ['node_modules', '.next'],
    // Extend Vitest's expect() with @testing-library/jest-dom matchers globally
    setupFiles: ['./test-setup.ts'],
    // UI component tests need a real DOM — switch to jsdom per directory
    // @ts-expect-error — environmentMatchGlobs exists in Vitest but is not in the published InlineConfig type
    environmentMatchGlobs: [
      ['app/generator/__tests__/**', 'jsdom'],
      ['app/review/__tests__/**', 'jsdom'],
      ['app/dashboard/__tests__/**', 'jsdom'],
      ['components/**/__tests__/**', 'jsdom'],
    ],
    // Coverage: npx vitest run --coverage
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts', 'app/**/*.ts'],
      exclude: [
        'lib/**/__tests__/**',
        'lib/**/*.test.ts',
        'app/**/__tests__/**',
        'app/**/*.test.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
  resolve: {
    // Mirror the @/* → ./* alias from tsconfig.json so tests can import
    // the same way the application code does
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
})
