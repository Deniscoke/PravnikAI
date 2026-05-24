/**
 * Central SEO constants for Právo365 — Czech-first legal SaaS
 * (multi-jurisdiction generator: CZ / DE / UK).
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
  'Právo365 — online generátor smluv a právní AI pro ČR: kupní smlouva, pracovní smlouva, nájem, NDA. Rychlý návrh dle NOZ, ZP a ZOK. Nejde o právní poradenství. Export DOCX a PDF, bezpečné platby přes Stripe.'

export const SEO_DESCRIPTION_GENERATOR =
  'Vyberte typ smlouvy, vyplňte údaje a získejte návrh dokumentu podle české legislativy. Kupní, pracovní, nájemní, NDA, smlouva o dílo — smlouva online během minut.'

export const SEO_DESCRIPTION_REVIEW =
  'Nahrajte text smlouvy — AI zvýrazní rizika a chybějící pasáže podle zvoleného práva (CZ / DE / UK). Nástroj neslouží jako náhrada advokáta.'

export const SEO_DESCRIPTION_LOGIN =
  'Přihlášení k Právo365 — bezpečný účet pro generátor smluv a kontrolu dokumentů. Platby přes Stripe, zpracování dat v souladu s GDPR.'
