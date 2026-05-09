/**
 * Czech (cs) UI messages — default locale.
 * This file defines the canonical Messages interface; all other locales
 * MUST satisfy it (TypeScript will fail at build time otherwise).
 */

export const cs: Messages = {
  meta: {
    locale: 'cs',
    siteName: 'PrávníkAI',
    htmlLang: 'cs',
    legalLabel: 'české právo',
  },

  nav: {
    generator: 'Generátor smluv',
    review: 'Kontrola smluv',
    pricing: 'Ceník',
    faq: 'Časté otázky',
    login: 'Přihlásit se',
    dashboard: 'Můj účet',
    languageMenuLabel: 'Změnit jazyk a jurisdikci',
  },

  locale: {
    cs: 'Čeština',
    de: 'Deutsch',
    en: 'English',
  },

  jurisdiction: {
    short: {
      CZ: 'CZ',
      DE: 'DE',
      UK: 'UK',
    },
    full: {
      CZ: 'Česká republika',
      DE: 'Deutschland',
      UK: 'United Kingdom',
    },
    legal: {
      CZ: 'české právo (NOZ, ZP, ZOK)',
      DE: 'německé právo (BGB, HGB, GewO)',
      UK: 'anglické právo (common law, Sale of Goods Act, Employment Rights Act)',
    },
  },

  category: {
    civil: 'Občanské právo',
    commercial: 'Obchodní právo',
    employment: 'Pracovní právo',
    realestate: 'Nemovitosti',
  },

  home: {
    kicker: 'AI asistent pro právníky',
    heroSubtitle:
      'Generujte právní smlouvy za minuty, ne hodiny. Inteligentní nástroj, který rozumí českému, německému i anglickému právu — v jazyce vašeho klienta.',
    ctaGenerate: 'Generovat smlouvu',
    ctaReview: 'Zkontrolovat smlouvu',
    statContractTypes: 'Typů smluv',
    statTime: 'Průměrný čas',
    statJurisdictions: 'Jurisdikce',
    sectionFeaturesTitle: 'Proč PrávníkAI',
    sectionFeaturesSubtitle: 'Nástroj navržený právníky pro právníky',
    sectionHowTitle: 'Jak to funguje',
    sectionHowSubtitle: 'Smlouva za 3 jednoduché kroky',
    sectionTypesTitle: 'Podporované typy smluv',
    sectionTypesSubtitle: 'CZ · DE · UK — neustále rozšiřujeme knihovnu',
    sectionFaqTitle: 'Časté otázky',
    sectionFaqSubtitle: 'Vše, co potřebujete vědět',
    sectionPricingTitle: 'Ceník',
    sectionPricingSubtitle: 'Začněte zdarma, upgradujte až budete připraveni',
    ctaCardTitle: 'Začněte generovat smlouvy ještě dnes',
    ctaCardBody:
      'Připravte právně korektní smlouvy za minuty místo hodin. Tři jurisdikce, profesionální AI návrh, export do DOCX a PDF.',
    ctaCardPrimary: 'Vyzkoušet zdarma',
    ctaCardSecondary: 'Mám otázky',
    feature: {
      automated: {
        title: 'Automatizované smlouvy',
        body: 'Vyberte typ smlouvy, vyplňte údaje stran a nechte AI vygenerovat kompletní právní dokument v souladu s místní legislativou.',
      },
      time: {
        title: 'Úspora času',
        body: 'Smlouva, která by vám zabrala hodiny manuální práce, je připravena za několik minut. Více času na to, co skutečně vyžaduje vaši expertízu.',
      },
      legal: {
        title: 'Právní jistota',
        body: 'Každá vygenerovaná smlouva vychází z aktuálních právních předpisů — NOZ, ZP, ZOK pro CZ; BGB, HGB pro DE; common law a statutory law pro UK. Systém cituje konkrétní ustanovení.',
      },
      security: {
        title: 'Bezpečnost dat',
        body: 'Všechny údaje jsou zpracovány server-side v souladu s GDPR. API klíč nikdy neopustí server. Citlivá pole jsou označena a chráněna.',
      },
      review: {
        title: 'AI kontrola smluv',
        body: 'Vložte existující smlouvu a AI identifikuje rizikové klauzule, chybějící ustanovení a vyjednávací body dle zvolené jurisdikce.',
      },
      export: {
        title: 'Export do DOCX a PDF',
        body: 'Exportujte smlouvy do DOCX i PDF s profesionálním formátováním — záhlaví, zápatí, právní citace a disclaimer automaticky v jazyce smlouvy.',
      },
    },
    step: {
      one: { title: 'Vyberte typ smlouvy', body: 'Zvolte z nabídky pro CZ, DE nebo UK — kupní, pracovní, nájemní, NDA, smlouva o dílo a další.' },
      two: { title: 'Vyplňte údaje', body: 'Zadejte údaje smluvních stran, předmět smlouvy a specifické podmínky. Formulář se dynamicky přizpůsobí.' },
      three: { title: 'Stáhněte smlouvu', body: 'AI vygeneruje kompletní smlouvu s citacemi zákonů. Zkontrolujte, upravte a exportujte do DOCX nebo PDF.' },
    },
    footer: {
      productHeading: 'Produkt',
      legalHeading: 'Právní',
      contactHeading: 'Kontakt',
      links: {
        features: 'Funkce',
        generator: 'Generátor',
        review: 'Kontrola smluv',
        faq: 'FAQ',
        terms: 'Obchodní podmínky',
        privacy: 'Ochrana osobních údajů',
        gdpr: 'GDPR',
      },
      tagline: 'Inteligentní generátor smluv pro CZ, DE a UK právo. AI technologie, profesionální výstup.',
      rights: 'Všechna práva vyhrazena.',
      support: 'Podpora',
    },
    trust: {
      serverside: 'Server-side zpracování',
      apikey: 'API klíč nikdy na klientu',
      jurisdiction: 'Jurisdikce dle vaší volby',
      validation: '3-vrstvová validace',
    },
  },

  generator: {
    title: 'Generátor smluv',
    subtitle: 'AI návrh dle zvolené jurisdikce',
    selectHeading: 'Vyberte typ smlouvy',
    legalBasisInline: 'Právní základ',
    jurisdictionNotice:
      'Systém generuje smlouvy dle {jurisdiction}. Vygenerované dokumenty slouží jako návrh — vždy nechte finální verzi zkontrolovat advokátem.',
    breadcrumbType: 'Typ smlouvy',
    breadcrumbGenerating: 'Generování…',
    breadcrumbResult: 'Výsledek',
    generatingTitle: 'Generuji {type}',
    generatingSubtitle: 'AI analyzuje právní kontext a připravuje text smlouvy.',
    generatingDurationHint:
      'U výkonných modelů (např. GPT‑5) může celý proces trvat 1–4 minuty — probíhají dva kroky AI (návrh + kontrola kvality). Nechte stránku otevřenou.',
    steps: {
      validate: 'Validuji zadaná data…',
      context: 'Připravuji právní kontext…',
      draft: 'Generuji text smlouvy…',
      review: 'Kontroluji právní ustanovení…',
      finalize: 'Dokončuji dokument…',
    },
    error: {
      heading: 'Chyba při generování',
      retry: 'Zkusit znovu',
      changeType: 'Změnit typ smlouvy',
      timeoutOrNetwork:
        'Spojení se serverem přerušeno nebo vypršel časový limit funkce na hostingu (dlouhé generování u výkonných modelů to často způsobí). Vyčkejte chvíli a zkuste to znovu; pokud problém přetrvává, vývoj potřebuje delší povolený běh serverové funkce (např. plán na Vercelu s vyšším limitem).',
    },
  },

  result: {
    trustBanner: 'AI návrh · Vyžaduje kontrolu advokátem · Negeneruje právní poradenství',
    copy: 'Kopírovat',
    copied: 'Zkopírováno',
    copyToClipboard: 'Kopírovat do schránky',
    docx: 'DOCX',
    pdf: 'PDF',
    downloadDocx: 'Stáhnout DOCX',
    downloadPdf: 'Stáhnout PDF',
    exporting: 'Exportuji…',
    exportShort: 'Export…',
    edit: 'Upravit',
    editAndRegenerate: 'Upravit a vygenerovat znovu',
    newContract: 'Nová smlouva',
    contractTextHeading: 'Text smlouvy',
    chars: 'znaků',
    generatedAt: 'Vygenerováno',
    schema: 'Schéma',
    mode: 'Mód',
    missingOptionalToggle: '{count} volitelných polí nebylo vyplněno (kliknutím zobrazíte)',
    legalDisclaimerHeading: 'Právní upozornění',
    legalDisclaimerBody:
      'Tento dokument byl vygenerován umělou inteligencí a slouží výhradně jako pracovní návrh. Před podpisem nebo právním použitím jej nechte zkontrolovat advokátem. Provozovatel nenese odpovědnost za obsah vygenerovaného textu ani za jeho právní účinky.',
    modeBadge: {
      complete: { label: 'Kompletní smlouva', description: 'Všechna potřebná pole byla vyplněna. Smlouva je vygenerována bez mezer.' },
      draft: { label: 'Pracovní návrh', description: 'Povinná pole jsou vyplněna. Volitelné údaje chybí — v textu hledejte [DOPLNIT].' },
      reviewNeeded: { label: 'Vyžaduje kontrolu', description: 'Povinná pole chybí. V textu hledejte ⚠️ ZKONTROLOVAT a doplňte chybějící údaje.' },
    },
    exportFailed: 'Export se nezdařil. Zkuste to znovu.',
    exportAuthRequired: 'Pro stažení dokumentu se musíte přihlásit. Po přihlášení můžete export zopakovat.',
    exportOnboardingRequired: 'Před prvním exportem dokončete krátkou registraci (přijetí podmínek).',
    exportLimitReached: 'Vyčerpali jste měsíční limit exportů ve verzi Zdarma (5 / měsíc). Pro neomezené stahování přejděte na plán Pro.',
    exportRateLimited: 'Příliš mnoho pokusů — zkuste to prosím za chvíli znovu.',
    exportServerError: 'Soubor se nepodařilo vygenerovat na serveru. Zkuste znovu, nebo nás prosím kontaktujte.',
    exportNetworkOrTimeout:
      'Stažení se nepodařilo dokončit (síť nebo časový limit serveru). Zkuste to znovu; u velké smlouvy na bezplatném hostingu zkraťte text nebo zkuste PDF/DOCX opakovat.',
  },

  langSwitch: {
    label: 'Jazyk a jurisdikce',
    legalBasisCs: 'Generuje dle českého práva',
    legalBasisDe: 'Generiert nach deutschem Recht',
    legalBasisEn: 'Generates under English law',
  },
}

