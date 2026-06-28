const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Turbopack workspace root detection (multiple lockfiles warning)
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Bundle the embedded PDF fonts into the export-pdf serverless function so
  // pdfkit can read them at runtime, and keep pdfkit external so its own file
  // reads resolve from node_modules rather than a rewritten bundle path.
  outputFileTracingIncludes: {
    '/api/export-pdf': ['./assets/fonts/**/*'],
  },
  serverExternalPackages: ['pdfkit'],

  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy — don't leak path in Referer header
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS for 1 year (set by Vercel too, belt-and-suspenders)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // Reduce XSS / MIME / cross-origin leakage surface
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          // Google OAuth popup needs same-origin-allow-popups
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        ],
      },
    ]
  },
}

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

  // Tunnel Sentry events through /monitoring to avoid ad-blockers
  tunnelRoute: '/monitoring',
})
