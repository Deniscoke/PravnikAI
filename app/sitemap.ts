import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'
import { ACTIVE_LOCALES, type Locale } from '@/lib/contracts/types'

const APP_URL = getSiteUrl()

interface RoutePriority {
  path: string
  changeFrequency: 'weekly' | 'monthly' | 'yearly'
  priority: number
}

const ROUTES: RoutePriority[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/generator', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/review', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/login', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/gdpr', changeFrequency: 'yearly', priority: 0.35 },
]

/**
 * CZ-only sitemap with hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of ACTIVE_LOCALES) {
    for (const route of ROUTES) {
      const url = `${APP_URL}/${locale}${route.path}`

      entries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            cs: `${APP_URL}/cs${route.path}`,
            'x-default': `${APP_URL}/cs${route.path}`,
          },
        },
      })
    }
  }

  return entries
}

export type { Locale }
