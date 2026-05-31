/**
 * Czech (cs) UI messages — default locale.
 * This file defines the canonical Messages interface; all other locales
 * MUST satisfy it (TypeScript will fail at build time otherwise).
 */

export const cs: Messages = {
  meta: {
    locale: 'cs',
    siteName: 'Právo365',
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
    languageMenuLabel: 'Jazyk',
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
    kicker: 'Příprava návrhů smluv podle českého práva',
    heroSubtitle:
      'Návrh smlouvy během několika minut — kupní, pracovní, nájemní, NDA i smlouva o dílo. Podle relevantních českých právních předpisů. Pro OSVČ, živnostníky a malé firmy.',
    heroTrustNote:
      'Důležité: Právo365 negeneruje individuální právní poradenství. Platby bezpečně přes Stripe. Osobní údaje zpracováváme v souladu s GDPR.',
    ctaGenerate: 'Vytvořit návrh smlouvy',
    ctaReview: 'Zkontrolovat text',
    statContractTypes: 'Typů smluv',
    statTime: 'Orientační čas',
    statJurisdictions: 'České právo',
    sectionFeaturesTitle: 'Proč Právo365 místo „nějakého vzoru z internetu“',
    sectionFeaturesSubtitle: 'Méně stresu, jasná struktura dokumentu, právní citace kde dává smysl — vy si nechte finální verzi zkontrolovat advokátem.',
    sectionHowTitle: 'Jak to funguje',
    sectionHowSubtitle: 'Od výběru typu dokumentu po stažení DOCX nebo PDF',
    sectionTypesTitle: 'Podporované typy smluv',
    sectionTypesSubtitle: 'Podle relevantních českých právních předpisů',
    sectionFaqTitle: 'Časté otázky',
    sectionFaqSubtitle: 'Vše, co potřebujete vědět',
    sectionPricingTitle: 'Ceník',
    sectionPricingSubtitle: 'Začněte zdarma, upgradujte až budete připraveni',
    ctaCardTitle: 'Začněte připravovat návrhy smluv',
    ctaCardBody:
      'Začněte na tarifu Zdarma, vylaďte dokument a exportujte. Placený plán rozšíří limity pro intenzivnější práci s dokumenty podle českého práva.',
    ctaCardPrimary: 'Začít zdarma',
    ctaCardSecondary: 'Zjistit více ve FAQ',
    feature: {
      automated: {
        title: 'Chytrý návrh smlouvy',
        body: 'Vyberete typ (např. kupní smlouva, pracovní smlouva, NDA), doplníte údaje stran a Právo365 sestaví strukturovaný návrh s odkazem na příslušné české právní předpisy.',
      },
      time: {
        title: 'Hodiny u právníka vs. minuty u vás',
        body: 'Kompletní podklady pro advokáta nebo interní schválení často zvládnete za pár minut místo hodin s prázdnou šablonou. U sporů s vysokou hodnotou vždy počítejte s revizí advokátem.',
      },
      legal: {
        title: 'Opřeno o legislativu',
        body: 'Výstup je pracovní návrh s citacemi relevantních českých právních předpisů — nikoli individuální právní závěr. Před podpisem doporučujeme kontrolu advokátem.',
      },
      security: {
        title: 'Bezpečnost dat',
        body: 'Všechny údaje jsou zpracovány server-side v souladu s GDPR. API klíč nikdy neopustí server. Citlivá pole jsou označena a chráněna.',
      },
      review: {
        title: 'Kontrola smlouvy',
        body: 'Vložíte text a Právo365 vyznačí rizikové pasáže, mezery a témata k dojednání — podle českého práva. Slouží k orientaci, ne k závaznému právnímu posouzení.',
      },
      export: {
        title: 'Export do DOCX a PDF',
        body: 'Exportujte návrhy smluv do DOCX i PDF s profesionálním formátováním — záhlaví, zápatí, právní citace a disclaimer automaticky.',
      },
    },
    step: {
      one: { title: 'Vyberte typ dokumentu', body: 'Kupní smlouva, pracovní smlouva, nájem, NDA a další — podle českého práva.' },
      two: { title: 'Vyplňte konkrétní údaje', body: 'Strany, předmět, splatnost, výjimky. Formulář se přizpůsobí typu smlouvy a skryje nepotřebná pole.' },
      three: { title: 'Export a revize', body: 'Stáhnete DOCX nebo PDF, upravíte v editoru a před podpisem necháte projít advokátem — tak minimalizujete riziko.' },
    },
    footer: {
      productHeading: 'Produkt',
      legalHeading: 'Právní',
      contactHeading: 'Kontakt',
      links: {
        features: 'Funkce',
        generator: 'Generátor',
        review: 'Kontrola smluv',
        pricing: 'Ceník',
        faq: 'FAQ',
        terms: 'Obchodní podmínky',
        privacy: 'Ochrana osobních údajů',
        gdpr: 'GDPR / cookies',
      },
      tagline: 'Právo365 — návrhy smluv podle českého práva pro podnikatele, OSVČ a malé firmy. Pracovní verze dokumentu, bezpečné platby, vhodné ke kontrole advokátem.',
      rights: 'Všechna práva vyhrazena.',
      support: 'Podpora',
    },
    trust: {
      serverside: 'Server-side zpracování',
      apikey: 'API klíč nikdy na klientu',
      jurisdiction: 'České právo',
      validation: '3-vrstvová validace',
    },
  },

  generator: {
    title: 'Generátor smluv',
    subtitle: 'AI návrh smlouvy podle českého práva',
    selectHeading: 'Vyberte typ smlouvy',
    legalBasisInline: 'Právní základ',
    jurisdictionNotice:
      'Systém vytváří návrhy smluv podle českého práva. Vygenerované dokumenty slouží jako pracovní verze — vždy nechte finální verzi zkontrolovat advokátem.',
    breadcrumbType: 'Typ smlouvy',
    breadcrumbGenerating: 'Generování…',
    breadcrumbResult: 'Výsledek',
    generatingTitle: 'Generuji {type}',
    generatingSubtitle: 'AI analyzuje právní kontext a připravuje návrh textu smlouvy.',
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
    newContract: 'Nový návrh',
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
      complete: { label: 'Kompletní návrh', description: 'Všechna potřebná pole jsou vyplněna. Návrh je vygenerován bez mezer — doporučujeme kontrolu advokátem.' },
      draft: { label: 'Pracovní návrh', description: 'Povinná pole jsou vyplněna. Volitelné údaje chybí — v textu hledejte [DOPLNIT].' },
      reviewNeeded: { label: 'Vyžaduje kontrolu', description: 'Povinná pole chybí. V textu hledejte ⚠️ ZKONTROLOVAT a doplňte chybějící údaje.' },
    },
    exportFailed: 'Export se nezdařil. Zkuste to znovu.',
    exportAuthRequired: 'Pro stažení dokumentu se musíte přihlásit. Po přihlášení můžete export zopakovat.',
    exportOnboardingRequired: 'Před prvním exportem dokončete krátkou registraci (přijetí podmínek).',
    exportLimitReached: 'Vyčerpali jste měsíční limit exportů ve verzi Zdarma (5 / měsíc). Přejděte na plán Pro pro vyšší limity.',
    exportRateLimited: 'Příliš mnoho pokusů — zkuste to prosím za chvíli znovu.',
    exportServerError: 'Soubor se nepodařilo vygenerovat na serveru. Zkuste znovu, nebo nás prosím kontaktujte.',
    exportNetworkOrTimeout:
      'Stažení se nepodařilo dokončit (síť nebo časový limit serveru). Zkuste to znovu; u velké smlouvy na bezplatném hostingu zkraťte text nebo zkuste PDF/DOCX opakovat.',
  },

  accountMenu: {
    history: 'Historie',
    settings: 'Nastavení',
    manageSubscription: 'Správa předplatného',
    signOut: 'Odhlásit se',
    accountFallback: 'Účet',
  },

  billing: {
    checkoutRedirecting: 'Přesměrování…',
    checkoutError: 'Nepodařilo se spustit platbu. Zkuste to znovu nebo nás kontaktujte.',
    successTitle: 'Platba proběhla úspěšně',
    successBody: 'Vaše předplatné bude aktivní během několika sekund. Pokud se tarif neaktualizuje, obnovte stránku.',
    canceledTitle: 'Platba byla zrušena',
    canceledBody: 'Nic se neúčtovalo. Můžete to zkusit znovu kdykoli z ceníku.',
    dismiss: 'Zavřít',
    portalOpening: 'Otevírám portál…',
    portalError: 'Nepodařilo se otevřít správu předplatného.',
  },

  auth: {
    continueWithGoogle: 'Pokračovat přes Google',
    redirecting: 'Přesměrování…',
  },

  cookies: {
    bannerText:
      'Používáme pouze nezbytné technické cookies pro přihlášení. Žádné reklamní ani analytické cookies.',
    learnMore: 'Více informací',
    accept: 'Rozumím',
    acceptAria: 'Rozumím, zavřít informaci o cookies',
  },

  dashboard: {
    historySubtitle: 'Vaše vygenerované návrhy smluv a provedené kontroly.',
    tabGenerations: 'Návrhy smluv',
    tabReviews: 'Kontroly smluv',
    emptyGenTitle: 'Zatím žádné generované smlouvy',
    emptyGenDescription:
      'Vytvořte první smlouvu pomocí generátoru a uloží se sem automaticky.',
    emptyGenCta: 'Vytvořit návrh smlouvy',
    emptyRevTitle: 'Zatím žádné kontroly smluv',
    emptyRevDescription:
      'Zkontrolujte existující smlouvu a výsledky se uloží sem automaticky.',
    emptyRevCta: 'Zkontrolovat smlouvu',
    deleteConfirm: 'Opravdu chcete smazat tento záznam?',
    deleteFailed: 'Smazání se nezdařilo. Zkuste to znovu.',
    unknownContractType: 'Neznámý typ',
    viewDetail: 'Zobrazit',
    viewTitleTooltip: 'Zobrazit detail',
    deleteTooltip: 'Smazat',
    viewAriaPattern: 'Zobrazit {title}',
    deleteAriaPattern: 'Smazat {title}',
  },

  onboarding: {
    consentSubtitle: 'Než začnete, potřebujeme váš souhlas s podmínkami.',
    welcomeTitle: 'Vítejte v Právo365',
    welcomeLead:
      'Právo365 je nástroj pro přípravu návrhů smluv a orientační kontrolu textu podle českého práva. Nejde o právní poradenství — výstupy před podpisem ověřte u advokáta.',
    cardHeadline: 'Shrnutí před startem',
    termsAgreePrefix: 'Souhlasím s',
    termsLinkLabel: 'podmínkami používání',
    privacyAgreePrefix: 'Souhlasím se',
    privacyLinkLabel: 'zpracováním osobních údajů',
    privacyGdprBridge: 'a beru na vědomí',
    gdprLinkLabel: 'informace o GDPR / cookies',
    marketingOptIn: 'Souhlasím se zasíláním novinek a nabídek e-mailem',
    optionalTag: '(nepovinné)',
    requiredLegend: 'Povinné pole',
    submitting: 'Ukládám…',
    submitCta: 'Začít používat {siteName}',
    submitError: 'Něco se pokazilo. Zkuste to prosím znovu.',
    viewWelcomeLine: 'Vítejte',
    viewHeading: 'AI-asistovaný nástroj',
    viewBody:
      '{siteName} pomáhá připravovat návrhy smluv a orientační kontrolu textu. Neposkytuje právní poradenství ve smyslu zákona č. 85/1996 Sb., o advokacii. Dokumenty slouží jako pracovní návrh.',
    viewAckTerms:
      'Rozumím, že {siteName} je AI nástroj a neposkytuje právní poradenství. Souhlasím s podmínkami použití.',
    viewAckPrivacy: 'Souhlasím se zpracováním osobních údajů dle zásad ochrany soukromí.',
    viewMarketing: 'Souhlasím se zasíláním informací o novinkách a vylepšeních {siteName}.',
    optionalWord: 'volitelné',
    submitErrorBanner: 'Nepodařilo se dokončit registraci. Zkuste to znovu.',
    guestName: 'uživateli',
    dashboardIntro: 'Před prvním použitím prosím projděte následující informace.',
    viewPrivacyTitle: 'Ochrana osobních údajů',
    viewPrivacyBody:
      'Ukládáme pouze údaje nezbytné pro fungování služby: vaše jméno a e-mail z Google účtu, historii vygenerovaných smluv a provedených kontrol. Data jsou zpracovávána na serverech v EU. Vaše údaje neprodáváme třetím stranám. Svůj účet a data můžete kdykoli smazat.',
    welcomeNamed: 'Vítejte, {name}',
    dashboardSubmitting: 'Dokončuji…',
    continueToApp: 'Pokračovat do aplikace',
    requiredStarsNote: 'Pole označená * jsou povinná pro používání služby.',
  },

  reviewPage: {
    notice:
      'Orientační kontrola smluv podle českého práva. Neposkytuje právní poradenství — výsledek před použitím konzultujte s advokátem.',
    crumbReview: 'Kontrola smlouvy',
    crumbAnalyzing: 'Analyzuji…',
    crumbResults: 'Výsledky',
    crumbError: 'Chyba',
    inputSectionTitle: 'Zkontrolovat existující smlouvu',
    contractLabel: 'Text smlouvy',
    contractPlaceholder:
      'Vložte celý text smlouvy, kterou chcete zkontrolovat…',
    contractHelper:
      'Vložte kompletní text smlouvy včetně podpisových bloků. Minimum 50 znaků.',
    charCounter: '{count} znaků',
    typeHintLabel: 'Typ smlouvy (volitelné)',
    typeHintHelper:
      'Pomáhá AI zaměřit analýzu. Pokud nevíte, zvolte automatické rozpoznání.',
    submitAnalyzing: 'Analyzuji smlouvu…',
    submitIdle: 'Zkontrolovat smlouvu',
    trustServer: 'Server-side zpracování',
    trustNoPersist: 'Pro tuto funkci neskladáme smluvní text jako soubor.',
    trustJurisdictionContext: 'Podle českého práva',
    trustStructured: 'Strukturovaná analýza rizik',
    analyzingTitle: 'Analyzuji smlouvu',
    analyzingSubtitle: 'AI prochází klauzule v kontextu českého práva.',
    step1: 'Analyzuji text smlouvy…',
    step2: 'Zjistuji typ dokumentu a kontext…',
    step3: 'Kontroluji rizikové klauzule…',
    step4: 'Hledám chybějící ujednání…',
    step5: 'Připravuji shrnutí…',
    errorLead: 'Chyba při analýze',
    retry: 'Zkusit znovu',
    newReview: 'Nová kontrola',
    fetchErrorFallback: 'Chyba při analýze smlouvy.',
    networkError: 'Síťová chyba. Zkuste to prosím znovu.',
    typeOptions: {
      auto: '— Automaticky rozpoznat —',
      purchase: 'Kupní smlouva',
      work: 'Smlouva o dílo',
      tenancy: 'Nájemní smlouva',
      employment: 'Pracovní smlouva',
      nda: 'Smlouva o mlčenlivosti (NDA)',
      mandate: 'Mandátní smlouva',
      license: 'Licenční smlouva',
      gift: 'Darovací smlouva',
      loan: 'Smlouva o půjčce',
      other: 'Jiný typ smlouvy',
    },
    errorDetailPrefix: 'Chyba při analýze:',
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
    heroTrustNote: string
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
        pricing: string
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
  accountMenu: {
    history: string
    settings: string
    manageSubscription: string
    signOut: string
    accountFallback: string
  }
  billing: {
    checkoutRedirecting: string
    checkoutError: string
    successTitle: string
    successBody: string
    canceledTitle: string
    canceledBody: string
    dismiss: string
    portalOpening: string
    portalError: string
  }
  auth: {
    continueWithGoogle: string
    redirecting: string
  }
  cookies: {
    bannerText: string
    learnMore: string
    accept: string
    acceptAria: string
  }
  dashboard: {
    historySubtitle: string
    tabGenerations: string
    tabReviews: string
    emptyGenTitle: string
    emptyGenDescription: string
    emptyGenCta: string
    emptyRevTitle: string
    emptyRevDescription: string
    emptyRevCta: string
    deleteConfirm: string
    deleteFailed: string
    unknownContractType: string
    viewDetail: string
    viewTitleTooltip: string
    deleteTooltip: string
    viewAriaPattern: string
    deleteAriaPattern: string
  }
  onboarding: {
    consentSubtitle: string
    welcomeTitle: string
    welcomeLead: string
    cardHeadline: string
    termsAgreePrefix: string
    termsLinkLabel: string
    privacyAgreePrefix: string
    privacyLinkLabel: string
    privacyGdprBridge: string
    gdprLinkLabel: string
    marketingOptIn: string
    optionalTag: string
    requiredLegend: string
    submitting: string
    submitCta: string
    submitError: string
    viewWelcomeLine: string
    viewHeading: string
    viewBody: string
    viewAckTerms: string
    viewAckPrivacy: string
    viewMarketing: string
    optionalWord: string
    submitErrorBanner: string
    guestName: string
    dashboardIntro: string
    viewPrivacyTitle: string
    viewPrivacyBody: string
    welcomeNamed: string
    dashboardSubmitting: string
    continueToApp: string
    requiredStarsNote: string
  }
  reviewPage: {
    notice: string
    crumbReview: string
    crumbAnalyzing: string
    crumbResults: string
    crumbError: string
    inputSectionTitle: string
    contractLabel: string
    contractPlaceholder: string
    contractHelper: string
    charCounter: string
    typeHintLabel: string
    typeHintHelper: string
    submitAnalyzing: string
    submitIdle: string
    trustServer: string
    trustNoPersist: string
    trustJurisdictionContext: string
    trustStructured: string
    analyzingTitle: string
    analyzingSubtitle: string
    step1: string
    step2: string
    step3: string
    step4: string
    step5: string
    errorLead: string
    retry: string
    newReview: string
    fetchErrorFallback: string
    networkError: string
    typeOptions: {
      auto: string
      purchase: string
      work: string
      tenancy: string
      employment: string
      nda: string
      mandate: string
      license: string
      gift: string
      loan: string
      other: string
    }
    errorDetailPrefix: string
  }
  langSwitch: {
    label: string
    legalBasisCs: string
    legalBasisDe: string
    legalBasisEn: string
  }
}
