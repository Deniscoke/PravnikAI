/**
 * @vitest-environment jsdom
 */

/**
 * Async safety tests for the contract generator flow.
 *
 * These tests verify that race conditions, stale responses, double-submits,
 * and abort-on-unmount are handled correctly by the GeneratorPage +
 * DynamicContractForm integration.
 *
 * Key pattern: deferred fetch mocks allow precise control over WHEN a
 * response resolves, so we can simulate user actions mid-flight.
 *
 * Run:
 *   npx vitest run app/generator/__tests__/async-safety.test.tsx
 */

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import GeneratorPage from '../page'
import type { GenerateContractResponse } from '@/lib/contracts/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const COMPLETE_RESPONSE: GenerateContractResponse = {
  schemaId: 'kupni-smlouva-v1',
  mode: 'complete',
  contractText: 'KUPNÍ SMLOUVA — test text for async safety',
  warnings: [],
  missingFields: [],
  legalBasis: ['§ 2079 NOZ'],
  generatedAt: '2026-06-01T12:00:00.000Z',
}

const NDA_RESPONSE: GenerateContractResponse = {
  schemaId: 'nda-smlouva-v1',
  mode: 'complete',
  contractText: 'NDA SMLOUVA — this is the NDA result',
  warnings: [],
  missingFields: [],
  legalBasis: ['§ 504 NOZ'],
  generatedAt: '2026-06-01T13:00:00.000Z',
}

// ─── Deferred fetch helper ───────────────────────────────────────────────────

/**
 * Creates a fetch mock that doesn't resolve until you explicitly call
 * resolve() or reject(). This lets us simulate user actions while
 * the request is "in-flight".
 */
function createDeferredFetch() {
  let resolve!: (value: Response) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<Response>((res, rej) => {
    resolve = res
    reject = rej
  })
  const spy = vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(promise)
  return {
    resolve: (body: object, ok = true) => {
      resolve({
        ok,
        status: ok ? 200 : 502,
        json: async () => body,
      } as Response)
    },
    reject: (error: Error) => reject(error),
    spy,
  }
}

function mockFetchSuccess(body: GenerateContractResponse) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => body,
  } as Response)
}

// ─── Form filling helper ─────────────────────────────────────────────────────

/**
 * Fills the minimum required fields for kupni-smlouva-v1 to pass
 * client-side validation. Matches the main test file's helper.
 */
async function fillKupniSmlouvaRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Jméno \/ obchodní firma/i, { selector: '#prodavajici-name' }), 'ACME s.r.o.')
  await user.type(screen.getByLabelText(/Adresa \/ sídlo/i, { selector: '#prodavajici-address' }), 'Praha 1')
  await user.type(screen.getByLabelText(/Jméno \/ obchodní firma/i, { selector: '#kupujici-name' }), 'Jan Novák')
  await user.type(screen.getByLabelText(/Adresa \/ sídlo/i, { selector: '#kupujici-address' }), 'Brno')
  await user.type(screen.getByLabelText(/Popis předmětu koupě/i), 'Notebook Dell Latitude, nový kus se zárukou')
  await user.selectOptions(screen.getByLabelText(/Stav předmětu/i), 'novy')
  await user.type(screen.getByLabelText(/Kupní cena/i), '150000')
  await user.selectOptions(screen.getByLabelText(/DPH/i), 'bez-dph')
  await user.selectOptions(screen.getByLabelText(/Způsob úhrady/i), 'hotove')
  await user.type(screen.getByLabelText(/Datum předání/i), '2026-07-01')
  await user.type(screen.getByLabelText(/Místo předání/i), 'Praha')
  await user.selectOptions(screen.getByLabelText(/Přechod vlastnického práva/i), 'predanim')
  await user.type(screen.getByLabelText(/Datum uzavření smlouvy/i), '2026-06-01')
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks()
  window.scrollTo = vi.fn()
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
})

// ══════════════════════════════════════════════════════════════════════════════
// 1. Stale response after navigating back to catalog
// ══════════════════════════════════════════════════════════════════════════════

