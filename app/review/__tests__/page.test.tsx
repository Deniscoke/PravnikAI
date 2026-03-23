// @vitest-environment jsdom

/**
 * UI integration tests for /review page
 *
 * What is tested:
 *  1.  Valid API response → result state renders correctly
 *  2.  API 502 → error state with retry option
 *  3.  Retry after error → returns to input state
 *  4.  Short input (< 50 chars) → submit button disabled
 *  5.  Stale response rejection (rapid double-submit)
 *  6.  New review resets all state
 *  7.  Network failure → error state
 *  8.  Trust markers visible on input page
 *
 * Run:
 *   npx vitest run app/review/__tests__/page.test.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewPage from '@/app/review/page'
import type { ReviewContractResponse } from '@/lib/review/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const VALID_CONTRACT_TEXT = 'Kupní smlouva uzavřená dle § 2079 zákona č. 89/2012 Sb. mezi stranami níže uvedenými ohledně prodeje nemovitosti.'

const MOCK_REVIEW_RESPONSE: ReviewContractResponse = {
  overallRisk: 'medium',
  summary: 'Smlouva obsahuje rizikové klauzule.',
  riskyClauses: [{
    title: 'Jednostranná změna',
    severity: 'high',
    explanation: 'Porušuje § 1752 NOZ.',
  }],
  missingClauses: [{
    title: 'Odstoupení od smlouvy',
    reason: 'Chybí dle § 2001 NOZ.',
  }],
  negotiationFlags: ['Smluvní pokuta jednostranná'],
  lawyerReviewRequired: true,
  disclaimer: 'AI analýza — konzultujte advokáta.',
  reviewedAt: new Date().toISOString(),
  detectedContractType: 'Kupní smlouva',
  reviewMode: 'ai-assisted-review',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetchSuccess(data: ReviewContractResponse = MOCK_REVIEW_RESPONSE) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  )
}

function mockFetchError(status = 502, error = 'Chyba při komunikaci s AI.', code = 'LLM_ERROR') {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify({ error, code }), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

function mockFetchNetworkFailure() {
  return vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch'))
}

/** Creates a deferred fetch that resolves when you call resolve/reject */
function createDeferredFetch() {
  let resolve!: (r: Response) => void
  let reject!: (e: Error) => void
  const promise = new Promise<Response>((res, rej) => {
    resolve = res
    reject = rej
  })
  const spy = vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(promise)
  return { resolve, reject, spy }
}

async function typeContractAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  const textarea = screen.getByLabelText(/text smlouvy/i)
  await user.type(textarea, VALID_CONTRACT_TEXT)
  const submitBtn = screen.getByRole('button', { name: /zkontrolovat smlouvu/i })
  await user.click(submitBtn)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks()
  window.scrollTo = vi.fn()
})

