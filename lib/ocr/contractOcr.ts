/**
 * Transcribes photographed or scanned contract pages into plain text.
 *
 * THE RISK THIS FILE IS BUILT AROUND
 *
 * The danger is not that the model fails to read a blurry word — that is
 * visible and recoverable. The danger is that it helps: silently fixing a
 * typo, completing a truncated sentence, or tidying a clause into the shape it
 * has seen a thousand times. The review then analyses a document that does not
 * exist, and the user gets an opinion on a contract they never signed.
 *
 * So the prompt separates transcription from comprehension as hard as it can,
 * and unreadable spots are marked rather than guessed. A visible gap is a
 * far better outcome than an invisible invention.
 */

import { transcribeImages } from '@/lib/llm/openaiClient'

/** Marker left in place of text that could not be read. */
export const UNREADABLE_MARKER = '[NEČITELNÉ]'

const SYSTEM_PROMPT = `Jsi nástroj pro doslovný přepis naskenovaných a vyfotografovaných dokumentů.

NEJSI asistent, neradíš, nevykládáš a nehodnotíš. Tvým jediným úkolem je přepsat text, který na obrázcích skutečně je.

## Závazná pravidla

1. Přepisuj DOSLOVNĚ. Zachovej původní formulace, pořadí i číslování článků a odstavců.
2. NIKDY neopravuj překlepy, gramatiku, interpunkci ani chybná čísla paragrafů. Přepiš je tak, jak jsou.
3. NIKDY nedoplňuj text, který na obrázku není — ani když je věta zjevně nedokončená a ty tušíš, jak pokračuje.
4. NIKDY nevynechávej části textu, které se ti zdají nepodstatné. Přepiš i hlavičky, patičky, čísla stran a ručně psané poznámky.
5. Text, který nelze spolehlivě přečíst, nahraď značkou ${UNREADABLE_MARKER}. Raději označ, než hádej.
6. Zachovej strukturu: nadpisy na samostatném řádku, odstavce oddělené prázdným řádkem, seznamy jako seznamy.
7. Tabulku přepiš po řádcích, hodnoty odděl znakem |.
8. Podpisové bloky a razítka přepiš včetně popisků. Je-li podpis nečitelný, uveď ${UNREADABLE_MARKER}.
9. Nepřidávej vlastní komentáře, úvod, shrnutí ani poznámky o kvalitě obrázku.
10. Obrázky jsou vodorovné pásy jedné stránky a SOUSEDNÍ PÁSY SE PŘEKRÝVAJÍ. Text, který se objeví na konci jednoho pásu i na začátku dalšího, přepiš POUZE JEDNOU. Nikdy kvůli překryvu nevynechávej řádek — raději ověř, zda věta navazuje.
11. Nepřepisuj pásy odděleně. Výsledkem je jeden souvislý text dokumentu.

## Výstup

Vrať POUZE přepsaný text dokumentu. Žádný markdown, žádné uvozovky kolem celku, žádný doprovodný text.

Není-li na obrázcích čitelný dokument, vrať přesně: ${UNREADABLE_MARKER}`

function buildUserPrompt(sliceCount: number, pageCount: number): string {
  const pages =
    pageCount === 1 ? 'jedné stránky' : `${pageCount} stránek dokumentu v pořadí za sebou`

  return (
    `Následuje ${sliceCount} ${sliceCount === 1 ? 'obrázek' : 'obrázků'} — jde o vodorovné ` +
    `pásy ${pages}, seřazené shora dolů. Sousední pásy se překrývají, aby žádný řádek ` +
    `nebyl rozříznut; překrývající se text uveď jen jednou.

` +
    `Přepiš vše jako jeden souvislý text dokumentu. Dodrž všechna pravidla doslovného přepisu.`
  )
}

export interface OcrResult {
  text: string
  tokensUsed: number
  model: string
  /** True when the model reported it could not read a document at all. */
  unreadable: boolean
}

/**
 * @param imageDataUrls Overlapping horizontal slices, in reading order.
 * @param pageCount How many original pages those slices came from.
 */
export async function transcribeContractImages(
  imageDataUrls: string[],
  pageCount = imageDataUrls.length,
): Promise<OcrResult> {
  const result = await transcribeImages({
    imageDataUrls,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(imageDataUrls.length, pageCount),
  })

  const text = result.text.trim()

  return {
    text,
    tokensUsed: result.tokensUsed,
    model: result.model,
    unreadable: text === UNREADABLE_MARKER || text.length === 0,
  }
}

/**
 * Share of the transcription that came back unreadable.
 *
 * Used to warn the user before they review a text full of holes. Counting
 * markers against total length is crude but it separates "one smudged word"
 * from "half the page was out of focus", which is the distinction that matters.
 */
export function unreadableRatio(text: string): number {
  if (!text) return 1
  const markers = (text.match(/\[NEČITELNÉ\]/g) ?? []).length
  if (markers === 0) return 0
  // Each marker stands in for roughly a word.
  const approximateWords = text.split(/\s+/).length
  return markers / Math.max(approximateWords, 1)
}
