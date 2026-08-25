import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { getMessages, isValidLocale } from '@/lib/i18n'
import { ACTIVE_LOCALES, type Locale } from '@/lib/contracts/types'
import { CONTRACT_GUIDES, guidesByCategory } from '@/lib/seo/guides'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }))
}

const META_TITLE = `Vzory smluv a právních dokumentů — ${SITE_NAME}`
const META_DESCRIPTION =
  'Přehled vzorů podle českého práva — smlouvy, výpovědi, reklamace i předžalobní výzva. ' +
  'U každého typu náležitosti, časté chyby a odkazy na příslušná ustanovení.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}

  const canonical = `${APP_URL}/${locale}/vzory`
  return {
    title: { absolute: META_TITLE },
    description: META_DESCRIPTION,
    alternates: {
      canonical,
      languages: { cs: `${APP_URL}/cs/vzory`, 'x-default': `${APP_URL}/cs/vzory` },
    },
    openGraph: { url: canonical, title: META_TITLE, description: META_DESCRIPTION },
  }
}

/**
 * The hub for every /vzory guide.
 *
 * Without it the guides were twenty-three islands: reachable from the sitemap
 * and from search, but with no path between them. A crawler that found one had
 * no route to the rest, and a reader who landed on the wrong one had to go back
 * to Google. The ItemList below also tells a search engine these pages are a
 * set rather than twenty-three unrelated documents.
 */
export default async function GuideIndexPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isValidLocale(raw)) notFound()
  const locale = raw as Locale
  const t = getMessages(locale)
  const groups = guidesByCategory()

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: META_TITLE,
    description: META_DESCRIPTION,
    inLanguage: 'cs-CZ',
    numberOfItems: CONTRACT_GUIDES.length,
    itemListElement: CONTRACT_GUIDES.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.h1,
      description: guide.metaDescription,
      url: `${APP_URL}/${locale}/vzory/${guide.slug}`,
    })),
  }

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Vzory smluv', path: `/${locale}/vzory` },
        ]}
      />
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(itemListJsonLd)}
      </script>

      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>

        <h1>Vzory smluv a právních dokumentů</h1>
        <p className="legal-updated">
          {CONTRACT_GUIDES.length} typů dokumentů podle českého práva
        </p>
        <p>
          U každého typu najdete, co dokument musí obsahovat, čím se nejčastěji kazí a která
          ustanovení na něj dopadají. Texty vycházejí ze znění zákona a uvádějí paragraf, podle
          kterého si tvrzení můžete ověřit.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            flexWrap: 'wrap',
            margin: 'var(--space-lg) 0',
          }}
        >
          <Link
            href={`/${locale}/generator`}
            className="glass-btn glass-btn--primary"
            style={{ textDecoration: 'none' }}
          >
            Vytvořit dokument
          </Link>
          <Link
            href={`/${locale}/review`}
            className="glass-btn"
            style={{ textDecoration: 'none' }}
          >
            Zkontrolovat existující dokument
          </Link>
        </div>

        {groups.map(({ category, guides }) => (
          <section key={category}>
            <h2>{t.category[category]}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {guides.map((guide) => (
                <li key={guide.slug} style={{ marginBottom: 'var(--space-md)' }}>
                  <Link
                    href={`/${locale}/vzory/${guide.slug}`}
                    style={{ fontWeight: 600, textDecoration: 'none' }}
                  >
                    {guide.h1}
                  </Link>
                  <p style={{ margin: '2px 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                    {guide.legalBasis}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2>Než dokument použijete</h2>
          <p>
            Výstupem je <strong>pracovní návrh</strong> s odkazy na příslušná ustanovení, nikoli
            hotový dokument k okamžitému podpisu. U složitých transakcí, vysokých částek
            a regulovaných odvětví jej nechte před podpisem zkontrolovat advokátem.
          </p>
        </section>
      </div>
    </main>
  )
}
