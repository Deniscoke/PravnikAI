/**
 * Central SEO constants for Právo365 — Czech legal SaaS
 * for contract draft preparation and review under Czech law.
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://pravo365.cz'
}

export const SITE_NAME = 'Právo365'

/** Provozovatel / kontakt uvedený ve footeru a právních stránkách */
export const SITE_PUBLISHER = 'IndiWeb'

/**
 * Primární klíčová slova (cs) — kombinace uživatelských dotazů a odborných termínů
 */
export const SEO_KEYWORDS = [
  'Právo365',
  'AI právník',
  'generátor smluv',
  'smlouva online',
  'právní dokumenty online',
  'vytvoření smlouvy AI',
  'kupní smlouva online',
  'pracovní smlouva vzor',
  'právní AI',
  'OSVČ smlouvy',
  'malé firmy smlouvy',
  'NOZ',
  'ZP',
  'ZOK',
  'kontrola smluv AI',
  'export DOCX PDF',
  'GDPR právní dokumenty',
] as const

export const SEO_DESCRIPTION_DEFAULT =
  'Právo365 — návrhy smluv podle českého práva: kupní smlouva, pracovní smlouva, nájem, NDA. Rychlá příprava strukturovaného návrhu. Nenahrazuje právní poradenství. Export DOCX a PDF, bezpečné platby přes Stripe.'

export const SEO_DESCRIPTION_GENERATOR =
  'Vyberte typ smlouvy, vyplňte údaje a získejte návrh dokumentu podle českého práva. Kupní, pracovní, nájemní, NDA, smlouva o dílo — pracovní verze během minut.'

export const SEO_DESCRIPTION_REVIEW =
  'Vložte text smlouvy — AI zvýrazní rizika a chybějící pasáže podle českého práva. Orientační kontrola, nenahrazuje advokáta.'

export const SEO_DESCRIPTION_LOGIN =
  'Přihlášení k Právo365 — bezpečný účet pro návrhy smluv a kontrolu dokumentů podle českého práva. Platby přes Stripe, zpracování dat v souladu s GDPR.'
