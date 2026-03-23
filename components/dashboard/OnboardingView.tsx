'use client'

/**
 * Onboarding view — shown on first authenticated entry.
 *
 * Legal requirement for an AI-assisted legal tool:
 *   1. AI disclaimer — this is NOT legal advice
 *   2. Privacy notice — what data we store and why
 *   3. Terms acknowledgment — required for account use
 *   4. Marketing consent — OPTIONAL and SEPARATE (GDPR)
 *
 * The user MUST acknowledge items 1-3 before accessing the dashboard.
 * Marketing consent is opt-in with its own checkbox.
 */

import React, { useState } from 'react'
import { completeOnboarding } from '@/lib/supabase/actions'

interface OnboardingViewProps {
  userName: string
}

export function OnboardingView({ userName }: OnboardingViewProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canProceed = termsAccepted && privacyAccepted

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canProceed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await completeOnboarding({ marketingConsent })
      // Server action updates the profile — refresh to load dashboard
      window.location.href = '/dashboard'
    } catch {
      setError('Nepodařilo se dokončit registraci. Zkuste to znovu.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'var(--space-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Vítejte, {userName || 'uživateli'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Před prvním použitím prosím projděte následující informace.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* AI Disclaimer */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{ fontSize: '1.1rem' }}>&#9878;</span>
            AI-asistovaný nástroj
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            PrávníkAI je AI-asistovaný nástroj pro generování a kontrolu právních dokumentů.
            <strong> Neposkytuje právní poradenství</strong> ve smyslu zákona č. 85/1996 Sb., o advokacii.
            Vygenerované dokumenty a analýzy slouží výhradně jako pracovní návrh.
            Před podpisem nebo právním použitím vždy konzultujte advokáta.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{ fontSize: '1.1rem' }}>&#128274;</span>
            Ochrana osobních údajů
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            Ukládáme pouze údaje nezbytné pro fungování služby: vaše jméno a e-mail z Google účtu,
            historii vygenerovaných smluv a provedených kontrol.
            Data jsou zpracovávána na serverech v EU.
            Vaše údaje nikdy neprodáváme třetím stranám.
            Svůj účet a data můžete kdykoli smazat.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <label style={{ display: 'flex', gap: 'var(--space-sm)', cursor: 'pointer', marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--accent-aqua)' }}
            />
            <span>
              Rozumím, že PrávníkAI je AI nástroj a neposkytuje právní poradenství.
              Souhlasím s podmínkami použití.
              <span style={{ color: 'var(--accent-rose)' }}> *</span>
            </span>
          </label>

          <label style={{ display: 'flex', gap: 'var(--space-sm)', cursor: 'pointer', marginBottom: 'var(--space-lg)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--accent-aqua)' }}
            />
            <span>
              Souhlasím se zpracováním osobních údajů dle zásad ochrany soukromí.
              <span style={{ color: 'var(--accent-rose)' }}> *</span>
            </span>
          </label>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border-subtle)', margin: '0 0 var(--space-md)' }} />

          <label style={{ display: 'flex', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              style={{ marginTop: 2, accentColor: 'var(--accent-aqua)' }}
            />
            <span>
              Souhlasím se zasíláním informací o novinkách a vylepšeních PrávníkAI.
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}> (volitelné)</span>
            </span>
          </label>
        </div>

        {error && (
          <div className="alert alert--error" style={{ marginBottom: 'var(--space-md)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="glass-btn glass-btn--primary"
          disabled={!canProceed || submitting}
          style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
        >
          {submitting ? 'Dokončuji…' : 'Pokračovat do aplikace'}
        </button>

        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', textAlign: 'center', marginTop: 'var(--space-md)', lineHeight: 1.5 }}>
          Pole označená * jsou povinná pro používání služby.
        </p>
      </form>
    </div>
  )
}
