/**
 * Dohoda o pracovní činnosti (DPČ)
 * Právní základ: § 74, § 76–77 zák. č. 262/2006 Sb. (zákoník práce)
 * Kategorie: Pracovní právo
 *
 * Práce konaná MIMO pracovní poměr, stejně jako DPP — a se stejným důsledkem:
 * pravidla o výpovědní době (§ 51), dovolené (§ 213) a výpovědních důvodech
 * (§ 52) se na ni nevztahují.
 *
 * Od DPP se liší způsobem omezení rozsahu. DPP má roční strop 300 hodin; DPČ
 * žádný roční strop nemá, ale práce nesmí v průměru překročit polovinu
 * stanovené týdenní pracovní doby, posuzováno nejvýše za 52 týdnů. Pro
 * pravidelnou práci po celý rok je proto vhodnější DPČ.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'
import { MINIMUM_HOURLY_WAGE_CZK } from '@/lib/legal/czechLegalFacts'

/**
 * Half of the standard 40-hour week — the average a DPČ may not exceed,
 * assessed over at most 52 weeks (§ 76 odst. 2 a 3 ZP).
 */
const MAX_AVERAGE_HOURS_PER_WEEK = 20

export const dohodaOPracovniCinnosti: ContractSchema = {
  metadata: {
    schemaId: 'dohoda-o-pracovni-cinnosti-v1',
    contractFamily: 'employment-agreement',
    name: 'Dohoda o pracovní činnosti (DPČ)',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 74, § 76–77 zák. č. 262/2006 Sb., zákoník práce',
      '§ 76 odst. 2 a 3 ZP — rozsah nejvýše v průměru polovina stanovené týdenní pracovní doby',
      '§ 77 odst. 1 ZP — písemná forma',
      '§ 77 odst. 4 ZP — zrušení dohody',
      '§ 77 odst. 8 ZP — dovolená z dohody',
      '§ 74 odst. 2 ZP — písemný rozvrh pracovní doby',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description:
      'Dohoda o pracovní činnosti podle zákoníku práce — práce konaná mimo pracovní poměr ' +
      'v rozsahu nejvýše v průměru poloviny stanovené týdenní pracovní doby.',
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
      'Generuj dohodu o pracovní činnosti dle § 74, § 76–77 zák. č. 262/2006 Sb.\n' +
      'Zákonné požadavky na tento typ smlouvy najdeš v sekci „Právní požadavky" ' +
      'v zadání — projdi ji celou a řiď se jí.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Toto NENÍ pracovní smlouva ani dohoda o provedení práce. Nikdy nevkládej ' +
      'výpovědní dobu podle § 51, dovolenou v rozsahu 4 týdnů podle § 213, odstupné ' +
      'ani roční limit 300 hodin — ten platí pro DPP, nikoli pro DPČ\n' +
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
          legalNote: '§ 76 odst. 1 ZP — vymezení sjednané práce',
          placeholder: 'např. administrativní podpora, správa e-shopu, výuka',
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
          label: 'Sjednáno od',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'endDate',
          label: 'Sjednáno do (nevyplňujte u doby neurčité)',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 76 odst. 5 ZP — DPČ lze uzavřít na dobu určitou i neurčitou',
        },
        {
          id: 'weeklyHours',
          label: 'Sjednaný rozsah práce (hodin týdně v průměru)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: `§ 76 odst. 2 a 3 ZP — nejvýše v průměru ${MAX_AVERAGE_HOURS_PER_WEEK} hodin týdně, posuzováno nejvýše za 52 týdnů. Roční limit 300 hodin platí pro DPP, na DPČ se nevztahuje.`,
          validation: { min: 1, max: MAX_AVERAGE_HOURS_PER_WEEK },
          defaultValue: String(MAX_AVERAGE_HOURS_PER_WEEK),
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
