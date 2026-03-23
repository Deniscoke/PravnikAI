/**
 * Sentry client-side configuration — PrávníkAI
 *
 * Captures unhandled errors and performance data in the browser.
 * Runs in the user's browser — keep DSN public (it's designed to be).
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring — sample 20% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session replay — capture 5% of sessions, 100% of sessions with errors
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media for privacy (GDPR)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop',
    // Network errors users can't control
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // Next.js hydration (usually harmless)
    'Minified React error',
  ],

  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
})
