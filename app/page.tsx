import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { coerceLocale, negotiateLocaleFromHeader } from '@/lib/i18n'

/**
 * Root entry point — should normally be intercepted by the proxy/middleware,
 * which rewrites or redirects "/" to "/{locale}". This page is a defensive
 * fallback in case middleware does not run (e.g. during a static export).
 */
export default async function RootRedirect() {
  const headerList = await headers()
  const fromMiddleware = headerList.get('x-locale')
  const locale = fromMiddleware
    ? coerceLocale(fromMiddleware)
    : negotiateLocaleFromHeader(headerList.get('accept-language'))
  redirect(`/${locale}`)
}
