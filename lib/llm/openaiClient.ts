/**
 * LLM provider wrapper — OpenAI
 *
 * This is the ONLY file that imports the OpenAI SDK.
 * The rest of the codebase (route, schemas, validators, promptBuilder)
 * calls generateText() and remains provider-agnostic.
 *
 * To switch providers in future: replace this file only.
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Model choice for legal drafting:
 * - gpt-4o: best quality, handles long structured output reliably
 * Temperature 0.1 — legal text must be deterministic and consistent,
 * not creative. Low temp avoids hallucinated clause variations.
 */
const MODEL = 'gpt-4o'
const TEMPERATURE = 0.1
const MAX_TOKENS = 4096

export interface LLMGenerateOptions {
  systemPrompt: string
  userPrompt: string
  /** Override default temperature (0.1) for this call */
  temperature?: number
  /** Override default max_tokens (4096) for this call */
  maxTokens?: number
  /** Request structured JSON output (requires "JSON" in system prompt) */
  jsonMode?: boolean
}

export interface LLMGenerateResult {
  text: string
  /** Total tokens used — useful for cost monitoring */
  tokensUsed: number
}

/**
 * Calls OpenAI chat completions and returns the generated text.
 * Throws on API error — the caller is responsible for error handling.
 *
 * Per-call overrides (temperature, maxTokens, jsonMode) take precedence
 * over module-level defaults without changing them for other callers.
 */
export async function generateText(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    temperature: options.temperature ?? TEMPERATURE,
    max_tokens: options.maxTokens ?? MAX_TOKENS,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  })

  const choice = completion.choices[0]
  if (!choice?.message?.content) {
    throw new Error('OpenAI returned an empty response')
  }

  return {
    text: choice.message.content,
    tokensUsed: completion.usage?.total_tokens ?? 0,
  }
}
