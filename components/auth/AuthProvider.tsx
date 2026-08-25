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
 * A signed-out default rather than undefined.
 *
 * Throwing outside a provider would catch a misplaced consumer sooner, but the
 * failure it prevents is cosmetic — a component would show the signed-out state
 * — while the failure it introduces is a hard render error. The two consumers
 * that exist, UserMenu and PricingSection, are both inside a provider, and a
 * test keeps AuthProvider out of the root layout so the pairing stays visible.
 */
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
})

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
  return useContext(AuthContext)
}
