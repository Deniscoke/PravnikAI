/**
 * Employment Contract — England & Wales
 * Legal basis: Employment Rights Act 1996 (s.1 written statement particulars);
 *              National Minimum Wage Act 1998; Working Time Regulations 1998;
 *              Equality Act 2010; Pensions Act 2008 (auto-enrolment)
 * Category: Employment law
 */

import type { ContractSchema } from '../../types'

export const employmentContract: ContractSchema = {
  metadata: {
    schemaId: 'employment-contract-v1',
    contractFamily: 'employment',
    name: 'Employment Contract',
    version: '1.0.0',
    jurisdiction: 'UK',
    currency: 'GBP',
    legalBasis: [
      'Employment Rights Act 1996 (s.1 written statement)',
      'National Minimum Wage Act 1998 + National Living Wage Regulations',
      'Working Time Regulations 1998',
      'Equality Act 2010',
      'Pensions Act 2008 — auto-enrolment',
      'Health and Safety at Work etc. Act 1974',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description: 'Contract of employment satisfying the s.1 ERA 1996 written statement particulars.',
    outputStructure: {
      sections: [
        'Parties',
        'Commencement and continuous service',
        'Job title and duties',
        'Place of work',
        'Hours of work',
        'Pay and benefits',
        'Holiday entitlement',
        'Notice and termination',
        'Other terms',
        'Boilerplate',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'The Employment Tribunal and the courts of England and Wales',
    },
    aiInstructions:
      'Draft the contract of employment under English law (E&W). It must satisfy the s.1 Employment Rights Act 1996 written statement particulars on day one.\n\n' +
      'MANDATORY CLAUSES (s.1 ERA 1996):\n' +
      '1. Names of employer and employee\n' +
      '2. Date employment began and date continuous employment began\n' +
      '3. Job title and brief description of duties\n' +
      '4. Place of work (and any mobility provision)\n' +
      '5. Pay — amount, intervals, payment method (must meet National Minimum / Living Wage)\n' +
      '6. Hours of work (and any compulsory overtime, on-call provisions)\n' +
      '7. Holiday entitlement (statutory minimum 5.6 weeks under WTR 1998)\n' +
      '8. Sickness absence and sick pay (SSP minimum)\n' +
      '9. Pension auto-enrolment (Pensions Act 2008)\n' +
      '10. Probation period (length, performance review, notice during probation)\n' +
      '11. Notice periods — at least the s.86 ERA 1996 minimum (1 week per year of service after 2 years, capped at 12)\n' +
      '12. Restrictive covenants (only if reasonable in scope, time, geography — Mason v Provident)\n' +
      '13. Confidentiality and IP assignment\n' +
      '14. Disciplinary and grievance procedures (referenced)\n' +
      '15. Boilerplate — entire agreement, governing law (E&W), Tribunal jurisdiction\n' +
      '16. Execution blocks\n\n' +
      'DRAFTING NOTES:\n' +
      '- Pay must be at or above the relevant NMW / NLW band — never below\n' +
      '- Statutory rights cannot be excluded (ERA 1996, EQA 2010, WTR 1998)\n' +
      '- "Worker" status differs from "employee" — this template is for employees\n' +
      '- Restrictive covenants are unenforceable if they go beyond what is necessary to protect a legitimate business interest\n' +
      '- Do not invent specific salary figures or dates not in the brief',
  },

  parties: [
    {
      id: 'employer',
      label: 'Employer',
      role: 'employs the Employee and pays the agreed wages',
      requiredFields: [
        { id: 'name', label: 'Employer name (registered name if a company)', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Registered office / business address', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Company number (Companies House)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Acting through (HR contact / signatory)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'employee',
      label: 'Employee',
      role: 'performs the agreed work in exchange for wages',
      requiredFields: [
        { id: 'name', label: 'Full name', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Home address', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Date of birth', required: true, sensitivity: 'regulated' },
      ],
      optionalFields: [
        { id: 'email', label: 'Email', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Phone', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Bank details (sort code + account)', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'commencement',
      title: 'Commencement and term',
      fields: [
        {
          id: 'startDate',
          label: 'Start date',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: 's.1(3) ERA 1996',
        },
        {
          id: 'contractType',
          label: 'Contract type',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'permanent', label: 'Permanent (open-ended)' },
            { value: 'fixed-term', label: 'Fixed-term (Fixed-term Employees Regulations 2002)' },
          ],
        },
        {
          id: 'endDate',
          label: 'End date (fixed-term only)',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'contractType', value: 'fixed-term' },
        },
      ],
    },
    {
      id: 'duties',
      title: 'Duties and place of work',
      fields: [
        {
          id: 'jobTitle',
          label: 'Job title',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'e.g. Senior Software Engineer, Bookkeeper, Sales Associate',
        },
        {
          id: 'jobDescription',
          label: 'Brief description of duties',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          placeholder: 'Main responsibilities and reporting line',
          validation: { minLength: 20 },
        },
        {
          id: 'workplace',
          label: 'Place of work',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Office address (or "Remote — UK" / "Hybrid — [office address]")',
        },
      ],
    },
    {
      id: 'pay',
      title: 'Pay',
      fields: [
        {
          id: 'salary',
          label: 'Gross pay (£)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'Must be at or above the National Minimum / Living Wage for the employee\'s age band',
          validation: { min: 0 },
        },
        {
          id: 'salaryFrequency',
          label: 'Pay frequency',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'monthly', label: 'Monthly (annualised salary paid in 12 equal instalments)' },
            { value: 'hourly', label: 'Hourly rate' },
            { value: 'annual', label: 'Annual salary' },
          ],
        },
        {
          id: 'paymentDate',
          label: 'Pay day',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'e.g. "Last working day of the calendar month"',
        },
      ],
    },
    {
      id: 'hours',
      title: 'Hours and holiday',
      fields: [
        {
          id: 'weeklyHours',
          label: 'Weekly hours',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'Working Time Regulations 1998 — 48-hour weekly limit (opt-out possible in writing)',
          validation: { min: 1, max: 60 },
        },
        {
          id: 'vacationDays',
          label: 'Holiday entitlement (working days per year, including bank holidays)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'WTR 1998 minimum: 5.6 weeks (28 days for a 5-day-week employee, including bank holidays)',
          validation: { min: 28 },
        },
      ],
    },
    {
      id: 'termination',
      title: 'Probation and notice',
      fields: [
        {
          id: 'probationPeriod',
          label: 'Probation period',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'none', label: 'No probation period' },
            { value: '3-months', label: '3 months' },
            { value: '6-months', label: '6 months' },
          ],
        },
        {
          id: 'noticePeriod',
          label: 'Notice period (after probation)',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 's.86 ERA 1996 minimum: 1 week per full year of service after 2 years, max 12 weeks',
          options: [
            { value: 'statutory', label: 'Statutory minimum under s.86 ERA 1996' },
            { value: '1-month', label: '1 month' },
            { value: '3-months', label: '3 months' },
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
          id: 'collectiveAgreement',
          label: 'Applicable collective agreement (if any)',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'Name of any collective bargaining agreement that affects terms',
        },
        {
          id: 'additionalNotes',
          label: 'Additional terms',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Restrictive covenants, IP assignment, confidentiality, garden leave, etc.',
        },
      ],
    },
  ],
}
