/**
 * POST /api/export-pdf
 *
 * Renders the generated contract text into a professionally typeset PDF file
 * for Czech-law contract drafts.
 *
 * Typography:
 *   - A4 paper, 25mm margins
 *   - Embedded Tinos font (Times-compatible) so Czech diacritics render correctly
 *   - Body 11pt justified, headings bold 13/12pt, first-line indent
 *   - Mode banner at the top (DRAFT / REVIEW)
 *   - Header with contract title; footer with page numbers and metadata
 *
 * pdfkit's built-in standard-14 fonts are deliberately NOT used: they require
 * `.afm` metric files that Next.js does not bundle into the serverless function
 * (causing ENOENT for Helvetica.afm at runtime), and their WinAnsi encoding
 * cannot represent Czech glyphs (č, ř, ě, ů, ž, …). We embed a Unicode TTF
 * instead, bundled via next.config `outputFileTracingIncludes`.
 */

import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { assertBillingAccess, recordExport } from '@/lib/billing/guard'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rateLimit'
import { getSchema, resolveSchemaId } from '@/lib/contracts/contractSchemas'
import { getExportStrings, formatExportDate, type ExportStrings } from '@/lib/export/strings'
import { SITE_NAME } from '@/lib/seo/site'
import type { Jurisdiction } from '@/lib/contracts/types'

// pdfkit needs the Node.js runtime
export const runtime = 'nodejs'

export const maxDuration = 120

// Embedded Unicode fonts (bundled via next.config outputFileTracingIncludes).
// Passing a TTF path as the default font also prevents pdfkit from loading its
// built-in Helvetica.afm at construction time (which is not bundled → ENOENT).
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts')
const FONT = {
  regular: path.join(FONT_DIR, 'Tinos-Regular.ttf'),
  bold: path.join(FONT_DIR, 'Tinos-Bold.ttf'),
  italic: path.join(FONT_DIR, 'Tinos-Italic.ttf'),
}

interface ExportRequest {
  contractText: string
  contractName: string
  mode: string
  schemaId: string
  generatedAt: string
  legalBasis: string[]
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 0a. Rate limit ────────────────────────────────────────────────────────
  const ip = getClientIp(req.headers)
  const rl = await checkRateLimit(`export-pdf:${ip}`, { max: 20, windowMs: 60_000, whenUnavailable: 'allow' })
  if (!rl.allowed) {
    return rateLimitResponse(rl, 'Too many requests. Try again shortly.')
  }

  // ── 0b. Billing guard ─────────────────────────────────────────────────────
  const guard = await assertBillingAccess('export')
  if (!guard.allowed) return guard.response

  let body: ExportRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.contractText || !body.contractName) {
    return NextResponse.json({ error: 'Missing contractText or contractName' }, { status: 400 })
  }

  if (body.contractText.length > 500_000) {
    return NextResponse.json({ error: 'Contract text too large' }, { status: 413 })
  }

  // ── Resolve jurisdiction ──────────────────────────────────────────────────
  let jurisdiction: Jurisdiction = 'CZ'
  try {
    const schema = getSchema(resolveSchemaId(body.schemaId))
    jurisdiction = schema.metadata.jurisdiction
  } catch {
    // Unknown schemaId — keep CZ default
  }
  const strings = getExportStrings(jurisdiction)
  const safeLegalBasis = Array.isArray(body.legalBasis) ? body.legalBasis : []

  // ── Render PDF ────────────────────────────────────────────────────────────
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderPdf({
      contractText: body.contractText,
      contractName: body.contractName,
      mode: body.mode,
      schemaId: body.schemaId,
      generatedAt: body.generatedAt,
      legalBasis: safeLegalBasis,
      strings,
      jurisdiction,
    })
  } catch (err) {
    console.error('[export-pdf] Render failed:', err)
    return NextResponse.json(
      { error: 'PDF generation failed. Please try again.' },
      { status: 500 },
    )
  }

  if (guard.user) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    recordExport(supabase, guard.user.id).catch(() => {})
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeFilename(body.contractName)}.pdf"`,
    },
  })
}

// ─── PDF rendering ───────────────────────────────────────────────────────────

