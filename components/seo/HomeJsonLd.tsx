import {
  getSiteUrl,
  SITE_NAME,
  SITE_PUBLISHER,
} from '@/lib/seo/site'
import { getHomeFaqItems } from '@/lib/seo/faq'
import { getMessages } from '@/lib/i18n'
import {
  jurisdictionCurrency,
  localeToJurisdiction,
  type Locale,
} from '@/lib/contracts/types'

function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const INLANG_MAP: Record<Locale, string> = {
  cs: 'cs-CZ',
  de: 'de-DE',
  en: 'en-GB',
}

/**
 * Localized structured data for the homepage:
 * WebSite, Organization, SoftwareApplication, FAQPage (Google rich results).
 */
export function HomeJsonLd({ locale }: { locale: Locale }) {
  const base = getSiteUrl()
  const localeUrl = `${base}/${locale}`
  const t = getMessages(locale)
  const jurisdiction = localeToJurisdiction(locale)
  const currency = jurisdictionCurrency(jurisdiction)
  const faqItems = getHomeFaqItems(locale)

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: localeUrl,
    inLanguage: INLANG_MAP[locale],
    description: t.home.heroSubtitle,
    publisher: { '@id': `${base}#organization` },
  }

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}#organization`,
    name: SITE_PUBLISHER,
    url: base,
    email: 'info.indiweb@gmail.com',
    telephone: '+420728523267',
  }

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: currency,
      description: t.home.sectionPricingSubtitle,
    },
    description: t.home.heroSubtitle,
    url: localeUrl,
    inLanguage: INLANG_MAP[locale],
    author: { '@id': `${base}#organization` },
    publisher: { '@id': `${base}#organization` },
    featureList: [
      t.home.feature.automated.title,
      t.home.feature.review.title,
      t.home.feature.export.title,
      t.home.feature.security.title,
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: INLANG_MAP[locale],
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqPage) }}
      />
    </>
  )
}
