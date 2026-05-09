/**
 * Arbeitsvertrag — Deutschland
 * Rechtsgrundlage: §§ 611a–630 BGB; NachwG; KSchG; MiLoG; BUrlG; ArbZG; AGG
 * Kategorie: Arbeitsrecht
 *
 * Mindestangaben nach § 2 NachwG (Nachweisgesetz):
 *   1. Name + Anschrift der Vertragsparteien
 *   2. Beginn des Arbeitsverhältnisses
 *   3. Dauer (befristet/unbefristet)
 *   4. Arbeitsort
 *   5. Tätigkeit
 *   6. Vergütung
 *   7. Arbeitszeit
 *   8. Urlaub
 *   9. Kündigungsfristen
 */

import type { ContractSchema } from '../../types'

export const arbeitsvertrag: ContractSchema = {
  metadata: {
    schemaId: 'arbeitsvertrag-v1',
    contractFamily: 'employment',
    name: 'Arbeitsvertrag',
    version: '1.0.0',
    jurisdiction: 'DE',
    currency: 'EUR',
    legalBasis: [
      '§§ 611a–630 BGB — Dienstvertragsrecht (Arbeitsverhältnis)',
      'Nachweisgesetz (NachwG) — § 2 Mindestangaben',
      'Kündigungsschutzgesetz (KSchG)',
      'Mindestlohngesetz (MiLoG)',
      'Bundesurlaubsgesetz (BUrlG) — § 3 Mindesturlaub 24 Werktage',
      'Arbeitszeitgesetz (ArbZG)',
      'Allgemeines Gleichbehandlungsgesetz (AGG)',
    ],
    sensitivity: 'sensitive',
    category: 'employment',
    description: 'Arbeitsvertrag zwischen Arbeitgeber und Arbeitnehmer nach deutschem Arbeitsrecht.',
    outputStructure: {
      sections: [
        'Vertragsparteien',
        'Beginn und Dauer des Arbeitsverhältnisses',
        'Tätigkeit und Arbeitsort',
        'Vergütung',
        'Arbeitszeit',
        'Urlaub',
        'Probezeit und Kündigung',
        'Sonstige Bestimmungen',
        'Schlussbestimmungen',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'Arbeitsgericht am Sitz des Arbeitgebers',
    },
    aiInstructions:
      'Erstelle den Arbeitsvertrag gemäß §§ 611a ff. BGB unter Beachtung der Nachweispflicht (NachwG).\n\n' +
      'PFLICHTKLAUSELN (§ 2 NachwG):\n' +
      '1. Name und Anschrift beider Vertragsparteien\n' +
      '2. Beginn des Arbeitsverhältnisses und ggf. Befristung (TzBfG)\n' +
      '3. Arbeitsort — bei Wechsel ggf. Hinweis auf Mobilität\n' +
      '4. Tätigkeitsbezeichnung mit Beschreibung der Hauptaufgaben\n' +
      '5. Vergütung — Bruttohöhe, Fälligkeit, Auszahlungsweise (MiLoG-Mindestlohn beachten)\n' +
      '6. Arbeitszeit — Wochenstunden, ggf. flexible Regelungen (ArbZG: max. 8h/Tag, 48h/Woche)\n' +
      '7. Urlaub — Mindestens 24 Werktage / Jahr nach BUrlG\n' +
      '8. Probezeit — höchstens 6 Monate (§ 622 Abs. 3 BGB)\n' +
      '9. Kündigungsfristen — § 622 BGB (Mindestfristen, Staffelung nach Betriebszugehörigkeit)\n' +
      '10. Geheimhaltungs- und Wettbewerbsverbote — falls vereinbart, separate Klauseln\n' +
      '11. Anwendbarkeit von Tarifverträgen / Betriebsvereinbarungen — falls einschlägig\n' +
      '12. Schlussbestimmungen — Schriftform-Klausel, Salvatorische Klausel\n' +
      '13. Unterschriftsblöcke\n\n' +
      'RECHTLICHE HINWEISE:\n' +
      '- Mindestlohn nach MiLoG ist absolute Untergrenze\n' +
      '- Befristungen unterliegen dem TzBfG — Sachgrund oder sachgrundlose Befristung max. 2 Jahre\n' +
      '- Bei AGB-Vertrag (vorformuliert) §§ 305–310 BGB beachten\n' +
      '- Erfinde keine konkreten Beträge oder Daten, wenn nicht im Briefing\n' +
      '- AGG-konform formulieren (keine diskriminierenden Klauseln)',
  },

  parties: [
    {
      id: 'arbeitgeber',
      label: 'Arbeitgeber',
      role: 'beschäftigt den Arbeitnehmer und schuldet die Vergütung',
      requiredFields: [
        { id: 'name', label: 'Firma / Name des Arbeitgebers', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Anschrift / Sitz', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'ico', label: 'Handelsregisternummer (HRB / HRA)', required: false, sensitivity: 'personal' },
        { id: 'representative', label: 'Vertreten durch (Geschäftsführer)', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'arbeitnehmer',
      label: 'Arbeitnehmer',
      role: 'erbringt die Arbeitsleistung gegen Vergütung',
      requiredFields: [
        { id: 'name', label: 'Vor- und Nachname', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Wohnanschrift', required: true, sensitivity: 'personal' },
        { id: 'birthNumber', label: 'Geburtsdatum', required: true, sensitivity: 'regulated' },
      ],
      optionalFields: [
        { id: 'email', label: 'E-Mail', required: false, sensitivity: 'personal' },
        { id: 'phone', label: 'Telefon', required: false, sensitivity: 'personal' },
        { id: 'bankAccount', label: 'Bankverbindung (IBAN)', required: false, sensitivity: 'regulated' },
      ],
    },
  ],

  sections: [
    {
      id: 'beginn',
      title: 'Beginn und Dauer',
      fields: [
        {
          id: 'startDate',
          label: 'Beginn des Arbeitsverhältnisses',
          type: 'date',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 2 Abs. 1 Nr. 2 NachwG',
        },
        {
          id: 'contractType',
          label: 'Vertragstyp',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'Befristung nur mit Sachgrund oder nach § 14 Abs. 2 TzBfG (max. 2 Jahre, sachgrundlos)',
          options: [
            { value: 'unbefristet', label: 'Unbefristet' },
            { value: 'befristet-sachgrund', label: 'Befristet mit Sachgrund (§ 14 Abs. 1 TzBfG)' },
            { value: 'befristet-ohne-sachgrund', label: 'Sachgrundlos befristet (§ 14 Abs. 2 TzBfG, max. 2 Jahre)' },
          ],
        },
        {
          id: 'endDate',
          label: 'Befristungsende',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'contractType', value: 'befristet-sachgrund' },
        },
      ],
    },
    {
      id: 'taetigkeit',
      title: 'Tätigkeit und Arbeitsort',
      fields: [
        {
          id: 'jobTitle',
          label: 'Stellenbezeichnung',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'z. B. Software-Entwickler, Buchhalter, Vertriebsmitarbeiter',
        },
        {
          id: 'jobDescription',
          label: 'Beschreibung der Tätigkeit',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          placeholder: 'Hauptaufgaben und Verantwortungsbereich',
          validation: { minLength: 20 },
        },
        {
          id: 'workplace',
          label: 'Arbeitsort',
          type: 'text',
          required: true,
          sensitivity: 'public',
          placeholder: 'Adresse des regelmäßigen Arbeitsortes',
        },
      ],
    },
    {
      id: 'verguetung',
      title: 'Vergütung',
      fields: [
        {
          id: 'salary',
          label: 'Bruttovergütung (EUR)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'Mindestlohn nach MiLoG ist absolute Untergrenze',
          validation: { min: 0 },
        },
        {
          id: 'salaryFrequency',
          label: 'Vergütungsperiode',
          type: 'select',
          required: true,
          sensitivity: 'public',
          options: [
            { value: 'monatlich', label: 'Monatlich' },
            { value: 'stunde', label: 'Stundensatz' },
            { value: 'jaehrlich', label: 'Jahresgehalt (in 12 Monatsraten)' },
          ],
        },
        {
          id: 'paymentDate',
          label: 'Auszahlungstag',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'z. B. „Letzter Werktag des Monats"',
        },
      ],
    },
    {
      id: 'arbeitszeit',
      title: 'Arbeitszeit und Urlaub',
      fields: [
        {
          id: 'weeklyHours',
          label: 'Wochenarbeitszeit (Stunden)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'ArbZG: max. 8 h/Tag, 48 h/Woche (im Schnitt)',
          validation: { min: 1, max: 48 },
        },
        {
          id: 'vacationDays',
          label: 'Urlaubstage pro Jahr',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 3 BUrlG — mindestens 24 Werktage / 20 Arbeitstage bei 5-Tage-Woche',
          validation: { min: 20 },
        },
      ],
    },
    {
      id: 'kuendigung',
      title: 'Probezeit und Kündigung',
      fields: [
        {
          id: 'probationPeriod',
          label: 'Probezeit',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 622 Abs. 3 BGB — höchstens 6 Monate',
          options: [
            { value: 'keine', label: 'Keine Probezeit' },
            { value: '3-monate', label: '3 Monate' },
            { value: '6-monate', label: '6 Monate (Maximum)' },
          ],
        },
        {
          id: 'noticePeriod',
          label: 'Kündigungsfrist',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: '§ 622 BGB — Mindestfristen; Staffelung nach Betriebszugehörigkeit',
          options: [
            { value: 'gesetzlich', label: 'Gesetzliche Frist nach § 622 BGB' },
            { value: '4-wochen', label: '4 Wochen zum 15. oder Monatsende' },
            { value: '1-monat', label: '1 Monat zum Monatsende' },
            { value: '3-monate', label: '3 Monate zum Quartalsende' },
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
          id: 'collectiveAgreement',
          label: 'Anwendbarer Tarifvertrag',
          type: 'text',
          required: false,
          sensitivity: 'public',
          placeholder: 'z. B. Tarifvertrag der Metall- und Elektroindustrie NRW',
        },
        {
          id: 'additionalNotes',
          label: 'Besondere Vereinbarungen',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Wettbewerbsverbot, Geheimhaltung, Dienstwagen, etc.',
        },
      ],
    },
  ],
}
