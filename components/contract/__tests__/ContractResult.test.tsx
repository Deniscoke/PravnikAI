/**
 * @vitest-environment jsdom
 */

/**
 * Tests for the B-09 pre-export unresolved-items gate in ContractResult.
 *
 * - Draft with [DOPLNIT] → clicking export opens the warning, no fetch yet.
 * - "Exportovat i tak" → proceeds with the original export (fetch called).
 * - "Vrátit se k návrhu" → closes the warning, no fetch.
 * - Clean draft → export fires directly, no warning modal.
 */

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { ContractResult } from '../ContractResult'
import type { GenerateContractResponse } from '@/lib/contracts/types'

const BASE: GenerateContractResponse = {
  schemaId: 'kupni-smlouva-v1',
  mode: 'draft',
  contractText: 'KUPNÍ SMLOUVA\nKupní cena: 150 000 Kč',
  warnings: [],
  missingFields: [],
  legalBasis: ['§ 2079 NOZ'],
  generatedAt: '2026-06-01T12:00:00.000Z',
}

const WITH_MARKERS: GenerateContractResponse = {
  ...BASE,
  contractText: 'KUPNÍ SMLOUVA\nKupní cena: [DOPLNIT: cena]\nMísto předání: [DOPLNIT]',
}

function okExportResponse(): Response {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/octet-stream' },
    blob: async () => new Blob(['export-bytes']),
  } as unknown as Response
}

beforeEach(() => {
  vi.restoreAllMocks()
  // Stub the download plumbing so exportDocument() can run in jsdom.
  URL.createObjectURL = vi.fn(() => 'blob:mock')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => cleanup())

describe('ContractResult — pre-export gate', () => {
  it('clean draft exports directly without the warning modal', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okExportResponse())

    render(<ContractResult result={BASE} contractName="Kupní smlouva" onBack={() => {}} onReset={() => {}} />)

    await user.click(screen.getByRole('button', { name: /DOCX/i }))

    expect(screen.queryByText(/Návrh obsahuje nevyplněná místa/i)).not.toBeInTheDocument()
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/export-docx', expect.anything()))
  })

  it('draft with [DOPLNIT] opens the warning and does NOT export yet', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okExportResponse())

    render(<ContractResult result={WITH_MARKERS} contractName="Kupní smlouva" onBack={() => {}} onReset={() => {}} />)

    await user.click(screen.getByRole('button', { name: /DOCX/i }))

    expect(screen.getByText(/Návrh obsahuje nevyplněná místa/i)).toBeInTheDocument()
    expect(screen.getByText(/Počet nalezených položek: 2/)).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('"Exportovat i tak" proceeds with the original export', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okExportResponse())

    render(<ContractResult result={WITH_MARKERS} contractName="Kupní smlouva" onBack={() => {}} onReset={() => {}} />)

    await user.click(screen.getByRole('button', { name: /DOCX/i }))
    await user.click(screen.getByRole('button', { name: /Exportovat i tak/i }))

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/export-docx', expect.anything()))
    expect(screen.queryByText(/Návrh obsahuje nevyplněná místa/i)).not.toBeInTheDocument()
  })

  it('"Vrátit se k návrhu" closes the warning without exporting', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(okExportResponse())

    render(<ContractResult result={WITH_MARKERS} contractName="Kupní smlouva" onBack={() => {}} onReset={() => {}} />)

    await user.click(screen.getByRole('button', { name: /DOCX/i }))
    await user.click(screen.getByRole('button', { name: /Vrátit se k návrhu/i }))

    expect(screen.queryByText(/Návrh obsahuje nevyplněná místa/i)).not.toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
