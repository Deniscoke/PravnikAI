'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'pravo365-beta-banner-dismissed'

/**
 * Sets expectations before anyone hits a limit: the product is in beta, daily
 * AI capacity is capped, and feedback is wanted. Dismissible, remembered locally
 * so it does not nag on every visit.
 */
export function BetaBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) !== '1') setVisible(true)
    } catch {
      // Private mode or storage disabled — show it, it is harmless.
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Not remembering the choice is acceptable.
    }
  }

  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        padding: '8px var(--space-md)',
        background: 'rgba(94, 231, 223, 0.08)',
        borderBottom: '1px solid var(--glass-border-subtle)',
        fontSize: '0.78rem',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}
    >
      <span>
        <strong style={{ color: 'var(--color-text)' }}>Beta verze</strong>
        {' — '}
        službu průběžně vylepšujeme a denní kapacita AI je omezená. Narazili jste na chybu? Napište nám přes tlačítko vpravo dole.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Skrýt upozornění o beta verzi"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-subtle)',
          cursor: 'pointer',
          fontSize: '0.78rem',
          textDecoration: 'underline',
          padding: 0,
        }}
      >
        Rozumím
      </button>
    </div>
  )
}
