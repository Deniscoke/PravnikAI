/**
 * Nájem bytu — § 2235 a násl. zák. č. 89/2012 Sb.
 *
 * The most one-sided regime in the code, deliberately. Almost every provision
 * of this section is mandatory in the tenant's favour: § 2235 odst. 1 disregards
 * any clause that curtails the tenant's statutory rights, whatever the parties
 * signed. Landlord templates circulating online routinely contain clauses the
 * law simply ignores, which makes this the type where review adds the most value.
 *
 * THE CONTRACTUAL PENALTY IS NO LONGER ONE OF THEM
 *
 * Until 1 July 2020 § 2239 disregarded any penalty imposed on a residential
 * tenant, and this file said so for a long time after zák. č. 163/2020 Sb.
 * struck those words out. That error ran the wrong way: it told a tenant a
 * lawful clause was void, and a tenant who believes that does not pay. The
 * penalty is now permitted and merely shares § 2254's ceiling with the deposit.
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
  lastVerified: '2026-08-26',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2235 a násl.)',
    'zák. č. 460/2016 Sb. (od 28. 2. 2017) — jistota snížena ze šestinásobku na trojnásobek',
    'zák. č. 163/2020 Sb. (od 1. 7. 2020) — ZRUŠEN zákaz smluvní pokuty v § 2239; ' +
      '§ 2254 nově stanoví SPOLEČNÝ strop pro jistotu a smluvní pokutu',
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
      law: '§ 2235 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Jakékoli ujednání odchylující se od zákonné úpravy nájmu bytu v neprospěch ' +
        'nájemce — typicky kratší výpovědní doba pro pronajímatele, rozšířené výpovědní ' +
        'důvody, vzdání se práva na náhradu.',
    },
    {
      id: 'tenancy-zjevne-neprimerene',
      kind: 'prohibited',
      requirement:
        'K ujednání ukládajícímu nájemci povinnost, která je vzhledem k okolnostem ' +
        'zjevně nepřiměřená, se nepřihlíží.',
      consequence: 'neprihlizi-se',
      law: '§ 2239 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Povinnosti zjevně nepřiměřené okolnostem — zákaz návštěv, souhlas pronajímatele ' +
        's běžným užíváním bytu, plošná sankce za drobné porušení. NEHLAS zde samotnou ' +
        'smluvní pokutu: ta je od 1. 7. 2020 dovolená, jen podléhá stropu podle § 2254.',
    },
    {
      id: 'tenancy-jistota',
      kind: 'mandatory',
      label: 'jistota (kauce)',
      requirement:
        `Jistota a právo na zaplacení smluvní pokuty nesmí V SOUHRNU přesáhnout ` +
        `${RENT_DEPOSIT_MAX_MULTIPLE.value}násobek měsíčního nájemného. Sjednává-li se ` +
        'obojí, musí se do tohoto stropu vejít dohromady. Při skončení nájmu pronajímatel ' +
        'jistotu vrátí a nájemce má právo na úroky od jejího poskytnutí.',
      consequence: 'neprihlizi-se',
      law: RENT_DEPOSIT_MAX_MULTIPLE.law,
      detect: /jistot\S*|kauc\S*/i,
      detectSample: 'Jistota činí trojnásobek měsíčního nájemného',
      reviewCheck:
        `Jistota a smluvní pokuta dohromady vyšší než ${RENT_DEPOSIT_MAX_MULTIPLE.value} ` +
        'měsíční nájmy; ujednání vylučující úroky z jistoty nebo umožňující ji nevrátit. ' +
        'Počítej OBOJÍ dohromady — samotná jistota ve výši tří nájmů vedle smluvní pokuty ' +
        'strop už překračuje.',
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
      detectSample: 'Byt č. 4 o velikosti 2+kk',
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
      detectSample: 'Nájemné činí 18 000 Kč měsíčně',
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
      detectSample: 'Výpovědní důvody podle § 2288 NOZ',
      reviewCheck:
        'Ujednání dávající pronajímateli právo vypovědět nájem „bez udání důvodu", ' +
        'kratší výpovědní doba, nebo chybějící poučení o námitkách — výpověď je pak vadná.',
    },
    {
      id: 'tenancy-vypoved-najemce',
      kind: 'default',
      requirement:
        'Nájem na dobu NEURČITOU může nájemce vypovědět kdykoli bez udání důvodu ' +
        's tříměsíční výpovědní dobou. Nájem na dobu URČITOU jen tehdy, změní-li se ' +
        'okolnosti, z nichž strany zřejmě vycházely, natolik, že po nájemci nelze ' +
        'rozumně požadovat, aby v nájmu pokračoval — a změnu je nutné ve výpovědi uvést.',
      consequence: 'doporuceni',
      // § 2287 upravuje jen dobu určitou; právo vypovědět nájem na dobu
      // neurčitou bez důvodu plyne z obecného § 2231.
      law: '§ 2231 (doba neurčitá) a § 2287 (doba určitá) zák. č. 89/2012 Sb.',
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
      // Matches the ban, not the subject. "Chov zvířat" on its own is what a
      // correct clause says too — only a clause forbidding it curtails the
      // right, so the prohibition word has to be part of the pattern.
      detect: /(zakaz|zákaz\S*|nesmí|není\s+oprávněn|zakazuje)[^.]{0,60}(zvíř|chov\S*\s+zvíř|domácí\S*\s+mazlíč)/i,
      detectSample: 'Nájemci se zakazuje chovat v bytě jakákoli zvířata.',
      reviewCheck:
        'Paušální zákaz chovu zvířat — zkracuje zákonné právo nájemce, proto se k němu ' +
        'nepřihlíží. Podmíněné omezení (chov, který působí obtíže nepřiměřené poměrům ' +
        'v domě) je naopak v souladu se zákonem.',
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
