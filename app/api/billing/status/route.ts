/**
 * GET /api/billing/status
 *
 * Authenticated diagnostic — shows which billing env vars are misconfigured.
 * Never returns secret values.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBillingConfigStatus } from '@/lib/billing/configCheck'

export const runtime = 'nodejs'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = getBillingConfigStatus()
  return NextResponse.json(status)
}
