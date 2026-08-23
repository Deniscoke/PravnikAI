/**
 * Výpověď z pracovního poměru
 * Právní základ: § 50–54 a § 67 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * One schema, two very different documents. An employee needs almost nothing:
 * a written statement, delivered. An employer needs a ground from § 52,
 * described factually rather than by reference, and has to stay out of the
 * protected periods in § 53. The "who is giving notice" selector drives the
 * whole form, and the grounds it offers carry their own notice period —
 * f) to h) run one month, everything else two.
 *
 * documentKind 'unilateral': the recipient signs only to acknowledge delivery.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const vypovedZPracovnihoPomeru: ContractSchema = {
  metadata: {
    schemaId: 'vypoved-z-pracovniho-pomeru-v1',
    contractFamily: 'employment-notice',
    documentKind: 'unilateral',
    name: 'Výpověď z pracovního poměru',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 50–54 zák. č. 262/2006 Sb., zákoník práce',
      '§ 50 odst. 1 ZP — písemná forma a doručení',
      '§ 51 ZP — výpovědní doba, od 1. 6. 2025 běží od doručení',
      '§ 52 ZP — taxativní výpovědní důvody zaměstnavatele',
      '§ 53 ZP — zákaz výpovědi v ochranné době',
      '§ 67 ZP — odstupné',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description:
      'Výpověď z pracovního poměru daná zaměstnancem nebo zaměstnavatelem podle ' +
      'zákoníku práce.',
    outputStructure: {
      sections: [
        'Označení adresáta a vypovídající strany',
        'Označení pracovní smlouvy a pracovního poměru',
        'Výpověď',
        'Výpovědní důvod',
        'Výpovědní doba a den skončení',
        'Odstupné',
        'Datum, doručení a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj výpověď z pracovního poměru dle § 50–54 zák. č. 262/2006 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Dává-li výpověď ZAMĚSTNAVATEL, MUSÍŠ uvést výpovědní důvod a vymezit jej ' +
      'SKUTKOVĚ. Pouhý odkaz „podle § 52 písm. c)" nestačí — je třeba popsat, ' +
      'co se stalo. Bez skutkového vymezení je výpověď neplatná\n' +
      '- Dává-li výpověď ZAMĚSTNANEC, důvod neuváděj vůbec, není-li v zadání. ' +
      'Zaměstnanec jej uvádět nemusí\n' +
      '- Výpovědní doba běží ODE DNE DORUČENÍ výpovědi. Nikdy nepiš, že začíná ' +
      'prvním dnem následujícího měsíce — to je úprava platná do 31. 5. 2025\n' +
      '- Nikdy neslibuj dvanáctinásobné odstupné při pracovním úrazu nebo nemoci ' +
      'z povolání. Od 1. 6. 2025 náleží jen při dosažení nejvyšší přípustné expozice\n' +
      '- Nepiš, že výpověď lze jednostranně vzít zpět — jde to jen se souhlasem ' +
      'druhé strany (§ 50 odst. 5)\n' +
      '- Podpis uveď POUZE u vypovídající strany. Podpis adresáta smí být nejvýše ' +
      'potvrzením převzetí, nikdy souhlasem\n' +
      '- Nevymýšlej výpovědní důvod ani okolnosti. Chybí-li, použij placeholder\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'vypovidajici',
      label: 'Vypovídající strana',
      role: 'zaměstnanec nebo zaměstnavatel, který výpověď dává a podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u zaměstnavatele)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'adresat',
      label: 'Adresát výpovědi',
      role: 'druhá strana pracovního poměru — výpověď přijímá, nepodepisuje souhlas',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u zaměstnavatele)', required: false, sensitivity: 'personal' },
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
            '§ 50 ZP — zaměstnanec bez důvodu, zaměstnavatel jen z důvodů § 52',
          options: [
            { value: 'zamestnanec', label: 'Zaměstnanec' },
            { value: 'zamestnavatel', label: 'Zaměstnavatel' },
          ],
          defaultValue: 'zamestnanec',
        },
      ],
    },
    {
      id: 'pomer',
      title: 'Vypovídaný pracovní poměr',
      fields: [
        {
          id: 'jobTitle',
          label: 'Sjednaný druh práce / pozice',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. softwarový inženýr',
          validation: { minLength: 2 },
        },
        {
          id: 'contractDate',
          label: 'Pracovní smlouva ze dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'startDate',
          label: 'Den nástupu do práce',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: 'Rozhodné pro délku trvání poměru a tím i pro výši odstupného',
        },
      ],
    },
    {
      id: 'duvod',
      title: 'Výpovědní důvod',
      fields: [
        {
          id: 'employerGround',
          label: 'Zákonný výpovědní důvod',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 52 ZP — u důvodů f) až h) činí výpovědní doba jeden měsíc, jinak dva',
          conditional: { fieldId: 'noticeGiver', value: 'zamestnavatel' },
          options: [
            { value: 'a-ruseni', label: 'a) Ruší se zaměstnavatel nebo jeho část' },
            { value: 'b-premisteni', label: 'b) Přemísťuje se zaměstnavatel nebo jeho část' },
            { value: 'c-nadbytecnost', label: 'c) Zaměstnanec se stal nadbytečným' },
            { value: 'd-uraz', label: 'd) Zdravotní důvody spojené s prací' },
            { value: 'e-zpusobilost', label: 'e) Dlouhodobá ztráta zdravotní způsobilosti' },
            { value: 'f-predpoklady', label: 'f) Nesplňování předpokladů nebo neuspokojivé výsledky' },
            { value: 'g-poruseni', label: 'g) Závažné porušení povinností' },
            { value: 'h-rezim', label: 'h) Zvlášť hrubé porušení režimu v době neschopnosti' },
          ],
        },
        {
          id: 'groundFacts',
          label: 'Skutkové vymezení důvodu',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 50 odst. 4 ZP — důvod musí být popsán tak, aby jej nešlo zaměnit ' +
            's jiným. Odkaz na paragraf nestačí a důvod nelze dodatečně měnit.',
          conditional: { fieldId: 'noticeGiver', value: 'zamestnavatel' },
          placeholder:
            'Co konkrétně se stalo — kdy, kde, jak. Např. rozhodnutím jednatele ze dne '
            + '1. 8. 2026 byla zrušena pozice…',
        },
        {
          id: 'employeeReason',
          label: 'Důvod (nepovinný)',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 50 odst. 3 ZP — zaměstnanec důvod uvádět nemusí',
          conditional: { fieldId: 'noticeGiver', value: 'zamestnanec' },
          placeholder: 'Nechte prázdné, pokud důvod uvádět nechcete',
        },
      ],
    },
    {
      id: 'doba',
      title: 'Výpovědní doba a odstupné',
      fields: [
        {
          id: 'noticePeriodMonths',
          label: 'Výpovědní doba (měsíce)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 51 ZP — nejméně dva měsíce; u důvodů § 52 písm. f) až h) nejméně jeden. ' +
            'Běží ode dne doručení výpovědi.',
          validation: { min: 1, max: 12 },
          defaultValue: '2',
        },
        {
          id: 'severance',
          label: 'Náleží odstupné',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 67 odst. 1 ZP — u důvodů a) až c) podle délky trvání poměru ' +
            '(1×, 2× nebo 3× průměrný výdělek)',
          conditional: { fieldId: 'noticeGiver', value: 'zamestnavatel' },
          options: [
            { value: 'ano', label: 'Ano — z organizačních důvodů podle § 52 a) až c)' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ne',
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Doručení a datum',
      fields: [
        {
          id: 'deliveryMethod',
          label: 'Způsob doručení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 50 odst. 1 a § 334 a násl. ZP — výpovědní doba běží od doručení, ' +
            'proto je třeba doručení umět prokázat',
          options: [
            { value: 'osobne', label: 'Osobně proti podpisu' },
            { value: 'posta', label: 'Poštou s dodejkou' },
            { value: 'datovka', label: 'Datovou schránkou' },
          ],
          defaultValue: 'osobne',
        },
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
          placeholder: 'Např. předání pracovních pomůcek, potvrzení o zaměstnání, dovolená…',
        },
      ],
    },
  ],
}
