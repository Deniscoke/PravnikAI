/**
 * Services Agreement — England & Wales
 * Legal basis: Supply of Goods and Services Act 1982; Consumer Rights Act 2015 (B2C);
 *              Late Payment of Commercial Debts (Interest) Act 1998
 * Category: Civil law / commercial services
 */

import type { ContractSchema } from '../../types'

export const servicesAgreement: ContractSchema = {
  metadata: {
    schemaId: 'services-agreement-v1',
    contractFamily: 'services',
    name: 'Services Agreement',
    version: '1.0.0',
    jurisdiction: 'UK',
    currency: 'GBP',
    legalBasis: [
      'Supply of Goods and Services Act 1982 (B2B)',
      'Consumer Rights Act 2015, Part 1, Chapter 4 (B2C services)',
      'Late Payment of Commercial Debts (Interest) Act 1998',
      'Unfair Contract Terms Act 1977 (B2B reasonableness)',
    ],
    sensitivity: 'standard',
    category: 'civil',
    description: 'Agreement under which a Supplier provides services to a Customer for a fee.',
    outputStructure: {
      sections: [
        'Parties',
        'The Services',
        'Fees and payment',
        'Term and termination',
        'Warranties and remedies',
        'Limitation of liability',
        'Intellectual property',
        'Boilerplate',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'The courts of England and Wales have exclusive jurisdiction',
    },
    aiInstructions:
      'Draft the Services Agreement under English law (E&W). Apply the Supply of Goods and Services Act 1982 for B2B and Part 1 Chapter 4 of the Consumer Rights Act 2015 for B2C.\n\n' +
      'MANDATORY CLAUSES:\n' +
      '1. Identification of Customer and Supplier\n' +
      '2. Description of Services — sufficiently detailed scope, deliverables, milestones (s.13 SGSA 1982)\n' +
      '3. Fees — fixed fee / time and materials / milestones; currency; VAT treatment; invoicing schedule\n' +
      '4. Payment terms — payment due date; statutory interest under Late Payment of Commercial Debts (Interest) Act 1998 (default 8% above BoE base for B2B)\n' +
      '5. Performance standard — reasonable care and skill (s.13 SGSA 1982 / s.49 CRA 2015)\n' +
      '6. Time of performance — reasonable time unless agreed (s.14 SGSA 1982)\n' +
      '7. Acceptance procedure (if applicable) and remedies for non-acceptance\n' +
      '8. Warranties — Supplier expertise, no IP infringement, compliance with laws\n' +
      '9. Limitation of liability — must satisfy UCTA 1977 reasonableness (B2B) or CRA 2015 fairness (B2C). Cap commonly at fees paid in preceding 12 months\n' +
      '10. Intellectual property — ownership of deliverables, licence to background IP\n' +
      '11. Confidentiality and data protection (UK GDPR / Data Protection Act 2018) — separate DPA if processing personal data\n' +
      '12. Term and termination — notice, termination for breach, insolvency\n' +
      '13. Boilerplate — entire agreement, variation, assignment, severance, force majeure, governing law (E&W), exclusive jurisdiction, third-party rights excluded\n' +
      '14. Execution blocks\n\n' +
      'DRAFTING NOTES:\n' +
      '- Statutory implied terms in B2C services CANNOT be excluded\n' +
      '- For B2B, exclusion of liability for negligence causing death/personal injury is void; other exclusions must be reasonable\n' +
      '- If personal data is processed, attach a DPA (Article 28 UK GDPR)\n' +
      '- Do not invent specific fee amounts, dates or company numbers not in the brief',
  },

  parties: [
    {
      id: 'customer',
      label: 'Customer',
      role: 'engages the Supplier and pays the fees',
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
      id: 'supplier',
      label: 'Supplier',
      role: 'provides the Services',
      requiredFields: [
        { id: 'name', label: 'Full name / company name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Address / registered office', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Acting through (signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Supplier bank details (for invoicing)', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'services',
      title: 'The Services',
      fields: [
        {
          id: 'servicesDescription',
          label: 'Scope of Services',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 's.13 Supply of Goods and Services Act 1982 — service must be provided with reasonable care and skill',
          placeholder: 'Detailed scope of services, deliverables, key activities, exclusions…',
          validation: { minLength: 30 },
        },
      ],
    },
    {
      id: 'fees',
      title: 'Fees and payment',
      fields: [
        {
          id: 'feeType',
          label: 'Fee structure',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'fixed', label: 'Fixed fee' },
            { value: 'time-and-materials', label: 'Time and materials (hourly / daily rate)' },
            { value: 'milestone', label: 'Milestone payments' },
            { value: 'retainer', label: 'Monthly retainer' },
          ],
        },
        {
          id: 'fees',
          label: 'Fees (£, exclusive of VAT)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 0 },
        },
        {
          id: 'vatNote',
          label: 'VAT',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'plus-vat', label: 'Fees are exclusive of VAT (VAT charged in addition at the prevailing rate)' },
            { value: 'incl-vat', label: 'Fees are inclusive of VAT' },
            { value: 'no-vat', label: 'No VAT (Supplier not VAT-registered / zero-rated)' },
          ],
        },
        {
          id: 'paymentTerms',
          label: 'Payment terms',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: '14-days', label: '14 days from invoice date' },
            { value: '30-days', label: '30 days from invoice date' },
            { value: 'on-completion', label: 'In full on completion' },
            { value: 'milestones', label: 'On achievement of agreed milestones' },
          ],
        },
      ],
    },
    {
      id: 'term',
      title: 'Term',
      fields: [
        {
          id: 'startDate',
          label: 'Start date',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'termType',
          label: 'Term',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'project', label: 'For the duration of the project' },
            { value: 'fixed', label: 'Fixed term' },
            { value: 'rolling', label: 'Rolling term with notice to terminate' },
          ],
        },
        {
          id: 'endDate',
          label: 'End date',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'termType', value: 'fixed' },
        },
        {
          id: 'noticeToTerminate',
          label: 'Notice period to terminate (rolling term)',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: '30-days', label: '30 days written notice' },
            { value: '60-days', label: '60 days written notice' },
            { value: '90-days', label: '90 days written notice' },
          ],
          conditional: { fieldId: 'termType', value: 'rolling' },
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability and IP',
      fields: [
        {
          id: 'liabilityCap',
          label: 'Cap on liability',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Must be reasonable under UCTA 1977 (B2B). Liability for death/personal injury caused by negligence cannot be excluded.',
          options: [
            { value: 'fees-12-months', label: 'Fees paid in the 12 months preceding the claim' },
            { value: 'total-fees', label: 'Total fees paid under this agreement' },
            { value: 'specific-amount', label: 'A specific amount (to be specified by the parties)' },
          ],
          defaultValue: 'fees-12-months',
        },
        {
          id: 'ipOwnership',
          label: 'Ownership of deliverables',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'customer-on-payment', label: 'Customer owns the deliverables on full payment of the fees' },
            { value: 'customer-licence', label: 'Supplier retains ownership and grants Customer a licence to use the deliverables' },
            { value: 'supplier-retains', label: 'Supplier retains ownership of all IP' },
          ],
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
          id: 'additionalNotes',
          label: 'Additional terms',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Personal data processing (DPA), insurance, sub-contracting, change-control procedure, etc.',
        },
      ],
    },
  ],
}
