import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'
import { ACTIVE_LOCALES, type Locale } from '@/lib/contracts/types'
import { CONTRACT_GUIDES, guideLastVerified } from '@/lib/seo/guides'

const APP_URL = getSiteUrl()

interface RoutePriority {
  path: string
  changeFrequency: 'weekly' | 'monthly' | 'yearly'
  priority: number
  /**
   * When this page's content last actually changed.
   *
   * Omitted means "the deploy", which is right for pages that move with the
   * app. Stamping today's date on all thirty-odd URLs every day tells a
   * crawler the whole site changes daily — which is noise, and noise is what
   * a crawler learns to discount. A guide changes when the law behind it was
   * last checked, and that date is recorded per contract type.
   */
  lastModified?: Date
}

const ROUTES: RoutePriority[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/generator', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/review', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/kontrola-smluv', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/vzory', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ai', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/duvera', changeFrequency: 'monthly', priority: 0.6 },
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

  // Contract guides are the organic entry points — they rank for what people
  // actually search ("kupní smlouva vzor") and lead into the generator.
  const guideRoutes: RoutePriority[] = CONTRACT_GUIDES.map((guide) => ({
    path: `/vzory/${guide.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
    lastModified: guideLastVerified(guide),
  }))

  for (const locale of ACTIVE_LOCALES) {
    for (const route of [...ROUTES, ...guideRoutes]) {
      const url = `${APP_URL}/${locale}${route.path}`

      entries.push({
        url,
        lastModified: route.lastModified ?? now,
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
