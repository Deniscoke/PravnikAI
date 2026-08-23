/**
 * Odstoupení od smlouvy — § 2001–2005 zák. č. 89/2012 Sb.
 *
 * The document people reach for when they want out, and usually the wrong one.
 * Withdrawal is not termination by notice: it cancels the obligation from the
 * beginning, so everything already exchanged goes back. Notice ends a contract
 * going forward and leaves the past alone. Choosing wrongly changes what each
 * side owes.
 *
 * And withdrawal is not free-standing. § 2001 allows it only where the parties
 * agreed to it or the law provides for it — most often a substantial breach
 * under § 2002. A letter announcing withdrawal with no ground is a letter
 * announcing nothing.
 *
 * Distinct again from the consumer's fourteen-day right under § 1829, which
 * needs no reason at all but exists only for distance and off-premises
 * contracts. Templates blur the two constantly.
 */

import type { ContractLegalProfile } from '../types'

export const WITHDRAWAL_PROFILE: ContractLegalProfile = {
  family: 'withdrawal',
  label: 'Odstoupení od smlouvy',
  primaryLaw: '§ 2001–2005 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Jednostranné právní jednání, kterým se závazek ruší od počátku. Vyžaduje ' +
    'důvod ujednaný ve smlouvě nebo stanovený zákonem.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2001–2005, § 1829)',
    'https://www.asociace-sos.cz/ — podstatné porušení a právo odstoupit',
  ],
  rules: [
    // ─── Musí existovat důvod ────────────────────────────────────────────────
    {
      id: 'withdrawal-duvod',
      kind: 'essential',
      label: 'důvod odstoupení',
      requirement:
        'Odstoupit lze jen tehdy, ujednaly-li si to strany, nebo stanoví-li tak ' +
        'zákon. Ve zprávě musí být uvedeno, o který důvod jde — odkaz na ujednání ' +
        've smlouvě nebo na zákonné ustanovení, a skutečnosti, které jej naplňují.',
      consequence: 'nevznikne',
      law: '§ 2001 zák. č. 89/2012 Sb.',
      detect: /odstupuj|odstoup\S*\s+od\s+smlouvy|důvod/i,
      detectSample: 'Odstupuji od smlouvy z důvodu podstatného porušení',
      reviewCheck:
        'Odstoupení bez uvedení důvodu. Na rozdíl od výpovědi u nájmu na dobu ' +
        'neurčitou nelze odstoupit „jen tak" — bez důvodu nemá odstoupení účinky.',
    },
    {
      id: 'withdrawal-oznaceni-smlouvy',
      kind: 'essential',
      label: 'označení smlouvy',
      requirement:
        'Označ smlouvu, od které se odstupuje — typ, datum uzavření, smluvní ' +
        'strany a předmět. Bez toho není zřejmé, co se ruší.',
      consequence: 'nevznikne',
      law: '§ 553 zák. č. 89/2012 Sb.',
      // Real documents name the contract before dating it — "smlouvy o dílo
      // ze dne", "smlouvy o zápůjčce ze dne" — so allow words in between.
      detect: /smlouv\S*(?:\s+\S+){0,3}\s+ze\s+dne|uzavřen\S*\s+dne/i,
      detectSample: 'Smlouva o dílo ze dne 1. 6. 2026',
      reviewCheck: 'Chybí identifikace smlouvy, od které se odstupuje.',
    },

    // ─── Podstatné a nepodstatné porušení ────────────────────────────────────
    {
      id: 'withdrawal-podstatne-poruseni',
      kind: 'mandatory',
      requirement:
        'Při podstatném porušení lze odstoupit bez zbytečného odkladu poté, co se ' +
        'strana o porušení dozvěděla. Podstatné je takové porušení, o němž strana ' +
        'porušující smlouvu už při jejím uzavření věděla nebo musela vědět, že by ' +
        'druhá strana smlouvu neuzavřela, kdyby je předvídala.',
      consequence: 'riziko',
      law: '§ 2002 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Odstoupení pro podstatné porušení podané se značným odstupem — právo ' +
        'odstoupit se váže na jednání bez zbytečného odkladu.',
    },
    {
      id: 'withdrawal-nepodstatne-poruseni',
      kind: 'mandatory',
      label: 'předchozí výzva s dodatečnou lhůtou',
      requirement:
        'Při nepodstatném porušení lze odstoupit až poté, co druhá strana nesplní ' +
        'ani v dodatečné přiměřené lhůtě, kterou jí strana výslovně poskytla. ' +
        'Bez předchozí výzvy s lhůtou odstoupení neobstojí.',
      consequence: 'neplatnost',
      law: '§ 1978 a § 2003 zák. č. 89/2012 Sb.',
      detect: /dodatečn\S*\s+lhůt|vyzval|výzv\S*\s+k\s+(nápravě|plnění)/i,
      detectSample: 'Poskytl jsem dodatečnou lhůtu k plnění, která marně uplynula',
      reviewCheck:
        'Odstoupení pro nepodstatné porušení bez předchozí výzvy a dodatečné lhůty — ' +
        'to je nejčastější důvod, proč odstoupení neobstojí.',
    },

    // ─── Účinky ──────────────────────────────────────────────────────────────
    {
      id: 'withdrawal-od-pocatku',
      kind: 'default',
      requirement:
        'Odstoupením se závazek ruší OD POČÁTKU. Strany si vrátí, co si už plnily. ' +
        'Tím se odstoupení liší od výpovědi, která působí do budoucna a plnění ' +
        'z minulosti se nedotýká.',
      consequence: 'doporuceni',
      law: '§ 2004 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text zaměňuje odstoupení a výpověď, nebo tvrdí, že smlouva zaniká ke dni ' +
        'doručení — odstoupením se ruší od počátku.',
    },
    {
      id: 'withdrawal-vraceni-plneni',
      kind: 'recommended',
      label: 'vypořádání vzájemných plnění',
      requirement:
        'Uveď, co a v jaké lhůtě se má vrátit, a číslo účtu pro vrácení peněz. ' +
        'Bez toho zůstává vypořádání otevřené a spor pokračuje.',
      consequence: 'riziko',
      law: '§ 2004 a § 2993 zák. č. 89/2012 Sb.',
      detect: /vrácení|vrátit|vypořádán/i,
      detectSample: 'Žádám o vrácení uhrazené částky na účet',
      reviewCheck: 'Chybí lhůta a způsob vrácení plnění.',
    },
    {
      id: 'withdrawal-co-prezije',
      kind: 'default',
      requirement:
        'Odstoupení se nedotýká práva na zaplacení smluvní pokuty, úroku z prodlení ' +
        'ani práva na náhradu škody vzniklé porušením smlouvy; nedotýká se ani ' +
        'ujednání o způsobu řešení sporů a dalších ujednání, která mají zavazovat ' +
        'i po zániku závazku.',
      consequence: 'doporuceni',
      law: '§ 2005 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že odstoupením zanikají veškerá práva — smluvní pokuta, úrok ' +
        'z prodlení a náhrada škody přetrvávají.',
    },
    {
      id: 'withdrawal-neni-vypoved',
      kind: 'prohibited',
      requirement:
        'Nezaměňuj odstoupení a výpověď. U trvajících závazků, kde plnění nelze ' +
        'vrátit, bývá namístě výpověď; odstoupení míří na zrušení od počátku.',
      consequence: 'neprihlizi-se',
      law: '§ 2004 a § 1998 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Dokument nadepsaný jako odstoupení, který ale popisuje ukončení do budoucna ' +
        's výpovědní dobou — pak nejde o odstoupení a jeho účinky nenastanou.',
    },

    // ─── Spotřebitel ─────────────────────────────────────────────────────────
    {
      id: 'withdrawal-spotrebitel-14-dni',
      kind: 'mandatory',
      requirement:
        'Uzavřel-li spotřebitel smlouvu distančním způsobem nebo mimo obchodní ' +
        'prostory, může od ní odstoupit do čtrnácti dnů BEZ UDÁNÍ DŮVODU. Je to ' +
        'samostatné právo, nikoli obecné odstoupení podle § 2001.',
      consequence: 'riziko',
      law: '§ 1829 zák. č. 89/2012 Sb.',
      appliesWhen: 'Kupující je spotřebitel a smlouva byla uzavřena distančně nebo mimo obchodní prostory.',
      reviewCheck:
        'Text vyžaduje po spotřebiteli důvod u čtrnáctidenního odstoupení, nebo ' +
        'naopak uplatňuje čtrnáctidenní lhůtu na smlouvu uzavřenou v kamenné prodejně, ' +
        'kde toto právo nevzniká.',
    },
    {
      id: 'withdrawal-forma-doruceni',
      kind: 'form',
      label: 'forma a doručení',
      requirement:
        'Odstoupení je jednostranné právní jednání a působí dojitím druhé straně. ' +
        'Písemná forma není vždy povinná, ale bez ní se odstoupení prokazuje obtížně.',
      consequence: 'riziko',
      law: '§ 570 zák. č. 89/2012 Sb.',
      detect: /doruč|dojití|zaslán/i,
      detectSample: 'Odstoupení se doručuje doporučeně na adresu prodávajícího',
      reviewCheck: 'Chybí způsob doručení — účinky nastávají až dojitím.',
    },
  ],
}
