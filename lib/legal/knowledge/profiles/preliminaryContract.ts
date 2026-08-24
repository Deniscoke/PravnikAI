/**
 * Smlouva o smlouvě budoucí — § 1785–1788 zák. č. 89/2012 Sb.
 *
 * TWO WAYS IT DIES QUIETLY
 *
 * § 1788 odst. 1: if the entitled party does not CALL the other one in time,
 * the duty to conclude the future contract simply expires. No breach, no
 * notice, nothing to appeal — the deadline passes and the deal is gone. Both
 * sides usually assume the contract "holds" until someone acts, and by then it
 * is over. The period is whatever the parties agreed; failing that, ONE YEAR
 * (§ 1785).
 *
 * § 1788 odst. 2 is the other exit: a change in the circumstances the parties
 * evidently proceeded from, severe enough that concluding can no longer
 * reasonably be required. The bound party who does not report that change
 * without undue delay owes damages — a duty worth writing down, because it is
 * the only thing standing between "circumstances changed" and a free walkaway.
 *
 * WHY VAGUENESS DEFEATS THE WHOLE POINT
 *
 * § 1787 is what makes this document worth more than a handshake: if the bound
 * party refuses, the COURT (or a person named in the contract) determines the
 * content of the future contract and it comes into being. But a court can only
 * determine content that was agreed "alespoň obecným způsobem" (§ 1785). A
 * preliminary contract that names no price mechanism, no property and no date
 * leaves the court nothing to work from, and the remedy is empty.
 *
 * FORM
 *
 * The preliminary contract itself has no statutory written-form requirement —
 * § 560 covers acts creating, transferring, changing or extinguishing a real
 * right, which this is not. The FUTURE purchase of real property does require
 * it (§ 2128 odst. 1). Writing the preliminary one down anyway is not a
 * formality: without it there is nothing for § 1787 to read.
 *
 * Verified against the statute text on 2026-08-24.
 */

import type { ContractLegalProfile } from '../types'

