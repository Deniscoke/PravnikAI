/**
 * Nájemní smlouva — prostor sloužící podnikání
 * Právní základ: § 2302–2315 zák. č. 89/2012 Sb.
 * Kategorie: Nemovitosti
 *
 * The form exists because the residential template is the default mistake.
 * People take a nájemní smlouva na byt, change "byt" to "provozovna", and
 * import a three-month deposit cap that does not apply, a notice regime that
 * does not apply, and an instruction about objections that belongs to a
 * different section — while leaving out § 2315, the one entitlement here with
 * no residential analogue and often the most valuable thing the tenant has.
 *
 * So the notice period defaults to six months rather than three, and the form
 * asks explicitly whether the § 2315 customer-base compensation is being
 * addressed, since silence on it is what templates do.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const najemProstoruPodnikani: ContractSchema = {
  metadata: {
    schemaId: 'najem-prostoru-podnikani-v1',
    contractFamily: 'business-premises-lease',
    documentKind: 'contract',
    name: 'Nájem prostoru sloužícího podnikání',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2302 zák. č. 89/2012 Sb. — režim platí i bez vyjádření účelu ve smlouvě',
      '§ 2304 NOZ — změna provozované činnosti',
      '§ 2305 a § 2306 NOZ — štíty a návěstí, souhlas mlčením do jednoho měsíce',
      '§ 2307 NOZ — převod nájmu s převodem podnikatelské činnosti',
      '§ 2308 a § 2309 NOZ — výpovědní důvody u nájmu na dobu určitou',
      '§ 2310 NOZ — výpověď bez důvodu je neplatná; tříměsíční výpovědní doba',
      '§ 2312 NOZ — šest měsíců u doby neurčité, tři při vážném důvodu',
      '§ 2314 NOZ — námitky do jednoho měsíce',
      '§ 2315 NOZ — náhrada za převzetí zákaznické základny',
    ],
    sensitivity: 'sensitive',
    category: 'realestate',
    description:
      'Nájemní smlouva na provozovnu, kancelář nebo obchodní prostor podle ' +
      'zvláštní úpravy § 2302 a násl. občanského zákoníku.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět nájmu a účel',
        'Doba nájmu a skončení',
        'Nájemné, služby a jistota',
        'Provoz, označení provozovny a stavební úpravy',
        'Předání prostoru',
        'Závěrečná ustanovení a podpisy',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj nájemní smlouvu na prostor sloužící podnikání dle § 2302 a násl. ' +
      'zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- TOTO NENÍ NÁJEM BYTU. Nepoužívej ustanovení o nájmu bytu: ' +
      'trojnásobný strop jistoty podle § 2254, výpovědní důvody podle § 2288 ' +
      'ani poučení o námitkách podle § 2286 odst. 2 se zde neuplatní\n' +
      '- U nájmu na dobu neurčitou je výpovědní doba ŠESTIMĚSÍČNÍ; tříměsíční jen ' +
      'má-li vypovídající strana vážný důvod (§ 2312). U nájmu na dobu určitou ' +
      'je tříměsíční (§ 2310 odst. 2). Nikdy nepiš, že výpovědní doba běží od ' +
      'prvního dne následujícího měsíce\n' +
      '- Uveď, že výpověď musí obsahovat důvod, jinak je neplatná (§ 2310 odst. 1)\n' +
      '- Uveď režim námitek podle § 2314 — obě strany, do jednoho měsíce, písemně\n' +
      '- Je-li v zadání uvedeno, uveď náhradu za převzetí zákaznické základny ' +
      'podle § 2315. Vylučuje-li ji smlouva, uveď to VÝSLOVNĚ a odděleně, ' +
      'aby si toho nájemce všiml — nikdy to neschovávej do závěrečných ustanovení\n' +
      '- U štítů a návěstí uveď, že nevyjádří-li se pronajímatel do jednoho měsíce ' +
      'od písemné žádosti, souhlas se považuje za daný (§ 2305)\n' +
      '- Nevymýšlej výměru, nájemné ani stav prostoru. Chybí-li, použij placeholder\n' +
      '- Podpisy uveď u OBOU stran\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'pronajimatel',
      label: 'Pronajímatel',
      role: 'vlastník nebo oprávněný, který prostor přenechává do užívání',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro nájemné', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'najemce',
      label: 'Nájemce',
      role: 'podnikatel, který bude prostor užívat k podnikání',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet',
      title: 'Předmět nájmu a účel',
      fields: [
        {
          id: 'premisesDescription',
          label: 'Označení prostoru',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2302 NOZ — adresa, číslo jednotky nebo místnosti, podlaží',
          placeholder:
            'např. prostor č. 3 v 1. nadzemním podlaží budovy č. p. 120 na adrese Dlouhá 12, Praha 1',
          validation: { minLength: 10 },
        },
        {
          id: 'floorArea',
          label: 'Výměra (m²)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1 },
        },
        {
          id: 'purpose',
          label: 'Účel nájmu — jaká činnost se bude provozovat',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2302 odst. 1 NOZ — zvláštní úprava platí i bez vyjádření účelu, ' +
            'ale účel vymezuje, co smí nájemce dělat, a zakládá výpovědní důvod ' +
            'podle § 2308 písm. a)',
          placeholder: 'např. provozování kavárny',
          validation: { minLength: 3 },
        },
        {
          id: 'buildingWorks',
          label: 'Smí nájemce provádět stavební úpravy?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'se-souhlasem', label: 'Ano, s předchozím písemným souhlasem pronajímatele' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'se-souhlasem',
        },
      ],
    },
    {
      id: 'doba',
      title: 'Doba nájmu a skončení',
      fields: [
        {
          id: 'duration',
          label: 'Nájem se sjednává',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Na době závisí výpovědní režim — § 2308 a § 2309 u doby určité, ' +
            '§ 2312 u doby neurčité',
          options: [
            { value: 'urcita', label: 'Na dobu určitou' },
            { value: 'neurcita', label: 'Na dobu neurčitou' },
          ],
          defaultValue: 'urcita',
        },
        {
          id: 'startDate',
          label: 'Nájem začíná dne',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'endDate',
          label: 'Nájem končí dne',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'duration', value: 'urcita' },
        },
        {
          id: 'noticeMonths',
          label: 'Výpovědní doba (měsíce)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2312 NOZ — u doby neurčité šest měsíců, tři při vážném důvodu. ' +
            '§ 2310 odst. 2 — u doby určité tři měsíce. Toto NENÍ tříměsíční ' +
            'režim nájmu bytu.',
          validation: { min: 1, max: 24 },
          defaultValue: '6',
        },
        {
          id: 'customerBaseCompensation',
          label: 'Náhrada za převzetí zákaznické základny (§ 2315)',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Skončí-li nájem výpovědí pronajímatele, náleží nájemci náhrada za ' +
            'výhodu z převzetí jeho klientely. U provozovny s vlastní klientelou ' +
            'jde často o nejcennější nárok celé smlouvy.',
          options: [
            { value: 'zakonna', label: 'Ponechat zákonnou úpravu § 2315' },
            { value: 'ujednana', label: 'Sjednat konkrétní způsob výpočtu' },
            { value: 'vyloucena', label: 'Vyloučit — nájemce se práva vzdává' },
          ],
          defaultValue: 'zakonna',
        },
        {
          id: 'customerBaseDetail',
          label: 'Sjednaný způsob výpočtu náhrady',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'customerBaseCompensation', value: 'ujednana' },
          placeholder: 'např. ve výši šestinásobku měsíčního nájemného platného ke dni skončení nájmu',
        },
      ],
    },
    {
      id: 'platby',
      title: 'Nájemné, služby a jistota',
      fields: [
        {
          id: 'rentAmount',
          label: 'Nájemné (Kč měsíčně)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          validation: { min: 1 },
        },
        {
          id: 'rentVat',
          label: 'Nájemné je uvedeno',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'U pronájmu podnikateli bývá nájemné zdanitelným plněním — ujednejte výslovně',
          options: [
            { value: 'bez-dph', label: 'Bez DPH' },
            { value: 's-dph', label: 'Včetně DPH' },
            { value: 'osvobozeno', label: 'Osvobozeno od DPH' },
          ],
          defaultValue: 'bez-dph',
        },
        {
          id: 'rentDueDay',
          label: 'Nájemné splatné do (den v měsíci)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1, max: 31 },
          defaultValue: '15',
        },
        {
          id: 'serviceCharges',
          label: 'Zálohy na služby (Kč měsíčně)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote: '§ 2303 NOZ — na služby se obdobně použijí pravidla jako u nájmu bytu',
          validation: { min: 0 },
        },
        {
          id: 'servicesIncluded',
          label: 'Které služby pronajímatel zajišťuje',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'např. dodávka tepla, vody, elektřiny, úklid společných prostor',
        },
        {
          id: 'depositAmount',
          label: 'Jistota (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          legalNote:
            'Trojnásobný strop podle § 2254 platí pro nájem BYTU — zde se ' +
            'neuplatní a výše jistoty je na dohodě stran',
          validation: { min: 0 },
        },
        {
          id: 'rentIndexation',
          label: 'Inflační doložka',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'ano', label: 'Ano — roční valorizace podle indexu spotřebitelských cen ČSÚ' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'provoz',
      title: 'Provoz a předání',
      fields: [
        {
          id: 'signage',
          label: 'Označení provozovny štíty a návěstími',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2305 NOZ — nevyjádří-li se pronajímatel do jednoho měsíce od ' +
            'písemné žádosti, souhlas se považuje za daný',
          options: [
            { value: 'se-souhlasem', label: 'Se souhlasem pronajímatele podle § 2305' },
            { value: 'predem-odsouhlaseno', label: 'Předem odsouhlaseno ve smlouvě' },
          ],
          defaultValue: 'se-souhlasem',
        },
        {
          id: 'sublease',
          label: 'Podnájem třetí osobě',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'se-souhlasem', label: 'Jen s předchozím písemným souhlasem' },
            { value: 'zakazan', label: 'Zakázán' },
          ],
          defaultValue: 'se-souhlasem',
        },
        {
          id: 'handoverProtocol',
          label: 'Předávací protokol se stavem měřidel',
          type: 'select',
          required: true,
          sensitivity: 'public',
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
