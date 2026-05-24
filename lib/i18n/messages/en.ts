/**
 * English (en) UI messages — used for UK jurisdiction.
 */

import type { Messages } from './cs'

export const en: Messages = {
  meta: {
    locale: 'en',
    siteName: 'Právo365',
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
      'Draft structured contracts for CZ, DE or UK law in minutes — with statutory references where appropriate. Built for founders, freelancers and cross-border work. Not a substitute for tailored legal advice.',
    heroTrustNote:
      'Not legal advice. Payments processed securely by Stripe. GDPR-aware data handling.',
    ctaGenerate: 'Generate contract',
    ctaReview: 'Review contract',
    statContractTypes: 'Contract types',
    statTime: 'Average time',
    statJurisdictions: 'Jurisdictions',
    sectionFeaturesTitle: 'Why Právo365',
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
    ctaCardSecondary: 'Read the FAQ',
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
        pricing: 'Pricing',
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
    exportAuthRequired: 'You need to be signed in to download. After signing in, please retry the export.',
    exportOnboardingRequired: 'Please complete the short registration (terms acceptance) before exporting.',
    exportLimitReached: 'You have reached the monthly export limit on the Free plan (5 / month). Upgrade to Pro for unlimited downloads.',
    exportRateLimited: 'Too many attempts — please try again shortly.',
    exportServerError: 'The file could not be generated on the server. Please try again or contact us.',
    exportNetworkOrTimeout:
      'The download did not finish (network or server timeout). Please try again; for very long contracts on free hosting, shorten the text or retry.',
  },

  accountMenu: {
    history: 'History',
    settings: 'Settings',
    manageSubscription: 'Manage subscription',
    signOut: 'Sign out',
    accountFallback: 'Account',
  },

  billing: {
    checkoutRedirecting: 'Redirecting…',
    checkoutError: 'Could not start checkout. Please try again or contact support.',
    successTitle: 'Payment successful',
    successBody: 'Your subscription will activate within a few seconds. Refresh if the plan does not update.',
    canceledTitle: 'Payment canceled',
    canceledBody: 'You were not charged. You can try again anytime from pricing.',
    dismiss: 'Dismiss',
    portalOpening: 'Opening portal…',
    portalError: 'Could not open subscription management.',
  },

  auth: {
    continueWithGoogle: 'Continue with Google',
    redirecting: 'Redirecting…',
  },

  cookies: {
    bannerText:
      'We only use essential cookies to keep you signed in. No advertising or analytics cookies.',
    learnMore: 'Learn more',
    accept: 'OK',
    acceptAria: 'Dismiss cookie information',
  },

  dashboard: {
    historySubtitle:
      'Your generated contracts and reviews you have run.',
    tabGenerations: 'Generated contracts',
    tabReviews: 'Contract reviews',
    emptyGenTitle: 'No generated contracts yet',
    emptyGenDescription:
      'Create one with the generator — it will appear here automatically.',
    emptyGenCta: 'Generate contract',
    emptyRevTitle: 'No contract reviews yet',
    emptyRevDescription:
      'Review a contract — results are saved here.',
    emptyRevCta: 'Review contract',
    deleteConfirm: 'Delete this entry permanently?',
    deleteFailed: 'Could not delete. Please try again.',
    unknownContractType: 'Unknown type',
    viewDetail: 'Open',
    viewTitleTooltip: 'View details',
    deleteTooltip: 'Delete',
    viewAriaPattern: 'View {title}',
    deleteAriaPattern: 'Delete {title}',
  },

  onboarding: {
    consentSubtitle: 'Before you start, please accept the policies below.',
    welcomeTitle: 'Welcome to Právo365',
    welcomeLead:
      'Právo365 helps prepare contract drafts and gives a structured, non-binding review for the jurisdiction you choose (CZ, DE, UK). Not legal advice — involve a solicitor before you rely on any output.',
    cardHeadline: 'Before you continue',
    termsAgreePrefix: 'I agree to the',
    termsLinkLabel: 'terms of service',
    privacyAgreePrefix: 'I agree to the',
    privacyLinkLabel: 'privacy policy',
    privacyGdprBridge: 'and acknowledge the',
    gdprLinkLabel: 'GDPR / cookie information',
    marketingOptIn:
      'I would like product news and offers by email',
    optionalTag: '(optional)',
    requiredLegend: 'Required fields',
    submitting: 'Saving…',
    submitCta: 'Get started with {siteName}',
    submitError: 'Something went wrong. Please try again.',
    viewWelcomeLine: 'Welcome',
    viewHeading: 'AI-assisted tool',
    viewBody:
      '{siteName} helps you prepare contract drafts and spot issues in the text. It does not provide regulated legal advice under the Legal Services Act 2007. Outputs are working drafts only.',
    viewAckTerms:
      'I understand {siteName} is an AI tool and not legal advice. I agree to the terms of use.',
    viewAckPrivacy:
      'I agree to the processing of my personal data under the privacy policy.',
    viewMarketing:
      'I agree to receive updates and improvements about {siteName}.',
    optionalWord: 'optional',
    submitErrorBanner:
      'We could not finish registration. Please try again.',
    guestName: 'there',
    dashboardIntro: 'Before you start, please read the following.',
    viewPrivacyTitle: 'Privacy',
    viewPrivacyBody:
      'We only store data needed to run the service: your name and email from your Google account, plus history of generated contracts and reviews. Processing is on servers in the EU. We do not sell your data. You can delete your account and data at any time.',
    welcomeNamed: 'Welcome, {name}',
    dashboardSubmitting: 'Finishing…',
    continueToApp: 'Continue to the app',
    requiredStarsNote: 'Fields marked with * are required to use the service.',
  },

  reviewPage: {
    notice:
      'AI-assisted contract review in the legal context of ({law}). Not legal advice — confirm with a solicitor before you rely on it.',
    crumbReview: 'Review',
    crumbAnalyzing: 'Analysing…',
    crumbResults: 'Results',
    crumbError: 'Error',
    inputSectionTitle: 'Review an existing contract',
    contractLabel: 'Contract text',
    contractPlaceholder: 'Paste the full contract you want reviewed…',
    contractHelper:
      'Include the full text including signature blocks. Minimum 50 characters.',
    charCounter: '{count} characters',
    typeHintLabel: 'Contract type (optional)',
    typeHintHelper:
      'Helps steer the model. If unsure, leave automatic detection.',
    submitAnalyzing: 'Analysing contract…',
    submitIdle: 'Review contract',
    trustServer: 'Server-side processing',
    trustNoPersist:
      'Review text is processed for this request without being kept as a saved file here.',
    trustJurisdictionContext:
      'Legal context follows your language / jurisdiction choice',
    trustStructured: 'Structured risk analysis',
    analyzingTitle: 'Review in progress',
    analyzingSubtitle:
      'The model reviews clauses in the context of your selected jurisdiction.',
    step1: 'Reading the contract…',
    step2: 'Identifying document type and context…',
    step3: 'Scanning for risky clauses…',
    step4: 'Looking for missing provisions…',
    step5: 'Preparing the summary…',
    errorLead: 'Review error',
    retry: 'Try again',
    newReview: 'New review',
    fetchErrorFallback: 'Contract review failed.',
    networkError:
      'Network error. Please try again in a moment.',
    typeOptions: {
      auto: '— Detect automatically —',
      purchase: 'Sale of goods / purchase agreement',
      work: 'Services / works agreement',
      tenancy: 'Tenancy / lease',
      employment: 'Employment contract',
      nda: 'Confidentiality agreement (NDA)',
      mandate: 'Agency / mandate agreement',
      license: 'Licence agreement',
      gift: 'Gift deed',
      loan: 'Loan agreement',
      other: 'Other contract type',
    },
    errorDetailPrefix: 'Error during review:',
  },

  langSwitch: {
    label: 'Language and jurisdiction',
    legalBasisCs: 'Drafts under Czech law',
    legalBasisDe: 'Drafts under German law',
    legalBasisEn: 'Drafts under English law',
  },
}
