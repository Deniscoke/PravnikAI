import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CookieConsent } from '@/components/CookieConsent'
import { FeedbackButton } from '@/components/beta/FeedbackButton'
import { BetaBanner } from '@/components/beta/BetaBanner'
import { getSiteUrl, SEO_DESCRIPTION_DEFAULT, SITE_NAME } from '@/lib/seo/site'
import { getMessages } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/contracts/types'

const APP_URL = getSiteUrl()

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — návrhy smluv podle českého práva`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SEO_DESCRIPTION_DEFAULT,
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — návrhy smluv podle českého práva`,
    description: SEO_DESCRIPTION_DEFAULT,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — návrhy smluv podle českého práva`,
    description: SEO_DESCRIPTION_DEFAULT,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'GF2cCHy6_jRAWPxATN8FF9ne9F5vyckFnhi9acicKw4',
  },
}

/*
 * Self-hosted at build time rather than fetched from fonts.googleapis.com.
 *
 * The stylesheet link was render-blocking and sat on a third-party host, so
 * first paint depended on Google's CDN answering — and the swap when the face
 * finally arrived is a layout-shift risk on every page. next/font emits the
 * files from our own origin with the metrics inlined, which removes the
 * blocking request, the extra DNS and TLS handshakes, and the reflow.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
})

/*
 * Deliberately reads neither cookies nor headers.
 *
 * Doing either here opts the whole application out of static generation, and
 * the pages that suffer are the ones built for strangers arriving from search:
 * twenty-four guides and five comparisons that are nothing but text. The user
 * is read by ServerAuthProvider on the few surfaces that show auth UI, and the
 * locale is a constant while ACTIVE_LOCALES holds only Czech — a test fails if
 * a second locale is switched on and this is still hardcoded.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const t = getMessages(DEFAULT_LOCALE)

  return (
    <html
      lang={t.meta.htmlLang}
      data-theme="light"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme on load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('glass-theme');
              if (t) document.documentElement.setAttribute('data-theme', t);
              // Same pass decides the beta banner. Reading it here rather than
              // in an effect is what keeps the page from shifting once React
              // hydrates — see components/beta/BetaBanner.tsx.
              if (localStorage.getItem('pravo365-beta-banner-dismissed') === '1') {
                document.documentElement.setAttribute('data-beta-dismissed', '1');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        {/* Animated background blobs — visible on all pages */}
        <div className="scene" aria-hidden="true">
          <div className="scene__blob scene__blob--1" />
          <div className="scene__blob scene__blob--2" />
          <div className="scene__blob scene__blob--3" />
        </div>
        <BetaBanner />
        <ThemeToggle />
        {/*
          No AuthProvider here on purpose. It imports the Supabase browser
          client, which is 204 kB that a page of text has no use for — a
          quarter of the JavaScript on every guide. The five surfaces with auth
          UI wrap themselves in ServerAuthProvider instead.
        */}
        {children}
          <CookieConsent />
          {/* Available to signed-out visitors too — they bounce before registering */}
          <FeedbackButton />
        {/* Cookieless, GDPR-friendly traffic analytics (no consent banner needed) */}
        <Analytics />
      </body>
    </html>
  )
}
