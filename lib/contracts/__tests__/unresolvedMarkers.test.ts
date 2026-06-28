import { describe, it, expect } from 'vitest'
import { findUnresolvedMarkers } from '../unresolvedMarkers'

describe('findUnresolvedMarkers', () => {
  it('returns zero counts for clean text', () => {
    const r = findUnresolvedMarkers('KUPNÍ SMLOUVA\nKupní cena: 150 000 Kč')
    expect(r.count).toBe(0)
    expect(r.placeholders).toBe(0)
    expect(r.reviewMarkers).toBe(0)
  })

  it('returns zero counts for empty text', () => {
    expect(findUnresolvedMarkers('').count).toBe(0)
  })

  it('counts a bare [DOPLNIT] placeholder', () => {
    const r = findUnresolvedMarkers('Adresa: [DOPLNIT]')
    expect(r.placeholders).toBe(1)
    expect(r.count).toBe(1)
  })

  it('counts [DOPLNIT: popis] placeholders with description', () => {
    const r = findUnresolvedMarkers('Jméno: [DOPLNIT: jméno prodávajícího]\nIČO: [DOPLNIT: IČO]')
    expect(r.placeholders).toBe(2)
    expect(r.count).toBe(2)
  })

  it('counts ⚠️ ZKONTROLOVAT review markers', () => {
    const r = findUnresolvedMarkers('Cena: ⚠️ ZKONTROLOVAT — [DOPLNIT: cena]')
    expect(r.reviewMarkers).toBe(1)
    expect(r.placeholders).toBe(1)
    expect(r.count).toBe(2)
  })

  it('aggregates multiple markers of both kinds', () => {
    const text = `[DOPLNIT]
[DOPLNIT: adresa]
⚠️ ZKONTROLOVAT
⚠️ ZKONTROLOVAT`
    const r = findUnresolvedMarkers(text)
    expect(r.placeholders).toBe(2)
    expect(r.reviewMarkers).toBe(2)
    expect(r.count).toBe(4)
  })
})
