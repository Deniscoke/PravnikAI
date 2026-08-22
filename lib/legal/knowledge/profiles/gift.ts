/**
 * Darovací smlouva — § 2055–2078 zák. č. 89/2012 Sb.
 *
 * Looks like the simplest contract there is, and hides two traps.
 *
 * The first is form. A gift handed over on the spot needs no writing at all,
 * but a *promise* to give later does — and so does anything entered in a public
 * register, which in practice means real estate. Getting that backwards
 * produces either pointless paperwork or an invalid transfer of a flat.
 *
 * The second is that a gift is not final. The donor may revoke it if they fall
 * into hardship (§ 2068) or if the recipient behaves badly enough to count as
 * ingratitude (§ 2072). Templates present donation as irreversible, which
 * misleads both sides about what they actually agreed to.
 */

import type { ContractLegalProfile } from '../types'

export const GIFT_PROFILE: ContractLegalProfile = {
  family: 'gift',
  label: 'Darovací smlouva',
  primaryLaw: '§ 2055–2078 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Dárce bezplatně převádí vlastnické právo k věci, nebo se k převodu zavazuje, ' +
    'a obdarovaný dar či nabídku přijímá. Bezplatnost je pojmovým znakem — ' +
    'je-li sjednáno protiplnění, nejde o darování.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2055–2078)',
    'https://obcanskyzakonik.justice.cz/ — výklad k darovací smlouvě',
    'https://www.zakonyprolidi.cz/cs/2013-256 (katastrální zákon)',
    'zák. č. 586/1992 Sb., o daních z příjmů — § 10 odst. 3 (osvobození)',
  ],
  rules: [
    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'gift-predmet',
      kind: 'essential',
      label: 'předmět daru',
      requirement:
        'Dar musí být určen nezaměnitelně. U nemovitosti údaji z katastru (obec, ' +
        'katastrální území, číslo parcely nebo jednotky, list vlastnictví); ' +
        'u vozidla VIN a SPZ; u peněz částka a měna.',
      consequence: 'nevznikne',
      law: '§ 2055 a § 553 zák. č. 89/2012 Sb.',
      detect: /předmět\S*\s+dar|daruje|dar\S*\s+(nemovitost|věc|částk)/i,
      reviewCheck: 'Dar popsaný jen druhově, bez identifikačních údajů.',
    },
    {
      id: 'gift-bezplatnost',
      kind: 'essential',
      label: 'bezplatnost',
      requirement:
        'Ve smlouvě musí být zřejmé, že se převádí bezplatně. Je-li sjednáno ' +
        'jakékoli protiplnění, nejde o darování, ale o jiný smluvní typ — ' +
        'nejčastěji o koupi nebo směnu.',
      consequence: 'nevznikne',
      law: '§ 2055 odst. 1 zák. č. 89/2012 Sb.',
      detect: /bezplatn\S*|bez\s+(jakéhokoli\S*\s+)?protiplnění|bez\s+úplaty/i,
      reviewCheck:
        'Chybí výslovné vyjádření bezplatnosti, nebo naopak text obsahuje ' +
        'protiplnění — pak nejde o darování a použijí se jiná pravidla.',
    },
    {
      id: 'gift-prijeti',
      kind: 'essential',
      label: 'přijetí daru',
      requirement:
        'Obdarovaný musí dar přijmout. Darování je dvoustranné právní jednání — ' +
        'jednostranné prohlášení dárce nestačí.',
      consequence: 'nevznikne',
      law: '§ 2055 odst. 1 zák. č. 89/2012 Sb.',
      detect: /přijímá|dar\s+přijal|obdarovan\S*\s+přijímá/i,
      reviewCheck: 'Chybí projev vůle obdarovaného dar přijmout.',
    },

    // ─── Forma ───────────────────────────────────────────────────────────────
    {
      id: 'gift-forma',
      kind: 'form',
      requirement:
        'Písemná forma je nutná ve dvou případech: darujeme-li věc zapsanou do ' +
        'veřejného seznamu (typicky nemovitost), a nedojde-li k odevzdání věci ' +
        'současně s projevem vůle darovat (slib darování do budoucna). Movitou ' +
        'věc předanou z ruky do ruky lze darovat i ústně.',
      consequence: 'neplatnost',
      law: '§ 2057 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Slib darování do budoucna nebo darování nemovitosti bez písemné formy.',
    },
    {
      id: 'gift-katastr',
      kind: 'mandatory',
      requirement:
        'U nemovitosti zapisované do katastru nabývá obdarovaný vlastnické právo ' +
        'až vkladem, nikoli podpisem smlouvy. Podpisy na vkladové listině musí být ' +
        'úředně ověřené a projevy vůle obou stran na téže listině.',
      consequence: 'riziko',
      law: '§ 1105 a § 561 odst. 2 zák. č. 89/2012 Sb.; zák. č. 256/2013 Sb.',
      appliesWhen: 'Předmětem daru je nemovitost zapisovaná do katastru nemovitostí.',
      reviewCheck:
        'Text tvrdí, že vlastnictví přechází podpisem smlouvy. Chybí ujednání, ' +
        'kdo podá návrh na vklad a kdo hradí správní poplatek.',
    },

    // ─── Meze darování ───────────────────────────────────────────────────────
    {
      id: 'gift-budouci-majetek',
      kind: 'prohibited',
      requirement:
        'Darovat lze celý současný majetek. Smlouva, kterou někdo daruje svůj ' +
        'budoucí majetek, však platí jen do poloviny takového majetku.',
      consequence: 'neplatnost',
      law: '§ 2058 zák. č. 89/2012 Sb.',
      reviewCheck: 'Darování „veškerého majetku, který dárce v budoucnu nabude".',
    },
    {
      id: 'gift-pro-pripad-smrti',
      kind: 'prohibited',
      requirement:
        'Darování závislé na tom, že obdarovaný dárce přežije, se posuzuje jako ' +
        'odkaz a řídí se dědickým právem. Jako běžnou darovací smlouvu je sepsat nelze.',
      consequence: 'neplatnost',
      law: '§ 2063 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Formulace „dar nabude účinnosti smrtí dárce" nebo „přežije-li obdarovaný ' +
        'dárce" — jde o odkaz, ne o darování, a vyžaduje formu pořízení pro případ smrti.',
    },

    // ─── Odvolání daru ───────────────────────────────────────────────────────
    {
      id: 'gift-odvolani-nouze',
      kind: 'default',
      requirement:
        'Upadne-li dárce po darování do takové nouze, že nemá na nutnou výživu ' +
        'vlastní nebo osob, k nimž má vyživovací povinnost, může dar odvolat a ' +
        'požadovat jeho vydání, případně zaplacení obvyklé ceny.',
      consequence: 'doporuceni',
      law: '§ 2068 a násl. zák. č. 89/2012 Sb.',
      reviewCheck:
        'Ujednání, že se dárce práva odvolat dar předem vzdává — k tomu se nepřihlíží.',
    },
    {
      id: 'gift-odvolani-nevdek',
      kind: 'default',
      requirement:
        'Ublížil-li obdarovaný dárci úmyslně nebo z hrubé nedbalosti tak, že zjevně ' +
        'porušil dobré mravy, může dárce dar odvolat pro nevděk. Právo je časově ' +
        'omezené a nelze se ho předem vzdát.',
      consequence: 'doporuceni',
      law: '§ 2072 a násl. zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text prezentuje darování jako neodvolatelné — to není přesné a obě strany ' +
        'to uvádí v omyl.',
    },

    // ─── Odpovědnost a náklady ───────────────────────────────────────────────
    {
      id: 'gift-vady',
      kind: 'default',
      requirement:
        'Dárce odpovídá za vady daru jen v rozsahu, v jakém o nich věděl a ' +
        'obdarovaného na ně neupozornil. Popiš proto známý stav daru ve smlouvě.',
      consequence: 'riziko',
      law: '§ 2065 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí popis stavu daru a upozornění na známé vady.',
    },
    {
      id: 'gift-dan',
      kind: 'recommended',
      requirement:
        'Daň darovací byla zrušena; bezúplatný příjem se posuzuje jako příjem podle ' +
        'zákona o daních z příjmů. Příbuzní v linii přímé a vyjmenovaní příbuzní ' +
        'v linii vedlejší jsou od daně osvobozeni. Daňové posouzení konkrétního ' +
        'případu patří daňovému poradci.',
      consequence: 'doporuceni',
      law: '§ 10 odst. 3 zák. č. 586/1992 Sb., o daních z příjmů',
      reviewCheck:
        'Smlouva tvrdí konkrétní daňový režim jako jistotu — daňové posouzení ' +
        'závisí na vztahu stran a hodnotě daru.',
    },
    {
      id: 'gift-manzele',
      kind: 'recommended',
      requirement:
        'Je-li dárce ženatý nebo vdaná a dar patří do společného jmění manželů, ' +
        'je k darování nad rámec běžné záležitosti třeba souhlas druhého manžela.',
      consequence: 'riziko',
      law: '§ 714 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Darování hodnotné věci ze společného jmění bez souhlasu druhého manžela — ' +
        'ten se může dovolat neplatnosti.',
    },
  ],
}
