/**
 * Stripe server-side client — PrávníkAI
 *
 * Singleton instance used by all billing API routes and helpers.
 * Imported ONLY on the server — never reaches the browser bundle.
 *
 * Uses the secret key from env. The key is validated at import time
 * so a misconfigured deployment fails fast instead of silently.
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    '[billing] STRIPE_SECRET_KEY is not set. Add it to .env.local.',
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
  appInfo: {
    name: 'PrávníkAI',
    version: '0.1.0',
  },
})
