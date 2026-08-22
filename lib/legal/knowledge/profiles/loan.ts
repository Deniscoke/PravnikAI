/**
 * Smlouva o zápůjčce — § 2390–2394 zák. č. 89/2012 Sb.
 *
 * THE THING MOST TEMPLATES GET WRONG
 *
 * A zápůjčka is a *real* contract: it comes into existence when the money
 * actually changes hands, not when the paper is signed. A signed agreement with
 * nothing handed over creates no debt at all. Templates circulating online treat
 * it like any other contract and leave out the one clause that proves the
 * handover — which is exactly the fact a court needs when the borrower denies
 * ever receiving anything.
 *
 * Not to be confused with úvěr (§ 2395): a credit agreement is a promise to
 * provide funds and is always interest-bearing, while a zápůjčka is
 * interest-free unless the parties agree otherwise.
 */

import type { ContractLegalProfile } from '../types'
import { CASH_PAYMENT_LIMIT_CZK, formatCzk } from '../../czechLegalFacts'

export const LOAN_PROFILE: ContractLegalProfile = {
  family: 'loan',
  label: 'Smlouva o zápůjčce',
  primaryLaw: '§ 2390–2394 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Zapůjčitel přenechá vydlužiteli zastupitelnou věc (typicky peníze) k volnému ' +
    'nakládání a vydlužitel se zavazuje vrátit věc stejného druhu. Smlouva vzniká ' +
    'až skutečným přenecháním předmětu zápůjčky.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2390–2394)',
    'https://obcanskyzakonik.justice.cz/ — výklad k zápůjčce a úvěru',
    'zák. č. 257/2016 Sb., o spotřebitelském úvěru',
  ],
  rules: [
    // ─── Vznik ───────────────────────────────────────────────────────────────
    {
      id: 'loan-predani',
      kind: 'essential',
      requirement:
        'Zápůjčka vzniká až skutečným přenecháním peněz nebo věci. Samotný podpis ' +
        'smlouvy dluh nezakládá. Ve smlouvě proto výslovně potvrď, že předmět ' +
        'zápůjčky byl předán — nebo popiš, jak a kdy k předání dojde.',
      consequence: 'nevznikne',
      law: '§ 2390 zák. č. 89/2012 Sb.',
      detect: /předal\w*|převzal\w*|byla\s+poukázána|připsán\w*\s+na\s+účet|obdržel\w*/i,
      reviewCheck:
        'Chybí potvrzení o předání peněz nebo ujednání o způsobu jejich poskytnutí. ' +
        'Bez něj nelze prokázat, že zápůjčka vůbec vznikla — a to je nejčastější ' +
        'důvod, proč se dluh nepodaří vymoci.',
    },
    {
      id: 'loan-predmet',
      kind: 'essential',
      requirement:
        'Uveď výši zápůjčky číselně i slovy a měnu. U nepeněžité zápůjčky popiš ' +
        'věc tak, aby bylo zřejmé, co má být vráceno.',
      consequence: 'nevznikne',
      law: '§ 2390 a § 553 zák. č. 89/2012 Sb.',
      detect: /výše\s+zápůjčky|částk\w*|Kč|EUR/i,
      reviewCheck: 'Chybí výše zápůjčky nebo měna.',
    },
    {
      id: 'loan-zavazek-vratit',
      kind: 'essential',
      requirement: 'Výslovný závazek vydlužitele vrátit věc stejného druhu, u peněz stejnou částku.',
      consequence: 'nevznikne',
      law: '§ 2390 zák. č. 89/2012 Sb.',
      detect: /vrátit|vrácení|splat\w*/i,
    },

    // ─── Splatnost ───────────────────────────────────────────────────────────
    {
      id: 'loan-doba-vraceni',
      kind: 'recommended',
      requirement:
        'Sjednej konkrétní datum vrácení, případně splátkový kalendář. Není-li ' +
        'doba vrácení ujednána, závisí splatnost na výpovědi smlouvy — což obě ' +
        'strany zbytečně vystavuje nejistotě.',
      consequence: 'riziko',
      law: '§ 2393 zák. č. 89/2012 Sb.',
      detect: /do\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}|splátk\w*|splatnost/i,
      reviewCheck: 'Chybí datum vrácení i splátkový kalendář.',
    },
    {
      id: 'loan-splatky',
      kind: 'recommended',
      requirement:
        'U splátek uveď výši, četnost a den splatnosti. Zvaž ujednání o ztrátě ' +
        'výhody splátek při prodlení — bez něj lze při nezaplacení jedné splátky ' +
        'požadovat jen tuto splátku.',
      consequence: 'riziko',
      law: '§ 1931 zák. č. 89/2012 Sb.',
    },

    // ─── Úroky ───────────────────────────────────────────────────────────────
    {
      id: 'loan-uroky',
      kind: 'default',
      requirement:
        'Zápůjčka je bezúročná, nejsou-li úroky výslovně ujednány. Chceš-li úroky, ' +
        'uveď sazbu a období, za které se počítají. Nezaměňuj úrok ze zápůjčky ' +
        's úrokem z prodlení — ten náleží až při opoždění se splátkou.',
      consequence: 'doporuceni',
      law: '§ 2392 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text zaměňuje úrok ze zápůjčky a úrok z prodlení, nebo uvádí úrok bez ' +
        'určení období, za které se počítá.',
    },
    {
      id: 'loan-lichva',
      kind: 'prohibited',
      requirement:
        'Úrok nesmí být v hrubém nepoměru k poskytnutému plnění, zejména zneužil-li ' +
        'zapůjčitel tísně nebo nezkušenosti vydlužitele. Takové ujednání je neplatné.',
      consequence: 'neplatnost',
      law: '§ 1796 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Úrok řádově převyšující obvyklou tržní sazbu, zejména u zápůjčky mezi ' +
        'osobami v nerovném postavení.',
    },

    // ─── Regulace ────────────────────────────────────────────────────────────
    {
      id: 'loan-spotrebitelsky-uver',
      kind: 'mandatory',
      requirement:
        'Poskytuje-li někdo zápůjčky spotřebitelům podnikatelsky, jde o spotřebitelský ' +
        'úvěr podle zák. č. 257/2016 Sb. — činnost vyžaduje oprávnění ČNB a přísné ' +
        'informační povinnosti. Jednorázová zápůjčka mezi soukromými osobami sem nepatří.',
      consequence: 'riziko',
      law: 'zák. č. 257/2016 Sb., o spotřebitelském úvěru',
      appliesWhen: 'Zapůjčitel poskytuje zápůjčky v rámci podnikání a vydlužitel je spotřebitel.',
      reviewCheck:
        'Smlouva naznačuje opakované podnikatelské poskytování zápůjček spotřebitelům ' +
        'bez odkazu na oprávnění podle zák. č. 257/2016 Sb.',
    },
    {
      id: 'loan-hotovost',
      kind: 'mandatory',
      requirement:
        `Zápůjčku nad ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)} za jeden den nelze ` +
        'předat v hotovosti. Bezhotovostní převod má navíc tu výhodu, že předání ' +
        'sám o sobě prokazuje.',
      consequence: 'riziko',
      law: CASH_PAYMENT_LIMIT_CZK.law,
      reviewCheck: `Sjednané hotovostní předání částky nad ${formatCzk(CASH_PAYMENT_LIMIT_CZK.value)}.`,
    },

    // ─── Zajištění a vymáhání ────────────────────────────────────────────────
    {
      id: 'loan-zajisteni',
      kind: 'recommended',
      requirement:
        'U vyšších částek zvaž zajištění — ručení, zástavní právo, směnku nebo ' +
        'uznání dluhu. Bez zajištění je vymáhání odkázáno na soudní řízení.',
      consequence: 'doporuceni',
      law: '§ 2018 a § 1309 zák. č. 89/2012 Sb.',
    },
    {
      id: 'loan-urok-z-prodleni',
      kind: 'default',
      requirement:
        'Při prodlení se splátkou náleží zapůjčiteli zákonný úrok z prodlení i bez ' +
        'ujednání. Smluvní pokutu lze sjednat vedle něj, musí však být určitá.',
      consequence: 'doporuceni',
      law: '§ 1970 a § 2048 zák. č. 89/2012 Sb.',
    },
    {
      id: 'loan-forma',
      kind: 'recommended',
      requirement:
        'Zákon písemnou formu nevyžaduje, ale bez ní se existence zápůjčky ' +
        'i její podmínky prokazují velmi obtížně. Vždy písemně a ve dvou vyhotoveních.',
      consequence: 'riziko',
      law: 'Smluvní praxe; § 559 zák. č. 89/2012 Sb.',
    },
  ],
}
