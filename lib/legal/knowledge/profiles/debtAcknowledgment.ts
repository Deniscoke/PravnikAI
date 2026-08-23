/**
 * Uznání dluhu — § 2053 a § 2054 zák. č. 89/2012 Sb.
 *
 * THE ONLY DOCUMENT HERE THAT MOSTLY HURTS THE PERSON SIGNING IT
 *
 * Everything else in this product is drafted by the person it protects. This
 * one is drafted by the creditor and signed by the debtor, and what it does to
 * the debtor is severe:
 *
 *   - It reverses the burden of proof. After § 2053 the debt is presumed to
 *     exist in the scope acknowledged; from then on it is the DEBTOR who must
 *     prove it does not.
 *   - It restarts limitation at TEN years (§ 639) — and where the declaration
 *     also names a date to pay, the ten years run from the last day of that
 *     period, so a payment plan can push enforceability out much further.
 *   - Acknowledging a debt that is ALREADY time-barred revives it (§ 653). A
 *     debtor who signs without checking limitation can hand back a claim the
 *     creditor had permanently lost.
 *
 * So the profile carries warnings aimed at the signer, not only requirements
 * aimed at the drafter. Checking limitation before signing is the single most
 * valuable thing this document can tell someone.
 *
 * WHAT DOES NOT BELONG HERE
 *
 * Acceleration on a missed instalment (§ 1931) works only "pokud si to strany
 * ujednaly" — it needs agreement from both sides. A one-sided declaration
 * cannot create it, and a clause pretending otherwise is decoration. That
 * belongs in a dohoda o splátkách, which is a different document.
 *
 * Verified against the statute text on 2026-08-23.
 */

import type { ContractLegalProfile } from '../types'

