/**
 * Sentry server-side configuration — PrávníkAI
 *
 * Captures unhandled errors in API routes, server components,
 * and server actions running in Node.js.
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring — sample 20% in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
})
