'use client'

/**
 * Cookie consent banner — minimal transparency for essential cookies only.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from '@/lib/i18n/client'

const CONSENT_KEY = 'pravnik-cookie-consent'

export function CookieConsent() {
  const locale = useLocale()
  const t = useTranslations()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  function handleAccept() {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="alert" aria-live="polite">
      <p className="cookie-banner__text">
        {t.cookies.bannerText}{' '}
        <Link href={`/${locale}/gdpr`}>{t.cookies.learnMore}</Link>
      </p>
      <button
        type="button"
        className="cookie-banner__btn"
        onClick={handleAccept}
        aria-label={t.cookies.acceptAria}
      >
        {t.cookies.accept}
      </button>
    </div>
  )
}
