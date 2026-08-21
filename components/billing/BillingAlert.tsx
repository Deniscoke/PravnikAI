'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTranslations } from '@/lib/i18n/client'

/**
 * Shows Stripe Checkout return messages (?billing=success|canceled) on the dashboard.
 */
export function BillingAlert() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()
  const billing = searchParams.get('billing')
  const [visible, setVisible] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (billing === 'success' || billing === 'canceled') {
      setVisible(true)
    }
    if (billing !== 'success') return

    // The Stripe webhook may not have landed yet — pull the subscription state
    // ourselves so a paying customer is never shown as free.
    let cancelled = false
    setSyncing(true)
    fetch('/api/billing/sync', { method: 'POST' })
      .then(() => {
        if (!cancelled) router.refresh()
      })
      .catch(() => {
        // Non-fatal: the webhook or a manual refresh will still reconcile.
      })
      .finally(() => {
        if (!cancelled) setSyncing(false)
      })

    return () => {
      cancelled = true
    }
  }, [billing, router])

  if (!visible || (billing !== 'success' && billing !== 'canceled')) {
    return null
  }

  const isSuccess = billing === 'success'

  function dismiss() {
    setVisible(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('billing')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      className={`alert ${isSuccess ? 'alert--success' : 'alert--warning'}`}
      style={{ marginBottom: 'var(--space-lg)' }}
      role="status"
    >
      <strong>{isSuccess ? t.billing.successTitle : t.billing.canceledTitle}</strong>
      <p style={{ margin: '6px 0 0', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {isSuccess ? t.billing.successBody : t.billing.canceledBody}
      </p>
      {isSuccess && syncing && (
        <p style={{ margin: '6px 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
          Ověřuji stav předplatného…
        </p>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="glass-btn glass-btn--ghost"
        style={{ marginTop: 'var(--space-sm)', fontSize: '0.78rem', padding: '4px 12px' }}
      >
        {t.billing.dismiss}
      </button>
    </div>
  )
}