// ─── Type definition ─────────────────────────────────────────────────────────

/** Canonical message bag shape; every locale must satisfy this interface. */
export interface Messages {
  meta: { locale: string; siteName: string; htmlLang: string; legalLabel: string }
  nav: { generator: string; review: string; pricing: string; faq: string; login: string; dashboard: string; languageMenuLabel: string }
  locale: { cs: string; de: string; en: string }
  jurisdiction: {
    short: { CZ: string; DE: string; UK: string }
    full:  { CZ: string; DE: string; UK: string }
    legal: { CZ: string; DE: string; UK: string }
  }
  category: { civil: string; commercial: string; employment: string; realestate: string }
  home: {
    kicker: string
    heroSubtitle: string
    ctaGenerate: string
    ctaReview: string
    statContractTypes: string
    statTime: string
    statJurisdictions: string
    sectionFeaturesTitle: string
    sectionFeaturesSubtitle: string
    sectionHowTitle: string
    sectionHowSubtitle: string
    sectionTypesTitle: string
    sectionTypesSubtitle: string
    sectionFaqTitle: string
    sectionFaqSubtitle: string
    sectionPricingTitle: string
    sectionPricingSubtitle: string
    ctaCardTitle: string
    ctaCardBody: string
    ctaCardPrimary: string
    ctaCardSecondary: string
    feature: {
      automated: { title: string; body: string }
      time:      { title: string; body: string }
      legal:     { title: string; body: string }
      security:  { title: string; body: string }
      review:    { title: string; body: string }
      export:    { title: string; body: string }
    }
    step: {
      one:   { title: string; body: string }
      two:   { title: string; body: string }
      three: { title: string; body: string }
    }
    footer: {
      productHeading: string
      legalHeading: string
      contactHeading: string
      links: {
        features: string
        generator: string
        review: string
        faq: string
        terms: string
        privacy: string
        gdpr: string
      }
      tagline: string
      rights: string
      support: string
    }
    trust: {
      serverside: string
      apikey: string
      jurisdiction: string
      validation: string
    }
  }
  generator: {
    title: string
    subtitle: string
    selectHeading: string
    legalBasisInline: string
    jurisdictionNotice: string
    breadcrumbType: string
    breadcrumbGenerating: string
    breadcrumbResult: string
    generatingTitle: string
    generatingSubtitle: string
    generatingDurationHint: string
    steps: { validate: string; context: string; draft: string; review: string; finalize: string }
    error: { heading: string; retry: string; changeType: string; timeoutOrNetwork: string }
  }
  result: {
    trustBanner: string
    copy: string
    copied: string
    copyToClipboard: string
    docx: string
    pdf: string
    downloadDocx: string
    downloadPdf: string
    exporting: string
    exportShort: string
    edit: string
    editAndRegenerate: string
    newContract: string
    contractTextHeading: string
    chars: string
    generatedAt: string
    schema: string
    mode: string
    missingOptionalToggle: string
    legalDisclaimerHeading: string
    legalDisclaimerBody: string
    modeBadge: {
      complete:     { label: string; description: string }
      draft:        { label: string; description: string }
      reviewNeeded: { label: string; description: string }
    }
    exportFailed: string
    exportAuthRequired: string
    exportOnboardingRequired: string
    exportLimitReached: string
    exportRateLimited: string
    exportServerError: string
    exportNetworkOrTimeout: string
  }
  langSwitch: {
    label: string
    legalBasisCs: string
    legalBasisDe: string
    legalBasisEn: string
  }
}
