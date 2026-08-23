/**
 * Reklamace — § 2161 a násl. zák. č. 89/2012 Sb. a § 19 zák. č. 634/1992 Sb.
 *
 * WHY THIS IS THE MOST DANGEROUS TYPE TO COPY FROM A TEMPLATE
 *
 * The spotřebitelská novela (zák. č. 374/2022 Sb., účinná 6. 1. 2023) rewrote
 * exactly the numbers every template repeats. Three of them are still wrong on
 * most of the Czech internet:
 *
 *   - "zákonná záruka 24 měsíců". There is no statutory záruka any more. What
 *     the buyer has is a two-year window in which a defect may MANIFEST
 *     (§ 2165 odst. 1) — a different thing, and a stronger one, because the
 *     right is not extinguished by reporting late (§ 2165 odst. 3).
 *   - "prodávající rozhodne o reklamaci do tří pracovních dnů". That rule is
 *     gone from § 19 entirely. What remains is the thirty days to settle the
 *     complaint AND inform the consumer.
 *   - "marné uplynutí třicetidenní lhůty je podstatným porušením smlouvy".
 *     Also stale. § 19 odst. 4 now gives the consumer the right to withdraw or
 *     demand a discount directly, without the detour through § 2002.
 *
 * The other thing templates get wrong is the order of remedies. A consumer
 * cannot open by demanding money back. § 2169 gives repair or replacement
 * first, at the buyer's choice; the discount and withdrawal in § 2171 unlock
 * only in the four listed situations. A reklamace that opens with "žádám
 * vrácení peněz" invites a rejection the buyer did not need to collect.
 *
 * Verified against the statute text on 2026-08-23.
 */

import type { ContractLegalProfile } from '../types'

