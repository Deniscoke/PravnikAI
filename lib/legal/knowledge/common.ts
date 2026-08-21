/**
 * Rules that apply to every contract, regardless of type — Czech law
 *
 * These are the provisions that decide whether a contract holds at all:
 * certainty, form, invalidity, the limits of what parties may agree, and the
 * protections that attach automatically when one side is a consumer or is
 * otherwise the weaker party.
 *
 * A note on `consequence`, because it is the thing that is easiest to get
 * wrong: Czech law distinguishes a clause that is *invalid* (a defect at
 * formation) from one the law simply *disregards* (`nepřihlíží se` — treated as
 * though it had never been written) from a breach that gives rise to a right to
 * *withdraw*. Advice that swaps these sounds confident and is wrong. Each rule
 * below carries the correct one.
 *
 * Verified August 2026 — see docs/PRAVNI_ZDROJE.md for the review cadence.
 */

import type { CommonLegalProfile } from './types'
import { CASH_PAYMENT_LIMIT_CZK, formatCzk } from '../czechLegalFacts'

export const COMMON_PROFILE: CommonLegalProfile = {
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (zák. č. 89/2012 Sb., NOZ)',
    'https://zakony.gov.cz/ (e-Sbírka — státem garantované znění)',
    'https://www.zakonyprolidi.cz/cs/2013-351 (nař. vlády č. 351/2013 Sb.)',
    'https://www.zakonyprolidi.cz/cs/1994-216 (zák. č. 216/1994 Sb., ve znění zák. č. 258/2016 Sb.)',
  ],
  rules: [
    // ─── Vznik a určitost ────────────────────────────────────────────────────
    {
      id: 'common-urcitost',
      kind: 'essential',
      requirement:
        'Ujednání musí být určité a srozumitelné. Neurčité nebo nesrozumitelné ujednání je ' +
        'zdánlivé — právně neexistuje.',
      consequence: 'neprihlizi-se',
      law: '§ 553 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Formulace typu „přiměřená lhůta", „obvyklá cena", „dle dohody" bez dalšího určení — ' +
        'pokud z nich nelze zjistit konkrétní obsah povinnosti, jde o zdánlivé ujednání.',
    },
    {
      id: 'common-identifikace-stran',
      kind: 'essential',
      requirement:
        'Smluvní strany musí být identifikovány nezaměnitelně: fyzická osoba jménem, ' +
        'datem narození nebo rodným číslem a bydlištěm; právnická osoba názvem, IČO a sídlem; ' +
        'podnikatel navíc IČO.',
      consequence: 'nevznikne',
      law: '§ 553 a § 435 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí IČO u podnikatele, chybí datum narození u fyzické osoby, nebo je uvedeno jen ' +
        'jméno bez adresy — strana pak nemusí být identifikovatelná.',
    },
    {
      id: 'common-zastoupeni',
      kind: 'recommended',
      requirement:
        'Jedná-li za stranu jiná osoba, uveď jméno a právní důvod zastoupení (jednatel, ' +
        'prokurista, plná moc).',
      consequence: 'riziko',
      law: '§ 161 a násl., § 441 a násl. zák. č. 89/2012 Sb.',
      reviewCheck:
        'Podpisový blok uvádí zástupce bez uvedení funkce nebo plné moci — vzniká spor ' +
        'o oprávnění jednat.',
    },

    // ─── Forma ───────────────────────────────────────────────────────────────
    {
      id: 'common-forma-zmeny',
      kind: 'form',
      requirement:
        'Byla-li smlouva uzavřena písemně, lze ji měnit nebo rušit zásadně také jen písemně.',
      consequence: 'riziko',
      law: '§ 564 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí ujednání o formě změn (dodatky) — nebo naopak text připouští ústní změny.',
    },

    // ─── Meze smluvní volnosti ───────────────────────────────────────────────
    {
      id: 'common-dobre-mravy',
      kind: 'prohibited',
      requirement:
        'Neplatné je ujednání, které se příčí dobrým mravům, odporuje zákonu nebo zjevně ' +
        'narušuje veřejný pořádek.',
      consequence: 'neplatnost',
      law: '§ 580 a § 588 zák. č. 89/2012 Sb.',
    },
    {
      id: 'common-lichva',
      kind: 'prohibited',
      requirement:
        'Neplatná je smlouva, při níž někdo zneužije tísně, nezkušenosti, rozumové slabosti ' +
        'nebo lehkomyslnosti druhé strany a nechá si slíbit plnění v hrubém nepoměru.',
      consequence: 'neplatnost',
      law: '§ 1796 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Plnění jedné strany je v hrubém nepoměru k protiplnění — zejména u půjček, ' +
        'odkupů a smluv uzavřených v tísni.',
    },
    {
      id: 'common-vzdani-nahrady-ujmy',
      kind: 'prohibited',
      requirement:
        'Nelze se předem vzdát práva na náhradu újmy způsobené úmyslně nebo z hrubé ' +
        'nedbalosti, ani újmy na přirozených právech člověka. U slabší strany nelze předem ' +
        'omezit ani vyloučit právo na náhradu jakékoli újmy.',
      consequence: 'neprihlizi-se',
      law: '§ 2898 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Klauzule „smluvní strany vylučují náhradu škody", „odpovědnost je omezena do výše…" — ' +
        'vůči slabší straně a u úmyslu či hrubé nedbalosti se k ní nepřihlíží.',
    },
    {
      id: 'common-adhezni',
      kind: 'prohibited',
      requirement:
        'V adhezní smlouvě (sepsané jednou stranou, druhá měla jen možnost přijmout) je ' +
        'neplatná doložka, kterou lze přečíst jen s obtížemi nebo je pro průměrného člověka ' +
        'nesrozumitelná, i doložka zvláště nevýhodná bez rozumného důvodu.',
      consequence: 'neplatnost',
      law: '§ 1798–1801 zák. č. 89/2012 Sb.',
      appliesWhen: 'Smlouva byla sepsána jednou stranou a druhá její obsah nemohla ovlivnit.',
      reviewCheck:
        'Odkaz na obchodní podmínky, které nejsou přiloženy; klíčové povinnosti schované ' +
        'v poznámce pod čarou nebo v obecném odkazu.',
    },

    // ─── Spotřebitel ─────────────────────────────────────────────────────────
    {
      id: 'common-spotrebitel-nerovnovaha',
      kind: 'prohibited',
      requirement:
        'Ve spotřebitelské smlouvě se nepřihlíží k ujednáním, která zakládají v rozporu ' +
        's požadavkem přiměřenosti významnou nerovnováhu práv v neprospěch spotřebitele.',
      consequence: 'neprihlizi-se',
      law: '§ 1813 zák. č. 89/2012 Sb.',
      appliesWhen: 'Jedna strana je spotřebitel a druhá podnikatel.',
      reviewCheck:
        'Jednostranné právo měnit podmínky, nepřiměřené sankce jen pro spotřebitele, ' +
        'vyloučení práva na odstoupení.',
    },
    {
      id: 'common-spotrebitel-rozhodci-dolozka',
      kind: 'prohibited',
      requirement:
        'Ve spotřebitelské smlouvě nelze sjednat rozhodčí doložku. Rozhodce lze ujednat ' +
        'až poté, co spor vznikl.',
      consequence: 'neplatnost',
      law: 'zák. č. 216/1994 Sb. ve znění zák. č. 258/2016 Sb. (účinnost 1. 12. 2016)',
      appliesWhen: 'Jedna strana je spotřebitel.',
      reviewCheck:
        'Přítomnost rozhodčí doložky ve smlouvě se spotřebitelem — od 1. 12. 2016 je zakázaná.',
    },
    {
      id: 'common-spotrebitel-srozumitelnost',
      kind: 'mandatory',
      requirement:
        'Smlouva se spotřebitelem musí být uzavřena jasně a srozumitelně. Nejasný obsah ' +
        'se vykládá ve prospěch spotřebitele.',
      consequence: 'riziko',
      law: '§ 1812 zák. č. 89/2012 Sb.',
      appliesWhen: 'Jedna strana je spotřebitel.',
    },

    // ─── Sankce a prodlení ───────────────────────────────────────────────────
    {
      id: 'common-smluvni-pokuta-moderace',
      kind: 'default',
      requirement:
        'Nepřiměřeně vysokou smluvní pokutu může soud na návrh dlužníka snížit. Smluvní ' +
        'pokuta musí být ujednána určitě — musí být zřejmé, za jaké porušení a v jaké výši.',
      consequence: 'riziko',
      law: '§ 2048–2051 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smluvní pokuta bez jasného navázání na konkrétní povinnost, nebo ve výši řádově ' +
        'přesahující zajištěnou povinnost.',
    },
    {
      id: 'common-urok-z-prodleni',
      kind: 'default',
      requirement:
        'Nesjednají-li si strany jinak, činí zákonný úrok z prodlení ročně repo sazbu ČNB ' +
        'platnou pro první den kalendářního pololetí, v němž prodlení nastalo, zvýšenou ' +
        'o 8 procentních bodů. Sazba se pro celé prodlení fixuje.',
      consequence: 'doporuceni',
      law: '§ 1970 zák. č. 89/2012 Sb., nař. vlády č. 351/2013 Sb.',
      reviewCheck:
        'Nikdy neuváděj konkrétní procento jako trvale platné — sazba se mění každé pololetí. ' +
        'Uveď vzorec, nebo odkaz na zákonnou výši.',
    },
    {
      id: 'common-neplaceni-neni-neplatnost',
      kind: 'default',
      requirement:
        'Nezaplacení ceny je porušení smlouvy, nikoli vada jejího vzniku. Zakládá právo ' +
        'odstoupit od smlouvy, nárok na úrok z prodlení, případně se řeší rozvazovací ' +
        'podmínkou. NIKDY nezakládá neplatnost smlouvy.',
      consequence: 'riziko',
      law: '§ 1968–1970, § 2001–2005, § 548 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Formulace „při nezaplacení se smlouva považuje za neplatnou" je právně nesprávná — ' +
        'správně jde o odstoupení nebo rozvazovací podmínku.',
    },

    // ─── Platby ──────────────────────────────────────────────────────────────
    {
      id: 'common-limit-hotovosti',
      kind: 'mandatory',
      requirement:
        `Platbu přesahující ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} za jeden den nelze ` +
        'provést v hotovosti — musí proběhnout bezhotovostně.',
      consequence: 'riziko',
      law: CASH_PAYMENT_LIMIT_CZK.law,
      reviewCheck:
        `Sjednaná hotovostní platba nad ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} — porušení ` +
        'zakládá přestupek, i když samotná smlouva zůstává platná.',
    },

    // ─── Čas ─────────────────────────────────────────────────────────────────
    {
      id: 'common-promlceni',
      kind: 'default',
      requirement:
        'Obecná promlčecí lhůta je tři roky ode dne, kdy právo mohlo být uplatněno poprvé. ' +
        'Strany si mohou ujednat lhůtu v rozmezí jednoho až patnácti let, nikoli však ' +
        'kratší či delší v neprospěch slabší strany.',
      consequence: 'doporuceni',
      law: '§ 629–630 zák. č. 89/2012 Sb.',
    },

    // ─── Závěrečná ustanovení ────────────────────────────────────────────────
    {
      id: 'common-castecna-neplatnost',
      kind: 'recommended',
      requirement:
        'Týká-li se důvod neplatnosti jen části právního jednání, je neplatná jen tato část, ' +
        'lze-li ji od zbytku oddělit. Salvátorská klauzule tento následek potvrzuje.',
      consequence: 'doporuceni',
      law: '§ 576 zák. č. 89/2012 Sb.',
    },
    {
      id: 'common-pocet-vyhotoveni',
      kind: 'recommended',
      requirement:
        'Uveď počet vyhotovení a kolik jich obdrží která strana. U smluv vkládaných do ' +
        'veřejného seznamu počítej s vyhotovením navíc pro příslušný úřad.',
      consequence: 'doporuceni',
      law: 'Smluvní praxe',
    },
  ],
}
