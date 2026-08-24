/**
 * Nájem prostoru sloužícího podnikání — § 2302–2315 zák. č. 89/2012 Sb.
 *
 * THE REGIME APPLIES WHETHER YOU SAY SO OR NOT
 *
 * § 2302 odst. 1 attaches to the FACTS: if the purpose is business and the
 * premises then serve business at least predominantly, this subsection governs
 * "bez ohledu na to, zda je účel nájmu v nájemní smlouvě vyjádřen". A landlord
 * who writes an ordinary "nájemní smlouva" for a shop does not thereby escape
 * it — and the residential template they copied brings the wrong rules with it.
 *
 * WHY A RESIDENTIAL TEMPLATE IS THE MAIN DANGER
 *
 *   - The three-month deposit ceiling is § 2254, a BYT rule. There is no
 *     statutory cap here.
 *   - The notice period is six months on an indefinite lease, three where the
 *     party has a serious reason, and always six once the lease has run more
 *     than five years and termination could not be expected (§ 2312). Not the
 *     three months of § 2288, and not starting on the first of next month.
 *   - The tenant's instruction about objections is not § 2286 odst. 2. Here
 *     EITHER party may object, within one month, in writing (§ 2314) — and
 *     missing that month extinguishes the right to have the notice reviewed
 *     at all.
 *
 * THE ENTITLEMENT ALMOST NOBODY CLAIMS
 *
 * § 2315: where the LANDLORD terminates, the tenant is entitled to
 * compensation for the benefit the landlord or the next tenant gains by taking
 * over the customer base the outgoing tenant built. It is lost only where the
 * tenant was terminated for gross breach. For a shop or a restaurant this can
 * exceed a year of rent, and it is missing from essentially every template.
 *
 * Verified against the statute text on 2026-08-24.
 */

import type { ContractLegalProfile } from '../types'

