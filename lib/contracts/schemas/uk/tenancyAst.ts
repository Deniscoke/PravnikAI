/**
 * Assured Shorthold Tenancy (AST) — England (residential)
 * Legal basis: Housing Act 1988 (as amended by Housing Act 1996); Tenant Fees Act 2019;
 *              Landlord and Tenant Act 1985 (s.11 repair obligations); Deregulation Act 2015
 * Category: Real estate
 *
 * Note: This is the standard tenancy for residential lettings in England.
 * Wales has its own regime under the Renting Homes (Wales) Act 2016 — for Welsh
 * properties a different schema is required (not yet implemented).
 */

import type { ContractSchema } from '../../types'

export const tenancyAst: ContractSchema = {
  metadata: {
    schemaId: 'tenancy-ast-v1',
    contractFamily: 'tenancy',
    name: 'Assured Shorthold Tenancy (AST)',
    version: '1.0.0',
    jurisdiction: 'UK',
    currency: 'GBP',
    legalBasis: [
      'Housing Act 1988 (Part 1, Chapter II — Assured Shorthold Tenancies)',
      'Housing Act 2004 (tenancy deposit protection schemes)',
      'Landlord and Tenant Act 1985, s.11 (repair obligations)',
      'Deregulation Act 2015',
      'Tenant Fees Act 2019',
      'Homes (Fitness for Human Habitation) Act 2018',
    ],
    sensitivity: 'standard',
    category: 'realestate',
    description: 'Assured Shorthold Tenancy for residential property in England (Housing Act 1988).',
    outputStructure: {
      sections: [
        'Parties',
        'The Property',
        'Term and rent',
        'Tenancy deposit',
        'Tenant\'s obligations',
        'Landlord\'s obligations',
        'Termination',
        'Boilerplate',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'The County Court for the area in which the Property is situated',
    },
    aiInstructions:
      'Draft an Assured Shorthold Tenancy under the Housing Act 1988 for residential property in England.\n\n' +
      'MANDATORY CLAUSES:\n' +
      '1. Identification of landlord and tenant (full names, addresses)\n' +
      '2. Description of the Property — full address, any included furniture (separate inventory)\n' +
      '3. Term — fixed-term length (typically 6 or 12 months) and statutory periodic continuation\n' +
      '4. Rent — amount, payment frequency, payment method, due date\n' +
      '5. Tenancy deposit — amount (capped at 5 weeks\' rent for rent < £50k pa under Tenant Fees Act 2019), name of authorised deposit-protection scheme (DPS / TDS / mydeposits) within 30 days\n' +
      '6. Tenant\'s repairing obligations (must not transfer Landlord\'s s.11 LTA 1985 obligations)\n' +
      '7. Landlord\'s repairing obligations (s.11 LTA 1985 — structure, exterior, installations for water/gas/electricity/sanitation/heating)\n' +
      '8. Right of access — 24 hours\' written notice except in emergency (s.11(6) LTA 1985)\n' +
      '9. Termination — s.21 (no-fault, after fixed term) and s.8 (grounds-based) notices under Housing Act 1988\n' +
      '10. Permitted payments only (Tenant Fees Act 2019 — no admin fees, etc.)\n' +
      '11. Energy Performance Certificate, Gas Safety Record, How to Rent guide referenced (prerequisites for valid s.21 notice)\n' +
      '12. Boilerplate — Joint and several liability if more than one tenant, governing law (England), County Court jurisdiction\n' +
      '13. Execution blocks\n\n' +
      'DRAFTING NOTES:\n' +
      '- Deposit must be protected within 30 days or s.21 notice cannot be served\n' +
      '- Prescribed information must be served on the tenant\n' +
      '- Permitted payments under Tenant Fees Act 2019 are: rent, refundable tenancy deposit (max 5 weeks), refundable holding deposit (max 1 week), default fees in the tenancy agreement\n' +
      '- Do not invent specific addresses, rent figures or names not in the brief',
  },

  parties: [
    {
      id: 'landlord',
      label: 'Landlord',
      role: 'grants the tenancy of the Property',
      requiredFields: [
        { id: 'name', label: 'Landlord full name (or registered company name)', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Landlord address for service in England or Wales', required: true, sensitivity: 'personal', legalNote: 's.48 Landlord and Tenant Act 1987 — required' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Letting agent acting on behalf', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Rent payment details (sort code + account)', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'tenant',
      label: 'Tenant',
      role: 'takes the tenancy of the Property and pays the rent',
      requiredFields: [
        { id: 'name', label: 'Tenant full name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Current address', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Date of birth', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'property',
      title: 'The Property',
      fields: [
        {
          id: 'propertyAddress',
          label: 'Address of the Property',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Full address of the residential property',
        },
        {
          id: 'propertyType',
          label: 'Property type',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'flat', label: 'Flat / apartment' },
            { value: 'house', label: 'House' },
            { value: 'studio', label: 'Studio' },
            { value: 'room', label: 'Room in shared house (HMO)' },
          ],
        },
        {
          id: 'furnished',
          label: 'Furnished?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'furnished', label: 'Furnished (inventory attached)' },
            { value: 'part-furnished', label: 'Part-furnished' },
            { value: 'unfurnished', label: 'Unfurnished' },
          ],
        },
      ],
    },
    {
      id: 'term-rent',
      title: 'Term and rent',
      fields: [
        {
          id: 'startDate',
          label: 'Tenancy start date',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'fixedTermLength',
          label: 'Fixed term',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: '6-months', label: '6 months' },
            { value: '12-months', label: '12 months' },
            { value: '24-months', label: '24 months' },
          ],
          defaultValue: '12-months',
        },
        {
          id: 'rent',
          label: 'Rent (£ per calendar month)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1 },
        },
        {
          id: 'paymentDay',
          label: 'Rent due date each month',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'e.g. "1st of each calendar month" or "Same day of the month as the start date"',
        },
      ],
    },
    {
      id: 'deposit',
      title: 'Tenancy deposit',
      fields: [
        {
          id: 'depositAmount',
          label: 'Deposit (£)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: 'Tenant Fees Act 2019: capped at 5 weeks\' rent for annual rent below £50,000',
          validation: { min: 0 },
        },
        {
          id: 'depositScheme',
          label: 'Authorised tenancy deposit protection scheme',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: 'Housing Act 2004 — deposit must be protected within 30 days',
          options: [
            { value: 'dps', label: 'Deposit Protection Service (DPS)' },
            { value: 'tds', label: 'Tenancy Deposit Scheme (TDS)' },
            { value: 'mydeposits', label: 'mydeposits' },
          ],
        },
      ],
    },
    {
      id: 'boilerplate',
      title: 'Other terms',
      fields: [
        {
          id: 'contractDate',
          label: 'Date of execution',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'pets',
          label: 'Pets',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'allowed', label: 'Permitted (with reasonable conditions)' },
            { value: 'prior-consent', label: 'Permitted only with the Landlord\'s prior written consent (consent not to be unreasonably withheld)' },
            { value: 'not-allowed', label: 'Not permitted' },
          ],
        },
        {
          id: 'additionalNotes',
          label: 'Additional terms',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Smoking, subletting, garden maintenance, council-tax responsibility, utilities arrangements, etc.',
        },
      ],
    },
  ],
}
