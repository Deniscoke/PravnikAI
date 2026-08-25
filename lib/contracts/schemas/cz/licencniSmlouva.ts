/**
 * Licenční smlouva
 * Právní základ: § 2358–2383 zák. č. 89/2012 Sb., zák. č. 121/2000 Sb.
 * Kategorie: Obchodní právo
 *
 * Two things shape this form.
 *
 * First, the gaps. § 2376 odst. 3 fills an unstated scope against the acquirer:
 * Czech Republic, one year, usual quantity. § 2362 makes an unstated licence
 * non-exclusive. So territory, duration and exclusivity are required fields
 * with explicit defaults rather than optional refinements — a licence that
 * reads broadly but omits them is a one-year Czech non-exclusive licence.
 *
 * Second, the question that comes before the contract: whether a licence is
 * needed at all. An employer already exercises the economic rights in employee
 * work (§ 58 AZ), and a commissioned work already carries a licence for the
 * contract's purpose (§ 61 AZ). The form asks who the author is first, because
 * the answer changes what the document is for.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const licencniSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'licencni-smlouva-v1',
    contractFamily: 'licence',
    documentKind: 'contract',
    name: 'Licenční smlouva',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2358 odst. 2 zák. č. 89/2012 Sb. — písemná forma u výhradní licence',
      '§ 2362 NOZ — bez výslovného ujednání je licence nevýhradní',
      '§ 2363 NOZ — podlicence jen bylo-li ujednáno',
      '§ 2366 NOZ — odměna nebo výslovná bezúplatnost',
      '§ 2370 NOZ — u doby neurčité roční výpovědní doba od konce měsíce',
      '§ 2372 NOZ — jen známé způsoby užití; povinnost licenci využít',
      '§ 2374 odst. 2 NOZ — dodatečná odměna; vyloučení se nepřihlíží',
      '§ 2376 odst. 3 NOZ — bez ujednání: ČR, nejvýše jeden rok, obvyklé množství',
      '§ 26 odst. 1 a § 11 odst. 4 zák. č. 121/2000 Sb. — práva jsou nepřevoditelná',
      '§ 58 a § 61 zák. č. 121/2000 Sb. — zaměstnanecké dílo a dílo na objednávku',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description:
      'Licenční smlouva k autorskému dílu podle občanského zákoníku a autorského ' +
      'zákona — s rozsahem, který zákon jinak doplní v neprospěch nabyvatele.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět licence a způsoby užití',
        'Rozsah licence — výhradnost, území, doba, množství',
        'Odměna a vyúčtování',
        'Podlicence a postoupení',
        'Osobnostní práva a užití autorem',
        'Trvání, ukončení a podpisy',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj licenční smlouvu dle § 2358 a násl. zák. č. 89/2012 Sb. a zák. ' +
      'č. 121/2000 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- NIKDY nepiš, že autor „převádí autorská práva", „postupuje veškerá práva" ' +
      'nebo se jich „vzdává". Majetková i osobnostní práva jsou NEPŘEVODITELNÁ ' +
      '(§ 26 odst. 1 a § 11 odst. 4 AZ). Poskytuje se výhradně LICENCE\n' +
      '- VŽDY uveď územní a časový rozsah licence. Bez nich zákon doplní Českou ' +
      'republiku a nejvýše jeden rok (§ 2376 odst. 3) — i kdyby zbytek smlouvy ' +
      'zněl neomezeně\n' +
      '- VŽDY uveď výslovně, zda je licence výhradní, nebo nevýhradní. Bez toho je ' +
      'nevýhradní (§ 2362)\n' +
      '- NIKDY nepiš „včetně způsobů užití dosud neznámých" — k takovému ujednání ' +
      'se nepřihlíží (§ 2372 odst. 1)\n' +
      '- NIKDY nevylučuj právo autora na dodatečnou odměnu a nepiš, že se jej autor ' +
      'vzdává. K tomu se nepřihlíží (§ 2374 odst. 2)\n' +
      '- Je-li licence výhradní, uveď, zda si autor vyhrazuje užití díla pro ' +
      'portfolio a reference — jinak se musí zdržet i vlastního užití (§ 2360 odst. 1)\n' +
      '- Podlicenci uveď výslovně, má-li být možná. Bez ujednání ji nabyvatel ' +
      'poskytnout nesmí (§ 2363)\n' +
      '- Jde-li o zaměstnanecké dílo, upozorni, že zaměstnavatel majetková práva ' +
      'vykonává už ze zákona a licenci od zaměstnance nepotřebuje (§ 58 AZ)\n' +
      '- Nevymýšlej rozsah díla, odměnu ani způsoby užití. Chybí-li, použij placeholder\n' +
      '- Podpisy uveď u OBOU stran\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'poskytovatel',
      label: 'Poskytovatel licence',
      role: 'autor nebo vykonavatel majetkových práv k dílu',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'nabyvatel',
      label: 'Nabyvatel licence',
      role: 'osoba, která je oprávněna dílo užít',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'dilo',
      title: 'Dílo a způsoby užití',
      fields: [
        {
          id: 'authorRelationship',
          label: 'Jaký je vztah autora k nabyvateli',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'U zaměstnaneckého díla vykonává majetková práva zaměstnavatel už ze ' +
            'zákona (§ 58 AZ). U díla na objednávku existuje licence k účelu ' +
            'smlouvy (§ 61 AZ) — licenční smlouva řeší užití nad tento rámec.',
          options: [
            { value: 'nezavisly', label: 'Nezávislý autor nebo dodavatel' },
            { value: 'objednavka', label: 'Dílo vytvořené na objednávku (smlouva o dílo)' },
            { value: 'zamestnanec', label: 'Zaměstnanec — dílo z pracovních povinností' },
          ],
          defaultValue: 'nezavisly',
        },
        {
          id: 'workDescription',
          label: 'Označení díla',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'Název, druh, forma a rozsah. U softwaru i verze.',
          placeholder:
            'např. grafický manuál a logotyp značky Aurora, specifikované v příloze č. 1',
          validation: { minLength: 10 },
        },
        {
          id: 'sourceIncluded',
          label: 'Zahrnuje licence zdrojová data nebo zdrojový kód?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'U softwaru a grafiky nejčastější zdroj sporů po skončení spolupráce',
          options: [
            { value: 'ne', label: 'Ne — jen výstupní podoba' },
            { value: 'ano', label: 'Ano — včetně zdrojových dat' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'usageTypes',
          label: 'Způsoby užití díla',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2376 odst. 2 NOZ — neujedná-li se nic, pokrývá licence jen to, co je ' +
            'nutné k účelu smlouvy. Jen způsoby známé v době uzavření (§ 2372 odst. 1).',
          placeholder:
            'např. rozmnožování, rozšiřování, sdělování veřejnosti prostřednictvím internetu, úprava a zpracování',
          validation: { minLength: 10 },
        },
        {
          id: 'modificationAllowed',
          label: 'Smí nabyvatel dílo upravovat a zpracovávat?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 11 odst. 3 AZ — právo na nedotknutelnost díla zůstává autorovi',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'rozsah',
      title: 'Rozsah licence',
      fields: [
        {
          id: 'exclusivity',
          label: 'Výhradnost licence',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2362 NOZ — bez výslovného ujednání je licence nevýhradní',
          options: [
            { value: 'nevyhradni', label: 'Nevýhradní' },
            { value: 'vyhradni', label: 'Výhradní' },
          ],
          defaultValue: 'nevyhradni',
        },
        {
          id: 'authorMayUse',
          label: 'Smí autor dílo dál užívat (portfolio, reference)?',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2360 odst. 1 NOZ — u výhradní licence se poskytovatel zdrží ' +
            'i vlastního užití, není-li výslovně ujednán opak',
          conditional: { fieldId: 'exclusivity', value: 'vyhradni' },
          options: [
            { value: 'ano', label: 'Ano — autor si užití pro portfolio vyhrazuje' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'territory',
          label: 'Územní rozsah',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2376 odst. 3 písm. a) NOZ — bez ujednání se licence omezí na území ' +
            'České republiky',
          options: [
            { value: 'celosvetove', label: 'Celosvětově' },
            { value: 'eu', label: 'Evropská unie' },
            { value: 'cr', label: 'Česká republika' },
          ],
          defaultValue: 'celosvetove',
        },
        {
          id: 'durationType',
          label: 'Časový rozsah',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2376 odst. 3 písm. b) NOZ — bez ujednání NEJVÝŠE JEDEN ROK od ' +
            'poskytnutí licence, i kdyby smlouva zněla neomezeně',
          options: [
            { value: 'trvani-prav', label: 'Po dobu trvání majetkových práv autorských' },
            { value: 'urcita', label: 'Na určitou dobu' },
            { value: 'neurcita', label: 'Na dobu neurčitou' },
          ],
          defaultValue: 'trvani-prav',
        },
        {
          id: 'durationYears',
          label: 'Doba trvání licence (roky)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'durationType', value: 'urcita' },
          validation: { min: 1, max: 99 },
        },
        {
          id: 'quantityScope',
          label: 'Množstevní rozsah',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2376 odst. 3 písm. c) NOZ — bez ujednání jen obvyklé množství',
          placeholder: 'např. bez množstevního omezení',
        },
      ],
    },
    {
      id: 'odmena',
      title: 'Odměna a vyúčtování',
      fields: [
        {
          id: 'feeType',
          label: 'Způsob odměňování',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2366 odst. 1 NOZ — bez odměny i bez výslovné bezúplatnosti hrozí ' +
            'spor o odměnu obvyklou',
          options: [
            { value: 'jednorazova', label: 'Jednorázová částka' },
            { value: 'podil', label: 'Podíl na výnosech' },
            { value: 'kombinace', label: 'Kombinace pevné částky a podílu' },
            { value: 'bezuplatne', label: 'Bezúplatně' },
          ],
          defaultValue: 'jednorazova',
        },
        {
          id: 'feeAmount',
          label: 'Odměna (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          conditional: { fieldId: 'feeType', value: ['jednorazova', 'kombinace'] },
          validation: { min: 0 },
        },
        {
          id: 'royaltyShare',
          label: 'Podíl na výnosech (%)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          conditional: { fieldId: 'feeType', value: ['podil', 'kombinace'] },
          validation: { min: 0, max: 100 },
        },
        {
          id: 'reporting',
          label: 'Informace o užití díla',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2374a NOZ — u úplatné licence předkládá nabyvatel autorovi informace ' +
            'alespoň jednou ročně',
          options: [
            { value: 'rocne', label: 'Alespoň jednou ročně' },
            { value: 'ctvrtletne', label: 'Čtvrtletně' },
            { value: 'nerelevantni', label: 'Neuplatní se — bezúplatná licence' },
          ],
          defaultValue: 'rocne',
        },
      ],
    },
    {
      id: 'nakladani',
      title: 'Podlicence, postoupení a ukončení',
      fields: [
        {
          id: 'sublicence',
          label: 'Smí nabyvatel poskytnout podlicenci?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2363 NOZ — bez výslovného ujednání podlicenci poskytnout NELZE. ' +
            'Pro agenturu předávající dílo klientovi je to zásadní.',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ano-souhlas', label: 'Ano, s předchozím písemným souhlasem' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'assignment',
          label: 'Smí nabyvatel licenci postoupit třetí osobě?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2364 NOZ — jen se souhlasem poskytovatele v písemné formě',
          options: [
            { value: 'se-souhlasem', label: 'Jen s písemným souhlasem poskytovatele' },
            { value: 'pri-prevodu-zavodu', label: 'Ano při převodu obchodního závodu' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'se-souhlasem',
        },
        {
          id: 'mustUse',
          label: 'Je nabyvatel povinen licenci využít?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2372 odst. 2 NOZ — u autorského díla POVINEN JE, není-li ujednáno ' +
            'jinak. Je to opak obecného pravidla § 2359.',
          options: [
            { value: 'ne', label: 'Ne — povinnost se vylučuje' },
            { value: 'ano', label: 'Ano' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'noticeMonths',
          label: 'Výpovědní doba (měsíce)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 2370 NOZ — bez ujednání nabývá výpověď účinnosti až rok od konce ' +
            'měsíce, v němž došla druhé straně',
          conditional: { fieldId: 'durationType', value: 'neurcita' },
          validation: { min: 1, max: 24 },
          defaultValue: '6',
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
