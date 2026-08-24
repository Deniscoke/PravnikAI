/**
 * Smlouva o smlouvě budoucí
 * Právní základ: § 1785–1788 zák. č. 89/2012 Sb.
 * Kategorie: Občanské právo
 *
 * The form is built around the deadline that kills these contracts silently.
 * § 1788 odst. 1: if the entitled party does not call the other one in time,
 * the duty to conclude simply expires — no breach, no notice, nothing to
 * appeal. So the call deadline is a required field rather than an optional
 * one, and the form says what the default is if it is left out.
 *
 * The other thing it insists on is enough content for § 1787 to work. A court
 * can determine the content of the future contract only from what the parties
 * agreed, so subject and price are essential here even though the future
 * contract has not been written yet.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const smlouvaOSmlouveBudouci: ContractSchema = {
  metadata: {
    schemaId: 'smlouva-o-smlouve-budouci-v1',
    contractFamily: 'preliminary-contract',
    documentKind: 'contract',
    name: 'Smlouva o smlouvě budoucí',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 1785 zák. č. 89/2012 Sb. — obsah ujednán alespoň obecným způsobem, lhůta jinak jeden rok',
      '§ 1786 NOZ — povinnost uzavřít bez zbytečného odkladu po výzvě',
      '§ 1787 NOZ — obsah budoucí smlouvy určí soud nebo určená osoba',
      '§ 1788 odst. 1 NOZ — nevyzve-li oprávněná strana včas, povinnost zaniká',
      '§ 1788 odst. 2 NOZ — změna okolností a oznamovací povinnost',
      '§ 2128 odst. 1 NOZ — písemná forma budoucí kupní smlouvy u nemovitosti',
      '§ 7 odst. 2 zák. č. 256/2013 Sb. — pravost podpisů pro vklad do katastru',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Smlouva o smlouvě budoucí podle občanského zákoníku — s lhůtou pro výzvu, ' +
      'bez níž závazek po roce zaniká.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět a obsah budoucí smlouvy',
        'Lhůta pro výzvu a uzavření',
        'Záloha a smluvní pokuta',
        'Změna okolností',
        'Závěrečná ustanovení a podpisy',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj smlouvu o smlouvě budoucí dle § 1785 a násl. zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Obsah budoucí smlouvy vymez co nejkonkrétněji — předmět, cenu a podstatné ' +
      'podmínky. Podle § 1787 může obsah určit soud, ale jen z toho, co strany ' +
      'ujednaly; vágní vymezení činí celý dokument nevymahatelným\n' +
      '- VŽDY uveď lhůtu pro výzvu k uzavření budoucí smlouvy a upozorni, že ' +
      'jejím marným uplynutím povinnost ZANIKÁ (§ 1788 odst. 1). Není-li lhůta ' +
      'ujednána, činí jeden rok\n' +
      '- Uveď ujednání o změně okolností a o povinnosti zavázané strany oznámit ji ' +
      'bez zbytečného odkladu, jinak nahradí škodu (§ 1788 odst. 2)\n' +
      '- Byla-li složena záloha, uveď VÝSLOVNĚ, co se s ní stane, nedojde-li ' +
      'k uzavření budoucí smlouvy, a rozliš podle toho, na čí straně je důvod\n' +
      '- Nepiš, že smlouva o smlouvě budoucí je neplatná bez písemné formy. § 560 ' +
      'na ni nedopadá — dopadá až na budoucí smlouvu o převodu nemovitosti\n' +
      '- Sjednáváš-li smluvní pokutu, uveď, zda se lze vedle ní domáhat i náhrady ' +
      'škody; bez toho ji podle § 2050 požadovat nelze\n' +
      '- Nevymýšlej údaje o nemovitosti ani ceny. Chybí-li, použij placeholder\n' +
      '- Podpisy uveď u OBOU stran\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'budouci-prvni',
      label: 'Budoucí prodávající / pronajímatel',
      role: 'strana, která se zavazuje předmět v budoucnu převést nebo přenechat',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'budouci-druhy',
      label: 'Budoucí kupující / nájemce',
      role: 'strana, která předmět v budoucnu nabude nebo bude užívat',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'budouci',
      title: 'Budoucí smlouva',
      fields: [
        {
          id: 'futureContractType',
          label: 'Jakou smlouvu se strany zavazují uzavřít',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'kupni-nemovitost', label: 'Kupní smlouva na nemovitost' },
            { value: 'kupni-vec', label: 'Kupní smlouva na movitou věc' },
            { value: 'najemni', label: 'Nájemní smlouva' },
            { value: 'jina', label: 'Jiná smlouva' },
          ],
          defaultValue: 'kupni-nemovitost',
        },
        {
          id: 'subject',
          label: 'Předmět budoucí smlouvy',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'U nemovitosti uveďte údaje z katastru — číslo jednotky nebo parcely, ' +
            'katastrální území a list vlastnictví',
          placeholder:
            'např. bytová jednotka č. 12/3 v budově č. p. 12, k. ú. Vinohrady, LV 4521, včetně podílu na společných částech',
          validation: { minLength: 10 },
        },
        {
          id: 'price',
          label: 'Cena (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote:
            '§ 1787 odst. 2 NOZ — bez ceny nebo způsobu jejího určení nelze obsah ' +
            'budoucí smlouvy určit',
          validation: { min: 0 },
        },
        {
          id: 'priceMechanism',
          label: 'Způsob určení ceny, není-li známa pevná částka',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. podle znaleckého posudku vyhotoveného ke dni výzvy',
        },
        {
          id: 'essentialTerms',
          label: 'Další podstatné podmínky budoucí smlouvy',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: 'Čím konkrétnější, tím lépe soud podle § 1787 obsah určí',
          placeholder:
            'např. termín předání, způsob úhrady přes advokátní úschovu, stav bez zástavních práv',
        },
        {
          id: 'boundParty',
          label: 'Kdo se zavazuje uzavřít budoucí smlouvu',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1785 NOZ — zavázat se může i jen jedna strana, musí to však být zřejmé',
          options: [
            { value: 'obe', label: 'Obě strany' },
            { value: 'prvni', label: 'Jen budoucí prodávající / pronajímatel' },
            { value: 'druhy', label: 'Jen budoucí kupující / nájemce' },
          ],
          defaultValue: 'obe',
        },
      ],
    },
    {
      id: 'lhuty',
      title: 'Lhůta pro výzvu a uzavření',
      fields: [
        {
          id: 'callDeadline',
          label: 'Do kdy musí být podána výzva k uzavření',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 1788 odst. 1 NOZ — nevyzve-li oprávněná strana včas, povinnost ' +
            'uzavřít budoucí smlouvu ZANIKÁ. Není-li lhůta ujednána, činí jeden rok.',
        },
        {
          id: 'daysToConclude',
          label: 'Lhůta k uzavření po doručení výzvy (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1786 NOZ — zákon říká „bez zbytečného odkladu"; konkrétní lhůta spor předchází',
          validation: { min: 1, max: 180 },
          defaultValue: '30',
        },
        {
          id: 'callMethod',
          label: 'Způsob doručení výzvy',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Včasnost výzvy se v případném sporu prokazuje',
          options: [
            { value: 'dorucenka', label: 'Doporučeně s dodejkou' },
            { value: 'datovka', label: 'Datovou schránkou' },
            { value: 'email', label: 'E-mailem na adresu uvedenou ve smlouvě' },
          ],
          defaultValue: 'dorucenka',
        },
      ],
    },
    {
      id: 'penize',
      title: 'Záloha a smluvní pokuta',
      fields: [
        {
          id: 'depositPaid',
          label: 'Byla složena záloha nebo rezervační poplatek?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'ne', label: 'Ne' },
            { value: 'ano', label: 'Ano' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'depositAmount',
          label: 'Výše zálohy (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          conditional: { fieldId: 'depositPaid', value: 'ano' },
          validation: { min: 0 },
        },
        {
          id: 'depositFate',
          label: 'Co se se zálohou stane, nedojde-li k uzavření smlouvy',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: 'Rozlište podle toho, na čí straně důvod neuzavření leží',
          conditional: { fieldId: 'depositPaid', value: 'ano' },
          placeholder:
            'např. z důvodu na straně budoucího prodávajícího se záloha vrací v dvojnásobné výši; z důvodu na straně kupujícího propadá',
        },
        {
          id: 'penalty',
          label: 'Smluvní pokuta za neuzavření budoucí smlouvy (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: '§ 2051 NOZ — nepřiměřeně vysokou pokutu může soud na návrh snížit',
          validation: { min: 0 },
        },
        {
          id: 'damagesBesidePenalty',
          label: 'Lze vedle smluvní pokuty požadovat i náhradu škody?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2050 NOZ — bez výslovného ujednání náhradu škody vedle pokuty požadovat nelze',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'okolnosti',
      title: 'Změna okolností a závěr',
      fields: [
        {
          id: 'changeOfCircumstances',
          label: 'Zařadit ujednání o změně okolností a oznamovací povinnosti',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 1788 odst. 2 NOZ — neoznámí-li zavázaná strana změnu bez zbytečného ' +
            'odkladu, nahradí škodu',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'verifiedSignatures',
          label: 'Úředně ověřené podpisy na budoucí smlouvě',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 7 odst. 2 zák. č. 256/2013 Sb. — nejsou-li podpisy ověřeny, musí ' +
            'navrhovatel prokázat jejich pravost do 30 dnů, jinak katastrální úřad ' +
            'řízení zastaví',
          conditional: { fieldId: 'futureContractType', value: 'kupni-nemovitost' },
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'signatureDate',
          label: 'Datum uzavření smlouvy',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
  ],
}
