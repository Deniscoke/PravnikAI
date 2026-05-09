'use client'

/**
 * Language / jurisdiction switcher.
 *
 * Drops a small button group in the page header. Clicking a locale
 * navigates the user to the same logical path under the new locale prefix
 * (e.g. /cs/generator → /de/generator) and persists the choice in the
 * `pravnikai-locale` cookie so the middleware lands them there next time.
 */

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { useLocale, useTranslations } from '@/lib/i18n/client'
import { ALL_LOCALES, localeToJurisdiction, type Locale } from '@/lib/contracts/types'

const LOCALE_COOKIE = 'pravnikai-locale'
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

const FLAG: Record<Locale, string> = {
  cs: '🇨🇿',
  de: '🇩🇪',
  en: '🇬🇧',
}

interface Props {
  /** Visual variant — 'inline' for header bars, 'menu' for dropdown menus. */
  variant?: 'inline' | 'menu'
  /** Custom inline style override applied to the root element. */
  style?: React.CSSProperties
}

export function LanguageSwitcher({ variant = 'inline', style }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()

  function switchTo(target: Locale) {
    if (target === locale) return

    // Persist preference so middleware lands the user on the same locale next visit
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`

    // Replace the leading /<locale>/ segment with the new locale
    const localePrefix = `/${locale}`
    const tail = pathname === localePrefix
      ? ''
      : pathname.startsWith(`${localePrefix}/`)
        ? pathname.slice(localePrefix.length)
        : pathname

    const targetPath = `/${target}${tail}` || `/${target}`

    startTransition(() => {
      router.push(targetPath)
      router.refresh()
    })
  }

  const buttonStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 10px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
    fontFamily: 'inherit',
  }

  const activeStyle: React.CSSProperties = {
    background: 'rgba(94,231,223,0.10)',
    borderColor: 'rgba(94,231,223,0.45)',
    color: 'var(--accent-aqua)',
  }

  return (
    <div
      role="group"
      aria-label={t.nav.languageMenuLabel}
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        opacity: isPending ? 0.6 : 1,
        ...style,
      }}
    >
      {ALL_LOCALES.map((l) => {
        const isActive = l === locale
        const jurisdiction = localeToJurisdiction(l)
        const labelShort = t.jurisdiction.short[jurisdiction]
        return (
          <button
            key={l}
            onClick={() => switchTo(l)}
            disabled={isActive || isPending}
            aria-pressed={isActive}
            aria-label={`${t.locale[l]} (${t.jurisdiction.full[jurisdiction]})`}
            title={t.jurisdiction.full[jurisdiction]}
            style={{
              ...buttonStyle,
              ...(isActive ? activeStyle : {}),
              cursor: isActive ? 'default' : 'pointer',
            }}
          >
            <span aria-hidden="true">{FLAG[l]}</span>
            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{labelShort}</span>
            {variant === 'menu' && (
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{t.locale[l]}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
