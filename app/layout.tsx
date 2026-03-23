import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CookieConsent } from '@/components/CookieConsent'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pravnik-ai-five.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'PrávníkAI — AI právní asistent',
    template: '%s — PrávníkAI',
  },
  description: 'AI generátor a kontrola právních smluv pro českou právní praxi. Vytvořte profesionální smlouvy za minuty.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: APP_URL,
    siteName: 'PrávníkAI',
    title: 'PrávníkAI — AI právní asistent',
    description: 'Generujte a kontrolujte právní smlouvy pomocí AI. Profesionální výstup pro české právo.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrávníkAI — AI právní asistent',
    description: 'Generujte a kontrolujte právní smlouvy pomocí AI. Profesionální výstup pro české právo.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get initial user for SSR hydration — prevents auth flash
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="cs" data-theme="dark" suppressHydrationWarning>
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
          href="https://fonts.googleapis.com/css2?family=Italiana&family=DM+Sans:wght@400;500;600;700&display=swap"
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
