/**
 * Předžalobní výzva — § 142a zák. č. 99/1963 Sb. (občanský soudní řád)
 *
 * WHAT THIS DOCUMENT ACTUALLY DOES
 *
 * It does not make the debt enforceable and it does not stop time running. Its
 * one legal function is narrow and expensive to miss: without it, a creditor
 * who wins a claim for performance has NO right to costs against the debtor
 * (§ 142a odst. 1). On a small debt the lawyer's costs routinely exceed the
 * debt, so the letter is often worth more than the claim.
 *
 * Three conditions, all easy to fail:
 *   - sent at least SEVEN DAYS before the action is filed,
 *   - to the address for service or the last known address,
 *   - in a case seeking performance of an obligation.
 *
 * WHAT IT DOES NOT DO
 *
 * Limitation keeps running. Only asserting the right before a public authority
 * stops it (§ 648), or an acknowledgment of the debt, which restarts it at ten
 * years (§ 639). A creditor who sends a demand and then waits can lose a debt
 * that felt "actively pursued" the whole time.
 *
 * THE NUMBER THAT MUST NEVER BE HARDCODED
 *
 * Statutory default interest is the ČNB repo rate for the first day of the
 * half-year in which the default began, plus 8 points. It is not a constant,
 * and two debts that fell due in different half-years carry different rates at
 * the same moment.
 *
 * Verified against the statute text on 2026-08-23.
 */

import type { ContractLegalProfile } from '../types'
import { LATE_PAYMENT_MIN_COSTS_CZK, formatCzk } from '../../czechLegalFacts'