export const COMPLAINT_PROFILE: ContractLegalProfile = {
  family: 'complaint',
  label: 'Reklamace (uplatnění práv z vadného plnění)',
  primaryLaw: '§ 2161–2174 zák. č. 89/2012 Sb. a § 19 zák. č. 634/1992 Sb.',
  characterisation:
    'Jednostranné právní jednání, kterým kupující vytýká vadu a uplatňuje ' +
    'právo z vadného plnění. Účinky se pojí s dojitím prodávajícímu.',
  lastVerified: '2026-08-23',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2161, § 2165–2174, § 1924)',
    'https://www.zakonyprolidi.cz/cs/1992-634 (§ 19)',
    'zák. č. 374/2022 Sb. — spotřebitelská novela, účinná 6. 1. 2023',
  ],
  inapplicable: [
    {
      section: '2113',
      law: '89/2012',
      why:
        'Záruka za jakost vzniká jen prohlášením prodávajícího nebo ujednáním ' +
        '(§ 2113 a § 2174a). Není to zákonná dvouletá záruka a u běžné reklamace ' +
        'se jí nedovolávej, není-li v podkladech záruční list.',
    },
    {
      section: '1829',
      law: '89/2012',
      why:
        'Čtrnáctidenní odstoupení spotřebitele je jiný institut než reklamace. ' +
        'Nevyžaduje vadu a s právy z vadného plnění nesouvisí.',
    },
  ],
  rules: [
    // ─── Co musí reklamace obsahovat ─────────────────────────────────────────
    {
      id: 'complaint-oznaceni-koupe',
      kind: 'essential',
      label: 'identifikace koupě',
      requirement:
        'Označ zboží a doklad o koupi — co bylo koupeno, kdy a za kolik, číslo ' +
        'objednávky nebo účtenky. Bez toho nelze reklamaci přiřadit.',
      consequence: 'nevznikne',
      law: '§ 2172 zák. č. 89/2012 Sb.',
      detect: /objednávk|účtenk|faktur|zakoupil|koupil|ze\s+dne/i,
      detectSample: 'Zboží zakoupené dne 3. 3. 2026, objednávka č. 2026/114',
      reviewCheck: 'Chybí identifikace zboží nebo dokladu o koupi.',
    },
    {
      id: 'complaint-popis-vady',
      kind: 'essential',
      label: 'popis vady',
      requirement:
        'Popiš vadu skutkově — v čem se projevuje, kdy se poprvé projevila a za ' +
        'jakých okolností. Obecné „nefunguje to" prodávajícímu umožní reklamaci ' +
        'odmítnout pro neurčitost.',
      consequence: 'nevznikne',
      law: '§ 2161 a § 2165 zák. č. 89/2012 Sb.',
      detect: /vad|závad|nefunguj|poškozen|projevil/i,
      detectSample: 'Vada se projevila 12. 8. 2026 — přístroj se samovolně vypíná',
      reviewCheck: 'Chybí skutkový popis vady, jen obecné konstatování nespokojenosti.',
    },
    {
      id: 'complaint-zvoleny-narok',
      kind: 'essential',
      label: 'zvolený způsob vyřízení',
      requirement:
        'Uveď, co požaduješ — odstranění vady opravou, nebo dodání nové věci. ' +
        'Volba je na kupujícím. Prodávající musí podle § 19 odst. 2 zákona ' +
        'o ochraně spotřebitele požadovaný způsob vyřízení uvést v potvrzení, ' +
        'takže jej ve zprávě uveď výslovně.',
      consequence: 'nevznikne',
      law: '§ 2169 odst. 1 zák. č. 89/2012 Sb.',
      detect: /požaduj|žádám|opravu|dodání\s+nové|výměn/i,
      detectSample: 'Požaduji odstranění vady opravou věci',
      reviewCheck: 'Chybí uvedení, jaký způsob vyřízení reklamace kupující požaduje.',
    },
    {
      id: 'complaint-poradi-naroku',
      kind: 'mandatory',
      requirement:
        'Kupující volí mezi OPRAVOU a DODÁNÍM NOVÉ VĚCI. Přiměřenou slevu nebo ' +
        'odstoupení od smlouvy lze požadovat jen tehdy, pokud prodávající vadu ' +
        'odmítl odstranit nebo ji neodstranil řádně, vada se projeví opakovaně, ' +
        'je podstatným porušením smlouvy, nebo je zjevné, že nebude odstraněna ' +
        'v přiměřené době. Nesměřuj rovnou k vrácení peněz, není-li splněna ' +
        'některá z těchto podmínek.',
      consequence: 'riziko',
      law: '§ 2169 odst. 1 a § 2171 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Reklamace požaduje vrácení peněz nebo slevu, aniž by byl uveden některý ' +
        'z důvodů podle § 2171 odst. 1. Prodávající ji v tomto pořadí odmítne ' +
        'oprávněně — nejprve náleží oprava nebo výměna podle volby kupujícího.',
    },
    {
      id: 'complaint-forma-doruceni',
      kind: 'form',
      label: 'způsob doručení',
      requirement:
        'Reklamace působí dojitím prodávajícímu a od jejího uplatnění běží ' +
        'třicetidenní lhůta. Uveď, jak je doručována, a doručení si zajisti ' +
        'prokazatelně.',
      consequence: 'riziko',
      law: '§ 19 odst. 3 zák. č. 634/1992 Sb. a § 570 zák. č. 89/2012 Sb.',
      detect: /doruč|doporuč|zasíl|zasl|předán|e-?mail/i,
      detectSample: 'Reklamace se zasílá doporučeně na adresu prodávajícího',
      reviewCheck: 'Chybí způsob doručení — od uplatnění reklamace běží lhůta 30 dnů.',
    },
    {
      id: 'complaint-kontakt',
      kind: 'recommended',
      label: 'kontaktní údaje pro vyrozumění',
      requirement:
        'Uveď kontaktní údaje pro informaci o vyřízení reklamace. Prodávající je ' +
        'musí uvést v potvrzení o uplatnění reklamace a je povinen kupujícího ' +
        'o vyřízení informovat.',
      consequence: 'riziko',
      law: '§ 19 odst. 2 a 3 zák. č. 634/1992 Sb.',
      detect: /kontakt|e-?mail|telefon|@/i,
      detectSample: 'Kontakt pro vyrozumění: jan.novak@example.cz',
      reviewCheck: 'Chybí kontaktní údaje pro vyrozumění o vyřízení reklamace.',
    },

    // ─── Lhůty ───────────────────────────────────────────────────────────────
    {
      id: 'complaint-dvouleta-doba',
      kind: 'default',
      requirement:
        'Kupující může vytknout vadu, která se na věci PROJEVÍ v době dvou let ' +
        'od převzetí. Není to záruční doba ani lhůta pro podání reklamace — je to ' +
        'doba, ve které se vada musí projevit. Soud právo z vady přizná i tehdy, ' +
        'nebyla-li vytknuta bez zbytečného odkladu.',
      consequence: 'doporuceni',
      law: '§ 2165 odst. 1 a 3 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text mluví o „zákonné záruce 24 měsíců" nebo tvrdí, že po dvou letech ' +
        'právo zaniklo. Zákonná záruka po novele č. 374/2022 Sb. neexistuje; ' +
        'dva roky jsou dobou, v níž se vada musí projevit.',
    },
    {
      id: 'complaint-domnenka-rok',
      kind: 'default',
      requirement:
        'Projeví-li se vada do JEDNOHO ROKU od převzetí, má se za to, že věc byla ' +
        'vadná už při převzetí, ledaže to povaha věci nebo vady vylučuje. Do ' +
        'jednoho roku tedy neexistenci vady prokazuje prodávající, po roce ji ' +
        'prokazuje kupující.',
      consequence: 'doporuceni',
      law: '§ 2161 odst. 5 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text uvádí šestiměsíční domněnku — ta platila do 5. 1. 2023. Dnes je ' +
        'roční.',
    },
    {
      id: 'complaint-30-dnu',
      kind: 'mandatory',
      label: 'třicetidenní lhůta na vyřízení',
      requirement:
        'Reklamace včetně odstranění vady musí být vyřízena A KUPUJÍCÍ O TOM ' +
        'INFORMOVÁN nejpozději do třiceti dnů ode dne uplatnění, nedohodne-li se ' +
        'prodávající se spotřebitelem na delší lhůtě. U digitálního obsahu se ' +
        'vyřizuje v přiměřené době.',
      consequence: 'riziko',
      law: '§ 19 odst. 3 zák. č. 634/1992 Sb.',
      detect: /30\s*dn|třiceti\s*dn|třicetidenní/i,
      detectSample: 'Reklamaci vyřiďte nejpozději do 30 dnů ode dne jejího uplatnění',
      reviewCheck:
        'Chybí odkaz na třicetidenní lhůtu, nebo text tvrdí, že prodávající musí ' +
        'o reklamaci rozhodnout do tří pracovních dnů — to už § 19 neobsahuje.',
    },
    {
      id: 'complaint-marne-uplynuti',
      kind: 'default',
      requirement:
        'Po marném uplynutí třicetidenní lhůty může spotřebitel od smlouvy ' +
        'odstoupit nebo požadovat přiměřenou slevu. Je to samostatné právo ' +
        'plynoucí přímo ze zákona o ochraně spotřebitele.',
      consequence: 'doporuceni',
      law: '§ 19 odst. 4 zák. č. 634/1992 Sb.',
      reviewCheck:
        'Text tvrdí, že marné uplynutí třicetidenní lhůty je podstatným porušením ' +
        'smlouvy. To bylo dřívější znění; § 19 odst. 4 dnes dává právo odstoupit ' +
        'nebo žádat slevu přímo.',
    },
    {
      id: 'complaint-naklady',
      kind: 'recommended',
      label: 'náhrada nákladů reklamace',
      requirement:
        'Kdo má právo z vadného plnění, náleží mu i náhrada účelně vynaložených ' +
        'nákladů — poštovné, doprava, znalecký posudek. Uplatni ji spolu ' +
        's reklamací; nebude-li uplatněna do jednoho měsíce po uplynutí doby ' +
        'k vytčení vady, soud ji nemusí přiznat.',
      consequence: 'riziko',
      law: '§ 1924 zák. č. 89/2012 Sb.',
      detect: /náklad|poštovn|doprav/i,
      detectSample: 'Uplatňuji rovněž náhradu nákladů vynaložených na dopravu',
      reviewCheck: 'Chybí uplatnění náhrady účelně vynaložených nákladů reklamace.',
    },

    // ─── Čeho se nedovolávat ─────────────────────────────────────────────────
    {
      id: 'complaint-prevzeti-na-naklady',
      kind: 'default',
      requirement:
        'K odstranění vady převezme prodávající věc NA VLASTNÍ NÁKLADY. Vyžaduje-li ' +
        'to demontáž věci, jejíž montáž proběhla před projevem vady, provede ji ' +
        'prodávající nebo uhradí náklady s tím spojené.',
      consequence: 'doporuceni',
      law: '§ 2170 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text připouští, že dopravu reklamovaného zboží hradí kupující — náklady ' +
        'převzetí věci nese prodávající.',
    },
    {
      id: 'complaint-nevyznamna-vada',
      kind: 'default',
      requirement:
        'Odstoupit nelze, je-li vada nevýznamná — ALE má se za to, že vada ' +
        'nevýznamná není. Prokázat opak musí prodávající, nikoli kupující.',
      consequence: 'doporuceni',
      law: '§ 2171 odst. 3 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text ukládá kupujícímu prokazovat, že vada je významná. Domněnka je ' +
        'opačná a důkazní břemeno nese prodávající.',
    },
    {
      id: 'complaint-vlastni-zavineni',
      kind: 'mandatory',
      requirement:
        'Právo z vadného plnění nenáleží, způsobil-li vadu sám kupující. Vadou ' +
        'není ani opotřebení způsobené obvyklým užíváním, u použité věci ' +
        'opotřebení odpovídající míře předchozího používání.',
      consequence: 'riziko',
      law: '§ 2167 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Reklamace popisuje poškození způsobené kupujícím nebo běžné opotřebení — ' +
        'na to se právo z vadného plnění nevztahuje.',
    },
    {
      id: 'complaint-pouzita-vec',
      kind: 'default',
      requirement:
        'Při koupi POUŽITÉ věci mohou strany zkrátit dvouletou dobu až na jeden ' +
        'rok. Zkrácení musí být ujednáno — samo o sobě nenastává.',
      consequence: 'doporuceni',
      law: '§ 2168 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že u použitého zboží platí automaticky jednoletá doba. ' +
        'Zkrácení vyžaduje ujednání stran.',
    },
    {
      id: 'complaint-predem-omezena-prava',
      kind: 'prohibited',
      requirement:
        'Ujednají-li strany ještě předtím, než kupující vytkl vadu, že se jeho ' +
        'práva omezí nebo zanikají, nepřihlíží se k tomu.',
      consequence: 'neprihlizi-se',
      law: '§ 2174 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text přejímá obchodní podmínky prodávajícího, které práva z vadného ' +
        'plnění omezují. K takovému ujednání se nepřihlíží — neopakuj je jako ' +
        'závazné.',
    },
    {
      id: 'complaint-podpis',
      kind: 'form',
      requirement:
        'Reklamaci podepisuje pouze kupující. Není to dohoda a podpis prodávajícího ' +
        'se nevyžaduje — nejvýše potvrzuje převzetí.',
      consequence: 'riziko',
      law: '§ 19 odst. 2 zák. č. 634/1992 Sb.',
      reviewCheck:
        'Dokument obsahuje podpisové pole pro prodávajícího jako smluvní stranu, ' +
        'nebo formulaci „strany se dohodly" — reklamace je jednostranná.',
    },
  ],
}