export const DEBT_ACKNOWLEDGMENT_PROFILE: ContractLegalProfile = {
  family: 'debt-acknowledgment',
  label: 'Uznání dluhu',
  primaryLaw: '§ 2053 a § 2054 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Jednostranné písemné prohlášení dlužníka, kterým uznává dluh co do důvodu ' +
    'i výše. Zakládá vyvratitelnou domněnku trvání dluhu a novou desetiletou ' +
    'promlčecí lhůtu.',
  lastVerified: '2026-08-23',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 639, § 653, § 1931, § 1952, § 2053–2054)',
  ],
  inapplicable: [
    {
      section: '1931',
      law: '89/2012',
      why:
        'Ztráta výhody splátek vyžaduje ujednání obou stran. V jednostranném ' +
        'uznání dluhu ji nelze platně založit — patří do dohody o splátkách.',
    },
  ],
  rules: [
    // ─── Náležitosti ─────────────────────────────────────────────────────────
    {
      id: 'debtack-pisemna-forma',
      kind: 'form',
      label: 'písemná forma',
      requirement:
        'Uznání dluhu vyžaduje PÍSEMNOU FORMU. Ústní uznání domněnku podle ' +
        '§ 2053 nezaloží a desetiletá lhůta z něj neběží.',
      consequence: 'nevznikne',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      detect: /podpis|v\s+\S+\s+dne|vlastnoručn/i,
      detectSample: 'V Brně dne 3. 3. 2026, vlastnoruční podpis dlužníka',
      reviewCheck: 'Chybí podpisová doložka — bez písemné formy uznání účinky nemá.',
    },
    {
      id: 'debtack-duvod',
      kind: 'essential',
      label: 'důvod dluhu',
      requirement:
        'Uveď DŮVOD dluhu — z čeho vznikl: smlouva, faktura, datum, předmět ' +
        'plnění. Uznání „co do důvodu i výše" znamená obojí; samotné „uznávám, ' +
        'že dlužím" domněnku nezaloží.',
      consequence: 'nevznikne',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      detect: /na\s+základě|z\s+(kupní|nájemní)|faktur|smlouv\S*\s+ze\s+dne|zápůjčk/i,
      detectSample: 'Dluh vznikl z faktury č. 2026/114 ze dne 3. 3. 2026',
      reviewCheck:
        'Chybí důvod vzniku dluhu. Uznání bez uvedení důvodu nezakládá domněnku ' +
        'podle § 2053.',
    },
    {
      id: 'debtack-vyse',
      kind: 'essential',
      label: 'výše dluhu',
      requirement:
        'Uveď VÝŠI dluhu v korunách, a to jistinu odděleně od příslušenství. ' +
        'Domněnka působí jen v rozsahu, v jakém byl dluh uznán.',
      consequence: 'nevznikne',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      detect: /Kč|korun|jistin|částk/i,
      detectSample: 'Uznávám dluh ve výši jistiny 48 000 Kč',
      reviewCheck:
        'Chybí výše dluhu, nebo je uvedena neurčitě. Domněnka vzniká jen ' +
        'v uznaném rozsahu.',
    },
    {
      id: 'debtack-prohlaseni',
      kind: 'essential',
      label: 'prohlášení o uznání',
      requirement:
        'Text musí obsahovat výslovné prohlášení dlužníka, že dluh uznává. ' +
        'Popis dluhu bez tohoto prohlášení uznáním není.',
      consequence: 'nevznikne',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      detect: /uznávám|uznáváme|uznává\s+svůj\s+dluh/i,
      detectSample: 'Uznávám tímto svůj dluh co do důvodu i výše',
      reviewCheck:
        'Text dluh popisuje, ale neobsahuje výslovné prohlášení o jeho uznání.',
    },

    // ─── Účinky, o kterých musí dlužník vědět ────────────────────────────────
    {
      id: 'debtack-domnenka',
      kind: 'default',
      requirement:
        'Uznáním vzniká VYVRATITELNÁ DOMNĚNKA, že dluh v uznaném rozsahu v době ' +
        'uznání trvá. Prakticky to obrací důkazní břemeno: po podpisu musí ' +
        'neexistenci dluhu prokazovat dlužník, nikoli věřitel.',
      consequence: 'doporuceni',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že uznání je nevyvratitelné nebo že se dlužník vzdává ' +
        'námitek. Domněnka je vyvratitelná a dlužník může prokázat opak.',
    },
    {
      id: 'debtack-deset-let',
      kind: 'default',
      requirement:
        'Uznáním se promlčecí lhůta prodlužuje na DESET LET ode dne uznání. ' +
        'Určí-li dlužník v uznání i dobu, do které splní, běží deset let od ' +
        'posledního dne této doby.',
      consequence: 'doporuceni',
      law: '§ 639 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text uvádí tříletou promlčecí lhůtu i po uznání dluhu — po uznání ' +
        'je desetiletá.',
    },
    {
      id: 'debtack-promlceny-dluh',
      kind: 'mandatory',
      label: 'ověření promlčení',
      requirement:
        'UPOZORNI DLUŽNÍKA, ať před podpisem ověří, zda dluh není promlčen. ' +
        'Uzná-li dlužník již promlčený dluh, nárok se OBNOVÍ a začne běžet nová ' +
        'promlčecí lhůta. Je to nejzávažnější důsledek podpisu a dlužník si jej ' +
        'zpravidla neuvědomuje.',
      consequence: 'riziko',
      law: '§ 653 odst. 1 zák. č. 89/2012 Sb.',
      detect: /promlč/i,
      detectSample: 'Dlužník prohlašuje, že si je vědom, že dluh není promlčen',
      reviewCheck:
        'Chybí upozornění na promlčení. Uznáním promlčeného dluhu se nárok ' +
        'obnoví — dlužník tím může vrátit věřiteli pohledávku, kterou už ' +
        'nemohl vymoci.',
    },
    {
      id: 'debtack-konkludentni-uznani',
      kind: 'default',
      requirement:
        'Placení úroků se považuje za uznání dluhu ohledně částky, z níž se ' +
        'úroky platí; částečné plnění má účinky uznání zbytku, lze-li to ' +
        'z okolností usoudit. Na již promlčenou pohledávku se to však NEVZTAHUJE.',
      consequence: 'doporuceni',
      law: '§ 2054 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že částečná úhrada promlčeného dluhu jej uznává — § 2054 ' +
        'odst. 3 to výslovně vylučuje.',
    },

    // ─── Splatnost a vrácení úpisu ───────────────────────────────────────────
    {
      id: 'debtack-doba-splneni',
      kind: 'recommended',
      label: 'doba splnění',
      requirement:
        'Uveď, do kdy dlužník dluh splní. Má to dvojí význam: věřitel ví, kdy ' +
        'může vymáhat, a desetiletá lhůta pak běží až od posledního dne této ' +
        'doby.',
      consequence: 'riziko',
      law: '§ 639 zák. č. 89/2012 Sb.',
      detect: /do\s+\d|nejpozději|splatn|uhradím|zaplatím/i,
      detectSample: 'Dluh uhradím nejpozději do 31. 12. 2026',
      reviewCheck: 'Chybí doba, do které má být dluh splněn.',
    },
    {
      id: 'debtack-splatky-nejsou-dohoda',
      kind: 'mandatory',
      requirement:
        'Splátkový kalendář uvedený v jednostranném uznání je pouze závazkem ' +
        'dlužníka. Ztrátu výhody splátek — právo věřitele žádat celý dluh při ' +
        'nesplnění jedné splátky — lze podle § 1931 založit jen UJEDNÁNÍM stran, ' +
        'a věřitel je navíc musí uplatnit nejpozději do splatnosti nejbližší ' +
        'příští splátky. Nepiš ji do jednostranného uznání jako platnou.',
      consequence: 'riziko',
      law: '§ 1931 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Jednostranné uznání obsahuje ztrátu výhody splátek. Ta vyžaduje ' +
        'ujednání obou stran — zde je bez účinku a patří do dohody o splátkách.',
    },
    {
      id: 'debtack-vraceni-upisu',
      kind: 'recommended',
      requirement:
        'Po zaplacení musí věřitel dlužní úpis vrátit, nebo na něm vyznačit ' +
        'částečné splnění. Není-li to možné, vydá potvrzení, že úpis pozbyl ' +
        'platnosti v rozsahu splněného.',
      consequence: 'doporuceni',
      law: '§ 1952 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí ujednání o vrácení uznání po zaplacení — dlužníkovi jinak zůstane ' +
        'v oběhu listina, která dluh presumuje.',
    },
    {
      id: 'debtack-podpis-dluznika',
      kind: 'form',
      requirement:
        'Uznání podepisuje POUZE dlužník. Je to jeho prohlášení, nikoli dohoda. ' +
        'Podpis věřitele se nevyžaduje a jeho přítomnost naznačuje, že jde ve ' +
        'skutečnosti o dohodu s jiným režimem.',
      consequence: 'riziko',
      law: '§ 2053 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Dokument obsahuje formulaci „strany se dohodly" nebo podpis věřitele — ' +
        'pak nejde o jednostranné uznání dluhu.',
    },
  ],
}
