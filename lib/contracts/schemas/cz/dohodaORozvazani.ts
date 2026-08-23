/**
 * Dohoda o rozvázání pracovního poměru
 * Právní základ: § 49 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * The whole form turns on one field. § 67 odst. 1 gives severance where the
 * employment ends by agreement "z týchž důvodů" as § 52 písm. a) až c), so the
 * organisational reason has to be recorded IN the agreement — otherwise the
 * employee is left proving it later against an employer with no reason to
 * help. Employers offer the blank version because it is cheaper, and it looks
 * identical to the employee signing it.
 *
 * So the form asks for the reason before anything else, and when an
 * organisational one is chosen it requires the severance multiple too.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const dohodaORozvazani: ContractSchema = {
  metadata: {
    schemaId: 'dohoda-o-rozvazani-v1',
    contractFamily: 'mutual-termination',
    documentKind: 'contract',
    name: 'Dohoda o rozvázání pracovního poměru',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 49 zák. č. 262/2006 Sb. — dohoda, písemná forma, vyhotovení pro každou stranu',
      '§ 52 písm. a) až c) ZP — organizační důvody',
      '§ 67 odst. 1 a 2 ZP — odstupné i při skončení dohodou z týchž důvodů',
      '§ 67 odst. 3 ZP — dvanáctinásobek jen při nejvyšší přípustné expozici',
      '§ 222 odst. 2 ZP — proplacení nevyčerpané dovolené',
      '§ 313 ZP — potvrzení o zaměstnání',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description:
      'Dohoda o rozvázání pracovního poměru podle zákoníku práce — s uvedením ' +
      'důvodu, na kterém závisí nárok na odstupné.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Označení ukončovaného pracovního poměru',
        'Den skončení a důvod',
        'Odstupné',
        'Vypořádání ke dni skončení',
        'Závěrečná ustanovení a podpisy',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj dohodu o rozvázání pracovního poměru dle § 49 zák. č. 262/2006 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Uveď konkrétní DEN skončení pracovního poměru. Dohodou končí poměr ' +
      'sjednaným dnem\n' +
      '- Je-li v zadání organizační důvod, MUSÍŠ jej v dohodě výslovně uvést ' +
      'včetně odkazu na § 52 písm. a), b) nebo c). Na tom závisí nárok na ' +
      'odstupné podle § 67 — bez uvedení jej zaměstnanec obtížně prokazuje\n' +
      '- NIKDY nepiš o výpovědní době. U dohody neběží; poměr končí sjednaným dnem\n' +
      '- Nepiš, že zaměstnanci náleží snížená podpora v nezaměstnanosti proto, ' +
      'že poměr skončil dohodou. Sazba se podle způsobu skončení neliší\n' +
      '- Dvanáctinásobné odstupné uveď jen při důvodu podle § 52 písm. e) — ' +
      'nejvyšší přípustná expozice. Nikdy u pracovního úrazu nebo nemoci z povolání\n' +
      '- Uveď, že dohoda je vyhotovena ve dvou stejnopisech, po jednom pro každou ' +
      'stranu (§ 49 odst. 3)\n' +
      '- Nevymýšlej důvod skončení ani výši odstupného. Chybí-li, použij placeholder\n' +
      '- Podpisy uveď u OBOU stran\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'zamestnavatel',
      label: 'Zaměstnavatel',
      role: 'strana, která zaměstnance zaměstnává',
      requiredFields: [
        { id: 'name', label: 'Název / jméno', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Sídlo', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zamestnanec',
      label: 'Zaměstnanec',
      role: 'strana, jejíž pracovní poměr končí',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'bankAccount', label: 'Číslo účtu pro výplatu', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'pomer',
      title: 'Ukončovaný pracovní poměr',
      fields: [
        {
          id: 'contractDate',
          label: 'Pracovní smlouva ze dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'jobTitle',
          label: 'Sjednaný druh práce',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. účetní',
          validation: { minLength: 2 },
        },
        {
          id: 'employmentStart',
          label: 'Pracovní poměr vznikl dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 67 odst. 1 ZP — délka trvání poměru určuje výši odstupného',
        },
        {
          id: 'endDate',
          label: 'Pracovní poměr končí dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 49 odst. 1 ZP — dohodou končí poměr sjednaným dnem, výpovědní doba neběží',
        },
      ],
    },
    {
      id: 'duvod',
      title: 'Důvod skončení',
      fields: [
        {
          id: 'reasonType',
          label: 'Z jakého důvodu poměr končí',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 67 ZP — odstupné náleží i při skončení dohodou, ale jen z důvodů ' +
            '§ 52 písm. a) až c). Není-li důvod v dohodě uveden, musí jej ' +
            'zaměstnanec později prokazovat sám.',
          options: [
            { value: 'organizacni-c', label: 'Nadbytečnost — § 52 písm. c)' },
            { value: 'organizacni-a', label: 'Zrušení zaměstnavatele nebo jeho části — § 52 písm. a)' },
            { value: 'organizacni-b', label: 'Přemístění zaměstnavatele nebo jeho části — § 52 písm. b)' },
            { value: 'expozice', label: 'Nejvyšší přípustná expozice — § 52 písm. e)' },
            { value: 'dohoda-stran', label: 'Jiný / oboustranná dohoda bez organizačního důvodu' },
          ],
          defaultValue: 'dohoda-stran',
        },
        {
          id: 'reasonFacts',
          label: 'Skutečnosti, které důvod naplňují',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: 'Popište, co se stalo — kdy padlo rozhodnutí o organizační změně',
          conditional: {
            fieldId: 'reasonType',
            value: ['organizacni-a', 'organizacni-b', 'organizacni-c', 'expozice'],
          },
          placeholder:
            'např. rozhodnutím jednatele ze dne 15. 9. 2026 o zrušení pozice se zaměstnanec stal nadbytečným',
        },
      ],
    },
    {
      id: 'odstupne',
      title: 'Odstupné',
      fields: [
        {
          id: 'severanceMultiple',
          label: 'Odstupné ve výši násobku průměrného výdělku',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 67 odst. 1 ZP — nejméně 1× do 1 roku trvání, 2× od 1 do 2 let, ' +
            '3× od 2 let. Do doby se započítá i předchozí poměr u téhož ' +
            'zaměstnavatele, byla-li mezi nimi přestávka do 6 měsíců.',
          conditional: {
            fieldId: 'reasonType',
            value: ['organizacni-a', 'organizacni-b', 'organizacni-c'],
          },
          options: [
            { value: '1', label: 'Jednonásobek — poměr trval méně než 1 rok' },
            { value: '2', label: 'Dvojnásobek — poměr trval 1 až 2 roky' },
            { value: '3', label: 'Trojnásobek — poměr trval alespoň 2 roky' },
            { value: 'vyssi', label: 'Vyšší než zákonné minimum' },
          ],
          defaultValue: '3',
        },
        {
          id: 'severanceAmount',
          label: 'Odstupné v Kč',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: 'Zákonné minimum je podlaha, ne cíl — vyšší odstupné lze sjednat',
          conditional: {
            fieldId: 'reasonType',
            value: ['organizacni-a', 'organizacni-b', 'organizacni-c', 'expozice'],
          },
          validation: { min: 0 },
        },
        {
          id: 'severanceDueDate',
          label: 'Odstupné bude vyplaceno',
          type: 'text',
          required: false,
          sensitivity: 'public',
          conditional: {
            fieldId: 'reasonType',
            value: ['organizacni-a', 'organizacni-b', 'organizacni-c', 'expozice'],
          },
          placeholder: 'např. ve výplatním termínu za měsíc říjen 2026',
        },
      ],
    },
    {
      id: 'vyporadani',
      title: 'Vypořádání ke dni skončení',
      fields: [
        {
          id: 'unusedVacationDays',
          label: 'Nevyčerpaná dovolená (dny)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 222 odst. 2 ZP — při skončení poměru se nevyčerpaná dovolená proplácí',
          validation: { min: 0, max: 200 },
        },
        {
          id: 'settlementNote',
          label: 'Vypořádání mzdy a svěřených věcí',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder:
            'např. mzda za říjen bude vyplacena ve výplatním termínu; notebook a klíče zaměstnanec vrátí do 31. 10. 2026',
        },
        {
          id: 'employmentCertificate',
          label: 'Uvést závazek vydat potvrzení o zaměstnání',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 313 ZP',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'agreementDate',
          label: 'Datum uzavření dohody',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
  ],
}
