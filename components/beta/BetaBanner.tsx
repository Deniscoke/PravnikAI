'use client'

import { useState } from 'react'

const DISMISS_KEY = 'pravo365-beta-banner-dismissed'

/**
 * Sets expectations before anyone hits a limit: the product is in beta, daily
 * AI capacity is capped, and feedback is wanted. Dismissible, remembered locally
 * so it does not nag on every visit.
 *
 * WHY IT RENDERS UNCONDITIONALLY
 *
 * It used to start hidden and appear in a useEffect. That cost 0.248 CLS on
 * every page of the site — the banner arrived after first paint and pushed the
 * whole document down. Google fails anything above 0.1.
 *
 * localStorage cannot be read on the server, so the decision is made before
 * paint instead: an inline script in the document head sets
 * data-beta-dismissed on <html>, and CSS hides the banner when it is there.
 * The markup is identical on both sides, so nothing moves either way — the
 * same trick the theme switch already uses to avoid a flash.
 */
export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Not remembering the choice is acceptable.
    }
    // Keeps the banner down on the next navigation before React runs.
    document.documentElement.setAttribute('data-beta-dismissed', '1')
  }

  return (
    <div
      className="beta-banner"
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
