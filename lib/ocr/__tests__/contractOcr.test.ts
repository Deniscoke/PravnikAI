/**
 * The prompt assertions here look pedantic, and they are the point.
 *
 * A vision model asked to read a contract will, unprompted, be helpful: fix a
 * typo, finish a truncated sentence, tidy a clause into the shape it has seen a
 * thousand times. The review then analyses a document that does not exist. So
 * the instructions forbidding that are pinned as tests — if someone later
 * shortens the prompt to save tokens, this fails rather than quietly degrading.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted, because vi.mock is lifted above ordinary const declarations and
// the factory would otherwise reference the spy before it exists.
const { mockTranscribeImages } = vi.hoisted(() => ({ mockTranscribeImages: vi.fn() }))

vi.mock('@/lib/llm/openaiClient', () => ({
  transcribeImages: mockTranscribeImages,
}))

import { transcribeContractImages, unreadableRatio, UNREADABLE_MARKER } from '../contractOcr'

const PAGE = 'data:image/jpeg;base64,AAAA'

function mockResult(text: string, tokensUsed = 900) {
  mockTranscribeImages.mockResolvedValueOnce({ text, tokensUsed, model: 'gpt-4o' })
}

function lastPrompt() {
  return mockTranscribeImages.mock.calls[mockTranscribeImages.mock.calls.length - 1][0]
}

beforeEach(() => {
  mockTranscribeImages.mockReset()
})

describe('the transcription prompt', () => {
  it('forbids correcting what is on the page', async () => {
    mockResult('text')
    await transcribeContractImages([PAGE])
    const { systemPrompt } = lastPrompt()

    expect(systemPrompt).toMatch(/NIKDY neopravuj/)
    expect(systemPrompt).toMatch(/NIKDY nedoplňuj/)
    expect(systemPrompt).toMatch(/NIKDY nevynechávej/)
  })

  it('requires unreadable text to be marked, not guessed', async () => {
    mockResult('text')
    await transcribeContractImages([PAGE])
    expect(lastPrompt().systemPrompt).toContain(UNREADABLE_MARKER)
    expect(lastPrompt().systemPrompt).toMatch(/Raději označ, než hádej/)
  })

  it('tells the model it is not an assistant', async () => {
    mockResult('text')
    await transcribeContractImages([PAGE])
    expect(lastPrompt().systemPrompt).toMatch(/NEJSI asistent/)
  })

  it('warns that adjacent slices overlap', async () => {
    // Without this the model either duplicates the overlapped lines or, worse,
    // drops them believing they were already written.
    mockResult('text')
    await transcribeContractImages([PAGE, PAGE])
    expect(lastPrompt().systemPrompt).toMatch(/SOUSEDNÍ PÁSY SE PŘEKRÝVAJÍ/)
    expect(lastPrompt().systemPrompt).toMatch(/POUZE JEDNOU/)
  })

  it('describes the images as slices, not as separate pages', async () => {
    mockResult('text')
    await transcribeContractImages([PAGE, PAGE, PAGE], 1)
    const { userPrompt } = lastPrompt()
    expect(userPrompt).toMatch(/3 obrázků/)
    expect(userPrompt).toMatch(/vodorovné pásy/)
    expect(userPrompt).toMatch(/jedné stránky/)
  })

  it('reports the real page count, not the slice count', async () => {
    // Six slices of two pages must not be announced as six pages.
    mockResult('text')
    await transcribeContractImages([PAGE, PAGE, PAGE, PAGE, PAGE, PAGE], 2)
    expect(lastPrompt().userPrompt).toMatch(/2 stránek/)
  })

  it('asks for one continuous text rather than per-slice output', async () => {
    mockResult('text')
    await transcribeContractImages([PAGE, PAGE], 1)
    expect(lastPrompt().userPrompt).toMatch(/jeden souvislý text/)
  })
})

describe('transcribeContractImages', () => {
  it('passes the pages straight through', async () => {
    mockResult('KUPNÍ SMLOUVA')
    await transcribeContractImages([PAGE, PAGE])
    expect(lastPrompt().imageDataUrls).toHaveLength(2)
  })

  it('returns the transcription with its cost', async () => {
    mockResult('KUPNÍ SMLOUVA\n\nČlánek I.', 4200)
    const result = await transcribeContractImages([PAGE])

    expect(result.text).toBe('KUPNÍ SMLOUVA\n\nČlánek I.')
    expect(result.tokensUsed).toBe(4200)
    expect(result.unreadable).toBe(false)
  })

  it('reports unreadable when nothing legible came back', async () => {
    mockResult(UNREADABLE_MARKER)
    expect((await transcribeContractImages([PAGE])).unreadable).toBe(true)
  })

  it('treats whitespace-only output as unreadable', async () => {
    mockResult('   \n  ')
    expect((await transcribeContractImages([PAGE])).unreadable).toBe(true)
  })
})

describe('unreadableRatio', () => {
  it('is zero for a clean transcription', () => {
    expect(unreadableRatio('Kupní cena činí 250 000 Kč a bude uhrazena převodem.')).toBe(0)
  })

  it('rises with the number of gaps', () => {
    const few = unreadableRatio(`Kupní cena činí ${UNREADABLE_MARKER} Kč a bude uhrazena převodem.`)
    const many = unreadableRatio(
      `${UNREADABLE_MARKER} ${UNREADABLE_MARKER} ${UNREADABLE_MARKER} cena`,
    )
    expect(few).toBeGreaterThan(0)
    expect(many).toBeGreaterThan(few)
  })

  it('separates one smudged word from half a lost page', () => {
    // This is the distinction the UI warning depends on.
    const oneWordLost = [UNREADABLE_MARKER, ...Array(99).fill('slovo')].join(' ')
    expect(unreadableRatio(oneWordLost)).toBeLessThan(0.02)

    const halfLost = Array(50)
      .fill(`${UNREADABLE_MARKER} slovo`)
      .join(' ')
    expect(unreadableRatio(halfLost)).toBeGreaterThan(0.02)
  })

  it('treats empty text as entirely unreadable', () => {
    expect(unreadableRatio('')).toBe(1)
  })
})
