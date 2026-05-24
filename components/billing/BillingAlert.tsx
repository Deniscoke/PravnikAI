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

  useEffect(() => {
    if (billing === 'success' || billing === 'canceled') {
      setVisible(true)
    }
  }, [billing])

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
