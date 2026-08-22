/**
 * Nájem bytu — § 2235 a násl. zák. č. 89/2012 Sb.
 *
 * The most one-sided regime in the code, deliberately. Almost every provision
 * of this section is mandatory in the tenant's favour: § 2235 odst. 2 disregards
 * any clause that curtails the tenant's statutory rights, whatever the parties
 * signed. Landlord templates circulating online routinely contain clauses the
 * law simply ignores — a contractual penalty against the tenant being the most
 * common — which makes this the type where review adds the most value.
 */

import type { ContractLegalProfile } from '../types'
import { RENT_DEPOSIT_MAX_MULTIPLE } from '../../czechLegalFacts'

export const TENANCY_PROFILE: ContractLegalProfile = {
  family: 'tenancy',
  label: 'Nájemní smlouva (byt)',
  primaryLaw: '§ 2201–2234 (obecně) a § 2235–2301 (nájem bytu) zák. č. 89/2012 Sb.',
  characterisation:
    'Pronajímatel přenechává nájemci byt k zajištění jeho bytových potřeb, nájemce ' +
    'se zavazuje platit nájemné.',
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2235 a násl.)',
    'zák. č. 163/2020 Sb. — snížení jistoty na trojnásobek, zákaz smluvní pokuty',
    'https://www.zakonyprolidi.cz/cs/2015-308 (nař. vlády o vymezení běžné údržby)',
  ],
  rules: [
    // ─── Kogentnost ve prospěch nájemce ──────────────────────────────────────
    {
      id: 'tenancy-kogentnost',
      kind: 'prohibited',
      requirement:
        'K ujednáním, která zkracují práva nájemce podle ustanovení o nájmu bytu, ' +
        'se nepřihlíží. Tato ochrana platí bez ohledu na to, co strany podepsaly.',
      consequence: 'neprihlizi-se',
      law: '§ 2235 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Jakékoli ujednání odchylující se od zákonné úpravy nájmu bytu v neprospěch ' +
        'nájemce — typicky kratší výpovědní doba pro pronajímatele, rozšířené výpovědní ' +
        'důvody, vzdání se práva na náhradu.',
    },
    {
      id: 'tenancy-smluvni-pokuta',
      kind: 'prohibited',
      requirement:
        'K ujednání ukládajícímu nájemci povinnost zaplatit pronajímateli smluvní pokutu ' +
        'se nepřihlíží. Totéž platí pro povinnost, která je vzhledem k okolnostem zjevně ' +
        'nepřiměřená.',
      consequence: 'neprihlizi-se',
      law: '§ 2239 zák. č. 89/2012 Sb.',
      detect: /smluvn[íi]\s+pokut/i,
      reviewCheck:
        'Přítomnost jakékoli smluvní pokuty vůči nájemci — za prodlení s nájemným, ' +
        'za předčasné ukončení, za porušení domovního řádu. Zákon k ní nepřihlíží. ' +
        'Pronajímateli zůstává právo na zákonný úrok z prodlení.',
    },
    {
      id: 'tenancy-jistota',
      kind: 'mandatory',
      label: 'jistota (kauce)',
      requirement:
        `Jistota (kauce) nesmí přesáhnout ${RENT_DEPOSIT_MAX_MULTIPLE.value}násobek měsíčního ` +
        'nájemného. Při skončení nájmu ji pronajímatel vrátí a nájemce má právo na úroky ' +
        'od jejího poskytnutí.',
      consequence: 'neprihlizi-se',
      law: RENT_DEPOSIT_MAX_MULTIPLE.law,
      detect: /jistot\S*|kauc\S*/i,
      reviewCheck:
        `Kauce vyšší než ${RENT_DEPOSIT_MAX_MULTIPLE.value} měsíční nájmy; ujednání ` +
        'vylučující úroky z jistoty nebo umožňující ji nevrátit.',
    },

    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'tenancy-predmet',
      kind: 'essential',
      label: 'označení bytu',
      requirement:
        'Byt musí být určen nezaměnitelně — adresou, číslem bytu, podlažím, podlahovou ' +
        'plochou a popisem místností. Uveď i příslušenství (sklep, garážové stání) a vybavení.',
      consequence: 'nevznikne',
      law: '§ 2235 odst. 1 a § 553 zák. č. 89/2012 Sb.',
      detect: /byt\S*/i,
      reviewCheck: 'Byt označený jen adresou domu bez určení konkrétní jednotky.',
    },
    {
      id: 'tenancy-najemne',
      kind: 'essential',
      label: 'výše nájemného',
      requirement:
        'Nájemné musí být ujednáno pevnou částkou za měsíc. Uveď odděleně nájemné ' +
        'a zálohy na služby — jde o dvě různé platby s odlišným režimem.',
      consequence: 'nevznikne',
      law: '§ 2235 odst. 1 a § 2246 zák. č. 89/2012 Sb.',
      detect: /nájemn[ée]/i,
      reviewCheck:
        'Jedna souhrnná částka „nájemné včetně všeho" bez rozlišení služeb — ' +
        'znemožňuje vyúčtování a je v neprospěch nájemce.',
    },

    // ─── Služby a vyúčtování ─────────────────────────────────────────────────
    {
      id: 'tenancy-sluzby',
      kind: 'mandatory',
      requirement:
        'Vyjmenuj služby, které pronajímatel zajišťuje, a způsob jejich rozúčtování. ' +
        'Vyúčtování skutečné výše záloh musí pronajímatel doručit nejpozději do čtyř ' +
        'měsíců od skončení zúčtovacího období.',
      consequence: 'riziko',
      law: '§ 2247 zák. č. 89/2012 Sb., zák. č. 67/2013 Sb.',
      reviewCheck:
        'Chybí seznam služeb nebo způsob rozúčtování; ujednání prodlužující lhůtu ' +
        'k vyúčtování.',
    },

    // ─── Doba a skončení ─────────────────────────────────────────────────────
    {
      id: 'tenancy-doba',
      kind: 'recommended',
      requirement:
        'Uveď, zda je nájem na dobu určitou (s datem) nebo neurčitou. Užívá-li nájemce ' +
        'byt po skončení doby určité alespoň tři měsíce a pronajímatel jej nevyzve ' +
        'k odevzdání, obnovuje se nájem za týchž podmínek.',
      consequence: 'riziko',
      law: '§ 2285 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí určení doby nájmu, nebo ujednání vylučující automatické obnovení.',
    },
    {
      id: 'tenancy-vypoved-pronajimatel',
      kind: 'mandatory',
      label: 'výpovědní podmínky',
      requirement:
        'Pronajímatel může nájem bytu vypovědět jen z důvodů výslovně uvedených v zákoně, ' +
        'písemně, s uvedením důvodu a s poučením nájemce o právu vznést proti výpovědi ' +
        'námitky a navrhnout přezkoumání soudem. Výpovědní doba je tři měsíce.',
      consequence: 'neplatnost',
      law: '§ 2288–2291 zák. č. 89/2012 Sb.',
      detect: /výpovědn\S*/i,
      reviewCheck:
        'Ujednání dávající pronajímateli právo vypovědět nájem „bez udání důvodu", ' +
        'kratší výpovědní doba, nebo chybějící poučení o námitkách — výpověď je pak vadná.',
    },
    {
      id: 'tenancy-vypoved-najemce',
      kind: 'default',
      requirement:
        'Nájemce může nájem na dobu neurčitou vypovědět kdykoli bez udání důvodu ' +
        's tříměsíční výpovědní dobou.',
      consequence: 'doporuceni',
      law: '§ 2287 zák. č. 89/2012 Sb.',
    },

    // ─── Práva nájemce, která se ujednáním nezruší ───────────────────────────
    {
      id: 'tenancy-zvirata',
      kind: 'prohibited',
      requirement:
        'Nájemce má právo chovat v bytě zvíře, nepůsobí-li chov pronajímateli nebo ' +
        'ostatním obyvatelům domu obtíže nepřiměřené poměrům v domě.',
      consequence: 'neprihlizi-se',
      law: '§ 2258 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Paušální zákaz chovu zvířat — zkracuje zákonné právo nájemce, proto se k němu ' +
        'nepřihlíží.',
    },
    {
      id: 'tenancy-navstevy-osoby',
      kind: 'prohibited',
      requirement:
        'Nájemce má právo přijímat v bytě návštěvy a přijmout do domácnosti kohokoli. ' +
        'Pronajímatel může jen požadovat, aby v bytě žil počet osob přiměřený jeho velikosti, ' +
        'a má právo vědět, kdo v bytě bydlí.',
      consequence: 'neprihlizi-se',
      law: '§ 2272 a § 2274 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Zákaz návštěv, zákaz přenocování třetích osob, nebo podmínění souhlasem ' +
        'pronajímatele.',
    },
    {
      id: 'tenancy-vstup-pronajimatele',
      kind: 'prohibited',
      requirement:
        'Pronajímatel nesmí do bytu vstupovat bez souhlasu nájemce s výjimkou případů ' +
        'hrozící škody. Nájemce má právo byt užívat nerušeně.',
      consequence: 'neprihlizi-se',
      law: '§ 2205 písm. c) a § 2219 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Ujednání dávající pronajímateli právo vstoupit „kdykoli" nebo „po předchozím ' +
        'oznámení" bez souhlasu nájemce.',
    },

    // ─── Údržba a opravy ─────────────────────────────────────────────────────
    {
      id: 'tenancy-udrzba',
      kind: 'default',
      requirement:
        'Nájemce hradí běžnou údržbu a drobné opravy; jejich rozsah vymezuje nařízení ' +
        'vlády č. 308/2015 Sb. Ostatní opravy zajišťuje pronajímatel.',
      consequence: 'riziko',
      law: '§ 2257 zák. č. 89/2012 Sb., nař. vlády č. 308/2015 Sb.',
      reviewCheck:
        'Ujednání přenášející na nájemce všechny opravy včetně rozsáhlých — zkracuje ' +
        'jeho práva, proto se k němu nepřihlíží.',
    },
    {
      id: 'tenancy-predavaci-protokol',
      kind: 'recommended',
      requirement:
        'Sepiš předávací protokol se stavem bytu, vybavením a stavy měřidel při předání ' +
        'i při vrácení. Bez něj nelze prokázat, jaké škody vznikly za trvání nájmu.',
      consequence: 'riziko',
      law: 'Smluvní praxe; § 2292 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí předávací protokol nebo odkaz na něj — nejčastější spor o vrácení kauce.',
    },

    // ─── Zvyšování nájemného ─────────────────────────────────────────────────
    {
      id: 'tenancy-zvyseni-najemneho',
      kind: 'default',
      requirement:
        'Nebylo-li ujednáno jinak, může pronajímatel navrhnout zvýšení nájemného ' +
        'nejvýše o 20 % za poslední tři roky a nejvýše do výše srovnatelného nájemného ' +
        'v místě. Nesouhlasí-li nájemce, rozhodne soud.',
      consequence: 'riziko',
      law: '§ 2249 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Ujednání o jednostranném zvyšování nájemného bez omezení, nebo o automatické ' +
        'indexaci bez horní hranice.',
    },
  ],
}
