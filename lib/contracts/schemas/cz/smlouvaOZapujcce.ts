/**
 * Smlouva o zápůjčce
 * Právní základ: § 2390–2394 zák. č. 89/2012 Sb. (občanský zákoník)
 * Kategorie: Občanské právo
 *
 * A zápůjčka is a real contract — it exists once the money changes hands, not
 * once the paper is signed. The form therefore asks how and when the money was
 * or will be handed over, because that is the fact a court needs when the
 * borrower later denies receiving anything.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'
import { CASH_PAYMENT_LIMIT_CZK, formatCzk } from '@/lib/legal/czechLegalFacts'

export const smlouvaOZapujcce: ContractSchema = {
  metadata: {
    schemaId: 'smlouva-o-zapujcce-v1',
    contractFamily: 'loan',
    name: 'Smlouva o zápůjčce',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2390–2394 zák. č. 89/2012 Sb., občanský zákoník',
      '§ 2390 NOZ — zápůjčka vzniká přenecháním předmětu zápůjčky',
      '§ 2392 NOZ — úroky lze ujednat',
      '§ 2393 NOZ — doba vrácení',
      '§ 1970 NOZ — úrok z prodlení',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Smlouva o zápůjčce peněz nebo jiné zastupitelné věci podle občanského zákoníku — ' +
      'včetně ujednání o vrácení, úrocích a zajištění.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět zápůjčky',
        'Předání předmětu zápůjčky',
        'Vrácení zápůjčky',
        'Úroky',
        'Prodlení',
        'Zajištění',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Obecný soud vydlužitele (§ 84 a násl. OSŘ)',
    },
    aiInstructions:
      'Generuj smlouvu o zápůjčce dle § 2390–2394 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky na tento typ smlouvy najdeš v sekci „Právní požadavky" ' +
      'v zadání — projdi ji celou a řiď se jí.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Zápůjčka vzniká až předáním. Vždy uveď článek potvrzující předání ' +
      'peněz nebo popisující, jak a kdy budou poskytnuty — bez toho smlouva nic nedokazuje\n' +
      '- Používej pojmy „zapůjčitel" a „vydlužitel", nikoli „věřitel" a „dlužník"\n' +
      '- Nepiš „půjčka" ani „úvěr" — občanský zákoník zná zápůjčku (§ 2390) a úvěr (§ 2395) ' +
      'jako dva odlišné typy\n' +
      '- Částku uváděj číselně i slovy\n' +
      '- Nejsou-li úroky v zadání, smlouvu piš jako bezúročnou a neuváděj žádnou sazbu\n' +
      '- Nevymýšlej smluvní pokuty, zajištění ani sankce, které nejsou v zadání\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'zapujcitel',
      label: 'Zapůjčitel',
      role: 'osoba, která přenechává peníze nebo věc',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'vydluzitel',
      label: 'Vydlužitel',
      role: 'osoba, která se zavazuje zápůjčku vrátit',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet',
      title: 'Předmět zápůjčky',
      fields: [
        {
          id: 'amount',
          label: 'Výše zápůjčky (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          legalNote: '§ 2390 NOZ — předmět zápůjčky musí být určen',
          validation: { min: 1 },
        },
        {
          id: 'purpose',
          label: 'Účel zápůjčky',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. rekonstrukce bytu — účel není povinný',
        },
      ],
    },
    {
      id: 'predani',
      title: 'Předání zápůjčky',
      fields: [
        {
          id: 'handoverMethod',
          label: 'Způsob předání',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2390 NOZ — zápůjčka vzniká až přenecháním peněz. Bezhotovostní převod ' +
            'předání sám o sobě prokazuje.',
          options: [
            { value: 'prevod', label: 'Bezhotovostním převodem na účet' },
            { value: 'hotove', label: 'V hotovosti proti podpisu smlouvy' },
          ],
          defaultValue: 'prevod',
        },
        {
          id: 'handoverDate',
          label: 'Datum předání',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: 'Okamžik, kdy zápůjčka vznikla — klíčový údaj pro případný spor',
        },
        {
          id: 'cashWarning',
          label: 'Poznámka k hotovosti',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: `Platbu nad ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} za den nelze provést v hotovosti (${CASH_PAYMENT_LIMIT_CZK.law})`,
          conditional: { fieldId: 'handoverMethod', value: 'hotove' },
          options: [
            { value: 'potvrzeni', label: 'Smlouva slouží zároveň jako potvrzení o převzetí' },
            { value: 'samostatne', label: 'Bude vystaveno samostatné potvrzení o převzetí' },
          ],
          defaultValue: 'potvrzeni',
        },
      ],
    },
    {
      id: 'vraceni',
      title: 'Vrácení zápůjčky',
      fields: [
        {
          id: 'repaymentType',
          label: 'Způsob vrácení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'jednorazove', label: 'Jednorázově k určitému datu' },
            { value: 'splatky', label: 'Ve splátkách' },
          ],
          defaultValue: 'jednorazove',
        },
        {
          id: 'dueDate',
          label: 'Datum vrácení',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2393 NOZ — není-li doba vrácení ujednána, závisí splatnost na výpovědi',
          conditional: { fieldId: 'repaymentType', value: 'jednorazove' },
        },
        {
          id: 'installmentAmount',
          label: 'Výše jedné splátky (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          conditional: { fieldId: 'repaymentType', value: 'splatky' },
          validation: { min: 1 },
        },
        {
          id: 'installmentSchedule',
          label: 'Splatnost splátek',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. vždy k 15. dni v měsíci, počínaje 15. 10. 2026',
          conditional: { fieldId: 'repaymentType', value: 'splatky' },
        },
      ],
    },
    {
      id: 'uroky',
      title: 'Úroky',
      fields: [
        {
          id: 'interestType',
          label: 'Úročení zápůjčky',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2392 NOZ — zápůjčka je bezúročná, nejsou-li úroky ujednány',
          options: [
            { value: 'bezurocna', label: 'Bezúročná' },
            { value: 'urocena', label: 'Úročená' },
          ],
          defaultValue: 'bezurocna',
        },
        {
          id: 'interestRate',
          label: 'Roční úroková sazba (% p. a.)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 1796 NOZ — úrok v hrubém nepoměru k plnění je neplatný (lichva)',
          conditional: { fieldId: 'interestType', value: 'urocena' },
          validation: { min: 0, max: 100 },
        },
      ],
    },
    {
      id: 'zajisteni',
      title: 'Zajištění a závěrečná ustanovení',
      fields: [
        {
          id: 'security',
          label: 'Zajištění zápůjčky',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2018 a § 1309 NOZ — ručení, zástavní právo',
          options: [
            { value: 'zadne', label: 'Bez zajištění' },
            { value: 'ruceni', label: 'Ručení třetí osoby' },
            { value: 'zastava', label: 'Zástavní právo' },
          ],
          defaultValue: 'zadne',
        },
        {
          id: 'contractDate',
          label: 'Datum uzavření smlouvy',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'additionalNotes',
          label: 'Další ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Ztráta výhody splátek, předčasné splacení apod.',
        },
      ],
    },
  ],
}
