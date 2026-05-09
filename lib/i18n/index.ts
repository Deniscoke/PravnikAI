/**
 * Type-safe i18n entry point for PrávníkAI.
 *
 * Usage (server component):
 *   import { getMessages } from '@/lib/i18n'
 *   const t = getMessages('cs')
 *   <h1>{t.home.kicker}</h1>
 *
 * Usage (client component):
 *   import { useTranslations } from '@/lib/i18n/client'
 *   const t = useTranslations()
 *
 * The default locale is 'cs'. Adding a new locale requires:
 *   1. Create lib/i18n/messages/<locale>.ts implementing the Messages type
 *   2. Add it to MESSAGES below
 *   3. Add the locale to ALL_LOCALES in lib/contracts/types.ts
 */

import { cs, type Messages } from './messages/cs'
import { de } from './messages/de'
import { en } from './messages/en'
import { ALL_LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/contracts/types'

const MESSAGES: Record<Locale, Messages> = {
  cs,
  de,
  en,
}

/** Returns the message bag for the given locale. */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
}

/** Validates an unknown string against the supported locales. */
export function isValidLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (ALL_LOCALES as readonly string[]).includes(v)
}

/**
 * Coerce an unknown value to a valid Locale, falling back to default.
 * Useful when reading dynamic route params or cookies.
 */
export function coerceLocale(v: unknown): Locale {
  return isValidLocale(v) ? v : DEFAULT_LOCALE
}

/**
 * Negotiate a locale from a raw Accept-Language header.
 * Picks the highest-quality match supported by the app.
 * Falls back to DEFAULT_LOCALE.
 */
export function negotiateLocaleFromHeader(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE

  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
        ?.slice(2)
      return {
        tag: tag.trim().toLowerCase(),
        quality: q ? Number(q) : 1,
      }
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const c of candidates) {
    const primary = c.tag.split('-')[0]
    if (primary === 'cs' || primary === 'sk') return 'cs' // SK speakers prefer CS UI
    if (primary === 'de' || primary === 'at' || primary === 'ch') return 'de'
    if (primary === 'en') return 'en'
  }

  return DEFAULT_LOCALE
}

/**
 * Simple template substitution: replace {key} placeholders with values.
 * Example: format('Hello, {name}!', { name: 'Anna' }) === 'Hello, Anna!'
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const v = values[key]
    return v === undefined ? `{${key}}` : String(v)
  })
}

export type { Messages } from './messages/cs'
export { DEFAULT_LOCALE, ALL_LOCALES } from '@/lib/contracts/types'
export type { Locale } from '@/lib/contracts/types'
