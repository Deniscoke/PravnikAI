/**
 * Werkvertrag — Deutschland
 * Rechtsgrundlage: §§ 631–650 BGB (Werkvertrag); §§ 650a–650v BGB (Bauvertrag)
 * Kategorie: Zivilrecht
 */

import type { ContractSchema } from '../../types'

export const werkvertrag: ContractSchema = {
  metadata: {
    schemaId: 'werkvertrag-v1',
    contractFamily: 'services',
    name: 'Werkvertrag',
    version: '1.0.0',
    jurisdiction: 'DE',
    currency: 'EUR',
    legalBasis: [
      '§§ 631–650 BGB — Werkvertragsrecht',
      '§ 631 BGB — Vertragstypische Pflichten',
      '§ 632a BGB — Abschlagszahlungen',
      '§ 640 BGB — Abnahme',
      '§§ 633–639 BGB — Mängelrechte',
    ],
    sensitivity: 'standard',
    category: 'civil',
    description: 'Vertrag über die Herstellung eines Werkes gegen Vergütung.',
    outputStructure: {
      sections: [
        'Vertragsparteien',
        'Werkbeschreibung',
        'Vergütung',
        'Ausführungsfrist',
        'Abnahme',
        'Mängelrechte und Gewährleistung',
        'Schlussbestimmungen',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Zuständig ist das Gericht am Sitz des Beklagten',
    },
    aiInstructions:
      'Erstelle den Werkvertrag gemäß §§ 631–650 BGB.\n\n' +
      'PFLICHTKLAUSELN:\n' +
      '1. Identifikation Besteller und Unternehmer\n' +
      '2. Werkbeschreibung — hinreichend bestimmt; Leistungsumfang konkret\n' +
      '3. Vergütung — Pauschal-/Einheitspreis/Stundensatz; brutto/netto; USt-Hinweis\n' +
      '4. Zahlungsweise — Abschlagszahlungen (§ 632a BGB), Schlusszahlung nach Abnahme\n' +
      '5. Ausführungsfrist — Beginn und Fertigstellungstermin\n' +
      '6. Abnahme — Ablauf, Form (förmlich/konkludent), Mängelvorbehalt (§ 640 BGB)\n' +
      '7. Mängelrechte — Nacherfüllung, Selbstvornahme, Rücktritt, Minderung, Schadensersatz (§§ 634–639 BGB)\n' +
      '8. Gefahrtragung — § 644 BGB Übergang bei Abnahme\n' +
      '9. Verjährung der Mängelansprüche — 2 Jahre, bei Bauwerk 5 Jahre (§ 634a BGB)\n' +
      '10. Kündigung — § 648 BGB Kündigungsrecht des Bestellers\n' +
      '11. Schlussbestimmungen — Schriftform, Salvatorische Klausel, Gerichtsstand\n' +
      '12. Unterschriftsblöcke\n\n' +
      'RECHTLICHE HINWEISE:\n' +
      '- Bauverträge unterliegen den Sondervorschriften §§ 650a–650v BGB\n' +
      '- Verbraucherbauverträge §§ 650i ff. BGB — besondere Schutzvorschriften\n' +
      '- VOB/B-Klauseln nur, wenn ausdrücklich vereinbart\n' +
      '- Erfinde keine Beträge oder Daten, wenn nicht im Briefing',
  },

  parties: [
    {
      id: 'besteller',
      label: 'Besteller',
      role: 'beauftragt das Werk und schuldet die Vergütung',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'unternehmer',
      label: 'Unternehmer',
      role: 'erbringt das Werk',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Bankverbindung (IBAN)', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'werk',
      title: 'Werkbeschreibung',
      fields: [
        {
          id: 'workDescription',
          label: 'Beschreibung des Werkes',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 631 BGB — Werk muss hinreichend bestimmt sein',
          placeholder: 'Detaillierte Beschreibung der herzustellenden Leistung, Materialien, Spezifikationen…',
          validation: { minLength: 30 },
        },
      ],
    },
    {
      id: 'verguetung',
      title: 'Vergütung',
      fields: [
        {
          id: 'priceType',
          label: 'Vergütungsart',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'pauschal', label: 'Pauschalpreis' },
            { value: 'einheitspreis', label: 'Einheitspreise' },
            { value: 'stundensatz', label: 'Stundensatz' },
            { value: 'kostenanschlag', label: 'Kostenanschlag (§ 650 BGB)' },
          ],
        },
        {
          id: 'price',
          label: 'Vergütung (EUR netto)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 0 },
        },
        {
          id: 'vatNote',
          label: 'Umsatzsteuer',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'inkl-ust', label: 'inkl. gesetzlicher USt.' },
            { value: 'zzgl-ust', label: 'zzgl. gesetzlicher USt.' },
            { value: 'ohne-ust', label: 'ohne USt. (Kleinunternehmer)' },
          ],
        },
        {
          id: 'paymentTerms',
          label: 'Zahlungsbedingungen',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'nach-abnahme', label: 'Vollständig nach Abnahme' },
            { value: 'abschlaege', label: 'Abschlagszahlungen + Schlussrechnung (§ 632a BGB)' },
            { value: 'vorauszahlung', label: 'Anzahlung + Schlussrechnung' },
          ],
        },
      ],
    },
    {
      id: 'fristen',
      title: 'Ausführungsfrist und Abnahme',
      fields: [
        {
          id: 'startDate',
          label: 'Beginn der Ausführung',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'completionDate',
          label: 'Fertigstellungstermin',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'acceptanceForm',
          label: 'Form der Abnahme',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 640 BGB — Abnahme; konkludente Abnahme möglich',
          options: [
            { value: 'foermlich', label: 'Förmliche Abnahme mit Protokoll' },
            { value: 'konkludent', label: 'Konkludente Abnahme durch Inbenutzungnahme' },
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
          id: 'warrantyPeriod',
          label: 'Gewährleistungsfrist',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 634a BGB — 2 Jahre allgemein, 5 Jahre bei Bauwerken',
          options: [
            { value: '2-jahre', label: '2 Jahre (Standard)' },
            { value: '5-jahre', label: '5 Jahre (Bauwerk / Werk an Bauwerk)' },
          ],
          defaultValue: '2-jahre',
        },
        {
          id: 'additionalNotes',
          label: 'Besondere Vereinbarungen',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'VOB/B-Geltung, Lieferbedingungen, Haftungsbegrenzung etc.',
        },
      ],
    },
  ],
}
