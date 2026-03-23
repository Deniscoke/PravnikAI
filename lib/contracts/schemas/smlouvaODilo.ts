/**
 * Smlouva o dílo
 * Právní základ: § 2586–2635 zák. č. 89/2012 Sb. (NOZ)
 * Kategorie: Občanské právo (s přesahem do obchodního)
 *
 * Pokud obě strany jsou podnikateli a dílo souvisí s podnikáním,
 * použijí se přednostně ustanovení o smlouvě o dílo mezi podnikateli
 * (NOZ nerozlišuje — záleží na faktu podnikatelského kontextu).
 */

import type { ContractSchema } from '../types'

export const smlouvaODilo: ContractSchema = {
  metadata: {
    schemaId: 'smlouva-o-dilo-v1',
    name: 'Smlouva o dílo',
    version: '1.0.0',
    jurisdiction: 'CZ',
    legalBasis: [
      '§ 2586–2635 zák. č. 89/2012 Sb., občanský zákoník (NOZ)',
      '§ 2587 NOZ — zhotovitel se zavazuje provést dílo na svůj náklad a nebezpečí',
      '§ 2610 NOZ — cena díla',
      '§ 2615–2619 NOZ — odpovědnost za vady díla',
    ],
    sensitivity: 'standard',
    category: 'občanské',
    description: 'Smlouva zavazující zhotovitele k provedení díla a objednatele k zaplacení ceny.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Předmět díla',
        'Cena díla a platební podmínky',
        'Termín provedení',
        'Předání a převzetí díla',
        'Odpovědnost za vady a záruka',
        'Práva duševního vlastnictví',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Příslušný obecný soud dle místa sídla žalovaného',
    },
    aiInstructions:
      'Generuj smlouvu o dílo dle § 2586–2635 NOZ. ' +
      'Jasně vymezte předmět díla — co přesně má být zhotoveno (§ 2587). ' +
      'Uveď, zda je cena pevná nebo odhadní (§ 2620 NOZ). ' +
      'Sjednej postup při vadách díla (§ 2615 NOZ) a záruční dobu. ' +
      'Pro dílo s prvky duševního vlastnictví (software, grafika) uveď licenční ujednání (§ 2370 NOZ). ' +
      'Odpovědnost za škodu při prodlení se řídí § 2913 NOZ.',
  },

  parties: [
    {
      id: 'objednatel',
      label: 'Objednatel',
      role: 'osoba, která si objednává provedení díla a zavazuje se zaplatit cenu',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zhotovitel',
      label: 'Zhotovitel',
      role: 'osoba, která se zavazuje provést dílo na svůj náklad a nebezpečí',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'predmet-dila',
      title: 'Předmět díla',
      fields: [
        {
          id: 'workDescription',
          label: 'Popis díla',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2587 NOZ — dílo musí být dostatečně určito',
          placeholder: 'Přesný popis toho, co má být zhotoveno nebo provedeno…',
          validation: { minLength: 30 },
        },
        {
          id: 'workType',
          label: 'Typ díla',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'stavebni', label: 'Stavební práce / rekonstrukce' },
            { value: 'software', label: 'Software / IT dílo' },
            { value: 'grafika', label: 'Grafické / umělecké dílo' },
            { value: 'servis', label: 'Servisní / opravárenské práce' },
            { value: 'jine', label: 'Jiný typ díla' },
          ],
        },
        {
          id: 'workSpecification',
          label: 'Technická specifikace / příloha',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Odkaz na technickou dokumentaci nebo podrobná specifikace…',
        },
      ],
    },
    {
      id: 'cena',
      title: 'Cena díla',
      fields: [
        {
          id: 'priceType',
          label: 'Typ ceny',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2620 NOZ — pevná cena nebo odhadní cena',
          options: [
            { value: 'pevna', label: 'Pevná cena (nemůže být překročena)' },
            { value: 'odhadni', label: 'Odhadní cena (může být překročena max. o 10 %)' },
            { value: 'hodinova-sazba', label: 'Hodinová sazba × odhadovaný počet hodin' },
          ],
        },
        {
          id: 'priceAmount',
          label: 'Cena díla (Kč)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1 },
        },
        {
          id: 'vatIncluded',
          label: 'DPH',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'bez-dph', label: 'Cena bez DPH' },
            { value: 'vcetne-dph', label: 'Cena včetně DPH' },
            { value: 'plus-dph', label: 'Cena + DPH dle platné sazby' },
          ],
        },
        {
          id: 'paymentSchedule',
          label: 'Platební podmínky',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'po-predani', label: 'Celá cena po předání díla' },
            { value: 'zaloha-zbytek', label: 'Záloha při podpisu + zbytek po předání' },
            { value: 'milniky', label: 'Dle milníků / etap' },
          ],
        },
        {
          id: 'advancePayment',
          label: 'Záloha (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          validation: { min: 0 },
          conditional: { fieldId: 'paymentSchedule', value: 'zaloha-zbytek' },
        },
      ],
    },
    {
      id: 'terminy',
      title: 'Termíny',
      fields: [
        {
          id: 'startDate',
          label: 'Datum zahájení prací',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'completionDate',
          label: 'Termín dokončení díla',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2597 NOZ — prodlení zhotovitele zakládá nárok na smluvní pokutu',
        },
        {
          id: 'penaltyForDelay',
          label: 'Smluvní pokuta za prodlení (Kč/den)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2048 NOZ — smluvní pokuta jako paušalizovaná náhrada škody',
          validation: { min: 0 },
        },
      ],
    },
    {
      id: 'vady-zaruka',
      title: 'Vady a záruka',
      fields: [
        {
          id: 'warrantyPeriod',
          label: 'Záruční doba (měsíce)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2619 NOZ — záruční doba na dílo',
          validation: { min: 0, max: 120 },
          defaultValue: '24',
        },
        {
          id: 'defectRemedyPeriod',
          label: 'Lhůta pro odstranění vad (dny)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2615 NOZ — objednatel má právo na bezplatné odstranění vad',
          defaultValue: '30',
        },
      ],
    },
    {
      id: 'ip-prava',
      title: 'Duševní vlastnictví',
      fields: [
        {
          id: 'ipOwnership',
          label: 'Vlastnictví práv duševního vlastnictví',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2370 NOZ — zakomponování do jiného díla; § 65 AZ — zaměstnanecké dílo',
          options: [
            { value: 'nerelevantni', label: 'Není relevantní pro tento typ díla' },
            { value: 'objednatel', label: 'Převod na objednatele po zaplacení ceny' },
            { value: 'licence-vyhradni', label: 'Výhradní licence objednateli' },
            { value: 'licence-nevyhradni', label: 'Nevýhradní licence objednateli' },
            { value: 'zhotovitel', label: 'Zůstávají zhotoviteli' },
          ],
        },
      ],
      conditional: { fieldId: 'workType', value: 'software' },
    },
    {
      id: 'zaverecna',
      title: 'Závěrečná ustanovení',
      fields: [
        {
          id: 'contractDate',
          label: 'Datum uzavření smlouvy',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'additionalNotes',
          label: 'Zvláštní ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Součinnost objednatele, subdodavatelé, mlčenlivost apod.',
        },
      ],
    },
  ],
}
