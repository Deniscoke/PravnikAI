/**
 * POST /api/extract-text
 *
 * Pulls plain text out of an uploaded PDF or DOCX so it can be reviewed.
 * Extraction only — nothing is stored and no AI is involved; the extracted
 * text goes back to the browser, where the user can read it before sending it
 * on to the review endpoint.
 *
 * Server-side on purpose: the parsers are heavy and would otherwise ship to
 * every visitor's browser.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { assertBillingAccess } from '@/lib/billing/guard'

export const runtime = 'nodejs'
export const maxDuration = 60

/** Large enough for a long contract, small enough to keep parsing quick. */
const MAX_FILE_BYTES = 10 * 1024 * 1024
/** Matches the review endpoint's own ceiling. */
const MAX_TEXT_LENGTH = 100_000

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`extract:${ip}`, {
    max: 10,
    windowMs: 60_000,
    whenUnavailable: 'allow',
  })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.')
  }

  // Same gate as the review itself — extraction is a step of that flow, not a
  // free document-conversion service.
  const guard = await assertBillingAccess('review')
  if (!guard.allowed) return guard.response

  let file: File | null = null
  try {
    const form = await req.formData()
    const candidate = form.get('file')
    file = candidate instanceof File ? candidate : null
  } catch {
    return NextResponse.json({ error: 'Nepodařilo se načíst soubor.' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'Nebyl přiložen žádný soubor.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'Soubor je příliš velký (max. 10 MB).', code: 'FILE_TOO_LARGE' },
      { status: 413 },
    )
  }

  const name = file.name.toLowerCase()
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  const isDocx = file.type === DOCX_MIME || name.endsWith('.docx')

  if (!isPdf && !isDocx) {
    return NextResponse.json(
      {
        error: 'Podporujeme pouze soubory PDF a DOCX. Starší formát .doc prosím uložte jako .docx.',
        code: 'UNSUPPORTED_TYPE',
      },
      { status: 415 },
    )
  }

  let text: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    text = isPdf ? await extractFromPdf(buffer) : await extractFromDocx(buffer)
  } catch (err) {
    console.error('[extract-text] Extraction failed:', err)
    return NextResponse.json(
      { error: 'Text se z dokumentu nepodařilo přečíst. Zkuste jej prosím vložit ručně.' },
      { status: 422 },
    )
  }

  const cleaned = normalizeExtractedText(text)

  if (cleaned.length === 0) {
    return NextResponse.json(
      {
        error:
          'V dokumentu jsme nenašli žádný text. Bývá to u naskenovaných smluv — ' +
          'ty obsahují jen obrázek stránky. Zkopírujte prosím text ručně.',
        code: 'NO_TEXT_FOUND',
      },
      { status: 422 },
    )
  }

  return NextResponse.json({
    text: cleaned.slice(0, MAX_TEXT_LENGTH),
    truncated: cleaned.length > MAX_TEXT_LENGTH,
    characters: Math.min(cleaned.length, MAX_TEXT_LENGTH),
  })
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import('unpdf')
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return Array.isArray(text) ? text.join('\n') : text
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const { value } = await mammoth.extractRawText({ buffer })
  return value
}

/**
 * Extractors leave artefacts — non-breaking spaces, stray carriage returns and
 * long runs of blank lines from page breaks. The review prompt reads better
 * without them.
 */
function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/ /g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
