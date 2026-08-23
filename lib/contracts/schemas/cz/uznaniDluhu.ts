/**
 * Uznání dluhu
 * Právní základ: § 2053 a § 2054 zák. č. 89/2012 Sb.
 * Kategorie: Občanské právo
 *
 * The one document in this product whose signer is usually the party it hurts.
 * The form is therefore built to make the consequences unavoidable rather than
 * to move the user through quickly: it asks outright whether limitation has
 * been checked, because acknowledging a time-barred debt revives it (§ 653),
 * and it warns that after signing it is the debtor who must disprove the debt.
 *
 * Acceleration on a missed instalment is deliberately absent. § 1931 needs
 * agreement from both sides, so a one-sided declaration cannot create it, and
 * offering the field would produce a clause that looks binding and is not.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const uznaniDluhu: ContractSchema = {
  metadata: {
    schemaId: 'uznani-dluhu-v1',
    contractFamily: 'debt-acknowledgment',
    documentKind: 'unilateral',
    name: 'Uznání dluhu',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2053 zák. č. 89/2012 Sb. — uznání co do důvodu i výše, písemná forma',
      '§ 2054 NOZ — konkludentní uznání placením úroků a částečným plněním',
      '§ 639 NOZ — desetiletá promlčecí lhůta od uznání',
      '§ 653 odst. 1 NOZ — uznání promlčeného dluhu nárok obnoví',
      '§ 1931 NOZ — ztráta výhody splátek jen při ujednání stran',
      '§ 1952 NOZ — vrácení dlužního úpisu po splnění',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Písemné uznání dluhu podle občanského zákoníku — zakládá domněnku trvání ' +
      'dluhu a desetiletou promlčecí lhůtu.',
    outputStructure: {
      sections: [
        'Označení dlužníka a věřitele',
        'Vymezení dluhu — důvod a výše',
        'Prohlášení o uznání',
        'Doba splnění',
        'Poučení o následcích uznání',
        'Datum a podpis dlužníka',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj uznání dluhu dle § 2053 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Uznání MUSÍ obsahovat důvod dluhu i jeho výši a výslovné prohlášení, ' +
      'že dlužník dluh uznává. Chybí-li kterákoli část, domněnka podle § 2053 ' +
      'nevznikne\n' +
      '- Jistinu uveď odděleně od příslušenství. Domněnka působí jen v uznaném ' +
      'rozsahu\n' +
      '- VŽDY uveď poučení, že uznáním se promlčecí lhůta prodlužuje na deset let ' +
      '(§ 639) a že uznáním promlčeného dluhu se nárok obnoví (§ 653). Toto ' +
      'poučení nevynechávej ani nezkracuj — je to hlavní riziko pro dlužníka\n' +
      '- Nikdy nepiš, že se dlužník vzdává námitek nebo že je uznání ' +
      'nevyvratitelné. Domněnka je vyvratitelná\n' +
      '- NEVKLÁDEJ ztrátu výhody splátek podle § 1931. Vyžaduje ujednání obou ' +
      'stran a v jednostranném uznání je bez účinku\n' +
      '- Nepiš „smluvní strany" ani „strany se dohodly". Je to prohlášení dlužníka\n' +
      '- Nevymýšlej důvod vzniku dluhu ani částky. Chybí-li, použij placeholder\n' +
      '- Podpis uveď POUZE u dlužníka\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'dluznik',
      label: 'Dlužník',
      role: 'osoba, která dluh uznává a dokument podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Datum narození', required: false, sensitivity: 'regulated' },
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'veritel',
      label: 'Věřitel',
      role: 'osoba, vůči které se dluh uznává — dokument nepodepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u podnikatele)', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro úhradu', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'dluh',
      title: 'Vymezení dluhu',
      fields: [
        {
          id: 'debtOrigin',
          label: 'Z čeho dluh vznikl',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2053 NOZ — uznání musí být „co do důvodu i výše". Bez důvodu ' +
            'domněnka nevznikne.',
          placeholder:
            'např. ze smlouvy o zápůjčce ze dne 3. 3. 2026, kterou mi věřitel poskytl částku 60 000 Kč',
          validation: { minLength: 10 },
        },
        {
          id: 'debtReference',
          label: 'Číslo faktury nebo smlouvy',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. faktura č. 2026/114',
        },
        {
          id: 'principal',
          label: 'Jistina (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          legalNote: 'Domněnka podle § 2053 působí jen v rozsahu, v jakém byl dluh uznán',
          validation: { min: 1 },
        },
        {
          id: 'accessories',
          label: 'Příslušenství — úroky, náklady (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: 'Uveďte odděleně od jistiny',
          validation: { min: 0 },
        },
        {
          id: 'originalDueDate',
          label: 'Původní datum splatnosti',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Rozhodné pro posouzení promlčení — obecná promlčecí lhůta činí tři roky',
        },
      ],
    },
    {
      id: 'promlceni',
      title: 'Ověření promlčení',
      fields: [
        {
          id: 'limitationChecked',
          label: 'Ověřil dlužník, že dluh není promlčen?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 653 NOZ — uznáním PROMLČENÉHO dluhu se nárok obnoví a začne běžet ' +
            'nová lhůta. Je to nejzávažnější důsledek podpisu.',
          options: [
            { value: 'ano', label: 'Ano — dluh není promlčen' },
            { value: 'nevim', label: 'Nevím / neověřeno' },
          ],
          defaultValue: 'nevim',
        },
        {
          id: 'limitationWarning',
          label: 'Zařadit do dokumentu výslovné poučení o promlčení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Doporučeno vždy. Dlužník tak podepisuje s vědomím, co uznání způsobí.',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'splneni',
      title: 'Doba splnění',
      fields: [
        {
          id: 'paymentMode',
          label: 'Jak bude dluh uhrazen',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 639 NOZ — je-li uvedena doba splnění, běží desetiletá lhůta až od ' +
            'jejího posledního dne',
          options: [
            { value: 'jednorazove', label: 'Jednorázově k určitému dni' },
            { value: 'splatky', label: 'Ve splátkách' },
          ],
          defaultValue: 'jednorazove',
        },
        {
          id: 'paymentDate',
          label: 'Uhradím nejpozději do',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'paymentMode', value: 'jednorazove' },
        },
        {
          id: 'instalmentPlan',
          label: 'Splátkový kalendář',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote:
            'Jde o závazek dlužníka. Ztrátu výhody splátek podle § 1931 lze ' +
            'sjednat jen dohodou obou stran — do jednostranného uznání nepatří.',
          conditional: { fieldId: 'paymentMode', value: 'splatky' },
          placeholder: 'např. 12 měsíčních splátek po 5 000 Kč vždy k 15. dni měsíce, počínaje 15. 10. 2026',
        },
        {
          id: 'returnOfDeed',
          label: 'Uvést závazek věřitele vrátit uznání po zaplacení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1952 NOZ — po splnění se dlužní úpis vrací nebo se na něm vyznačí splnění',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'acknowledgmentDate',
          label: 'Datum vyhotovení',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 639 NOZ — od tohoto dne běží desetiletá promlčecí lhůta',
        },
      ],
    },
  ],
}
