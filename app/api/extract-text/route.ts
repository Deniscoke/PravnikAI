/**
 * POST /api/extract-text
 *
 * Turns an uploaded contract into plain text so it can be reviewed. Two paths:
 *
 *   - PDF / DOCX  → parsed locally, no AI involved, nothing is stored
 *   - photos      → transcribed by a vision model (see lib/ocr/contractOcr)
 *
 * Either way the text goes back to the browser and lands in the textarea, where
 * the user reads it before sending it on. That matters more for photos than for
 * documents: a transcription can misread a figure, and reviewing a mangled text
 * without showing it first would be worse than not offering the feature.
 *
 * Server-side on purpose: the parsers are heavy and would otherwise ship to
 * every visitor's browser, and the API key must never reach the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { assertBillingAccess } from '@/lib/billing/guard'
import { transcribeContractImages, unreadableRatio } from '@/lib/ocr/contractOcr'

export const runtime = 'nodejs'
export const maxDuration = 120

/** Large enough for a long contract, small enough to keep parsing quick. */
const MAX_FILE_BYTES = 10 * 1024 * 1024
/** Matches the review endpoint's own ceiling. */
const MAX_TEXT_LENGTH = 100_000

/**
 * Photo limits.
 *
 * The browser slices each page into overlapping horizontal strips before
 * uploading (see lib/ocr/pageSlicer) — without that the API downsamples a full
 * page to ~768px wide and the model starts inventing text rather than reading
 * it. So what arrives here is strips, not pages: more images, each much smaller.
 *
 * Roughly three strips per page, so twenty strips is about five pages. These
 * are cost controls first: every strip is billed as image tokens.
 */
const MAX_IMAGES = 20
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_TOTAL_IMAGE_BYTES = 25 * 1024 * 1024

/** Formats the vision model reliably accepts. */
const SUPPORTED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i
/** iPhone's default format — rejected by the API, and worth naming explicitly. */
const HEIC_PATTERN = /\.(heic|heif)$/i

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

type FileKind = 'pdf' | 'docx' | 'image' | 'heic' | 'unsupported'

function classify(file: File): FileKind {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (file.type === DOCX_MIME || name.endsWith('.docx')) return 'docx'
  if (SUPPORTED_IMAGE_MIMES.has(file.type) || IMAGE_EXTENSIONS.test(name)) return 'image'
  if (HEIC_PATTERN.test(name) || file.type === 'image/heic' || file.type === 'image/heif') {
    return 'heic'
  }
  return 'unsupported'
}

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
  // free document-conversion service. The global daily AI cap rides along
  // inside this call, which is what bounds the transcription spend.
  const guard = await assertBillingAccess('review')
  if (!guard.allowed) return guard.response

  let files: File[] = []
  let form: FormData
  try {
    form = await req.formData()
    files = form.getAll('file').filter((c): c is File => c instanceof File)
  } catch {
    return NextResponse.json({ error: 'Nepodařilo se načíst soubor.' }, { status: 400 })
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nebyl přiložen žádný soubor.' }, { status: 400 })
  }

  const kinds = files.map(classify)

  if (kinds.includes('heic')) {
    return NextResponse.json(
      {
        error:
          'Formát HEIC zatím nepodporujeme. V iPhonu jej lze vypnout v Nastavení → Fotoaparát → ' +
          'Formáty → Nejkompatibilnější, nebo fotku před nahráním uložte jako JPEG.',
        code: 'UNSUPPORTED_TYPE',
      },
      { status: 415 },
    )
  }

  if (kinds.every((k) => k === 'image')) {
    // The client reports how many original pages the strips came from; without
    // it we would tell the model it is looking at twenty separate pages.
    const reported = Number.parseInt(String(form.get('pages') ?? ''), 10)
    const pageCount = Number.isFinite(reported) && reported > 0 ? reported : files.length
    return handlePhotos(files, pageCount)
  }

  if (files.length > 1) {
    return NextResponse.json(
      {
        error: 'Více souborů najednou lze nahrát pouze u fotografií. Dokument nahrajte samostatně.',
        code: 'TOO_MANY_FILES',
      },
      { status: 400 },
    )
  }

  const kind = kinds[0]
  if (kind !== 'pdf' && kind !== 'docx') {
    return NextResponse.json(
      {
        error:
          'Podporujeme PDF, DOCX a fotografie (JPG, PNG, WEBP). ' +
          'Starší formát .doc prosím uložte jako .docx.',
        code: 'UNSUPPORTED_TYPE',
      },
      { status: 415 },
    )
  }

  return handleDocument(files[0], kind)
}

