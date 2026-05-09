import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'
import { ALL_LOCALES, type Locale } from '@/lib/contracts/types'

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
 * Multi-locale sitemap with hreflang alternates.
 * Each canonical URL is /{locale}{path} and lists alternates for cs/de/en + x-default.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of ALL_LOCALES) {
    for (const route of ROUTES) {
      const url = `${APP_URL}/${locale}${route.path}`
      const languages: Record<string, string> = {}
      for (const alt of ALL_LOCALES) {
        languages[alt] = `${APP_URL}/${alt}${route.path}`
      }
      languages['x-default'] = `${APP_URL}/cs${route.path}`

      entries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      })
    }
  }

  return entries
}

export type { Locale }
