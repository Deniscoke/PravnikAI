'use client'

/**
 * Auth context provider — PrávníkAI
 *
 * Wraps the app with authentication state. Provides:
 *   - user: current Supabase user (or null)
 *   - loading: true while initial auth state is being determined
 *   - signOut: helper to sign out and redirect
 *
 * Hydrates from server-provided initialUser to avoid auth flash.
 * Listens for client-side auth state changes (sign in/out).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

/*
 * Deliberately undefined rather than a signed-out default.
 *
 * The root layout no longer provides a context — it imported the Supabase
 * browser client and shipped 204 kB to every page of text to do it. That makes
 * a misplaced consumer easy to write, and with a default value the symptom is
 * a component quietly showing the signed-out state forever, on a page where
 * nobody is looking for a bug.
 *
 * Failing at first render says which component and which page. The pages that
 * need the context wrap themselves in ServerAuthProvider.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error(
      'useAuth was called outside an AuthProvider. The root layout no longer ' +
        'provides one — wrap the page in ServerAuthProvider.',
    )
  }
  return value
}
