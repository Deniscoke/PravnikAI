/**
 * Dohoda o rozvázání pracovního poměru — § 49 zák. č. 262/2006 Sb.
 *
 * THE ONE SENTENCE THAT DECIDES THOUSANDS OF KORUNY
 *
 * § 67 odst. 1 gives severance where the employment ends by notice on the
 * organisational grounds in § 52 písm. a) až c) "nebo dohodou z týchž důvodů".
 * So an agreement CAN carry severance — but only if the organisational reason
 * is actually recorded in it. An agreement that says merely "strany se dohodly
 * na rozvázání" leaves the employee having to prove afterwards that redundancy
 * was the real cause, against an employer with no reason to help. Employers
 * offer the blank version precisely because it is cheaper.
 *
 * WHAT THE AGREEMENT DOES NOT CARRY
 *
 * No notice period — the employment ends on the agreed day, which may be the
 * same day. And no protected period: § 53 shields an employee against NOTICE,
 * not against an agreement they signed. Someone on sick leave or pregnant can
 * validly agree to end their employment, which is exactly when they are least
 * placed to weigh it.
 *
 * A CORRECTION THE CZECH INTERNET HAS NOT CAUGHT UP WITH
 *
 * "Dohodou přijdete o podporu" is repeated everywhere and is no longer in the
 * act. § 50 odst. 3 zák. č. 435/2004 Sb. sets 80 / 50 / 40 % of average net
 * earnings regardless of how the employment ended. The only remaining penalty
 * tied to leaving voluntarily is § 25 odst. 8, and it is narrow: it concerns a
 * job arranged by the Úřad práce, and it blocks registration rather than
 * cutting the rate.
 *
 * Verified against the statute text on 2026-08-23.
 */

import type { ContractLegalProfile } from '../types'

