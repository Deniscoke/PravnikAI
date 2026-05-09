/**
 * @see lib/llm/userVisibleLlmError.ts
 */

import { describe, it, expect } from 'vitest'
import { NotFoundError } from 'openai/error'
import { formatOpenAiUserHint } from '../userVisibleLlmError'

describe('formatOpenAiUserHint', () => {
  it('maps OpenAI 404 to Czech model-access guidance', () => {
    const err = new NotFoundError(
      404,
      { message: 'The model `fake-model` does not exist' },
      undefined,
      undefined as unknown as import('openai/core').Headers,
    )
    const hint = formatOpenAiUserHint(err, 'cs')
    expect(hint).toMatch(/404|Model|model|gpt-4o/i)
  })

  it('handles generic Error for cs', () => {
    const hint = formatOpenAiUserHint(new Error('Something broke'), 'cs')
    expect(hint).toContain('Technická zpráva')
  })
})
