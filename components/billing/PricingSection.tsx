'use client'

/**
 * PricingSection — PrávníkAI
 *
 * Client component — renders pricing cards for all three tiers.
 * Handles monthly/yearly toggle, checkout redirect, and loading states.
 *
 * Calls POST /api/billing/checkout → receives Stripe Checkout URL → redirect.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_INFO, TEAM_CHECKOUT_ENABLED, type SubscriptionTier, type BillingInterval } from '@/lib/billing/plans'
import { SubscriptionRefreshButton } from './SubscriptionRefreshButton'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLocale, useTranslations } from '@/lib/i18n/client'

// ─── Icons ───────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false">
      <path d="M2.5 7.5L6 11L12.5 4" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" focusable="false"
      style={{ animation: 'pravnik-spin 0.65s linear infinite' }}>
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M13 7.5a5.5 5.5 0 0 0-5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingSectionProps {
  /** Current authenticated user's subscription tier (for UI state only — guard enforces real tier) */
  currentTier: SubscriptionTier
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PricingSection({ currentTier }: PricingSectionProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const { user } = useAuth()
  const base = `/${locale}`
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleUpgrade(tier: SubscriptionTier) {
    if (tier === 'free' || tier === currentTier || loadingTier) return

    if (!user) {
      router.push(`${base}/login?redirect=${encodeURIComponent(`${base}/dashboard#cenik`)}`)
      return
    }

    setErrorMessage(null)
    setLoadingTier(tier)
    try {
      const checkoutInterval: BillingInterval =
        tier === 'team' ? 'monthly' : interval

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval: checkoutInterval, locale }),
      })

      let data: { url?: string; error?: string; issues?: string[] } = {}
      const contentType = res.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        data = await res.json()
      }

      if (res.status === 401) {
        router.push(`${base}/login?redirect=${encodeURIComponent(`${base}/dashboard#cenik`)}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
        return
      }

      if (data.error) {
        setErrorMessage(data.error)
        return
      }

      // Fallback: fetch server-side billing config hints for logged-in users
      try {
        const statusRes = await fetch('/api/billing/status')
        if (statusRes.ok) {
          const status = await statusRes.json() as { issues?: string[] }
          if (status.issues?.length) {
            setErrorMessage(status.issues.join(' '))
            return
          }
        }
      } catch {
        /* ignore */
      }

      setErrorMessage(`${t.billing.checkoutError} (${res.status})`)
    } catch (err) {
      console.error('[billing] Checkout request failed:', err)
      setErrorMessage(t.billing.checkoutError)
    } finally {
      setLoadingTier(null)
    }
  }

  const tiers: SubscriptionTier[] = ['free', 'pro', 'team']

  return (
    <section aria-labelledby="pricing-heading" style={{ marginTop: 'var(--space-3xl)' }}>

      {errorMessage && (
        <div className="alert alert--error" style={{ marginBottom: 'var(--space-lg)' }} role="alert">
          {errorMessage}
        </div>
      )}

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h2 id="pricing-heading" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 'var(--space-xs)',
          lineHeight: 1.2,
        }}>
          Vyberte svůj tarif
        </h2>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Začněte zdarma. Přejděte na Pro kdykoli — bez závazků.
        </p>

        {/* ── Monthly / Yearly toggle ───────────────────────────────────── */}
        <div
          role="group"
          aria-label="Fakturační interval"
          style={{
            display: 'inline-flex',
            marginTop: 'var(--space-lg)',
            background: 'var(--glass-white)',
            border: '1px solid var(--glass-border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: 4,
            gap: 2,
            backdropFilter: 'var(--blur-sm)',
          }}
        >
          {(['monthly', 'yearly'] as BillingInterval[]).map((i) => {
            const active = interval === i
            return (
              <button
                key={i}
                onClick={() => setInterval(i)}
                aria-pressed={active}
                style={{
                  padding: '6px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  transition: `background var(--dur-fast) var(--ease-smooth),
                               color var(--dur-fast) var(--ease-smooth)`,
                  background: active
                    ? 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))'
                    : 'transparent',
                  color: active ? '#0b0e1a' : 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {i === 'monthly' ? 'Měsíčně' : 'Ročně'}
                {i === 'yearly' && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    background: active ? 'rgba(0,0,0,0.18)' : 'rgba(94,231,223,0.15)',
                    color: active ? '#0b0e1a' : 'var(--accent-aqua)',
                    padding: '1px 7px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    −21%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Plan cards ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(258px, 1fr))',
        gap: 'var(--space-md)',
        alignItems: 'stretch',
      }}>
        {tiers.map((tier) => {
          const plan      = PLAN_INFO[tier]
          const isPro     = tier === 'pro'
          const isCurrent = tier === currentTier
          const isLoading = loadingTier === tier
          const teamDisabled = tier === 'team' && !TEAM_CHECKOUT_ENABLED
          const price     = tier === 'team' || interval === 'monthly' || plan.pricing.yearlyPerMonth == null
            ? plan.pricing.monthly
            : plan.pricing.yearlyPerMonth
          const showYearlyNote = tier !== 'team' && interval === 'yearly' && plan.pricing.yearlyPerMonth != null

          // ── Card inner ──────────────────────────────────────────────────
          const inner = (
            <article
              aria-label={`Tarif ${plan.name}`}
              style={{
                background: isPro
                  ? 'linear-gradient(160deg, rgba(94,231,223,0.09) 0%, rgba(180,144,245,0.13) 100%)'
                  : 'var(--glass-white)',
                backdropFilter: 'var(--blur-md)',
                WebkitBackdropFilter: 'var(--blur-md)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isPro ? 'var(--shadow-float)' : 'var(--shadow-glass)',
                height: '100%',
                minHeight: 400,
              }}
            >
              {/* Reflection shimmer (Pro only) */}
              {isPro && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
                  background: 'var(--reflection-top)',
                  pointerEvents: 'none',
                  borderRadius: 'inherit',
                }} aria-hidden="true" />
              )}

              {/* Top badges row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                minHeight: isCurrent || plan.badge ? 28 : 0,
              }}>
                {isCurrent ? (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em',
                    color: 'var(--color-text-muted)',
                    background: 'var(--glass-white)',
                    border: '1px solid var(--glass-border)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    Aktuální tarif
                  </span>
                ) : <span />}

                {plan.badge && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
                    background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
                    color: '#0b0e1a',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Plan name + description */}
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.45rem',
                  color: 'var(--color-text)',
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: price === 0 ? '1.9rem' : '2.5rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: isPro ? 'var(--accent-aqua)' : 'var(--color-text)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {price === 0 ? 'Zdarma' : `${price} €`}
                </span>
                {price > 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', lineHeight: 1.4 }}>
                    / měsíc
                    {showYearlyNote && (
                      <><br /><span style={{ fontSize: '0.72rem' }}>účtováno ročně</span></>
                    )}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--glass-border-subtle)', margin: '0 -2px' }} aria-hidden="true" />

              {/* Feature list */}
              <ul
                role="list"
                aria-label={`Funkce tarifu ${plan.name}`}
                style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                }}
              >
                {plan.features.map((feature) => (
                  <li key={feature} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '0.84rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.45,
                  }}>
                    <span style={{
                      color: isPro ? 'var(--accent-aqua)' : 'var(--accent-violet)',
                      flexShrink: 0,
                      marginTop: 2,
                    }} aria-hidden="true">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                onClick={() => handleUpgrade(tier)}
                disabled={isCurrent || tier === 'free' || !!loadingTier || teamDisabled}
                aria-label={
                  isCurrent
                    ? `${plan.name} — aktuální tarif`
                    : teamDisabled
                      ? `${plan.name} — brzy k dispozici`
                      : `Přejít na tarif ${plan.name}`
                }
                style={{
                  marginTop: 'auto',
                  padding: '11px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: isPro ? 'none' : '1px solid var(--glass-border)',
                  cursor: (isCurrent || tier === 'free' || teamDisabled) ? 'default' : 'pointer',
                  fontSize: '0.87rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  transition: `opacity var(--dur-fast) var(--ease-smooth),
                               transform var(--dur-fast) var(--ease-liquid),
                               box-shadow var(--dur-fast) var(--ease-smooth)`,
                  background: (isPro && !isCurrent)
                    ? 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))'
                    : 'var(--glass-white-md)',
                  color: (isPro && !isCurrent) ? '#0b0e1a' : 'var(--color-text)',
                  boxShadow: (isPro && !isCurrent)
                    ? '0 4px 20px rgba(94,231,223,0.28)'
                    : 'none',
                  opacity: (tier === 'free' && !isCurrent) || teamDisabled ? 0.45 : 1,
                }}
                onMouseEnter={e => {
                  if (!isCurrent && tier !== 'free' && !loadingTier) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                    if (isPro) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(94,231,223,0.38)'
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                  if (isPro) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(94,231,223,0.28)'
                }}
              >
                {isLoading ? (
                  <><SpinnerIcon /> {t.billing.checkoutRedirecting}</>
                ) : isCurrent ? (
                  '✓ Aktuální tarif'
                ) : tier === 'free' ? (
                  'Základní tarif'
                ) : tier === 'team' ? (
                  teamDisabled ? 'Již brzy' : 'Přejít na Tým'
                ) : (
                  'Přejít na Pro'
                )}
              </button>
            </article>
          )

          // Pro tier: gradient border wrapper (scale + glow)
          if (isPro) {
            return (
              <div
                key={tier}
                style={{
                  background: 'linear-gradient(135deg, var(--accent-aqua), var(--accent-violet))',
                  borderRadius: 'calc(var(--radius-xl) + 2px)',
                  padding: 2,
                  transform: 'scale(1.025)',
                  transformOrigin: 'center',
                  filter: 'drop-shadow(0 0 20px rgba(94,231,223,0.22))',
                }}
              >
                {inner}
              </div>
            )
          }

          return (
            <div
              key={tier}
              style={{
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--glass-border-subtle)',
              }}
            >
              {inner}
            </div>
          )
        })}
      </div>

      {/* ── Footer note ───────────────────────────────────────────────────── */}
      {/*
        Outside the paragraph below: the button renders a <div>, and a <div>
        inside a <p> is invalid HTML. React recovered by reordering the DOM,
        which failed hydration and left this whole section — the pricing CTAs
        included — inert on first load.
      */}
      <SubscriptionRefreshButton />

      <p style={{
        textAlign: 'center',
        fontSize: '0.76rem',
        color: 'var(--color-text-subtle)',
        marginTop: 'var(--space-md)',
        lineHeight: 1.6,
      }}>
        Bezpečná platba přes Stripe · Zrušení kdykoli bez poplatku
        <br />
        Podpora:{' '}
        <a
          href="mailto:info.indiweb@gmail.com"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}
        >
          info.indiweb@gmail.com
        </a>
        {' '}· +420 728 523 267
      </p>
    </section>
  )
}
