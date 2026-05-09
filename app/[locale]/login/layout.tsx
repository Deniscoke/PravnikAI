import type { Metadata } from 'next'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'

const APP_URL = getSiteUrl()

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params
  if (!isValidLocale(rawLocale)) return {}
  const t = getMessages(rawLocale)
  const canonical = `${APP_URL}/${rawLocale}/login`

  return {
    title: t.nav.login,
    description: t.home.heroSubtitle,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/login`,
        de: `${APP_URL}/de/login`,
        en: `${APP_URL}/en/login`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      url: canonical,
      title: `${t.nav.login} — ${SITE_NAME}`,
      description: t.home.heroSubtitle,
    },
  }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
