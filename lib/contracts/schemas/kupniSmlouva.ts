/**
 * Kupní smlouva
 * Právní základ: § 2079–2183 zák. č. 89/2012 Sb. (NOZ)
 * Kategorie: Občanské právo
 */

import type { ContractSchema } from '../types'

export const kupniSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'kupni-smlouva-v1',
    name: 'Kupní smlouva',
    version: '1.0.0',
    jurisdiction: 'CZ',
    legalBasis: [
      '§ 2079–2183 zák. č. 89/2012 Sb., občanský zákoník (NOZ)',
      '§ 2085 NOZ — předmět koupě',
      '§ 2111 NOZ — přechod nebezpečí škody',
    ],
    sensitivity: 'standard',
    category: 'občanské',
    description: 'Smlouva o převodu vlastnického práva k věci za kupní cenu.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět koupě',
        'Kupní cena a způsob platby',
        'Předání věci',
        'Přechod vlastnického práva a nebezpečí škody',
        'Odpovědnost za vady',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Obecný soud dle místa bydliště/sídla žalovaného (CPC)',
    },
    aiInstructions:
      'Generuj kupní smlouvu výhradně dle § 2079–2183 NOZ. ' +
      'Uveď přesný popis předmětu koupě včetně identifikace. ' +
      'Sjednej přechod vlastnického práva k okamžiku zaplacení kupní ceny nebo předání (§ 1099 NOZ). ' +
      'Při vícenásobné splátce uveď harmonogram. ' +
      'Nezapomeň na ustanovení o odpovědnosti za vady dle § 2161–2174 NOZ.',
  },

  parties: [
    {
      id: 'prodavajici',
      label: 'Prodávající',
      role: 'převádí vlastnické právo k věci',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal', legalNote: 'Povinné pro podnikatele dle § 435 NOZ' },
        { id: 'representative', label: 'Zastoupený', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'kupujici',
      label: 'Kupující',
      role: 'nabývá vlastnické právo k věci za kupní cenu',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal', legalNote: 'Povinné pro podnikatele dle § 435 NOZ' },
        { id: 'representative', label: 'Zastoupený', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet',
      title: 'Předmět koupě',
      fields: [
        {
          id: 'subjectDescription',
          label: 'Popis předmětu koupě',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2085 NOZ — předmět musí být dostatečně určitý',
          placeholder: 'Přesný popis věci: typ, model, sériové číslo, stav apod.',
          validation: { minLength: 20 },
        },
        {
          id: 'subjectCondition',
          label: 'Stav předmětu',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'novy', label: 'Nový' },
            { value: 'pouzity-zachovaly', label: 'Použitý — zachovalý' },
            { value: 'pouzity-vadny', label: 'Použitý — s vadami (specifikujte níže)' },
          ],
        },
        {
          id: 'defectsDescription',
          label: 'Popis vad',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2161 NOZ — prodávající odpovídá za vady, které věc má při přechodu nebezpečí',
          placeholder: 'Popište známé vady předmětu koupě',
          conditional: { fieldId: 'subjectCondition', value: 'pouzity-vadny' },
        },
      ],
    },
    {
      id: 'cena',
      title: 'Kupní cena',
      fields: [
        {
          id: 'price',
          label: 'Kupní cena (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2080 NOZ — cena musí být ujednána nebo určitelná',
          validation: { min: 1 },
        },
        {
          id: 'vatNote',
          label: 'DPH',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'bez-dph', label: 'Cena bez DPH (nepodnikatel nebo osvobozeno)' },
            { value: 'vcetne-dph', label: 'Cena včetně DPH' },
            { value: 'plus-dph', label: 'Cena + DPH dle platné sazby' },
          ],
        },
        {
          id: 'paymentMethod',
          label: 'Způsob úhrady',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'hotove', label: 'Hotově při předání' },
            { value: 'prevod', label: 'Bankovním převodem' },
            { value: 'splatky', label: 'Ve splátkách' },
          ],
        },
        {
          id: 'paymentDeadline',
          label: 'Datum splatnosti',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 1958 NOZ — splatnost pohledávky',
          conditional: { fieldId: 'paymentMethod', value: 'prevod' },
        },
        {
          id: 'bankAccount',
          label: 'Číslo účtu prodávajícího',
          type: 'text',
          required: false,
          sensitivity: 'regulated',
          placeholder: 'IBAN nebo české číslo účtu/kód banky',
          conditional: { fieldId: 'paymentMethod', value: 'prevod' },
        },
      ],
    },
    {
      id: 'predani',
      title: 'Předání a přechod vlastnictví',
      fields: [
        {
          id: 'handoverDate',
          label: 'Datum předání',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2111 NOZ — nebezpečí škody přechází předáním věci kupujícímu',
        },
        {
          id: 'handoverPlace',
          label: 'Místo předání',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Adresa místa předání',
        },
        {
          id: 'ownershipTransfer',
          label: 'Přechod vlastnického práva',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1099 NOZ — vlastnické právo se nabývá účinností smlouvy, není-li dohodnuto jinak',
          options: [
            { value: 'predanim', label: 'Předáním věci' },
            { value: 'zaplacenim', label: 'Zaplacením kupní ceny' },
            { value: 'podpisem', label: 'Podpisem smlouvy' },
          ],
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
          id: 'contractPlace',
          label: 'Místo uzavření smlouvy',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'Město',
        },
        {
          id: 'additionalNotes',
          label: 'Zvláštní ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Další ujednání smluvních stran…',
        },
      ],
    },
  ],
}
