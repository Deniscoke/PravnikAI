/**
 * Smlouva o poskytování služeb — § 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb.
 *
 * WHY THIS IS NOT A SMLOUVA O DÍLO
 *
 * A dílo promises a RESULT: the zhotovitel undertakes to carry out and hand
 * over the work, and is paid for having produced it (§ 2586). A service
 * promises an ACTIVITY performed with due care. The boundary decides who bears
 * the risk of the outcome, when the fee is due, and whether the § 2605 handover
 * and the § 2615 defect regime apply at all. Naming a document "smlouva
 * o poskytování služeb" does not settle it — the content does.
 *
 * THE RISK THAT DWARFS EVERY OTHER CLAUSE
 *
 * Where the provider is an individual working to the client's instructions, in
 * the client's name, personally, at the client's expense, the contract is not a
 * services contract at all: it is dependent work (§ 2 ZP), and dependent work
 * may be performed only in an employment relationship (§ 3 ZP). Allowing it
 * outside one is an offence carrying a fine of up to 10 000 000 Kč with a floor
 * of 50 000 Kč, plus a possible two-year ban on the activity and publication of
 * the decision (§ 140 zák. č. 435/2004 Sb.). No wording saves a contract whose
 * substance is employment — but wording that describes subordination invites
 * the inspection.
 *
 * THE DEFAULT NOBODY EXPECTS
 *
 * An indefinite-term contract binding a party to continuous or repeated
 * activity can be terminated only at the END OF A CALENDAR QUARTER, on at least
 * three months' notice (§ 1999). Parties who wanted a one-month exit and never
 * wrote one are bound by this instead.
 *
 * Verified against the statute text on 2026-08-23.
 */

import type { ContractLegalProfile } from '../types'
import { ILLEGAL_WORK_FINE_MAX_CZK, ILLEGAL_WORK_FINE_MIN_CZK, formatCzk } from '../../czechLegalFacts'

