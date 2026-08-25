import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteUrl, SITE_NAME } from '@/lib/seo/site'
import { isValidLocale } from '@/lib/i18n'
import { ACTIVE_LOCALES, type Locale } from '@/lib/contracts/types'
import { CONTRACT_GUIDES, getContractGuide, guideCopy, relatedGuides } from '@/lib/seo/guides'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

const APP_URL = getSiteUrl()

type Props = { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return ACTIVE_LOCALES.flatMap((locale) =>
    CONTRACT_GUIDES.map((guide) => ({ locale, slug: guide.slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const guide = getContractGuide(slug)
  if (!isValidLocale(raw) || !guide) return {}

  const canonical = `${APP_URL}/${raw}/vzory/${guide.slug}`
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: {
      canonical,
      languages: {
        cs: `${APP_URL}/cs/vzory/${guide.slug}`,
        'x-default': `${APP_URL}/cs/vzory/${guide.slug}`,
      },
    },
    openGraph: {
      url: canonical,
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
  }
}

export default async function ContractGuidePage({ params }: Props) {
  const { locale: raw, slug } = await params
  if (!isValidLocale(raw)) notFound()
  const guide = getContractGuide(slug)
  if (!guide) notFound()
  const locale = raw as Locale

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'cs-CZ',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  const copy = guideCopy(guide)
  const related = relatedGuides(guide)

  return (
    <main className="legal-page">
      <BreadcrumbJsonLd
        items={[
          { name: 'Domů', path: `/${locale}` },
          { name: 'Vzory smluv', path: `/${locale}/vzory` },
          { name: guide.h1, path: `/${locale}/vzory/${guide.slug}` },
        ]}
      />
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(faqJsonLd)}
      </script>

      <div className="legal-card">
        <Link href={`/${locale}`} className="legal-back">
          &larr; Zpět na hlavní stránku
        </Link>

        <h1>{guide.h1}</h1>
        <p className="legal-updated">{guide.legalBasis}</p>
        <p>{guide.perex}</p>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', margin: 'var(--space-lg) 0' }}>
          <Link href={`/${locale}/generator`} className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
            {copy.generateCta}
          </Link>
          <Link href={`/${locale}/review`} className="glass-btn" style={{ textDecoration: 'none' }}>
            {copy.reviewCta}
          </Link>
        </div>

        <section>
          {/*
            Lowercasing only the first letter. Applying it to the whole title
            turned "Dohoda o provedení práce (DPP)" into "(dpp)" — acronyms are
            common in contract names and a mangled one reads as a typo.
          */}
          <h2>Co má {guide.h1.charAt(0).toLowerCase() + guide.h1.slice(1)} obsahovat</h2>
          {guide.mustContain.map((item, i) => (
            <div key={item.title} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
                {i + 1}. {item.title}
                {item.law && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(94,231,223,0.08)',
                    border: '1px solid rgba(94,231,223,0.2)',
                    color: 'var(--accent-aqua)',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.law}
                  </span>
                )}
              </h3>
              <p style={{ margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Časté chyby</h2>
          {guide.pitfalls.map((item) => (
            <div key={item.title} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
                {item.title}
                {item.law && (
                  <span style={{ marginLeft: 8, fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--color-text-subtle)' }}>
                    {item.law}
                  </span>
                )}
              </h3>
              <p style={{ margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Jak si připravit návrh v {SITE_NAME}</h2>
          <ol>
            <li>{copy.pickTypeStep} &mdash; {guide.generatorHint}.</li>
            <li>Vyplňte údaje o stranách, předmětu a ceně. Povinná pole vás nepustí dál prázdná.</li>
            <li>Projděte si výstup, doplňte označená místa a exportujte do DOCX nebo PDF.</li>
          </ol>
          <p>
            Výstup je <strong>pracovní návrh</strong> s odkazy na příslušná ustanovení, nikoli hotový
            dokument k okamžitému podpisu. Před použitím jej doporučujeme nechat zkontrolovat advokátem.
          </p>
        </section>

        <section>
          <h2>Časté otázky</h2>
          {guide.faq.map((item) => (
            <div key={item.question} style={{ marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{item.question}</h3>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Připraveno začít?</h2>
          <p>
            Vyplňte údaje a {SITE_NAME} sestaví strukturovaný návrh podle českého práva během několika minut.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
            <Link href={`/${locale}/generator`} className="glass-btn glass-btn--primary" style={{ textDecoration: 'none' }}>
              {copy.generateCta}
            </Link>
            <Link href={`/${locale}/duvera`} className="glass-btn glass-btn--ghost" style={{ textDecoration: 'none' }}>
              Jak to funguje a jaké to má limity
            </Link>
          </div>
        </section>

        <section>
          <h2>Související vzory</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {related.map((other) => (
              <li key={other.slug} style={{ marginBottom: 'var(--space-sm)' }}>
                <Link href={`/${locale}/vzory/${other.slug}`} style={{ textDecoration: 'none' }}>
                  {other.h1}
                </Link>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}> — {other.legalBasis}</span>
              </li>
            ))}
          </ul>
          <p>
            <Link href={`/${locale}/vzory`}>Přehled všech vzorů</Link>
          </p>
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
