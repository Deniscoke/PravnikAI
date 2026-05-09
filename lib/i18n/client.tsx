'use client'

/**
 * Client-side i18n provider and hook.
 *
 * The current locale is determined by the layout (it reads the URL segment)
 * and passed to <I18nProvider locale="cs"> in app/[locale]/layout.tsx.
 * Client components then use:
 *
 *   const t = useTranslations()
 *   <h1>{t.home.kicker}</h1>
 *
 *   const locale = useLocale() // 'cs' | 'de' | 'en'
 */

import React, { createContext, useContext } from 'react'
import { getMessages, type Messages } from './index'
import { DEFAULT_LOCALE, type Locale } from '@/lib/contracts/types'

interface I18nContextValue {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value: I18nContextValue = {
    locale,
    messages: getMessages(locale),
  }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/**
 * Returns the current locale's message bag. Falls back to the default-locale
 * bag when no <I18nProvider> is mounted (test environments, Storybook, etc.)
 * so utility components stay testable in isolation.
 */
export function useTranslations(): Messages {
  const ctx = useContext(I18nContext)
  return ctx?.messages ?? getMessages(DEFAULT_LOCALE)
}

/** Returns the current locale string (defaults to DEFAULT_LOCALE outside the provider). */
export function useLocale(): Locale {
  const ctx = useContext(I18nContext)
  return ctx?.locale ?? DEFAULT_LOCALE
}
