/**
 * Dohoda o provedení práce (DPP) a dohoda o pracovní činnosti (DPČ)
 * — § 74–77 zák. č. 262/2006 Sb.
 *
 * WHY THIS IS NOT THE PRACOVNÍ SMLOUVA PROFILE
 *
 * A live review of a real DPP applied the employment-contract checklist to it
 * and produced two confident, wrong findings: that four weeks' leave was
 * missing under § 213, and that the notice period breached § 51. Neither
 * provision governs a dohoda. The contract was right and the review was wrong,
 * which is the most damaging way for this product to fail.
 *
 * Dohody sit outside the pracovní poměr. Leave follows § 77 odst. 8 (a
 * qualifying period, not a flat entitlement), termination follows § 77 odst. 4
 * (fifteen days, no reason required), and the whole thing is capped at 300
 * hours a year. Applying pracovní-poměr rules here reliably invents defects.
 *
 * These are the most common contracts in the country — students, part-timers,
 * teachers — so getting them wrong is not an edge case.
 */

import type { ContractLegalProfile } from '../types'
import { MINIMUM_HOURLY_WAGE_CZK, MIN_VACATION_WEEKS } from '../../czechLegalFacts'

/** Annual ceiling on a DPP with a single employer (§ 75 ZP). */
const DPP_MAX_HOURS_PER_YEAR = 300

