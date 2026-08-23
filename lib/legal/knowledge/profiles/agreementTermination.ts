/**
 * Zrušení dohody o provedení práce nebo o pracovní činnosti — § 77 odst. 4 ZP
 *
 * The shortest employment document there is, and the one most often written
 * from the wrong template. A dohoda is not a pracovní poměr, so none of the
 * apparatus around ending one applies: no statutory grounds, no two-month
 * period, no severance, no protected periods. Fifteen days from delivery, from
 * either side, for any reason or none.
 *
 * The one thing people miss is that the agreement itself may have set a
 * different regime — § 77 odst. 4 applies only where it did not. So the first
 * question is always what the dohoda says.
 */

import type { ContractLegalProfile } from '../types'

export const AGREEMENT_TERMINATION_PROFILE: ContractLegalProfile = {
  family: 'agreement-termination',
  label: 'Zrušení dohody o provedení práce / o pracovní činnosti',
  primaryLaw: '§ 77 odst. 4 zák. č. 262/2006 Sb. (zákoník práce)',
  characterisation:
    'Jednostranné ukončení právního vztahu založeného dohodou konanou mimo ' +
    'pracovní poměr. Účinky se pojí s doručením druhé straně.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 77)',
    'https://www.pravniprostor.cz/ — skončení dohody o provedení práce',
  ],
  rules: [
    {
      id: 'atermination-prednost-dohody',
      kind: 'essential',
      label: 'ověření režimu sjednaného v dohodě',
      requirement:
        'Zákonná úprava se použije jen tehdy, nesjednaly-li si strany způsob zrušení ' +
        'v samotné dohodě. Ověř nejprve, co dohoda říká — může stanovit jiné důvody ' +
        'i jinou délku výpovědní doby.',
      consequence: 'nevznikne',
      law: '§ 77 odst. 4 zák. č. 262/2006 Sb.',
      detect: /dohod\S*\s+o\s+(provedení|pracovní)|ze\s+dne/i,
      detectSample: 'Dohoda o provedení práce ze dne 1. 9. 2026',
      reviewCheck: 'Chybí identifikace rušené dohody — datum uzavření a sjednaná práce.',
    },
    {
      id: 'atermination-forma',
      kind: 'form',
      label: 'písemná forma a doručení',
      requirement:
        'Výpověď dohody i okamžité zrušení musí být písemné a doručené druhé ' +
        'straně. Ústní zrušení nemá účinky.',
      consequence: 'neplatnost',
      law: '§ 77 odst. 4 a odst. 6 zák. č. 262/2006 Sb.',
      detect: /doruč|předán|převzet/i,
      detectSample: 'Výpověď se doručuje osobně proti podpisu',
      reviewCheck: 'Chybí údaj o doručení — patnáctidenní lhůta běží právě od něj.',
    },
    {
      id: 'atermination-15-dni',
      kind: 'mandatory',
      label: 'patnáctidenní výpovědní doba',
      requirement:
        'Není-li v dohodě sjednáno jinak, činí výpovědní doba patnáct dnů a začíná ' +
        'běžet dnem, v němž byla výpověď doručena druhé straně.',
      consequence: 'riziko',
      law: '§ 77 odst. 4 písm. b) zák. č. 262/2006 Sb.',
      detect: /patnáct\S*\s+dn|15\s*dn/i,
      detectSample: 'Výpovědní doba činí patnáct dnů',
      reviewCheck:
        'Uvedena dvouměsíční výpovědní doba nebo běh od prvního dne dalšího měsíce — ' +
        'to je úprava pracovního poměru, na dohodu se nevztahuje.',
    },
    {
      id: 'atermination-bez-duvodu',
      kind: 'default',
      requirement:
        'Výpověď dohody lze dát z jakéhokoli důvodu i bez uvedení důvodu, a to ' +
        'oběma stranami. Výpovědní důvody podle § 52 se na dohodu nevztahují.',
      consequence: 'doporuceni',
      law: '§ 77 odst. 4 písm. b) zák. č. 262/2006 Sb.',
      reviewCheck:
        'NEHLAS jako chybějící výpovědní důvod podle § 52, ochrannou dobu podle ' +
        '§ 53 ani odstupné podle § 67 — žádné z nich se na dohodu nevztahuje.',
    },
    {
      id: 'atermination-zpusoby',
      kind: 'default',
      requirement:
        'Dohodu lze zrušit dohodou stran ke sjednanému dni, výpovědí s patnáctidenní ' +
        'dobou, nebo okamžitým zrušením — to však jen v případech, kdy lze okamžitě ' +
        'zrušit pracovní poměr.',
      consequence: 'doporuceni',
      law: '§ 77 odst. 4 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Okamžité zrušení bez důvodu, který by opravňoval okamžitě zrušit pracovní ' +
        'poměr — takové zrušení neobstojí.',
    },
    {
      id: 'atermination-odmena',
      kind: 'recommended',
      requirement:
        'Uveď, jak bude vypořádána odměna za dosud vykonanou práci a kdy bude ' +
        'vyplacena. Skončením dohody nárok na odměnu nezaniká.',
      consequence: 'riziko',
      law: '§ 141 ve spojení s § 77 odst. 2 zák. č. 262/2006 Sb.',
      reviewCheck: 'Chybí vypořádání odměny za odvedenou práci.',
    },
    {
      id: 'atermination-podpis',
      kind: 'form',
      requirement:
        'Výpověď podepisuje pouze strana, která ji dává. Podpis druhé strany je ' +
        'nejvýše potvrzením převzetí.',
      consequence: 'riziko',
      law: '§ 77 odst. 4 zák. č. 262/2006 Sb.',
      reviewCheck:
        'Text obsahuje „strany se dohodly" — pak jde o dohodu o zrušení, nikoli ' +
        'o výpověď, a patnáctidenní doba se neuplatní.',
    },
    {
      id: 'atermination-potvrzeni',
      kind: 'recommended',
      requirement:
        'I u dohody vydá zaměstnavatel při skončení potvrzení o zaměstnání.',
      consequence: 'doporuceni',
      law: '§ 313 zák. č. 262/2006 Sb.',
    },
  ],
}
