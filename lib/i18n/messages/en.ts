/**
 * English (en) UI messages — used for UK jurisdiction.
 */

import type { Messages } from './cs'

export const en: Messages = {
  meta: {
    locale: 'en',
    siteName: 'PrávníkAI',
    htmlLang: 'en',
    legalLabel: 'English law',
  },

  nav: {
    generator: 'Contract generator',
    review: 'Contract review',
    pricing: 'Pricing',
    faq: 'FAQ',
    login: 'Sign in',
    dashboard: 'My account',
    languageMenuLabel: 'Change language and jurisdiction',
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
      CZ: 'Czech Republic',
      DE: 'Germany',
      UK: 'United Kingdom',
    },
    legal: {
      CZ: 'Czech law (NOZ, ZP, ZOK)',
      DE: 'German law (BGB, HGB, GewO)',
      UK: 'English law (common law, Sale of Goods Act, Employment Rights Act)',
    },
  },

  category: {
    civil: 'Civil law',
    commercial: 'Commercial law',
    employment: 'Employment law',
    realestate: 'Real estate',
  },

  home: {
    kicker: 'AI assistant for lawyers',
    heroSubtitle:
      'Generate legal contracts in minutes, not hours. An intelligent tool that understands Czech, German and English law — in your client’s language.',
    ctaGenerate: 'Generate contract',
    ctaReview: 'Review contract',
    statContractTypes: 'Contract types',
    statTime: 'Average time',
    statJurisdictions: 'Jurisdictions',
    sectionFeaturesTitle: 'Why PrávníkAI',
    sectionFeaturesSubtitle: 'A tool built by lawyers, for lawyers',
    sectionHowTitle: 'How it works',
    sectionHowSubtitle: 'A contract in 3 simple steps',
    sectionTypesTitle: 'Supported contract types',
    sectionTypesSubtitle: 'CZ · DE · UK — we keep expanding the library',
    sectionFaqTitle: 'Frequently asked questions',
    sectionFaqSubtitle: 'Everything you need to know',
    sectionPricingTitle: 'Pricing',
    sectionPricingSubtitle: 'Start for free, upgrade when you’re ready',
    ctaCardTitle: 'Start drafting contracts today',
    ctaCardBody:
      'Prepare legally sound contracts in minutes instead of hours. Three jurisdictions, professional AI drafting, DOCX and PDF export.',
    ctaCardPrimary: 'Try for free',
    ctaCardSecondary: 'I have questions',
    feature: {
      automated: {
        title: 'Automated contracts',
        body: 'Pick a contract type, fill in the parties’ details and let the AI generate a complete legal document under the relevant law.',
      },
      time: {
        title: 'Save time',
        body: 'A contract that would take hours of manual work is ready in minutes. More time for the things that truly need your expertise.',
      },
      legal: {
        title: 'Legal certainty',
        body: 'Every generated contract is grounded in current law — NOZ, ZP, ZOK for CZ; BGB, HGB for DE; common law and statutes for UK. The system cites specific provisions.',
      },
      security: {
        title: 'Data security',
        body: 'All data is processed server-side in line with GDPR. The API key never leaves the server. Sensitive fields are tagged and protected.',
      },
      review: {
        title: 'AI contract review',
        body: 'Paste an existing contract and the AI flags risky clauses, missing provisions and negotiation points under the chosen law.',
      },
      export: {
        title: 'DOCX and PDF export',
        body: 'Export contracts as DOCX or PDF with professional layout — header, footer, legal citations and disclaimer in the contract’s language.',
      },
    },
    step: {
      one: { title: 'Pick a contract type', body: 'Choose from the catalogue for CZ, DE or UK — sale, employment, tenancy, NDA, services and more.' },
      two: { title: 'Fill in the details', body: 'Enter party details, the subject matter and any specific terms. The form adapts dynamically.' },
      three: { title: 'Download the contract', body: 'The AI drafts a complete contract with statutory citations. Review, edit and export to DOCX or PDF.' },
    },
    footer: {
      productHeading: 'Product',
      legalHeading: 'Legal',
      contactHeading: 'Contact',
      links: {
        features: 'Features',
        generator: 'Generator',
        review: 'Review',
        faq: 'FAQ',
        terms: 'Terms of service',
        privacy: 'Privacy policy',
        gdpr: 'GDPR',
      },
      tagline: 'Smart contract generator for CZ, DE and UK law. AI technology, professional output.',
      rights: 'All rights reserved.',
      support: 'Support',
    },
    trust: {
      serverside: 'Server-side processing',
      apikey: 'API key never on the client',
      jurisdiction: 'Jurisdiction of your choice',
      validation: '3-layer validation',
    },
  },

  generator: {
    title: 'Contract generator',
    subtitle: 'AI drafting under your chosen law',
    selectHeading: 'Pick a contract type',
    legalBasisInline: 'Legal basis',
    jurisdictionNotice:
      'The system drafts contracts under {jurisdiction}. The output is a draft — always have the final version reviewed by a qualified lawyer or solicitor.',
    breadcrumbType: 'Contract type',
    breadcrumbGenerating: 'Drafting…',
    breadcrumbResult: 'Result',
    generatingTitle: 'Drafting your {type}',
    generatingSubtitle: 'The AI is analysing the legal context and preparing the contract text.',
    generatingDurationHint:
      'Frontier models (e.g. GPT‑5) often need 1–4 minutes — the pipeline runs two AI steps (draft + quality review). Keep this tab open.',
    steps: {
      validate: 'Validating your input…',
      context: 'Preparing legal context…',
      draft: 'Drafting the contract…',
      review: 'Reviewing legal provisions…',
      finalize: 'Finalising the document…',
    },
    error: {
      heading: 'Drafting error',
      retry: 'Try again',
      changeType: 'Change contract type',
      timeoutOrNetwork:
        'The connection was interrupted or the hosting function timed out (long frontier-model jobs often exceed default limits). Wait a moment and try again; if it keeps failing, the deployment needs a longer serverless timeout (for example on Vercel with a tier that supports a higher limit).',
    },
  },

  result: {
    trustBanner: 'AI draft · Solicitor review required · Not legal advice',
    copy: 'Copy',
    copied: 'Copied',
    copyToClipboard: 'Copy to clipboard',
    docx: 'DOCX',
    pdf: 'PDF',
    downloadDocx: 'Download DOCX',
    downloadPdf: 'Download PDF',
    exporting: 'Exporting…',
    exportShort: 'Export…',
    edit: 'Edit',
    editAndRegenerate: 'Edit and regenerate',
    newContract: 'New contract',
    contractTextHeading: 'Contract text',
    chars: 'characters',
    generatedAt: 'Generated',
    schema: 'Schema',
    mode: 'Mode',
    missingOptionalToggle: '{count} optional fields not filled (click to view)',
    legalDisclaimerHeading: 'Legal disclaimer',
    legalDisclaimerBody:
      'This document was generated by artificial intelligence and is provided solely as a working draft. Before signing or relying on it, please have it reviewed by a qualified solicitor. The operator accepts no liability for the content or any legal effect of the generated text.',
    modeBadge: {
      complete: { label: 'Complete contract', description: 'All required fields were provided. The contract is generated without gaps.' },
      draft: { label: 'Working draft', description: 'Required fields are filled. Optional details are missing — search the text for [TO COMPLETE].' },
      reviewNeeded: { label: 'Review required', description: 'Required fields are missing. Search the text for ⚠️ REVIEW and complete the missing information.' },
    },
    exportFailed: 'Export failed. Please try again.',
  },

  langSwitch: {
    label: 'Language and jurisdiction',
    legalBasisCs: 'Drafts under Czech law',
    legalBasisDe: 'Drafts under German law',
    legalBasisEn: 'Drafts under English law',
  },
}