describe('Stale response — navigate to catalog during generation', () => {
  it('ignores the response when user returns to catalog before it resolves', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    // Select kupní smlouva and fill form
    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    // Start generation with deferred fetch
    const deferred = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))

    // Wait for generating state
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // User navigates back to catalog via breadcrumb
    await user.click(screen.getByRole('button', { name: /typ smlouvy/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument(),
    )

    // Now the stale response arrives
    deferred.resolve(COMPLETE_RESPONSE)

    // Wait a tick for any potential state updates
    await new Promise((r) => setTimeout(r, 50))

    // Catalog should still be showing — no result flash
    expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument()
    expect(screen.queryByText(/test text for async safety/i)).not.toBeInTheDocument()
  })

  it('ignores error responses after navigating away', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // Navigate away
    await user.click(screen.getByRole('button', { name: /typ smlouvy/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument(),
    )

    // Stale error arrives
    deferred.resolve({ error: 'LLM timeout' }, false)
    await new Promise((r) => setTimeout(r, 50))

    // Should still be on catalog, no error shown
    expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument()
    expect(screen.queryByText(/chyba při generování/i)).not.toBeInTheDocument()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. Stale response after schema switch
// ══════════════════════════════════════════════════════════════════════════════

describe('Stale response — schema switch during generation', () => {
  it('does not display request-1 result when user switched to a different schema', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    // Start generation for kupní smlouva
    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred1 = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // User navigates back to catalog
    await user.click(screen.getByRole('button', { name: /typ smlouvy/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument(),
    )

    // User selects NDA instead
    await user.click(screen.getByRole('button', { name: /smlouva o mlčenlivosti/i }))

    // Now the kupní smlouva response arrives (stale)
    deferred1.resolve(COMPLETE_RESPONSE)
    await new Promise((r) => setTimeout(r, 50))

    // Should be on the NDA form, NOT showing kupní smlouva result
    expect(screen.queryByText(/test text for async safety/i)).not.toBeInTheDocument()
    // NDA form should be visible
    expect(screen.getByRole('button', { name: /vygenerovat smlouvu/i })).toBeInTheDocument()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Double submit protection
// ══════════════════════════════════════════════════════════════════════════════

describe('Double submit protection', () => {
  it('only calls fetch once even if submit is triggered twice rapidly', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    // Create a deferred fetch that won't resolve (simulates slow API)
    const deferred = createDeferredFetch()

    // Click submit
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))

    // Try to submit again by finding and clicking the form submit
    // The button should be disabled, and the isSubmitting guard prevents double-submit
    const submitButtons = screen.queryAllByRole('button', { name: /generuji smlouvu|vygenerovat smlouvu/i })
    for (const btn of submitButtons) {
      await user.click(btn)
    }

    // Only one fetch call should have been made
    expect(deferred.spy).toHaveBeenCalledTimes(1)

    // Cleanup: resolve the pending fetch to avoid unhandled promise
    deferred.resolve(COMPLETE_RESPONSE)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Abort on unmount
// ══════════════════════════════════════════════════════════════════════════════

describe('Abort on unmount', () => {
  it('aborts the in-flight request when the component unmounts', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<GeneratorPage />)

    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // Capture the signal that was passed to fetch
    const fetchCall = deferred.spy.mock.calls[0]
    const fetchOptions = fetchCall[1] as RequestInit
    const signal = fetchOptions.signal as AbortSignal

    expect(signal).toBeDefined()
    expect(signal.aborted).toBe(false)

    // Unmount
    unmount()

    // Signal should now be aborted
    expect(signal.aborted).toBe(true)

    // Cleanup: resolve to avoid unhandled rejection
    deferred.resolve(COMPLETE_RESPONSE)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 5. Retry after error — form data preserved, new request works
// ══════════════════════════════════════════════════════════════════════════════

describe('Retry after error', () => {
  it('retrying after error sends a new request and accepts the new response', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    // First attempt: API error
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: 'LLM timeout' }),
    } as Response)

    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText(/chyba při generování/i)).toBeInTheDocument())

    // Click "Zkusit znovu"
    await user.click(screen.getByRole('button', { name: /zkusit znovu/i }))

    // Form should be back — verify the submit button is visible
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /vygenerovat smlouvu/i })).toBeInTheDocument(),
    )

    // Second attempt: success
    mockFetchSuccess(COMPLETE_RESPONSE)
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))

    await waitFor(() =>
      expect(screen.getByText(/test text for async safety/i)).toBeInTheDocument(),
    )
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 6. RequestId enforcement — stale response during second generation
// ══════════════════════════════════════════════════════════════════════════════

describe('RequestId enforcement — overlapping generations', () => {
  it('rejects request-1 response that arrives during request-2 generating state', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    // Start first generation
    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred1 = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // Go back to form (this aborts request 1)
    await user.click(screen.getByRole('button', { name: /typ smlouvy/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /vyberte typ smlouvy/i })).toBeInTheDocument(),
    )

    // Select same schema again, fill form, submit (request 2)
    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred2 = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))
    await waitFor(() => expect(screen.getByText('Generování…')).toBeInTheDocument())

    // Request 1 response arrives (stale — different requestId)
    // Note: abort should have caused AbortError, but in the TOCTOU gap this
    // simulates the response somehow getting through
    deferred1.resolve(COMPLETE_RESPONSE)
    await new Promise((r) => setTimeout(r, 50))

    // Should still be in generating state — request 1 result was rejected
    expect(screen.getByText('Generování…')).toBeInTheDocument()
    expect(screen.queryByText(/test text for async safety/i)).not.toBeInTheDocument()

    // Now resolve request 2 with a different response
    const RESPONSE_2 = { ...COMPLETE_RESPONSE, contractText: 'REQUEST 2 RESULT — correct' }
    deferred2.resolve(RESPONSE_2)

    // Request 2 result should appear
    await waitFor(() =>
      expect(screen.getByText(/REQUEST 2 RESULT — correct/i)).toBeInTheDocument(),
    )
  }, 15000)

  it('fetch receives AbortSignal so the browser can cancel the request', async () => {
    const user = userEvent.setup()
    render(<GeneratorPage />)

    await user.click(screen.getByRole('button', { name: /kupní smlouva/i }))
    await fillKupniSmlouvaRequired(user)

    const deferred = createDeferredFetch()
    await user.click(screen.getByRole('button', { name: /vygenerovat smlouvu/i }))

    // Verify fetch was called with an AbortSignal
    const fetchCall = deferred.spy.mock.calls[0]
    const fetchOptions = fetchCall[1] as RequestInit
    expect(fetchOptions.signal).toBeInstanceOf(AbortSignal)

    // Cleanup
    deferred.resolve(COMPLETE_RESPONSE)
  })
})
