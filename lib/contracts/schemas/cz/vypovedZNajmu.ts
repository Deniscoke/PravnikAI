/**
 * Výpověď z nájmu bytu
 * Právní základ: § 2286–2296 zák. č. 89/2012 Sb. (občanský zákoník)
 * Kategorie: Nemovitosti
 *
 * One schema rather than two, because this is a single legal act whose
 * requirements branch on who performs it. A landlord must state a statutory
 * ground and must instruct the tenant about their right to object — omit that
 * sentence and the whole notice is void under § 2286 odst. 2. A tenant on an
 * open-ended lease needs neither.
 *
 * documentKind: 'unilateral' — one side acts, the other only receives, and the
 * contract-shaped drafting instructions are overridden accordingly.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const vypovedZNajmu: ContractSchema = {
  metadata: {
    schemaId: 'vypoved-z-najmu-bytu-v1',
    contractFamily: 'tenancy-notice',
    documentKind: 'unilateral',
    name: 'Výpověď z nájmu bytu',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2286–2296 zák. č. 89/2012 Sb., občanský zákoník',
      '§ 2286 odst. 1 NOZ — písemná forma, doručení, běh výpovědní doby',
      '§ 2286 odst. 2 NOZ — poučení nájemce o právu vznést námitky',
      '§ 2287 NOZ — výpověď nájemcem',
      '§ 2288 NOZ — výpovědní důvody pronajímatele',
      '§ 2291 NOZ — výpověď bez výpovědní doby',
    ],
    sensitivity: 'sensitive',
    category: 'realestate',
    description:
      'Výpověď nájmu bytu — jednostranné ukončení nájmu pronajímatelem nebo nájemcem ' +
      'podle občanského zákoníku.',
    outputStructure: {
      sections: [
        'Označení adresáta a vypovídající strany',
        'Označení nájemní smlouvy a bytu',
        'Výpověď',
        'Výpovědní důvod',
        'Poučení o právu vznést námitky',
        'Výpovědní doba a předání bytu',
        'Datum a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj výpověď z nájmu bytu dle § 2286–2296 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Dává-li výpověď PRONAJÍMATEL, MUSÍŠ uvést výpovědní důvod a poučení nájemce ' +
      'o právu vznést proti výpovědi námitky a navrhnout přezkoumání její oprávněnosti ' +
      'soudem. Bez tohoto poučení je výpověď podle § 2286 odst. 2 NEPLATNÁ — je to ' +
      'nejdůležitější věta celého dokumentu\n' +
      '- Dává-li výpověď NÁJEMCE u nájmu na dobu neurčitou, důvod ani poučení neuváděj — ' +
      'zákon je ukládá pouze pronajímateli\n' +
      '- Výpovědní doba u nájmu běží od prvního dne kalendářního měsíce následujícího ' +
      'po doručení výpovědi. Nepiš, že běží ode dne doručení — to je úprava pracovního ' +
      'poměru, nikoli nájmu\n' +
      '- Uveď způsob doručení. Účinky výpovědi nastávají dojitím druhé straně\n' +
      '- Podpis uveď POUZE u vypovídající strany. Adresát výpověď nepodepisuje\n' +
      '- Nevymýšlej výpovědní důvod. Není-li v zadání, použij placeholder\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'vypovidajici',
      label: 'Vypovídající strana',
      role: 'osoba, která nájem vypovídá a dokument podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u právnické osoby)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'adresat',
      label: 'Adresát výpovědi',
      role: 'druhá strana nájemní smlouvy — výpověď přijímá, nepodepisuje ji',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'kdo-vypovida',
      title: 'Kdo výpověď dává',
      fields: [
        {
          id: 'noticeGiver',
          label: 'Výpověď dává',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2286 odst. 2 NOZ — pronajímatel musí uvést důvod a poučit nájemce ' +
            'o právu vznést námitky, jinak je výpověď neplatná',
          options: [
            { value: 'najemce', label: 'Nájemce' },
            { value: 'pronajimatel', label: 'Pronajímatel' },
          ],
          defaultValue: 'najemce',
        },
        {
          id: 'leaseTerm',
          label: 'Nájem byl sjednán na',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2287 NOZ — nájemce může nájem na dobu určitou vypovědět jen při změně okolností',
          options: [
            { value: 'neurcitou', label: 'Dobu neurčitou' },
            { value: 'urcitou', label: 'Dobu určitou' },
          ],
          defaultValue: 'neurcitou',
        },
      ],
    },
    {
      id: 'najem',
      title: 'Vypovídaná nájemní smlouva',
      fields: [
        {
          id: 'apartment',
          label: 'Označení bytu',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. byt č. 4, Dlouhá 12, 110 00 Praha 1',
          validation: { minLength: 3 },
        },
        {
          id: 'leaseDate',
          label: 'Nájemní smlouva ze dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
    {
      id: 'duvod',
      title: 'Výpovědní důvod',
      fields: [
        {
          id: 'landlordGround',
          label: 'Zákonný výpovědní důvod',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2288 NOZ — nájem bytu nelze vypovědět bez uvedení důvodu',
          conditional: { fieldId: 'noticeGiver', value: 'pronajimatel' },
          options: [
            { value: 'hrube-poruseni', label: 'Hrubé porušení povinností nájemce (§ 2288 odst. 1 písm. a)' },
            { value: 'trestny-cin', label: 'Odsouzení nájemce za úmyslný trestný čin vůči pronajímateli (písm. b)' },
            { value: 'verejny-zajem', label: 'Byt má být vyklizen ve veřejném zájmu (písm. c)' },
            { value: 'jiny-zavazny', label: 'Jiný obdobně závažný důvod (písm. d)' },
            { value: 'vlastni-potreba', label: 'Byt potřebuje pronajímatel nebo jeho příbuzný (§ 2288 odst. 2)' },
          ],
        },
        {
          id: 'groundDetail',
          label: 'Popis skutečností zakládajících důvod',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: 'Důvod musí být vymezen skutkově, ne jen odkazem na zákon',
          conditional: { fieldId: 'noticeGiver', value: 'pronajimatel' },
          placeholder: 'Konkrétní skutečnosti — co, kdy a jak se stalo…',
        },
        {
          id: 'changedCircumstances',
          label: 'Změna okolností (u doby určité)',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2287 NOZ — nájemce musí změnu okolností ve výpovědi uvést',
          conditional: { fieldId: 'leaseTerm', value: 'urcitou' },
          placeholder: 'Např. změna zaměstnání a stěhování do jiného města…',
        },
      ],
    },
    {
      id: 'doba-predani',
      title: 'Výpovědní doba a předání bytu',
      fields: [
        {
          id: 'withoutNoticePeriod',
          label: 'Výpověď bez výpovědní doby',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2291 NOZ — jen při zvlášť závažném porušení a po předchozí výzvě k nápravě',
          conditional: { fieldId: 'noticeGiver', value: 'pronajimatel' },
          options: [
            { value: 'ne', label: 'Ne — standardní tříměsíční výpovědní doba' },
            { value: 'ano', label: 'Ano — zvlášť závažné porušení (§ 2291)' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'handoverDate',
          label: 'Navrhované datum předání bytu',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2292 NOZ — byt se odevzdává v den skončení nájmu',
        },
        {
          id: 'deliveryMethod',
          label: 'Způsob doručení výpovědi',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 570 NOZ — účinky nastávají dojitím druhé straně, doručení je třeba prokázat',
          options: [
            { value: 'dorucenka', label: 'Doporučeně s dodejkou' },
            { value: 'osobne', label: 'Osobně proti podpisu' },
            { value: 'datovka', label: 'Datovou schránkou' },
          ],
          defaultValue: 'dorucenka',
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Datum a doplňující údaje',
      fields: [
        {
          id: 'noticeDate',
          label: 'Datum vyhotovení výpovědi',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'additionalNotes',
          label: 'Další sdělení',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Např. vyúčtování jistoty, předání klíčů, kontakt…',
        },
      ],
    },
  ],
}