export const PRELIMINARY_CONTRACT_PROFILE: ContractLegalProfile = {
  family: 'preliminary-contract',
  label: 'Smlouva o smlouvě budoucí',
  primaryLaw: '§ 1785–1788 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Závazek alespoň jedné strany uzavřít po vyzvání budoucí smlouvu, jejíž ' +
    'obsah je ujednán alespoň obecným způsobem.',
  lastVerified: '2026-08-24',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 560, § 1785–1788, § 2128)',
    'https://www.zakonyprolidi.cz/cs/2013-256 (§ 7)',
  ],
  inapplicable: [
    {
      section: '560',
      law: '89/2012',
      why:
        'Písemnou formu vyžaduje jednání, kterým se věcné právo k nemovité věci ' +
        'zřizuje, převádí, mění nebo ruší. Smlouva o smlouvě budoucí žádné věcné ' +
        'právo nepřevádí — nehlas absenci písemné formy jako důvod neplatnosti. ' +
        'Písemná forma je zde ale nezbytná prakticky.',
    },
  ],
  rules: [
    // ─── Obsah budoucí smlouvy ───────────────────────────────────────────────
    {
      id: 'prelim-obsah-budouci',
      kind: 'essential',
      label: 'obsah budoucí smlouvy',
      requirement:
        'Vymez obsah budoucí smlouvy alespoň OBECNÝM ZPŮSOBEM — kdo, co, za ' +
        'kolik a za jakých podstatných podmínek. Není to formalita: podle § 1787 ' +
        'může obsah budoucí smlouvy určit soud, ale jen z toho, co strany ujednaly. ' +
        'Čím vágnější vymezení, tím prázdnější je celý dokument.',
      consequence: 'nevznikne',
      law: '§ 1785 zák. č. 89/2012 Sb.',
      detect: /budoucí\s+(kupní|nájemní|smlouv)|předmět\S*\s+budoucí|obsah\S*\s+budoucí/i,
      detectSample: 'Předmětem budoucí kupní smlouvy je bytová jednotka č. 12/3',
      reviewCheck:
        'Obsah budoucí smlouvy není vymezen ani obecným způsobem. Soud pak nemá ' +
        'podle čeho obsah určit a právo podle § 1787 je nevymahatelné.',
    },
    {
      id: 'prelim-predmet',
      kind: 'essential',
      label: 'předmět budoucí smlouvy',
      requirement:
        'Označ předmět jednoznačně. U nemovitosti uveď údaje z katastru — číslo ' +
        'jednotky nebo parcely, katastrální území a list vlastnictví.',
      consequence: 'nevznikne',
      law: '§ 1785 zák. č. 89/2012 Sb.',
      detect: /katastráln\S*\s+území|list\s+vlastnictví|parcel|jednotk\S*\s*č|LV\s*\d/i,
      detectSample: 'Jednotka č. 12/3 v k. ú. Vinohrady, LV 4521',
      reviewCheck: 'Chybí jednoznačné označení předmětu budoucí smlouvy.',
    },
    {
      id: 'prelim-cena',
      kind: 'essential',
      label: 'cena nebo způsob jejího určení',
      requirement:
        'Uveď kupní cenu, nájemné nebo alespoň způsob jejího určení. Bez ceny ' +
        'ani mechanismu jejího výpočtu nelze obsah budoucí smlouvy určit.',
      consequence: 'nevznikne',
      law: '§ 1785 a § 1787 odst. 2 zák. č. 89/2012 Sb.',
      detect: /kupní\s+cen|cena\s+činí|Kč|způsob\S*\s+určení\s+ceny/i,
      detectSample: 'Kupní cena činí 6 400 000 Kč',
      reviewCheck: 'Chybí cena i způsob jejího určení.',
    },

    // ─── Lhůta a výzva ───────────────────────────────────────────────────────
    {
      id: 'prelim-lhuta-vyzvy',
      kind: 'mandatory',
      label: 'lhůta pro výzvu k uzavření',
      requirement:
        'Uveď, do kdy má oprávněná strana vyzvat k uzavření budoucí smlouvy. ' +
        'Není-li lhůta ujednána, platí JEDEN ROK. Zmeškání této lhůty není ' +
        'porušením smlouvy — povinnost uzavřít budoucí smlouvu prostě ZANIKNE.',
      consequence: 'riziko',
      law: '§ 1785 a § 1788 odst. 1 zák. č. 89/2012 Sb.',
      detect: /vyz(ve|vat|ván)|lhůt\S*\s+pro\s+výzvu|do\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}|nejpozději\s+do/i,
      detectSample: 'Oprávněná strana vyzve druhou stranu k uzavření nejpozději do 30. 6. 2027',
      reviewCheck:
        'Chybí lhůta pro výzvu k uzavření budoucí smlouvy. Uplatní se roční lhůta ' +
        'a po jejím marném uplynutí závazek zaniká — bez porušení a bez náhrady.',
    },
    {
      id: 'prelim-zanik-nevyzvanim',
      kind: 'default',
      requirement:
        'Nevyzve-li oprávněná strana včas, povinnost uzavřít budoucí smlouvu ' +
        'ZANIKÁ. Je to nejčastější způsob, jakým se smlouva o smlouvě budoucí ' +
        'vytratí — obě strany čekají a lhůta mezitím uplyne.',
      consequence: 'doporuceni',
      law: '§ 1788 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že závazek trvá, dokud jej některá strana nevypoví. Marným ' +
        'uplynutím lhůty pro výzvu zaniká sám.',
    },
    {
      id: 'prelim-forma-vyzvy',
      kind: 'recommended',
      label: 'forma a doručení výzvy',
      requirement:
        'Ujednej, jak se výzva činí a kam se doručuje. Od jejího dojití běží ' +
        'povinnost uzavřít smlouvu bez zbytečného odkladu a v případném sporu se ' +
        'včasnost výzvy prokazuje.',
      consequence: 'riziko',
      law: '§ 1786 zák. č. 89/2012 Sb.',
      detect: /doporučen|datov\S*\s+schránk|písemn\S*\s+výzv|doruč/i,
      detectSample: 'Výzva se doručuje doporučeně na adresu uvedenou v záhlaví',
      reviewCheck: 'Chybí ujednání o formě a doručení výzvy k uzavření budoucí smlouvy.',
    },
    {
      id: 'prelim-lhuta-k-uzavreni',
      kind: 'recommended',
      label: 'lhůta k uzavření po výzvě',
      requirement:
        'Uveď, do kdy po výzvě má být budoucí smlouva uzavřena. Zákon říká „bez ' +
        'zbytečného odkladu", což se vykládá různě — konkrétní počet dnů spor ' +
        'předchází.',
      consequence: 'riziko',
      law: '§ 1786 zák. č. 89/2012 Sb.',
      detect: /do\s+\d+\s*dn\S*\s+od\s+(doručení|výzvy)|bez\s+zbytečného\s+odkladu/i,
      detectSample: 'Budoucí smlouva bude uzavřena do 30 dnů od doručení výzvy',
      reviewCheck: 'Chybí lhůta k uzavření budoucí smlouvy po doručení výzvy.',
    },

    // ─── Vymahatelnost ───────────────────────────────────────────────────────
    {
      id: 'prelim-urceni-soudem',
      kind: 'default',
      requirement:
        'Nesplní-li zavázaná strana povinnost uzavřít smlouvu, může oprávněná ' +
        'strana žádat, aby obsah budoucí smlouvy určil SOUD nebo osoba určená ve ' +
        'smlouvě. Soud vychází z účelu, z návrhů stran a z toho, aby práva ' +
        'a povinnosti byly poctivě uspořádány. Je to hlavní důvod, proč se ' +
        'smlouva o smlouvě budoucí uzavírá.',
      consequence: 'doporuceni',
      law: '§ 1787 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že jediným následkem nesplnění je smluvní pokuta nebo ' +
        'náhrada škody. Oprávněná strana může žádat určení obsahu soudem a smlouva ' +
        'tak vznikne i bez součinnosti druhé strany.',
    },
    {
      id: 'prelim-zmena-okolnosti',
      kind: 'mandatory',
      label: 'ujednání o změně okolností',
      requirement:
        'Změní-li se okolnosti, z nichž strany zřejmě vycházely, do té míry, že ' +
        'na zavázané straně nelze rozumně požadovat uzavření smlouvy, povinnost ' +
        'ZANIKÁ. Zavázaná strana však musí změnu oprávněné straně oznámit BEZ ' +
        'ZBYTEČNÉHO ODKLADU — jinak nahradí škodu, která tím vznikla.',
      consequence: 'riziko',
      law: '§ 1788 odst. 2 zák. č. 89/2012 Sb.',
      detect: /změn\S*\s+okolnost|podstatn\S*\s+změn/i,
      detectSample: 'Zavázaná strana oznámí změnu okolností bez zbytečného odkladu',
      reviewCheck:
        'Chybí ujednání o změně okolností a oznamovací povinnosti. Bez ní se ' +
        'zavázaná strana může závazku zbavit a druhá se to dozví pozdě.',
    },

    // ─── Peníze ──────────────────────────────────────────────────────────────
    {
      id: 'prelim-zaloha',
      kind: 'recommended',
      label: 'osud zálohy nebo rezervačního poplatku',
      requirement:
        'Byla-li složena záloha nebo rezervační poplatek, uveď VÝSLOVNĚ, co se ' +
        's ní stane, nedojde-li k uzavření budoucí smlouvy — a rozliš podle toho, ' +
        'na čí straně důvod leží. Bez toho vzniká spor pokaždé, když obchod ' +
        'nedopadne.',
      consequence: 'riziko',
      law: '§ 1785 a § 2991 zák. č. 89/2012 Sb.',
      detect: /zálohu|záloha|rezervačn\S*\s+poplat|vrácen/i,
      detectSample: 'Nedojde-li k uzavření smlouvy z důvodu na straně prodávajícího, záloha se vrací',
      reviewCheck:
        'Chybí ujednání o osudu zálohy nebo rezervačního poplatku při neuzavření ' +
        'budoucí smlouvy.',
    },
    {
      id: 'prelim-smluvni-pokuta',
      kind: 'default',
      requirement:
        'Smluvní pokutu lze sjednat, musí být však přiměřená — nepřiměřeně vysokou ' +
        'může soud na návrh snížit. Uveď, zda se vedle pokuty lze domáhat i náhrady ' +
        'škody; bez ujednání pokuta náhradu škody nahrazuje.',
      consequence: 'doporuceni',
      law: '§ 2048 až § 2050 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Sjednána smluvní pokuta bez uvedení, zda se lze domáhat i náhrady škody. ' +
        'Podle § 2050 pak náhradu škody vedle pokuty požadovat nelze.',
    },

    // ─── Co následuje ────────────────────────────────────────────────────────
    {
      id: 'prelim-forma-budouci-smlouvy',
      kind: 'default',
      requirement:
        'Půjde-li o koupi nemovité věci, bude BUDOUCÍ smlouva vyžadovat písemnou ' +
        'formu. Samotná smlouva o smlouvě budoucí písemnou formu ze zákona ' +
        'nevyžaduje, protože žádné věcné právo nepřevádí — písemná je ale ' +
        'nezbytná, má-li být podle ní určen obsah budoucí smlouvy.',
      consequence: 'doporuceni',
      law: '§ 2128 odst. 1 a § 560 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že smlouva o smlouvě budoucí je neplatná pro nedostatek ' +
        'písemné formy. § 560 na ni nedopadá — dopadá až na budoucí smlouvu ' +
        'o převodu nemovitosti.',
    },
    {
      id: 'prelim-katastr-podpisy',
      kind: 'recommended',
      requirement:
        'U nemovitosti počítej s tím, že podpisy na budoucí kupní smlouvě bude ' +
        'třeba úředně ověřit. Nejsou-li ověřeny, musí navrhovatel prokázat jejich ' +
        'pravost do 30 dnů od podání návrhu na vklad, jinak katastrální úřad ' +
        'řízení zastaví.',
      consequence: 'doporuceni',
      law: '§ 7 odst. 2 zák. č. 256/2013 Sb.',
      detect: /úředn\S*\s+ověřen|ověřen\S*\s+podpis|vklad\S*\s+do\s+katastru/i,
      detectSample: 'Podpisy na budoucí kupní smlouvě budou úředně ověřeny',
      reviewCheck: 'Chybí ujednání o úředním ověření podpisů na budoucí smlouvě.',
    },
    {
      id: 'prelim-podpisy',
      kind: 'form',
      label: 'podpisy obou stran',
      requirement:
        'Smlouvu podepisují obě strany. Zavazuje-li se jen jedna z nich, uveď to ' +
        'výslovně — § 1785 to připouští, ale musí to být zřejmé.',
      consequence: 'riziko',
      law: '§ 1785 a § 1724 zák. č. 89/2012 Sb.',
      detect: /podpis|v\s+\S+\s+dne|za\s+budoucího/i,
      detectSample: 'V Praze dne 1. 3. 2027, podpisy obou stran',
      reviewCheck: 'Chybí podpisová doložka jedné ze stran.',
    },
  ],
}
