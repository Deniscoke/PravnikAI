/**
 * Geheimhaltungsvereinbarung (NDA) — Deutschland
 * Rechtsgrundlage: Geschäftsgeheimnisgesetz (GeschGehG) + §§ 305–310, 311 BGB
 * Kategorie: Handelsrecht
 */

import type { ContractSchema } from '../../types'

export const ndaDe: ContractSchema = {
  metadata: {
    schemaId: 'de-nda-v1',
    contractFamily: 'nda',
    name: 'Geheimhaltungsvereinbarung (NDA)',
    version: '1.0.0',
    jurisdiction: 'DE',
    currency: 'EUR',
    legalBasis: [
      'Gesetz zum Schutz von Geschäftsgeheimnissen (GeschGehG)',
      '§§ 311, 241 BGB — Schuldverhältnis aus Vereinbarung',
      '§§ 280, 339 BGB — Schadensersatz und Vertragsstrafe',
      '§§ 305–310 BGB — AGB-Kontrolle (bei vorformulierten Klauseln)',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description: 'Vereinbarung zum Schutz vertraulicher Informationen und Geschäftsgeheimnisse.',
    outputStructure: {
      sections: [
        'Vertragsparteien',
        'Definition vertraulicher Informationen',
        'Geheimhaltungsverpflichtung',
        'Ausnahmen von der Vertraulichkeit',
        'Pflichten der empfangenden Partei',
        'Laufzeit',
        'Rechtsfolgen bei Verstoß',
        'Schlussbestimmungen',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Zuständig ist das Gericht am Sitz der beklagten Partei, soweit gesetzlich zulässig',
    },
    aiInstructions:
      'Erstelle die Geheimhaltungsvereinbarung als rechtsgeschäftliche Vereinbarung im Sinne der §§ 311, 241 BGB unter Berücksichtigung des GeschGehG.\n\n' +
      'PFLICHTKLAUSELN für die NDA:\n' +
      '1. Identifikation der Parteien — Offenlegender und Empfänger (oder beidseitig)\n' +
      '2. Zweck — Anlass der Informationsweitergabe (z. B. Geschäftsanbahnung, Kooperation)\n' +
      '3. Definition vertraulicher Informationen — konkrete Festlegung; Bezug auf § 2 Nr. 1 GeschGehG\n' +
      '4. Form der Übermittlung — schriftlich/elektronisch/mündlich; Kennzeichnung als „vertraulich"\n' +
      '5. Ausnahmen — öffentlich bekannte, unabhängig entwickelte, von Dritten rechtmäßig erhaltene, behördlich angeforderte Informationen\n' +
      '6. Pflichten der empfangenden Partei — Schutzmaßnahmen nach § 2 Nr. 1 b) GeschGehG, Zugriffsbeschränkung, Kopierverbot\n' +
      '7. Zugelassener Personenkreis — Mitarbeiter, Berater (need-to-know-Prinzip)\n' +
      '8. Laufzeit der NDA und Fortbestand der Geheimhaltung nach Beendigung\n' +
      '9. Rückgabe / Vernichtung — Pflicht nach Beendigung\n' +
      '10. Vertragsstrafe — angemessen, gerichtlich überprüfbar (§ 343 BGB)\n' +
      '11. Schadensersatz — neben oder anstelle der Vertragsstrafe (§ 340 BGB beachten)\n' +
      '12. Bei vorformulierten Klauseln: AGB-Kontrolle (§§ 305–310 BGB)\n' +
      '13. Schlussbestimmungen — Rechtswahl, Gerichtsstand, Salvatorische Klausel\n' +
      '14. Unterschriftsblöcke\n\n' +
      'RECHTLICHE HINWEISE:\n' +
      '- Definiere „vertraulich" konkret — pauschale Definitionen sind angreifbar\n' +
      '- Vertragsstrafe nicht zu hoch ansetzen — § 343 BGB ermöglicht gerichtliche Herabsetzung\n' +
      '- Bei B2B kann Vertragsstrafe gem. § 348 HGB nicht gemindert werden, wenn Vollkaufmann\n' +
      '- Erfinde keine konkreten Vertragsstrafen-Beträge, wenn nicht im Briefing',
  },

  parties: [
    {
      id: 'offenlegender',
      label: 'Offenlegende Partei',
      role: 'Partei, die vertrauliche Informationen offenbart',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer (HRB / HRA)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'empfaenger',
      label: 'Empfangende Partei',
      role: 'Partei, die vertrauliche Informationen empfängt und zur Geheimhaltung verpflichtet wird',
      requiredFields: [
        { id: 'name', label: 'Name / Firma', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer (HRB / HRA)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'typ-nda',
      title: 'NDA-Typ',
      fields: [
        {
          id: 'ndaType',
          label: 'NDA-Typ',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'einseitig', label: 'Einseitig (nur die offenlegende Partei teilt Informationen)' },
            { value: 'beidseitig', label: 'Beidseitig (beide Parteien teilen Informationen)' },
          ],
        },
        {
          id: 'businessContext',
          label: 'Zweck der Informationsweitergabe',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          placeholder: 'Beschreibung der Zusammenarbeit oder des Geschäftsverhältnisses…',
          validation: { minLength: 20 },
        },
      ],
    },
    {
      id: 'definition',
      title: 'Vertrauliche Informationen',
      fields: [
        {
          id: 'confidentialInfoDefinition',
          label: 'Definition vertraulicher Informationen',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2 Nr. 1 GeschGehG — Geschäftsgeheimnis: geheim, wirtschaftlich wertvoll, durch angemessene Maßnahmen geschützt',
          placeholder: 'Kategorien vertraulicher Informationen: technisches Know-how, Kundendatenbanken, Finanzdaten, Geschäftsstrategie usw.',
          validation: { minLength: 30 },
        },
        {
          id: 'informationFormat',
          label: 'Form der Informationsübermittlung',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'alle-formen', label: 'Alle Formen (schriftlich, elektronisch, mündlich, visuell)' },
            { value: 'schriftlich', label: 'Nur schriftlich und elektronisch' },
            { value: 'gekennzeichnet', label: 'Nur als „vertraulich" gekennzeichnete Informationen' },
          ],
          defaultValue: 'alle-formen',
        },
      ],
    },
    {
      id: 'laufzeit',
      title: 'Laufzeit',
      fields: [
        {
          id: 'effectiveDate',
          label: 'Wirksamkeitsdatum',
          type: 'date',
          required: true,
          sensitivity: 'public',
        },
        {
          id: 'ndaDuration',
          label: 'Dauer der Geheimhaltungsverpflichtung',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: '1-jahr', label: '1 Jahr ab Vertragsschluss' },
            { value: '2-jahre', label: '2 Jahre ab Vertragsschluss' },
            { value: '3-jahre', label: '3 Jahre ab Vertragsschluss' },
            { value: '5-jahre', label: '5 Jahre ab Vertragsschluss' },
            { value: 'unbefristet', label: 'Solange das Geschäftsgeheimnis Bestand hat (unbefristet)' },
          ],
        },
        {
          id: 'postTerminationPeriod',
          label: 'Fortbestand nach Beendigung der Zusammenarbeit',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: '1-jahr', label: '1 Jahr nach Beendigung' },
            { value: '2-jahre', label: '2 Jahre nach Beendigung' },
            { value: '3-jahre', label: '3 Jahre nach Beendigung' },
            { value: 'identisch', label: 'Identisch mit der oben gewählten Dauer' },
          ],
        },
      ],
    },
    {
      id: 'sanktionen',
      title: 'Rechtsfolgen bei Verstoß',
      fields: [
        {
          id: 'penaltyAmount',
          label: 'Vertragsstrafe je Verstoß (EUR)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 339 BGB — Vertragsstrafe; § 343 BGB — gerichtliche Herabsetzung möglich',
          validation: { min: 0 },
        },
        {
          id: 'damagesClause',
          label: 'Schadensersatz neben Vertragsstrafe',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: '§ 340 BGB — Schadensersatz nur, wenn ausdrücklich vereinbart',
          options: [
            { value: 'neben-strafe', label: 'Schadensersatz kann neben der Vertragsstrafe geltend gemacht werden' },
            { value: 'nur-strafe', label: 'Vertragsstrafe ist Pauschale — kein zusätzlicher Schadensersatz' },
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
          id: 'returnOfInformation',
          label: 'Rückgabe / Vernichtung nach Beendigung',
          type: 'select',
          required: false,
          sensitivity: 'public',
          options: [
            { value: 'rueckgabe', label: 'Empfänger gibt sämtliche Materialien zurück' },
            { value: 'vernichtung', label: 'Empfänger vernichtet / löscht sämtliche Materialien' },
            { value: 'beides', label: 'Rückgabe der Originale + Vernichtung der Kopien' },
          ],
          defaultValue: 'vernichtung',
        },
        {
          id: 'additionalNotes',
          label: 'Besondere Vereinbarungen',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Ausnahmen, befugte Personen, Compliance-Anforderungen etc.',
        },
      ],
    },
  ],
}