export const PRE_ACTION_DEMAND_PROFILE: ContractLegalProfile = {
  family: 'pre-action-demand',
  label: 'Předžalobní výzva k plnění',
  primaryLaw: '§ 142a zák. č. 99/1963 Sb. (občanský soudní řád)',
  characterisation:
    'Jednostranná výzva k dobrovolnému splnění dluhu, jejíž odeslání je ' +
    'podmínkou práva na náhradu nákladů řízení.',
  lastVerified: '2026-08-23',
  sources: [
    'https://www.zakonyprolidi.cz/cs/1963-99 (§ 142a, § 143)',
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 629, § 639, § 648, § 1968–1971)',
    'https://www.zakonyprolidi.cz/cs/2013-351 (§ 2 a § 3)',
  ],
  inapplicable: [
    {
      section: '2002',
      law: '89/2012',
      why:
        'Předžalobní výzva není odstoupení od smlouvy ani jeho podmínka. ' +
        'Nedovolávej se podstatného porušení, nejde-li o dodatečnou lhůtu podle ' +
        '§ 1978 uvedenou v podkladech.',
    },
  ],
  rules: [
    // ─── Co musí výzva obsahovat ─────────────────────────────────────────────
    {
      id: 'demand-oznaceni-pohledavky',
      kind: 'essential',
      label: 'vymezení pohledávky',
      requirement:
        'Uveď, z čeho dluh vznikl — smlouva nebo faktura, datum, předmět plnění, ' +
        'a jistina v Kč. Bez určitého vymezení není zřejmé, k čemu se výzva vztahuje ' +
        'a soud ji k § 142a nemusí vztáhnout.',
      consequence: 'nevznikne',
      law: '§ 142a odst. 1 zák. č. 99/1963 Sb.',
      detect: /faktur|smlouv|jistin|dlužn\S*\s+částk|dluh/i,
      detectSample: 'Faktura č. 2026/114 ze dne 3. 3. 2026, jistina 48 000 Kč',
      reviewCheck: 'Chybí vymezení pohledávky — z čeho vznikla a v jaké výši.',
    },
    {
      id: 'demand-splatnost',
      kind: 'essential',
      label: 'datum splatnosti',
      requirement:
        'Uveď den, kdy se dluh stal splatným. Od něj se odvíjí prodlení i běh ' +
        'úroku z prodlení.',
      consequence: 'nevznikne',
      law: '§ 1968 zák. č. 89/2012 Sb.',
      detect: /splatn|se\s+splatností|byla\s+splatná/i,
      detectSample: 'Faktura byla splatná dne 17. 3. 2026',
      reviewCheck: 'Chybí datum splatnosti — bez něj nelze určit počátek prodlení.',
    },
    {
      id: 'demand-vyzva-k-plneni',
      kind: 'essential',
      label: 'výzva k plnění',
      requirement:
        'Text musí obsahovat jednoznačnou výzvu, aby dlužník dluh zaplatil, ' +
        'a údaje pro platbu — číslo účtu a variabilní symbol. Pouhé sdělení, ' +
        'že dluh existuje, výzvou k plnění není.',
      consequence: 'nevznikne',
      law: '§ 142a odst. 1 zák. č. 99/1963 Sb.',
      detect: /vyzývám|vyzýváme|žádám\S*\s+o\s+(zaplacení|úhradu)|uhraďte|zaplaťte/i,
      detectSample: 'Vyzývám Vás k úhradě dlužné částky na účet č. 123456789/0800',
      reviewCheck:
        'Text popisuje dluh, ale neobsahuje výslovnou výzvu k jeho zaplacení.',
    },
    {
      id: 'demand-lhuta-7-dnu',
      kind: 'mandatory',
      label: 'lhůta k plnění',
      requirement:
        'Výzva musí být odeslána nejméně SEDM DNŮ před podáním žaloby. Poskytnutá ' +
        'lhůta k zaplacení proto nesmí být kratší; v praxi se dává deset až ' +
        'čtrnáct dnů, aby byla podmínka splněna s rezervou.',
      consequence: 'riziko',
      law: '§ 142a odst. 1 zák. č. 99/1963 Sb.',
      detect: /lhůt|do\s+\d+\s*dn|nejpozději\s+do/i,
      detectSample: 'Dlužnou částku uhraďte do 14 dnů ode dne doručení této výzvy',
      reviewCheck:
        'Lhůta kratší než sedm dnů, nebo chybí úplně. Při nedodržení sedmidenního ' +
        'odstupu od podání žaloby ztrácí věřitel právo na náhradu nákladů řízení.',
    },
    {
      id: 'demand-adresa-doruceni',
      kind: 'form',
      label: 'adresa pro doručování',
      requirement:
        'Výzva se zasílá na adresu pro doručování, případně na poslední známou ' +
        'adresu dlužníka. Odeslání je třeba umět prokázat — doporučeně, datovou ' +
        'schránkou, nebo s dodejkou.',
      consequence: 'riziko',
      law: '§ 142a odst. 1 zák. č. 99/1963 Sb.',
      detect: /doporučen|datov\S*\s+schránk|dodejk|na\s+adresu/i,
      detectSample: 'Výzva se zasílá doporučeně na adresu pro doručování',
      reviewCheck:
        'Chybí údaj o způsobu odeslání. Splnění podmínky § 142a se prokazuje ' +
        'věřitelem, takže bez dokladu o odeslání je náhrada nákladů ohrožena.',
    },
    {
      id: 'demand-nasledek',
      kind: 'recommended',
      label: 'upozornění na podání žaloby',
      requirement:
        'Uveď, že nebude-li dluh v poskytnuté lhůtě uhrazen, bude pohledávka ' +
        'vymáhána soudní cestou a dlužník ponese náklady řízení.',
      consequence: 'doporuceni',
      law: '§ 142a odst. 1 zák. č. 99/1963 Sb.',
      detect: /soudn\S*\s+cest|podán\S*\s+žalob|žalob|soud/i,
      detectSample: 'Nebude-li částka uhrazena, bude vymáhána soudní cestou',
      reviewCheck: 'Chybí upozornění na následky nezaplacení.',
    },
    {
      id: 'demand-podpis',
      kind: 'form',
      requirement:
        'Výzvu podepisuje pouze věřitel nebo jeho zástupce. Není to dohoda ' +
        'a podpis dlužníka se nevyžaduje.',
      consequence: 'riziko',
      law: '§ 142a zák. č. 99/1963 Sb.',
      reviewCheck:
        'Dokument obsahuje podpisové pole pro dlužníka jako smluvní stranu nebo ' +
        'formulaci „strany se dohodly" — výzva je jednostranná.',
    },

    // ─── Úrok z prodlení ─────────────────────────────────────────────────────
    {
      id: 'demand-urok-sazba-neurcuj',
      kind: 'mandatory',
      requirement:
        'NEUVÁDĚJ konkrétní procento úroku z prodlení, není-li v podkladech. ' +
        'Zákonná sazba se rovná repo sazbě ČNB pro první den kalendářního ' +
        'pololetí, V NĚMŽ DOŠLO K PRODLENÍ, zvýšené o 8 procentních bodů. Není to ' +
        'konstanta: dvě pohledávky splatné v různých pololetích nesou v tomtéž ' +
        'okamžiku různou sazbu. Popiš proto vzorec, nebo použij placeholder.',
      consequence: 'riziko',
      law: '§ 1970 zák. č. 89/2012 Sb. a § 2 odst. 1 nař. vl. č. 351/2013 Sb.',
      reviewCheck:
        'Uvedena pevná sazba úroku z prodlení bez určení pololetí, z něhož ' +
        'vychází. Taková sazba je nepřezkoumatelná a zpravidla nesprávná — ' +
        'repo sazba se mění.',
    },
    {
      id: 'demand-urok-naleza',
      kind: 'default',
      requirement:
        'Věřiteli, který řádně splnil své povinnosti, náleží úrok z prodlení ' +
        'i tehdy, nebyl-li ve smlouvě sjednán — zákonná výše se považuje za ' +
        'ujednanou. Uveď jej ve výzvě spolu s jistinou.',
      consequence: 'doporuceni',
      law: '§ 1970 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že úrok z prodlení náleží jen při smluvním ujednání — ' +
        'zákonná výše se považuje za ujednanou.',
    },
    {
      id: 'demand-naklady-1200',
      kind: 'recommended',
      label: 'paušální náklady u podnikatelů',
      requirement:
        'Jde-li o vzájemný závazek podnikatelů, náleží věřiteli k náhradě ' +
        `minimálně ${formatCzk(LATE_PAYMENT_MIN_COSTS_CZK.value)} nákladů spojených ` +
        's uplatněním každé pohledávky. Nárok vzniká ze zákona a uplatňuje se ' +
        'jednoduše — přesto se na něj běžně zapomíná.',
      consequence: 'doporuceni',
      law: '§ 3 nař. vl. č. 351/2013 Sb.',
      appliesWhen: 'Věřitel i dlužník jsou podnikatelé a jde o jejich vzájemný závazek.',
      detect: /1\s?200|paušáln\S*\s+náhrad|náklad\S*\s+spojen/i,
      detectSample: 'Uplatňuji rovněž paušální náhradu nákladů 1 200 Kč',
      reviewCheck:
        'U závazku mezi podnikateli chybí uplatnění paušální náhrady nákladů ' +
        'spojených s uplatněním pohledávky.',
    },

    // ─── Čeho se výzva nedotýká ──────────────────────────────────────────────
    {
      id: 'demand-nestaci-na-promlceni',
      kind: 'default',
      requirement:
        'Odeslání výzvy NEZASTAVUJE běh promlčecí lhůty. Ta trvá tři roky a staví ' +
        'se až uplatněním práva u orgánu veřejné moci. Uzná-li dlužník dluh, ' +
        'promlčí se právo za deset let od uznání.',
      consequence: 'doporuceni',
      law: '§ 629, § 639 a § 648 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že výzva staví nebo přerušuje promlčecí lhůtu. Nestaví — ' +
        'to činí až žaloba, případně uznání dluhu dlužníkem.',
    },
    {
      id: 'demand-jen-naklady',
      kind: 'default',
      requirement:
        'Výzva je podmínkou náhrady nákladů řízení, nikoli podmínkou žaloby. ' +
        'Žalovat lze i bez ní; věřitel jen ponese své náklady sám. Soud může ' +
        'výjimečně náhradu přiznat i bez výzvy, jsou-li tu důvody hodné zvláštního ' +
        'zřetele.',
      consequence: 'doporuceni',
      law: '§ 142a odst. 1 a 2 zák. č. 99/1963 Sb.',
      reviewCheck:
        'Text tvrdí, že bez předžalobní výzvy nelze podat žalobu. Lze — bez výzvy ' +
        'jen zpravidla nevzniká právo na náhradu nákladů řízení.',
    },
    {
      id: 'demand-nevyhrozuj',
      kind: 'recommended',
      requirement:
        'Nevyhrožuj trestním oznámením, exekucí bez exekučního titulu, zveřejněním ' +
        'dlužníka ani sdělením třetím osobám. U soukromoprávního dluhu to nic ' +
        'nevymůže a věřiteli to může uškodit. Uveď jen to, co skutečně následuje: ' +
        'podání žaloby a náklady řízení.',
      consequence: 'riziko',
      law: '§ 142a zák. č. 99/1963 Sb.',
      reviewCheck:
        'Výzva obsahuje pohrůžku trestním oznámením, zveřejněním nebo exekucí ' +
        'bez exekučního titulu — to do předžalobní výzvy nepatří.',
    },
    {
      id: 'demand-zaplatil-hned',
      kind: 'default',
      requirement:
        'Zaplatí-li dlužník po výzvě dobrovolně, není důvod žalovat. Žalovaný, ' +
        'který svým chováním nezavdal příčinu k podání návrhu, má naopak právo ' +
        'na náhradu nákladů proti žalobci.',
      consequence: 'doporuceni',
      law: '§ 143 zák. č. 99/1963 Sb.',
      reviewCheck:
        'Text avizuje podání žaloby bez ohledu na to, zda dlužník ve lhůtě zaplatí.',
    },
  ],
}
