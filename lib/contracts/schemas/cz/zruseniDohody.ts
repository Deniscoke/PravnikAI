/**
 * Zrušení dohody o provedení práce / o pracovní činnosti
 * Právní základ: § 77 odst. 4 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * Deliberately short, because the document is. What it must not do is borrow
 * from the pracovní-poměr apparatus: no statutory grounds, no two-month period,
 * no severance, no protected periods. Fifteen days from delivery, either side,
 * reason optional.
 *
 * The first field asks what the dohoda itself says, because § 77 odst. 4 is a
 * default that applies only where the parties agreed nothing else.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const zruseniDohody: ContractSchema = {
  metadata: {
    schemaId: 'zruseni-dohody-v1',
    contractFamily: 'agreement-termination',
    documentKind: 'unilateral',
    name: 'Zrušení dohody (DPP / DPČ)',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 77 odst. 4 zák. č. 262/2006 Sb., zákoník práce',
      '§ 77 odst. 4 písm. b) ZP — výpověď s patnáctidenní výpovědní dobou',
      '§ 77 odst. 6 ZP — písemná forma',
      '§ 313 ZP — potvrzení o zaměstnání',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description:
      'Výpověď dohody o provedení práce nebo o pracovní činnosti — patnáctidenní ' +
      'výpovědní doba, i bez udání důvodu.',
    outputStructure: {
      sections: [
        'Označení adresáta a vypovídající strany',
        'Označení rušené dohody',
        'Výpověď dohody',
        'Výpovědní doba a den skončení',
        'Vypořádání odměny',
        'Datum, doručení a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj výpověď dohody konané mimo pracovní poměr dle § 77 odst. 4 ' +
      'zák. č. 262/2006 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Toto NENÍ výpověď z pracovního poměru. Nikdy nevkládej výpovědní důvody ' +
      'podle § 52, ochrannou dobu podle § 53, odstupné podle § 67 ani dvouměsíční ' +
      'výpovědní dobu — na dohodu se nic z toho nevztahuje\n' +
      '- Výpovědní doba činí patnáct dnů a běží dnem, v němž byla výpověď DORUČENA. ' +
      'Nepiš, že začíná prvním dnem následujícího měsíce\n' +
      '- Důvod neuváděj, není-li v zadání. Dohodu lze vypovědět i bez udání důvodu, ' +
      'a to oběma stranami\n' +
      '- Je-li v zadání uvedeno, že dohoda upravuje zrušení jinak, řiď se dohodou — ' +
      'zákonná úprava je jen podpůrná\n' +
      '- Podpis uveď POUZE u vypovídající strany\n' +
      '- Dokument piš krátce a věcně. Nepřidávej ustanovení, která patří do smlouvy\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'vypovidajici',
      label: 'Vypovídající strana',
      role: 'zaměstnanec nebo zaměstnavatel, který dohodu vypovídá',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u zaměstnavatele)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'adresat',
      label: 'Adresát výpovědi',
      role: 'druhá strana dohody — výpověď přijímá',
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
      id: 'dohoda',
      title: 'Rušená dohoda',
      fields: [
        {
          id: 'agreementType',
          label: 'Typ dohody',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'dpp', label: 'Dohoda o provedení práce (DPP)' },
            { value: 'dpc', label: 'Dohoda o pracovní činnosti (DPČ)' },
          ],
          defaultValue: 'dpp',
        },
        {
          id: 'agreementDate',
          label: 'Dohoda ze dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'workTask',
          label: 'Sjednaná práce',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. lektor kurzu angličtiny',
          validation: { minLength: 2 },
        },
        {
          id: 'ownRegime',
          label: 'Upravuje dohoda způsob zrušení vlastními pravidly?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 77 odst. 4 ZP se použije jen tehdy, nesjednaly-li si strany něco jiného',
          options: [
            { value: 'ne', label: 'Ne — uplatní se zákonná úprava' },
            { value: 'ano', label: 'Ano — dohoda má vlastní pravidla' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'ownRegimeDetail',
          label: 'Co dohoda o zrušení stanoví',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'ownRegime', value: 'ano' },
          placeholder: 'např. výpovědní doba jeden měsíc, výpověď jen z důvodu…',
        },
      ],
    },
    {
      id: 'vypoved',
      title: 'Výpověď',
      fields: [
        {
          id: 'noticeGiver',
          label: 'Výpověď dává',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 77 odst. 4 ZP — vypovědět mohou obě strany, i bez udání důvodu',
          options: [
            { value: 'zamestnanec', label: 'Zaměstnanec' },
            { value: 'zamestnavatel', label: 'Zaměstnavatel' },
          ],
          defaultValue: 'zamestnanec',
        },
        {
          id: 'reason',
          label: 'Důvod (nepovinný)',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: 'Dohodu lze vypovědět i bez udání důvodu — nechte prázdné, pokud jej uvádět nechcete',
          placeholder: 'Nepovinné',
        },
        {
          id: 'noticeDays',
          label: 'Výpovědní doba (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 77 odst. 4 písm. b) ZP — patnáct dnů, běží dnem doručení výpovědi',
          validation: { min: 1, max: 90 },
          defaultValue: '15',
        },
      ],
    },
    {
      id: 'vyporadani',
      title: 'Vypořádání a doručení',
      fields: [
        {
          id: 'remunerationSettlement',
          label: 'Vypořádání odměny za odvedenou práci',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: 'Skončením dohody nárok na odměnu nezaniká',
          placeholder: 'např. odměna bude vyplacena do 20. dne následujícího měsíce',
        },
        {
          id: 'deliveryMethod',
          label: 'Způsob doručení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Patnáctidenní lhůta běží ode dne doručení, proto je třeba je prokázat',
          options: [
            { value: 'osobne', label: 'Osobně proti podpisu' },
            { value: 'posta', label: 'Poštou s dodejkou' },
            { value: 'datovka', label: 'Datovou schránkou' },
          ],
          defaultValue: 'osobne',
        },
        {
          id: 'noticeDate',
          label: 'Datum vyhotovení',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
  ],
}