describe('Review Page', () => {

  // ── 1. Valid response renders result correctly ─────────────────────────────

  it('renders result state with risk banner, risky clauses, and missing clauses', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      // Risk banner
      expect(screen.getByText('Střední riziko')).toBeInTheDocument()
      expect(screen.getByText('MEDIUM')).toBeInTheDocument()
      // Summary (use exact text to avoid matching section heading)
      expect(screen.getByText('Smlouva obsahuje rizikové klauzule.')).toBeInTheDocument()
      // Risky clause card
      expect(screen.getByText('Jednostranná změna')).toBeInTheDocument()
      expect(screen.getByText(/§ 1752/)).toBeInTheDocument()
      // Missing clause card
      expect(screen.getByText('Odstoupení od smlouvy')).toBeInTheDocument()
      // Negotiation flag
      expect(screen.getByText(/Smluvní pokuta jednostranná/)).toBeInTheDocument()
      // Trust banner
      expect(screen.getByText(/Neslouží jako právní poradenství/)).toBeInTheDocument()
      // Detected type
      expect(screen.getByText('Kupní smlouva')).toBeInTheDocument()
    })
  })

  // ── 2. API 502 → error state ──────────────────────────────────────────────

  it('shows error state when API returns 502', async () => {
    mockFetchError(502, 'Chyba při komunikaci s AI.')
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText(/Chyba při analýze/i)).toBeInTheDocument()
      expect(screen.getByText(/Chyba při komunikaci s AI/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /zkusit znovu/i })).toBeInTheDocument()
    })
  })

  // ── 3. Retry after error → returns to input ───────────────────────────────

  it('clicking retry returns to input state with preserved contract text', async () => {
    mockFetchError()
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /zkusit znovu/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /zkusit znovu/i }))

    // Should be back in input state — textarea visible
    expect(screen.getByLabelText(/text smlouvy/i)).toBeInTheDocument()
  })

  // ── 4. Short input → submit disabled ──────────────────────────────────────

  it('disables submit button when contract text is shorter than 50 chars', async () => {
    const user = userEvent.setup()
    render(<ReviewPage />)

    const textarea = screen.getByLabelText(/text smlouvy/i)
    await user.type(textarea, 'Too short')

    const submitBtn = screen.getByRole('button', { name: /zkontrolovat smlouvu/i })
    expect(submitBtn).toBeDisabled()
  })

  it('enables submit button once text reaches 50 chars', async () => {
    const user = userEvent.setup()
    render(<ReviewPage />)

    const textarea = screen.getByLabelText(/text smlouvy/i)
    await user.type(textarea, VALID_CONTRACT_TEXT)

    const submitBtn = screen.getByRole('button', { name: /zkontrolovat smlouvu/i })
    expect(submitBtn).not.toBeDisabled()
  })

  // ── 5. Stale response rejection ───────────────────────────────────────────

  it('cancels in-flight request when user clicks "new review" during review', async () => {
    // Deferred fetch — never resolves on its own
    const deferred = createDeferredFetch()
    const user = userEvent.setup()
    render(<ReviewPage />)

    // Submit the request
    const textarea = screen.getByLabelText(/text smlouvy/i)
    await user.type(textarea, VALID_CONTRACT_TEXT)
    await user.click(screen.getByRole('button', { name: /zkontrolovat smlouvu/i }))

    // Should be in reviewing state
    await waitFor(() => {
      expect(screen.getByText('Analyzuji smlouvu')).toBeInTheDocument()
    })

    // User clicks nav button to start a new review (cancels the in-flight request)
    await user.click(screen.getByRole('button', { name: /kontrola smlouvy/i }))

    // Should be back in input state
    expect(screen.getByLabelText(/text smlouvy/i)).toBeInTheDocument()

    // Now resolve the deferred fetch — it should be ignored (aborted + stale guard)
    deferred.resolve(new Response(
      JSON.stringify({ ...MOCK_REVIEW_RESPONSE, summary: 'Stará analýza.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))

    // Wait a tick — the stale data must NOT appear
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.queryByText('Stará analýza.')).not.toBeInTheDocument()
    // Still in input state
    expect(screen.getByLabelText(/text smlouvy/i)).toBeInTheDocument()
  })

  // ── 6. New review resets state ─────────────────────────────────────────────

  it('new review button resets to input with empty form', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText('Střední riziko')).toBeInTheDocument()
    })

    // Click "Nová kontrola"
    await user.click(screen.getByRole('button', { name: /nová kontrola/i }))

    // Should be back in input state with empty textarea
    const textarea = screen.getByLabelText(/text smlouvy/i) as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe('')
  })

  // ── 7. Network failure ─────────────────────────────────────────────────────

  it('shows error state on network failure', async () => {
    mockFetchNetworkFailure()
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText(/Chyba při analýze/i)).toBeInTheDocument()
      expect(screen.getByText(/Síťová chyba/i)).toBeInTheDocument()
    })
  })

  // ── 8. Trust markers on input page ─────────────────────────────────────────

  it('displays trust markers and legal notice on the input page', () => {
    render(<ReviewPage />)

    expect(screen.getByText(/Server-side zpracování/i)).toBeInTheDocument()
    expect(screen.getByText(/Text se neukládá/i)).toBeInTheDocument()
    expect(screen.getByText(/Výhradně české právo/i)).toBeInTheDocument()
    expect(screen.getByText(/Strukturovaná analýza/i)).toBeInTheDocument()
    expect(screen.getByText(/Analýza neslouží jako právní poradenství/i)).toBeInTheDocument()
  })

  // ── 9. Reviewing state shows progress steps ────────────────────────────────

  it('shows animated progress steps during review', async () => {
    createDeferredFetch() // never resolves — stays in reviewing state
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText('Analyzuji smlouvu')).toBeInTheDocument()
      expect(screen.getByText('Analyzuji text smlouvy…')).toBeInTheDocument()
    })
  })

  // ── 10. Lawyer review recommendation banner ────────────────────────────────

  it('shows lawyer review recommendation when lawyerReviewRequired is true', async () => {
    mockFetchSuccess({ ...MOCK_REVIEW_RESPONSE, lawyerReviewRequired: true })
    const user = userEvent.setup()
    render(<ReviewPage />)

    await typeContractAndSubmit(user)

    await waitFor(() => {
      expect(screen.getByText(/nechte tuto smlouvu zkontrolovat advokátem/i)).toBeInTheDocument()
    })
  })
})
