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
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/lib/supabase/actions'
import { format as formatMsg } from '@/lib/i18n'
import { useLocale, useTranslations } from '@/lib/i18n/client'

interface OnboardingViewProps {
  userName: string
}

export function OnboardingView({ userName }: OnboardingViewProps) {
  const locale = useLocale()
  const t = useTranslations()
  const router = useRouter()
  const base = `/${locale}`

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = userName?.trim() || t.onboarding.guestName
  const canProceed = termsAccepted && privacyAccepted

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canProceed || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      await completeOnboarding({ marketingConsent })
      router.push(`${base}/dashboard`)
      router.refresh()
    } catch {
      setError(t.onboarding.submitErrorBanner)
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'var(--space-2xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          {formatMsg(t.onboarding.welcomeNamed, { name: displayName })}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          {t.onboarding.dashboardIntro}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* AI Disclaimer */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{ fontSize: '1.1rem' }}>&#9878;</span>
            {t.onboarding.viewHeading}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            {formatMsg(t.onboarding.viewBody, { siteName: t.meta.siteName })}
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{ fontSize: '1.1rem' }}>&#128274;</span>
            {t.onboarding.viewPrivacyTitle}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            {t.onboarding.viewPrivacyBody}
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
              {formatMsg(t.onboarding.viewAckTerms, { siteName: t.meta.siteName })}
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
              {t.onboarding.viewAckPrivacy}
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
              {formatMsg(t.onboarding.viewMarketing, { siteName: t.meta.siteName })}
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {' '}
                ({t.onboarding.optionalWord})
              </span>
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
          {submitting ? t.onboarding.dashboardSubmitting : t.onboarding.continueToApp}
        </button>

        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)', textAlign: 'center', marginTop: 'var(--space-md)', lineHeight: 1.5 }}>
          {t.onboarding.requiredStarsNote}
        </p>
      </form>
    </div>
  )
}
