/**
 * Kupní smlouva — § 2079 a násl. zák. č. 89/2012 Sb.
 *
 * The type that most often reaches this app, and the one where the gap between
 * "looks like a contract" and "transfers ownership" is widest: movable goods
 * need no form at all, while real estate needs writing, both signatures on the
 * same deed, and an entry in the land register before ownership moves.
 */

import type { ContractLegalProfile } from '../types'
import { CASH_PAYMENT_LIMIT_CZK, formatCzk } from '../../czechLegalFacts'

export const SALE_PROFILE: ContractLegalProfile = {
  family: 'sale',
  label: 'Kupní smlouva',
  primaryLaw: '§ 2079–2183 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Prodávající se zavazuje odevzdat věc a umožnit kupujícímu nabýt vlastnické právo, ' +
    'kupující se zavazuje věc převzít a zaplatit kupní cenu.',
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2079 a násl.)',
    'https://www.zakonyprolidi.cz/cs/2013-256 (katastrální zákon)',
    'zák. č. 374/2022 Sb. — spotřebitelská novela, účinnost 6. 1. 2023',
  ],
  rules: [
    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'sale-predmet',
      kind: 'essential',
      requirement:
        'Předmět koupě musí být určen nezaměnitelně. U nemovitosti údaji z katastru ' +
        '(obec, katastrální území, číslo parcely, číslo jednotky, list vlastnictví); ' +
        'u vozidla VIN, SPZ, značkou, typem a rokem výroby; u ostatních věcí popisem, ' +
        'který je odliší od jiných věcí téhož druhu.',
      consequence: 'nevznikne',
      law: '§ 2079 odst. 1 a § 553 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Předmět popsaný jen druhově („osobní automobil", „byt v Praze") bez ' +
        'identifikačních údajů — smlouva pak nemusí vzniknout pro neurčitost.',
    },
    {
      id: 'sale-cena',
      kind: 'essential',
      requirement:
        'Kupní cena musí být ujednána, nebo musí být ujednán alespoň způsob jejího určení. ' +
        'Uveď měnu a zda jde o cenu včetně DPH.',
      consequence: 'nevznikne',
      law: '§ 2079 odst. 1 a § 2080 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Cena „bude dohodnuta později" bez způsobu určení; chybějící údaj o DPH ' +
        'u podnikatele; cena bez uvedení měny.',
    },

    // ─── Forma ───────────────────────────────────────────────────────────────
    {
      id: 'sale-forma-nemovitost',
      kind: 'form',
      requirement:
        'Smlouva o převodu nemovitosti vyžaduje písemnou formu a projevy vůle obou stran ' +
        'musí být na téže listině.',
      consequence: 'neplatnost',
      law: '§ 560 a § 561 odst. 2 zák. č. 89/2012 Sb.',
      appliesWhen: 'Předmětem koupě je nemovitá věc.',
      reviewCheck:
        'Ujednání připouštějící uzavření výměnou podepsaných vyhotovení — u nemovitosti ' +
        'to nestačí, podpisy musí být na jedné listině.',
    },
    {
      id: 'sale-vklad-katastr',
      kind: 'mandatory',
      requirement:
        'U nemovitosti zapisované do katastru nabývá kupující vlastnické právo až vkladem, ' +
        'nikoli podpisem smlouvy. Vklad má právní účinky k okamžiku podání návrhu. ' +
        'Pro vkladovou listinu se vyžadují úředně ověřené podpisy.',
      consequence: 'riziko',
      law: '§ 1105 zák. č. 89/2012 Sb., zák. č. 256/2013 Sb. (katastrální zákon)',
      appliesWhen: 'Předmětem koupě je nemovitost zapisovaná do katastru nemovitostí.',
      reviewCheck:
        'Text tvrdí, že vlastnictví přechází podpisem smlouvy nebo zaplacením ceny — ' +
        'u nemovitosti je to nesprávné. Chybí ujednání, kdo podá návrh na vklad a kdo ' +
        'hradí správní poplatek.',
    },

    // ─── Vlastnictví, nebezpečí, splatnost ───────────────────────────────────
    {
      id: 'sale-prechod-vlastnictvi',
      kind: 'default',
      requirement:
        'U movité věci se vlastnické právo nabývá zpravidla převzetím věci; nebezpečí škody ' +
        'přechází zároveň s odevzdáním. Strany si mohou ujednat výhradu vlastnictví do ' +
        'zaplacení ceny.',
      consequence: 'doporuceni',
      law: '§ 1099, § 2082, § 2132 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí ujednání o okamžiku přechodu vlastnictví a nebezpečí škody — u dodání ' +
        'na dálku je to častý zdroj sporu.',
    },
    {
      id: 'sale-splatnost',
      kind: 'recommended',
      requirement:
        'Uveď termín a způsob úhrady ceny, číslo účtu a okamžik, kdy je cena zaplacena ' +
        '(u bezhotovostní platby zpravidla připsáním na účet prodávajícího).',
      consequence: 'riziko',
      law: '§ 1957 a § 2119 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí splatnost nebo číslo účtu; není zřejmé, kdy je platba provedena.',
    },
    {
      id: 'sale-hotovost-limit',
      kind: 'mandatory',
      requirement:
        `Kupní cenu nad ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} nelze uhradit v hotovosti.`,
      consequence: 'riziko',
      law: CASH_PAYMENT_LIMIT_CZK.law,
      reviewCheck: 'Sjednaná hotovostní úhrada vysoké kupní ceny — zejména u nemovitostí a vozidel.',
    },
    {
      id: 'sale-uschova',
      kind: 'recommended',
      requirement:
        'U nemovitosti se kupní cena zpravidla skládá do advokátní, notářské nebo bankovní ' +
        'úschovy a uvolňuje se až po provedení vkladu. Chrání obě strany.',
      consequence: 'doporuceni',
      law: 'Smluvní praxe; § 2 zák. č. 85/1996 Sb.',
      appliesWhen: 'Předmětem koupě je nemovitost.',
      reviewCheck:
        'Kupující platí celou cenu před vkladem bez úschovy — nese riziko, že vklad ' +
        'nebude povolen a cenu bude vymáhat zpět.',
    },

    // ─── Vady ────────────────────────────────────────────────────────────────
    {
      id: 'sale-vady-obecne',
      kind: 'default',
      requirement:
        'Prodávající odpovídá za vady, které má věc při přechodu nebezpečí škody. Kupující ' +
        'musí vadu vytknout bez zbytečného odkladu poté, co ji mohl při včasné prohlídce zjistit.',
      consequence: 'doporuceni',
      law: '§ 2099–2117 zák. č. 89/2012 Sb.',
    },
    {
      id: 'sale-vady-nemovitost',
      kind: 'default',
      requirement:
        'U nemovitosti může kupující vytknout skrytou vadu do pěti let od nabytí.',
      consequence: 'doporuceni',
      law: '§ 2129 odst. 2 zák. č. 89/2012 Sb.',
      appliesWhen: 'Předmětem koupě je nemovitost.',
    },
    {
      id: 'sale-vady-spotrebitel',
      kind: 'mandatory',
      requirement:
        'Prodává-li podnikatel spotřebiteli, může kupující vytknout vadu, která se projeví ' +
        'do dvou let od převzetí. Projeví-li se vada do jednoho roku, má se za to, že věc ' +
        'byla vadná už při převzetí. Reklamaci je nutné vyřídit do 30 dnů. ' +
        'Práva z vadného plnění nelze spotřebiteli zkrátit.',
      consequence: 'neprihlizi-se',
      law: '§ 2161–2174b zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.',
      appliesWhen: 'Prodávající je podnikatel a kupující spotřebitel.',
      reviewCheck:
        'Ujednání zkracující dvouletou lhůtu, vylučující reklamaci, nebo prodlužující ' +
        'lhůtu k vyřízení nad 30 dnů — k takovému ujednání se nepřihlíží.',
    },
    {
      id: 'sale-stav-veci',
      kind: 'recommended',
      requirement:
        'Popiš známý stav věci a vady, na které prodávající kupujícího upozornil. ' +
        'U vozidla uveď stav tachometru a historii; u nemovitosti stav a případné vady. ' +
        'Prodávající neodpovídá za vadu, o které kupující věděl.',
      consequence: 'riziko',
      law: '§ 2103 a § 1916 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Paušální formulace „kupující byl seznámen se stavem" bez popisu konkrétních vad — ' +
        'v případě sporu neprokáže nic ani jedna strana.',
    },

    // ─── Právní vady ─────────────────────────────────────────────────────────
    {
      id: 'sale-pravni-vady',
      kind: 'recommended',
      requirement:
        'Prodávající by měl prohlásit, že na věci neváznou zástavní práva, věcná břemena, ' +
        'nájemní práva, exekuce ani jiná práva třetích osob, nebo je výslovně uvést.',
      consequence: 'riziko',
      law: '§ 1920 a § 2123 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí prohlášení o právních vadách — u nemovitosti a vozidla patří mezi ' +
        'nejzávažnější opomenutí.',
    },
    {
      id: 'sale-vozidlo-prepis',
      kind: 'recommended',
      requirement:
        'U vozidla uveď, kdo a do kdy podá žádost o zápis změny vlastníka v registru ' +
        'silničních vozidel. Žádost podávají obě strany, lhůta je 10 pracovních dnů.',
      consequence: 'riziko',
      law: 'zák. č. 56/2001 Sb., o podmínkách provozu vozidel na pozemních komunikacích',
      appliesWhen: 'Předmětem koupě je silniční vozidlo.',
      reviewCheck:
        'Chybí ujednání o přepisu — prodávající zůstává v registru a nese následky ' +
        'pokut a pojistného.',
    },
  ],
}
