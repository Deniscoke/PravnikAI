'use client'

/**
 * OnboardingForm — PrávníkAI
 *
 * Client Component. Collects three consents:
 *   - Terms of Service (required)
 *   - Privacy Policy (required)
 *   - Marketing communications (optional, unchecked by default)
 *
 * Calls the existing completeOnboarding() server action, then redirects
 * to /dashboard on success.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { completeOnboarding } from '@/lib/supabase/actions'

export function OnboardingForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = terms && privacy && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    startTransition(async () => {
      try {
        await completeOnboarding({ marketingConsent: marketing })
        router.push('/dashboard')
      } catch {
        setError('Něco se pokazilo. Zkuste to prosím znovu.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Terms of Service */}
      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={terms}
          onChange={e => setTerms(e.target.checked)}
          required
          style={checkboxStyle}
          aria-required="true"
        />
        <span style={{ lineHeight: 1.5 }}>
          Souhlasím s{' '}
          <Link href="/terms" target="_blank" style={linkStyle}>
            Podmínkami používání
          </Link>
          <RequiredMark />
        </span>
      </label>

      {/* Privacy Policy */}
      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={privacy}
          onChange={e => setPrivacy(e.target.checked)}
          required
          style={checkboxStyle}
          aria-required="true"
        />
        <span style={{ lineHeight: 1.5 }}>
          Souhlasím se{' '}
          <Link href="/privacy" target="_blank" style={linkStyle}>
            Zpracováním osobních údajů
          </Link>
          {' '}a beru na vědomí{' '}
          <Link href="/gdpr" target="_blank" style={linkStyle}>
            GDPR informace
          </Link>
          <RequiredMark />
        </span>
      </label>

      {/* Marketing (optional) */}
      <label style={{ ...labelStyle, marginBottom: 'var(--space-xl)' }}>
        <input
          type="checkbox"
          checked={marketing}
          onChange={e => setMarketing(e.target.checked)}
          style={checkboxStyle}
        />
        <span style={{ lineHeight: 1.5 }}>
          Souhlasím se zasíláním novinek a nabídek e-mailem
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginLeft: 4 }}>
            (nepovinné)
          </span>
        </span>
      </label>

      {/* Required note */}
      <p style={{
        fontSize: '0.72rem',
        color: 'var(--color-text-subtle)',
        marginBottom: 'var(--space-lg)',
      }}>
        <RequiredMark /> Povinné pole
      </p>

      {/* Error */}
      {error && (
        <div
          className="alert alert--error"
          role="alert"
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
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
        {isPending ? 'Ukládám...' : 'Začít používat PrávníkAI'}
      </button>

    </form>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