export const BUSINESS_PREMISES_LEASE_PROFILE: ContractLegalProfile = {
  family: 'business-premises-lease',
  label: 'Nájem prostoru sloužícího podnikání',
  primaryLaw: '§ 2302–2315 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Nájem prostoru nebo místnosti, které alespoň převážně slouží podnikání. ' +
    'Zvláštní úprava se použije bez ohledu na to, zda je účel ve smlouvě vyjádřen.',
  lastVerified: '2026-08-24',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2302–2315, § 2201 a násl.)',
  ],
  inapplicable: [
    {
      section: '2254',
      law: '89/2012',
      why:
        'Strop jistoty ve výši trojnásobku měsíčního nájemného platí pro nájem ' +
        'BYTU. U prostoru sloužícího podnikání zákon výši jistoty neomezuje — ' +
        'nehlas vyšší jistotu jako porušení zákona.',
    },
    {
      section: '2288',
      law: '89/2012',
      why:
        'Výpovědní důvody a tříměsíční výpovědní doba podle § 2288 jsou úpravou ' +
        'nájmu bytu. Zde platí § 2308, § 2309 a § 2312.',
    },
    {
      section: '2286',
      law: '89/2012',
      why:
        'Poučení o právu vznést námitky podle § 2286 odst. 2 je náležitostí ' +
        'výpovědi z nájmu bytu. Zde se uplatní vlastní režim námitek podle § 2314.',
    },
    {
      section: '2239',
      law: '89/2012',
      why:
        'Zákaz ujednání ukládajících nájemci zjevně nepřiměřené povinnosti se ' +
        'vztahuje na nájem bytu. Mezi podnikateli platí smluvní volnost šíře.',
    },
  ],
  rules: [
    // ─── Vymezení ────────────────────────────────────────────────────────────
    {
      id: 'bizlease-predmet',
      kind: 'essential',
      label: 'vymezení prostoru',
      requirement:
        'Označ prostor jednoznačně — adresa, číslo jednotky nebo místnosti, ' +
        'podlaží, výměra v m² a nemovitost, v níž se nachází.',
      consequence: 'nevznikne',
      law: '§ 2302 a § 2201 zák. č. 89/2012 Sb.',
      detect: /m2|m²|místnost|jednotk|podlaží|adres|nebytov/i,
      detectSample: 'Prostor č. 3 o výměře 84 m² v 1. nadzemním podlaží budovy č. p. 120',
      reviewCheck: 'Chybí jednoznačné vymezení pronajímaného prostoru nebo jeho výměra.',
    },
    {
      id: 'bizlease-ucel',
      kind: 'essential',
      label: 'účel nájmu',
      requirement:
        'Uveď, k jaké podnikatelské činnosti prostor slouží. Zvláštní úprava se ' +
        'sice použije i bez toho, ale účel vymezuje, co smí nájemce v prostoru ' +
        'dělat, a od něj se odvíjí i výpovědní důvod podle § 2308 písm. a).',
      consequence: 'nevznikne',
      law: '§ 2302 odst. 1 a § 2304 zák. č. 89/2012 Sb.',
      detect: /účel\S*\s+nájmu|k\s+provozování|provozován\S*\s+(prodejn|restaurac|kancelář)|podnikatelsk\S*\s+činnost/i,
      detectSample: 'Účelem nájmu je provozování kavárny',
      reviewCheck:
        'Chybí vymezení účelu nájmu. Bez něj není zřejmé, jakou činnost smí ' +
        'nájemce provozovat ani kdy může nájem vypovědět podle § 2308 písm. a).',
    },
    {
      id: 'bizlease-najemne',
      kind: 'essential',
      label: 'nájemné a splatnost',
      requirement:
        'Uveď výši nájemného, splatnost a to, zda je uvedeno včetně DPH. ' +
        'U pronájmu podnikateli bývá nájemné zdanitelným plněním — režim DPH ' +
        'proto ujednej výslovně.',
      consequence: 'nevznikne',
      law: '§ 2302 a § 2201 zák. č. 89/2012 Sb.',
      detect: /nájemné|Kč\s*(měsíčně|ročně)|splatn/i,
      detectSample: 'Nájemné činí 45 000 Kč měsíčně bez DPH, splatné do 15. dne měsíce',
      reviewCheck: 'Chybí výše nájemného nebo jeho splatnost.',
    },
    {
      id: 'bizlease-sluzby',
      kind: 'recommended',
      label: 'služby spojené s nájmem',
      requirement:
        'Vymez, které služby pronajímatel poskytuje, jak se rozúčtují a v jakých ' +
        'zálohách se platí. Je-li s nájmem spojeno poskytování služeb, použijí se ' +
        'obdobně ustanovení o službách u nájmu bytu.',
      consequence: 'riziko',
      law: '§ 2303 zák. č. 89/2012 Sb.',
      detect: /služb|zálohy|vyúčtování|energi/i,
      detectSample: 'Zálohy na služby činí 6 000 Kč měsíčně, vyúčtování do 30. 4.',
      reviewCheck: 'Chybí vymezení služeb a způsobu jejich vyúčtování.',
    },
    {
      id: 'bizlease-doba',
      kind: 'essential',
      label: 'doba nájmu',
      requirement:
        'Uveď, zda se nájem sjednává na dobu určitou, nebo neurčitou. Na tom ' +
        'závisí, jak jej lze ukončit — § 2308 a § 2309 u doby určité, § 2312 ' +
        'u doby neurčité.',
      consequence: 'nevznikne',
      law: '§ 2308, § 2309 a § 2312 zák. č. 89/2012 Sb.',
      detect: /dob\S*\s+(určit|neurčit)|od\s+\d.*do\s+\d/i,
      detectSample: 'Nájem se sjednává na dobu určitou od 1. 1. 2027 do 31. 12. 2031',
      reviewCheck: 'Chybí údaj o době nájmu.',
    },

    // ─── Skončení nájmu ──────────────────────────────────────────────────────
    {
      id: 'bizlease-vypovedni-doba',
      kind: 'mandatory',
      label: 'výpovědní doba',
      requirement:
        'U nájmu na dobu NEURČITOU je výpovědní doba ŠESTIMĚSÍČNÍ; má-li ' +
        'vypovídající strana vážný důvod, je tříměsíční. Trvá-li nájem déle než ' +
        'pět let a strana nemohla vzhledem k okolnostem výpověď předpokládat, je ' +
        'vždy šestiměsíční. U nájmu na dobu URČITOU je výpovědní doba tříměsíční.',
      consequence: 'riziko',
      law: '§ 2310 odst. 2 a § 2312 zák. č. 89/2012 Sb.',
      detect: /výpovědn\S*\s+dob|šestiměsíčn|tříměsíčn|šest\s+měsíc/i,
      detectSample: 'Výpovědní doba činí šest měsíců',
      reviewCheck:
        'Uvedena tříměsíční výpovědní doba u nájmu na dobu neurčitou bez vážného ' +
        'důvodu, nebo běh výpovědní doby od prvního dne dalšího měsíce — to je ' +
        'úprava nájmu bytu, zde se neuplatní.',
    },
    {
      id: 'bizlease-duvod-vypovedi',
      kind: 'mandatory',
      requirement:
        'Ve výpovědi MUSÍ být uveden důvod. Výpověď, v níž důvod uveden není, ' +
        'je NEPLATNÁ. Platí to pro výpověď z nájmu na dobu určitou podle § 2308 ' +
        'i § 2309.',
      consequence: 'neplatnost',
      law: '§ 2310 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva připouští výpověď z nájmu na dobu určitou bez uvedení důvodu, ' +
        'nebo výpověď důvod neuvádí — § 2310 odst. 1 ji činí neplatnou.',
    },
    {
      id: 'bizlease-duvody-najemce',
      kind: 'default',
      requirement:
        'Nájem na dobu určitou může NÁJEMCE vypovědět i před uplynutím doby, ' +
        'ztratí-li způsobilost k činnosti, k níž je prostor určen; přestane-li ' +
        'být prostor z objektivních důvodů způsobilý k výkonu činnosti a ' +
        'pronajímatel nezajistí odpovídající náhradní prostor; nebo porušuje-li ' +
        'pronajímatel hrubě své povinnosti.',
      consequence: 'doporuceni',
      law: '§ 2308 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva tato zákonná práva nájemce vylučuje nebo je podmiňuje souhlasem ' +
        'pronajímatele.',
    },
    {
      id: 'bizlease-duvody-pronajimatele',
      kind: 'default',
      requirement:
        'Nájem na dobu určitou může PRONAJÍMATEL vypovědět, má-li být nemovitost ' +
        'odstraněna nebo přestavována tak, že to brání dalšímu užívání, a nemohl ' +
        'to při uzavření smlouvy předvídat; nebo porušuje-li nájemce hrubě své ' +
        'povinnosti — zejména je-li déle než JEDEN MĚSÍC v prodlení s placením ' +
        'nájemného nebo služeb.',
      consequence: 'doporuceni',
      law: '§ 2309 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva stanoví kratší prodlení než jeden měsíc jako důvod okamžitého ' +
        'ukončení, aniž by to bylo výslovně ujednáno jako smluvní výpovědní důvod.',
    },
    {
      id: 'bizlease-namitky',
      kind: 'mandatory',
      label: 'námitky proti výpovědi',
      requirement:
        'Vypovídaná strana může do JEDNOHO MĚSÍCE od doručení výpovědi vznést ' +
        'písemné námitky. Nevznese-li je včas, právo žádat přezkoumání ' +
        'oprávněnosti výpovědi ZANIKNE. Vznese-li je a vypovídající strana ' +
        'výpověď do měsíce nevezme zpět, lze do dvou měsíců žádat soud o přezkum.',
      consequence: 'riziko',
      law: '§ 2314 zák. č. 89/2012 Sb.',
      detect: /námitk|přezkoum/i,
      detectSample: 'Vypovídaná strana může do jednoho měsíce vznést proti výpovědi námitky',
      reviewCheck:
        'Smlouva režim námitek vylučuje nebo zkracuje. Jde o právo obou stran, ' +
        'nikoli o poučení, které § 2286 odst. 2 ukládá u nájmu bytu.',
    },
    {
      id: 'bizlease-vyklizeni-je-souhlas',
      kind: 'default',
      requirement:
        'Vyklidí-li nájemce prostor v souladu s výpovědí, považuje se výpověď za ' +
        'platnou a přijatou bez námitek. Nájemce, který chce výpověď rozporovat, ' +
        'proto nesmí prostor jen tak vyklidit.',
      consequence: 'doporuceni',
      law: '§ 2313 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text nájemci radí vyklidit prostor a namítat později — vyklizením se ' +
        'výpověď považuje za přijatou bez námitek.',
    },
    {
      id: 'bizlease-nahrada-zakaznicka-zakladna',
      kind: 'recommended',
      label: 'náhrada za převzetí zákaznické základny',
      requirement:
        'Skončí-li nájem výpovědí ZE STRANY PRONAJÍMATELE, má nájemce právo na ' +
        'náhradu za výhodu, kterou pronajímatel nebo nový nájemce získali ' +
        'převzetím zákaznické základny vybudované vypovězeným nájemcem. Toto ' +
        'právo nájemce nemá, byl-li vypovězen pro hrubé porušení povinností. ' +
        'U provozovny s vlastní klientelou jde o nejcennější nárok celé smlouvy ' +
        'a ve vzorech téměř nikdy nefiguruje.',
      consequence: 'riziko',
      law: '§ 2315 zák. č. 89/2012 Sb.',
      detect: /zákaznick\S*\s+základn|klientel|náhrad\S*\s+za\s+převzetí/i,
      detectSample: 'Nájemci náleží náhrada za převzetí zákaznické základny podle § 2315',
      reviewCheck:
        'Smlouva náhradu za převzetí zákaznické základny vylučuje nebo o ní mlčí. ' +
        'Vzdání se tohoto práva předem je pro nájemce významné a mělo by být ' +
        'vědomé.',
    },

    // ─── Provoz ──────────────────────────────────────────────────────────────
    {
      id: 'bizlease-zmena-cinnosti',
      kind: 'default',
      requirement:
        'Nájemce nesmí provozovat jinou činnost ani změnit způsob jejího výkonu ' +
        'oproti účelu nájmu, pokud by to zhoršilo poměry v nemovitosti nebo nad ' +
        'přiměřenou míru poškozovalo pronajímatele či ostatní uživatele. ' +
        'Nepodstatné změny to nezakazuje.',
      consequence: 'doporuceni',
      law: '§ 2304 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva zakazuje jakoukoli změnu činnosti bez ohledu na její dopad — ' +
        '§ 2304 odst. 2 nepodstatné změny připouští.',
    },
    {
      id: 'bizlease-oznaceni-stity',
      kind: 'recommended',
      label: 'označení provozovny',
      requirement:
        'Nájemce může nemovitost opatřit štíty a návěstími se souhlasem ' +
        'pronajímatele; ten jej může odmítnout jen z vážného důvodu. Požádá-li ' +
        'nájemce písemně a pronajímatel se do JEDNOHO MĚSÍCE nevyjádří, souhlas ' +
        'se považuje za daný. Při skončení nájmu nájemce označení odstraní ' +
        'a uvede dotčenou část do původního stavu.',
      consequence: 'riziko',
      law: '§ 2305 a § 2306 zák. č. 89/2012 Sb.',
      detect: /štít|návěst|označen\S*\s+provozovn|reklamn\S*\s+zaříz/i,
      detectSample: 'Nájemce může prostor opatřit štítem se souhlasem pronajímatele',
      reviewCheck: 'Chybí ujednání o označení provozovny a jeho odstranění při skončení nájmu.',
    },
    {
      id: 'bizlease-prevod-najmu',
      kind: 'default',
      requirement:
        'Nájem lze převést v souvislosti s převodem podnikatelské činnosti, ' +
        'a to s PŘEDCHOZÍM souhlasem pronajímatele. Souhlas i smlouva o převodu ' +
        'vyžadují písemnou formu.',
      consequence: 'doporuceni',
      law: '§ 2307 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva převod nájmu při převodu podniku zcela vylučuje, aniž by to bylo ' +
        'pro nájemce zřejmé — u provozovny jde o podstatné omezení hodnoty ' +
        'podnikání.',
    },
    {
      id: 'bizlease-jistota',
      kind: 'recommended',
      label: 'jistota',
      requirement:
        'Ujednej výši jistoty, podmínky jejího čerpání a vrácení. Trojnásobný ' +
        'strop podle § 2254 zde NEPLATÍ — je to úprava nájmu bytu. Vyšší jistota ' +
        'proto není protizákonná, ale měla by být vyvážená.',
      consequence: 'riziko',
      law: '§ 2302 zák. č. 89/2012 Sb.',
      detect: /jistot|kauc/i,
      detectSample: 'Nájemce složí jistotu ve výši 135 000 Kč',
      reviewCheck:
        'NEHLAS jistotu vyšší než trojnásobek nájemného jako porušení zákona — ' +
        '§ 2254 se na prostor sloužící podnikání nevztahuje.',
    },
    {
      id: 'bizlease-predani',
      kind: 'recommended',
      label: 'předávací protokol',
      requirement:
        'Ujednej předání a převzetí prostoru protokolem se stavem měřidel ' +
        'a popisem stavu. Od převzetí se odvíjí odpovědnost za stav prostoru.',
      consequence: 'riziko',
      law: '§ 2205 zák. č. 89/2012 Sb.',
      detect: /předávac\S*\s+protokol|protokol\S*\s+o\s+předání|stav\S*\s+měřidel/i,
      detectSample: 'O předání prostoru bude sepsán předávací protokol se stavem měřidel',
      reviewCheck: 'Chybí ujednání o předávacím protokolu.',
    },
    {
      id: 'bizlease-podpisy',
      kind: 'form',
      label: 'podpisy obou stran',
      requirement: 'Smlouvu podepisují obě strany. Jde o dvoustranné právní jednání.',
      consequence: 'riziko',
      law: '§ 1724 zák. č. 89/2012 Sb.',
      detect: /podpis|v\s+\S+\s+dne|za\s+pronajímatele/i,
      detectSample: 'V Praze dne 1. 12. 2026, podpisy obou stran',
      reviewCheck: 'Chybí podpisová doložka jedné ze stran.',
    },
  ],
}