export const EMPLOYMENT_AGREEMENT_PROFILE: ContractLegalProfile = {
  // Review-only: there is no generator for a dohoda, so this key never reaches
  // the drafting side.
  family: 'employment-agreement',
  label: 'Dohoda o provedení práce / o pracovní činnosti',
  primaryLaw: '§ 74–77 zák. č. 262/2006 Sb. (zákoník práce)',
  characterisation:
    'Práce konaná mimo pracovní poměr. Nezakládá pracovní poměr, a proto se na ni ' +
    'nevztahují ustanovení o pracovní smlouvě, výpovědi ani o dovolené podle § 213.',
  lastVerified: '2026-08-22',
  // Every one of these was cited against a real, lawful dohoda.
  inapplicable: [
    { section: '213', law: '262/2006', why: 'Dovolená u dohody se řídí § 77 odst. 8, nikoli § 213 — nárok vzniká až při trvání alespoň 28 dní a 80 odpracovaných hodinách.' },
    { section: '51', law: '262/2006', why: 'Výpovědní doba podle § 51 platí pro pracovní poměr. Dohoda se ruší podle § 77 odst. 4 s patnáctidenní lhůtou.' },
    { section: '50', law: '262/2006', why: 'Úprava výpovědi z pracovního poměru se na dohodu nevztahuje.' },
    { section: '34', law: '262/2006', why: 'Podstatné náležitosti pracovní smlouvy podle § 34 se na dohodu nevztahují.' },
    { section: '52', law: '262/2006', why: 'Výpovědní důvody zaměstnavatele se na dohodu nevztahují — lze ji zrušit i bez důvodu.' },
    { section: '67', law: '262/2006', why: 'Odstupné se u dohody neposkytuje.' },
  ],
  sources: [
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 74–77)',
    'https://mpsv.gov.cz/ — rozvrhování pracovní doby u dohod, minimální mzda',
    'zák. č. 281/2023 Sb. — transpoziční novela (dovolená a rozvrh u dohod od 1. 1. 2024)',
  ],
  rules: [
    // ─── Co se na dohodu NEVZTAHUJE ──────────────────────────────────────────
    {
      id: 'dpp-neni-pracovni-pomer',
      kind: 'default',
      requirement:
        'Dohoda nezakládá pracovní poměr. Nevztahují se na ni ustanovení o pracovní ' +
        'smlouvě (§ 34), o výpovědi a výpovědní době (§ 50–51), o odstupném ani ' +
        'o dovolené podle § 213.',
      consequence: 'doporuceni',
      law: '§ 77 odst. 2 zák. č. 262/2006 Sb.',
      reviewCheck:
        'NEHLAS jako chybějící: výpovědní dobu podle § 51, dovolenou v rozsahu ' +
        `${MIN_VACATION_WEEKS.value} týdnů podle § 213, druh práce podle § 34, odstupné. ` +
        'U dohody nejde o vady — tato ustanovení se na ni nevztahují.',
    },

    // ─── Forma a náležitosti ─────────────────────────────────────────────────
    {
      id: 'dpp-forma',
      kind: 'form',
      requirement:
        'Dohoda musí být uzavřena písemně. Jedno vyhotovení obdrží zaměstnanec.',
      consequence: 'neplatnost',
      law: '§ 77 odst. 1 zák. č. 262/2006 Sb.',
    },
    {
      id: 'dpp-vymezeni-prace',
      kind: 'essential',
      label: 'vymezení sjednané práce',
      detect: /sjednan\S*\s+prác|pracovní\s+úkol|druh\S*\s+prác/i,
      detectSample: 'Sjednaná práce: lektor kurzu angličtiny',
      requirement:
        'Musí být vymezen sjednaný pracovní úkol nebo druh práce, který má ' +
        'zaměstnanec vykonat.',
      consequence: 'nevznikne',
      law: '§ 75 a § 76 odst. 1 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Práce vymezená natolik obecně, že z ní nelze zjistit, co má zaměstnanec dělat.',
    },
    {
      id: 'dpp-doba',
      kind: 'essential',
      requirement:
        'Musí být uvedena doba, na kterou se dohoda uzavírá, nebo termín splnění ' +
        'pracovního úkolu.',
      consequence: 'nevznikne',
      law: '§ 75 a § 76 odst. 5 zák. č. 262/2006 Sb.',
    },

    // ─── Rozsah ──────────────────────────────────────────────────────────────
    {
      id: 'dpp-rozsah-300-hodin',
      kind: 'mandatory',
      label: 'rozsah práce v hodinách',
      requirement:
        `U dohody o provedení práce nesmí rozsah práce překročit ${DPP_MAX_HOURS_PER_YEAR} hodin ` +
        'v kalendářním roce u téhož zaměstnavatele. Započítává se i doba z jiných ' +
        'dohod o provedení práce u téhož zaměstnavatele v témže roce.',
      consequence: 'riziko',
      law: '§ 75 zák. č. 262/2006 Sb.',
      appliesWhen: 'Jde o dohodu o provedení práce (DPP), nikoli o pracovní činnosti.',
      detect: /300\s*hodin/i,
      detectSample: 'Rozsah práce nepřesáhne 300 hodin ročně',
      reviewCheck:
        `Sjednaný rozsah nad ${DPP_MAX_HOURS_PER_YEAR} hodin ročně, nebo úplně chybějící ` +
        'ujednání o rozsahu — bez něj nelze ověřit dodržení zákonného limitu.',
    },
    {
      id: 'dpc-rozsah-poloviny',
      kind: 'mandatory',
      requirement:
        'U dohody o pracovní činnosti nelze vykonávat práci v rozsahu překračujícím ' +
        'v průměru polovinu stanovené týdenní pracovní doby, posuzováno nejvýše ' +
        'za 52 týdnů.',
      consequence: 'riziko',
      law: '§ 76 odst. 2 a 3 zák. č. 262/2006 Sb.',
      appliesWhen: 'Jde o dohodu o pracovní činnosti (DPČ).',
      reviewCheck: 'Sjednaný rozsah přesahující v průměru 20 hodin týdně u DPČ.',
    },

    // ─── Odměna ──────────────────────────────────────────────────────────────
    {
      id: 'dpp-odmena-minimum',
      kind: 'mandatory',
      label: 'odměna z dohody',
      requirement:
        `Odměna z dohody nesmí být nižší než minimální mzda přepočtená na hodinu, ` +
        `která od ${MINIMUM_HOURLY_WAGE_CZK.effectiveFrom} činí ` +
        `${MINIMUM_HOURLY_WAGE_CZK.value.toLocaleString('cs-CZ')} Kč za hodinu. ` +
        'Pro řadu prací je závazná vyšší zaručená mzda.',
      consequence: 'neplatnost',
      law: MINIMUM_HOURLY_WAGE_CZK.law,
      detect: /odměn\S*|za\s+hodinu|Kč\s*\/\s*hod/i,
      detectSample: 'Odměna činí 450 Kč za hodinu',
      reviewCheck:
        `Hodinová odměna nižší než ${MINIMUM_HOURLY_WAGE_CZK.value.toLocaleString('cs-CZ')} Kč. ` +
        'Vyšší sazba není vadou — zkontroluj jen, zda není pod minimem.',
    },
    {
      id: 'dpp-splatnost-odmeny',
      kind: 'mandatory',
      requirement:
        'Odměna je splatná po vykonání práce, nejpozději v kalendářním měsíci ' +
        'následujícím po měsíci, ve kterém vznikl nárok. Uveď termín a způsob výplaty.',
      consequence: 'riziko',
      law: '§ 141 ve spojení s § 77 odst. 2 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Konec následujícího měsíce je zákonné MAXIMUM, nikoli cíl. Dřívější termín ' +
        '(např. do 15. nebo 20. dne) je pro zaměstnance VÝHODNĚJŠÍ — nikdy jej nenavrhuj ' +
        'prodloužit. Vadou je jen splatnost pozdější než zákonné maximum, nebo úplně ' +
        'chybějící termín.',
    },

    // ─── Dovolená — jiný režim než u pracovního poměru ───────────────────────
    {
      id: 'dpp-dovolena',
      kind: 'default',
      requirement:
        'Od 1. 1. 2024 vzniká právo na dovolenou i z dohody, ale jen pokud ' +
        'pracovněprávní vztah v kalendářním roce nepřetržitě trval alespoň 28 ' +
        'kalendářních dní a zaměstnanec odpracoval alespoň 80 hodin. Nejde o nárok ' +
        `${MIN_VACATION_WEEKS.value} týdnů podle § 213.`,
      consequence: 'doporuceni',
      law: '§ 77 odst. 8 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Ujednání o dovolené vázané na 28 dní trvání a 80 odpracovaných hodin je ' +
        'ZÁKONNĚ SPRÁVNÉ — nehlas je jako rozpor s § 213. Vadou by bylo ujednání, ' +
        'které právo na dovolenou zcela vylučuje.',
    },

    // ─── Skončení — jiný režim než výpověď ───────────────────────────────────
    {
      id: 'dpp-zruseni',
      kind: 'default',
      requirement:
        'Není-li ujednán způsob zrušení, lze dohodu zrušit dohodou stran ke ' +
        'sjednanému dni, výpovědí danou z jakéhokoli důvodu nebo bez uvedení důvodu ' +
        's patnáctidenní výpovědní dobou počínající dnem doručení, nebo okamžitým ' +
        'zrušením v případech, kdy lze okamžitě zrušit pracovní poměr.',
      consequence: 'doporuceni',
      law: '§ 77 odst. 4 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Chybějící ujednání o zrušení NENÍ vada — uplatní se zákonná úprava. ' +
        'Nehlas rozpor s § 51 ani chybějící dvouměsíční výpovědní dobu. ' +
        'Vadou je ujednání kratší lhůty jen pro zaměstnavatele.',
    },

    // ─── Rozvrh pracovní doby ────────────────────────────────────────────────
    {
      id: 'dpp-rozvrh-pracovni-doby',
      kind: 'mandatory',
      requirement:
        'Zaměstnavatel musí předem rozvrhnout pracovní dobu v písemném rozvrhu ' +
        'a seznámit s ním zaměstnance nejpozději 3 dny před začátkem směny nebo ' +
        'období — nedohodnou-li se na jiné době seznámení.',
      consequence: 'riziko',
      law: '§ 74 odst. 2 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Kratší lhůta než 3 dny je PŘÍPUSTNÁ, je-li sjednána v dohodě — zákon to ' +
        'výslovně umožňuje. Nehlas ji jako vadu. Vadou je úplná absence rozvrhu ' +
        'nebo možnost zaměstnavatele měnit směny bez jakéhokoli oznámení.',
    },

    // ─── Odpovědnost za škodu ────────────────────────────────────────────────
    {
      id: 'dpp-odpovednost-za-skodu',
      kind: 'prohibited',
      requirement:
        'Odpovědnost zaměstnance za škodu z nedbalosti je omezena čtyřapůlnásobkem ' +
        'jeho průměrného měsíčního výdělku. Tento strop nelze dohodou rozšířit ani ' +
        'nahradit obecnou odpovědností.',
      consequence: 'neplatnost',
      law: '§ 257 odst. 2 ve spojení s § 4a a § 346b odst. 2 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Klauzule typu „zaměstnanec odpovídá za škodu způsobenou porušením svých ' +
        'povinností" bez omezení — rozšiřuje odpovědnost nad zákonný strop. ' +
        'NENAVRHUJ takové znění jako doporučené doplnění; chybějící ujednání ' +
        'o odpovědnosti není vada, protože zákonná úprava platí sama o sobě.',
    },
    {
      id: 'dpp-zakaz-odchylek',
      kind: 'prohibited',
      requirement:
        'I u dohody platí, že odchýlit se od zákoníku práce lze jen ve prospěch ' +
        'zaměstnance a že se zaměstnanec nemůže předem vzdát svých práv.',
      consequence: 'neplatnost',
      law: '§ 4a a § 346c zák. č. 262/2006 Sb.',
      reviewCheck:
        'Vzdání se nároku na odměnu, na dovolenou nebo na náhradu; přenesení ' +
        'provozních nákladů na zaměstnance.',
    },

    // ─── Praktické ───────────────────────────────────────────────────────────
    {
      id: 'dpp-identifikace',
      kind: 'essential',
      requirement:
        'Identifikuj obě strany: zaměstnavatele názvem, IČO a sídlem; zaměstnance ' +
        'jménem, datem narození a bydlištěm.',
      consequence: 'nevznikne',
      law: '§ 77 odst. 1 zák. č. 262/2006 Sb.; § 553 zák. č. 89/2012 Sb.',
    },
    {
      id: 'dpp-bozp',
      kind: 'recommended',
      requirement:
        'Povinnosti v oblasti bezpečnosti a ochrany zdraví při práci se vztahují ' +
        'i na dohody. Uveď, že zaměstnanec byl proškolen.',
      consequence: 'doporuceni',
      law: '§ 101 a násl. zák. č. 262/2006 Sb.',
    },
  ],
}
