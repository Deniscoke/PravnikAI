/**
 * Turn OpenAI SDK / network failures into a short, user-safe Czech explanation.
 * Never forwards API keys; truncates long provider messages.
 */

import { APIError } from 'openai/error'
import type { Locale } from '@/lib/contracts/types'

const MAX_SNIPPET = 280

function scrubSecrets(s: string): string {
  return s
    .replace(/sk-[a-zA-Z0-9_\-]{8,}/g, '…')
    .replace(/Bearer\s+[a-zA-Z0-9._\-]+/gi, 'Bearer …')
}

function clip(s: string): string {
  const t = scrubSecrets(s).trim()
  if (t.length <= MAX_SNIPPET) return t
  return `${t.slice(0, MAX_SNIPPET)}…`
}

function nestedMessage(err: APIError): string {
  const e = err.error
  if (e && typeof e === 'object' && 'message' in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === 'string' && m.trim()) return m.trim()
  }
  return err.message?.trim() || ''
}

/**
 * Returns a Czech secondary line for the UI (under the generic "AI communication" headline).
 * Locale parameter kept for backward compatibility but output is always Czech.
 */
export function formatOpenAiUserHint(err: unknown, _locale?: Locale): string {
  if (err instanceof APIError) {
    const raw = clip(nestedMessage(err))
    const code = typeof err.code === 'string' ? err.code : ''
    const status = typeof err.status === 'number' ? err.status : undefined
    return hintCs(status, code, raw, err.constructor.name)
  }

  if (err instanceof Error) {
    return `Technická zpráva: ${clip(err.message)}`
  }

  return 'Neznámá chyba — podívejte se do logů funkcí na Vercelu.'
}

function hintCs(
  status: number | undefined,
  code: string,
  raw: string,
  ctor: string,
): string {
  if (ctor === 'APIConnectionTimeoutError')
    return 'Časový limit při volání OpenAI. Zkuste to za chvíli.'
  if (ctor === 'APIConnectionError')
    return 'Nepodařilo se spojit s OpenAI (síť). Zkontrolujte připojení serveru.'
  switch (status) {
    case 401:
      return 'OpenAI vrátila 401 — neplatný nebo chybějící API klíč. Na Vercelu zkontrolujte proměnnou OPENAI_API_KEY pro Production.'
    case 403:
      return 'OpenAI zamítla přístup (403) — práva projektu, organizace nebo model pro váš účet není povolen.'
    case 404:
      return 'Model neexistuje nebo k němu váš klíč nemá přístup (404). V Environment Variables zkuste OPENAI_* nastavit např. na gpt-4o.'
    case 429:
      if (/insufficient[_\s]?quota|billing|quota/i.test(raw) || code === 'insufficient_quota')
        return 'Vyčerpána kvóta OpenAI / platební limit. Dobijte billing nebo počkejte.'
      return 'OpenAI omezila počet požadavků (429). Zkuste to později nebo zkontrolujte limity projektu.'
    case 500:
    case 502:
    case 503:
      return `OpenAI vrátila chybu serveru (${status}). Zopakujte akci později.`
    case 400:
      return raw ? `Neplatný parametr požadavku (400): ${raw}` : 'Neplatný požadavek vůči OpenAI (400).'
    default:
      return raw ? `Podrobnost od OpenAI: ${raw}` : 'Podrobnosti jsou ve Vercel logu u POST /api/generate-contract.'
  }
}
