'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { UserMenu } from '@/components/auth/UserMenu'
import { getSchemasByCategory } from '@/lib/contracts/contractSchemas'

// ── FAQ data ──────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Jsou vygenerované smlouvy právně závazné?',
    a: 'PrávníkAI generuje smlouvy podle aktuální české legislativy (NOZ, ZP, ZOK). Vygenerovaný dokument slouží jako profesionální základ, který doporučujeme před podpisem nechat zkontrolovat advokátem. Právní závaznost smlouvy závisí na splnění zákonných náležitostí a svobodném souhlasu smluvních stran.',
  },
  {
    q: 'Jak jsou chráněny moje údaje a údaje klientů?',
    a: 'Bezpečnost je naše priorita. Všechna data jsou zpracována na serveru — API klíč nikdy neopustí server. Zpracování probíhá v souladu s GDPR. Vaše dokumenty nejsou nikdy použity na trénování AI modelů.',
  },
  {
    q: 'Mohu vygenerované smlouvy dále upravovat?',
    a: 'Samozřejmě. Každou vygenerovanou smlouvu můžete exportovat do DOCX formátu a upravit v libovolném textovém editoru. Smlouvy jsou vaše — máte nad nimi plnou kontrolu.',
  },
  {
    q: 'Pro koho je PrávníkAI určen?',
    a: 'PrávníkAI je primárně navržen pro advokáty, advokátní kanceláře, firemní právníky a notáře. Využít ho však může kdokoli, kdo potřebuje připravit právní dokumenty — od podnikatelů po správce nemovitostí.',
  },
  {
    q: 'Jaké typy smluv PrávníkAI podporuje?',
    a: 'Momentálně podporujeme 5 typů smluv z oblastí občanského, obchodního a pracovního práva. Knihovnu neustále rozšiřujeme. Pokud vám chybí konkrétní typ smlouvy, dejte nám vědět.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────

export default function Home() {
  const schemasByCategory = getSchemasByCategory()

  // Collect all schema names for chip grid
  const allSchemas = Object.values(schemasByCategory).flat()

  return (
    <>
      {/* ── Hero ── */}
      <header className="hero">
        <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 1100, margin: '0 auto', paddingBottom: 'var(--space-lg)' }}>
          <UserMenu />
        </div>
        <span className="hero__kicker">AI asistent pro právníky</span>
        <h1 className="hero__title">PrávníkAI</h1>
        <p className="hero__sub">
          Generujte právní smlouvy za minuty, ne hodiny. Inteligentní nástroj, který rozumí českému právu
          a pomáhá vám připravit přesné dokumenty bez zbytečné administrativy.
        </p>

        <div className="hero__cta">
          <Link href="/generator" className="glass-btn glass-btn--primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <DocIcon /> Generovat smlouvu
          </Link>
          <Link href="/review" className="glass-btn glass-btn--ghost" style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <SearchIcon /> Zkontrolovat smlouvu
          </Link>
        </div>

        <div className="stats">
          <div className="glass-card stats__item">
            <div className="stats__num">5+</div>
            <div className="stats__desc">Typů smluv</div>
          </div>
          <div className="glass-card stats__item">
            <div className="stats__num">3 min</div>
            <div className="stats__desc">Průměrný čas</div>
          </div>
          <div className="glass-card stats__item">
            <div className="stats__num">CZ</div>
            <div className="stats__desc">České právo</div>
          </div>
        </div>
      </header>

      <main>
        {/* ── Features ── */}
        <section className="section" id="funkce">
          <div className="section__header">
            <h2 className="section__title">Proč PrávníkAI</h2>
            <span className="section__subtitle">Nástroj navržený právníky pro právníky</span>
          </div>
          <div className="card-grid">
            <FeatureCard
              icon={<DocIcon size={32} />}
              title="Automatizované smlouvy"
              body="Vyberte typ smlouvy, vyplňte údaje stran a nechte AI vygenerovat kompletní právní dokument v souladu s českou legislativou."
            />
            <FeatureCard
              icon={<ClockIcon />}
              title="Úspora času"
              body="Smlouva, která by vám zabrala hodiny manuální práce, je připravena za několik minut. Více času na to, co skutečně vyžaduje vaši expertízu."
            />
            <FeatureCard
              icon={<ShieldCheckIcon />}
              title="Právní jistota"
              body="Každá vygenerovaná smlouva vychází z aktuálních právních předpisů ČR — NOZ, zákoníku práce a ZOK. Systém cituje konkrétní ustanovení."
            />
            <FeatureCard
              icon={<LockIcon />}
              title="Bezpečnost dat"
              body="Všechny údaje jsou zpracovány server-side v souladu s GDPR. API klíč nikdy neopustí server. Citlivá pole jsou označena a chráněna."
            />
            <FeatureCard
              icon={<SearchIcon size={32} />}
              title="AI kontrola smluv"
              body="Vložte existující smlouvu a AI identifikuje rizikové klauzule, chybějící ustanovení a vyjednávací body dle českého práva."
            />
            <FeatureCard
              icon={<ExportIcon />}
              title="Export do DOCX"
              body="Exportujte smlouvy do DOCX s profesionálním formátováním — záhlaví, zápatí, právní citace a disclaimer automaticky."
            />
          </div>
        </section>

        <div className="divider" />

        {/* ── How it works ── */}
        <section className="section" id="jak-to-funguje">
          <div className="section__header">
            <h2 className="section__title">Jak to funguje</h2>
            <span className="section__subtitle">Smlouva za 3 jednoduché kroky</span>
          </div>

          <div className="steps-visual">
            <div className="glass-card step-card">
              <div className="step-card__number">1</div>
              <h3 className="glass-card__title">Vyberte typ smlouvy</h3>
              <p className="glass-card__body">Zvolte z nabídky — kupní, pracovní, nájemní, NDA, smlouva o dílo a další.</p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <line x1="0" y1="12" x2="32" y2="12" />
                <polyline points="28 6 34 12 28 18" />
              </svg>
            </div>
            <div className="glass-card step-card">
              <div className="step-card__number">2</div>
              <h3 className="glass-card__title">Vyplňte údaje</h3>
              <p className="glass-card__body">Zadejte údaje smluvních stran, předmět smlouvy a specifické podmínky. Formulář se dynamicky přizpůsobí.</p>
            </div>
            <div className="step-connector" aria-hidden="true">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <line x1="0" y1="12" x2="32" y2="12" />
                <polyline points="28 6 34 12 28 18" />
              </svg>
            </div>
            <div className="glass-card step-card">
              <div className="step-card__number">3</div>
              <h3 className="glass-card__title">Stáhněte smlouvu</h3>
              <p className="glass-card__body">AI vygeneruje kompletní smlouvu s citacemi zákonů. Zkontrolujte, upravte a exportujte do DOCX.</p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── Contract types (dynamic from registry) ── */}
        <section className="section" id="typy-smluv">
          <div className="section__header">
            <h2 className="section__title">Podporované typy smluv</h2>
            <span className="section__subtitle">Neustále rozšiřujeme knihovnu</span>
          </div>

          <div className="chip-grid">
            {allSchemas.map((schema) => (
              <Link
                key={schema.metadata.schemaId}
                href="/generator"
                className="glass-chip"
                style={{ textDecoration: 'none' }}
              >
                {schema.metadata.name}
              </Link>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── FAQ ── */}
        <section className="section" id="faq">
          <div className="section__header">
            <h2 className="section__title">Časté otázky</h2>
            <span className="section__subtitle">Vše, co potřebujete vědět</span>
          </div>

          <div className="faq-accordion">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── CTA ── */}
        <section className="section">
          <div className="glass-card cta-card">
            <h2 className="cta-card__title">Začněte generovat smlouvy ještě dnes</h2>
            <p className="cta-card__body">Připravte právně korektní smlouvy za minuty místo hodin. Výhradně české právo, AI-asistovaný návrh.</p>
            <div className="cta-card__actions">
              <Link href="/generator" className="glass-btn glass-btn--primary" style={{ padding: '14px 32px' }}>
                Vyzkoušet zdarma
              </Link>
              <Link href="#faq" className="glass-btn glass-btn--ghost" style={{ padding: '14px 32px' }}>
                Mám otázky
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">PrávníkAI</div>
            <p className="footer-desc">
              Inteligentní generátor smluv pro české právo. AI technologie, profesionální výstup.
            </p>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">Produkt</h4>
            <Link href="#funkce">Funkce</Link>
            <Link href="/generator">Generátor</Link>
            <Link href="/review">Kontrola smluv</Link>
            <Link href="#faq">FAQ</Link>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">Právní</h4>
            <Link href="/dashboard">Obchodní podmínky</Link>
            <Link href="/dashboard">Ochrana osobních údajů</Link>
            <Link href="/dashboard">GDPR</Link>
          </div>
          <div className="footer-links">
            <h4 className="footer-links__title">Kontakt</h4>
            <a href="mailto:info.indiweb@gmail.com">info.indiweb@gmail.com</a>
            <a href="tel:+420728523267">728 523 267</a>
            <a href="mailto:info.indiweb@gmail.com">Podpora</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 PrávníkAI · IndiWeb. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </>
  )
}

// ── FAQ Item (client-side toggle) ─────────────────────────────────────────

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

// ── Feature Card ──────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="glass-card feature-card">
      <div className="feature-card__icon">{icon}</div>
      <h3 className="glass-card__title">{title}</h3>
      <p className="glass-card__body">{body}</p>
    </div>
  )
}

// ── SVG Icons (Lucide-style, stroke-width 1.5) ────────────────────────────

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
