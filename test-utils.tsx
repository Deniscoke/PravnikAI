import type React from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth/AuthProvider'

/**
 * Renders a page the way the application actually renders it.
 *
 * These pages are wrapped in ServerAuthProvider by their layout, and a layout
 * is not part of a component test. Rendering them bare put them in a state that
 * never occurs in production — and it was that gap, not the pages, that forced
 * useAuth to tolerate a missing provider. Wrapping here lets the provider stay
 * mandatory, so a consumer placed on a page without one fails loudly instead of
 * showing the signed-out state to everyone.
 */
export function renderWithAuth(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <AuthProvider initialUser={null}>{children}</AuthProvider>,
    ...options,
  })
}
