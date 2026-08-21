/**
 * Smlouva o mlčenlivosti (NDA)
 * Právní základ: § 504 NOZ (obchodní tajemství) + smluvní svoboda § 1 odst. 2 NOZ
 * Kategorie: Obchodní právo
 *
 * NDA nemá v NOZ samostatné pojmenování — jde o nepojmenovanou smlouvu
 * (inominátní kontrakt) dle § 1746 odst. 2 NOZ, která chrání obchodní tajemství
 * definované v § 504 NOZ.
 */

import type { ContractSchema } from '../../types'

export const ndaSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'nda-smlouva-v1',
    contractFamily: 'nda',
    name: 'Smlouva o mlčenlivosti (NDA)',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      '§ 504 zák. č. 89/2012 Sb., NOZ — obchodní tajemství',
      '§ 1746 odst. 2 NOZ — inominátní smlouva (smluvní svoboda)',
      '§ 2988 NOZ — náhrada škody za porušení obchodního tajemství',
      '§ 2 zák. č. 221/2006 Sb. (ZOPDNP) — ochrana průmyslového vlastnictví',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description: 'Smlouva o ochraně důvěrných informací a obchodního tajemství.',
    outputStructure: {
      sections: [
        'Smluvní strany',
        'Definice důvěrných informací',
        'Závazek mlčenlivosti',
        'Výjimky z mlčenlivosti',
        'Povinnosti přijímající strany',
        'Trvání závazku',
        'Sankce za porušení',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Příslušný obecný soud dle místa sídla žalovaného',
    },
    // Zákonné požadavky nejsou zde — jsou v lib/legal/knowledge a vkládají se
    // do uživatelského promptu. Zde zůstávají jen pokyny ke stylu a pravidla
    // proti vymýšlení obsahu, která nejsou právní úpravou.
    aiInstructions:
      'Generuj NDA jako nepojmenovanou smlouvu dle § 1746 odst. 2 NOZ.\n' +
      'Zákonné požadavky na tento typ smlouvy najdeš v sekci „Právní požadavky" ' +
      'v zadání — projdi ji celou a řiď se jí.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Pro NDA neexistují zákonná dispozitivní pravidla, která by mezery doplnila. ' +
      'Co není ve smlouvě, to neplatí — proto piš úplně a určitě\n' +
      '- Závazek mlčenlivosti přežívá ukončení smlouvy; uveď to výslovně\n' +
      '- Nevymýšlej konkrétní výši smluvní pokuty, pokud není v zadání\n' +
      '- Nepřebírej anglosaské konstrukce (liquidated damages, indemnity) — ' +
      'v českém právu nemají přímý protějšek\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'poskytovatele',
      label: 'Poskytovatel (strana sdílející informace)',
      role: 'strana sdělující důvěrné informace druhé straně',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'prijemce',
      label: 'Příjemce (strana přijímající informace)',
      role: 'strana přijímající důvěrné informace a zavazující se k jejich ochraně',
      requiredFields: [
        { id: 'name', label: 'Jméno / obchodní firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Adresa / sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'IČO', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'typ-nda',
      title: 'Typ smlouvy o mlčenlivosti',
      fields: [
        {
          id: 'ndaType',
          label: 'Typ NDA',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'jednostranna', label: 'Jednostranná (informace sdílí pouze Poskytovatel)' },
            { value: 'vzajemna', label: 'Vzájemná (obě strany sdílejí informace)' },
          ],
        },
        {
          id: 'businessContext',
          label: 'Účel sdílení informací',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          placeholder: 'Popis spolupráce nebo obchodního vztahu, pro nějž jsou informace sdíleny…',
          validation: { minLength: 20 },
        },
      ],
    },
    {
      id: 'definice',
      title: 'Důvěrné informace',
      fields: [
        {
          id: 'confidentialInfoDefinition',
          label: 'Definice důvěrných informací',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 504 NOZ — obchodní tajemství: tajné, hospodářsky cenné, chráněné',
          placeholder: 'Popište kategorie důvěrných informací: technické know-how, databáze zákazníků, finanční data, obchodní strategie apod.',
          validation: { minLength: 30 },
        },
        {
          id: 'informationFormat',
          label: 'Forma předávaných informací',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'vsechny-formy', label: 'Veškeré formy (písemná, elektronická, ústní, vizuální)' },
            { value: 'pisemna', label: 'Pouze písemná a elektronická' },
            { value: 'oznacene', label: 'Pouze informace označené jako „Důvěrné"' },
          ],
          defaultValue: 'vsechny-formy',
        },
      ],
    },
    {
      id: 'trvani',
      title: 'Trvání závazku',
      fields: [
        {
          id: 'effectiveDate',
          label: 'Datum účinnosti smlouvy',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'ndaDuration',
          label: 'Délka závazku mlčenlivosti',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2048 NOZ — závazek musí být přiměřený, jinak ho soud může omezit',
          options: [
            { value: '1-rok', label: '1 rok od uzavření smlouvy' },
            { value: '2-roky', label: '2 roky od uzavření smlouvy' },
            { value: '3-roky', label: '3 roky od uzavření smlouvy' },
            { value: '5-let', label: '5 let od uzavření smlouvy' },
            { value: 'bez-omezeni', label: 'Po dobu ochrany obchodního tajemství (bez časového omezení)' },
          ],
        },
        {
          id: 'postTerminationPeriod',
          label: 'Trvání závazku po ukončení spolupráce',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: '1-rok', label: '1 rok po ukončení spolupráce' },
            { value: '2-roky', label: '2 roky po ukončení spolupráce' },
            { value: '3-roky', label: '3 roky po ukončení spolupráce' },
            { value: 'shodne', label: 'Shodně s délkou závazku dle výše' },
          ],
        },
      ],
    },
    {
      id: 'sankce',
      title: 'Sankce',
      fields: [
        {
          id: 'penaltyAmount',
          label: 'Smluvní pokuta za porušení (Kč)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2048–2052 NOZ — smluvní pokuta; soud může nepřiměřenou snížit',
          validation: { min: 0 },
        },
        {
          id: 'damagesClause',
          label: 'Náhrada škody nad smluvní pokutu',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 2051 NOZ — náhrada škody vedle smluvní pokuty jen je-li tak ujednáno',
          options: [
            { value: 'vedle-pokuty', label: 'Náhrada škody lze uplatnit vedle smluvní pokuty' },
            { value: 'pouze-pokuta', label: 'Smluvní pokuta je paušální — náhrada škody nevzniká zvlášť' },
          ],
        },
      ],
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
          id: 'returnOfInformation',
          label: 'Vrácení / zničení informací po ukončení',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'vraceni', label: 'Příjemce vrátí veškeré materiály' },
            { value: 'zniceni', label: 'Příjemce zničí / smaže veškeré materiály' },
            { value: 'oboji', label: 'Vrácení originálů + zničení kopií' },
          ],
          defaultValue: 'zniceni',
        },
        {
          id: 'additionalNotes',
          label: 'Zvláštní ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Výjimky, oprávněné osoby, compliance požadavky apod.',
        },
      ],
    },
  ],
}
