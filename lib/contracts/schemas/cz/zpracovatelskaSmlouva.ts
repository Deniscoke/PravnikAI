/**
 * Zpracovatelská smlouva (DPA)
 * Právní základ: čl. 28 nařízení (EU) 2016/679 (GDPR)
 * Kategorie: Obchodní právo
 *
 * The form is deliberately made of specifics rather than tick-boxes, because
 * the EDPB says a processing agreement must set out concretely how each
 * Article 28 requirement will be met and not merely restate the regulation.
 * A contract promising "appropriate technical measures" repeats the law and
 * tells the controller nothing; one naming encryption, an access-control regime
 * and a 24-hour breach deadline actually binds someone to something.
 *
 * The breach window is the clearest example. The controller has 72 hours under
 * Article 33 to notify the supervisory authority, so "without undue delay" from
 * the processor is unusable — the form asks for a number of hours.
 *
 * Legal requirements come from lib/legal/knowledge — this file carries only the
 * form and the anti-invention instructions.
 */

import type { ContractSchema } from '../../types'

export const zpracovatelskaSmlouva: ContractSchema = {
  metadata: {
    schemaId: 'zpracovatelska-smlouva-v1',
    contractFamily: 'data-processing',
    name: 'Zpracovatelská smlouva (GDPR)',
    version: '1.0.0',
    jurisdiction: 'CZ',
    currency: 'CZK',
    legalBasis: [
      'čl. 28 nařízení (EU) 2016/679 (GDPR)',
      'čl. 28 odst. 3 GDPR — povinný obsah smlouvy',
      'čl. 32 GDPR — zabezpečení zpracování',
      'čl. 33 GDPR — ohlašování porušení zabezpečení',
      'čl. 44–49 GDPR — předávání do třetích zemí',
      'zák. č. 110/2019 Sb., o zpracování osobních údajů',
    ],
    sensitivity: 'sensitive',
    category: 'commercial',
    description:
      'Smlouva o zpracování osobních údajů mezi správcem a zpracovatelem podle ' +
      'čl. 28 GDPR — se všemi povinnými náležitostmi.',
    outputStructure: {
      sections: [
        'Smluvní strany a jejich role',
        'Předmět, povaha a účel zpracování',
        'Typy osobních údajů a kategorie subjektů údajů',
        'Doba zpracování',
        'Zpracování na doložené pokyny správce',
        'Mlčenlivost oprávněných osob',
        'Technická a organizační opatření',
        'Zapojení dalších zpracovatelů',
        'Součinnost při výkonu práv subjektů údajů',
        'Porušení zabezpečení a další součinnost',
        'Předávání do třetích zemí',
        'Výmaz nebo vrácení údajů po skončení',
        'Doložení souladu a audit',
        'Odpovědnost',
        'Závěrečná ustanovení',
      ],
      requiresSignature: true,
      defaultJurisdictionClause: 'České právo; dozorovým úřadem je ÚOOÚ',
    },
    aiInstructions:
      'Generuj zpracovatelskou smlouvu dle čl. 28 nařízení (EU) 2016/679.\n' +
      'Zákonné požadavky najdeš v sekci „Právní požadavky" v zadání — projdi ji celou.\n\n' +
      'POKYNY KE ZPRACOVÁNÍ:\n' +
      '- Smlouva MUSÍ obsahovat všech pět popisných prvků (předmět, doba, povaha, ' +
      'účel, typ údajů, kategorie subjektů) a všech osm povinností podle čl. 28 ' +
      'odst. 3 písm. a) až h). Žádnou nevynechávej\n' +
      '- NEOPISUJ text nařízení. U každé povinnosti uveď konkrétně, jak bude ' +
      'splněna — jmenovaná opatření, konkrétní lhůty, konkrétní subdodavatelé. ' +
      'Věta „zpracovatel přijme vhodná technická opatření" nemá žádnou hodnotu\n' +
      '- Lhůtu pro ohlášení porušení zabezpečení uveď v hodinách. Nikdy nepiš pouze ' +
      '„bez zbytečného odkladu" — správce má na ohlášení úřadu 72 hodin\n' +
      '- Volbu mezi výmazem a vrácením údajů po skončení činí SPRÁVCE, nikdy zpracovatel\n' +
      '- Nevylučuj a neomezuj odpovědnost zpracovatele vůči subjektům údajů — ' +
      'vůči nim je takové ujednání neúčinné (čl. 82 GDPR)\n' +
      '- Nevymýšlej bezpečnostní opatření, subdodavatele ani certifikace, které ' +
      'nejsou v zadání. Chybí-li údaj, použij placeholder\n' +
      '- Nikdy nepoužívej slovenskou právní terminologii',
  },

  parties: [
    {
      id: 'spravce',
      label: 'Správce',
      role: 'určuje účely a prostředky zpracování osobních údajů',
      requiredFields: [
        { id: 'name', label: 'Obchodní firma / název', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Kontaktní e-mail pro ochranu údajů', required: false, sensitivity: 'personal' },
      ],
    },
    {
      id: 'zpracovatel',
      label: 'Zpracovatel',
      role: 'zpracovává osobní údaje pro správce a na jeho pokyny',
      requiredFields: [
        { id: 'name', label: 'Obchodní firma / název', required: true, sensitivity: 'personal' },
        { id: 'ico', label: 'IČO', required: true, sensitivity: 'personal' },
        { id: 'address', label: 'Sídlo', required: true, sensitivity: 'personal' },
      ],
      optionalFields: [
        { id: 'representative', label: 'Jednající osoba', required: false, sensitivity: 'personal' },
        { id: 'email', label: 'Kontaktní e-mail pro ochranu údajů', required: false, sensitivity: 'personal' },
      ],
    },
  ],

  sections: [
    {
      id: 'zpracovani',
      title: 'Předmět, účel a doba zpracování',
      fields: [
        {
          id: 'subject',
          label: 'Předmět zpracování',
          type: 'text',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — povinná náležitost',
          placeholder: 'např. vedení mzdové agendy, provoz e-shopu, cloudové úložiště',
          validation: { minLength: 5 },
        },
        {
          id: 'purpose',
          label: 'Účel zpracování',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — proč správce údaje zpracovává',
          placeholder: 'např. výpočet a výplata mezd, plnění zákonných odvodových povinností',
          validation: { minLength: 5 },
        },
        {
          id: 'nature',
          label: 'Povaha zpracování — jaké operace zpracovatel provádí',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — ukládání, zpřístupňování, úprava, výmaz…',
          placeholder: 'např. ukládání, zpřístupňování oprávněným osobám, zálohování, výmaz',
          validation: { minLength: 5 },
        },
        {
          id: 'durationType',
          label: 'Doba zpracování',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — povinná náležitost',
          options: [
            { value: 'hlavni-smlouva', label: 'Po dobu trvání hlavní smlouvy' },
            { value: 'do-data', label: 'Do určitého data' },
            { value: 'neurcito', label: 'Na dobu neurčitou, do ukončení spolupráce' },
          ],
          defaultValue: 'hlavni-smlouva',
        },
        {
          id: 'durationUntil',
          label: 'Zpracování potrvá do',
          type: 'date',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'durationType', value: 'do-data' },
        },
      ],
    },
    {
      id: 'udaje',
      title: 'Rozsah údajů',
      fields: [
        {
          id: 'dataTypes',
          label: 'Typy osobních údajů',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — vyjmenujte konkrétně, ne obecně „osobní údaje"',
          placeholder: 'např. jméno a příjmení, datum narození, adresa, číslo účtu, výše mzdy',
          validation: { minLength: 5 },
        },
        {
          id: 'dataSubjects',
          label: 'Kategorie subjektů údajů',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 GDPR — čí údaje se zpracovávají',
          placeholder: 'např. zaměstnanci správce, zákazníci e-shopu, uchazeči o zaměstnání',
          validation: { minLength: 5 },
        },
        {
          id: 'specialCategories',
          label: 'Zahrnuje zpracování zvláštní kategorie údajů?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 9 GDPR — zdraví, biometrie, náboženství, členství v odborech',
          options: [
            { value: 'ne', label: 'Ne' },
            { value: 'ano', label: 'Ano' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'specialCategoriesDetail',
          label: 'Které zvláštní kategorie',
          type: 'text',
          required: false,
          sensitivity: 'regulated',
          conditional: { fieldId: 'specialCategories', value: 'ano' },
          placeholder: 'např. údaje o zdravotním stavu pro účely pracovnělékařských prohlídek',
        },
      ],
    },
    {
      id: 'bezpecnost',
      title: 'Technická a organizační opatření',
      fields: [
        {
          id: 'securityMeasures',
          label: 'Konkrétní zavedená opatření',
          type: 'textarea',
          required: true,
          sensitivity: 'public',
          legalNote:
            'čl. 32 GDPR — uveďte, co je skutečně zavedeno. Obecná věta o „vhodných ' +
            'opatřeních" pouze opisuje nařízení a správci nic neříká.',
          placeholder:
            'např. šifrování dat v úložišti i při přenosu, dvoufaktorové ověření, ' +
            'řízení přístupových práv podle rolí, denní zálohy s týdenním testem obnovy',
          validation: { minLength: 20 },
        },
        {
          id: 'encryption',
          label: 'Šifrování',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: 'čl. 32 odst. 1 písm. a) GDPR',
          options: [
            { value: 'oboje', label: 'V úložišti i při přenosu' },
            { value: 'prenos', label: 'Pouze při přenosu' },
            { value: 'zadne', label: 'Nešifruje se' },
          ],
          defaultValue: 'oboje',
        },
      ],
    },
    {
      id: 'subdodavatele',
      title: 'Další zpracovatelé',
      fields: [
        {
          id: 'subprocessorMode',
          label: 'Režim zapojení dalších zpracovatelů',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 2 GDPR — konkrétní nebo obecné písemné povolení',
          options: [
            { value: 'obecne', label: 'Obecné povolení s oznámením změn a právem námitky' },
            { value: 'konkretni', label: 'Jen s konkrétním předchozím souhlasem správce' },
            { value: 'zadni', label: 'Žádní další zpracovatelé' },
          ],
          defaultValue: 'obecne',
        },
        {
          id: 'subprocessorList',
          label: 'Seznam schválených dalších zpracovatelů',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          legalNote: 'Uveďte název, sídlo a činnost — obecný odkaz na „poskytovatele cloudu" nestačí',
          placeholder: 'např. Hosting s.r.o., Praha — provoz serverů',
        },
        {
          id: 'objectionDays',
          label: 'Lhůta pro námitku správce proti novému zpracovateli (dny)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'subprocessorMode', value: 'obecne' },
          validation: { min: 1, max: 90 },
          defaultValue: '14',
        },
      ],
    },
    {
      id: 'soucinnost',
      title: 'Součinnost a incidenty',
      fields: [
        {
          id: 'breachNotificationHours',
          label: 'Ohlášení porušení zabezpečení správci (hodin)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote:
            'čl. 33 GDPR — správce musí ohlásit dozorovému úřadu do 72 hodin, ' +
            'proto potřebuje zprávu od zpracovatele výrazně dřív',
          validation: { min: 1, max: 72 },
          defaultValue: '24',
        },
        {
          id: 'dataSubjectResponseDays',
          label: 'Lhůta pro součinnost při žádosti subjektu údajů (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 12 odst. 3 GDPR — správce má na vyřízení jeden měsíc',
          validation: { min: 1, max: 30 },
          defaultValue: '7',
        },
      ],
    },
    {
      id: 'treti-zeme',
      title: 'Předávání mimo EHP',
      fields: [
        {
          id: 'transferOutsideEEA',
          label: 'Předávají se údaje mimo EHP?',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 44–49 GDPR',
          options: [
            { value: 'ne', label: 'Ne, zpracování probíhá v EHP' },
            { value: 'ano', label: 'Ano' },
          ],
          defaultValue: 'ne',
        },
        {
          id: 'transferMechanism',
          label: 'Mechanismus předání',
          type: 'select',
          required: false,
          sensitivity: 'public',
          legalNote: 'Souhlas správce sám o sobě jako mechanismus nestačí',
          conditional: { fieldId: 'transferOutsideEEA', value: 'ano' },
          options: [
            { value: 'adekvatnost', label: 'Rozhodnutí o odpovídající ochraně' },
            { value: 'scc', label: 'Standardní smluvní doložky (SCC)' },
            { value: 'bcr', label: 'Závazná podniková pravidla (BCR)' },
          ],
          defaultValue: 'scc',
        },
        {
          id: 'transferCountries',
          label: 'Do kterých zemí',
          type: 'text',
          required: false,
          sensitivity: 'public',
          conditional: { fieldId: 'transferOutsideEEA', value: 'ano' },
          placeholder: 'např. USA (poskytovatel cloudu)',
        },
      ],
    },
    {
      id: 'ukonceni',
      title: 'Ukončení a audit',
      fields: [
        {
          id: 'endOfProcessing',
          label: 'Po skončení zpracování zpracovatel údaje',
          type: 'select',
          required: true,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 písm. g) GDPR — volba patří správci',
          options: [
            { value: 'volba', label: 'Podle volby správce vymaže nebo vrátí' },
            { value: 'vymaze', label: 'Vymaže' },
            { value: 'vrati', label: 'Vrátí a poté vymaže kopie' },
          ],
          defaultValue: 'volba',
        },
        {
          id: 'deletionDays',
          label: 'Lhůta pro výmaz nebo vrácení (dny)',
          type: 'number',
          required: true,
          sensitivity: 'public',
          validation: { min: 1, max: 180 },
          defaultValue: '30',
        },
        {
          id: 'auditNoticeDays',
          label: 'Oznámení auditu předem (dny)',
          type: 'number',
          required: false,
          sensitivity: 'public',
          legalNote: 'čl. 28 odst. 3 písm. h) GDPR — právo na audit nelze vyloučit',
          validation: { min: 1, max: 60 },
          defaultValue: '14',
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
          id: 'additionalNotes',
          label: 'Další ujednání',
          type: 'textarea',
          required: false,
          sensitivity: 'public',
          placeholder: 'Např. certifikace ISO 27001, kontaktní osoba pro ochranu údajů…',
        },
      ],
    },
  ],
}
