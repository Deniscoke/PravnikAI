import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CookieConsent } from '@/components/CookieConsent'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, SEO_DESCRIPTION_DEFAULT, SITE_NAME } from '@/lib/seo/site'
import { getMessages, coerceLocale } from '@/lib/i18n'

const APP_URL = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — AI legal contract drafting (CZ · DE · UK)`,
    template: '%s — PrávníkAI',
  },
  description: SEO_DESCRIPTION_DEFAULT,
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI legal contract drafting`,
    description: SEO_DESCRIPTION_DEFAULT,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — AI legal contract drafting`,
    description: SEO_DESCRIPTION_DEFAULT,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get initial user for SSR hydration — prevents auth flash
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve locale from middleware-injected header so <html lang> is correct.
  // Falls back to 'cs' for routes outside the [locale] segment (e.g. /api).
  const headerList = await headers()
  const headerLocale = coerceLocale(headerList.get('x-locale'))
  const t = getMessages(headerLocale)

  return (
    <html lang={t.meta.htmlLang} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('glass-theme');
              if (t) document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Animated background blobs — visible on all pages */}
        <div className="scene" aria-hidden="true">
          <div className="scene__blob scene__blob--1" />
          <div className="scene__blob scene__blob--2" />
          <div className="scene__blob scene__blob--3" />
        </div>
        <ThemeToggle />
        <AuthProvider initialUser={user ?? null}>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}
