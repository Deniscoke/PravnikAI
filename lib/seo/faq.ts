/**
 * FAQ content — single source of truth for UI (HomePage) and structured data (JSON-LD FAQPage).
 * Localized per UI locale.
 */

import type { Locale } from '@/lib/contracts/types'

export interface FaqItem {
  question: string
  answer: string
}

const HOME_FAQ_CS: ReadonlyArray<FaqItem> = [
  {
    question: 'Jsou vygenerované smlouvy právně závazné?',
    answer:
      'PrávníkAI generuje smlouvy podle aktuální legislativy zvolené jurisdikce — pro CZ dle NOZ, ZP, ZOK; pro DE dle BGB, HGB, GewO; pro UK dle Sale of Goods Act, Employment Rights Act a anglického common law. Vygenerovaný dokument slouží jako profesionální základ — před podpisem ho doporučujeme nechat zkontrolovat advokátem či solicitorem.',
  },
  {
    question: 'Jak jsou chráněny moje údaje a údaje klientů?',
    answer:
      'Bezpečnost je naše priorita. Všechna data jsou zpracována na serveru — API klíč nikdy neopustí server. Zpracování probíhá v souladu s GDPR (data residency v EU). Vaše dokumenty nejsou nikdy použity na trénování AI modelů.',
  },
  {
    question: 'Mohu vygenerované smlouvy dále upravovat?',
    answer:
      'Samozřejmě. Každou vygenerovanou smlouvu můžete exportovat do DOCX nebo PDF a upravit v libovolném textovém editoru. Smlouvy jsou vaše — máte nad nimi plnou kontrolu.',
  },
  {
    question: 'Pro koho je PrávníkAI určen?',
    answer:
      'PrávníkAI je primárně navržen pro advokáty, advokátní kanceláře, firemní právníky a notáře — v ČR, Německu i UK. Využít ho však může kdokoli, kdo potřebuje připravit právní dokumenty napříč jurisdikcemi.',
  },
  {
    question: 'Jaké typy smluv a jurisdikce PrávníkAI podporuje?',
    answer:
      'Aktuálně podporujeme 3 jurisdikce — Českou republiku, Německo a Spojené království. Pro každou nabízíme klíčové typy smluv (NDA, kupní/pracovní/nájemní smlouva, smlouva o dílo). Knihovnu neustále rozšiřujeme — chybí vám konkrétní typ? Napište nám.',
  },
]

const HOME_FAQ_DE: ReadonlyArray<FaqItem> = [
  {
    question: 'Sind die generierten Verträge rechtsverbindlich?',
    answer:
      'PrávníkAI erstellt Verträge nach der aktuellen Gesetzgebung der gewählten Jurisdiktion — für DE nach BGB, HGB, GewO; für CZ nach NOZ, ZP, ZOK; für UK nach Sale of Goods Act, Employment Rights Act und englischem Common Law. Das generierte Dokument ist eine professionelle Vorlage — vor Unterzeichnung sollte es ein Anwalt oder Solicitor prüfen.',
  },
  {
    question: 'Wie werden meine Daten und die meiner Mandanten geschützt?',
    answer:
      'Sicherheit hat Priorität. Alle Daten werden serverseitig verarbeitet — der API-Schlüssel verlässt nie den Server. Verarbeitung DSGVO-konform (Data Residency in der EU). Ihre Dokumente werden niemals zum Trainieren von KI-Modellen verwendet.',
  },
  {
    question: 'Kann ich die generierten Verträge weiter bearbeiten?',
    answer:
      'Selbstverständlich. Jeder generierte Vertrag lässt sich als DOCX oder PDF exportieren und in einem beliebigen Texteditor bearbeiten. Die Verträge gehören Ihnen — Sie haben die volle Kontrolle.',
  },
  {
    question: 'Für wen ist PrávníkAI gedacht?',
    answer:
      'PrávníkAI richtet sich primär an Anwälte, Kanzleien, Unternehmensjuristen und Notare — in Deutschland, Tschechien und im UK. Es kann aber jeder nutzen, der grenzübergreifende Vertragsdokumente erstellen muss.',
  },
  {
    question: 'Welche Vertragsarten und Rechtsräume unterstützt PrávníkAI?',
    answer:
      'Wir unterstützen derzeit 3 Rechtsräume — Deutschland, Tschechien und das Vereinigte Königreich. Für jeden bieten wir die wichtigsten Vertragsarten (NDA, Kaufvertrag, Arbeitsvertrag, Mietvertrag, Werkvertrag). Die Bibliothek wächst laufend — fehlt Ihnen ein Typ? Schreiben Sie uns.',
  },
]

const HOME_FAQ_EN: ReadonlyArray<FaqItem> = [
  {
    question: 'Are the generated contracts legally binding?',
    answer:
      'PrávníkAI drafts contracts under the current law of the chosen jurisdiction — for UK under common law and statutes such as the Sale of Goods Act and Employment Rights Act; for DE under BGB, HGB, GewO; for CZ under NOZ, ZP, ZOK. The generated document is a professional starting point — please have a qualified solicitor or advokát review the final version before signing.',
  },
  {
    question: 'How are my data and my clients’ data protected?',
    answer:
      'Security is our priority. All data is processed server-side — the API key never leaves the server. Processing is GDPR-compliant (EU data residency). Your documents are never used to train AI models.',
  },
  {
    question: 'Can I edit the generated contracts further?',
    answer:
      'Of course. Every generated contract can be exported as DOCX or PDF and edited in any word processor. The contracts are yours — you keep full control.',
  },
  {
    question: 'Who is PrávníkAI for?',
    answer:
      'PrávníkAI is primarily designed for solicitors, barristers, law firms, in-house counsel and notaries — across the UK, Germany and the Czech Republic. Anyone preparing cross-border legal documents can use it.',
  },
  {
    question: 'Which contract types and jurisdictions does PrávníkAI support?',
    answer:
      'We currently support 3 jurisdictions — the UK, Germany and the Czech Republic. For each we offer the key contract types (NDA, sale, employment, tenancy, services). The library keeps growing — missing a type? Let us know.',
  },
]

export function getHomeFaqItems(locale: Locale): ReadonlyArray<FaqItem> {
  if (locale === 'de') return HOME_FAQ_DE
  if (locale === 'en') return HOME_FAQ_EN
  return HOME_FAQ_CS
}

/** @deprecated Use getHomeFaqItems(locale) instead. Kept for backward compat. */
export const HOME_FAQ_ITEMS = HOME_FAQ_CS