// ─── Documents ────────────────────────────────────────────────────────────────

async function handleDocument(file: File, kind: 'pdf' | 'docx'): Promise<NextResponse> {
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'Soubor je příliš velký (max. 10 MB).', code: 'FILE_TOO_LARGE' },
      { status: 413 },
    )
  }

  let text: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    text = kind === 'pdf' ? await extractFromPdf(buffer) : await extractFromDocx(buffer)
  } catch (err) {
    console.error('[extract-text] Extraction failed:', err)
    return NextResponse.json(
      { error: 'Text se z dokumentu nepodařilo přečíst. Zkuste jej prosím vložit ručně.' },
      { status: 422 },
    )
  }

  const cleaned = normalizeExtractedText(text)

  if (cleaned.length === 0) {
    // A scanned PDF holds a picture of each page and no text layer. Now that
    // photos work, there is something better to suggest than retyping it.
    return NextResponse.json(
      {
        error:
          'V dokumentu jsme nenašli žádný text — bývá to u naskenovaných smluv, ' +
          'které obsahují jen obrázek stránky. Vyfoťte prosím stránky telefonem ' +
          'a nahrajte je jako fotografie, ty přečíst umíme.',
        code: 'NO_TEXT_FOUND',
      },
      { status: 422 },
    )
  }

  return NextResponse.json({
    text: cleaned.slice(0, MAX_TEXT_LENGTH),
    truncated: cleaned.length > MAX_TEXT_LENGTH,
    characters: Math.min(cleaned.length, MAX_TEXT_LENGTH),
    source: 'document',
  })
}

// ─── Photos ───────────────────────────────────────────────────────────────────

async function handlePhotos(files: File[], pageCount: number): Promise<NextResponse> {
  if (files.length > MAX_IMAGES) {
    return NextResponse.json(
      {
        error:
          'Najednou lze zpracovat přibližně 5 stránek. Delší smlouvu nahrajte po částech ' +
          'nebo jako PDF.',
        code: 'TOO_MANY_FILES',
      },
      { status: 413 },
    )
  }

  if (files.some((f) => f.size > MAX_IMAGE_BYTES)) {
    return NextResponse.json(
      { error: 'Jedna z fotografií je příliš velká (max. 8 MB).', code: 'FILE_TOO_LARGE' },
      { status: 413 },
    )
  }

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: 'Fotografie dohromady přesahují 20 MB. Nahrajte je prosím po částech.',
        code: 'FILE_TOO_LARGE',
      },
      { status: 413 },
    )
  }

  let dataUrls: string[]
  try {
    dataUrls = await Promise.all(files.map(toDataUrl))
  } catch {
    return NextResponse.json({ error: 'Fotografie se nepodařilo načíst.' }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof transcribeContractImages>>
  try {
    result = await transcribeContractImages(dataUrls, pageCount)
  } catch (err) {
    console.error('[extract-text] Transcription failed:', err)
    return NextResponse.json(
      { error: 'Text se z fotografií nepodařilo přečíst. Zkuste je prosím vyfotit znovu.' },
      { status: 502 },
    )
  }

  console.info(
    `[extract-text] Transcribed ${pageCount} page(s) as ${files.length} slice(s), ` +
      `${result.tokensUsed} tokens, model ${result.model}`,
  )

  if (result.unreadable) {
    return NextResponse.json(
      {
        error:
          'Z fotografií se nepodařilo přečíst žádný text. Vyfoťte prosím každou stránku ' +
          'zvlášť, kolmo shora, za dobrého světla a tak, aby vyplnila celý snímek.',
        code: 'NO_TEXT_FOUND',
      },
      { status: 422 },
    )
  }

  const cleaned = normalizeExtractedText(result.text)

  return NextResponse.json({
    text: cleaned.slice(0, MAX_TEXT_LENGTH),
    truncated: cleaned.length > MAX_TEXT_LENGTH,
    characters: Math.min(cleaned.length, MAX_TEXT_LENGTH),
    source: 'photo',
    pages: pageCount,
    // Lets the client warn before the user reviews a text full of holes.
    unreadableRatio: Number(unreadableRatio(cleaned).toFixed(3)),
  })
}

async function toDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const mime = SUPPORTED_IMAGE_MIMES.has(file.type) ? file.type : 'image/jpeg'
  return `data:${mime};base64,${buffer.toString('base64')}`
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

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
