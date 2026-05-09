'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { UserMenu } from '@/components/auth/UserMenu'
import { PricingSection } from '@/components/billing/PricingSection'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getSchemasByCategory } from '@/lib/contracts/contractSchemas'
import { getHomeFaqItems } from '@/lib/seo/faq'
import { useLocale, useTranslations } from '@/lib/i18n/client'
import { localeToJurisdiction } from '@/lib/contracts/types'

export default function HomePage() {
  const locale = useLocale()
  const t = useTranslations()
  const jurisdiction = localeToJurisdiction(locale)

  const schemasByCategory = getSchemasByCategory(jurisdiction)
  const allSchemas = Object.values(schemasByCategory).flat()
  const faqItems = getHomeFaqItems(locale)

  return (
    <>
      <header className="hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto', paddingBottom: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <LanguageSwitcher />
          <UserMenu />
        </div>
        <span className="hero__kicker">{t.home.kicker}</span>
        <h1 className="hero__title">PrávníkAI</h1>
        <p className="hero__sub">{t.home.heroSubtitle}</p>

        <div className="hero__cta">
          <Link href={`/${locale}/generator`} className="glass-btn glass-btn--primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <DocIcon /> {t.home.ctaGenerate}
          </Link>
          <Link href={`/${locale}/review`} className="glass-btn glass-btn--ghost" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <SearchIcon /> {t.home.ctaReview}
          </Link>
        </div>

        <div className="stats">
          <div className="glass-card stats__item">
            <div className="stats__num">{allSchemas.length}+</div>
            <div className="stats__desc">{t.home.statContractTypes}</div>
          </div>
          <div className="glass-card stats__item">
            <div className="stats__num">3 min</div>
            <div className="stats__desc">{t.home.statTime}</div>
          </div>
          <div className="glass-card stats__item">
            <div className="stats__num">{t.jurisdiction.short[jurisdiction]}</div>
            <div className="stats__desc">{t.home.statJurisdictions}</div>
          </div>
        </div>
      </header>

      <main>
        <section className="section" id="funkce">
          <div className="section__header">
            <h2 className="section__title">{t.home.sectionFeaturesTitle}</h2>
            <span className="section__subtitle">{t.home.sectionFeaturesSubtitle}</span>
          </div>
          <div className="card-grid">
            <FeatureCard icon={<DocIcon size={32} />} title={t.home.feature.automated.title} body={t.home.feature.automated.body} />
            <FeatureCard icon={<ClockIcon />} title={t.home.feature.time.title} body={t.home.feature.time.body} />
            <FeatureCard icon={<ShieldCheckIcon />} title={t.home.feature.legal.title} body={t.home.feature.legal.body} />
            <FeatureCard icon={<LockIcon />} title={t.home.feature.security.title} body={t.home.feature.security.body} />
            <FeatureCard icon={<SearchIcon size={32} />} title={t.home.feature.review.title} body={t.home.feature.review.body} />
            <FeatureCard icon={<ExportIcon />} title={t.home.feature.export.title} body={t.home.feature.export.body} />
          </div>
        </section>

        <div className="divider" />

        <section className="section" id="jak-to-funguje">
          <div className="section__header">
            <h2 className="section__title">{t.home.sectionHowTitle}</h2>
            <span className="section__subtitle">{t.home.sectionHowSubtitle}</span>
          </div>

          <div className="steps-visual">
            <div className="glass-card step-card">
              <div className="step-card__number">1</div>
              <h3 className="glass-card__title">{t.home.step.one.title}</h3>
              <p className="glass-card__body">{t.home.step.one.body}</p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <ArrowRight />
            </div>
            <div className="glass-card step-card">
              <div className="step-card__number">2</div>
              <h3 className="glass-card__title">{t.home.step.two.title}</h3>
              <p className="glass-card__body">{t.home.step.two.body}</p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <ArrowRight />
            </div>
            <div className="glass-card step-card">
              <div className="step-card__number">3</div>
              <h3 className="glass-card__title">{t.home.step.three.title}</h3>
              <p className="glass-card__body">{t.home.step.three.body}</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section className="section" id="typy-smluv">
          <div className="section__header">
            <h2 className="section__title">{t.home.sectionTypesTitle}</h2>
            <span className="section__subtitle">{t.home.sectionTypesSubtitle}</span>
          </div>

          <div className="chip-grid">
            {allSchemas.map((schema) => (
              <Link
                key={schema.metadata.schemaId}
                href={`/${locale}/generator`}
                className="glass-chip"
                style={{ textDecoration: 'none' }}
              >
                {schema.metadata.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="divider" />

        <section className="section" id="faq">
          <div className="section__header">
            <h2 className="section__title">{t.home.sectionFaqTitle}</h2>
            <span className="section__subtitle">{t.home.sectionFaqSubtitle}</span>
          </div>

          <div className="faq-accordion">
            {faqItems.map((item, i) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>

        <div className="divider" />

        <section className="section" id="cenik">
          <div className="section__header">
            <h2 className="section__title">{t.home.sectionPricingTitle}</h2>
            <span className="section__subtitle">{t.home.sectionPricingSubtitle}</span>
          </div>
          <PricingSection currentTier="free" />
        </section>

        <div className="divider" />

        <section className="section">
          <div className="glass-card cta-card">
            <h2 className="cta-card__title">{t.home.ctaCardTitle}</h2>
            <p className="cta-card__body">{t.home.ctaCardBody}</p>
            <div className="cta-card__actions">
              <Link href={`/${locale}/generator`} className="glass-btn glass-btn--primary" style={{ padding: '14px 32px' }}>
                {t.home.ctaCardPrimary}
              </Link>
              <Link href="#faq" className="glass-btn glass-btn--ghost" style={{ padding: '14px 32px' }}>
                {t.home.ctaCardSecondary}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">PrávníkAI</div>
            <p className="footer-desc">{t.home.footer.tagline}</p>
            <div style={{ marginTop: 'var(--space-md)' }}>
              <LanguageSwitcher />
            </div>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">{t.home.footer.productHeading}</h4>
            <Link href="#funkce">{t.home.footer.links.features}</Link>
            <Link href={`/${locale}/generator`}>{t.home.footer.links.generator}</Link>
            <Link href={`/${locale}/review`}>{t.home.footer.links.review}</Link>
            <Link href="#faq">{t.home.footer.links.faq}</Link>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">{t.home.footer.legalHeading}</h4>
            <Link href={`/${locale}/terms`}>{t.home.footer.links.terms}</Link>
            <Link href={`/${locale}/privacy`}>{t.home.footer.links.privacy}</Link>
            <Link href={`/${locale}/gdpr`}>{t.home.footer.links.gdpr}</Link>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">{t.home.footer.contactHeading}</h4>
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
            <a href="tel:+420728523267">+420 728 523 267</a>
            <a href="mailto:info.indiweb@gmail.com">{t.home.footer.support}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 PrávníkAI · IndiWeb. {t.home.footer.rights}</p>
        </div>
      </footer>
    </>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item" data-open={open}>
      <button
        className="faq-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="faq-icon" aria-hidden="true">+</span>
      </button>
      <div className="faq-panel">
        <p className="faq-panel__content">{answer}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="glass-card feature-card">
      <div className="feature-card__icon">{icon}</div>
      <h3 className="glass-card__title">{title}</h3>
      <p className="glass-card__body">{body}</p>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function ArrowRight() {
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="0" y1="12" x2="32" y2="12" />
      <polyline points="28 6 34 12 28 18" />
    </svg>
  )
}

function DocIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
