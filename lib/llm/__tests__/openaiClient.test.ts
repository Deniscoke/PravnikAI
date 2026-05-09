/**
 * Unit tests for LLM provider wrapper (openaiClient.ts)
 *
 * Test areas:
 *  1. Model routing: default → gpt-5.4, premium → gpt-5.4-pro
 *  2. Premium + jsonMode guard (must throw)
 *  3. Response shape (text, tokensUsed, model)
 *  4. Reasoning effort defaults and overrides
 *
 * OpenAI SDK is fully mocked — no real API calls.
 *
 * Run:
 *   npx vitest run lib/llm/__tests__/openaiClient.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the OpenAI constructor and its chat.completions.create method
const mockCreate = vi.fn()

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      }
    },
  }
})

// Force fresh module for each test file — the lazy singleton caches the instance
import { generateText } from '../openaiClient'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockOpenAIResponse(content: string, totalTokens = 500) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content } }],
    usage: { total_tokens: totalTokens },
  })
}

const BASE_OPTIONS = {
  systemPrompt: 'You are a Czech lawyer.',
  userPrompt: 'Draft a purchase contract.',
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockCreate.mockReset()
})

// ══════════════════════════════════════════════════════════════════════════════
// 1. Model routing
// ══════════════════════════════════════════════════════════════════════════════

describe('Model routing', () => {
  it('uses gpt-5.4 by default', async () => {
    mockOpenAIResponse('contract text')
    await generateText(BASE_OPTIONS)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-5.4' }),
    )
  })

  it('uses max_completion_tokens for GPT-5 family (not max_tokens)', async () => {
    mockOpenAIResponse('contract text')
    await generateText(BASE_OPTIONS)
    const args = mockCreate.mock.calls[0][0]
    expect(args).toMatchObject({ max_completion_tokens: 16384 })
    expect(args).not.toHaveProperty('max_tokens')
  })

  it('uses max_tokens for non–GPT-5 models when OPENAI_MODEL_DEFAULT is overridden', async () => {
    vi.stubEnv('OPENAI_MODEL_DEFAULT', 'gpt-4o')
    try {
      mockOpenAIResponse('text')
      await generateText(BASE_OPTIONS)
      const args = mockCreate.mock.calls[0][0]
      expect(args).toMatchObject({ model: 'gpt-4o', max_tokens: 16384 })
      expect(args).not.toHaveProperty('max_completion_tokens')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('uses gpt-5.4-pro when premium=true', async () => {
    mockOpenAIResponse('polished text')
    await generateText({ ...BASE_OPTIONS, premium: true })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-5.4-pro' }),
    )
  })

  it('returns the model name in the result', async () => {
    mockOpenAIResponse('text')
    const result = await generateText(BASE_OPTIONS)
    expect(result.model).toBe('gpt-5.4')
  })

  it('returns gpt-5.4-pro model name for premium calls', async () => {
    mockOpenAIResponse('text')
    const result = await generateText({ ...BASE_OPTIONS, premium: true })
    expect(result.model).toBe('gpt-5.4-pro')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 2. Premium + jsonMode guard
// ══════════════════════════════════════════════════════════════════════════════

describe('Premium + jsonMode guard', () => {
  it('throws when premium=true AND jsonMode=true', async () => {
    await expect(
      generateText({ ...BASE_OPTIONS, premium: true, jsonMode: true }),
    ).rejects.toThrow(/premium.*jsonMode|jsonMode.*premium/i)
  })

  it('does NOT call OpenAI when guard throws', async () => {
    try {
      await generateText({ ...BASE_OPTIONS, premium: true, jsonMode: true })
    } catch {
      // expected
    }
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('jsonMode without premium works fine', async () => {
    mockOpenAIResponse('{"key": "value"}')
    await expect(
      generateText({ ...BASE_OPTIONS, jsonMode: true }),
    ).resolves.toBeDefined()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 3. Response shape
// ══════════════════════════════════════════════════════════════════════════════

describe('Response shape', () => {
  it('returns text from the first choice', async () => {
    mockOpenAIResponse('Kupní smlouva text')
    const result = await generateText(BASE_OPTIONS)
    expect(result.text).toBe('Kupní smlouva text')
  })

  it('returns tokensUsed from usage', async () => {
    mockOpenAIResponse('text', 2345)
    const result = await generateText(BASE_OPTIONS)
    expect(result.tokensUsed).toBe(2345)
  })

  it('throws when OpenAI returns empty content', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
      usage: { total_tokens: 0 },
    })
    await expect(generateText(BASE_OPTIONS)).rejects.toThrow(/empty/i)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// 4. Reasoning effort
// ══════════════════════════════════════════════════════════════════════════════

describe('Reasoning effort', () => {
  it('defaults to reasoning_effort=high for legal drafting', async () => {
    mockOpenAIResponse('text')
    await generateText(BASE_OPTIONS)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ reasoning_effort: 'high' }),
    )
  })

  it('passes reasoning=low when specified', async () => {
    mockOpenAIResponse('text')
    await generateText({ ...BASE_OPTIONS, reasoning: 'low' })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ reasoning_effort: 'low' }),
    )
  })

  it('does not pass reasoning_effort when reasoning=medium', async () => {
    mockOpenAIResponse('text')
    await generateText({ ...BASE_OPTIONS, reasoning: 'medium' })
    const callArgs = mockCreate.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('reasoning_effort')
  })
})
