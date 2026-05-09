/**
 * Mietvertrag (Wohnraummiete) — Deutschland
 * Rechtsgrundlage: §§ 535–580a BGB; §§ 549–577a BGB Wohnraummiete; BetrKV; WoFlV
 * Kategorie: Immobilien
 */

import type { ContractSchema } from '../../types'

export const mietvertrag: ContractSchema = {
  metadata: {
    schemaId: 'mietvertrag-v1',
    contractFamily: 'tenancy',
    name: 'Mietvertrag (Wohnraum)',
    version: '1.0.0',
    jurisdiction: 'DE',
    currency: 'EUR',
    legalBasis: [
      '§§ 535–580a BGB — Mietrecht (allgemein)',
      '§§ 549–577a BGB — Sondervorschriften für Wohnraum',
      '§ 551 BGB — Mietsicherheit (max. 3 Nettokaltmieten)',
      '§§ 568, 573, 573c BGB — Kündigung',
      'Betriebskostenverordnung (BetrKV)',
    ],
    sensitivity: 'standard',
    category: 'realestate',
    description: 'Wohnraummietvertrag mit Mieterschutz nach BGB.',
    outputStructure: {
      sections: [
        'Vertragsparteien',
        'Mietsache',
        'Miete und Nebenkosten',
        'Mietsicherheit',
        'Mietzeit',
        'Pflichten der Parteien',
        'Kündigung',
        'Schlussbestimmungen',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Zuständig ist das Amtsgericht der belegenen Sache (§ 29a ZPO)',
    },
    aiInstructions:
      'Erstelle den Wohnraummietvertrag gemäß §§ 535–580a, 549–577a BGB.\n\n' +
      'PFLICHTKLAUSELN:\n' +
      '1. Identifikation Vermieter und Mieter\n' +
      '2. Beschreibung der Mietsache — Adresse, Stockwerk, Wohnungsgröße (m² nach WoFlV), Räumlichkeiten\n' +
      '3. Mitvermietete Nebenräume / Gemeinschaftsflächen\n' +
      '4. Beginn des Mietverhältnisses\n' +
      '5. Mietdauer (befristet nach § 575 BGB nur mit Sachgrund — sonst unbefristet)\n' +
      '6. Miete — Kalt- und Warmmiete, Höhe, Fälligkeit, Zahlungsweise (§ 556b BGB)\n' +
      '7. Betriebskosten — abrechenbar nach BetrKV; Vorauszahlung oder Pauschale\n' +
      '8. Mietsicherheit — höchstens 3 Nettokaltmieten (§ 551 Abs. 1 BGB), Anlagepflicht\n' +
      '9. Schönheitsreparaturen — wirksame Klauseln nur, wenn nicht starr (BGH-Rechtsprechung)\n' +
      '10. Kündigungsmöglichkeiten — § 568 BGB Form; § 573 BGB ordentliche Kündigung; § 573c BGB Fristen\n' +
      '11. Hausordnung / Nutzungsregeln\n' +
      '12. Übergabeprotokoll empfohlen\n' +
      '13. Schlussbestimmungen — Schriftform, Salvatorische Klausel\n' +
      '14. Unterschriftsblöcke\n\n' +
      'RECHTLICHE HINWEISE:\n' +
      '- Mieterschutz ist zwingend — Klauseln zum Nachteil des Mieters sind unwirksam\n' +
      '- Schönheitsreparaturen-Klauseln werden vom BGH streng geprüft (Quotenabgeltung u. ä.)\n' +
      '- Mieterhöhungen unterliegen § 558 BGB (Kappungsgrenze, Vergleichsmiete)\n' +
      '- Mietpreisbremse (§§ 556d ff. BGB) in betroffenen Gebieten beachten\n' +
      '- Erfinde keine konkreten Beträge oder Daten, wenn nicht im Briefing',
  },

  parties: [
    {
      id: 'vermieter',
      label: 'Vermieter',
      role: 'überlässt die Wohnung zum Gebrauch',
      requiredFields: [
        { id: 'name', label: 'Name / Firma des Vermieters', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Vertreten durch (Hausverwaltung)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Bankverbindung (IBAN)', required: false, sensitivity: 'regulated' },
      ],
    },
    {
      id: 'mieter',
      label: 'Mieter',
      role: 'erhält die Wohnung zum Gebrauch und schuldet die Miete',
      requiredFields: [
        { id: 'name', label: 'Vor- und Nachname', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Aktuelle Anschrift', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'birthNumber', label: 'Geburtsdatum', required: false, sensitivity: 'regulated' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'mietsache',
      title: 'Mietsache',
      fields: [
        {
          id: 'apartmentAddress',
          label: 'Anschrift der Mietsache',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Straße, Hausnummer, Stockwerk, PLZ, Ort',
        },
        {
          id: 'apartmentSize',
          label: 'Wohnfläche (m² nach WoFlV)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'WoFlV — Wohnflächenverordnung',
          validation: { min: 1 },
        },
        {
          id: 'rooms',
          label: 'Räume',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'z. B. „2 Zimmer, Küche, Bad, Flur, Balkon"',
        },
        {
          id: 'extras',
          label: 'Mitvermietete Nebenräume',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'z. B. Kellerabteil Nr. 5, Stellplatz Nr. 12',
        },
      ],
    },
    {
      id: 'mietzeit',
      title: 'Mietzeit',
      fields: [
        {
          id: 'startDate',
          label: 'Mietbeginn',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'rentalType',
          label: 'Mietdauer',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 575 BGB — Befristung nur mit Sachgrund',
          options: [
            { value: 'unbefristet', label: 'Unbefristet (Standard)' },
            { value: 'befristet', label: 'Befristet (Sachgrund nach § 575 BGB)' },
          ],
        },
        {
          id: 'endDate',
          label: 'Mietende',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'rentalType', value: 'befristet' },
        },
      ],
    },
    {
      id: 'miete',
      title: 'Miete und Nebenkosten',
      fields: [
        {
          id: 'coldRent',
          label: 'Kaltmiete (EUR / Monat)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 535 Abs. 2 BGB',
          validation: { min: 0 },
        },
        {
          id: 'utilities',
          label: 'Nebenkostenvorauszahlung (EUR / Monat)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 556 BGB i. V. m. BetrKV',
          validation: { min: 0 },
        },
        {
          id: 'paymentDay',
          label: 'Fälligkeitstag im Monat',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 556b Abs. 1 BGB — bis zum 3. Werktag',
          options: [
            { value: '3-werktag', label: 'Bis zum 3. Werktag des Monats (gesetzl. Standard)' },
            { value: 'monatsanfang', label: 'Bis zum 1. des Monats' },
          ],
          defaultValue: '3-werktag',
        },
      ],
    },
    {
      id: 'kaution',
      title: 'Mietsicherheit (Kaution)',
      fields: [
        {
          id: 'depositAmount',
          label: 'Kautionshöhe (EUR)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 551 BGB — höchstens 3 Nettokaltmieten; Ratenzahlung möglich',
          validation: { min: 0 },
        },
        {
          id: 'depositForm',
          label: 'Form der Kaution',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'sparkonto', label: 'Mietkautionssparkonto (vom Vermögen des Vermieters getrennt)' },
            { value: 'buergschaft', label: 'Bankbürgschaft' },
            { value: 'ratenzahlung', label: 'In 3 Raten gem. § 551 Abs. 2 BGB' },
          ],
        },
      ],
    },
    {
      id: 'schluss',
      title: 'Schlussbestimmungen',
      fields: [
        {
          id: 'contractDate',
          label: 'Datum des Vertragsschlusses',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'cosmeticRepairs',
          label: 'Schönheitsreparaturen',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: 'BGH: starre Fristen / Quotenabgeltung sind unwirksam',
          options: [
            { value: 'mieter', label: 'Mieter (mit weicher Klausel — Bedarfsabhängig)' },
            { value: 'vermieter', label: 'Vermieter (gesetzlicher Standard)' },
          ],
        },
        {
          id: 'additionalNotes',
          label: 'Besondere Vereinbarungen',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Tierhaltung, Mieterhöhungsklausel, Hausordnung, etc.',
        },
      ],
    },
  ],
}
