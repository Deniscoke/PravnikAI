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
  const canonical = `${APP_URL}/${rawLocale}/generator`

  return {
    title: t.generator.title,
    description: t.generator.subtitle,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/generator`,
        'x-default': `${APP_URL}/cs/generator`,
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

export default async function GeneratorLayout({
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
          { name: t.generator.title, path: `/${locale}/generator` },
        ]}
      />
      <ServerAuthProvider>{children}</ServerAuthProvider>
    </>
  )
}
