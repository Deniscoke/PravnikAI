/**
 * Kaufvertrag — Deutschland
 * Rechtsgrundlage: §§ 433–479 BGB (Kaufrecht)
 * Kategorie: Zivilrecht
 */

import type { ContractSchema } from '../../types'

export const kaufvertrag: ContractSchema = {
  metadata: {
    schemaId: 'kaufvertrag-v1',
    contractFamily: 'sale',
    name: 'Kaufvertrag',
    version: '1.0.0',
    jurisdiction: 'DE',
    currency: 'EUR',
    legalBasis: [
      '§§ 433–479 BGB — Kaufvertrag',
      '§ 433 BGB — Vertragstypische Pflichten',
      '§ 446 BGB — Gefahr- und Lastenübergang',
      '§§ 434–442 BGB — Sachmängel',
      'Bei Verbraucherkauf: §§ 474–479 BGB',
    ],
    sensitivity: 'standard',
    category: 'civil',
    description: 'Vertrag über die Übertragung des Eigentums an einer Sache gegen Zahlung des Kaufpreises.',
    outputStructure: {
      sections: [
        'Vertragsparteien',
        'Vertragsgegenstand',
        'Kaufpreis und Zahlungsweise',
        'Übergabe',
        'Eigentums- und Gefahrübergang',
        'Mängelhaftung',
        'Schlussbestimmungen',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Zuständig ist das Gericht am Sitz der beklagten Partei, soweit gesetzlich zulässig',
    },
    aiInstructions:
      'Erstelle den Kaufvertrag gemäß §§ 433–479 BGB.\n\n' +
      'PFLICHTKLAUSELN:\n' +
      '1. Identifikation der Vertragsparteien — präzise Angaben, keine Erfindungen\n' +
      '2. Vertragsgegenstand — bestimmte und detaillierte Beschreibung samt Identifikationsmerkmalen\n' +
      '3. Kaufpreis — exakte Höhe, Zahlungsweise und -termin; bei Ratenzahlung Tilgungsplan\n' +
      '4. Eigentumsübergang — ausdrückliche Vereinbarung des Übergangszeitpunkts (§ 929 BGB)\n' +
      '5. Übergabe — Ort, Art und Termin der Übergabe; Übergabeprotokoll empfehlenswert\n' +
      '6. Erklärungen des Verkäufers — er ist Eigentümer, die Sache ist frei von Rechten Dritter\n' +
      '7. Mängelhaftung — Rechte aus Sachmängeln (§§ 437, 438 BGB), Verjährungsfristen\n' +
      '8. Gefahrübergang — Übergang bei Übergabe (§ 446 BGB)\n' +
      '9. Rücktritt — Voraussetzungen (§§ 323, 326 Abs. 5 BGB)\n' +
      '10. Schlussbestimmungen — Rechtswahl, Gerichtsstand, Salvatorische Klausel, Schriftform\n' +
      '11. Unterschriftsblöcke beider Parteien\n\n' +
      'RECHTLICHE HINWEISE:\n' +
      '- Beim Verbraucherkauf §§ 474–479 BGB beachten — Mängelhaftung darf nicht zum Nachteil des Verbrauchers ausgeschlossen werden (§ 476 BGB)\n' +
      '- Kaufpreis numerisch und ggf. zusätzlich in Worten\n' +
      '- Bei vorformulierten Klauseln AGB-Kontrolle (§§ 305–310 BGB)\n' +
      '- Erfinde keine Vertragsstrafen, Verzugszinsen oder anderen Sanktionen, wenn nicht im Briefing',
  },

  parties: [
    {
      id: 'verkaeufer',
      label: 'Verkäufer',
      role: 'überträgt das Eigentum an der Sache',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer', required: false, sensitivity: 'personal', legalNote: 'Pflichtangabe für Kaufleute (§ 37a HGB)' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'kaeufer',
      label: 'Käufer',
      role: 'erwirbt das Eigentum gegen Zahlung des Kaufpreises',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'gegenstand',
      title: 'Vertragsgegenstand',
      fields: [
        {
          id: 'subjectDescription',
          label: 'Beschreibung des Vertragsgegenstands',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 433 BGB — der Vertragsgegenstand muss hinreichend bestimmt sein',
          placeholder: 'Genaue Beschreibung der Sache: Typ, Modell, Seriennummer, Zustand etc.',
          validation: { minLength: 20 },
        },
        {
          id: 'subjectCondition',
          label: 'Zustand',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'neu', label: 'Neu' },
            { value: 'gebraucht-gut', label: 'Gebraucht — guter Zustand' },
            { value: 'gebraucht-mangel', label: 'Gebraucht — mit Mängeln (siehe unten)' },
          ],
        },
        {
          id: 'defectsDescription',
          label: 'Mängelbeschreibung',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 434 BGB — bekannte Mängel sind dem Käufer mitzuteilen',
          placeholder: 'Beschreibung der bekannten Mängel',
          conditional: { fieldId: 'subjectCondition', value: 'gebraucht-mangel' },
        },
      ],
    },
    {
      id: 'preis',
      title: 'Kaufpreis',
      fields: [
        {
          id: 'price',
          label: 'Kaufpreis (EUR)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 433 Abs. 2 BGB — Kaufpreiszahlungspflicht des Käufers',
          validation: { min: 0.01 },
        },
        {
          id: 'vatNote',
          label: 'Umsatzsteuer',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'inkl-ust', label: 'Preis inkl. gesetzlicher USt.' },
            { value: 'zzgl-ust', label: 'Preis zzgl. gesetzlicher USt.' },
            { value: 'ohne-ust', label: 'Preis ohne USt. (Kleinunternehmer / steuerbefreit)' },
          ],
        },
        {
          id: 'paymentMethod',
          label: 'Zahlungsweise',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'bar', label: 'Bar bei Übergabe' },
            { value: 'ueberweisung', label: 'Banküberweisung' },
            { value: 'raten', label: 'Ratenzahlung' },
          ],
        },
        {
          id: 'paymentDeadline',
          label: 'Zahlungsfrist',
          type: 'date',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 271 BGB — Fälligkeit',
          conditional: { fieldId: 'paymentMethod', value: 'ueberweisung' },
        },
        {
          id: 'bankAccount',
          label: 'Bankverbindung des Verkäufers (IBAN / BIC)',
          type: 'text',
          required: false,
          sensitivity: 'regulated',
          placeholder: 'IBAN und BIC',
          conditional: { fieldId: 'paymentMethod', value: 'ueberweisung' },
        },
      ],
    },
    {
      id: 'uebergabe',
      title: 'Übergabe und Eigentumsübergang',
      fields: [
        {
          id: 'handoverDate',
          label: 'Übergabedatum',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 446 BGB — Gefahrübergang bei Übergabe',
        },
        {
          id: 'handoverPlace',
          label: 'Übergabeort',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Anschrift des Übergabeorts',
        },
        {
          id: 'ownershipTransfer',
          label: 'Zeitpunkt des Eigentumsübergangs',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§§ 929 ff. BGB — Eigentumsübergang an beweglichen Sachen',
          options: [
            { value: 'uebergabe', label: 'Mit Übergabe' },
            { value: 'zahlung', label: 'Mit vollständiger Zahlung des Kaufpreises (Eigentumsvorbehalt § 449 BGB)' },
            { value: 'unterzeichnung', label: 'Mit Unterzeichnung des Vertrags' },
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
          id: 'contractPlace',
          label: 'Ort des Vertragsschlusses',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'Stadt',
        },
        {
          id: 'additionalNotes',
          label: 'Besondere Vereinbarungen',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Weitere Vereinbarungen der Parteien…',
        },
      ],
    },
  ],
}
