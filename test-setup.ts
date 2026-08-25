/**
 * Global test setup — loaded before every test file via vitest.config.ts setupFiles.
 *
 * Extends Vitest's expect() with @testing-library/jest-dom matchers so we can use
 * readable assertions like:
 *   expect(element).toBeInTheDocument()
 *   expect(button).toBeDisabled()
 *   expect(input).toHaveValue('...')
 */
// Vitest 4.x does not inject expect as a global — use the vitest-specific entry
// point which imports expect from 'vitest' internally.
import '@testing-library/jest-dom/vitest'

// Vitest 4.x doesn't expose afterEach globally, so @testing-library/react's
// auto-cleanup doesn't register. We add it explicitly here.
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
afterEach(() => cleanup())

/*
 * The Supabase browser client, stubbed for every test.
 *
 * AuthProvider builds one in an effect and subscribes to auth changes. In jsdom
 * the real client has no environment to read and no server to reach, so a test
 * that renders a page under a provider would either throw or attempt a network
 * call. Stubbing it here rather than in each test file also means no test can
 * quietly start talking to the network later.
 */
import { vi } from 'vitest'

vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}))
