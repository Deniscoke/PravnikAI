// @vitest-environment jsdom

/**
 * The guard that lets the root layout stay free of Supabase.
 *
 * Removing AuthProvider from the root layout took 204 kB off every page of
 * text, and it made a misplaced consumer possible for the first time. With a
 * signed-out default such a component renders the logged-out state forever on
 * a page where nobody is looking for a bug; throwing names the component and
 * the page at first render instead.
 *
 * This file proves the guard actually fires, because a guarantee nobody tests
 * is a comment.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthProvider'

function ShowsUser() {
  const { user } = useAuth()
  return <span>{user ? user.email : 'anonymní'}</span>
}

describe('useAuth outside a provider', () => {
  it('throws rather than pretending nobody is signed in', () => {
    // React logs the error boundary trace; silence it so the run stays readable.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<ShowsUser />)).toThrow(/outside an AuthProvider/)
    } finally {
      spy.mockRestore()
    }
  })

  it('names the fix in the message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<ShowsUser />)).toThrow(/ServerAuthProvider/)
    } finally {
      spy.mockRestore()
    }
  })
})

describe('useAuth inside a provider', () => {
  it('reports the server-seeded user', () => {
    render(
      <AuthProvider initialUser={{ email: 'jan@example.cz' } as never}>
        <ShowsUser />
      </AuthProvider>,
    )
    expect(screen.getByText('jan@example.cz')).toBeInTheDocument()
  })

  it('reports nobody when the server saw nobody', () => {
    render(
      <AuthProvider initialUser={null}>
        <ShowsUser />
      </AuthProvider>,
    )
    expect(screen.getByText('anonymní')).toBeInTheDocument()
  })
})
