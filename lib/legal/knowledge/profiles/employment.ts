/**
 * Pracovní smlouva — § 33 a násl. zák. č. 262/2006 Sb. (zákoník práce)
 *
 * Labour law is mandatory in one direction only: § 4a permits departures from
 * the code solely in the employee's favour, and § 346c makes an employee's
 * advance waiver of rights ineffective. A template that reads as "balanced"
 * between the parties is therefore usually unlawful, not fair.
 *
 * The 2025 flexinovela (zák. č. 120/2025 Sb.) moved several numbers that had
 * been stable for a decade — probation, and the day the notice period starts.
 * Anything written before June 2025 should be treated as suspect.
 */

import type { ContractLegalProfile } from '../types'
import {
  MINIMUM_MONTHLY_WAGE_CZK,
  PROBATION_MAX_MONTHS,
  PROBATION_MAX_MONTHS_MANAGER,
  FIXED_TERM_MAX_YEARS,
  MIN_VACATION_WEEKS,
  formatCzk,
} from '../../czechLegalFacts'

export const EMPLOYMENT_PROFILE: ContractLegalProfile = {
  family: 'employment',
  label: 'Pracovní smlouva',
  primaryLaw: '§ 33–73 zák. č. 262/2006 Sb. (zákoník práce)',
  characterisation:
    'Zakládá pracovní poměr — zaměstnanec vykonává závislou práci pro zaměstnavatele, ' +
    'ten mu za ni platí mzdu nebo plat.',
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2006-262 (zákoník práce)',
    'zák. č. 120/2025 Sb. — flexinovela, účinnost 1. 6. 2025',
    'https://mpsv.gov.cz/ — minimální a zaručená mzda',
  ],
  rules: [
    // ─── Kogentnost ──────────────────────────────────────────────────────────
    {
      id: 'employment-odchylky',
      kind: 'prohibited',
      requirement:
        'Odchýlit se od zákoníku práce lze jen ve prospěch zaměstnance. Zaměstnanec ' +
        'se nemůže předem vzdát svých práv a zaměstnavatel na něj nesmí přenášet riziko ' +
        'z výkonu závislé práce.',
      consequence: 'neplatnost',
      law: '§ 4a, § 346b odst. 2 a § 346c zák. č. 262/2006 Sb.',
      reviewCheck:
        'Ujednání o povinnosti zaměstnance nahradit manko bez dohody o odpovědnosti, ' +
        'vzdání se nároku na odstupné či dovolenou, přenesení nákladů provozu na zaměstnance.',
    },
    {
      id: 'employment-forma',
      kind: 'form',
      requirement:
        'Pracovní smlouva vyžaduje písemnou formu. Jedno vyhotovení musí zaměstnavatel ' +
        'vydat zaměstnanci.',
      consequence: 'neplatnost',
      law: '§ 34 odst. 2 a odst. 5 zák. č. 262/2006 Sb.',
    },

    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'employment-druh-prace',
      kind: 'essential',
      requirement: 'Druh práce, který má zaměstnanec vykonávat.',
      consequence: 'nevznikne',
      law: '§ 34 odst. 1 písm. a) zák. č. 262/2006 Sb.',
      detect: /druh\s+práce|pracovní\s+pozic|funkc\w*/i,
      reviewCheck:
        'Druh práce vymezený tak široce, že umožňuje přidělit jakoukoli práci ' +
        '(„dle potřeb zaměstnavatele") — obchází ochranu při převedení na jinou práci.',
    },
    {
      id: 'employment-misto-prace',
      kind: 'essential',
      requirement: 'Místo nebo místa výkonu práce.',
      consequence: 'nevznikne',
      law: '§ 34 odst. 1 písm. b) zák. č. 262/2006 Sb.',
      detect: /místo\s+výkonu\s+práce|pracoviště/i,
      reviewCheck:
        'Místo určené jako „území České republiky" — zbavuje zaměstnance nároku ' +
        'na cestovní náhrady.',
    },
    {
      id: 'employment-den-nastupu',
      kind: 'essential',
      requirement: 'Den nástupu do práce; tímto dnem pracovní poměr vzniká.',
      consequence: 'nevznikne',
      law: '§ 34 odst. 1 písm. c) a § 36 zák. č. 262/2006 Sb.',
      detect: /den\s+nástupu|nástup\w*\s+do\s+práce|datum\s+nástupu/i,
    },

    // ─── Mzda ────────────────────────────────────────────────────────────────
    {
      id: 'employment-mzda-minimum',
      kind: 'mandatory',
      requirement:
        `Mzda nesmí být nižší než minimální mzda, která od ` +
        `${MINIMUM_MONTHLY_WAGE_CZK.effectiveFrom} činí ` +
        `${formatCzk(MINIMUM_MONTHLY_WAGE_CZK.value)} měsíčně. Pro řadu prací je závazná ` +
        'vyšší zaručená mzda podle skupiny prací.',
      consequence: 'neplatnost',
      law: MINIMUM_MONTHLY_WAGE_CZK.law,
      reviewCheck:
        `Sjednaná mzda pod ${formatCzk(MINIMUM_MONTHLY_WAGE_CZK.value)} u plného úvazku. ` +
        'Zkontroluj i zaručenou mzdu — může být výrazně vyšší než minimální.',
    },
    {
      id: 'employment-mzda-splatnost',
      kind: 'mandatory',
      requirement:
        'Mzda je splatná po vykonání práce, nejpozději v kalendářním měsíci následujícím ' +
        'po měsíci, ve kterém vznikl nárok. Uveď výplatní termín a způsob výplaty.',
      consequence: 'riziko',
      law: '§ 141 zák. č. 262/2006 Sb.',
    },

    // ─── Zkušební doba ───────────────────────────────────────────────────────
    {
      id: 'employment-zkusebni-doba',
      kind: 'mandatory',
      requirement:
        `Zkušební doba smí činit nejvýše ${PROBATION_MAX_MONTHS.value} měsíce, ` +
        `u vedoucího zaměstnance ${PROBATION_MAX_MONTHS_MANAGER.value} měsíců. Nesmí ` +
        'přesáhnout polovinu sjednané doby trvání pracovního poměru. Musí být sjednána ' +
        'písemně nejpozději v den nástupu a nelze ji dodatečně prodlužovat nad zákonné maximum.',
      consequence: 'neplatnost',
      law: PROBATION_MAX_MONTHS.law,
      reviewCheck:
        `Zkušební doba delší než ${PROBATION_MAX_MONTHS.value} měsíce u řadového ` +
        'zaměstnance. Pozor: do 31. 5. 2025 platily 3 a 6 měsíců — starší vzory jsou zastaralé, ' +
        'delší doba dnes není automaticky vadou.',
    },

    // ─── Doba trvání ─────────────────────────────────────────────────────────
    {
      id: 'employment-doba-urcita',
      kind: 'mandatory',
      requirement:
        `Pracovní poměr na dobu určitou smí trvat nejvýše ${FIXED_TERM_MAX_YEARS.value} roky ` +
        'a lze jej opakovat nejvýše dvakrát; celkem tedy nejvýše devět let.',
      consequence: 'riziko',
      law: FIXED_TERM_MAX_YEARS.law,
      reviewCheck:
        'Doba určitá delší než tři roky, nebo řetězení bez zákonné výjimky — poměr se ' +
        'pak považuje za sjednaný na dobu neurčitou.',
    },

    // ─── Skončení ────────────────────────────────────────────────────────────
    {
      id: 'employment-vypovedni-doba',
      kind: 'mandatory',
      requirement:
        'Výpovědní doba činí nejméně dva měsíce, u výpovědi z důvodů podle § 52 písm. f) ' +
        'až h) jeden měsíc. Musí být stejná pro obě strany. Od 1. 6. 2025 běží ode dne ' +
        'doručení výpovědi, nikoli od prvního dne následujícího měsíce.',
      consequence: 'neplatnost',
      law: '§ 51 zák. č. 262/2006 Sb., ve znění zák. č. 120/2025 Sb.',
      reviewCheck:
        'Text uvádí, že výpovědní doba začíná prvním dnem následujícího měsíce — ' +
        'to je úprava platná do 31. 5. 2025 a dnes je nesprávná. Rovněž zkontroluj, ' +
        'zda není delší jen pro zaměstnance.',
    },
    {
      id: 'employment-vypovedni-duvody',
      kind: 'mandatory',
      requirement:
        'Zaměstnavatel může dát výpověď jen z důvodů taxativně uvedených v § 52. ' +
        'Zaměstnanec může dát výpověď kdykoli i bez uvedení důvodu.',
      consequence: 'neplatnost',
      law: '§ 50 a § 52 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Ujednání dávající zaměstnavateli právo ukončit poměr „bez udání důvodu" ' +
        'nebo rozšiřující výpovědní důvody nad rámec § 52.',
    },

    // ─── Dovolená a pracovní doba ────────────────────────────────────────────
    {
      id: 'employment-dovolena',
      kind: 'mandatory',
      requirement: `Dovolená činí nejméně ${MIN_VACATION_WEEKS.value} týdny za kalendářní rok.`,
      consequence: 'neplatnost',
      law: MIN_VACATION_WEEKS.law,
      reviewCheck: `Sjednaná dovolená kratší než ${MIN_VACATION_WEEKS.value} týdny.`,
    },
    {
      id: 'employment-pracovni-doba',
      kind: 'mandatory',
      requirement:
        'Stanovená týdenní pracovní doba činí nejvýše 40 hodin. Práce přesčas nesmí ' +
        'v průměru překročit 8 hodin týdně a je-li mzda sjednána včetně přesčasů, ' +
        'jen do rozsahu 150 hodin ročně (u vedoucích 416 hodin).',
      consequence: 'neplatnost',
      law: '§ 79, § 93 a § 114 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Formulace „mzda zahrnuje veškerou práci přesčas" bez omezení rozsahu — ' +
        'nad zákonný limit je neúčinná.',
    },

    // ─── Informační povinnost ────────────────────────────────────────────────
    {
      id: 'employment-informacni-povinnost',
      kind: 'mandatory',
      requirement:
        'Neobsahuje-li smlouva údaje o dovolené, výpovědních dobách, pracovní době, ' +
        'odborném rozvoji a dalších náležitostech, musí je zaměstnavatel zaměstnanci ' +
        'písemně sdělit nejpozději do 7 dnů od vzniku pracovního poměru.',
      consequence: 'riziko',
      law: '§ 37 zák. č. 262/2006 Sb.',
    },

    // ─── Konkurenční doložka ─────────────────────────────────────────────────
    {
      id: 'employment-konkurencni-dolozka',
      kind: 'mandatory',
      requirement:
        'Konkurenční doložku lze sjednat nejdéle na jeden rok po skončení zaměstnání ' +
        'a jen za peněžité vyrovnání nejméně ve výši poloviny průměrného měsíčního výdělku ' +
        'za každý měsíc jejího trvání.',
      consequence: 'neplatnost',
      law: '§ 310 zák. č. 262/2006 Sb.',
      appliesWhen: 'Smlouva obsahuje zákaz konkurence po skončení pracovního poměru.',
      reviewCheck:
        'Konkurenční doložka bez peněžitého vyrovnání, s vyrovnáním pod polovinou ' +
        'průměrného výdělku, nebo na dobu delší než jeden rok — je neplatná.',
    },
    {
      id: 'employment-mlcenlivost',
      kind: 'recommended',
      requirement:
        'Povinnost mlčenlivosti o obchodním tajemství a interních informacích lze ' +
        'sjednat, ale nesmí bránit zaměstnanci ve výkonu jeho povolání po skončení ' +
        'poměru — to už je konkurenční doložka a platí pro ni § 310.',
      consequence: 'riziko',
      law: '§ 310 zák. č. 262/2006 Sb., § 504 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Doložka o mlčenlivosti formulovaná tak široce, že fakticky brání práci v oboru — ' +
        'posuzuje se jako konkurenční doložka a bez vyrovnání je neplatná.',
    },
  ],
}
