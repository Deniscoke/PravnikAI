'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ReviewResult } from '@/components/review/ReviewResult'
import type { ReviewContractResponse } from '@/lib/review/types'
import { localeToJurisdiction, type Locale } from '@/lib/contracts/types'
import { useLocale, useTranslations } from '@/lib/i18n/client'
import { format as formatMsg } from '@/lib/i18n'
import type { Messages } from '@/lib/i18n/messages/cs'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UserMenu } from '@/components/auth/UserMenu'

// Hint values stay aligned with legacy CZ review prompt examples (backend is CZ-only today).
type TypeOptionKey = keyof Messages['reviewPage']['typeOptions']

const CONTRACT_HINT_ORDER: readonly { key: TypeOptionKey; apiValue: string }[] = [
  { key: 'auto', apiValue: '' },
  { key: 'purchase', apiValue: 'Kupní smlouva' },
  { key: 'work', apiValue: 'Smlouva o dílo' },
  { key: 'tenancy', apiValue: 'Nájemní smlouva' },
  { key: 'employment', apiValue: 'Pracovní smlouva' },
  { key: 'nda', apiValue: 'Smlouva o mlčenlivosti (NDA)' },
  { key: 'mandate', apiValue: 'Mandátní smlouva' },
  { key: 'license', apiValue: 'Licenční smlouva' },
  { key: 'gift', apiValue: 'Darovací smlouva' },
  { key: 'loan', apiValue: 'Smlouva o půjčce' },
  { key: 'other', apiValue: 'Jiný typ' },
]

function localeToNumberFormat(locale: Locale): string {
  if (locale === 'cs') return 'cs-CZ'
  if (locale === 'de') return 'de-DE'
  return 'en-GB'
}

// ── Page state ──────────────────────────────────────────────────────────────

type PageState = 'input' | 'reviewing' | 'result' | 'error'

