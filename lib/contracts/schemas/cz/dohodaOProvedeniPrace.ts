/**
 * Dohoda o provedení práce (DPP)
 * Právní základ: § 74–77 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * Práce konaná MIMO pracovní poměr. The distinction is the whole point: a
 * dohoda is not a pracovní smlouva, so the rules on notice periods (§ 51),
 * leave (§ 213) and dismissal grounds (§ 52) do not reach it. Drafting it from
 * the employment-contract checklist produces clauses that either do nothing or
 * mislead.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'
import { MINIMUM_HOURLY_WAGE_CZK } from '@/lib/legal/czechLegalFacts'

/** Annual ceiling for a DPP with one employer (§ 75 ZP). */
const MAX_HOURS_PER_YEAR = 300

export const dohodaOProvedeniPrace: ContractSchema = {
  metadata: {
    schemaId: 'dohoda-o-provedeni-prace-v1',
    contractFamily: 'employment-agreement',
    name: 'Dohoda o provedení práce (DPP)',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 74–77 zák. č. 262/2006 Sb., zákoník práce',
      '§ 75 ZP — rozsah práce nejvýše 300 hodin v kalendářním roce',
      '§ 77 odst. 1 ZP — písemná forma',
      '§ 77 odst. 4 ZP — zrušení dohody',
      '§ 77 odst. 8 ZP — dovolená z dohody',
      '§ 74 odst. 2 ZP — písemný rozvrh pracovní doby',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description:
      'Dohoda o provedení práce podle zákoníku práce — práce konaná mimo pracovní poměr ' +
      'v rozsahu nejvýše 300 hodin ročně u jednoho zaměstnavatele.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Sjednaná práce',
        'Doba a rozsah práce',
        'Místo výkonu práce',
        'Odměna a její splatnost',
        'Rozvrh pracovní doby',
        'Práva a povinnosti stran',
        'Zrušení dohody',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Příslušný soud dle místa výkonu práce (§ 12 OSŘ)',
    },
    // Zákonné požadavky nejsou zde — jsou v lib/legal/knowledge a vkládají se
    // do uživatelského promptu. Zde zůstávají jen pokyny ke stylu a pravidla
    // proti vymýšlení obsahu, která nejsou právní úpravou.
    aiInstructions:
      'Generuj dohodu o provedení práce dle § 74–77 zák. č. 262/2006 Sb.\n' +
      'Zákonné požadavky na tento typ smlouvy najdeš v sekci „Právní požadavky" ' +
      'v zadání — projdi ji celou a řiď se jí.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Toto NENÍ pracovní smlouva. Nikdy nevkládej výpovědní dobu podle § 51, ' +
      'dovolenou v rozsahu 4 týdnů podle § 213 ani odstupné — na dohodu se nevztahují\n' +
      '- Používej pojem „odměna z dohody", nikoli „mzda" ani „plat"\n' +
      '- Odměnu uváděj číselně i slovy\n' +
      '- Nevymýšlej benefity, prémie, konkurenční doložku ani sankce, které nejsou v zadání\n' +
      '- Neuváděj zdravotní pojišťovnu ani rodné číslo, pokud nejsou v zadání\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'zamestnavatel',
      label: 'Zaměstnavatel',
      role: 'osoba, pro kterou je práce vykonávána',
      requiredFields: [
        { id: 'name', label: 'Obchodní firma / název nebo jméno', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal', legalNote: '§ 435 NOZ — podnikatel uvádí IČO' },
        { id: 'address', label: 'Sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zamestnanec',
      label: 'Zaměstnanec',
      role: 'fyzická osoba, která se zavazuje vykonat sjednaný pracovní úkol',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Trvalé bydliště', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Datum narození', required: true, sensitivity: 'regulated', legalNote: 'Postačí datum narození; rodné číslo neuváděj, není-li nezbytné' },
      ],
      optionalFields: [
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro výplatu odměny', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'sjednana-prace',
      title: 'Sjednaná práce',
      fields: [
        {
          id: 'workTask',
          label: 'Sjednaná práce / pracovní úkol',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 75 ZP — dohoda se uzavírá na konkrétní pracovní úkol',
          placeholder: 'např. lektor kurzu anglického jazyka, úklid provozovny',
          validation: { minLength: 3 },
        },
        {
          id: 'workDescription',
          label: 'Bližší popis práce',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Podrobnější vymezení činnosti, rozsah, očekávaný výsledek…',
        },
      ],
    },
    {
      id: 'doba-rozsah',
      title: 'Doba a rozsah práce',
      fields: [
        {
          id: 'startDate',
          label: 'Práce bude provedena od',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'endDate',
          label: 'Práce bude provedena do',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 75 ZP — dohoda se uzavírá na dobu určitou nebo do splnění úkolu',
        },
        {
          id: 'maxHours',
          label: `Sjednaný rozsah práce (hodin v kalendářním roce)`,
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: `§ 75 ZP — nejvýše ${MAX_HOURS_PER_YEAR} hodin ročně u téhož zaměstnavatele; započítávají se i další DPP u stejného zaměstnavatele`,
          validation: { min: 1, max: MAX_HOURS_PER_YEAR },
          defaultValue: String(MAX_HOURS_PER_YEAR),
        },
      ],
    },
    {
      id: 'misto-prace',
      title: 'Místo výkonu práce',
      fields: [
        {
          id: 'workplace',
          label: 'Místo výkonu práce',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Adresa pracoviště, případně „práce na dálku"',
        },
      ],
    },
    {
      id: 'odmena',
      title: 'Odměna',
      fields: [
        {
          id: 'hourlyRate',
          label: 'Odměna za hodinu (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'personal',
          legalNote: `§ 111 ZP — nesmí být nižší než minimální hodinová mzda, od ${MINIMUM_HOURLY_WAGE_CZK.effectiveFrom} ${MINIMUM_HOURLY_WAGE_CZK.value} Kč/hod`,
          validation: { min: MINIMUM_HOURLY_WAGE_CZK.value },
        },
        {
          id: 'paymentTerm',
          label: 'Splatnost odměny',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 141 ZP — nejpozději v kalendářním měsíci následujícím po měsíci, ve kterém vznikl nárok. ' +
            'Dřívější termín je pro zaměstnance výhodnější.',
          options: [
            { value: '15', label: 'do 15. dne následujícího měsíce' },
            { value: '20', label: 'do 20. dne následujícího měsíce' },
            { value: 'konec', label: 'do konce následujícího měsíce (zákonné maximum)' },
          ],
          defaultValue: '20',
        },
        {
          id: 'timesheet',
          label: 'Podklad pro výplatu',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'vykaz', label: 'Měsíční výkaz odpracovaných hodin' },
            { value: 'bez', label: 'Bez zvláštního výkazu' },
          ],
          defaultValue: 'vykaz',
        },
      ],
    },
    {
      id: 'rozvrh',
      title: 'Rozvrh pracovní doby',
      fields: [
        {
          id: 'scheduleNotice',
          label: 'Seznámení s rozvrhem pracovní doby',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            '§ 74 odst. 2 ZP — nejpozději 3 dny předem, nedohodnou-li se strany na jiné době. ' +
            'Kratší lhůtu lze sjednat, delší je pro zaměstnance výhodnější.',
          options: [
            { value: '3', label: '3 dny předem (zákonná úprava)' },
            { value: '7', label: '7 dní předem' },
            { value: '1', label: '1 den předem (sjednaná odchylka)' },
          ],
          defaultValue: '3',
        },
      ],
    },
    {
      id: 'zaverecna',
      title: 'Závěrečná ustanovení',
      fields: [
        {
          id: 'contractDate',
          label: 'Datum uzavření dohody',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'additionalNotes',
          label: 'Další ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Mlčenlivost, pracovní pomůcky, školení BOZP apod.',
        },
      ],
    },
  ],
}
