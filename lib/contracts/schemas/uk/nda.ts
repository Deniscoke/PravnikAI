/**
 * Confidentiality Agreement (NDA) — England & Wales
 * Legal basis: common law of confidence + Trade Secrets (Enforcement, etc.) Regulations 2018
 * Category: Commercial law
 */

import type { ContractSchema } from '../../types'

export const ndaUk: ContractSchema = {
  metadata: {
    schemaId: 'uk-nda-v1',
    contractFamily: 'nda',
    name: 'Confidentiality Agreement (NDA)',
    version: '1.0.0',
    jurisdiction: 'UK',
    currency: 'GBP',
    legalBasis: [
      'Common law of confidence (Coco v A. N. Clark (Engineers) Ltd [1969])',
      'Trade Secrets (Enforcement, etc.) Regulations 2018',
      'Contracts (Rights of Third Parties) Act 1999 (excluded by default)',
      'Unfair Contract Terms Act 1977 (B2B reasonableness test)',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description: 'Agreement protecting confidential information and trade secrets shared between the parties.',
    outputStructure: {
      sections: [
        'Parties',
        'Background / Recitals',
        'Definitions',
        'Confidentiality undertakings',
        'Permitted use and exceptions',
        'Term and survival',
        'Remedies and damages',
        'Boilerplate',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'The courts of England and Wales have exclusive jurisdiction',
    },
    aiInstructions:
      'Draft the Confidentiality Agreement under English law (E&W) — common law of confidence supplemented by the Trade Secrets Regulations 2018.\n\n' +
      'MANDATORY CLAUSES:\n' +
      '1. Identification of the parties (disclosing party / receiving party — or mutual)\n' +
      '2. Recitals — purpose for which the information is being shared\n' +
      '3. Definition of "Confidential Information" — broad but with concrete carve-outs\n' +
      '4. Confidentiality undertakings — non-disclosure, non-use except for the agreed purpose\n' +
      '5. Permitted exceptions — already public, independently developed, lawfully received from a third party, compelled by law/regulator\n' +
      '6. Standard of care — at least the same as the receiving party uses for its own confidential information\n' +
      '7. Permitted recipients — staff and professional advisers on a need-to-know basis under equivalent confidentiality obligations\n' +
      '8. Term — duration of the obligations (typical 2–5 years post-termination; trade secrets indefinite while secret)\n' +
      '9. Return / destruction of materials on request or termination\n' +
      '10. Remedies — equitable relief (injunction), damages, account of profits\n' +
      '11. No licence, no warranty as to accuracy of information\n' +
      '12. Boilerplate — entire agreement, variation, assignment, severance, governing law (E&W), exclusive jurisdiction, third-party rights excluded (Contracts (Rights of Third Parties) Act 1999)\n' +
      '13. Execution blocks for each party\n\n' +
      'DRAFTING NOTES:\n' +
      '- Define "Confidential Information" precisely — vague definitions are difficult to enforce\n' +
      '- Trade secrets receive additional statutory protection where they meet the s.2 Trade Secrets Regs 2018 criteria\n' +
      '- Liquidated damages clauses are permitted only where they represent a genuine pre-estimate of loss (Cavendish Square v Makdessi)\n' +
      '- Exclude third-party rights unless intended (Contracts (Rights of Third Parties) Act 1999)\n' +
      '- Do not invent specific sums or dates not in the brief',
  },

  parties: [
    {
      id: 'disclosing',
      label: 'Disclosing Party',
      role: 'discloses confidential information to the other party',
      requiredFields: [
        { id: 'name', label: 'Full name / company name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Address / registered office', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Acting through (signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'receiving',
      label: 'Receiving Party',
      role: 'receives the confidential information and undertakes to protect it',
      requiredFields: [
        { id: 'name', label: 'Full name / company name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Address / registered office', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Acting through (signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'type',
      title: 'NDA type and purpose',
      fields: [
        {
          id: 'ndaType',
          label: 'Direction of disclosure',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'one-way', label: 'One-way (only the disclosing party shares)' },
            { value: 'mutual', label: 'Mutual (both parties share)' },
          ],
        },
        {
          id: 'businessContext',
          label: 'Permitted purpose',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          placeholder: 'Describe the discussions or relationship for which information is being shared (e.g. evaluating a potential acquisition, supplier negotiation)…',
          validation: { minLength: 20 },
        },
      ],
    },
    {
      id: 'confidential-info',
      title: 'Confidential Information',
      fields: [
        {
          id: 'confidentialInfoDefinition',
          label: 'Categories of Confidential Information',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'Trade Secrets Regs 2018 — must be secret, commercially valuable, subject to reasonable steps to keep it secret',
          placeholder: 'e.g. technical know-how, customer lists, financial data, strategy documents, source code, etc.',
          validation: { minLength: 30 },
        },
        {
          id: 'informationFormat',
          label: 'Form of disclosure covered',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'all-forms', label: 'All forms (written, electronic, oral, visual)' },
            { value: 'written', label: 'Written and electronic only' },
            { value: 'marked', label: 'Only information marked "Confidential"' },
          ],
          defaultValue: 'all-forms',
        },
      ],
    },
    {
      id: 'term',
      title: 'Term',
      fields: [
        {
          id: 'effectiveDate',
          label: 'Effective date',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'ndaDuration',
          label: 'Duration of the confidentiality undertakings',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: '1-year', label: '1 year from the Effective Date' },
            { value: '2-years', label: '2 years from the Effective Date' },
            { value: '3-years', label: '3 years from the Effective Date' },
            { value: '5-years', label: '5 years from the Effective Date' },
            { value: 'indefinite', label: 'For so long as the information remains confidential (indefinite)' },
          ],
        },
        {
          id: 'postTerminationPeriod',
          label: 'Survival of obligations after termination',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: '1-year', label: '1 year after termination' },
            { value: '2-years', label: '2 years after termination' },
            { value: '3-years', label: '3 years after termination' },
            { value: 'same', label: 'Same period as the duration above' },
          ],
        },
      ],
    },
    {
      id: 'remedies',
      title: 'Remedies',
      fields: [
        {
          id: 'liquidatedDamages',
          label: 'Liquidated damages per breach (£)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: 'Must be a genuine pre-estimate of loss (Cavendish Square v Makdessi [2015] UKSC 67)',
          validation: { min: 0 },
        },
        {
          id: 'equitableRelief',
          label: 'Equitable relief',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Express acknowledgement that damages alone are inadequate strengthens injunction applications',
          options: [
            { value: 'injunction-and-damages', label: 'Injunction is available in addition to damages' },
            { value: 'damages-only', label: 'Damages only — no equitable relief acknowledged' },
          ],
          defaultValue: 'injunction-and-damages',
        },
      ],
    },
    {
      id: 'boilerplate',
      title: 'Boilerplate',
      fields: [
        {
          id: 'contractDate',
          label: 'Date of execution',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'returnOfInformation',
          label: 'Return / destruction of materials on termination',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'return', label: 'Receiving party returns all materials' },
            { value: 'destroy', label: 'Receiving party destroys / deletes all materials' },
            { value: 'both', label: 'Return originals + destroy copies' },
          ],
          defaultValue: 'destroy',
        },
        {
          id: 'additionalNotes',
          label: 'Additional terms',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Specific carve-outs, named recipients, regulator-disclosure procedures, etc.',
        },
      ],
    },
  ],
}