export const SERVICE_PROVISION_PROFILE: ContractLegalProfile = {
  family: 'service-provision',
  label: 'Smlouva o poskytování služeb',
  primaryLaw: '§ 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Závazek k činnosti prováděné s odbornou péčí, nikoli k výsledku. ' +
    'Nepojmenovaná smlouva, popřípadě smlouva příkazní.',
  lastVerified: '2026-08-23',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 1746, § 1999, § 2430–2444, § 2586)',
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 2 a § 3)',
    'https://www.zakonyprolidi.cz/cs/2004-435 (§ 5 písm. e, § 140)',
  ],
  inapplicable: [
    {
      section: '2605',
      law: '89/2012',
      why:
        'Předání a převzetí díla se na službu nevztahuje, není-li sjednán ' +
        'hmotný výstup. U činnosti se nepřebírá dílo, nýbrž se vykazuje ' +
        'poskytnutá služba.',
    },
    {
      section: '2615',
      law: '89/2012',
      why:
        'Režim vad díla platí pro dílo. U služby se odpovídá za to, že činnost ' +
        'byla provedena s odbornou péčí, nikoli za dosažení výsledku.',
    },
  ],
  rules: [
    // ─── Hranice mezi službou a dílem ────────────────────────────────────────
    {
      id: 'service-cinnost-ne-vysledek',
      kind: 'essential',
      label: 'vymezení služby',
      requirement:
        'Vymez, JAKÁ ČINNOST se poskytuje, v jakém rozsahu a jak často. Slibuje-li ' +
        'poskytovatel konkrétní VÝSLEDEK, který se předává a přebírá, jde ve ' +
        'skutečnosti o dílo podle § 2586 a řídí se jiným režimem — včetně předání, ' +
        'převzetí a odpovědnosti za vady.',
      consequence: 'nevznikne',
      law: '§ 1746 odst. 2 a § 2586 zák. č. 89/2012 Sb.',
      detect: /služb|činnost|poskytovat|rozsah/i,
      detectSample: 'Poskytovatel poskytuje správu serverů v rozsahu 20 hodin měsíčně',
      reviewCheck:
        'Chybí vymezení poskytované činnosti, nebo smlouva nadepsaná jako služby ' +
        've skutečnosti slibuje předání konkrétního výsledku — pak jde o dílo ' +
        'a uplatní se § 2586 a násl.',
    },
    {
      id: 'service-odborna-pece',
      kind: 'default',
      requirement:
        'Poskytovatel odpovídá za to, že činnost provede s odbornou péčí, nikoli ' +
        'za to, že nastane určitý výsledek. Chce-li objednatel zaručit výsledek, ' +
        'musí to být ujednáno výslovně — a pak se smlouva blíží dílu.',
      consequence: 'doporuceni',
      law: '§ 5 a § 2432 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva označená jako služba zaručuje konkrétní měřitelný výsledek ' +
        '(např. dosažení obratu, umístění ve vyhledávači) — takový závazek se ' +
        'posuzuje jako dílo a nese jiné riziko.',
    },

    // ─── Švarcsystém ─────────────────────────────────────────────────────────
    {
      id: 'service-zavisla-prace',
      kind: 'prohibited',
      requirement:
        'Smlouva nesmí popisovat závislou práci. Závislá práce je práce ve vztahu ' +
        'nadřízenosti a podřízenosti, jménem zaměstnavatele, podle jeho pokynů ' +
        'a vykonávaná osobně, za odměnu, na náklady a odpovědnost zaměstnavatele, ' +
        'v pracovní době na jeho pracovišti. Takovou práci lze konat výlučně ' +
        'v pracovněprávním vztahu. NEPIŠ proto do smlouvy pracovní dobu, ' +
        'dovolenou, nadřízeného, docházku ani povinnost osobního výkonu bez ' +
        'možnosti zastoupení.',
      consequence: 'neplatnost',
      law: '§ 2 a § 3 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Smlouva o službách obsahuje znaky závislé práce — pracovní dobu, ' +
        'dovolenou, nadřízeného, docházku, výhradně osobní výkon nebo odměnu ' +
        'za čas namísto za službu. To je nejzávažnější riziko celé smlouvy.',
    },
    {
      id: 'service-svarcsystem-sankce',
      kind: 'mandatory',
      requirement:
        'Umožnění výkonu závislé práce mimo pracovněprávní vztah je přestupkem ' +
        `s pokutou až ${formatCzk(ILLEGAL_WORK_FINE_MAX_CZK.value)}, nejméně však ` +
        `${formatCzk(ILLEGAL_WORK_FINE_MIN_CZK.value)}. Lze uložit i zákaz činnosti ` +
        'až na dva roky a zveřejnění rozhodnutí. Postihuje objednatele, nikoli ' +
        'poskytovatele.',
      consequence: 'riziko',
      law: '§ 5 písm. e) bod 1 a § 140 zák. č. 435/2004 Sb.',
      reviewCheck:
        'Znaky závislé práce ve smlouvě mezi objednatelem a fyzickou osobou — ' +
        'upozorni na sankci podle zákona o zaměstnanosti, nesou ji obě strany ' +
        'jinak a hrozí i zákaz činnosti.',
    },
    {
      id: 'service-samostatnost',
      kind: 'recommended',
      label: 'samostatnost poskytovatele',
      requirement:
        'Ujednej výslovně, že poskytovatel určuje způsob a čas provedení sám, ' +
        'nese vlastní náklady a odpovědnost, používá vlastní prostředky a může ' +
        'plnit prostřednictvím třetí osoby. Jsou to znaky, které smlouvu odlišují ' +
        'od závislé práce.',
      consequence: 'riziko',
      law: '§ 2 zák. č. 262/2006 Sb. a contrario',
      detect: /vlastn\S*\s+(náklad|prostředk|odpovědnost)|samostatn|způsob\S*\s+provedení|prostřednictvím\s+třetí/i,
      detectSample:
        'Poskytovatel určuje způsob provedení sám, na vlastní náklady a odpovědnost',
      reviewCheck:
        'Chybí ujednání o samostatnosti poskytovatele — vlastní náklady, vlastní ' +
        'prostředky, volba způsobu a času provedení.',
    },

    // ─── Odměna ──────────────────────────────────────────────────────────────
    {
      id: 'service-odmena',
      kind: 'essential',
      label: 'odměna a splatnost',
      requirement:
        'Uveď výši odměny nebo způsob jejího určení, splatnost a to, zda je ' +
        'uvedena včetně DPH. U opakované služby uveď fakturační období.',
      consequence: 'nevznikne',
      law: '§ 1746 odst. 2 a § 2438 zák. č. 89/2012 Sb.',
      detect: /odměn|cen\S*\s+za|fakturac|splatn|Kč/i,
      detectSample: 'Odměna činí 25 000 Kč měsíčně se splatností 14 dnů',
      reviewCheck: 'Chybí výše odměny nebo její splatnost.',
    },
    {
      id: 'service-naklady',
      kind: 'recommended',
      label: 'náhrada nákladů',
      requirement:
        'Ujednej, zda odměna zahrnuje náklady poskytovatele, nebo se hradí zvlášť. ' +
        'U příkazní smlouvy náleží příkazníkovi náhrada nákladů účelně ' +
        'vynaložených při plnění příkazu, i když nebyla sjednána.',
      consequence: 'riziko',
      law: '§ 2436 zák. č. 89/2012 Sb.',
      detect: /náklad|cestovn|výdaj/i,
      detectSample: 'Cestovní náklady hradí objednatel nad rámec odměny',
      reviewCheck: 'Není zřejmé, zda odměna zahrnuje náklady, nebo se hradí zvlášť.',
    },

    // ─── Trvání a ukončení ───────────────────────────────────────────────────
    {
      id: 'service-vypoved-ctvrtleti',
      kind: 'mandatory',
      label: 'ujednání o výpovědi',
      requirement:
        'Zavazuje-li smlouva na dobu neurčitou k nepřetržité nebo opakované ' +
        'činnosti a strany si výpověď neujednaly, lze závazek zrušit jen KE KONCI ' +
        'KALENDÁŘNÍHO ČTVRTLETÍ výpovědí podanou alespoň tři měsíce předem. ' +
        'Chcete-li kratší nebo pružnější ukončení, musí být ve smlouvě.',
      consequence: 'riziko',
      law: '§ 1999 odst. 1 zák. č. 89/2012 Sb.',
      detect: /výpověď|vypovědět|výpovědn\S*\s+dob|ukončen/i,
      detectSample: 'Smlouvu lze vypovědět s jednoměsíční výpovědní dobou',
      reviewCheck:
        'Smlouva na dobu neurčitou bez ujednání o výpovědi. Uplatní se § 1999 — ' +
        'zrušení jen ke konci kalendářního čtvrtletí a s tříměsíčním předstihem, ' +
        'což bývá pro obě strany překvapení.',
    },
    {
      id: 'service-doba-trvani',
      kind: 'essential',
      label: 'doba trvání',
      requirement:
        'Uveď, zda se smlouva uzavírá na dobu určitou, nebo neurčitou. Na tom ' +
        'závisí, jak ji lze ukončit.',
      consequence: 'nevznikne',
      law: '§ 1998 zák. č. 89/2012 Sb.',
      detect: /dob\S*\s+(určit|neurčit)|od\s+\d|do\s+\d/i,
      detectSample: 'Smlouva se uzavírá na dobu neurčitou',
      reviewCheck: 'Chybí údaj o době trvání smlouvy.',
    },

    // ─── Ostatní ─────────────────────────────────────────────────────────────
    {
      id: 'service-pokyny-objednatele',
      kind: 'default',
      requirement:
        'Příkazník plní příkaz poctivě a pečlivě podle svých schopností. Od ' +
        'pokynů se může odchýlit, jen je-li to nezbytné v zájmu příkazce a nemůže-li ' +
        'si včas vyžádat jeho souhlas. Pokyny k VÝSLEDKU jsou v pořádku; pokyny ' +
        'k tomu, kdy a odkud se pracuje, jsou znakem závislé práce.',
      consequence: 'doporuceni',
      law: '§ 2432 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Objednatel si vyhrazuje řídit průběh práce, docházku či pracovní dobu ' +
        'poskytovatele — to překračuje pokyny k výsledku.',
    },
    {
      id: 'service-osobni-udaje',
      kind: 'mandatory',
      requirement:
        'Zpracovává-li poskytovatel osobní údaje pro objednatele, je zpracovatelem ' +
        'a je nutná samostatná zpracovatelská smlouva podle čl. 28 GDPR. Ustanovení ' +
        'o mlčenlivosti ji nenahrazuje.',
      consequence: 'riziko',
      law: 'čl. 28 nařízení (EU) 2016/679',
      appliesWhen: 'Poskytovatel zpracovává osobní údaje pro objednatele.',
      reviewCheck:
        'Služba zahrnuje zpracování osobních údajů, ale chybí odkaz na ' +
        'zpracovatelskou smlouvu podle čl. 28 GDPR.',
    },
    {
      id: 'service-podpisy',
      kind: 'form',
      label: 'podpisy obou stran',
      requirement:
        'Smlouvu podepisují obě strany. Na rozdíl od výpovědi či reklamace jde ' +
        'o dvoustranné právní jednání.',
      consequence: 'riziko',
      law: '§ 1724 zák. č. 89/2012 Sb.',
      detect: /podpis|v\s+\S+\s+dne|za\s+poskytovatele/i,
      detectSample: 'V Praze dne 3. 3. 2026, podpisy obou stran',
      reviewCheck: 'Chybí podpisová doložka jedné ze stran.',
    },
  ],
}
