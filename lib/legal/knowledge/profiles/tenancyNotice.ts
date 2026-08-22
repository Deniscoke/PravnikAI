/**
 * Výpověď z nájmu bytu — § 2286–2296 zák. č. 89/2012 Sb.
 *
 * WHY THIS IS ITS OWN PROFILE
 *
 * A notice is not a lease. Checking one against the lease profile would ask for
 * a deposit, a rent amount and a handover protocol, none of which belong in a
 * one-page document that ends a tenancy. It is also the document where a
 * formal slip is most expensive: § 2286 odst. 2 makes a landlord's notice
 * invalid outright if it omits the instruction telling the tenant they may
 * object and ask a court to review it. People lose cases on that sentence.
 *
 * Note also that the notice period here starts on the first day of the
 * following month — § 2286 was untouched by the 2025 flexinovela, which changed
 * that rule for employment only. The two are easy to confuse and the stale-law
 * guard is scoped accordingly.
 */

import type { ContractLegalProfile } from '../types'

export const TENANCY_NOTICE_PROFILE: ContractLegalProfile = {
  family: 'tenancy-notice',
  label: 'Výpověď z nájmu bytu',
  primaryLaw: '§ 2286–2296 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Jednostranné právní jednání, kterým jedna strana ukončuje nájem bytu. ' +
    'Účinky nastávají doručením druhé straně, nikoli vyhotovením dokumentu.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2286–2296)',
    'http://www.bulletin-advokacie.cz/ — náležitosti výpovědi z nájmu bytu',
  ],
  rules: [
    // ─── Forma a doručení ────────────────────────────────────────────────────
    {
      id: 'notice-forma-doruceni',
      kind: 'form',
      requirement:
        'Výpověď vyžaduje písemnou formu a musí dojít druhé straně. Samotné ' +
        'vyhotovení ani odeslání nestačí — rozhodující je dojití.',
      consequence: 'neplatnost',
      law: '§ 2286 odst. 1 a § 570 zák. č. 89/2012 Sb.',
      detect: /doruč|dojde|dojití|předán/i,
      reviewCheck:
        'Chybí údaj o způsobu doručení. U výpovědi jsou účinky vázány na dojití, ' +
        'takže doručení je třeba umět prokázat.',
    },
    {
      id: 'notice-vypovedni-doba-start',
      kind: 'default',
      requirement:
        'Výpovědní doba běží od prvního dne kalendářního měsíce následujícího poté, ' +
        'co výpověď došla druhé straně. Pozor: u pracovního poměru platí od 1. 6. 2025 ' +
        'jiné pravidlo — u nájmu se nic neměnilo.',
      consequence: 'doporuceni',
      law: '§ 2286 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že výpovědní doba běží ode dne doručení — to je úprava ' +
        'pracovního poměru, nikoli nájmu.',
    },
    {
      id: 'notice-oznaceni-najmu',
      kind: 'essential',
      requirement:
        'Označ nájemní smlouvu, kterou se vypovídá — datum uzavření a byt ' +
        '(adresa, číslo bytu). Bez toho není zřejmé, co se ukončuje.',
      consequence: 'nevznikne',
      law: '§ 553 zák. č. 89/2012 Sb.',
      detect: /nájemní\s+smlouv|byt\s*č|smlouvy\s+ze\s+dne/i,
      reviewCheck: 'Chybí identifikace vypovídané nájemní smlouvy nebo bytu.',
    },

    // ─── Výpověď pronajímatele ───────────────────────────────────────────────
    {
      id: 'notice-poucen-namitky',
      kind: 'essential',
      requirement:
        'Vypovídá-li nájem PRONAJÍMATEL, musí nájemce poučit o právu vznést proti ' +
        'výpovědi námitky a navrhnout přezkoumání oprávněnosti výpovědi soudem. ' +
        'Bez tohoto poučení je výpověď neplatná.',
      consequence: 'neplatnost',
      law: '§ 2286 odst. 2 zák. č. 89/2012 Sb.',
      appliesWhen: 'Výpověď dává pronajímatel.',
      detect: /námitk|přezkoum\w*\s+(oprávněnosti|soudem)|soudní\s+přezkum/i,
      reviewCheck:
        'Nejzávažnější a nejčastější vada výpovědi z nájmu. Chybí-li poučení ' +
        'o právu vznést námitky a navrhnout přezkoumání soudem, je celá výpověď ' +
        'neplatná, i kdyby byl důvod zcela oprávněný.',
    },
    {
      id: 'notice-duvod',
      kind: 'essential',
      requirement:
        'Pronajímatel musí ve výpovědi uvést důvod, a to důvod, který zákon ' +
        'připouští. Nájem bytu nelze vypovědět „bez udání důvodu".',
      consequence: 'neplatnost',
      law: '§ 2288 zák. č. 89/2012 Sb.',
      appliesWhen: 'Výpověď dává pronajímatel.',
      detect: /důvod/i,
      reviewCheck:
        'Výpověď pronajímatele bez uvedení důvodu, nebo s důvodem, který § 2288 ' +
        'nezná. Ujednání ve smlouvě, které pronajímateli dovoluje vypovědět nájem ' +
        'bez důvodu, zkracuje práva nájemce a nepřihlíží se k němu.',
    },
    {
      id: 'notice-vypovedni-doba-delka',
      kind: 'mandatory',
      requirement:
        'Výpovědní doba činí tři měsíce, nejde-li o výpověď bez výpovědní doby ' +
        'podle § 2291.',
      consequence: 'neplatnost',
      law: '§ 2288 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck: 'Kratší výpovědní doba než tři měsíce — zkracuje práva nájemce.',
    },
    {
      id: 'notice-bez-vypovedni-doby',
      kind: 'mandatory',
      requirement:
        'Výpověď bez výpovědní doby je možná jen při zvlášť závažném porušení ' +
        'povinností nájemce. Pronajímatel jej musí předtím vyzvat, aby v přiměřené ' +
        'době závadné chování odstranil.',
      consequence: 'neplatnost',
      law: '§ 2291 zák. č. 89/2012 Sb.',
      appliesWhen: 'Výpověď je dána bez výpovědní doby.',
      reviewCheck:
        'Okamžitá výpověď bez předchozí výzvy k nápravě, nebo pro porušení, které ' +
        'není zvlášť závažné.',
    },

    // ─── Výpověď nájemce ─────────────────────────────────────────────────────
    {
      id: 'notice-najemce-neurcita',
      kind: 'default',
      requirement:
        'Nájemce může nájem na dobu neurčitou vypovědět kdykoli a bez uvedení ' +
        'důvodu, s tříměsíční výpovědní dobou.',
      consequence: 'doporuceni',
      law: '§ 2287 zák. č. 89/2012 Sb.',
      appliesWhen: 'Výpověď dává nájemce a nájem je na dobu neurčitou.',
      reviewCheck:
        'U výpovědi nájemce NEHLAS jako chybějící důvod ani poučení o námitkách — ' +
        'obojí zákon ukládá jen pronajímateli.',
    },
    {
      id: 'notice-najemce-urcita',
      kind: 'mandatory',
      requirement:
        'Nájem na dobu určitou může nájemce vypovědět, změní-li se okolnosti, ' +
        'z nichž strany při uzavření smlouvy zjevně vycházely, do té míry, že po ' +
        'nájemci nelze rozumně požadovat, aby v nájmu pokračoval. Změnu je třeba ' +
        've výpovědi uvést.',
      consequence: 'neplatnost',
      law: '§ 2287 zák. č. 89/2012 Sb.',
      appliesWhen: 'Výpověď dává nájemce a nájem je na dobu určitou.',
      reviewCheck:
        'Výpověď nájemce z nájmu na dobu určitou bez uvedení změny okolností.',
    },

    // ─── Praktické ───────────────────────────────────────────────────────────
    {
      id: 'notice-vraceni-bytu',
      kind: 'recommended',
      requirement:
        'Uveď datum předání bytu, způsob předání klíčů a termín vyúčtování jistoty ' +
        'a služeb. Bez toho vznikají spory přesně tam, kde nájem končí.',
      consequence: 'riziko',
      law: '§ 2292 a § 2254 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí ujednání o předání bytu a vypořádání jistoty.',
    },
    {
      id: 'notice-podpis',
      kind: 'form',
      requirement:
        'Výpověď podepisuje pouze vypovídající strana. Adresát ji nepodepisuje — ' +
        'jde o jednostranné právní jednání, nikoli o dohodu.',
      consequence: 'riziko',
      law: '§ 2286 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Dokument obsahuje podpisové bloky obou stran nebo formulace „strany se ' +
        'dohodly" — pak nejde o výpověď, ale o dohodu o skončení nájmu.',
    },
  ],
}
