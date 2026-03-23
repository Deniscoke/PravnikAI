'use client'

/**
 * Cookie consent banner — PrávníkAI
 *
 * Minimal GDPR-compliant cookie banner. Since we only use essential
 * technical cookies (Supabase auth session), we technically don't need
 * opt-in consent under ePrivacy Directive Art. 5(3). However, displaying
 * the banner builds trust and informs users about cookie usage.
 *
 * The consent state is stored in localStorage (not a cookie, to avoid
 * the irony of using a cookie to track cookie consent).
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'pravnik-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user has already acknowledged
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable — show banner
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted')
    } catch {
      // Silently fail if localStorage is blocked
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="alert" aria-live="polite">
      <p className="cookie-banner__text">
        Používáme pouze nezbytné technické cookies pro přihlášení.
        Žádné reklamní ani analytické cookies.{' '}
        <Link href="/gdpr">Více informací</Link>
      </p>
      <button
        className="cookie-banner__btn"
        onClick={handleAccept}
        aria-label="Rozumím, zavřít informaci o cookies"
      >
        Rozumím
      </button>
    </div>
  )
}
