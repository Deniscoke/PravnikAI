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
    question: 'Nahrazuje Právo365 advokáta nebo právní poradenství?',
    answer:
      'Ne. Právo365 je nástroj na rychlou přípravu návrhů smluv a orientační kontrolu textu podle českého práva. Nenahrazuje individuální právní poradenství, posouzení vašeho konkrétního sporu ani zastupování před soudem. Před závaznými kroky a podpisem dokumentu doporučujeme konzultaci s advokátem.',
  },
  {
    question: 'Jsou vygenerované smlouvy „hotové k podpisu“?',
    answer:
      'Ne. Právo365 vytváří pracovní verzi dokumentu s odkazy na relevantní české právní předpisy. Dokument slouží jako strukturovaný návrh — u složitých transakcí, vysokých částek nebo regulovaných odvětví jej vždy nechte před podpisem zkontrolovat advokátem.',
  },
  {
    question: 'Jsou moje údaje v bezpečí? Jak je to s GDPR?',
    answer:
      'Zpracování probíhá na serveru v souladu s GDPR. API klíč k umělé inteligenci na serveru zůstává — neukládá se do prohlížeče. Údaje nepoužíváme k trénování veřejných modelů. Platební údaje zpracovává Stripe; podrobnosti jsou v Zásadách ochrany osobních údajů a GDPR / cookies stránce.',
  },
  {
    question: 'Mohu dokument dál upravovat a exportovat?',
    answer:
      'Ano. Každý výstup lze stáhnout jako DOCX nebo PDF a upravit v Wordu či jiném editoru. Dokumenty jsou vaše; odpovědnost za obsah po úpravách a za právní použití nese uživatel.',
  },
  {
    question: 'Pro koho je Právo365?',
    answer:
      'Pro živnostníky, OSVČ, malé firmy a kohokoli, kdo potřebuje návrh smlouvy podle českého práva rychleji než z nekonečných šablon. Vyhovuje i advokátům jako startovní návrh, pokud si obsah sami dohlížejí.',
  },
  {
    question: 'Které typy smluv podporujete?',
    answer:
      'Podporujeme kupní smlouvu, pracovní smlouvu, nájemní smlouvu, NDA / smlouvu o mlčenlivosti a smlouvu o dílo — podle českého práva. Knihovnu rozšiřujeme; chybí vám konkrétní typ — napište nám přes kontakt v patičce.',
  },
]

const HOME_FAQ_DE: ReadonlyArray<FaqItem> = [
  {
    question: 'Ersetzt Právo365 eine Anwaltsberatung?',
    answer:
      'Nein. Právo365 hilft beim schnellen Aufsetzen von Vertragsentwürfen und bei einer orientierenden Prüfung nach gewähltem Recht. Es ist kein Ersatz für individuelle Rechtsberatung. Vor verbindlichen Schritten sollte ein Anwalt eingeschaltet werden.',
  },
  {
    question: 'Sind die generierten Verträge „unterschriftsreif“?',
    answer:
      'Právo365 erstellt gut strukturierte Entwürfe mit Verweisen auf die gewählte Jurisdiktion (CZ, DE, UK). Bei hohen Beträgen, regulierten Bereichen oder Grenzfällen soll der Entwurf immer von einem Anwalt geprüft werden.',
  },
  {
    question: 'Wie werden meine Daten geschützt?',
    answer:
      'Verarbeitung serverseitig, DSGVO-konform. Der API-Schlüssel bleibt auf dem Server; Ihre Dokumente werden nicht zum Training öffentlicher Modelle genutzt. Zahlungen laufen über Stripe — Details in Datenschutz und Cookie-Hinweisen.',
  },
  {
    question: 'Kann ich Verträge weiter bearbeiten?',
    answer:
      'Ja — Export als DOCX oder PDF, Bearbeitung im Editor Ihrer Wahl. Sie behalten die Hoheit über den Text; die Verantwortung für die finale Fassung liegt bei Ihnen.',
  },
  {
    question: 'Für wen ist Právo365 gedacht?',
    answer:
      'Für Selbstständige, KMU und alle, die grenzübergreifend arbeiten (CZ, DE, UK). Auch Kanzleien können es als Ausgangspunkt nutzen, wenn die fachliche Kontrolle erfolgt.',
  },
  {
    question: 'Welche Vertragstypen werden unterstützt?',
    answer:
      'u. a. NDA, Kauf, Arbeit, Miete, Werkvertrag — siehe Generator pro Jurisdiktion. Die Bibliothek wächst; fehlt etwas, kontaktieren Sie uns.',
  },
]

const HOME_FAQ_EN: ReadonlyArray<FaqItem> = [
  {
    question: 'Does Právo365 replace a solicitor or lawyer?',
    answer:
      'No. Právo365 helps you prepare draft contracts and get a structured review against the law you select. It does not provide regulated legal advice. For high-stakes deals, please instruct a qualified lawyer before you sign.',
  },
  {
    question: 'Are generated contracts ready to sign?',
    answer:
      'You get a professionally structured draft with citations to the chosen jurisdiction (CZ / DE / UK). For complex deals or regulated sectors you should still have a solicitor or Rechtsanwalt review the final version.',
  },
  {
    question: 'How are my data protected?',
    answer:
      'Processing is server-side and GDPR-aware. The AI API key stays on the server. We do not use your documents to train public models. Card payments are handled by Stripe — see Privacy and cookie information.',
  },
  {
    question: 'Can I edit and export contracts?',
    answer:
      'Yes. Export to DOCX or PDF and edit in Word or any editor. You remain responsible for the final text and how you use it legally.',
  },
  {
    question: 'Who is Právo365 for?',
    answer:
      'Freelancers, small businesses and teams working across CZ, DE and UK who need contract drafts quickly without starting from a blank page. Law firms may use it as a starting point where they retain professional oversight.',
  },
  {
    question: 'Which contract types are supported?',
    answer:
      'NDA, sale, employment, tenancy, services/work and more — see the generator for each jurisdiction. The library keeps growing; tell us if you need a missing type.',
  },
]

export function getHomeFaqItems(_locale: Locale): ReadonlyArray<FaqItem> {
  return HOME_FAQ_CS
}
