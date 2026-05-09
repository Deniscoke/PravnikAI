/**
 * Sale of Goods Agreement — England & Wales
 * Legal basis: Sale of Goods Act 1979 (B2B); Consumer Rights Act 2015 (B2C)
 * Category: Civil law
 */

import type { ContractSchema } from '../../types'

export const saleOfGoods: ContractSchema = {
  metadata: {
    schemaId: 'sale-of-goods-v1',
    contractFamily: 'sale',
    name: 'Sale of Goods Agreement',
    version: '1.0.0',
    jurisdiction: 'UK',
    currency: 'GBP',
    legalBasis: [
      'Sale of Goods Act 1979 (B2B sales)',
      'Consumer Rights Act 2015, Part 1 (B2C sales)',
      'Late Payment of Commercial Debts (Interest) Act 1998',
      'Unfair Contract Terms Act 1977 (B2B reasonableness)',
    ],
    sensitivity: 'standard',
    category: 'civil',
    description: 'Contract for the sale and transfer of property in goods for a money consideration.',
    outputStructure: {
      sections: [
        'Parties',
        'The Goods',
        'Price and payment',
        'Delivery',
        'Passing of title and risk',
        'Warranties and remedies',
        'Limitation of liability',
        'Boilerplate',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'The courts of England and Wales have exclusive jurisdiction',
    },
    aiInstructions:
      'Draft the Sale of Goods Agreement under English law (E&W). Apply the Sale of Goods Act 1979 for B2B sales and the Consumer Rights Act 2015 Part 1 for B2C.\n\n' +
      'MANDATORY CLAUSES:\n' +
      '1. Identification of seller and buyer (full names, registered offices, company numbers if companies)\n' +
      '2. Description of the Goods — quantity, type, specification, identifying numbers (s.13 SGA 1979)\n' +
      '3. Price — exclusive/inclusive of VAT; payment terms; currency; late-payment interest under LPCD(I)A 1998\n' +
      '4. Delivery — date, place, method, carriage and insurance allocation (Incoterms if international)\n' +
      '5. Passing of property and risk (Part III SGA 1979) — usually on delivery and payment\n' +
      '6. Warranties — satisfactory quality, fit for purpose, correspondence with description (s.14 SGA 1979 or Part 1 CRA 2015 for consumers)\n' +
      '7. Acceptance and rejection — buyer\'s right to reject (s.35 SGA 1979)\n' +
      '8. Limitation of liability — must satisfy UCTA 1977 reasonableness test (B2B) or CRA 2015 fairness test (B2C). Cap typically tied to contract value.\n' +
      '9. Termination — conditions, effects\n' +
      '10. Boilerplate — entire agreement, variation in writing, assignment, severance, governing law (E&W), exclusive jurisdiction, third-party rights excluded\n' +
      '11. Execution blocks (s.44 Companies Act 2006 wording for companies)\n\n' +
      'DRAFTING NOTES:\n' +
      '- For consumer sales (B2C) statutory rights as to quality, fitness and description CANNOT be excluded (s.31 CRA 2015)\n' +
      '- Liquidated damages must reflect a legitimate interest, not a penalty (Cavendish Square v Makdessi [2015] UKSC 67)\n' +
      '- Express the price in numerals with the £ symbol; in words only where this is the typical commercial practice\n' +
      '- Do not invent specific sums, dates, addresses or company numbers unless in the brief',
  },

  parties: [
    {
      id: 'seller',
      label: 'Seller',
      role: 'transfers the property in the Goods to the Buyer',
      requiredFields: [
        { id: 'name', label: 'Full name / company name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Address / registered office', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal', legalNote: 'Required where the seller is a UK company' },
        { id: 'representative', label: 'Acting through (signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'buyer',
      label: 'Buyer',
      role: 'acquires the property in the Goods for the price',
      requiredFields: [
        { id: 'name', label: 'Full name / company name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Address / registered office', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Acting through (signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'goods',
      title: 'The Goods',
      fields: [
        {
          id: 'subjectDescription',
          label: 'Description of the Goods',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 's.13 Sale of Goods Act 1979 — sale by description',
          placeholder: 'Quantity, type, model, serial numbers, specifications, condition…',
          validation: { minLength: 20 },
        },
        {
          id: 'subjectCondition',
          label: 'Condition',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'new', label: 'New' },
            { value: 'used-good', label: 'Used — good condition' },
            { value: 'used-as-is', label: 'Used — sold "as is" with known defects (B2B only)' },
          ],
        },
        {
          id: 'defectsDescription',
          label: 'Known defects',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'List of any known defects',
          conditional: { fieldId: 'subjectCondition', value: 'used-as-is' },
        },
      ],
    },
    {
      id: 'price',
      title: 'Price and payment',
      fields: [
        {
          id: 'price',
          label: 'Price (£)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 's.8 Sale of Goods Act 1979 — price',
          validation: { min: 0.01 },
        },
        {
          id: 'vatNote',
          label: 'VAT treatment',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'incl-vat', label: 'Inclusive of VAT at the prevailing rate' },
            { value: 'plus-vat', label: 'Exclusive of VAT (VAT charged in addition)' },
            { value: 'no-vat', label: 'Not VAT-rated (zero-rated / exempt / non-registered)' },
          ],
        },
        {
          id: 'paymentMethod',
          label: 'Payment method',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'cash-on-delivery', label: 'Cash / cleared funds on delivery' },
            { value: 'bacs', label: 'Bank transfer (BACS / Faster Payments)' },
            { value: 'invoice-30', label: 'Invoiced — 30 days from invoice date' },
            { value: 'instalments', label: 'Instalments' },
          ],
        },
        {
          id: 'paymentDeadline',
          label: 'Payment due date',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'paymentMethod', value: 'bacs' },
        },
        {
          id: 'bankAccount',
          label: 'Seller\'s bank account (sort code + account number or IBAN)',
          type: 'text',
          required: false,
          sensitivity: 'regulated',
          placeholder: 'e.g. 00-00-00 / 12345678',
          conditional: { fieldId: 'paymentMethod', value: 'bacs' },
        },
      ],
    },
    {
      id: 'delivery',
      title: 'Delivery and risk',
      fields: [
        {
          id: 'handoverDate',
          label: 'Delivery date',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: 's.29 Sale of Goods Act 1979 — rules about delivery',
        },
        {
          id: 'handoverPlace',
          label: 'Place of delivery',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Address / Incoterm where applicable',
        },
        {
          id: 'ownershipTransfer',
          label: 'Passing of property',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Part III Sale of Goods Act 1979',
          options: [
            { value: 'on-delivery', label: 'On delivery' },
            { value: 'on-payment', label: 'On payment in full (Romalpa retention of title)' },
            { value: 'on-execution', label: 'On execution of this agreement' },
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
          id: 'contractPlace',
          label: 'Place of execution',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'City',
        },
        {
          id: 'additionalNotes',
          label: 'Additional terms',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Special conditions, side letters, retention obligations, etc.',
        },
      ],
    },
  ],
}