interface RenderInput {
  contractText: string
  contractName: string
  mode: string
  schemaId: string
  generatedAt: string
  legalBasis: string[]
  strings: ExportStrings
  jurisdiction: Jurisdiction
}

const PT = (n: number) => n // alias for clarity (pdfkit uses points)
const MARGIN = 70 // ~25mm at 72dpi (≈ 70.87)
const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

function renderPdf(input: RenderInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MARGIN, right: MARGIN, bottom: MARGIN + 30, left: MARGIN },
      info: {
        Title: input.contractName,
        Author: SITE_NAME,
        Subject: 'AI-generated working draft (CZ)',
        Keywords: 'AI-generated, working draft, Czech law, Právo365',
        Producer: `${SITE_NAME} (pdfkit)`,
        Creator: SITE_NAME,
      },
      bufferPages: true,
      // TTF path as default font → no built-in Helvetica.afm load
      font: FONT.regular,
    })

    // Register the embedded Unicode faces used throughout the document
    doc.registerFont('body', FONT.regular)
    doc.registerFont('bold', FONT.bold)
    doc.registerFont('italic', FONT.italic)
    doc.font('body')

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Mode banner ────────────────────────────────────────────────────────
    if (input.mode === 'draft') {
      drawBanner(doc, input.strings.draftBanner, input.strings.draftBannerTail, '#B8860B')
    } else if (input.mode === 'review-needed') {
      drawBanner(doc, input.strings.reviewBanner, input.strings.reviewBannerTail, '#CC0000')
    }

    // ── Body content ───────────────────────────────────────────────────────
    drawBody(doc, input.contractText, input.jurisdiction)

    // ── Disclaimer ──────────────────────────────────────────────────────────
    doc.moveDown(2)
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor('#DDDDDD')
      .lineWidth(0.5)
      .stroke()
    doc.moveDown(0.4)
    doc
      .font('italic')
      .fontSize(8.5)
      .fillColor('#888888')
      .text(input.strings.disclaimer, {
        align: 'justify',
        lineGap: 1,
      })
    // ── AI label (B-05) — visible notice ──
    doc.moveDown(0.5)
    doc
      .font('body')
      .fontSize(8.5)
      .fillColor('#888888')
      .text('Vygenerováno pomocí AI · pracovní návrh podle českého práva · nenahrazuje právní poradenství', {
        align: 'center',
      })
    doc.fillColor('#000000')

    // ── Header & footer on every page ──────────────────────────────────────
    drawHeaderFooterAllPages(doc, input)

    doc.end()
  })
}

function drawBanner(doc: PDFKit.PDFDocument, label: string, tail: string, accent: string): void {
  const startX = doc.page.margins.left
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right

  doc.font('bold').fontSize(11).fillColor(accent).text(label, startX, doc.y, { continued: true })
  doc.font('italic').fontSize(10).fillColor('#666666').text(`  —  ${tail}`)
  doc.fillColor('#000000')
  doc.moveDown(0.5)
  doc
    .moveTo(startX, doc.y)
    .lineTo(startX + width, doc.y)
    .strokeColor('#CCCCCC')
    .lineWidth(0.5)
    .stroke()
  doc.moveDown(0.8)
}

function drawBody(doc: PDFKit.PDFDocument, text: string, _jurisdiction: Jurisdiction): void {
  const lines = text.split('\n')
  const indent = 18 // first-line indent (~6mm) for body paragraphs
  doc.fillColor('#000000')

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      doc.moveDown(0.4)
      continue
    }

    // Article headings
    if (
      /^(Článek|Clanek|ČLÁNEK|CLANEK|Article|Clause|Klausel|Abschnitt|§)\s+/i.test(trimmed) ||
      /^[IVXLCDM]+\.\s/.test(trimmed)
    ) {
      doc.moveDown(0.7)
      doc
        .font('bold')
        .fontSize(13)
        .fillColor('#111111')
        .text(trimmed, { align: 'left', paragraphGap: 4, lineGap: 2 })
      continue
    }

    // ALL CAPS sub-headings
    if (
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3 &&
      trimmed.length < 80 &&
      /[A-ZÁ-ŽÄÖÜ]/.test(trimmed)
    ) {
      doc.moveDown(0.5)
      doc
        .font('bold')
        .fontSize(12)
        .fillColor('#111111')
        .text(trimmed, { align: 'left', paragraphGap: 3 })
      continue
    }

    // Signature lines
    if (/^[_\-]{10,}$/.test(trimmed)) {
      doc.moveDown(1.0)
      doc.font('body').fontSize(11).fillColor('#333333').text('________________________________________')
      continue
    }

    // Numbered lists
    const isListItem = /^\d+\.\s/.test(trimmed)

    // Body paragraph
    drawParagraphWithBold(doc, trimmed, {
      align: 'justify',
      indent: isListItem ? 0 : indent,
    })
  }
}

