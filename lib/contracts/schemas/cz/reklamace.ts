/**
 * Reklamace — uplatnění práv z vadného plnění
 * Právní základ: § 2161 a násl. zák. č. 89/2012 Sb., § 19 zák. č. 634/1992 Sb.
 * Kategorie: Občanské právo (spotřebitelská část občanského zákoníku)
 *
 * The form's job is to stop the user asking for the wrong thing. § 2169 gives
 * repair or replacement first, at the buyer's choice; a discount or withdrawal
 * only unlocks in the four situations listed in § 2171 odst. 1. So the form
 * asks which remedy is wanted and, if it is money, which of the four grounds
 * applies — rather than letting the user write "žádám vrácení peněz" and
 * collect a rejection they did not need.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const reklamace: ContractSchema = {
  metadata: {
    schemaId: 'reklamace-v1',
    contractFamily: 'complaint',
    documentKind: 'unilateral',
    name: 'Reklamace',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 2161 a násl. zák. č. 89/2012 Sb., občanský zákoník',
      '§ 2161 odst. 5 NOZ — roční domněnka existence vady při převzetí',
      '§ 2165 odst. 1 NOZ — vada se musí projevit do dvou let od převzetí',
      '§ 2169 odst. 1 NOZ — oprava nebo dodání nové věci podle volby kupujícího',
      '§ 2171 odst. 1 NOZ — kdy lze požadovat slevu nebo odstoupit',
      '§ 1924 NOZ — náhrada účelně vynaložených nákladů',
      '§ 19 zák. č. 634/1992 Sb., o ochraně spotřebitele — lhůta 30 dnů',
    ],
    sensitivity: 'sensitive',
    category: 'civil',
    description:
      'Reklamace zboží podle občanského zákoníku ve znění spotřebitelské novely ' +
      'č. 374/2022 Sb. — s uvedením zvoleného způsobu vyřízení a lhůty 30 dnů.',
    outputStructure: {
      sections: [
        'Označení prodávajícího a kupujícího',
        'Identifikace koupě',
        'Popis vady',
        'Uplatněné právo z vadného plnění',
        'Lhůta k vyřízení a náhrada nákladů',
        'Datum, doručení a podpis',
      ],
      requiresSignature: true,
    },
    aiInstructions:
      'Generuj reklamaci dle § 2161 a násl. zák. č. 89/2012 Sb. ve znění zákona ' +
      'č. 374/2022 Sb. a § 19 zák. č. 634/1992 Sb.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- NIKDY nepiš o „zákonné záruce 24 měsíců". Zákonná záruka po novele ' +
      'č. 374/2022 Sb. neexistuje. Piš, že vada se projevila v době dvou let ' +
      'od převzetí podle § 2165 odst. 1\n' +
      '- Požaduje-li kupující opravu nebo novou věc, uveď to jako volbu podle ' +
      '§ 2169 odst. 1 — volba náleží kupujícímu\n' +
      '- Požaduje-li kupující slevu nebo odstoupení, MUSÍŠ uvést, který z důvodů ' +
      '§ 2171 odst. 1 je naplněn, a popsat skutečnosti. Bez toho prodávající ' +
      'reklamaci oprávněně odmítne\n' +
      '- Projevila-li se vada do jednoho roku od převzetí, uveď domněnku podle ' +
      '§ 2161 odst. 5 — neexistenci vady prokazuje prodávající\n' +
      '- Uveď lhůtu 30 dnů podle § 19 odst. 3 zák. č. 634/1992 Sb. a to, že ' +
      'prodávající musí kupujícího o vyřízení informovat. NIKDY nepiš o lhůtě ' +
      'tří pracovních dnů — ta v zákoně není\n' +
      '- Marné uplynutí třicetidenní lhůty NEOZNAČUJ za podstatné porušení ' +
      'smlouvy. § 19 odst. 4 dává právo odstoupit nebo žádat slevu přímo\n' +
      '- Nevymýšlej okolnosti vady ani datum jejího projevu. Chybí-li, použij ' +
      'placeholder\n' +
      '- Podpis uveď POUZE u kupujícího\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'kupujici',
      label: 'Kupující',
      role: 'osoba, která reklamaci uplatňuje a dokument podepisuje',
      requiredFields: [
        { id: 'name', label: 'Jméno a příjmení', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa pro doručování', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'email', label: 'E-mail pro vyrozumění o vyřízení', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Číslo účtu pro vrácení peněz', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'prodavajici',
      label: 'Prodávající',
      role: 'podnikatel, u kterého bylo zboží koupeno — reklamaci přijímá',
      requiredFields: [
        { id: 'name', label: 'Název / jméno prodávajícího', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa provozovny nebo sídla', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'koupe',
      title: 'Identifikace koupě',
      fields: [
        {
          id: 'goodsDescription',
          label: 'Reklamované zboží',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. myčka nádobí Bosch SMS4HVI33E, výrobní číslo 123456',
          validation: { minLength: 3 },
        },
        {
          id: 'purchaseDate',
          label: 'Datum převzetí zboží',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2165 odst. 1 NOZ — od převzetí běží dvouletá doba, v níž se vada musí projevit',
        },
        {
          id: 'purchaseProof',
          label: 'Doklad o koupi',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'např. objednávka č. 2026/114, účtenka ze dne 3. 3. 2026',
          validation: { minLength: 3 },
        },
        {
          id: 'purchasePrice',
          label: 'Kupní cena (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'personal',
          validation: { min: 0 },
        },
        {
          id: 'goodsCondition',
          label: 'Stav zboží při koupi',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2168 NOZ — u použité věci mohou strany zkrátit dobu až na jeden rok, ' +
            'ale jen bylo-li to ujednáno',
          options: [
            { value: 'nove', label: 'Nové zboží' },
            { value: 'pouzite', label: 'Použité zboží' },
          ],
          defaultValue: 'nove',
        },
      ],
    },
    {
      id: 'vada',
      title: 'Popis vady',
      fields: [
        {
          id: 'defectDescription',
          label: 'V čem vada spočívá',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'Popište skutkově, ne obecně — „nefunguje to" umožní prodávajícímu ' +
            'reklamaci odmítnout pro neurčitost',
          placeholder:
            'např. přístroj se po přibližně deseti minutách provozu samovolně vypne a nelze jej znovu zapnout',
          validation: { minLength: 10 },
        },
        {
          id: 'defectAppearedDate',
          label: 'Kdy se vada poprvé projevila',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2161 odst. 5 NOZ — projeví-li se vada do jednoho roku od převzetí, ' +
            'prokazuje neexistenci vady prodávající',
        },
        {
          id: 'repeatedDefect',
          label: 'Projevila se vada opakovaně po předchozí opravě?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2171 odst. 1 písm. b) NOZ — opakovaný výskyt otevírá slevu i odstoupení',
          options: [
            { value: 'ne', label: 'Ne — reklamuji poprvé' },
            { value: 'ano', label: 'Ano — vada se projevila znovu po opravě' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'previousComplaints',
          label: 'Předchozí reklamace téže vady',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'repeatedDefect', value: 'ano' },
          placeholder: 'např. 1. reklamace 5. 5. 2026, oprava provedena 20. 5. 2026',
        },
      ],
    },
    {
      id: 'narok',
      title: 'Co požadujete',
      fields: [
        {
          id: 'remedy',
          label: 'Zvolený způsob vyřízení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 2169 odst. 1 NOZ — mezi opravou a novou věcí volí kupující. Sleva ' +
            'a odstoupení jsou dostupné jen za podmínek § 2171 odst. 1.',
          options: [
            { value: 'oprava', label: 'Odstranění vady opravou' },
            { value: 'vymena', label: 'Dodání nové věci bez vady' },
            { value: 'sleva', label: 'Přiměřená sleva z kupní ceny' },
            { value: 'odstoupeni', label: 'Odstoupení od smlouvy a vrácení peněz' },
          ],
          defaultValue: 'oprava',
        },
        {
          id: 'groundFor2171',
          label: 'Důvod podle § 2171 odst. 1',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote:
            'Slevu ani odstoupení nelze požadovat rovnou — musí být naplněn jeden ' +
            'z těchto důvodů',
          conditional: { fieldId: 'remedy', value: ['sleva', 'odstoupeni'] },
          options: [
            { value: 'odmitl', label: 'Prodávající vadu odmítl odstranit nebo ji neodstranil řádně' },
            { value: 'opakovane', label: 'Vada se projevila opakovaně' },
            { value: 'podstatne', label: 'Vada je podstatným porušením smlouvy' },
            { value: 'zjevne', label: 'Je zjevné, že vada nebude odstraněna v přiměřené době' },
          ],
        },
        {
          id: 'groundFacts',
          label: 'Skutečnosti, které důvod naplňují',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'remedy', value: ['sleva', 'odstoupeni'] },
          placeholder:
            'např. reklamaci ze dne 5. 5. 2026 prodávající zamítl s odůvodněním, že jde o běžné opotřebení',
        },
        {
          id: 'claimCosts',
          label: 'Uplatnit náhradu nákladů reklamace',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 1924 NOZ — poštovné, doprava, znalecký posudek',
          options: [
            { value: 'ano', label: 'Ano' },
            { value: 'ne', label: 'Ne' },
          ],
          defaultValue: 'ano',
        },
        {
          id: 'costsDetail',
          label: 'Jaké náklady',
          type: 'text',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'claimCosts', value: 'ano' },
          placeholder: 'např. poštovné 149 Kč za zaslání zboží k reklamaci',
        },
      ],
    },
    {
      id: 'doruceni',
      title: 'Lhůta a doručení',
      fields: [
        {
          id: 'settlementDays',
          label: 'Lhůta k vyřízení (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            '§ 19 odst. 3 zák. č. 634/1992 Sb. — reklamace musí být vyřízena ' +
            'a kupující informován do 30 dnů',
          validation: { min: 1, max: 30 },
          defaultValue: '30',
        },
        {
          id: 'deliveryMethod',
          label: 'Způsob doručení',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Od uplatnění reklamace běží třicetidenní lhůta — doručení je třeba prokázat',
          options: [
            { value: 'dorucenka', label: 'Doporučeně s dodejkou' },
            { value: 'osobne', label: 'Osobně v provozovně proti potvrzení' },
            { value: 'email', label: 'E-mailem' },
            { value: 'datovka', label: 'Datovou schránkou' },
          ],
          defaultValue: 'dorucenka',
        },
        {
          id: 'complaintDate',
          label: 'Datum vyhotovení',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
      ],
    },
  ],
}
