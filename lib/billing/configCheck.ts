/**
 * Safe Stripe billing config checks — never exposes secret values.
 */

export interface BillingConfigStatus {
  ok: boolean
  issues: string[]
  checks: {
    secretKey: 'ok' | 'missing' | 'too_short' | 'wrong_prefix_pk' | 'wrong_prefix_other'
    priceIds: number
    webhookSecret: boolean
    serviceRole: boolean
    appUrl: string | null
  }
}

export function getBillingConfigStatus(): BillingConfigStatus {
  const issues: string[] = []
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? ''

  let secretKey: BillingConfigStatus['checks']['secretKey'] = 'ok'
  if (!key) {
    secretKey = 'missing'
    issues.push('Chybí STRIPE_SECRET_KEY na serveru (Vercel → Environment Variables).')
  } else if (key.startsWith('pk_')) {
    secretKey = 'wrong_prefix_pk'
    issues.push('STRIPE_SECRET_KEY je Publishable key (pk_...) — použijte Secret key (sk_live_...).')
  } else if (!key.startsWith('sk_')) {
    secretKey = 'wrong_prefix_other'
    issues.push(
      `STRIPE_SECRET_KEY má neplatný tvar (začína „${key.slice(0, 3)}…“). ` +
      'Ze Stripe Dashboard → Developers → API keys zkopírujte celý Secret key (sk_live_...).',
    )
  } else if (key.length < 50) {
    secretKey = 'too_short'
    issues.push(
      'STRIPE_SECRET_KEY je příliš krátký — zkopírovali jste celý Secret key? (obvykle 100+ znaků).',
    )
  }

  const priceIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    process.env.STRIPE_TEAM_MONTHLY_PRICE_ID,
  ].filter((id) => id?.startsWith('price_')).length

  if (priceIds === 0) {
    issues.push('Chybí STRIPE_*_PRICE_ID — doplňte Price ID ze Stripe Product catalog.')
  } else if (priceIds < 3) {
    issues.push(`Nastaveno jen ${priceIds}/3 Price ID — zkontrolujte Pro monthly/yearly a Team monthly.`)
  }

  const webhookSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_'))
  if (!webhookSecret) {
    issues.push('Chybí STRIPE_WEBHOOK_SECRET (whsec_...) — tarif se po platbě neaktivuje.')
  }

  const serviceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ'))
  if (!serviceRole) {
    issues.push('Chybí SUPABASE_SERVICE_ROLE_KEY — nelze vytvořit Stripe zákazníka.')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || null
  if (appUrl?.includes('localhost')) {
    issues.push('NEXT_PUBLIC_APP_URL ukazuje na localhost — na Vercel Production nastavte https://pravo365.cz')
  }

  return {
    ok: issues.length === 0,
    issues,
    checks: {
      secretKey,
      priceIds,
      webhookSecret,
      serviceRole,
      appUrl,
    },
  }
}
