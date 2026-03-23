/**
 * Pracovní smlouva
 * Právní základ: § 33–73 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * Povinné náležitosti dle § 34 ZP:
 *   1. druh práce
 *   2. místo výkonu práce
 *   3. den nástupu do práce
 */

import type { ContractSchema } from '../types'

export const pracovniSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'pracovni-smlouva-v1',
    name: 'Pracovní smlouva',
    version: '1.0.0',
    jurisdiction: 'CZ',
    legalBasis: [
      '§ 33–73 zák. č. 262/2006 Sb., zákoník práce (ZP)',
      '§ 34 ZP — povinné náležitosti pracovní smlouvy',
      '§ 37 ZP — informační povinnost zaměstnavatele',
      '§ 48 ZP — skončení pracovního poměru',
    ],
    sensitivity: 'sensitive',
    category: 'pracovní',
    description: 'Pracovní smlouva zakládající pracovní poměr dle zákoníku práce.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Druh práce',
        'Místo výkonu práce',
        'Den nástupu do práce',
        'Mzda a odměňování',
        'Pracovní doba',
        'Dovolená',
        'Zkušební doba',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Příslušný soud dle místa výkonu práce (§ 12 OSŘ)',
    },
    aiInstructions:
      'Generuj pracovní smlouvu výhradně dle ZP č. 262/2006 Sb. ' +
      'Povinně uveď druh práce, místo výkonu práce a den nástupu (§ 34 ZP). ' +
      'Mzda nesmí být nižší než aktuální minimální mzda (§ 111 ZP). ' +
      'Zkušební doba nesmí přesáhnout 3 měsíce (6 měsíců u vedoucích zaměstnanců) dle § 35 ZP. ' +
      'Dovolená minimálně 4 týdny dle § 213 ZP. ' +
      'Nikdy nepoužívej slovenskou právní terminologii.',
  },

  parties: [
    {
      id: 'zamestnavatel',
      label: 'Zaměstnavatel',
      role: 'fyzická nebo právnická osoba, která zaměstnává zaměstnance',
      requiredFields: [
        { id: 'name', label: 'Obchodní firma / název', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal', legalNote: '§ 435 NOZ — podnikatel uvádí IČO' },
        { id: 'address', label: 'Sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zamestnanec',
      label: 'Zaměstnanec',
      role: 'fyzická osoba, která se zavazuje vykonávat závislou práci',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Trvalé bydliště', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Datum narození', required: true, sensitivity: 'regulated', legalNote: 'Rodné číslo — zvláštní kategorie, zpracování dle zák. č. 133/2000 Sb.' },
      ],
      optionalFields: [
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro výplatu mzdy', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'druh-prace',
      title: 'Druh práce',
      fields: [
        {
          id: 'jobTitle',
          label: 'Pracovní pozice / druh práce',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 34 odst. 1 písm. a) ZP — povinná náležitost',
          placeholder: 'např. Softwarový inženýr, Účetní, Obchodní zástupce',
          validation: { minLength: 3 },
        },
        {
          id: 'jobDescription',
          label: 'Náplň práce',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Podrobnější popis pracovních povinností…',
        },
      ],
    },
    {
      id: 'misto-prace',
      title: 'Místo výkonu práce',
      fields: [
        {
          id: 'workplaceAddress',
          label: 'Místo výkonu práce',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 34 odst. 1 písm. b) ZP — povinná náležitost',
          placeholder: 'Adresa pracoviště',
        },
        {
          id: 'remoteWork',
          label: 'Práce na dálku (home office)',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 317 ZP — výkon práce mimo pracoviště zaměstnavatele',
          options: [
            { value: 'ne', label: 'Práce pouze na pracovišti' },
            { value: 'castecne', label: 'Kombinovaný režim (hybridní)' },
            { value: 'plne', label: 'Plně na dálku' },
          ],
        },
      ],
    },
    {
      id: 'nastup',
      title: 'Nástup a délka pracovního poměru',
      fields: [
        {
          id: 'startDate',
          label: 'Den nástupu do práce',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 34 odst. 1 písm. c) ZP — povinná náležitost',
        },
        {
          id: 'employmentType',
          label: 'Druh pracovního poměru',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'dobu-neurcitou', label: 'Na dobu neurčitou' },
            { value: 'dobu-urcitou', label: 'Na dobu určitou' },
          ],
        },
        {
          id: 'endDate',
          label: 'Datum ukončení pracovního poměru',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 39 ZP — pracovní poměr na dobu určitou max. 3 roky, opakování max. 2×',
          conditional: { fieldId: 'employmentType', value: 'dobu-urcitou' },
        },
        {
          id: 'probationPeriod',
          label: 'Zkušební doba',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 35 ZP — max. 3 měsíce (6 měsíců pro vedoucí zaměstnance)',
          options: [
            { value: 'bez-zkusebni', label: 'Bez zkušební doby' },
            { value: '1-mesic', label: '1 měsíc' },
            { value: '2-mesice', label: '2 měsíce' },
            { value: '3-mesice', label: '3 měsíce' },
            { value: '6-mesicu', label: '6 měsíců (pouze vedoucí zaměstnanec)' },
          ],
        },
      ],
    },
    {
      id: 'mzda',
      title: 'Odměňování',
      fields: [
        {
          id: 'salaryAmount',
          label: 'Základní mzda / plat (Kč/měsíc)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          legalNote: '§ 113 ZP — mzda; min. mzda 2024: 18 900 Kč/měsíc',
          validation: { min: 18900 },
        },
        {
          id: 'salaryType',
          label: 'Typ odměňování',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'mesicni-mzda', label: 'Měsíční mzda' },
            { value: 'hodinova-mzda', label: 'Hodinová mzda' },
            { value: 'plat', label: 'Plat (státní/veřejný sektor)' },
          ],
        },
        {
          id: 'salaryPaymentDay',
          label: 'Den výplaty mzdy',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 141 ZP — mzda splatná v pravidelném termínu',
          placeholder: 'např. 15. den následujícího měsíce',
        },
      ],
    },
    {
      id: 'pracovni-doba',
      title: 'Pracovní doba a dovolená',
      fields: [
        {
          id: 'weeklyHours',
          label: 'Týdenní pracovní doba (hodiny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 79 ZP — délka pracovní doby max. 40 hodin týdně',
          validation: { min: 1, max: 40 },
          defaultValue: '40',
        },
        {
          id: 'vacationDays',
          label: 'Délka dovolené (týdny/rok)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 213 ZP — minimálně 4 týdny dovolené za rok',
          validation: { min: 4 },
          defaultValue: '4',
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Závěrečná ustanovení',
      fields: [
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
          placeholder: 'Benefity, mlčenlivost, pracovní pomůcky apod.',
        },
      ],
    },
  ],
}
