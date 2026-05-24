/**
 * German (de) UI messages.
 */

import type { Messages } from './cs'

export const de: Messages = {
  meta: {
    locale: 'de',
    siteName: 'Právo365',
    htmlLang: 'de',
    legalLabel: 'deutsches Recht',
  },

  nav: {
    generator: 'Vertragsgenerator',
    review: 'Vertragsprüfung',
    pricing: 'Preise',
    faq: 'FAQ',
    login: 'Anmelden',
    dashboard: 'Mein Konto',
    languageMenuLabel: 'Sprache und Rechtsraum ändern',
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
      CZ: 'Tschechische Republik',
      DE: 'Deutschland',
      UK: 'Vereinigtes Königreich',
    },
    legal: {
      CZ: 'tschechisches Recht (NOZ, ZP, ZOK)',
      DE: 'deutsches Recht (BGB, HGB, GewO)',
      UK: 'englisches Recht (Common Law, Sale of Goods Act, Employment Rights Act)',
    },
  },

  category: {
    civil: 'Zivilrecht',
    commercial: 'Handelsrecht',
    employment: 'Arbeitsrecht',
    realestate: 'Immobilien',
  },

  home: {
    kicker: 'KI-Assistent für Juristen',
    heroSubtitle:
      'Erstellen Sie strukturierte Vertragsentwürfe für CZ-, DE- oder UK-Recht — in wenigen Minuten. Für Kanzleien, Unternehmen und grenzüberschreitende Projekte. Kein Ersatz für individuelle Mandantenberatung.',
    heroTrustNote:
      'Keine individuelle Rechtsberatung. Zahlungen sicher über Stripe. Verarbeitung DSGVO-konform.',
    ctaGenerate: 'Vertrag erstellen',
    ctaReview: 'Vertrag prüfen',
    statContractTypes: 'Vertragsarten',
    statTime: 'Durchschnittliche Zeit',
    statJurisdictions: 'Rechtsräume',
    sectionFeaturesTitle: 'Warum Právo365',
    sectionFeaturesSubtitle: 'Ein Tool, von Juristen für Juristen entwickelt',
    sectionHowTitle: 'So funktioniert es',
    sectionHowSubtitle: 'Ein Vertrag in 3 einfachen Schritten',
    sectionTypesTitle: 'Unterstützte Vertragsarten',
    sectionTypesSubtitle: 'CZ · DE · UK — wir erweitern die Bibliothek laufend',
    sectionFaqTitle: 'Häufige Fragen',
    sectionFaqSubtitle: 'Alles, was Sie wissen müssen',
    sectionPricingTitle: 'Preise',
    sectionPricingSubtitle: 'Kostenlos starten, jederzeit upgraden',
    ctaCardTitle: 'Beginnen Sie noch heute mit der Vertragserstellung',
    ctaCardBody:
      'Bereiten Sie rechtssichere Verträge in Minuten statt Stunden vor. Drei Rechtsräume, professioneller KI-Entwurf, Export als DOCX und PDF.',
    ctaCardPrimary: 'Kostenlos testen',
    ctaCardSecondary: 'FAQ lesen',
    feature: {
      automated: {
        title: 'Automatisierte Verträge',
        body: 'Wählen Sie die Vertragsart, geben Sie die Parteidaten ein und lassen Sie die KI ein vollständiges Rechtsdokument im Einklang mit der lokalen Gesetzgebung erstellen.',
      },
      time: {
        title: 'Zeitersparnis',
        body: 'Ein Vertrag, der Sie Stunden manueller Arbeit kostet, ist in Minuten fertig. Mehr Zeit für das, was wirklich Ihre Expertise erfordert.',
      },
      legal: {
        title: 'Rechtssicherheit',
        body: 'Jeder generierte Vertrag basiert auf aktuellen Vorschriften — NOZ, ZP, ZOK für CZ; BGB, HGB für DE; Common Law und Statutes für UK. Das System zitiert konkrete Bestimmungen.',
      },
      security: {
        title: 'Datensicherheit',
        body: 'Alle Daten werden serverseitig DSGVO-konform verarbeitet. Der API-Schlüssel verlässt nie den Server. Sensible Felder sind gekennzeichnet und geschützt.',
      },
      review: {
        title: 'KI-Vertragsprüfung',
        body: 'Fügen Sie einen bestehenden Vertrag ein, und die KI identifiziert riskante Klauseln, fehlende Bestimmungen und Verhandlungspunkte nach dem gewählten Recht.',
      },
      export: {
        title: 'Export als DOCX und PDF',
        body: 'Exportieren Sie Verträge mit professionellem Layout — Kopf- und Fußzeile, Rechtszitate und Disclaimer automatisch in der Vertragssprache.',
      },
    },
    step: {
      one: { title: 'Vertragsart wählen', body: 'Wählen Sie aus dem Angebot für CZ, DE oder UK — Kauf-, Arbeits-, Mietvertrag, NDA, Werkvertrag und mehr.' },
      two: { title: 'Daten ausfüllen', body: 'Geben Sie die Daten der Vertragsparteien, den Vertragsgegenstand und spezifische Bedingungen ein. Das Formular passt sich dynamisch an.' },
      three: { title: 'Vertrag herunterladen', body: 'Die KI erstellt einen vollständigen Vertrag mit Gesetzeszitaten. Prüfen, anpassen und als DOCX oder PDF exportieren.' },
    },
    footer: {
      productHeading: 'Produkt',
      legalHeading: 'Rechtliches',
      contactHeading: 'Kontakt',
      links: {
        features: 'Funktionen',
        generator: 'Generator',
        review: 'Prüfung',
        pricing: 'Preise',
        faq: 'FAQ',
        terms: 'AGB',
        privacy: 'Datenschutz',
        gdpr: 'DSGVO',
      },
      tagline: 'Intelligenter Vertragsgenerator für CZ-, DE- und UK-Recht. KI-Technologie, professioneller Output.',
      rights: 'Alle Rechte vorbehalten.',
      support: 'Support',
    },
    trust: {
      serverside: 'Serverseitige Verarbeitung',
      apikey: 'API-Schlüssel nie im Client',
      jurisdiction: 'Rechtsraum nach Ihrer Wahl',
      validation: '3-stufige Validierung',
    },
  },

  generator: {
    title: 'Vertragsgenerator',
    subtitle: 'KI-Entwurf nach gewähltem Rechtsraum',
    selectHeading: 'Vertragsart auswählen',
    legalBasisInline: 'Rechtsgrundlage',
    jurisdictionNotice:
      'Das System erstellt Verträge nach {jurisdiction}. Die generierten Dokumente sind ein Entwurf — bitte lassen Sie die endgültige Version stets von einem Anwalt prüfen.',
    breadcrumbType: 'Vertragsart',
    breadcrumbGenerating: 'Wird erstellt…',
    breadcrumbResult: 'Ergebnis',
    generatingTitle: '{type} wird erstellt',
    generatingSubtitle: 'Die KI analysiert den rechtlichen Kontext und erstellt den Vertragstext.',
    generatingDurationHint:
      'Bei leistungsstarken Modellen (z. B. GPT‑5) kann der gesamte Vorgang 1–4 Minuten dauern — es laufen zwei KI-Schritte (Entwurf + Qualitätsprüfung). Bitte lassen Sie die Seite geöffnet.',
    steps: {
      validate: 'Eingaben werden validiert…',
      context: 'Rechtskontext wird vorbereitet…',
      draft: 'Vertragstext wird generiert…',
      review: 'Rechtsbestimmungen werden geprüft…',
      finalize: 'Dokument wird fertiggestellt…',
    },
    error: {
      heading: 'Fehler bei der Erstellung',
      retry: 'Erneut versuchen',
      changeType: 'Vertragsart ändern',
      timeoutOrNetwork:
        'Die Verbindung zum Server wurde unterbrochen oder das Hosting-Zeitlimit der Funktion wurde überschritten (lange Ausführungen mit leistungsstarken Modellen passieren häufig). Warten Sie kurz und versuchen Sie es erneut; falls es weiterhin fehlschlägt, muss eine längere Laufzeit der Server-Funktion konfiguriert werden (z. B. Vercel-Plan mit höherem Limit).',
    },
  },

  result: {
    trustBanner: 'KI-Entwurf · Anwaltliche Prüfung erforderlich · Keine Rechtsberatung',
    copy: 'Kopieren',
    copied: 'Kopiert',
    copyToClipboard: 'In Zwischenablage kopieren',
    docx: 'DOCX',
    pdf: 'PDF',
    downloadDocx: 'DOCX herunterladen',
    downloadPdf: 'PDF herunterladen',
    exporting: 'Wird exportiert…',
    exportShort: 'Export…',
    edit: 'Bearbeiten',
    editAndRegenerate: 'Bearbeiten und neu erstellen',
    newContract: 'Neuer Vertrag',
    contractTextHeading: 'Vertragstext',
    chars: 'Zeichen',
    generatedAt: 'Erstellt am',
    schema: 'Schema',
    mode: 'Modus',
    missingOptionalToggle: '{count} optionale Felder nicht ausgefüllt (zum Anzeigen klicken)',
    legalDisclaimerHeading: 'Rechtlicher Hinweis',
    legalDisclaimerBody:
      'Dieses Dokument wurde durch künstliche Intelligenz erstellt und dient ausschließlich als Arbeitsentwurf. Vor Unterzeichnung oder rechtlicher Verwendung lassen Sie es bitte von einem Anwalt prüfen. Der Betreiber haftet nicht für den Inhalt oder die rechtlichen Wirkungen des erzeugten Textes.',
    modeBadge: {
      complete: { label: 'Vollständiger Vertrag', description: 'Alle erforderlichen Felder wurden ausgefüllt. Der Vertrag ist lückenlos.' },
      draft: { label: 'Arbeitsentwurf', description: 'Pflichtfelder sind ausgefüllt. Optionale Angaben fehlen — suchen Sie im Text nach [BITTE ERGÄNZEN].' },
      reviewNeeded: { label: 'Prüfung erforderlich', description: 'Pflichtfelder fehlen. Suchen Sie im Text nach ⚠️ PRÜFEN und ergänzen Sie die fehlenden Angaben.' },
    },
    exportFailed: 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
    exportAuthRequired: 'Zum Herunterladen müssen Sie sich anmelden. Wiederholen Sie den Export nach der Anmeldung.',
    exportOnboardingRequired: 'Bitte schließen Sie zuerst die Registrierung ab (Annahme der Bedingungen).',
    exportLimitReached: 'Sie haben das monatliche Export-Limit der kostenlosen Version erreicht (5 / Monat). Für unbegrenzten Download wechseln Sie auf den Pro-Plan.',
    exportRateLimited: 'Zu viele Anfragen — bitte versuchen Sie es in einem Moment erneut.',
    exportServerError: 'Datei konnte serverseitig nicht erzeugt werden. Bitte erneut versuchen oder uns kontaktieren.',
    exportNetworkOrTimeout:
      'Download konnte nicht abgeschlossen werden (Netzwerk oder Server-Zeitlimit). Bitte erneut versuchen; bei sehr langen Verträgen auf dem kostenlosen Hosting ggf. Text kürzen oder erneut exportieren.',
  },

  accountMenu: {
    history: 'Verlauf',
    settings: 'Einstellungen',
    signOut: 'Abmelden',
    accountFallback: 'Konto',
  },

  auth: {
    continueWithGoogle: 'Mit Google fortfahren',
    redirecting: 'Weiterleitung…',
  },

  cookies: {
    bannerText:
      'Wir verwenden nur technisch notwendige Cookies für die Anmeldung — keine Werbe- oder Analyse-Cookies.',
    learnMore: 'Mehr Infos',
    accept: 'Verstanden',
    acceptAria: 'Banner zu Cookies schließen',
  },

  dashboard: {
    historySubtitle: 'Ihre erstellten Verträge und durchgeführten Prüfungen.',
    tabGenerations: 'Generierte Verträge',
    tabReviews: 'Vertragsprüfungen',
    emptyGenTitle: 'Noch keine generierten Verträge',
    emptyGenDescription:
      'Erstellen Sie einen Vertrag mit dem Generator — er erscheint automatisch hier.',
    emptyGenCta: 'Vertrag erstellen',
    emptyRevTitle: 'Noch keine Vertragsprüfungen',
    emptyRevDescription:
      'Prüfen Sie einen Vertrag — die Ergebnisse werden hier gespeichert.',
    emptyRevCta: 'Vertrag prüfen',
    deleteConfirm: 'Eintrag wirklich löschen?',
    deleteFailed: 'Löschen fehlgeschlagen. Bitte erneut versuchen.',
    unknownContractType: 'Unbekannter Typ',
    viewDetail: 'Anzeigen',
    viewTitleTooltip: 'Details anzeigen',
    deleteTooltip: 'Löschen',
    viewAriaPattern: '{title} anzeigen',
    deleteAriaPattern: '{title} löschen',
  },

  onboarding: {
    consentSubtitle: 'Bitte stimmen Sie den Bedingungen zu, bevor Sie beginnen.',
    welcomeTitle: 'Willkommen bei Právo365',
    welcomeLead:
      'Právo365 hilft bei Vertragsentwürfen und einer orientierenden Prüfung nach gewähltem Rechtsraum (CZ, DE, UK). Keine Rechtsberatung — vor Unterzeichnung einen Anwalt einbeziehen.',
    cardHeadline: 'Kurz vor dem Start',
    termsAgreePrefix: 'Ich akzeptiere die',
    termsLinkLabel: 'Nutzungsbedingungen',
    privacyAgreePrefix: 'Ich akzeptiere die',
    privacyLinkLabel: 'Datenschutzerklärung',
    privacyGdprBridge: 'und nehme zur Kenntnis die',
    gdprLinkLabel: 'Hinweise zu DSGVO / Cookies',
    marketingOptIn: 'Ich möchte Neuigkeiten und Angebote per E-Mail erhalten',
    optionalTag: '(freiwillig)',
    requiredLegend: 'Pflichtfelder',
    submitting: 'Speichern…',
    submitCta: '{siteName} nutzen',
    submitError: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    viewWelcomeLine: 'Willkommen',
    viewHeading: 'KI-unterstütztes Tool',
    viewBody:
      '{siteName} unterstützt beim Erstellen von Vertragsentwürfen und bei einer orientierenden Prüfung. Keine Rechtsberatung im Sinne des RDG. Die Dokumente sind Arbeitsentwürfe.',
    viewAckTerms:
      'Mir ist bekannt, dass {siteName} ein KI-Tool ist und keine Rechtsberatung leistet. Ich akzeptiere die Nutzungsbedingungen.',
    viewAckPrivacy:
      'Ich akzeptiere die Verarbeitung personenbezogener Daten gemäß der Datenschutzerklärung.',
    viewMarketing:
      'Ich möchte Informationen zu Neuigkeiten und Verbesserungen bei {siteName} erhalten.',
    optionalWord: 'optional',
    submitErrorBanner:
      'Onboarding konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.',
    guestName: 'Nutzer',
    dashboardIntro: 'Bitte lesen Sie vor der ersten Nutzung die folgenden Informationen.',
    viewPrivacyTitle: 'Datenschutz',
    viewPrivacyBody:
      'Wir speichern nur die für den Betrieb erforderlichen Daten: Ihren Namen und Ihre E-Mail von Ihrem Google-Konto, sowie die Historie generierter Verträge und Prüfungen. Die Verarbeitung erfolgt auf Servern in der EU. Wir verkaufen Ihre Daten nicht. Konto und Daten können Sie jederzeit löschen.',
    welcomeNamed: 'Willkommen, {name}',
    dashboardSubmitting: 'Wird abgeschlossen…',
    continueToApp: 'Weiter zur Anwendung',
    requiredStarsNote: 'Mit * markierte Felder sind für die Nutzung des Dienstes erforderlich.',
  },

  reviewPage: {
    notice:
      'KI-unterstützte Vertragsprüfung im Rechtskontext ({law}). Keine Rechtsberatung — lassen Sie das Ergebnis vor der Nutzung juristisch prüfen.',
    crumbReview: 'Vertrag prüfen',
    crumbAnalyzing: 'Analyse…',
    crumbResults: 'Ergebnisse',
    crumbError: 'Fehler',
    inputSectionTitle: 'Bestehenden Vertrag prüfen',
    contractLabel: 'Vertragstext',
    contractPlaceholder: 'Fügen Sie den vollständigen zu prüfenden Vertrag ein…',
    contractHelper:
      'Vollständigen Text inkl. Signaturen einfügen. Mindestens 50 Zeichen.',
    charCounter: '{count} Zeichen',
    typeHintLabel: 'Vertragstyp (optional)',
    typeHintHelper:
      'Hilft der KI beim Fokus. Unbekannt — automatische Erkennung verwenden.',
    submitAnalyzing: 'Vertrag wird analysiert…',
    submitIdle: 'Vertrag prüfen',
    trustServer: 'Verarbeitung auf dem Server',
    trustNoPersist:
      'Der Vertragstext dieser Prüfung wird nicht dauerhaft gespeichert.',
    trustJurisdictionContext: 'Bezug zum gewählten Rechtsraum',
    trustStructured: 'Strukturierte Risikoanalyse',
    analyzingTitle: 'Analyse läuft',
    analyzingSubtitle:
      'Die KI prüft Klauseln im Kontext der gewählten Jurisdiktion.',
    step1: 'Vertragstext wird gelesen…',
    step2: 'Dokumenttyp und Kontext werden ermittelt…',
    step3: 'Risikoklauseln werden geprüft…',
    step4: 'Fehlende Regelungen werden gesucht…',
    step5: 'Zusammenfassung wird erstellt…',
    errorLead: 'Fehler bei der Analyse',
    retry: 'Erneut versuchen',
    newReview: 'Neue Prüfung',
    fetchErrorFallback: 'Fehler bei der Vertragsanalyse.',
    networkError:
      'Netzwerkfehler. Bitte versuchen Sie es später erneut.',
    typeOptions: {
      auto: '— Automatisch erkennen —',
      purchase: 'Kaufvertrag',
      work: 'Werkvertrag',
      tenancy: 'Mietvertrag',
      employment: 'Arbeitsvertrag',
      nda: 'Geheimhaltungsvereinbarung (NDA)',
      mandate: 'Mandatsvertrag',
      license: 'Lizenzvertrag',
      gift: 'Schenkungsvertrag',
      loan: 'Darlehensvertrag',
      other: 'Sonstiger Vertragstyp',
    },
    errorDetailPrefix: 'Fehler bei der Analyse:',
  },

  langSwitch: {
    label: 'Sprache und Rechtsraum',
    legalBasisCs: 'Erstellt nach tschechischem Recht',
    legalBasisDe: 'Erstellt nach deutschem Recht',
    legalBasisEn: 'Erstellt nach englischem Recht',
  },
}
