'use client'

/**
 * User menu — shows avatar + dropdown for authenticated users,
 * or a sign-in link for anonymous visitors.
 *
 * Designed to sit in page headers without dominating the layout.
 */

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/browser'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) {
    return (
      <Link
        href="/login"
        className="glass-btn glass-btn--ghost"
        style={{ fontSize: '0.8rem', padding: '6px 16px' }}
      >
        Přihlásit se
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Účet'
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          background: 'none',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 12px 4px 4px',
          cursor: 'pointer',
          color: 'var(--color-text)',
          fontSize: '0.8rem',
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            width={24}
            height={24}
            style={{ borderRadius: '50%' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--accent-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--color-bg)',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--space-xs)',
            background: 'var(--color-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-xs)',
            minWidth: 180,
            zIndex: 50,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 4,
            }}
          >
            Historie
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: 'var(--color-text)',
              textDecoration: 'none',
              borderRadius: 4,
            }}
          >
            Nastavení
          </Link>
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border-subtle)', margin: '4px 0' }} />
          <button
            onClick={() => { setOpen(false); signOut() }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: 'var(--accent-rose)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 4,
            }}
          >
            Odhlásit se
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Google sign-in button — used on the login page.
 * Initiates OAuth PKCE flow with minimal scopes.
 */
export function GoogleSignInButton({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`,
        queryParams: {
          access_type: 'online',       // No offline access / refresh tokens
          prompt: 'select_account',    // Always show account picker
        },
        // Minimal scopes — identity only, no Drive/Calendar/Contacts
        scopes: 'openid email profile',
      },
    })

    if (error) {
      console.error('[auth] Sign-in error:', error.message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="glass-btn glass-btn--primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '12px 24px',
        fontSize: '0.92rem',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <span>Přesměrování…</span>
      ) : (
        <>
          <GoogleIcon />
          <span>Pokračovat přes Google</span>
        </>
      )}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" />
    </svg>
  )
}
