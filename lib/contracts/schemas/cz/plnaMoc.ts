/**
 * Plná moc
 * Právní základ: § 441–449 zák. č. 89/2012 Sb. (občanský zákoník)
 * Kategorie: Občanské právo
 *
 * The form is built around the two things that get a power of attorney
 * refused: a scope that names the outcome instead of the steps, and a missing
 * certified signature where the underlying act needs one. The purpose selector
 * drives both — pick "převod nemovitosti" and the form asks about certification
 * and about the cadastral filing the signing authority does not cover.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const plnaMoc: ContractSchema = {
  metadata: {
    schemaId: 'plna-moc-v1',
    contractFamily: 'power-of-attorney',
    documentKind: 'unilateral',
    name: 'Plná moc',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 441–449 zák. č. 89/2012 Sb., občanský zákoník',
      '§ 441 odst. 1 NOZ — udělení plné moci a rozsah zástupčího oprávnění',
      '§ 441 odst. 2 NOZ — forma plné moci odpovídá formě zastupovaného jednání',
      '§ 438 NOZ — substituce',
      '§ 448 NOZ — zánik zmocnění',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Plná moc podle občanského zákoníku — zmocnění k jednání za jinou osobu, ' +
      'včetně úřadů, banky nebo převodu nemovitosti.',
    outputStructure: {
      sections: [
        'Zmocnitel',
        'Zmocněnec',
        'Rozsah zmocnění',
        'Doba platnosti',
        'Datum, místo a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj plnou moc dle § 441–449 zák. č. 89/2012 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Rozsah zmocnění vyjmenuj jako KONKRÉTNÍ ÚKONY, nikoli jako cíl. ' +
      'Oprávnění „podepsat kupní smlouvu" nezahrnuje podání návrhu na vklad ani ' +
      'jednání s katastrálním úřadem — pokud je zmocněnec má činit, uveď je zvlášť\n' +
      '- Týká-li se zmocnění nemovitosti, uveď, že podpis zmocnitele musí být ' +
      'úředně ověřen (§ 441 odst. 2 NOZ)\n' +
      '- Nikdy nepiš, že plnou moc nelze odvolat. Zmocnitel se práva odvolat ' +
      'zmocnění nemůže platně vzdát (§ 448 NOZ)\n' +
      '- Podpis uveď POUZE u zmocnitele. Přijetí zmocněncem je volitelné a připoj ' +
      'je jen tehdy, je-li v zadání\n' +
      '- Nerozšiřuj rozsah nad rámec zadání a nevymýšlej další oprávnění\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'zmocnitel',
      label: 'Zmocnitel',
      role: 'osoba, která zmocnění uděluje a plnou moc podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Datum narození', required: true, sensitivity: 'regulated' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u právnické osoby)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zmocnenec',
      label: 'Zmocněnec',
      role: 'osoba, která má za zmocnitele jednat',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení / název', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Bydliště / sídlo', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Datum narození', required: true, sensitivity: 'regulated' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO (u právnické osoby)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'ucel',
      title: 'K čemu plnou moc potřebujete',
      fields: [
        {
          id: 'purpose',
          label: 'Účel zmocnění',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 441 odst. 2 NOZ — vyžaduje-li zastupované jednání zvláštní formu, ' +
            'musí ji mít i plná moc',
          options: [
            { value: 'urady', label: 'Jednání s úřady' },
            { value: 'nemovitost', label: 'Převod nebo správa nemovitosti' },
            { value: 'banka', label: 'Jednání s bankou' },
            { value: 'vozidlo', label: 'Vozidlo a registr vozidel' },
            { value: 'obchodni', label: 'Obchodní jednání za firmu' },
            { value: 'jine', label: 'Jiný účel' },
          ],
          defaultValue: 'urady',
        },
        {
          id: 'scopeType',
          label: 'Šíře zmocnění',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Generální plná moc je platná, ale zmocněnec s ní může nakládat i s tím, ' +
            'na co zmocnitel nemyslel',
          options: [
            { value: 'specialni', label: 'Jen k vyjmenovaným úkonům (doporučeno)' },
            { value: 'generalni', label: 'Generální — ke všem právním jednáním' },
          ],
          defaultValue: 'specialni',
        },
      ],
    },
    {
      id: 'rozsah',
      title: 'Rozsah zmocnění',
      fields: [
        {
          id: 'actions',
          label: 'Konkrétní úkony, ke kterým zmocňujete',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Vyjmenujte úkony, ne cíl. „Podepsat kupní smlouvu" nezahrnuje podání ' +
            'návrhu na vklad do katastru — ten je třeba uvést zvlášť.',
          placeholder:
            'např. podepsat kupní smlouvu, podat návrh na vklad do katastru, ' +
            'převzít rozhodnutí, jednat s úřadem…',
          validation: { minLength: 10 },
        },
        {
          id: 'subject',
          label: 'Čeho se zmocnění týká',
          type: 'text',
          required: false,
          sensitivity: 'public',
          legalNote: 'U nemovitosti uveďte údaje z katastru, u vozidla VIN a SPZ',
          placeholder: 'např. byt č. 4, Dlouhá 12, k. ú. Staré Město, LV 1234',
        },
        {
          id: 'cadastreNotice',
          label: 'Zmocnění zahrnuje i podání návrhu na vklad',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            'Oprávnění podepsat smlouvu samo o sobě k podání návrhu na vklad nestačí',
          conditional: { fieldId: 'purpose', value: 'nemovitost' },
          options: [
            { value: 'ano', label: 'Ano — zmocněnec podá i návrh na vklad' },
            { value: 'ne', label: 'Ne — pouze podpis smlouvy' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'substitution',
          label: 'Zmocněnec smí ustanovit dalšího zástupce',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 438 NOZ — bez ujednání jedná zmocněnec osobně',
          options: [
            { value: 'ne', label: 'Ne — zmocněnec jedná osobně' },
            { value: 'ano', label: 'Ano — substituce povolena' },
          ],
          defaultValue: 'ne',
        },
      ],
    },
    {
      id: 'platnost',
      title: 'Doba platnosti a forma',
      fields: [
        {
          id: 'validityType',
          label: 'Plná moc platí',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 448 NOZ — zmocnění zaniká i vykonáním úkonu nebo odvoláním',
          options: [
            { value: 'do-splneni', label: 'Do splnění vyjmenovaných úkonů' },
            { value: 'do-data', label: 'Do určitého data' },
            { value: 'neurcito', label: 'Do odvolání' },
          ],
          defaultValue: 'do-splneni',
        },
        {
          id: 'validUntil',
          label: 'Platí do',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'validityType', value: 'do-data' },
        },
        {
          id: 'signatureCertification',
          label: 'Úřední ověření podpisu zmocnitele',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 441 odst. 2 NOZ — u nemovitosti katastrální úřad ověřený podpis vyžaduje',
          conditional: { fieldId: 'purpose', value: 'nemovitost' },
          options: [
            { value: 'ano', label: 'Ano — podpis bude úředně ověřen' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Datum a doplňující údaje',
      fields: [
        {
          id: 'issueDate',
          label: 'Datum udělení plné moci',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'issuePlace',
          label: 'Místo udělení',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. Praha',
        },
        {
          id: 'acceptance',
          label: 'Připojit přijetí zmocněncem',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: 'Zákon nevyžaduje, v praxi usnadňuje prokázání',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'additionalNotes',
          label: 'Další ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Omezení, pokyny zmocněnci apod.',
        },
      ],
    },
  ],
}
