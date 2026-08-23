/**
 * Výpověď z pracovního poměru — § 50–54 a § 67 zák. č. 262/2006 Sb.
 *
 * The document where the two sides are least alike. An employee may end the
 * relationship at any time without giving a reason; an employer may do it only
 * on one of the grounds listed in § 52, must describe the facts behind it, and
 * cannot change the ground afterwards. Treating the two symmetrically is the
 * quickest way to produce a notice that will not hold.
 *
 * Two things the 2025 flexinovela moved, both of which every pre-June-2025
 * template still has wrong:
 *
 *   - the notice period now runs from delivery, not from the first day of the
 *     following month (that rule survives for leases under § 2286, which is
 *     why the stale-law guard is scoped to employment)
 *   - twelve months' severance no longer covers work injury and occupational
 *     disease generally; it is now limited to termination on reaching the
 *     maximum permissible exposure
 */

import type { ContractLegalProfile } from '../types'

export const EMPLOYMENT_NOTICE_PROFILE: ContractLegalProfile = {
  family: 'employment-notice',
  label: 'Výpověď z pracovního poměru',
  primaryLaw: '§ 50–54 a § 67 zák. č. 262/2006 Sb. (zákoník práce)',
  characterisation:
    'Jednostranné právní jednání, kterým zaměstnanec nebo zaměstnavatel končí ' +
    'pracovní poměr. Účinky se pojí s doručením druhé straně.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 50–54, § 67)',
    'zák. č. 120/2025 Sb. — flexinovela, účinnost 1. 6. 2025',
    'https://mpsv.gov.cz/ — přehled změn flexinovely',
  ],
  rules: [
    // ─── Forma a doručení ────────────────────────────────────────────────────
    {
      id: 'enotice-forma',
      kind: 'form',
      label: 'písemná forma a doručení',
      requirement:
        'Výpověď musí být písemná a doručena druhé straně. Nedoručená výpověď ' +
        'nemá žádné účinky, i kdyby byla sepsána bezvadně.',
      consequence: 'neplatnost',
      law: '§ 50 odst. 1 zák. č. 262/2006 Sb.',
      detect: /doruč|předán|převzet/i,
      detectSample: 'Výpověď se doručuje osobně proti podpisu',
      reviewCheck: 'Chybí údaj o způsobu doručení — u výpovědi se účinky pojí právě s ním.',
    },
    {
      id: 'enotice-doba-bezi-od-doruceni',
      kind: 'mandatory',
      label: 'začátek běhu výpovědní doby',
      requirement:
        'Od 1. 6. 2025 běží výpovědní doba ode dne doručení výpovědi a končí dnem, ' +
        'jehož číselné označení se shoduje se dnem doručení. Pravidlo o počítání ' +
        'času podle § 333 ZP se nepoužije.',
      consequence: 'riziko',
      law: '§ 51 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.',
      reviewCheck:
        'Text tvrdí, že výpovědní doba začíná prvním dnem následujícího měsíce — ' +
        'to je úprava do 31. 5. 2025. U nájmu takové pravidlo stále platí, ' +
        'u pracovního poměru už ne.',
    },
    {
      id: 'enotice-delka-doby',
      kind: 'mandatory',
      label: 'délka výpovědní doby',
      requirement:
        'Výpovědní doba činí nejméně dva měsíce. U výpovědi z důvodů podle § 52 ' +
        'písm. f) až h) činí nejméně jeden měsíc. Musí být stejná pro obě strany.',
      consequence: 'neplatnost',
      law: '§ 51 zák. č. 262/2006 Sb.',
      detect: /výpovědn\S*\s+dob/i,
      detectSample: 'Výpovědní doba činí dva měsíce',
      reviewCheck:
        'Kratší výpovědní doba, než zákon připouští, nebo delší jen pro zaměstnance.',
    },

    // ─── Výpověď zaměstnavatele ──────────────────────────────────────────────
    {
      id: 'enotice-duvod-zamestnavatel',
      kind: 'essential',
      label: 'výpovědní důvod',
      requirement:
        'Zaměstnavatel může dát výpověď pouze z důvodů taxativně uvedených v § 52. ' +
        'Důvod musí být ve výpovědi skutkově vymezen tak, aby jej nebylo možné ' +
        'zaměnit s jiným — nestačí odkaz na písmeno zákona.',
      consequence: 'neplatnost',
      law: '§ 50 odst. 2 a 4 a § 52 zák. č. 262/2006 Sb.',
      appliesWhen: 'Výpověď dává zaměstnavatel.',
      detect: /důvod/i,
      detectSample: 'Důvod výpovědi: nadbytečnost podle § 52 písm. c)',
      reviewCheck:
        'Výpověď zaměstnavatele bez uvedení důvodu, nebo s důvodem popsaným jen ' +
        'odkazem na paragraf. Skutkové vymezení je podmínkou platnosti.',
    },
    {
      id: 'enotice-duvod-nelze-menit',
      kind: 'prohibited',
      requirement:
        'Uvedený výpovědní důvod nelze dodatečně měnit. Ukáže-li se jako neobstojný, ' +
        'nelze jej v řízení nahradit jiným.',
      consequence: 'neplatnost',
      law: '§ 50 odst. 4 zák. č. 262/2006 Sb.',
      appliesWhen: 'Výpověď dává zaměstnavatel.',
      reviewCheck: 'Formulace uvádějící více alternativních důvodů „a případně též".',
    },
    {
      id: 'enotice-ochranna-doba',
      kind: 'prohibited',
      requirement:
        'V ochranné době — zejména v době dočasné pracovní neschopnosti, těhotenství, ' +
        'mateřské a rodičovské dovolené — nesmí zaměstnavatel dát výpověď, s výjimkami ' +
        'stanovenými zákonem.',
      consequence: 'neplatnost',
      law: '§ 53 zák. č. 262/2006 Sb.',
      appliesWhen: 'Výpověď dává zaměstnavatel.',
      reviewCheck:
        'Výpověď doručená v době pracovní neschopnosti nebo mateřské dovolené — ' +
        'zpravidla neplatná, ledaže jde o zákonnou výjimku.',
    },

    // ─── Výpověď zaměstnance ─────────────────────────────────────────────────
    {
      id: 'enotice-zamestnanec-bez-duvodu',
      kind: 'default',
      requirement:
        'Zaměstnanec může dát výpověď z jakéhokoli důvodu nebo bez uvedení důvodu.',
      consequence: 'doporuceni',
      law: '§ 50 odst. 3 zák. č. 262/2006 Sb.',
      appliesWhen: 'Výpověď dává zaměstnanec.',
      reviewCheck:
        'U výpovědi zaměstnance NEHLAS jako chybějící výpovědní důvod ani poučení — ' +
        'zákon je ukládá pouze zaměstnavateli.',
    },

    // ─── Odstupné ────────────────────────────────────────────────────────────
    {
      id: 'enotice-odstupne',
      kind: 'default',
      requirement:
        'Při výpovědi z organizačních důvodů podle § 52 písm. a) až c) náleží ' +
        'odstupné nejméně ve výši jednonásobku průměrného výdělku při trvání ' +
        'poměru do jednoho roku, dvojnásobku při trvání alespoň jeden a méně než ' +
        'dva roky a trojnásobku při trvání alespoň dva roky.',
      consequence: 'doporuceni',
      law: '§ 67 odst. 1 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Výpověď z důvodu a) až c) bez zmínky o odstupném, nebo s nižší částkou, ' +
        'než stanoví zákon.',
    },
    {
      id: 'enotice-odstupne-expozice',
      kind: 'default',
      requirement:
        'Dvanáctinásobek průměrného výdělku náleží od 1. 6. 2025 pouze při skončení ' +
        'poměru z důvodu dosažení nejvyšší přípustné expozice na pracovišti. ' +
        'Pro pracovní úraz a nemoc z povolání se dřívější dvanáctinásobné odstupné ' +
        'již neuplatní — nahradila je jednorázová náhrada.',
      consequence: 'doporuceni',
      law: '§ 67 odst. 3 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.',
      reviewCheck:
        'Text slibuje dvanáctinásobné odstupné při pracovním úrazu nebo nemoci ' +
        'z povolání — to je úprava do 31. 5. 2025 a dnes už neplatí.',
    },

    // ─── Po doručení ─────────────────────────────────────────────────────────
    {
      id: 'enotice-odvolani',
      kind: 'default',
      requirement:
        'Doručenou výpověď lze odvolat pouze se souhlasem druhé strany. Odvolání ' +
        'i souhlas musí být písemné.',
      consequence: 'doporuceni',
      law: '§ 50 odst. 5 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Text tvrdí, že výpověď lze jednostranně vzít zpět — bez souhlasu druhé ' +
        'strany to nelze.',
    },
    {
      id: 'enotice-potvrzeni',
      kind: 'recommended',
      requirement:
        'Při skončení pracovního poměru vydá zaměstnavatel zaměstnanci potvrzení ' +
        'o zaměstnání. Ve výpovědi je vhodné uvést, kdy a jak bude předáno.',
      consequence: 'doporuceni',
      law: '§ 313 zák. č. 262/2006 Sb.',
    },
    {
      id: 'enotice-neplatnost-lhuta',
      kind: 'default',
      requirement:
        'Neplatnost rozvázání pracovního poměru lze uplatnit u soudu nejpozději ' +
        've lhůtě dvou měsíců ode dne, kdy měl pracovní poměr skončit. Po jejím ' +
        'marném uplynutí se neplatnosti dovolat nelze.',
      consequence: 'doporuceni',
      law: '§ 72 zák. č. 262/2006 Sb.',
      reviewCheck:
        'U výpovědi zaměstnavatele je vhodné dotčenou stranu na dvouměsíční lhůtu ' +
        'upozornit — po jejím uplynutí je i vadná výpověď nenapadnutelná.',
    },
    {
      id: 'enotice-podpis',
      kind: 'form',
      requirement:
        'Výpověď podepisuje pouze strana, která ji dává. Podpis druhé strany slouží ' +
        'nejvýše jako potvrzení převzetí, nikoli jako souhlas.',
      consequence: 'riziko',
      law: '§ 50 odst. 1 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Dokument obsahuje formulaci „strany se dohodly" — pak nejde o výpověď, ' +
        'ale o dohodu o rozvázání pracovního poměru podle § 49.',
    },
  ],
}
