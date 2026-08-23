/**
 * Odstoupení od smlouvy
 * Právní základ: § 2001–2005 a § 1829 zák. č. 89/2012 Sb.
 * Kategorie: Občanské právo
 *
 * The form's first job is to stop the user writing the wrong document. Two
 * questions decide everything that follows: is this the consumer's fourteen-day
 * right, which needs no reason at all, or general withdrawal under § 2001,
 * which needs one — and if it is the latter, was the breach substantial? A
 * non-substantial breach requires a prior demand with an additional period, and
 * skipping that is the commonest reason a withdrawal fails.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const odstoupeniOdSmlouvy: ContractSchema = {
  metadata: {
    schemaId: 'odstoupeni-od-smlouvy-v1',
    contractFamily: 'withdrawal',
    documentKind: 'unilateral',
    name: 'Odstoupení od smlouvy',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2001–2005 zák. č. 89/2012 Sb., občanský zákoník',
      '§ 2001 NOZ — odstoupit lze jen z ujednaného nebo zákonného důvodu',
      '§ 2002 NOZ — podstatné porušení smlouvy',
      '§ 2003 NOZ — nepodstatné porušení a dodatečná lhůta',
      '§ 2004 NOZ — závazek se ruší od počátku',
      '§ 1829 NOZ — čtrnáctidenní odstoupení spotřebitele',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Odstoupení od smlouvy podle občanského zákoníku — pro podstatné i nepodstatné ' +
      'porušení a pro čtrnáctidenní odstoupení spotřebitele.',
    outputStructure: {
      sections: [
        'Označení adresáta a odstupující strany',
        'Označení smlouvy',
        'Důvod odstoupení',
        'Odstoupení a jeho účinky',
        'Vypořádání vzájemných plnění',
        'Datum, doručení a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj odstoupení od smlouvy dle § 2001–2005 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Odstoupením se závazek ruší OD POČÁTKU a strany si vrátí, co si plnily. ' +
      'Nikdy nepiš, že smlouva zaniká ke dni doručení nebo že běží výpovědní doba — ' +
      'to je výpověď, ne odstoupení\n' +
      '- Jde-li o obecné odstoupení, MUSÍŠ uvést důvod a skutečnosti, které jej ' +
      'naplňují. Bez důvodu odstoupení nemá účinky (§ 2001)\n' +
      '- Jde-li o čtrnáctidenní odstoupení spotřebitele podle § 1829, důvod NEUVÁDĚJ ' +
      'a nikdy jej nevyžaduj — spotřebitel jej uvádět nemusí\n' +
      '- U nepodstatného porušení uveď, že byla poskytnuta dodatečná přiměřená lhůta ' +
      'a marně uplynula. Bez toho odstoupení neobstojí (§ 2003)\n' +
      '- Uveď, že odstoupením nezanikají práva na smluvní pokutu, úrok z prodlení ' +
      'ani náhradu škody (§ 2005 odst. 2)\n' +
      '- Nevymýšlej porušení ani okolnosti. Chybí-li, použij placeholder\n' +
      '- Podpis uveď POUZE u odstupující strany\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'odstupujici',
      label: 'Odstupující strana',
      role: 'osoba, která od smlouvy odstupuje a dokument podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro vrácení peněz', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'adresat',
      label: 'Adresát odstoupení',
      role: 'druhá strana smlouvy — odstoupení přijímá',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'typ',
      title: 'O jaké odstoupení jde',
      fields: [
        {
          id: 'withdrawalType',
          label: 'Typ odstoupení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Čtrnáctidenní odstoupení spotřebitele podle § 1829 je samostatné právo ' +
            'a nevyžaduje důvod. Obecné odstoupení podle § 2001 důvod vyžaduje vždy.',
          options: [
            { value: 'poruseni', label: 'Pro porušení smlouvy druhou stranou' },
            { value: 'spotrebitel-14', label: 'Spotřebitel do 14 dnů (nákup na dálku)' },
            { value: 'ujednani', label: 'Na základě ujednání ve smlouvě' },
          ],
          defaultValue: 'poruseni',
        },
        {
          id: 'breachSeverity',
          label: 'Povaha porušení',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2002 a § 2003 NOZ — u nepodstatného porušení je nutná předchozí ' +
            'výzva s dodatečnou lhůtou',
          conditional: { fieldId: 'withdrawalType', value: 'poruseni' },
          options: [
            { value: 'podstatne', label: 'Podstatné — smlouvu bych neuzavřel, kdybych je předvídal' },
            { value: 'nepodstatne', label: 'Nepodstatné — po marné dodatečné lhůtě' },
          ],
          defaultValue: 'podstatne',
        },
      ],
    },
    {
      id: 'smlouva',
      title: 'Smlouva, od které odstupujete',
      fields: [
        {
          id: 'contractType',
          label: 'Typ smlouvy',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. kupní smlouva, smlouva o dílo',
          validation: { minLength: 3 },
        },
        {
          id: 'contractDate',
          label: 'Smlouva uzavřena dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'contractSubject',
          label: 'Předmět smlouvy',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. dodávka a montáž kuchyňské linky, objednávka č. 2026/114',
          validation: { minLength: 3 },
        },
        {
          id: 'amountPaid',
          label: 'Dosud uhrazeno (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: 'Odstoupením se závazek ruší od počátku — uhrazené se vrací',
          validation: { min: 0 },
        },
      ],
    },
    {
      id: 'duvod',
      title: 'Důvod odstoupení',
      fields: [
        {
          id: 'breachFacts',
          label: 'Co druhá strana porušila',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2001 NOZ — popište skutečnosti, ne jen právní kvalifikaci. Co, kdy ' +
            'a jak se stalo.',
          conditional: { fieldId: 'withdrawalType', value: 'poruseni' },
          placeholder:
            'např. dílo nebylo dokončeno ani do 15. 8. 2026, ačkoli termín byl 30. 6. 2026',
        },
        {
          id: 'priorDemandDate',
          label: 'Datum výzvy s dodatečnou lhůtou',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2003 NOZ — u nepodstatného porušení je předchozí výzva podmínkou',
          conditional: { fieldId: 'breachSeverity', value: 'nepodstatne' },
        },
        {
          id: 'contractClause',
          label: 'Ujednání smlouvy, které odstoupení umožňuje',
          type: 'text',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'withdrawalType', value: 'ujednani' },
          placeholder: 'např. čl. VII odst. 2 smlouvy',
        },
        {
          id: 'deliveryReceivedDate',
          label: 'Datum převzetí zboží',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 1829 NOZ — čtrnáctidenní lhůta běží od převzetí',
          conditional: { fieldId: 'withdrawalType', value: 'spotrebitel-14' },
        },
      ],
    },
    {
      id: 'vyporadani',
      title: 'Vypořádání a doručení',
      fields: [
        {
          id: 'settlementRequest',
          label: 'Co požadujete vrátit',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2004 NOZ — strany si vrátí, co si plnily',
          placeholder: 'např. vrácení uhrazené zálohy 50 000 Kč na účet uvedený výše',
          validation: { minLength: 5 },
        },
        {
          id: 'settlementDays',
          label: 'Lhůta k vrácení (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1, max: 90 },
          defaultValue: '14',
        },
        {
          id: 'deliveryMethod',
          label: 'Způsob doručení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 570 NOZ — účinky nastávají dojitím druhé straně',
          options: [
            { value: 'dorucenka', label: 'Doporučeně s dodejkou' },
            { value: 'osobne', label: 'Osobně proti podpisu' },
            { value: 'email', label: 'E-mailem' },
            { value: 'datovka', label: 'Datovou schránkou' },
          ],
          defaultValue: 'dorucenka',
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