// ── Page ────────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const locale = useLocale()
  const t = useTranslations()
  const jurisdiction = localeToJurisdiction(locale)
  const numberLocale = localeToNumberFormat(locale)

  const reviewSteps = useMemo(
    () => [t.reviewPage.step1, t.reviewPage.step2, t.reviewPage.step3, t.reviewPage.step4, t.reviewPage.step5],
    [t],
  )

  const contractTypeOptions = useMemo(
    () =>
      CONTRACT_HINT_ORDER.map(({ key, apiValue }) => ({
        value: apiValue,
        label: t.reviewPage.typeOptions[key],
      })),
    [t],
  )

  const [pageState, setPageState] = useState<PageState>('input')
  const [contractText, setContractText] = useState('')
  const [contractTypeHint, setContractTypeHint] = useState('')
  const [result, setResult] = useState<ReviewContractResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewStep, setReviewStep] = useState(0)

  // ── Async safety: AbortController + request identity ─────────────────────
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)
  const pageStateRef = useRef<PageState>(pageState)
  pageStateRef.current = pageState

  const cancelReview = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelReview() }
  }, [cancelReview])

  // Animate review steps
  useEffect(() => {
    if (pageState !== 'reviewing') return
    setReviewStep(0)
    const interval = setInterval(() => {
      setReviewStep((s) => (s < reviewSteps.length - 1 ? s + 1 : s))
    }, 3000)
    return () => clearInterval(interval)
  }, [pageState, reviewSteps.length])

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    const trimmed = contractText.trim()
    if (trimmed.length < 50) return // client-side guard

    setIsSubmitting(true)
    cancelReview()

    const controller = new AbortController()
    abortControllerRef.current = controller
    const requestId = ++activeRequestIdRef.current

    setPageState('reviewing')
    pageStateRef.current = 'reviewing'

    try {
      const res = await fetch('/api/review-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText: trimmed,
          ...(contractTypeHint ? { contractTypeHint } : {}),
        }),
        signal: controller.signal,
      })

      const data = await res.json()

      // Stale response guard
      if (pageStateRef.current !== 'reviewing') return
      if (requestId !== activeRequestIdRef.current) return

      if (!res.ok) {
        abortControllerRef.current = null
        const base = typeof data.error === 'string' ? data.error : t.reviewPage.fetchErrorFallback
        const hint =
          typeof data.hint === 'string' && data.hint.trim() !== '' ? data.hint.trim() : ''
        setErrorMessage(hint ? `${base}\n\n${hint}` : base)
        setPageState('error')
        return
      }

      abortControllerRef.current = null
      setResult(data as ReviewContractResponse)
      setPageState('result')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      if (pageStateRef.current !== 'reviewing') return
      if (requestId !== activeRequestIdRef.current) return
      abortControllerRef.current = null
      setErrorMessage(t.reviewPage.networkError)
      setPageState('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNewReview() {
    cancelReview()
    setPageState('input')
    setResult(null)
    setErrorMessage(null)
    setContractText('')
    setContractTypeHint('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRetry() {
    cancelReview()
    setPageState('input')
    setErrorMessage(null)
  }

  const charCount = contractText.trim().length
  const isValid = charCount >= 50

  const crumbStateLabel =
    pageState === 'reviewing'
      ? t.reviewPage.crumbAnalyzing
      : pageState === 'result'
        ? t.reviewPage.crumbResults
        : pageState === 'error'
          ? t.reviewPage.crumbError
          : ''

  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', padding: '0 var(--space-md)' }}>
      {/* ── Top bar ── */}
      <header style={{ maxWidth: 920, margin: '0 auto', padding: 'var(--space-xl) 0 var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          <LanguageSwitcher />
          <UserMenu />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <Link href={`/${locale}`} style={{ textDecoration: 'none' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2 }}>
                {t.meta.siteName}
              </h1>
            </Link>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: 2 }}>
              {t.nav.review} · {t.jurisdiction.legal[jurisdiction]}
            </p>
          </div>

          {pageState !== 'input' && crumbStateLabel && (
            <nav style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.8rem' }}>
              <button type="button" onClick={handleNewReview} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-aqua)', fontSize: '0.8rem', padding: 0 }}>
                {t.reviewPage.crumbReview}
              </button>
              <span style={{ color: 'var(--color-text-subtle)' }} aria-hidden="true">›</span>
              <span style={{ color: 'var(--color-text)' }}>{crumbStateLabel}</span>
            </nav>
          )}
        </div>

        {/* Legal basis notice */}
        <div className="alert alert--info" style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            {formatMsg(t.reviewPage.notice, { law: t.jurisdiction.legal.CZ })}
          </span>
        </div>
      </header>

      {/* ── Content ── */}
      <div style={{ maxWidth: 920, margin: '0 auto', paddingBottom: 'var(--space-3xl)' }}>

        {/* STATE: input */}
        {pageState === 'input' && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--color-text-muted)' }}>
              {t.reviewPage.inputSectionTitle}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="glass-card form-section" style={{ padding: 'var(--space-xl)' }}>
                <div className="glass-input-wrap form-field--full">
                  <label className="glass-input-label" htmlFor="contract-text">
                    {t.reviewPage.contractLabel}
                    <span className="required-mark" aria-hidden="true"> *</span>
                  </label>
                  <textarea
                    id="contract-text"
                    className="glass-input glass-textarea"
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    placeholder={t.reviewPage.contractPlaceholder}
                    rows={14}
                    required
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '0.88rem', lineHeight: 1.7 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-xs)' }}>
                    <span className="glass-input-helper">
                      {t.reviewPage.contractHelper}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', fontFamily: 'monospace',
                      color: isValid ? 'var(--accent-aqua)' : 'var(--color-text-subtle)',
                    }}>
                      {formatMsg(t.reviewPage.charCounter, {
                        count: charCount.toLocaleString(numberLocale),
                      })}
                    </span>
                  </div>
                </div>

                <div className="glass-input-wrap" style={{ marginTop: 'var(--space-md)', maxWidth: 360 }}>
                  <label className="glass-input-label" htmlFor="contract-type-hint">
                    {t.reviewPage.typeHintLabel}
                  </label>
                  <select
                    id="contract-type-hint"
                    className="glass-input glass-select"
                    value={contractTypeHint}
                    onChange={(e) => setContractTypeHint(e.target.value)}
                  >
                    {contractTypeOptions.map((opt) => (
                      <option key={`${opt.label}-${opt.value}`} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className="glass-input-helper">
                    {t.reviewPage.typeHintHelper}
                  </span>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 'var(--space-lg)' }}>
                <button
                  type="submit"
                  className="glass-btn glass-btn--primary form-submit-btn"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerIcon />
                      {t.reviewPage.submitAnalyzing}
                    </>
                  ) : (
                    <>
                      <SearchIcon />
                      {t.reviewPage.submitIdle}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Trust markers */}
            <div className="trust-bar" style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-2xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--glass-border-subtle)' }}>
              <TrustMarker icon={<ShieldIcon />} text={t.reviewPage.trustServer} />
              <TrustMarker icon={<LockIcon />} text={t.reviewPage.trustNoPersist} />
              <TrustMarker icon={<ScaleIcon />} text={t.reviewPage.trustJurisdictionContext} />
              <TrustMarker icon={<CheckCircleIcon />} text={t.reviewPage.trustStructured} />
            </div>
          </section>
        )}

        {/* STATE: reviewing */}
        {pageState === 'reviewing' && (
          <section aria-live="polite" aria-busy="true">
            <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1.5s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                {t.reviewPage.analyzingTitle}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                {t.reviewPage.analyzingSubtitle}
              </p>

              <div style={{ maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
                {reviewSteps.map((step, i) => (
                  <div
                    key={step}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                      padding: '8px 0',
                      opacity: i <= reviewStep ? 1 : 0.3,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {i < reviewStep ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : i === reviewStep ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-aqua)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--glass-border)' }} />
                    )}
                    <span style={{ fontSize: '0.82rem', color: i <= reviewStep ? 'var(--color-text)' : 'var(--color-text-subtle)' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--space-xl)', opacity: 0.5 }}>
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--short" />
              </div>
            </div>
          </section>
        )}

        {/* STATE: error */}
        {pageState === 'error' && (
          <section>
            <div className="alert alert--error" style={{ marginBottom: 'var(--space-lg)', whiteSpace: 'pre-line' }}>
              <strong>{t.reviewPage.errorDetailPrefix}</strong> {errorMessage}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button type="button" className="glass-btn glass-btn--primary" onClick={handleRetry}>
                {t.reviewPage.retry}
              </button>
              <button type="button" className="glass-btn glass-btn--ghost" onClick={handleNewReview}>
                {t.reviewPage.newReview}
              </button>
            </div>
          </section>
        )}

        {/* STATE: result */}
        {pageState === 'result' && result && (
          <ReviewResult result={result} onNewReview={handleNewReview} />
        )}
      </div>
    </main>
  )
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function TrustMarker({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.78rem', color: 'var(--color-text-subtle)' }}>
      <span style={{ color: 'var(--accent-aqua)', display: 'flex', opacity: 0.7 }}>{icon}</span>
      {text}
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}

function SpinnerIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
}

function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}

function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}

function ScaleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4z"/><path d="M16 3h6v15h-7c-1.7 0-3 1.3-3 3V7c0-2.2 1.8-4 4-4z"/></svg>
}

function CheckCircleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
