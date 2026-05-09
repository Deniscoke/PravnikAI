import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'

const APP_URL = getSiteUrl()

/**
 * Robots.txt — allow public locale-prefixed pages, disallow auth-gated and detail pages.
 * Uses wildcards so the rules cover all 3 locales (/cs, /de, /en).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*/dashboard',
          '/*/account',
          '/*/onboarding',
          '/api/',
          '/monitoring',
          '/auth/',
          // Detail pages with dynamic IDs — keep out of index
          '/*/generator/*',
          '/*/review/*',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
