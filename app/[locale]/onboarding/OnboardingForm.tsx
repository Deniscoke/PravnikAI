'use client'

/**
 * Onboarding form — legal consents before first dashboard access.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { completeOnboarding } from '@/lib/supabase/actions'
import { format as formatMsg } from '@/lib/i18n'
import type { Locale } from '@/lib/contracts/types'
import { useTranslations } from '@/lib/i18n/client'

export function OnboardingForm({ locale }: { locale: Locale }) {
  const router = useRouter()
  const t = useTranslations()
  const base = `/${locale}`
  const [isPending, startTransition] = useTransition()
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const site = t.meta.siteName
  const canSubmit = terms && privacy && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    startTransition(async () => {
      try {
        await completeOnboarding({ marketingConsent: marketing })
        router.push(`${base}/dashboard`)
      } catch {
        setError(t.onboarding.submitError)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          required
          style={checkboxStyle}
          aria-required="true"
        />
        <span style={{ lineHeight: 1.5 }}>
          {t.onboarding.termsAgreePrefix}{' '}
          <Link href={`${base}/terms`} target="_blank" rel="noreferrer" style={linkStyle}>
            {t.onboarding.termsLinkLabel}
          </Link>
          <RequiredMark />
        </span>
      </label>

      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          required
          style={checkboxStyle}
          aria-required="true"
        />
        <span style={{ lineHeight: 1.5 }}>
          {t.onboarding.privacyAgreePrefix}{' '}
          <Link href={`${base}/privacy`} target="_blank" rel="noreferrer" style={linkStyle}>
            {t.onboarding.privacyLinkLabel}
          </Link>{' '}
          {t.onboarding.privacyGdprBridge}{' '}
          <Link href={`${base}/gdpr`} target="_blank" rel="noreferrer" style={linkStyle}>
            {t.onboarding.gdprLinkLabel}
          </Link>
          <RequiredMark />
        </span>
      </label>

      <label style={{ ...labelStyle, marginBottom: 'var(--space-xl)' }}>
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          style={checkboxStyle}
        />
        <span style={{ lineHeight: 1.5 }}>
          {t.onboarding.marketingOptIn}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginLeft: 4 }}>
            {t.onboarding.optionalTag}
          </span>
        </span>
      </label>

      <p style={{
        fontSize: '0.72rem',
        color: 'var(--color-text-subtle)',
        marginBottom: 'var(--space-lg)',
      }}>
        <RequiredMark /> {t.onboarding.requiredLegend}
      </p>

      {error && (
        <div
          className="alert alert--error"
          role="alert"
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: 'var(--space-md) var(--space-lg)',
          background: canSubmit
            ? 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))'
            : 'var(--color-surface-raised)',
          color: canSubmit ? '#fff' : 'var(--color-text-subtle)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'opacity 0.15s ease, background 0.15s ease',
          opacity: isPending ? 0.7 : 1,
        }}
        aria-busy={isPending}
      >
        {isPending
          ? t.onboarding.submitting
          : formatMsg(t.onboarding.submitCta, { siteName: site })}
      </button>

    </form>
  )
}

function RequiredMark() {
  return (
    <span aria-hidden="true" style={{ color: 'var(--accent-aqua)', marginLeft: 2 }}>
      *
    </span>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-sm)',
  marginBottom: 'var(--space-md)',
  fontSize: '0.85rem',
  cursor: 'pointer',
  lineHeight: 1.5,
}

const checkboxStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  flexShrink: 0,
  marginTop: 2,
  accentColor: 'var(--accent-aqua)',
  cursor: 'pointer',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--accent-aqua)',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
}
