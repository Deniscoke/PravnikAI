/**
 * Nájemní smlouva na byt
 * Právní základ: § 2235–2301 zák. č. 89/2012 Sb. (NOZ)
 * Kategorie: Nemovitosti
 *
 * Speciální ochrana nájemce bytu — dispozitivní normy nájemního práva
 * (§ 2235 NOZ: nájemcem bytu musí být fyzická osoba).
 */

import type { ContractSchema } from '../types'

export const najemniSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'najemni-smlouva-byt-v1',
    name: 'Nájemní smlouva na byt',
    version: '1.0.0',
    jurisdiction: 'CZ',
    legalBasis: [
      '§ 2235–2301 zák. č. 89/2012 Sb., občanský zákoník (NOZ)',
      '§ 2236 NOZ — byt jako předmět nájmu',
      '§ 2254 NOZ — jistota (kauce) max. 3× měsíční nájemné',
      '§ 2285 NOZ — výpovědní doby',
    ],
    sensitivity: 'standard',
    category: 'nemovitosti',
    description: 'Nájemní smlouva na byt se zvláštní ochranou nájemce dle NOZ.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět nájmu',
        'Nájemné a platby',
        'Jistota (kauce)',
        'Práva a povinnosti pronajímatele',
        'Práva a povinnosti nájemce',
        'Doba trvání nájmu a výpověď',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Příslušný soud dle polohy nemovitosti (§ 89a OSŘ)',
    },
    aiInstructions:
      'Generuj nájemní smlouvu na byt dle § 2235–2301 NOZ. ' +
      'Jistota nesmí přesáhnout trojnásobek měsíčního nájemného (§ 2254 NOZ). ' +
      'Uveď způsob zvýšení nájemného (§ 2248–2253 NOZ). ' +
      'Pro nájmy na dobu neurčitou povinně uveď výpovědní důvody a lhůty (§ 2288–2291 NOZ). ' +
      'Nezapomeň na povinnosti při předání bytu (§ 2292 NOZ).',
  },

  parties: [
    {
      id: 'pronajimatele',
      label: 'Pronajímatel',
      role: 'vlastník bytu přenechávající byt k dočasnému užívání',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro nájemné', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'najemce',
      label: 'Nájemce',
      role: 'fyzická osoba užívající byt k zajištění bytové potřeby',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení', required: true, sensitivity: 'personal', legalNote: '§ 2235 NOZ — nájemcem bytu musí být fyzická osoba' },
        { id: 'address', label: 'Současná adresa bydliště', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet-najmu',
      title: 'Předmět nájmu',
      fields: [
        {
          id: 'apartmentAddress',
          label: 'Adresa bytu',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2236 NOZ — byt musí být dostatečně identifikován',
          placeholder: 'Ulice, č.p., město, PSČ',
        },
        {
          id: 'apartmentDescription',
          label: 'Popis bytu',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. 2+1, 3. patro, 65 m²',
        },
        {
          id: 'cadastralNumber',
          label: 'Katastrální číslo parcely / číslo jednotky',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 1158 NOZ — bytová jednotka v katastru nemovitostí',
          placeholder: 'např. č. jednotky 123/5',
        },
        {
          id: 'includedEquipment',
          label: 'Příslušenství a vybavení',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Sklep, parkovací místo, bílé spotřebiče apod.',
        },
      ],
    },
    {
      id: 'najemne',
      title: 'Nájemné a zálohy',
      fields: [
        {
          id: 'monthlyRent',
          label: 'Měsíční nájemné (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1 },
        },
        {
          id: 'serviceCharges',
          label: 'Zálohy na služby spojené s užíváním bytu (Kč/měsíc)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 9 zák. č. 67/2013 Sb. — vyúčtování služeb',
          validation: { min: 0 },
        },
        {
          id: 'rentPaymentDay',
          label: 'Den splatnosti nájemného',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2251 NOZ — nájemné placeno měsíčně předem',
          placeholder: 'např. do 5. dne každého měsíce',
          defaultValue: 'do 5. dne příslušného měsíce',
        },
        {
          id: 'rentIncreaseClause',
          label: 'Způsob zvyšování nájemného',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2248–2253 NOZ',
          options: [
            { value: 'bez-zvyseni', label: 'Bez sjednání zvyšování' },
            { value: 'indexace-cpi', label: 'Indexace dle CPI (index spotřebitelských cen)' },
            { value: 'dohodou', label: 'Dohodou stran' },
          ],
        },
      ],
    },
    {
      id: 'jistota',
      title: 'Jistota (kauce)',
      fields: [
        {
          id: 'depositAmount',
          label: 'Výše jistoty (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2254 NOZ — max. trojnásobek měsíčního nájemného',
          validation: { min: 0 },
        },
        {
          id: 'depositPaymentDate',
          label: 'Datum složení jistoty',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'depositAmount', value: '' },
        },
      ],
    },
    {
      id: 'doba-trvani',
      title: 'Doba trvání a ukončení nájmu',
      fields: [
        {
          id: 'leaseStartDate',
          label: 'Počátek nájmu',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'leaseDuration',
          label: 'Délka nájmu',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2285 NOZ — výpovědní doby závisí na délce trvání nájmu',
          options: [
            { value: 'neurcitodoba', label: 'Na dobu neurčitou' },
            { value: 'urcitodoba', label: 'Na dobu určitou' },
          ],
        },
        {
          id: 'leaseEndDate',
          label: 'Datum ukončení nájmu',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'leaseDuration', value: 'urcitodoba' },
        },
        {
          id: 'noticePeriodTenant',
          label: 'Výpovědní lhůta pro nájemce',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2281 NOZ — nájemce může vypovědět nájem bez udání důvodu s 3měsíční výpovědní dobou',
          options: [
            { value: '1-mesic', label: '1 měsíc' },
            { value: '2-mesice', label: '2 měsíce' },
            { value: '3-mesice', label: '3 měsíce (zákonné minimum)' },
          ],
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Závěrečná ustanovení',
      fields: [
        {
          id: 'petsAllowed',
          label: 'Chov zvířat',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2258 NOZ — nájemce může chovat zvíře, nezpůsobuje-li obtíže',
          options: [
            { value: 'povoleno', label: 'Povoleno' },
            { value: 'zakazano', label: 'Zakázáno' },
            { value: 'po-dohode', label: 'Pouze po předchozím souhlasu pronajímatele' },
          ],
        },
        {
          id: 'subleasingAllowed',
          label: 'Podnájem bytu',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2274 NOZ — podnájem vyžaduje souhlas pronajímatele',
          options: [
            { value: 'zakazano', label: 'Zakázáno bez souhlasu' },
            { value: 'povoleno', label: 'Povoleno' },
          ],
          defaultValue: 'zakazano',
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
          label: 'Zvláštní ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Stav bytu při předání, parkovací místo, klíče apod.',
        },
      ],
    },
  ],
}
