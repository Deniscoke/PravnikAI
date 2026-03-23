const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production builds (requires SENTRY_AUTH_TOKEN)
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Hide source maps from users (security)
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Tunnel Sentry events through /monitoring to avoid ad-blockers
  tunnelRoute: '/monitoring',

  // Automatically instrument API routes and server components
  automaticVercelMonitors: true,
})
