/**
 * Stripe server-side client — PrávníkAI
 *
 * Singleton instance used by all billing API routes and helpers.
 * Imported ONLY on the server — never reaches the browser bundle.
 *
 * Uses lazy initialization so Next.js build does not fail when
 * STRIPE_SECRET_KEY is absent at build time (e.g. on Vercel CI).
 * The error is thrown at runtime when the client is first used.
 */

import Stripe from 'stripe'

let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (_stripe) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      '[billing] STRIPE_SECRET_KEY is not set. Add it to your environment variables.',
    )
  }

  _stripe = new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
    appInfo: {
      name: 'PrávníkAI',
      version: '0.1.0',
    },
  })

  return _stripe
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})