export const MUTUAL_TERMINATION_PROFILE: ContractLegalProfile = {
  family: 'mutual-termination',
  label: 'Dohoda o rozvázání pracovního poměru',
  primaryLaw: '§ 49 zák. č. 262/2006 Sb. (zákoník práce)',
  characterisation:
    'Dvoustranné právní jednání, kterým se pracovní poměr ukončuje ke ' +
    'sjednanému dni. Výpovědní doba neběží.',
  lastVerified: '2026-08-23',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 49, § 52, § 53, § 67, § 313)',
    'https://www.zakonyprolidi.cz/cs/2004-435 (§ 25 odst. 8, § 50)',
  ],
  inapplicable: [
    {
      section: '53',
      law: '262/2006',
      why:
        'Ochranná doba chrání zaměstnance před VÝPOVĚDÍ, nikoli před dohodou. ' +
        'Nehlas jako vadu, že dohoda byla uzavřena v době pracovní neschopnosti ' +
        'nebo těhotenství — dohodu lze uzavřít i tehdy.',
    },
    {
      section: '51',
      law: '262/2006',
      why:
        'Výpovědní doba se u dohody neuplatní. Pracovní poměr končí sjednaným ' +
        'dnem, i kdyby to byl den uzavření dohody.',
    },
  ],
  rules: [
    // ─── Náležitosti ─────────────────────────────────────────────────────────
    {
      id: 'mutterm-den-skonceni',
      kind: 'essential',
      label: 'den skončení pracovního poměru',
      requirement:
        'Uveď konkrétní DEN, ke kterému pracovní poměr končí. Dohodou končí ' +
        'pracovní poměr sjednaným dnem — bez určení dne dohoda svůj účel nesplní.',
      consequence: 'nevznikne',
      law: '§ 49 odst. 1 zák. č. 262/2006 Sb.',
      detect: /ke\s+dni|dnem\s+\d|skončí\s+dne|k\s+\d{1,2}\.\s*\d{1,2}\./i,
      detectSample: 'Pracovní poměr končí ke dni 31. 10. 2026',
      reviewCheck: 'Chybí konkrétní den skončení pracovního poměru.',
    },
    {
      id: 'mutterm-oznaceni-pomeru',
      kind: 'essential',
      label: 'označení pracovního poměru',
      requirement:
        'Označ pracovní smlouvu, která se ukončuje — datum uzavření a sjednaný ' +
        'druh práce.',
      consequence: 'nevznikne',
      law: '§ 553 zák. č. 89/2012 Sb.',
      detect: /pracovní\s+smlouv\S*\s+ze\s+dne|uzavřen\S*\s+dne|druh\S*\s+práce/i,
      detectSample: 'Pracovní smlouva ze dne 1. 9. 2024, druh práce: účetní',
      reviewCheck: 'Chybí identifikace ukončované pracovní smlouvy.',
    },
    {
      id: 'mutterm-pisemna-forma',
      kind: 'form',
      label: 'písemná forma',
      requirement:
        'Dohoda o rozvázání pracovního poměru MUSÍ být písemná.',
      consequence: 'neplatnost',
      law: '§ 49 odst. 2 zák. č. 262/2006 Sb.',
      detect: /podpis|v\s+\S+\s+dne/i,
      detectSample: 'V Praze dne 30. 9. 2026, podpisy obou stran',
      reviewCheck: 'Chybí podpisová doložka — dohoda vyžaduje písemnou formu.',
    },
    {
      id: 'mutterm-dve-vyhotoveni',
      kind: 'form',
      label: 'vyhotovení pro každou stranu',
      requirement:
        'Každá strana musí obdržet jedno vyhotovení dohody. Uveď to v textu — ' +
        'zaměstnanci se běžně stává, že podepíše a kopii nedostane.',
      consequence: 'riziko',
      law: '§ 49 odst. 3 zák. č. 262/2006 Sb.',
      // "Stejnopis" is as common as "vyhotovení" and the count often sits
      // apart from the noun, so match the shape rather than one phrasing.
      detect: /ve\s+dvou\s+\S+|dvojím\s+vyhotovení|po\s+jednom|každá\s+strana\s+obdrží/i,
      detectSample: 'Dohoda je vyhotovena ve dvou stejnopisech, po jednom pro každou stranu',
      reviewCheck: 'Chybí ujednání o počtu vyhotovení — § 49 odst. 3 je vyžaduje.',
    },

    // ─── Odstupné ────────────────────────────────────────────────────────────
    {
      id: 'mutterm-duvod-kvuli-odstupnemu',
      kind: 'mandatory',
      label: 'důvod skončení, jde-li o organizační důvody',
      requirement:
        'Končí-li pracovní poměr z organizačních důvodů, UVEĎ TO V DOHODĚ ' +
        'výslovně a s odkazem na § 52 písm. a), b) nebo c). Odstupné náleží ' +
        'i při skončení dohodou, ale jen „z týchž důvodů" — není-li důvod ' +
        'v dohodě zaznamenán, musí jej zaměstnanec později prokazovat sám.',
      consequence: 'riziko',
      law: '§ 67 odst. 1 zák. č. 262/2006 Sb.',
      detect: /§\s*52|organizačn\S*\s+důvod|nadbytečn|ruší\s+se|přemísťuje/i,
      detectSample: 'Pracovní poměr končí z důvodu nadbytečnosti podle § 52 písm. c) ZP',
      reviewCheck:
        'Dohoda neuvádí důvod skončení, ačkoli z okolností plyne organizační ' +
        'důvod. Bez jeho uvedení je nárok na odstupné podle § 67 obtížně ' +
        'prokazatelný — je to nejčastější a nejdražší vada této dohody.',
    },
    {
      id: 'mutterm-vyse-odstupneho',
      kind: 'mandatory',
      requirement:
        'Odstupné činí nejméně jednonásobek průměrného výdělku při trvání poměru ' +
        'do 1 roku, dvojnásobek při trvání alespoň 1 rok a méně než 2 roky, ' +
        'trojnásobek při trvání alespoň 2 roky. Do doby trvání se započítá ' +
        'i předchozí pracovní poměr u téhož zaměstnavatele, neuplynulo-li mezi ' +
        'nimi více než 6 měsíců.',
      consequence: 'riziko',
      law: '§ 67 odst. 1 a 2 zák. č. 262/2006 Sb.',
      appliesWhen: 'Pracovní poměr končí z důvodů § 52 písm. a) až c).',
      reviewCheck:
        'Odstupné nižší než zákonné minimum podle délky trvání poměru, nebo ' +
        'nezapočtený předchozí poměr u téhož zaměstnavatele.',
    },
    {
      id: 'mutterm-dvanactinasobek',
      kind: 'default',
      requirement:
        'Dvanáctinásobek průměrného výdělku náleží pouze při skončení z důvodu ' +
        'podle § 52 písm. e) — dosažení nejvyšší přípustné expozice na pracovišti. ' +
        'U pracovního úrazu ani nemoci z povolání to neplatí.',
      consequence: 'doporuceni',
      law: '§ 67 odst. 3 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Text slibuje dvanáctinásobné odstupné při pracovním úrazu nebo nemoci ' +
        'z povolání — od 1. 6. 2025 se váže jen na nejvyšší přípustnou expozici.',
    },

    // ─── Co dohoda nepřináší ─────────────────────────────────────────────────
    {
      id: 'mutterm-bez-vypovedni-doby',
      kind: 'default',
      requirement:
        'U dohody NEBĚŽÍ výpovědní doba. Pracovní poměr končí sjednaným dnem, ' +
        'i kdyby jím byl den podpisu. Chce-li zaměstnanec čas navíc, musí si ' +
        'sjednat pozdější den skončení.',
      consequence: 'doporuceni',
      law: '§ 49 odst. 1 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Dohoda uvádí výpovědní dobu. U dohody se neuplatní — buď jde o výpověď, ' +
        'nebo je třeba posunout sjednaný den skončení.',
    },
    {
      id: 'mutterm-neni-ochranna-doba',
      kind: 'default',
      requirement:
        'Ochranná doba podle § 53 chrání před výpovědí, nikoli před dohodou. ' +
        'Zaměstnanec v pracovní neschopnosti, těhotná zaměstnankyně i zaměstnanec ' +
        'na rodičovské mohou dohodu platně uzavřít.',
      consequence: 'doporuceni',
      law: '§ 53 zák. č. 262/2006 Sb.',
      reviewCheck:
        'NEHLAS jako vadu, že dohoda byla uzavřena v ochranné době — na dohodu ' +
        'se § 53 nevztahuje.',
    },
    {
      id: 'mutterm-podpora-nezamestnanost',
      kind: 'default',
      requirement:
        'Skončení dohodou samo o sobě nesnižuje podporu v nezaměstnanosti. ' +
        'Procentní sazba činí 80 % za první dva měsíce, 50 % za další dva a 40 % ' +
        'po zbývající dobu (u uchazeče nad 52 let 80 % tři měsíce, 50 % další tři). ' +
        'Dřívější snížená sazba za skončení dohodou už v zákoně není.',
      consequence: 'doporuceni',
      law: '§ 50 odst. 3 zák. č. 435/2004 Sb.',
      reviewCheck:
        'Text tvrdí, že při skončení dohodou náleží snížená podpora ' +
        'v nezaměstnanosti. To je překonané — sazba se podle způsobu skončení ' +
        'neliší.',
    },

    // ─── Vypořádání ──────────────────────────────────────────────────────────
    {
      id: 'mutterm-vyporadani',
      kind: 'recommended',
      label: 'vypořádání ke dni skončení',
      requirement:
        'Uveď, jak bude vypořádána mzda, nevyčerpaná dovolená a svěřené věci, ' +
        'a do kdy. Nevyčerpanou dovolenou zaměstnavatel při skončení proplácí.',
      consequence: 'riziko',
      law: '§ 222 odst. 2 zák. č. 262/2006 Sb.',
      detect: /dovolen|vypořádán|svěřen\S*\s+věc|mzda\s+bude/i,
      detectSample: 'Nevyčerpaná dovolená bude proplacena ve výplatním termínu za říjen 2026',
      reviewCheck: 'Chybí vypořádání mzdy, nevyčerpané dovolené nebo svěřených věcí.',
    },
    {
      id: 'mutterm-potvrzeni',
      kind: 'recommended',
      requirement:
        'Zaměstnavatel vydá při skončení potvrzení o zaměstnání. Zaměstnanec je ' +
        'potřebuje pro Úřad práce i pro dalšího zaměstnavatele.',
      consequence: 'doporuceni',
      law: '§ 313 zák. č. 262/2006 Sb.',
      reviewCheck: 'Chybí ujednání o vydání potvrzení o zaměstnání.',
    },
    {
      id: 'mutterm-podpisy-obou',
      kind: 'form',
      requirement:
        'Dohodu podepisují OBĚ strany. Na rozdíl od výpovědi jde o dvoustranné ' +
        'právní jednání — jednostranným podpisem nevzniká.',
      consequence: 'neplatnost',
      law: '§ 49 odst. 1 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Dokument nadepsaný jako dohoda obsahuje podpis jen jedné strany, nebo ' +
        'je formulován jako jednostranné oznámení.',
    },
  ],
}
