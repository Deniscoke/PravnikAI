/**
 * Turn OpenAI SDK / network failures into a short, user-safe explanation.
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
 * Returns a secondary line for the UI (under the generic “AI communication” headline).
 */
export function formatOpenAiUserHint(err: unknown, locale: Locale): string {
  if (err instanceof APIError) {
    const raw = clip(nestedMessage(err))
    const code = typeof err.code === 'string' ? err.code : ''
    const status = typeof err.status === 'number' ? err.status : undefined

    if (locale === 'de') return hintDe(status, code, raw, err.constructor.name)
    if (locale === 'en') return hintEn(status, code, raw, err.constructor.name)
    return hintCs(status, code, raw, err.constructor.name)
  }

  if (err instanceof Error) {
    const raw = clip(err.message)
    if (locale === 'de') return `Technische Meldung: ${raw}`
    if (locale === 'en') return `Technical detail: ${raw}`
    return `Technická zpráva: ${raw}`
  }

  if (locale === 'de') return 'Unbekannter Fehler — bitte Vercel-Logs prüfen.'
  if (locale === 'en') return 'Unknown error — check Vercel function logs.'
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

function hintDe(status: number | undefined, code: string, raw: string, ctor: string): string {
  if (ctor === 'APIConnectionTimeoutError')
    return 'Zeitüberschreitung bei OpenAI. Bitte später erneut versuchen.'
  if (ctor === 'APIConnectionError')
    return 'Keine Verbindung zu OpenAI (Netzwerk). Bitte später erneut versuchen.'
  switch (status) {
    case 401:
      return 'OpenAI meldet 401 — ungültiger oder fehlender API-Schlüssel. Prüfen Sie OPENAI_API_KEY in Vercel (Production).'
    case 403:
      return 'Zugriff verweigert (403) — Projekt-/Organisationsrechte oder Modell ohne Freigabe.'
    case 404:
      return 'Modell nicht gefunden oder keine Berechtigung (404). ENV z. B. auf gpt-4o setzen.'
    case 429:
      if (/insufficient[_\s]?quota|billing|quota/i.test(raw) || code === 'insufficient_quota')
        return 'OpenAI-Kontingent oder Abrechnungslimit erreicht.'
      return 'Zu viele Anfragen bei OpenAI (429). Bitte später erneut versuchen.'
    case 500:
    case 502:
    case 503:
      return `OpenAI-Serverfehler (${status}). Bitte später erneut versuchen.`
    case 400:
      return raw ? `Ungültige Anfrage (400): ${raw}` : 'Ungültige Anfrage an OpenAI (400).'
    default:
      return raw ? `OpenAI meldet: ${raw}` : 'Details in den Vercel-Funktionslogs (POST /api/generate-contract).'
  }
}

function hintEn(status: number | undefined, code: string, raw: string, ctor: string): string {
  if (ctor === 'APIConnectionTimeoutError')
    return 'Request to OpenAI timed out. Please try again shortly.'
  if (ctor === 'APIConnectionError')
    return 'Could not reach OpenAI (network). Please try again.'
  switch (status) {
    case 401:
      return 'OpenAI returned 401 — invalid or missing API key. Check OPENAI_API_KEY for Production on Vercel.'
    case 403:
      return 'Access denied (403) — project/org permissions or model not enabled for this key.'
    case 404:
      return 'Model not found or not allowed for your key (404). Try setting OPENAI_* env vars to e.g. gpt-4o.'
    case 429:
      if (/insufficient[_\s]?quota|billing|quota/i.test(raw) || code === 'insufficient_quota')
        return 'OpenAI quota or billing limit reached.'
      return 'OpenAI rate limit (429). Try again later.'
    case 500:
    case 502:
    case 503:
      return `OpenAI server error (${status}). Retry later.`
    case 400:
      return raw ? `Bad request (400): ${raw}` : 'Bad request to OpenAI (400).'
    default:
      return raw ? `From OpenAI: ${raw}` : 'See Vercel function logs for POST /api/generate-contract.'
  }
}
