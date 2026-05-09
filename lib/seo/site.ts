/**
 * Central SEO constants for PrávníkAI — aligned with product positioning:
 * AI nástroj pro české právo (generování a kontrola smluv, advokátní praxe).
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://pravnik-ai-five.vercel.app'
}

export const SITE_NAME = 'PrávníkAI'

/** Provozovatel / kontakt uvedený ve footeru a právních stránkách */
export const SITE_PUBLISHER = 'IndiWeb'

/** Primární klíčová slova (cs) — cílení na právní profese a typové dotazy */
export const SEO_KEYWORDS = [
  'AI právní asistent',
  'generátor smluv',
  'právní smlouvy online',
  'kontrola smlouvy AI',
  'české právo',
  'NOZ',
  'zákoník práce',
  'ZOK',
  'advokát smlouvy',
  'kupní smlouva',
  'pracovní smlouva',
  'nájemní smlouva',
  'NDA smlouva',
  'smlouva o dílo',
  'export DOCX smlouva',
  'GDPR právní dokumenty',
] as const

export const SEO_DESCRIPTION_DEFAULT =
  'AI generátor a kontrola právních smluv pro českou advokátní a firemní praxi. NOZ, ZP, ZOK — profesionální výstup, export DOCX, GDPR.'

export const SEO_DESCRIPTION_GENERATOR =
  'Vyberte typ smlouvy, vyplňte údaje a nechte AI vygenerovat dokument podle české legislativy. Kupní, pracovní, nájemní, NDA, smlouva o dílo.'

export const SEO_DESCRIPTION_REVIEW =
  'Nahrajte text smlouvy a získejte AI analýzu rizik, chybějících ustanovení a vyjednávacích bodů podle českého práva.'

export const SEO_DESCRIPTION_LOGIN =
  'Přihlášení do PrávníkAI — bezpečné přihlášení přes Google pro generování a kontrolu právních smluv.'
