/**
 * Předžalobní výzva k plnění
 * Právní základ: § 142a zák. č. 99/1963 Sb. (občanský soudní řád)
 * Kategorie: Občanské právo
 *
 * The form exists to protect one thing: the seven-day gap between sending the
 * letter and filing the action, without which the creditor wins the case and
 * pays their own costs. So the period offered to the debtor defaults to
 * fourteen days and cannot be set below seven.
 *
 * It also refuses to invent an interest rate. The statutory rate depends on the
 * half-year in which the default began, so the form asks whether the rate is
 * known rather than letting the model produce a plausible percentage.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const predzalobniVyzva: ContractSchema = {
  metadata: {
    schemaId: 'predzalobni-vyzva-v1',
    contractFamily: 'pre-action-demand',
    documentKind: 'unilateral',
    name: 'Předžalobní výzva',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 142a zák. č. 99/1963 Sb., občanský soudní řád',
      '§ 142a odst. 1 OSŘ — výzva nejméně 7 dnů před podáním žaloby',
      '§ 143 OSŘ — náklady žalovaného, který nezavdal příčinu k žalobě',
      '§ 1968 a § 1970 NOZ — prodlení a úrok z prodlení',
      '§ 2 odst. 1 nař. vl. č. 351/2013 Sb. — repo sazba ČNB + 8 procentních bodů',
      '§ 3 nař. vl. č. 351/2013 Sb. — paušální náhrada 1 200 Kč mezi podnikateli',
      '§ 629 a § 648 NOZ — tříletá promlčecí lhůta a její stavění',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Předžalobní výzva k zaplacení dluhu podle § 142a OSŘ — podmínka práva ' +
      'na náhradu nákladů soudního řízení.',
    outputStructure: {
      sections: [
        'Označení věřitele a dlužníka',
        'Vymezení pohledávky',
        'Prodlení a příslušenství',
        'Výzva k plnění a lhůta',
        'Následky nezaplacení',
        'Datum, způsob odeslání a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj předžalobní výzvu k plnění dle § 142a zák. č. 99/1963 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- NIKDY neuváděj konkrétní procento úroku z prodlení, není-li v zadání. ' +
      'Zákonná sazba se odvíjí od repo sazby ČNB pro první den pololetí, v němž ' +
      'došlo k prodlení, zvýšené o 8 procentních bodů. Není-li sazba zadána, ' +
      'popiš tento vzorec nebo použij placeholder\n' +
      '- Nikdy nepočítej výši úroku ani celkovou dlužnou částku sám. Uveď jistinu ' +
      'ze zadání a příslušenství popiš slovně\n' +
      '- Lhůta k plnění nesmí být kratší než sedm dnů. Zdůrazni, že žaloba bude ' +
      'podána nejdříve po uplynutí lhůty\n' +
      '- Nepiš, že výzva staví nebo přerušuje promlčecí lhůtu — nestaví\n' +
      '- Nepiš, že bez výzvy nelze podat žalobu. Lze; jen zpravidla nevzniká ' +
      'právo na náhradu nákladů řízení\n' +
      '- NEVYHROŽUJ trestním oznámením, zveřejněním dlužníka ani exekucí bez ' +
      'exekučního titulu. Uveď jen podání žaloby a náklady řízení\n' +
      '- Nevymýšlej okolnosti vzniku dluhu ani čísla faktur. Chybí-li, použij ' +
      'placeholder\n' +
      '- Podpis uveď POUZE u věřitele\n' +
      '- Piš věcně a zdvořile. Výzva má být důkazem u soudu, ne emotivním dopisem\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'veritel',
      label: 'Věřitel',
      role: 'osoba, která pohledávku uplatňuje a výzvu podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro úhradu', required: true, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Zástupce (advokát)', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'dluznik',
      label: 'Dlužník',
      role: 'osoba, která má dluh uhradit — výzvu přijímá',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'pohledavka',
      title: 'Vymezení pohledávky',
      fields: [
        {
          id: 'debtOrigin',
          label: 'Z čeho dluh vznikl',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 142a odst. 1 OSŘ — pohledávka musí být určitě vymezena',
          placeholder:
            'např. na základě smlouvy o dílo ze dne 3. 3. 2026 jsem provedl a předal dílo, které nebylo uhrazeno',
          validation: { minLength: 10 },
        },
        {
          id: 'invoiceNumber',
          label: 'Číslo faktury nebo smlouvy',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. faktura č. 2026/114',
          validation: { minLength: 2 },
        },
        {
          id: 'principal',
          label: 'Jistina (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          validation: { min: 1 },
        },
        {
          id: 'dueDate',
          label: 'Datum splatnosti',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1968 NOZ — od tohoto dne je dlužník v prodlení',
        },
        {
          id: 'partialPayment',
          label: 'Dosud uhrazeno (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          validation: { min: 0 },
        },
      ],
    },
    {
      id: 'prislusenstvi',
      title: 'Úrok z prodlení a náklady',
      fields: [
        {
          id: 'claimInterest',
          label: 'Uplatnit úrok z prodlení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 1970 NOZ — náleží i bez smluvního ujednání, zákonná výše se považuje ' +
            'za ujednanou',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'interestRateKnown',
          label: 'Znáte konkrétní sazbu úroku z prodlení?',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            'Sazba = repo sazba ČNB pro první den pololetí, v němž došlo k prodlení, ' +
            '+ 8 procentních bodů. Nevíte-li ji, výzva popíše vzorec — nikdy ji ' +
            'neodhadujte.',
          conditional: { fieldId: 'claimInterest', value: 'ano' },
          options: [
            { value: 'ne', label: 'Ne — uveď zákonný vzorec' },
            { value: 'ano', label: 'Ano — mám ji ověřenou u ČNB' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'interestRate',
          label: 'Roční sazba úroku z prodlení (%)',
          type: 'text',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'interestRateKnown', value: 'ano' },
          placeholder: 'např. 11,75 % ročně (repo sazba k 1. 1. 2026 + 8 p. b.)',
        },
        {
          id: 'businessToBusiness',
          label: 'Jde o vzájemný závazek podnikatelů?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 3 nař. vl. č. 351/2013 Sb. — pak náleží i 1 200 Kč paušálních nákladů',
          options: [
            { value: 'ne', label: 'Ne' },
            { value: 'ano', label: 'Ano — obě strany jsou podnikatelé' },
          ],
          defaultValue: 'ne',
        },
      ],
    },
    {
      id: 'vyzva',
      title: 'Výzva a lhůta',
      fields: [
        {
          id: 'paymentDays',
          label: 'Lhůta k úhradě (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 142a odst. 1 OSŘ — výzva musí být odeslána nejméně 7 dnů před podáním ' +
            'žaloby. Kratší lhůta ohrožuje náhradu nákladů řízení.',
          validation: { min: 7, max: 90 },
          defaultValue: '14',
        },
        {
          id: 'variableSymbol',
          label: 'Variabilní symbol',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. 2026114',
        },
        {
          id: 'deliveryMethod',
          label: 'Způsob odeslání',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Splnění podmínky § 142a prokazuje věřitel — odeslání je třeba doložit',
          options: [
            { value: 'dorucenka', label: 'Doporučeně s dodejkou' },
            { value: 'datovka', label: 'Datovou schránkou' },
            { value: 'osobne', label: 'Osobně proti podpisu' },
            { value: 'email', label: 'E-mailem' },
          ],
          defaultValue: 'dorucenka',
        },
        {
          id: 'demandDate',
          label: 'Datum vyhotovení',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
  ],
}
