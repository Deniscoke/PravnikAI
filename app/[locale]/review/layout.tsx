import type { Metadata } from 'next'
import { getSiteUrl, SITE_NAME, SEO_KEYWORDS } from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { ServerAuthProvider } from '@/components/auth/ServerAuthProvider'

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
        'x-default': `${APP_URL}/cs/review`,
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

export default async function ReviewLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isValidLocale(locale)) return <ServerAuthProvider>{children}</ServerAuthProvider>
  const t = getMessages(locale)
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: t.nav.review, path: `/${locale}/review` },
        ]}
      />
      <ServerAuthProvider>{children}</ServerAuthProvider>
    </>
  )
}

