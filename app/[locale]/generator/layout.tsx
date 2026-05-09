import type { Metadata } from 'next'
import { getSiteUrl, SITE_NAME, SEO_KEYWORDS } from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'

const APP_URL = getSiteUrl()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) return {}
  const t = getMessages(rawLocale)
  const canonical = `${APP_URL}/${rawLocale}/generator`

  return {
    title: t.generator.title,
    description: t.generator.subtitle,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/generator`,
        de: `${APP_URL}/de/generator`,
        en: `${APP_URL}/en/generator`,
      },
    },
    openGraph: {
      url: canonical,
      title: `${t.generator.title} — ${SITE_NAME}`,
      description: t.generator.subtitle,
    },
    twitter: {
      title: `${t.generator.title} — ${SITE_NAME}`,
      description: t.generator.subtitle,
    },
  }
}

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
