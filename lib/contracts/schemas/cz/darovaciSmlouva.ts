/**
 * Darovací smlouva
 * Právní základ: § 2055–2078 zák. č. 89/2012 Sb. (občanský zákoník)
 * Kategorie: Občanské právo
 *
 * The form branches on what is being given, because the law does. A movable
 * handed over on the spot needs no writing; a promise to give later, or
 * anything entered in the land register, does. The subject type therefore
 * drives which fields appear.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const darovaciSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'darovaci-smlouva-v1',
    contractFamily: 'gift',
    name: 'Darovací smlouva',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2055–2078 zák. č. 89/2012 Sb., občanský zákoník',
      '§ 2055 NOZ — bezplatný převod vlastnického práva',
      '§ 2057 NOZ — písemná forma',
      '§ 2065 NOZ — odpovědnost dárce za vady',
      '§ 2068 a § 2072 NOZ — odvolání daru',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Darovací smlouva podle občanského zákoníku — bezplatný převod nemovitosti, ' +
      'vozidla, peněz nebo jiné věci.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět daru',
        'Prohlášení dárce',
        'Přijetí daru',
        'Předání daru',
        'Odvolání daru',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Obecný soud obdarovaného (§ 84 a násl. OSŘ)',
    },
    aiInstructions:
      'Generuj darovací smlouvu dle § 2055–2078 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky na tento typ smlouvy najdeš v sekci „Právní požadavky" ' +
      'v zadání — projdi ji celou a řiď se jí.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Vždy výslovně uveď, že se dar převádí BEZPLATNĚ, a že obdarovaný dar PŘIJÍMÁ. ' +
      'Bez obojího nejde o darovací smlouvu\n' +
      '- Nikdy nevkládej protiplnění, doplatek ani závazek obdarovaného něco poskytnout — ' +
      'tím by darování přestalo být darováním\n' +
      '- Nepiš, že darování je neodvolatelné. Dárce může dar odvolat pro nouzi (§ 2068) ' +
      'i pro nevděk (§ 2072) a těchto práv se nelze předem vzdát\n' +
      '- U nemovitosti uveď, že vlastnické právo přechází až vkladem do katastru, ' +
      'nikoli podpisem smlouvy\n' +
      '- Neuváděj konkrétní daňové závěry jako jistotu — zmiň jen, že bezúplatný příjem ' +
      'se posuzuje podle zákona o daních z příjmů\n' +
      '- Hodnotu daru uváděj číselně i slovy\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'darce',
      label: 'Dárce',
      role: 'osoba, která bezplatně převádí vlastnické právo',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'obdarovany',
      label: 'Obdarovaný',
      role: 'osoba, která dar přijímá',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet-daru',
      title: 'Předmět daru',
      fields: [
        {
          id: 'giftType',
          label: 'Co darujete',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2057 NOZ — u věci zapsané do veřejného seznamu je nutná písemná forma',
          options: [
            { value: 'penize', label: 'Peníze' },
            { value: 'movitá', label: 'Movitá věc' },
            { value: 'vozidlo', label: 'Vozidlo' },
            { value: 'nemovitost', label: 'Nemovitost' },
          ],
          defaultValue: 'penize',
        },
        {
          id: 'giftDescription',
          label: 'Popis daru',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'U nemovitosti uveď obec, katastrální území, číslo parcely nebo jednotky a list ' +
            'vlastnictví; u vozidla VIN, SPZ, značku a rok výroby',
          placeholder: 'Přesné určení daru…',
          validation: { minLength: 3 },
        },
        {
          id: 'giftValue',
          label: 'Hodnota daru (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: 'Údaj je vhodný pro daňové posouzení bezúplatného příjmu',
          validation: { min: 0 },
        },
        {
          id: 'knownDefects',
          label: 'Známé vady daru',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2065 NOZ — dárce odpovídá za vady, o nichž věděl a neupozornil na ně',
          placeholder: 'Vady, na které dárce obdarovaného upozorňuje…',
        },
      ],
    },
    {
      id: 'vztah-stran',
      title: 'Vztah stran a daňové posouzení',
      fields: [
        {
          id: 'relationship',
          label: 'Vztah dárce a obdarovaného',
          type: 'select',
          required: false,
          sensitivity: 'personal',
          legalNote:
            '§ 10 odst. 3 zák. č. 586/1992 Sb. — příbuzní v linii přímé a vyjmenovaní ' +
            'příbuzní v linii vedlejší jsou od daně z příjmů osvobozeni',
          options: [
            { value: 'prima', label: 'Příbuzní v linii přímé (rodič, dítě, prarodič)' },
            { value: 'vedlejsi', label: 'Sourozenec, teta, strýc, synovec, neteř' },
            { value: 'manzel', label: 'Manžel / manželka' },
            { value: 'jiny', label: 'Jiný vztah' },
          ],
        },
        {
          id: 'spouseConsent',
          label: 'Dar patří do společného jmění manželů',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 714 NOZ — k darování nad rámec běžné záležitosti je třeba souhlas druhého manžela',
          options: [
            { value: 'ne', label: 'Ne, dar je ve výlučném vlastnictví dárce' },
            { value: 'ano', label: 'Ano — druhý manžel s darováním souhlasí' },
          ],
          defaultValue: 'ne',
        },
      ],
    },
    {
      id: 'predani',
      title: 'Předání daru',
      fields: [
        {
          id: 'handoverTiming',
          label: 'Kdy se dar předává',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2057 NOZ — nedojde-li k odevzdání současně s projevem vůle, je nutná písemná forma',
          options: [
            { value: 'ihned', label: 'Při podpisu smlouvy' },
            { value: 'pozdeji', label: 'Později (slib darování)' },
          ],
          defaultValue: 'ihned',
        },
        {
          id: 'handoverDate',
          label: 'Datum předání',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'handoverTiming', value: 'pozdeji' },
        },
        {
          id: 'cadastreFiling',
          label: 'Návrh na vklad do katastru podá',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 1105 NOZ — u nemovitosti přechází vlastnictví až vkladem',
          conditional: { fieldId: 'giftType', value: 'nemovitost' },
          options: [
            { value: 'darce', label: 'Dárce' },
            { value: 'obdarovany', label: 'Obdarovaný' },
            { value: 'spolecne', label: 'Obě strany společně' },
          ],
          defaultValue: 'obdarovany',
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
          placeholder: 'Např. výhrada práva zpětné koupě, věcné břemeno dožití…',
        },
      ],
    },
  ],
}
