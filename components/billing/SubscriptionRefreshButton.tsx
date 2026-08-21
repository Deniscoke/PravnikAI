'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Manual repair path for a paid account still showing as free — the case where
 * the Stripe webhook never reached us. Re-reads the subscription from Stripe.
 */
export function SubscriptionRefreshButton() {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'none' | 'error'>('idle')

  async function refresh() {
    setState('loading')
    try {
      const res = await fetch('/api/billing/sync', { method: 'POST' })
      const data = (await res.json().catch(() => null)) as { synced?: boolean } | null

      if (!res.ok) {
        setState('error')
        return
      }
      if (data?.synced) {
        setState('done')
        router.refresh()
        return
      }
      setState('none')
    } catch {
      setState('error')
    }
  }

  const message =
    state === 'done' ? 'Předplatné bylo ověřeno a načteno.'
    : state === 'none' ? 'K vašemu účtu jsme nenašli aktivní předplatné.'
    : state === 'error' ? 'Ověření se nezdařilo. Zkuste to prosím znovu nebo nás kontaktujte.'
    : null

  return (
    <div style={{ marginTop: 'var(--space-sm)' }}>
      <button
        type="button"
        onClick={refresh}
        disabled={state === 'loading'}
        className="glass-btn glass-btn--ghost"
        style={{ fontSize: '0.76rem', padding: '4px 12px' }}
      >
        {state === 'loading' ? 'Ověřuji…' : 'Zaplatili jste a tarif se nezměnil? Obnovit stav'}
      </button>
      {message && (
        <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)' }} role="status">
          {message}
        </p>
      )}
    </div>
  )
}
