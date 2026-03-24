import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pravnik-ai-five.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/terms', '/privacy', '/gdpr'],
        disallow: ['/dashboard', '/account', '/onboarding', '/api/', '/monitoring'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
