/**
 * Tests for vision transcription in the LLM wrapper.
 *
 * The assertions that matter are about cost and legibility: that the vision
 * model is chosen independently of the drafting model, and that pages go up at
 * full detail. On `detail: 'low'` the API downsamples to a thumbnail, which
 * still returns confident-looking text — just not the text on the page. That
 * failure would be invisible in production, so it is pinned here.
 *
 * The OpenAI SDK is fully mocked — no real API calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockCreate } }
  },
}))

import { transcribeImages, __modelConfig } from '../openaiClient'

const PAGE = 'data:image/jpeg;base64,AAAA'

function mockTranscription(content: string, totalTokens = 1200) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content } }],
    usage: { total_tokens: totalTokens },
  })
}

function lastCall() {
  return mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0]
}

beforeEach(() => {
  mockCreate.mockReset()
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('model selection', () => {
  it('defaults to gpt-4o rather than the drafting model', () => {
    // Transcription is a cheap, high-volume job. If it silently followed
    // OPENAI_MODEL_DEFAULT, pointing the app at a frontier model would multiply
    // the cost of every upload.
    vi.stubEnv('OPENAI_MODEL_DEFAULT', 'gpt-5.5')
    expect(__modelConfig.getVisionModel()).toBe('gpt-4o')
  })

  it('honours an explicit OPENAI_MODEL_VISION override', () => {
    vi.stubEnv('OPENAI_MODEL_VISION', 'gpt-5.5')
    expect(__modelConfig.getVisionModel()).toBe('gpt-5.5')
  })
})

describe('transcribeImages', () => {
  it('sends every page at full detail', async () => {
    mockTranscription('KUPNÍ SMLOUVA')
    await transcribeImages({
      imageDataUrls: [PAGE, PAGE, PAGE],
      systemPrompt: 'sys',
      userPrompt: 'user',
    })

    const content = lastCall().messages[1].content
    const images = content.filter((part: { type: string }) => part.type === 'image_url')
    expect(images).toHaveLength(3)
    for (const image of images) {
      expect(image.image_url.detail).toBe('high')
    }
  })

  it('keeps page order — they are sequential pages of one document', async () => {
    mockTranscription('text')
    await transcribeImages({
      imageDataUrls: ['data:image/png;base64,ONE', 'data:image/png;base64,TWO'],
      systemPrompt: 'sys',
      userPrompt: 'user',
    })

    const urls = lastCall()
      .messages[1].content.filter((p: { type: string }) => p.type === 'image_url')
      .map((p: { image_url: { url: string } }) => p.image_url.url)
    expect(urls).toEqual(['data:image/png;base64,ONE', 'data:image/png;base64,TWO'])
  })

  it('puts the instruction before the images', async () => {
    mockTranscription('text')
    await transcribeImages({ imageDataUrls: [PAGE], systemPrompt: 'sys', userPrompt: 'přepiš' })

    const content = lastCall().messages[1].content
    expect(content[0]).toEqual({ type: 'text', text: 'přepiš' })
  })

  it('transcribes at temperature 0 — there is nothing to be creative about', async () => {
    mockTranscription('text')
    await transcribeImages({ imageDataUrls: [PAGE], systemPrompt: 'sys', userPrompt: 'user' })
    expect(lastCall().temperature).toBe(0)
  })

  it('returns the text, token count and model actually used', async () => {
    mockTranscription('NÁJEMNÍ SMLOUVA', 3400)
    const result = await transcribeImages({
      imageDataUrls: [PAGE],
      systemPrompt: 'sys',
      userPrompt: 'user',
    })

    expect(result.text).toBe('NÁJEMNÍ SMLOUVA')
    expect(result.tokensUsed).toBe(3400)
    expect(result.model).toBe('gpt-4o')
  })

  it('throws on an empty response rather than returning a blank contract', async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: '' } }], usage: {} })
    await expect(
      transcribeImages({ imageDataUrls: [PAGE], systemPrompt: 'sys', userPrompt: 'user' }),
    ).rejects.toThrow(/empty transcription/i)
  })
})
