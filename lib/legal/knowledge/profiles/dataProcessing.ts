/**
 * Zpracovatelská smlouva (DPA) — čl. 28 nařízení (EU) 2016/679
 *
 * The one contract type where the required content is written out in the law,
 * item by item. Article 28(3) names five things the contract must describe and
 * then eight obligations it must impose, lettered (a) to (h). A DPA missing any
 * of them is incomplete as a matter of regulation, not of taste — which makes
 * this the type where a checklist is most useful and most checkable.
 *
 * THE FAILURE MODE IS THE OPPOSITE OF USUAL
 *
 * Most templates do not omit Article 28; they quote it. The EDPB says plainly
 * that a processing agreement should not merely restate the regulation but set
 * out concretely how each requirement will be met. A contract saying the
 * processor "shall implement appropriate technical measures" adds nothing to
 * what the law already says and tells the controller nothing about what is
 * actually in place. So the rules below push for specifics: which measures,
 * within how many hours, which sub-processors, how long until deletion.
 */

import type { ContractLegalProfile } from '../types'

export const DATA_PROCESSING_PROFILE: ContractLegalProfile = {
  family: 'data-processing',
  label: 'Zpracovatelská smlouva (GDPR)',
  primaryLaw: 'čl. 28 nařízení (EU) 2016/679 (GDPR); zák. č. 110/2019 Sb.',
  characterisation:
    'Smlouva mezi správcem a zpracovatelem osobních údajů. Zpracovatel zpracovává ' +
    'údaje výhradně pro správce a na jeho doložené pokyny; obsah smlouvy předepisuje ' +
    'čl. 28 odst. 3 GDPR.',
  lastVerified: '2026-08-22',
  sources: [
    'https://gdpr-info.eu/art-28-gdpr/ (čl. 28 GDPR)',
    'https://www.edpb.europa.eu/ — Guidelines 07/2020 ke správci a zpracovateli',
    'https://www.edpb.europa.eu/system/files/2024-10/edpb_opinion_202422_relianceonprocessors-sub-processors_en.pdf',
    'https://uoou.gov.cz/poradna/poradna-gdpr/zpracovatel (ÚOOÚ)',
  ],
  rules: [
    // ─── Kdy je vůbec potřeba ────────────────────────────────────────────────
    {
      id: 'dpa-role',
      kind: 'essential',
      label: 'určení role stran',
      requirement:
        'Smlouva musí jasně určit, kdo je správce a kdo zpracovatel. Zpracovatelská ' +
        'smlouva se uzavírá jen tam, kde jedna strana zpracovává osobní údaje PRO ' +
        'druhou. Zpracovávají-li obě strany pro vlastní účely, jde o samostatné ' +
        'správce a čl. 28 se nepoužije.',
      consequence: 'nevznikne',
      law: 'čl. 4 bod 7 a 8, čl. 28 GDPR',
      detect: /správc\S*|zpracovatel/i,
      detectSample: 'Správce pověřuje zpracovatele zpracováním osobních údajů',
      reviewCheck:
        'Role stran nejsou určeny, nebo je jako zpracovatelská označena smlouva ' +
        'mezi dvěma samostatnými správci — pak je celý dokument nadbytečný a matoucí.',
    },

    // ─── Pět věcí, které musí smlouva POPSAT (čl. 28 odst. 3 věta první) ─────
    {
      id: 'dpa-predmet-doba',
      kind: 'essential',
      label: 'předmět a doba zpracování',
      requirement:
        'Uveď předmět zpracování a dobu, po kterou bude probíhat — konkrétním ' +
        'datem, dobou trvání hlavní smlouvy nebo jinou určitelnou skutečností.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 GDPR',
      detect: /předmět\S*\s+zpracování|doba\s+zpracování|po\s+dobu\s+trvání/i,
      detectSample: 'Předmět zpracování: vedení mzdové agendy po dobu trvání smlouvy',
      reviewCheck: 'Chybí vymezení předmětu nebo doby zpracování.',
    },
    {
      id: 'dpa-povaha-ucel',
      kind: 'essential',
      label: 'povaha a účel zpracování',
      requirement:
        'Popiš povahu zpracování (jaké operace se s údaji provádějí — ukládání, ' +
        'zpřístupňování, mazání) a účel, ke kterému správce údaje zpracovává.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 GDPR',
      detect: /účel\S*\s+zpracování|povah\S*\s+zpracování/i,
      detectSample: 'Účel zpracování: zpracování mezd a odvodů',
      reviewCheck: 'Chybí popis povahy nebo účelu zpracování.',
    },
    {
      id: 'dpa-typ-udaju',
      kind: 'essential',
      label: 'typ osobních údajů',
      requirement:
        'Vyjmenuj typy zpracovávaných údajů. Zahrnuje-li zpracování zvláštní ' +
        'kategorie podle čl. 9 (zdraví, biometrie, členství v odborech), uveď to ' +
        'výslovně — pojí se s nimi přísnější požadavky.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 a čl. 9 GDPR',
      detect: /typ\S*\s+osobních\s+údajů|kategorie\s+údajů|rozsah\s+údajů/i,
      detectSample: 'Typy osobních údajů: jméno, adresa, rodné číslo, číslo účtu',
      reviewCheck: 'Chybí výčet typů údajů, nebo je uveden jen obecně jako „osobní údaje".',
    },
    {
      id: 'dpa-kategorie-subjektu',
      kind: 'essential',
      label: 'kategorie subjektů údajů',
      requirement:
        'Uveď, čí údaje se zpracovávají — zaměstnanci, zákazníci, uchazeči, ' +
        'návštěvníci webu. Kategorie subjektů určuje rozsah rizika.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 GDPR',
      detect: /kategorie\s+subjektů|subjekt\S*\s+údajů/i,
      detectSample: 'Kategorie subjektů údajů: zaměstnanci správce',
      reviewCheck: 'Chybí vymezení, čí údaje jsou zpracovávány.',
    },

    // ─── Osm povinností (čl. 28 odst. 3 písm. a–h) ───────────────────────────
    {
      id: 'dpa-pokyny',
      kind: 'essential',
      label: 'zpracování jen na doložené pokyny',
      requirement:
        'Zpracovatel zpracovává údaje pouze na doložené pokyny správce, včetně ' +
        'předání do třetí země — ledaže mu to ukládá právo EU nebo členského státu. ' +
        'V takovém případě správce informuje předem, nezakazuje-li to zákon.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. a) GDPR',
      detect: /doložen\S*\s+pokyn|pouze\s+na\s+pokyn|na\s+základě\s+pokynů/i,
      detectSample: 'Zpracovatel zpracovává údaje pouze na doložené pokyny správce',
      reviewCheck: 'Chybí vázanost na pokyny správce — první z osmi povinností čl. 28 odst. 3.',
    },
    {
      id: 'dpa-mlcenlivost',
      kind: 'essential',
      label: 'mlčenlivost oprávněných osob',
      requirement:
        'Zpracovatel zajistí, že osoby oprávněné zpracovávat údaje se zavázaly ' +
        'k mlčenlivosti nebo je vážou zákonné povinnosti mlčenlivosti.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. b) GDPR',
      detect: /mlčenlivost/i,
      detectSample: 'Osoby oprávněné zpracovávat údaje jsou vázány mlčenlivostí',
      reviewCheck: 'Chybí závazek mlčenlivosti osob, které k údajům mají přístup.',
    },
    {
      id: 'dpa-bezpecnost',
      kind: 'essential',
      label: 'technická a organizační opatření',
      requirement:
        'Zpracovatel přijme opatření podle čl. 32. NEOPISUJ jen text nařízení — ' +
        'uveď konkrétně, co je zavedeno: šifrování, pseudonymizace, řízení přístupu, ' +
        'zálohování, obnovitelnost, testování. Obecná věta o „vhodných opatřeních" ' +
        'správci neříká nic.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. c) a čl. 32 GDPR',
      detect: /šifrov|pseudonymiz|technick\S*\s+a\s+organizačn|zabezpečení/i,
      detectSample: 'Zpracovatel zavedl šifrování a řízení přístupu k údajům',
      reviewCheck:
        'Bezpečnostní opatření popsaná jen odkazem na čl. 32 nebo obecnou frází. ' +
        'EDPB výslovně žádá konkrétní popis, ne opis nařízení.',
    },
    {
      id: 'dpa-subdodavatele',
      kind: 'essential',
      label: 'podmínky zapojení dalšího zpracovatele',
      requirement:
        'Uprav zapojení dalších zpracovatelů: buď konkrétní písemné povolení pro ' +
        'každého, nebo obecné povolení s povinností informovat správce o změnách ' +
        'a s právem správce vznést námitky. Na dalšího zpracovatele musí být ' +
        'přeneseny tytéž povinnosti.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 2 a odst. 3 písm. d) GDPR',
      detect: /další\S*\s+zpracovatel|subdodavatel|subzpracovatel/i,
      detectSample: 'Zpracovatel může zapojit dalšího zpracovatele jen s povolením správce',
      reviewCheck:
        'Chybí režim subdodavatelů, nebo je povolení dáno paušálně bez povinnosti ' +
        'informovat a bez práva vznést námitky.',
    },
    {
      id: 'dpa-prava-subjektu',
      kind: 'essential',
      label: 'součinnost při právech subjektů',
      requirement:
        'Zpracovatel je správci nápomocen při plnění povinnosti reagovat na žádosti ' +
        'subjektů údajů. Uveď lhůtu, ve které zpracovatel odpoví — správce má na ' +
        'vyřízení jeden měsíc, takže musí mít podklady dřív.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. e) a čl. 12 odst. 3 GDPR',
      detect: /žádost\S*\s+subjekt|práv\S*\s+subjektů|nápomocen/i,
      detectSample: 'Zpracovatel je správci nápomocen při vyřizování žádostí subjektů údajů',
      reviewCheck: 'Chybí součinnost při právech subjektů, nebo není uvedena lhůta.',
    },
    {
      id: 'dpa-incidenty',
      kind: 'essential',
      label: 'ohlašování incidentů a součinnost dle čl. 32–36',
      requirement:
        'Zpracovatel je nápomocen při zabezpečení, ohlašování porušení a posouzení ' +
        'vlivu. Uveď KONKRÉTNÍ lhůtu pro ohlášení incidentu správci — správce musí ' +
        'stihnout ohlásit dozorovému úřadu do 72 hodin, takže „bez zbytečného ' +
        'odkladu" je pro něj nepoužitelné.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. f) a čl. 33 odst. 2 GDPR',
      detect: /porušení\s+zabezpečení|bezpečnostní\S*\s+incident|72\s*hodin/i,
      detectSample: 'Zpracovatel ohlásí porušení zabezpečení do 24 hodin',
      reviewCheck:
        'Lhůta pro ohlášení incidentu chybí, nebo je vymezena jen jako „bez ' +
        'zbytečného odkladu" — správce pak nemá jak dodržet 72hodinovou lhůtu.',
    },
    {
      id: 'dpa-vymaz-vraceni',
      kind: 'essential',
      label: 'výmaz nebo vrácení údajů po skončení',
      requirement:
        'Po skončení poskytování služeb zpracovatel podle volby SPRÁVCE všechny ' +
        'údaje vymaže nebo vrátí a smaže existující kopie — ledaže právo EU nebo ' +
        'členského státu ukládá jejich uložení. Volba patří správci, ne zpracovateli.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. g) GDPR',
      detect: /vymaž|výmaz|vrácení\s+údajů|smaz/i,
      detectSample: 'Po skončení smlouvy zpracovatel údaje vymaže nebo vrátí',
      reviewCheck:
        'Chybí ujednání o osudu údajů po skončení, nebo volbu činí zpracovatel ' +
        'místo správce.',
    },
    {
      id: 'dpa-audit',
      kind: 'essential',
      label: 'doložení souladu a audity',
      requirement:
        'Zpracovatel poskytne správci všechny informace potřebné k doložení splnění ' +
        'povinností a umožní audity nebo inspekce prováděné správcem či pověřeným ' +
        'auditorem. Uprav praktické podmínky — oznámení předem, četnost, náklady.',
      consequence: 'neplatnost',
      law: 'čl. 28 odst. 3 písm. h) GDPR',
      detect: /audit|inspekc|doložení\s+souladu|kontrol\S*\s+u\s+zpracovatele/i,
      detectSample: 'Zpracovatel umožní správci provedení auditu',
      reviewCheck:
        'Chybí právo na audit, nebo je vyloučeno či podmíněno souhlasem zpracovatele — ' +
        'to čl. 28 odst. 3 písm. h) nepřipouští.',
    },

    // ─── Forma a další ───────────────────────────────────────────────────────
    {
      id: 'dpa-forma',
      kind: 'form',
      requirement:
        'Smlouva musí být písemná, postačí elektronická forma.',
      consequence: 'riziko',
      law: 'čl. 28 odst. 9 GDPR',
    },
    {
      id: 'dpa-neopisovat',
      // Not 'prohibited': restating the regulation does not make the contract
      // void, it makes it useless. The supervisory authority may find it
      // insufficient, which is a risk, not a sanction.
      kind: 'recommended',
      requirement:
        'Smlouva nesmí být pouhým opisem čl. 28. EDPB požaduje, aby uváděla ' +
        'konkrétně, JAK budou požadavky splněny — jinak správci neposkytuje ' +
        'žádnou informaci a nesplňuje účel.',
      consequence: 'riziko',
      law: 'EDPB Guidelines 07/2020, čl. 28 GDPR',
      reviewCheck:
        'Text jen parafrázuje nařízení bez jediného konkrétního údaje — žádná ' +
        'lhůta, žádné jmenované opatření, žádný seznam subdodavatelů.',
    },
    {
      id: 'dpa-treti-zeme',
      kind: 'mandatory',
      requirement:
        'Předává-li se do třetí země, musí být uveden mechanismus podle kapitoly V — ' +
        'rozhodnutí o odpovídající ochraně, standardní smluvní doložky, nebo jiná ' +
        'záruka. Samotný souhlas správce nestačí.',
      consequence: 'riziko',
      law: 'čl. 44–49 GDPR',
      appliesWhen: 'Údaje jsou předávány mimo EHP.',
      reviewCheck:
        'Předání mimo EHP bez uvedení právního mechanismu, nebo s odkazem na ' +
        'zrušené rozhodnutí (Safe Harbor, Privacy Shield).',
    },
    {
      id: 'dpa-odpovednost',
      kind: 'default',
      requirement:
        'Zpracovatel odpovídá za újmu způsobenou zpracováním, pokud nedodržel ' +
        'povinnosti uložené GDPR přímo zpracovatelům, nebo jednal mimo pokyny ' +
        'správce. Odpovědnost vůči subjektům údajů nelze smlouvou vyloučit.',
      consequence: 'doporuceni',
      law: 'čl. 82 GDPR',
      reviewCheck:
        'Ujednání vylučující odpovědnost zpracovatele vůči subjektům údajů — ' +
        'vůči nim je neúčinné.',
    },
    {
      id: 'dpa-pokyn-v-rozporu',
      kind: 'default',
      requirement:
        'Zpracovatel musí správce informovat, má-li za to, že pokyn porušuje GDPR ' +
        'nebo jiné předpisy o ochraně údajů.',
      consequence: 'doporuceni',
      law: 'čl. 28 odst. 3 poslední pododstavec GDPR',
    },
  ],
}
