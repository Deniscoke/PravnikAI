import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { isValidLocale } from '@/lib/i18n'
import { ACTIVE_LOCALES, type Locale } from '@/lib/contracts/types'
import { comparisonLastVerified, COMPARISONS, getComparison } from '@/lib/seo/comparisons'
import { getContractGuide } from '@/lib/seo/guides'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { VerifiedOn } from '@/components/seo/VerifiedOn'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return ACTIVE_LOCALES.flatMap((locale) =>
    COMPARISONS.map((comparison) => ({ locale, slug: comparison.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const comparison = getComparison(slug)
  if (!isValidLocale(raw) || !comparison) return {}

  const canonical = `${APP_URL}/${raw}/porovnani/${comparison.slug}`
  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/porovnani/${comparison.slug}`,
        'x-default': `${APP_URL}/cs/porovnani/${comparison.slug}`,
      },
    },
    openGraph: {
      url: canonical,
      title: comparison.metaTitle,
      description: comparison.metaDescription,
    },
  }
}

/**
 * A page that answers "which of these two do I need".
 *
 * The verdict sits above the table on purpose. A reader who came from a search
 * has one question, and a page that opens with a comparison grid makes them do
 * the work of answering it themselves — which is what every other page on the
 * subject already does.
 */
export default async function ComparisonPage({ params }: Props) {
  const { locale: raw, slug } = await params
  if (!isValidLocale(raw)) notFound()
  const comparison = getComparison(slug)
  if (!comparison) notFound()
  const locale = raw as Locale

  const leftGuide = getContractGuide(comparison.leftGuideSlug)
  const rightGuide = getContractGuide(comparison.rightGuideSlug)

  const verified = comparisonLastVerified(comparison)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    inLanguage: 'cs-CZ',
    headline: comparison.h1,
    description: comparison.metaDescription,
    about: comparison.legalBasis,
    mainEntityOfPage: `${APP_URL}/${locale}/porovnani/${comparison.slug}`,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: APP_URL },
    ...(verified
      ? {
          datePublished: verified.toISOString().slice(0, 10),
          dateModified: verified.toISOString().slice(0, 10),
        }
      : {}),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'cs-CZ',
    mainEntity: comparison.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Vzory smluv', path: `/${locale}/vzory` },
          { name: comparison.h1, path: `/${locale}/porovnani/${comparison.slug}` },
        ]}
      />
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(faqJsonLd)}
      </script>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(articleJsonLd)}
      </script>

      <div className="legal-card">
        <Link href={`/${locale}/vzory`} className="legal-back">
          &larr; Přehled vzorů
        </Link>

        <h1>{comparison.h1}</h1>
        <p className="legal-updated">{comparison.legalBasis}</p>
        <VerifiedOn date={verified} />
        <p>{comparison.perex}</p>

        <section>
          <h2>Krátká odpověď</h2>
          <p style={{ fontWeight: 500 }}>{comparison.verdict}</p>
        </section>

        <section>
          <h2>Srovnání bod po bodu</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>&nbsp;</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>{comparison.leftLabel}</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>{comparison.rightLabel}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.criterion} style={{ borderTop: '1px solid var(--color-border)' }}>
                    <th scope="row" style={{ textAlign: 'left', padding: '10px 6px', fontWeight: 600 }}>
                      {row.criterion}
                      {row.law ? (
                        <span
                          style={{
                            display: 'block',
                            fontWeight: 400,
                            fontSize: '0.78rem',
                            opacity: 0.75,
                          }}
                        >
                          {row.law}
                        </span>
                      ) : null}
                    </th>
                    <td style={{ padding: '10px 6px' }}>{row.left}</td>
                    <td style={{ padding: '10px 6px' }}>{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {[comparison.chooseLeft, comparison.chooseRight].map((choice) => (
          <section key={choice.title}>
            <h2>{choice.title}</h2>
            <ul>
              {choice.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2>Časté chyby při volbě</h2>
          {comparison.pitfalls.map((pitfall) => (
            <div key={pitfall.title} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
                {pitfall.title}
                {pitfall.law ? (
                  <span style={{ fontWeight: 400, fontSize: '0.8rem', opacity: 0.75 }}>
                    {' '}
                    · {pitfall.law}
                  </span>
                ) : null}
              </h3>
              <p style={{ margin: 0 }}>{pitfall.body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Časté otázky</h2>
          {comparison.faq.map((item) => (
            <div key={item.question} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{item.question}</h3>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Podrobně k jednotlivým typům</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[leftGuide, rightGuide].map((guide) =>
              guide ? (
                <li key={guide.slug} style={{ marginBottom: 'var(--space-sm)' }}>
                  <Link href={`/${locale}/vzory/${guide.slug}`} style={{ textDecoration: 'none' }}>
                    {guide.h1}
                  </Link>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}> — {guide.legalBasis}</span>
                </li>
              ) : null,
            )}
          </ul>
        </section>

        <section>
          <h2>Připraveno začít?</h2>
          <p>
            Vyplňte údaje a {SITE_NAME} sestaví strukturovaný návrh podle českého práva během
            několika minut.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              flexWrap: 'wrap',
              marginTop: 'var(--space-sm)',
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
        </section>

        <section>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
            Tato stránka má informativní charakter a popisuje obecnou právní úpravu. Neposkytuje
            právní poradenství ve smyslu zák. č. 85/1996 Sb., o advokacii, a nenahrazuje posouzení
            konkrétního případu advokátem.
          </p>
        </section>
      </div>
    </main>
  )
}
