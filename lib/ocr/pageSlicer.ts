/**
 * Cuts a photographed page into horizontal slices before transcription.
 * Browser-only — needs canvas.
 *
 * WHY THIS EXISTS
 *
 * OpenAI's vision input at `detail: 'high'` scales the image's *shortest* side
 * to 768px before tiling it. A portrait photo of an A4 page therefore arrives
 * about 768px wide, which works out to roughly nine pixels per character of
 * contract body text. At that size the model stops reading and starts
 * pattern-completing: a real dohoda o provedení práce came back with an invented
 * clause, a fabricated payment date, and its 300-hour limit silently missing.
 *
 * Slicing fixes the cause rather than the symptom. A slice no taller than 768px
 * is already within the limit, so its full width survives untouched — roughly
 * double the horizontal resolution, and enough to read.
 *
 * The overlap exists so a line of text falling on a cut is whole in one of the
 * two slices. The transcription prompt is told the slices overlap, so repeated
 * text is written once.
 */

/** Wide enough to read body text, narrow enough to keep the token bill sane. */
const MAX_WIDTH = 1400
/** Working slice height, comfortably under the threshold below. */
const SLICE_HEIGHT = 700
/**
 * The API's actual shortest-side threshold. A slice up to this tall still
 * escapes downscaling, so the slack absorbs whatever is left at the bottom of
 * a page rather than spending a whole extra image on a sliver.
 */
const MAX_SLICE_HEIGHT = 768
/** Roughly two lines of text, so nothing is lost on a cut. */
const OVERLAP = 70
/** A page needing more than this is a photo of something else. */
const MAX_SLICES_PER_PAGE = 6

export interface SlicePlan {
  /** Top edge of the slice, in scaled pixels. */
  top: number
  height: number
}

/**
 * Works out where to cut a page of the given scaled height.
 *
 * Pure so it can be tested without a canvas — the geometry is the only part
 * with any real logic in it, and getting the overlap or the final slice wrong
 * silently loses lines of a contract.
 */
export function planSlices(height: number): SlicePlan[] {
  if (height <= MAX_SLICE_HEIGHT) return [{ top: 0, height }]

  const step = SLICE_HEIGHT - OVERLAP
  const plans: SlicePlan[] = []

  for (let top = 0; top < height && plans.length < MAX_SLICES_PER_PAGE; top += step) {
    const remaining = height - top

    // Whatever is left fits in one slice — take it and stop.
    if (remaining <= MAX_SLICE_HEIGHT) {
      plans.push({ top, height: remaining })
      break
    }

    // A page rarely divides evenly. If the next slice would be a thin offcut,
    // stretch this one into the spare headroom instead: an extra image costs a
    // full row of tiles to carry a few dozen pixels.
    const leftoverAfterThis = remaining - SLICE_HEIGHT
    const sliceHeight =
      leftoverAfterThis <= MAX_SLICE_HEIGHT - SLICE_HEIGHT
        ? Math.min(remaining, MAX_SLICE_HEIGHT)
        : SLICE_HEIGHT

    plans.push({ top, height: sliceHeight })
    if (top + sliceHeight >= height) break
  }

  return plans
}

export interface PageSlice {
  dataUrl: string
  /** 1-based index of the source page. */
  page: number
  /** 1-based index of the slice within that page. */
  slice: number
}

/**
 * Slices one image. Short images come back as a single slice, unchanged apart
 * from any downscaling needed to fit MAX_WIDTH.
 */
export async function slicePageImage(file: File, pageNumber: number): Promise<PageSlice[]> {
  const bitmap = await loadBitmap(file)

  try {
    const scale = Math.min(1, MAX_WIDTH / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    return planSlices(height).map((plan, index) => ({
      dataUrl: drawToDataUrl(bitmap, plan.top, plan.height, width, height),
      page: pageNumber,
      slice: index + 1,
    }))
  } finally {
    bitmap.close?.()
  }
}

/** Slices every page, keeping page and slice order. */
export async function slicePages(files: File[]): Promise<PageSlice[]> {
  const perPage = await Promise.all(files.map((file, index) => slicePageImage(file, index + 1)))
  return perPage.flat()
}

/** Converts slices back into files so they can ride in the existing FormData. */
export function slicesToFiles(slices: PageSlice[]): File[] {
  return slices.map((slice) => {
    const binary = atob(slice.dataUrl.slice(slice.dataUrl.indexOf(',') + 1))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
    return new File([bytes], `page${slice.page}-slice${slice.slice}.jpg`, { type: 'image/jpeg' })
  })
}

// ─── Internals ────────────────────────────────────────────────────────────────

type Bitmap = ImageBitmap | HTMLImageElement

async function loadBitmap(file: File): Promise<Bitmap & { close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }

  // Safari below 17 has no createImageBitmap for File inputs.
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Image could not be decoded'))
      image.src = url
    })
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function drawToDataUrl(
  bitmap: Bitmap,
  top: number,
  sliceHeight: number,
  width: number,
  fullHeight: number,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = sliceHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  // White ground: a JPEG of a transparent canvas renders black, which would
  // hide the text rather than show it.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, sliceHeight)

  const sourceWidth = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
  const sourceHeight = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
  const sourceTop = (top / fullHeight) * sourceHeight
  const sourceSliceHeight = (sliceHeight / fullHeight) * sourceHeight

  ctx.drawImage(
    bitmap as CanvasImageSource,
    0,
    sourceTop,
    sourceWidth,
    sourceSliceHeight,
    0,
    0,
    width,
    sliceHeight,
  )

  // 0.92 — text artefacts at lower quality are exactly what OCR misreads.
  return canvas.toDataURL('image/jpeg', 0.92)
}
