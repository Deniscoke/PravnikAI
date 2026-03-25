/**
 * LLM provider wrapper — OpenAI
 *
 * This is the ONLY file that imports the OpenAI SDK.
 * The rest of the codebase (route, schemas, validators, promptBuilder)
 * calls generateText() and remains provider-agnostic.
 *
 * Model strategy:
 *   - gpt-5.4:     Default for contract generation and structured review (JSON)
 *   - gpt-5.4-pro: Optional premium final-text polish pass (never for JSON outputs)
 *
 * To switch providers in future: replace this file only.
 */

import OpenAI from 'openai'

// Lazy singleton — instantiated on first use, not at build time.
// This prevents Next.js build failures when OPENAI_API_KEY is absent
// in the CI/build environment (e.g. Vercel build step).
let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (_openai) return _openai
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ─── Model configuration ────────────────────────────────────────────────────

/** Default model for contract generation and structured review */
const MODEL_DEFAULT = 'gpt-5.4'

/** Premium model for optional final-text polish — NEVER for structured JSON */
const MODEL_PREMIUM = 'gpt-5.4-pro'

/**
 * Temperature 0.1 — legal text must be deterministic and consistent,
 * not creative. Low temp avoids hallucinated clause variations.
 */
const TEMPERATURE = 0.1

/** Increased from 4096 to support longer, more thorough contracts */
const MAX_TOKENS = 16384

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LLMGenerateOptions {
  systemPrompt: string
  userPrompt: string
  /** Override default temperature (0.1) for this call */
  temperature?: number
  /** Override default max_tokens (16384) for this call */
  maxTokens?: number
  /** Request structured JSON output (requires "JSON" in system prompt) */
  jsonMode?: boolean
  /** Use premium model (gpt-5.4-pro) — only for final text, never for JSON */
  premium?: boolean
  /** Reasoning effort: 'low' | 'medium' | 'high' — default 'high' for legal drafting */
  reasoning?: 'low' | 'medium' | 'high'
}

export interface LLMGenerateResult {
  text: string
  /** Total tokens used — useful for cost monitoring */
  tokensUsed: number
  /** Which model was actually used */
  model: string
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Calls OpenAI chat completions and returns the generated text.
 * Throws on API error — the caller is responsible for error handling.
 *
 * Per-call overrides (temperature, maxTokens, jsonMode, premium, reasoning)
 * take precedence over module-level defaults without changing them for other callers.
 *
 * Model routing:
 *   - premium=true → gpt-5.4-pro (must NOT be combined with jsonMode=true)
 *   - default      → gpt-5.4
 */
export async function generateText(options: LLMGenerateOptions): Promise<LLMGenerateResult> {
  // Guard: gpt-5.4-pro must NOT be used for structured JSON output
  if (options.premium && options.jsonMode) {
    throw new Error(
      'Configuration error: premium model (gpt-5.4-pro) must not be used with jsonMode. ' +
      'Use the default model (gpt-5.4) for structured JSON outputs.'
    )
  }

  const model = options.premium ? MODEL_PREMIUM : MODEL_DEFAULT
  const reasoning = options.reasoning ?? 'high'

  const completion = await getOpenAI().chat.completions.create({
    model,
    temperature: options.temperature ?? TEMPERATURE,
    max_tokens: options.maxTokens ?? MAX_TOKENS,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt },
    ],
    ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    // GPT-5 reasoning control — 'high' for legal drafting precision
    ...(reasoning !== 'medium' ? { reasoning_effort: reasoning } : {}),
  })

  const choice = completion.choices[0]
  if (!choice?.message?.content) {
    throw new Error('OpenAI returned an empty response')
  }

  return {
    text: choice.message.content,
    tokensUsed: completion.usage?.total_tokens ?? 0,
    model,
  }
}
