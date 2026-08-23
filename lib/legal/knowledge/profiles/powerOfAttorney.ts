/**
 * Plná moc — § 441–449 zák. č. 89/2012 Sb.
 *
 * TWO TRAPS, BOTH EXPENSIVE
 *
 * The first is form. § 441 odst. 2 requires the power of attorney to be granted
 * in the same special form the act itself requires — so a transfer of land that
 * needs a certified signature needs a power of attorney with one too. People
 * discover this at the cadastral office, after the deed is signed.
 *
 * The second is scope. Authority "to sign the purchase contract" does not cover
 * filing the application for registration, and the office will refuse it. The
 * document has to name every step the agent is meant to take, not the outcome
 * the principal has in mind.
 *
 * Not a contract: the principal grants, the agent receives. The drafting prompt
 * is overridden accordingly (documentKind 'unilateral').
 */

import type { ContractLegalProfile } from '../types'

export const POWER_OF_ATTORNEY_PROFILE: ContractLegalProfile = {
  family: 'power-of-attorney',
  label: 'Plná moc',
  primaryLaw: '§ 441–449 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Jednostranné právní jednání, kterým zmocnitel osvědčuje rozsah zástupčího ' +
    'oprávnění zmocněnce vůči třetím osobám.',
  lastVerified: '2026-08-22',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 441–449)',
    'https://cuzk.gov.cz/Katastr-nemovitosti/Zapisy-do-KN/ — požadavky na plnou moc',
  ],
  rules: [
    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'poa-strany',
      kind: 'essential',
      label: 'označení zmocnitele a zmocněnce',
      requirement:
        'Zmocnitel i zmocněnec musí být označeni nezaměnitelně — jménem, datem ' +
        'narození nebo IČO a adresou. Třetí osoba musí být schopna ověřit, kdo ' +
        'koho zmocnil.',
      consequence: 'nevznikne',
      law: '§ 441 odst. 1 a § 553 zák. č. 89/2012 Sb.',
      detect: /zmocnitel|zmocněn/i,
      detectSample: 'Zmocnitel: Jan Novák, zmocněnec: Petr Svoboda',
      reviewCheck: 'Strany označené jen jménem, bez data narození nebo adresy.',
    },
    {
      id: 'poa-rozsah',
      kind: 'essential',
      label: 'rozsah zmocnění',
      requirement:
        'Rozsah zástupčího oprávnění musí být vymezen určitě. Vyjmenuj konkrétní ' +
        'úkony, ne jen zamýšlený výsledek — oprávnění „podepsat kupní smlouvu" ' +
        'nezahrnuje podání návrhu na vklad ani jednání s katastrálním úřadem.',
      consequence: 'nevznikne',
      law: '§ 441 odst. 1 a § 553 zák. č. 89/2012 Sb.',
      detect: /zmocňuji|uděluji\s+plnou\s+moc|opravňuj|k\s+zastupování/i,
      detectSample: 'Zmocňuji zmocněnce k zastupování v této věci',
      reviewCheck:
        'Rozsah vymezený cílem místo úkonů, nebo tak úzce, že na navazující krok ' +
        'nestačí. Toto je nejčastější důvod, proč úřad plnou moc odmítne.',
    },

    // ─── Forma ───────────────────────────────────────────────────────────────
    {
      id: 'poa-forma-podle-jednani',
      kind: 'form',
      label: 'forma odpovídající zastupovanému jednání',
      requirement:
        'Vyžaduje-li zastupované právní jednání zvláštní formu, musí být v téže ' +
        'formě udělena i plná moc. Vyžaduje-li tedy jednání písemnou formu ' +
        's úředně ověřeným podpisem, musí ji mít i plná moc.',
      consequence: 'neplatnost',
      law: '§ 441 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Plná moc k převodu nemovitosti bez úředně ověřeného podpisu zmocnitele — ' +
        'katastrální úřad ji nepřijme a celý převod se zdrží.',
    },
    {
      id: 'poa-katastr',
      kind: 'mandatory',
      label: 'úředně ověřený podpis u katastru',
      requirement:
        'Zastupuje-li zmocněnec účastníka v řízení před katastrálním úřadem, ' +
        'vyžaduje se plná moc s úředně ověřeným podpisem zmocnitele.',
      consequence: 'riziko',
      law: 'zák. č. 256/2013 Sb. (katastrální zákon); § 441 odst. 2 NOZ',
      appliesWhen: 'Zmocnění se týká nemovitosti zapisované do katastru.',
      reviewCheck: 'Chybí ujednání o ověření podpisu u plné moci k nemovitosti.',
    },

    // ─── Meze ────────────────────────────────────────────────────────────────
    {
      id: 'poa-generalni',
      kind: 'recommended',
      label: 'omezení generální plné moci',
      requirement:
        'Generální plná moc „ke všem právním jednáním" je platná, ale nese ' +
        'značné riziko — zmocněnec s ní může nakládat i s majetkem, o kterém ' +
        'zmocnitel neuvažoval. Omez rozsah na to, co je skutečně potřeba.',
      consequence: 'riziko',
      law: '§ 441 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Neomezené zmocnění bez věcného nebo časového omezení, zejména mezi ' +
        'osobami bez blízkého vztahu.',
    },
    {
      id: 'poa-prekroceni',
      kind: 'default',
      requirement:
        'Jedná-li zmocněnec nad rámec zmocnění, zmocnitele to nezavazuje, ledaže ' +
        'jednání dodatečně schválí. Třetí osoba se může domáhat plnění po ' +
        'zmocněnci, který rozsah překročil.',
      consequence: 'doporuceni',
      law: '§ 446 a § 440 zák. č. 89/2012 Sb.',
    },
    {
      id: 'poa-substituce',
      kind: 'default',
      requirement:
        'Zmocněnec jedná osobně. Dalšího zástupce může zvolit jen tehdy, bylo-li ' +
        'to ujednáno, nebo vyžaduje-li to nutná potřeba. Chceš-li substituci ' +
        'umožnit, uveď to výslovně.',
      consequence: 'doporuceni',
      law: '§ 438 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí ujednání o substituci tam, kde ji zmocněnec bude potřebovat.',
    },

    // ─── Trvání a zánik ──────────────────────────────────────────────────────
    {
      id: 'poa-doba',
      kind: 'recommended',
      label: 'doba platnosti',
      requirement:
        'Uveď dobu, na kterou se plná moc uděluje, nebo ji navaž na splnění ' +
        'úkolu. Bez omezení platí, dokud ji zmocnitel neodvolá.',
      consequence: 'riziko',
      law: '§ 448 zák. č. 89/2012 Sb.',
      detect: /do\s+\d{1,2}\.\s*\d{1,2}\.\s*\d{4}|na\s+dobu|platí\s+do|do\s+splnění/i,
      detectSample: 'Plná moc se uděluje na dobu do 31. 12. 2027',
      reviewCheck: 'Chybí časové omezení i navázání na splnění úkolu.',
    },
    {
      id: 'poa-zanik',
      kind: 'default',
      requirement:
        'Zmocnění zaniká vykonáním jednání, na které bylo omezeno, odvoláním ' +
        'zmocnitelem nebo výpovědí zmocněnce. Odvolání je účinné vůči třetím ' +
        'osobám, jakmile se o něm dozvědí.',
      consequence: 'doporuceni',
      law: '§ 448 a § 449 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Ujednání, že plnou moc nelze odvolat — zmocnitel se práva odvolat ' +
        'zmocnění nemůže platně vzdát.',
    },

    // ─── Praktické ───────────────────────────────────────────────────────────
    {
      id: 'poa-prijeti',
      kind: 'recommended',
      requirement:
        'Přijetí plné moci zmocněncem zákon nevyžaduje, v praxi se však ' +
        'připojuje — usnadňuje prokázání, že zmocněnec o zmocnění ví a přijal je.',
      consequence: 'doporuceni',
      law: 'Smluvní praxe',
    },
    {
      id: 'poa-datum-misto',
      kind: 'recommended',
      label: 'datum a místo udělení',
      requirement:
        'Uveď datum a místo udělení. U plné moci s omezenou platností je datum ' +
        'nezbytné pro určení, zda ještě trvá.',
      consequence: 'riziko',
      law: 'Smluvní praxe',
      detect: /\bdne\s+\d{1,2}\.|\bv\s+[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\S+\s+dne/i,
      detectSample: 'V Praze dne 22. 8. 2026',
      reviewCheck: 'Chybí datum udělení plné moci.',
    },
  ],
}