/**
 * Renders a body paragraph honouring `**bold**` inline markers.
 * pdfkit doesn't natively parse markdown so we walk the chunks ourselves.
 */
function drawParagraphWithBold(
  doc: PDFKit.PDFDocument,
  text: string,
  opts: { align: 'left' | 'justify'; indent: number },
): void {
  doc.font('body').fontSize(11).fillColor('#000000')
  const parts = text.split(/\*\*(.*?)\*\*/g)
  // The text starts at the cursor position; first chunk gets the indent
  let firstChunk = true
  const lastIndex = parts.length - 1

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i]
    if (!segment) continue
    const isBold = i % 2 === 1
    doc.font(isBold ? 'bold' : 'body').fontSize(11)

    const isLast = i === lastIndex
    doc.text(segment, {
      align: opts.align,
      indent: firstChunk ? opts.indent : 0,
      continued: !isLast,
      lineGap: 2,
    })
    firstChunk = false
  }
}

/**
 * Draws the running header (top-right, italic muted) and footer (centred,
 * small grey, with page numbers) on every generated page.
 */
function drawHeaderFooterAllPages(doc: PDFKit.PDFDocument, input: RenderInput): void {
  const range = doc.bufferedPageRange()
  const total = range.count
  const dateStr = formatExportDate(input.generatedAt, input.jurisdiction)
  const legalBasisLine = input.legalBasis.length > 0
    ? `${input.strings.legalBasisPrefix} ${input.legalBasis.join(', ')}`
    : ''

  for (let i = 0; i < total; i++) {
    doc.switchToPage(range.start + i)
    const pageNumber = i + 1
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height

    // The footer sits below the bottom margin. pdfkit reacts to text past the
    // margin by starting a new page, which appended a blank page per rendered
    // page (a 2-page contract exported as 6). Drop the bottom margin while the
    // running header/footer is drawn, and never let these lines wrap.
    const bottomMargin = doc.page.margins.bottom
    doc.page.margins.bottom = 0
    const runningLine = { lineBreak: false as const }

    // ── Header — contract name, top right ─────────────────────────────────
    doc
      .font('italic')
      .fontSize(8)
      .fillColor('#888888')
      .text(
        `${input.contractName} — ${SITE_NAME}`,
        doc.page.margins.left,
        20,
        { width: pageWidth - 2 * doc.page.margins.left, align: 'right', ...runningLine },
      )

    // ── Footer ─────────────────────────────────────────────────────────────
    const footerY = pageHeight - 50
    doc
      .font('body')
      .fontSize(8)
      .fillColor('#888888')
      .text(
        `${input.strings.generatedBy} | ${dateStr} | ${input.schemaId}    ` +
          `${input.strings.page} ${pageNumber} ${input.strings.of} ${total}`,
        doc.page.margins.left,
        footerY,
        { width: pageWidth - 2 * doc.page.margins.left, align: 'center', ...runningLine },
      )

    if (legalBasisLine) {
      doc
        .font('italic')
        .fontSize(7.5)
        .fillColor('#AAAAAA')
        .text(legalBasisLine, doc.page.margins.left, footerY + 12, {
          width: pageWidth - 2 * doc.page.margins.left,
          align: 'center',
          ...runningLine,
        })
    }

    doc.page.margins.bottom = bottomMargin
  }

  doc.fillColor('#000000')
}

function encodeFilename(name: string): string {
  return name
    .replace(/[^\w\s\u00C0-\u024F-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100)
}
// pdfkit silences unused jurisdiction param warning when type-checked
void PT
