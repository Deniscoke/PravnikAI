/**
 * Smlouva o poskytování služeb
 * Právní základ: § 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb.
 * Kategorie: Obchodní právo
 *
 * The form is built around the two questions that decide everything else.
 *
 * First: is the provider an individual? If so, the švarcsystém risk is live,
 * and the fields that would otherwise be harmless — working hours, a named
 * supervisor, an obligation to attend — become evidence of dependent work. The
 * form therefore never offers them; it offers their opposites.
 *
 * Second: is a result promised or an activity? If a result is handed over and
 * accepted, it is a dílo under § 2586 and belongs in that schema instead.
 *
 * The notice clause is required rather than optional, because § 1999 fills the
 * gap with something almost nobody wants: termination only at the end of a
 * calendar quarter, on three months' notice.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const smlouvaOPoskytovaniSluzeb: ContractSchema = {
  metadata: {
    schemaId: 'smlouva-o-poskytovani-sluzeb-v1',
    contractFamily: 'service-provision',
    documentKind: 'contract',
    name: 'Smlouva o poskytování služeb',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 1746 odst. 2 zák. č. 89/2012 Sb. — nepojmenovaná smlouva',
      '§ 2430 a násl. NOZ — příkazní smlouva',
      '§ 2432 NOZ — plnění příkazu s péčí, odchylka od pokynů',
      '§ 2436 NOZ — náhrada nákladů příkazníka',
      '§ 1999 odst. 1 NOZ — výpověď ke konci čtvrtletí, není-li ujednáno jinak',
      '§ 2 a § 3 zák. č. 262/2006 Sb. — závislá práce jen v pracovněprávním vztahu',
      '§ 140 zák. č. 435/2004 Sb. — sankce za umožnění nelegální práce',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description:
      'Rámcová smlouva o poskytování služeb podle občanského zákoníku — ' +
      's ujednáními, která ji odlišují od díla i od závislé práce.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět a rozsah služeb',
        'Způsob poskytování a samostatnost poskytovatele',
        'Odměna, náklady a fakturace',
        'Doba trvání a ukončení',
        'Mlčenlivost a osobní údaje',
        'Závěrečná ustanovení a podpisy',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj smlouvu o poskytování služeb dle § 1746 odst. 2 a § 2430 a násl. ' +
      'zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Předmětem je ČINNOST, ne výsledek. Nepiš, že poskytovatel „předá dílo" ' +
      'ani že objednatel „dílo převezme" — to je smlouva o dílo podle § 2586\n' +
      '- NIKDY nevkládej znaky závislé práce: pracovní dobu, dovolenou, ' +
      'nadřízeného, docházku, pracoviště zaměstnavatele ani povinnost výhradně ' +
      'osobního výkonu. Je-li poskytovatelem fyzická osoba, je to nejzávažnější ' +
      'riziko celé smlouvy (§ 2 a § 3 ZP, sankce podle § 140 zák. č. 435/2004 Sb.)\n' +
      '- Naopak výslovně uveď, že poskytovatel určuje způsob a čas provedení sám, ' +
      'nese vlastní náklady a odpovědnost a může plnit prostřednictvím třetí osoby\n' +
      '- Ujednání o výpovědi uveď vždy. Bez něj se u smlouvy na dobu neurčitou ' +
      'uplatní § 1999 — zrušení jen ke konci kalendářního čtvrtletí a s tříměsíčním ' +
      'předstihem\n' +
      '- Nezaručuj konkrétní měřitelný výsledek (obrat, pozici ve vyhledávači), ' +
      'není-li v zadání. Poskytovatel odpovídá za odbornou péči\n' +
      '- Zahrnuje-li služba zpracování osobních údajů, uveď, že strany uzavřou ' +
      'samostatnou zpracovatelskou smlouvu podle čl. 28 GDPR. Nenahrazuj ji ' +
      'ustanovením o mlčenlivosti\n' +
      '- Nevymýšlej rozsah služeb ani ceny. Chybí-li, použij placeholder\n' +
      '- Podpisy uveď u OBOU stran\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'poskytovatel',
      label: 'Poskytovatel',
      role: 'strana, která poskytuje služby',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Sídlo / místo podnikání', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'objednatel',
      label: 'Objednatel',
      role: 'strana, která služby objednává a platí',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Sídlo / místo podnikání', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Zastoupen', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet',
      title: 'Předmět a rozsah služeb',
      fields: [
        {
          id: 'serviceDescription',
          label: 'Jaká činnost se poskytuje',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Popište činnost, ne výsledek. Slibuje-li se předání konkrétního ' +
            'výstupu, jde o smlouvu o dílo podle § 2586 NOZ.',
          placeholder:
            'např. správa serverové infrastruktury, monitoring dostupnosti a řešení incidentů',
          validation: { minLength: 10 },
        },
        {
          id: 'scope',
          label: 'Rozsah a četnost',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. 20 hodin měsíčně, reakce na incident do 4 hodin v pracovní dny',
          validation: { minLength: 3 },
        },
        {
          id: 'providerIsIndividual',
          label: 'Je poskytovatelem fyzická osoba (OSVČ)?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'U fyzické osoby hrozí posouzení jako závislá práce (§ 2 a § 3 ZP). ' +
            'Smlouva pak musí být zvlášť pečlivá.',
          options: [
            { value: 'ne', label: 'Ne — právnická osoba' },
            { value: 'ano', label: 'Ano — OSVČ' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'otherClients',
          label: 'Poskytovatel poskytuje služby i jiným objednatelům',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            'Výhradní působení pro jediného objednatele je jedním ze znaků, které ' +
            'inspekce práce hodnotí',
          conditional: { fieldId: 'providerIsIndividual', value: 'ano' },
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne — pouze pro tohoto objednatele' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'zpusob',
      title: 'Způsob poskytování',
      fields: [
        {
          id: 'independence',
          label: 'Poskytovatel určuje způsob a čas provedení sám',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Určuje-li čas a místo objednatel, jde o znak závislé práce ' +
            '(§ 2 odst. 1 a 2 ZP)',
          options: [
            { value: 'ano', label: 'Ano — poskytovatel si práci organizuje sám' },
            { value: 'ne', label: 'Ne — objednatel určuje čas i místo' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'ownResources',
          label: 'Poskytovatel používá vlastní prostředky a nese vlastní náklady',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2 odst. 2 ZP — práce na náklady a odpovědnost zaměstnavatele je závislá',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne — prostředky poskytuje objednatel' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'substitution',
          label: 'Může poskytovatel plnit prostřednictvím třetí osoby?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Povinnost výhradně osobního výkonu je znakem závislé práce. Možnost ' +
            'zastoupení ji vyvrací.',
          options: [
            { value: 'ano', label: 'Ano — s vědomím objednatele' },
            { value: 'ne', label: 'Ne — výhradně osobně' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'processesPersonalData',
          label: 'Zahrnuje služba zpracování osobních údajů pro objednatele?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 GDPR — pak je nutná samostatná zpracovatelská smlouva',
          options: [
            { value: 'ne', label: 'Ne' },
            { value: 'ano', label: 'Ano' },
          ],
          defaultValue: 'ne',
        },
      ],
    },
    {
      id: 'odmena',
      title: 'Odměna a fakturace',
      fields: [
        {
          id: 'feeType',
          label: 'Způsob odměňování',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Odměna za odpracovaný čas bez vazby na výstup se blíží mzdě — u OSVČ ' +
            'je bezpečnější paušál nebo cena za službu',
          options: [
            { value: 'pausal', label: 'Měsíční paušál' },
            { value: 'hodinova', label: 'Hodinová sazba' },
            { value: 'za-sluzbu', label: 'Cena za jednotlivou službu' },
          ],
          defaultValue: 'pausal',
        },
        {
          id: 'feeAmount',
          label: 'Výše odměny (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          validation: { min: 1 },
        },
        {
          id: 'vat',
          label: 'Odměna je uvedena',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'bez-dph', label: 'Bez DPH' },
            { value: 's-dph', label: 'Včetně DPH' },
            { value: 'neplatce', label: 'Poskytovatel není plátcem DPH' },
          ],
          defaultValue: 'bez-dph',
        },
        {
          id: 'invoiceDueDays',
          label: 'Splatnost faktur (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1, max: 90 },
          defaultValue: '14',
        },
        {
          id: 'expenses',
          label: 'Náklady poskytovatele',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2436 NOZ — bez ujednání náleží náhrada účelně vynaložených nákladů',
          options: [
            { value: 'zahrnuty', label: 'Zahrnuty v odměně' },
            { value: 'zvlast', label: 'Hradí objednatel zvlášť' },
          ],
          defaultValue: 'zahrnuty',
        },
      ],
    },
    {
      id: 'trvani',
      title: 'Doba trvání a ukončení',
      fields: [
        {
          id: 'duration',
          label: 'Smlouva se uzavírá',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'neurcita', label: 'Na dobu neurčitou' },
            { value: 'urcita', label: 'Na dobu určitou' },
          ],
          defaultValue: 'neurcita',
        },
        {
          id: 'endDate',
          label: 'Do kdy',
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
            '§ 1999 NOZ — bez ujednání lze u smlouvy na dobu neurčitou vypovědět ' +
            'jen ke konci kalendářního čtvrtletí s tříměsíčním předstihem. Ujednejte ' +
            'proto výslovně, co chcete.',
          validation: { min: 1, max: 12 },
          defaultValue: '1',
        },
        {
          id: 'noticeFromWhen',
          label: 'Výpovědní doba běží',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'prvni-den-mesice', label: 'Od prvního dne měsíce po doručení' },
            { value: 'doruceni', label: 'Ode dne doručení výpovědi' },
          ],
          defaultValue: 'prvni-den-mesice',
        },
      ],
    },
  ],
}
