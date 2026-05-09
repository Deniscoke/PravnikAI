import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HomePage from '@/components/home/HomePage'
import { HomeJsonLd } from '@/components/seo/HomeJsonLd'
import {
  getSiteUrl,
  SEO_KEYWORDS,
  SITE_NAME,
} from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'
import { localeToJurisdiction } from '@/lib/contracts/types'

const APP_URL = getSiteUrl()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) return {}
  const t = getMessages(rawLocale)
  const jurisdiction = localeToJurisdiction(rawLocale)
  const canonical = `${APP_URL}/${rawLocale}`

  return {
    title: { absolute: `${SITE_NAME} — ${t.home.kicker} (${t.jurisdiction.short[jurisdiction]})` },
    description: t.home.heroSubtitle,
    keywords: [...SEO_KEYWORDS],
    authors: [{ name: SITE_NAME, url: APP_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs`,
        de: `${APP_URL}/de`,
        en: `${APP_URL}/en`,
        'x-default': `${APP_URL}/cs`,
      },
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${t.home.kicker}`,
      description: t.home.heroSubtitle,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${t.home.kicker}`,
      description: t.home.heroSubtitle,
    },
  }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) notFound()

  return (
    <>
      <HomeJsonLd locale={rawLocale} />
      <HomePage />
    </>
  )
}
