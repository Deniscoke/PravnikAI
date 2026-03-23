/**
 * GET /auth/callback
 *
 * OAuth PKCE callback handler for Google sign-in via Supabase Auth.
 *
 * Flow:
 *   1. Google redirects here with an authorization code
 *   2. We exchange the code for a session (sets cookies)
 *   3. Redirect to the intended destination (default: /dashboard)
 *
 * Security:
 *   - Uses PKCE flow (code verifier stored in cookie, not URL)
 *   - No client secret exposed to browser
 *   - Session cookies are httpOnly, secure, sameSite
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful auth — redirect to intended destination
      return NextResponse.redirect(`${origin}${redirect}`)
    }

    console.error('[auth/callback] Code exchange failed:', error.message)
  }

  // Auth failed — redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
