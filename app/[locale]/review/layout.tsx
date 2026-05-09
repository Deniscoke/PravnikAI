import type { Metadata } from 'next'
import { getSiteUrl, SITE_NAME, SEO_KEYWORDS } from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'

const APP_URL = getSiteUrl()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) return {}
  const t = getMessages(rawLocale)
  const canonical = `${APP_URL}/${rawLocale}/review`

  return {
    title: t.nav.review,
    description: t.home.feature.review.body,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/review`,
        de: `${APP_URL}/de/review`,
        en: `${APP_URL}/en/review`,
      },
    },
    openGraph: {
      url: canonical,
      title: `${t.nav.review} — ${SITE_NAME}`,
      description: t.home.feature.review.body,
    },
    twitter: {
      title: `${t.nav.review} — ${SITE_NAME}`,
      description: t.home.feature.review.body,
    },
  }
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
