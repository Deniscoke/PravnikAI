import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { I18nProvider } from '@/lib/i18n/client'
import { getMessages, isValidLocale, ALL_LOCALES } from '@/lib/i18n'
import { localeToJurisdiction, type Locale } from '@/lib/contracts/types'
import { getSiteUrl, SITE_NAME, SEO_DESCRIPTION_DEFAULT } from '@/lib/seo/site'

const APP_URL = getSiteUrl()

/** Static params so Next.js pre-renders /cs, /de, /en at build time. */
export function generateStaticParams() {
  return ALL_LOCALES.map((locale) => ({ locale }))
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

/** Per-locale metadata with hreflang alternates. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) return {}

  const t = getMessages(rawLocale)
  const jurisdiction = localeToJurisdiction(rawLocale)

  const title = `${SITE_NAME} — ${t.home.kicker} (${t.jurisdiction.short[jurisdiction]})`

  const localeUrl = `${APP_URL}/${rawLocale}`
  const ogLocaleMap: Record<Locale, string> = {
    cs: 'cs_CZ',
    de: 'de_DE',
    en: 'en_GB',
  }

  return {
    title: { default: title, template: `%s — ${SITE_NAME}` },
    description: t.home.heroSubtitle,
    alternates: {
      canonical: localeUrl,
      languages: {
        cs: `${APP_URL}/cs`,
        de: `${APP_URL}/de`,
        en: `${APP_URL}/en`,
        'x-default': `${APP_URL}/cs`,
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[rawLocale],
      url: localeUrl,
      siteName: SITE_NAME,
      title,
      description: t.home.heroSubtitle,
      alternateLocale: Object.values(ogLocaleMap).filter((l) => l !== ogLocaleMap[rawLocale]),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t.home.heroSubtitle,
    },
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) notFound()

  return <I18nProvider locale={rawLocale}>{children}</I18nProvider>
}

// Use SEO_DESCRIPTION_DEFAULT as a fallback to silence unused-import warnings
// when this constant is also referenced indirectly via other imports.
void SEO_DESCRIPTION_DEFAULT
