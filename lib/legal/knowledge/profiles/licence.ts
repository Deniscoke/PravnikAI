/**
 * Licenční smlouva — § 2358–2383 zák. č. 89/2012 Sb. a zák. č. 121/2000 Sb.
 *
 * THE SENTENCE THAT CANNOT BE WRITTEN IN CZECH LAW
 *
 * "Autor převádí na objednatele veškerá autorská práva k dílu."
 *
 * It is in half the Czech IT, design and marketing contracts in circulation,
 * copied from American work-for-hire and assignment clauses, and it is
 * impossible. § 26 odst. 1 AZ: economic rights cannot be waived and are
 * NON-TRANSFERABLE. § 11 odst. 4 AZ says the same of moral rights. What can be
 * granted is a licence — an authorisation to exercise the right — and nothing
 * else. A contract drafted as an assignment does not transfer anything; at
 * best a court reads a licence out of it, on terms nobody chose.
 *
 * THE DEFAULTS THAT SHRINK A LICENCE NOBODY MEANT TO SHRINK
 *
 * § 2376 odst. 3 fills every gap against the acquirer:
 *   - territory: the Czech Republic,
 *   - time: the period usual for that kind of work, and NEVER MORE THAN ONE
 *     YEAR from the grant,
 *   - quantity: whatever is usual.
 *
 * So a licence that forgets to say "na dobu trvání majetkových práv" and
 * "celosvětově" is a one-year Czech licence, however broadly the rest of it is
 * written. And § 2362 makes an unstated licence NON-EXCLUSIVE.
 *
 * TWO RULES THAT SURVIVE ANY DRAFTING
 *
 *   - § 2372 odst. 1: an author may licence only ways of use KNOWN at the time
 *     of conclusion. "Včetně způsobů dosud neznámých" is disregarded outright.
 *   - § 2374 odst. 2: where the agreed remuneration is in obvious disproportion
 *     to the revenue, the author may claim additional fair remuneration —
 *     and clauses excluding or limiting that right are disregarded, INCLUDING
 *     an express waiver by the author.
 *
 * WHEN NO LICENCE IS NEEDED AT ALL
 *
 *   - Employee work: unless agreed otherwise, the employer already exercises
 *     the economic rights in their own name and account (§ 58 odst. 1 AZ).
 *     Asking an employee to sign a licence for work done on the job is asking
 *     for something the employer already has.
 *   - Work on commission: the author is deemed to have granted a licence for
 *     the PURPOSE following from the contract (§ 61 odst. 1 AZ). Use beyond
 *     that purpose does need a licence — which is exactly the gap agencies
 *     discover when they want to resell a design.
 *
 * Verified against the statute texts on 2026-08-24.
 */

import type { ContractLegalProfile } from '../types'

export const LICENCE_PROFILE: ContractLegalProfile = {
  family: 'licence',
  label: 'Licenční smlouva',
  primaryLaw: '§ 2358–2383 zák. č. 89/2012 Sb. a zák. č. 121/2000 Sb. (autorský zákon)',
  characterisation:
    'Poskytnutí oprávnění k výkonu práva duševního vlastnictví v ujednaném ' +
    'rozsahu. Autorská práva se nepřevádějí — poskytuje se licence.',
  lastVerified: '2026-08-24',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2358–2383)',
    'https://www.zakonyprolidi.cz/cs/2000-121 (§ 11, § 26, § 58, § 61)',
  ],
  inapplicable: [
    {
      section: '2359',
      law: '89/2012',
      why:
        'Obecné pravidlo, že nabyvatel není povinen licenci využít, se u díla ' +
        'chráněného autorským zákonem NEUPLATNÍ. § 2372 odst. 2 je opačné: ' +
        'nabyvatel je povinen licenci využít, není-li ujednáno jinak.',
    },
  ],
  rules: [
    // ─── Co se vlastně poskytuje ─────────────────────────────────────────────
    {
      id: 'licence-neprevadi-se',
      kind: 'prohibited',
      requirement:
        'NIKDY nepiš, že autor „převádí autorská práva", „postupuje veškerá práva" ' +
        'nebo se jich „vzdává". Majetkových práv se autor nemůže vzdát a jsou ' +
        'NEPŘEVODITELNÁ; totéž platí o osobnostních právech. Poskytuje se výhradně ' +
        'LICENCE, tedy oprávnění k výkonu práva dílo užít.',
      consequence: 'neprihlizi-se',
      law: '§ 26 odst. 1 a § 11 odst. 4 zák. č. 121/2000 Sb.',
      reviewCheck:
        'Smlouva je psaná jako převod autorských práv. V českém právu takový převod ' +
        'není možný — práva zůstávají autorovi a smlouva nepřevede nic. Je to ' +
        'nejzávažnější a nejčastější vada licenčních smluv převzatých ze zahraničí.',
    },
    {
      id: 'licence-osobnostni-prava',
      kind: 'default',
      requirement:
        'Osobnostních práv se autor nemůže vzdát — právo na autorství, na uvedení ' +
        'jména a na nedotknutelnost díla trvají. Lze ujednat, že autor nebude ' +
        'u konkrétního užití uváděn, ale nikoli že se práva vzdává.',
      consequence: 'doporuceni',
      law: '§ 11 zák. č. 121/2000 Sb.',
      reviewCheck:
        'Smlouva obsahuje vzdání se osobnostních práv autora. K takovému ujednání ' +
        'se nepřihlíží.',
    },
    {
      id: 'licence-predmet',
      kind: 'essential',
      label: 'vymezení díla',
      requirement:
        'Označ dílo jednoznačně — název, druh, forma, rozsah, případně příloha ' +
        'se specifikací. U softwaru uveď verzi a to, zda licence zahrnuje zdrojový ' +
        'kód.',
      consequence: 'nevznikne',
      law: '§ 2358 a § 2371 zák. č. 89/2012 Sb.',
      detect: /dílo|software|fotografi|logo|autorské\s+dílo|specifikac/i,
      detectSample: 'Předmětem licence je grafický manuál a logotyp specifikovaný v příloze č. 1',
      reviewCheck: 'Chybí jednoznačné vymezení díla, k němuž se licence poskytuje.',
    },
    {
      id: 'licence-zpusoby-uziti',
      kind: 'essential',
      label: 'způsoby užití díla',
      requirement:
        'Vyjmenuj ZPŮSOBY UŽITÍ — rozmnožování, rozšiřování, sdělování veřejnosti, ' +
        'úprava, zpracování, zařazení do jiného díla. Neujedná-li se nic, má se za ' +
        'to, že licence pokrývá jen to, co je nutné k dosažení účelu smlouvy.',
      consequence: 'nevznikne',
      law: '§ 2371 a § 2376 odst. 2 zák. č. 89/2012 Sb.',
      detect: /rozmnožován|rozšiřován|sdělován\S*\s+veřejnosti|způsob\S*\s+užití|užít\S*\s+dílo|zpracován/i,
      detectSample: 'Licence zahrnuje rozmnožování, rozšiřování a sdělování veřejnosti',
      reviewCheck:
        'Chybí vymezení způsobů užití. Uplatní se domněnka, že licence pokrývá jen ' +
        'to, co je nutné k účelu smlouvy — což bývá výrazně méně, než nabyvatel čeká.',
    },
    {
      id: 'licence-nezname-zpusoby',
      kind: 'prohibited',
      requirement:
        'Autor může poskytnout oprávnění jen ke způsobům užití ZNÁMÝM v době ' +
        'uzavření smlouvy. K ujednání, které zahrnuje i způsoby dosud neznámé, se ' +
        'NEPŘIHLÍŽÍ — nepiš tedy „všemi způsoby, včetně dosud neznámých".',
      consequence: 'neprihlizi-se',
      law: '§ 2372 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Licence se poskytuje i ke způsobům užití dosud neznámým. K takovému ' +
        'ujednání se nepřihlíží; nabyvateli to nic nepřidá a působí to nedbale.',
    },

    // ─── Rozsah, který doplňuje zákon ────────────────────────────────────────
    {
      id: 'licence-rozsah-uzemi-cas',
      kind: 'mandatory',
      label: 'územní, časový a množstevní rozsah',
      requirement:
        'Uveď ÚZEMNÍ, ČASOVÝ a MNOŽSTEVNÍ rozsah licence. Nevyplývá-li z účelu ' +
        'smlouvy jinak, doplní zákon: území České republiky, doba obvyklá u daného ' +
        'druhu díla, avšak NEJVÝŠE JEDEN ROK od poskytnutí licence, a obvyklé ' +
        'množství. Chceš-li licenci celosvětovou a na dobu trvání majetkových práv, ' +
        'musí to být napsáno.',
      consequence: 'riziko',
      law: '§ 2376 odst. 3 zák. č. 89/2012 Sb.',
      detect: /celosvětov|územn\S*\s+rozsah|na\s+dobu\s+trvání\s+majetkov|neomezen\S*\s+(územně|časově)|po\s+dobu\s+\S+\s+let/i,
      detectSample: 'Licence se poskytuje celosvětově a na dobu trvání majetkových práv autorských',
      reviewCheck:
        'Chybí územní nebo časový rozsah licence. Doplní se zákonná domněnka: ' +
        'Česká republika a nejvýše jeden rok. Licence, která zní široce, ale rozsah ' +
        'neuvádí, je ve skutečnosti roční a tuzemská.',
    },
    {
      id: 'licence-vyhradnost',
      kind: 'mandatory',
      label: 'výhradnost licence',
      requirement:
        'Uveď výslovně, zda je licence VÝHRADNÍ, nebo NEVÝHRADNÍ. Není-li ' +
        'výhradnost výslovně ujednána, platí, že licence je nevýhradní.',
      consequence: 'riziko',
      law: '§ 2362 zák. č. 89/2012 Sb.',
      detect: /výhradn|nevýhradn|exkluziv/i,
      detectSample: 'Licence se poskytuje jako výhradní',
      reviewCheck:
        'Smlouva mluví o exkluzivitě, ale výhradní licenci výslovně nesjednává. ' +
        'Podle § 2362 pak jde o licenci nevýhradní a poskytovatel může totéž ' +
        'poskytnout komukoli dalšímu.',
    },
    {
      id: 'licence-vyhradni-zdrzeni',
      kind: 'default',
      requirement:
        'U VÝHRADNÍ licence se poskytovatel zdrží i vlastního výkonu práva, ' +
        'není-li výslovně ujednán opak. Autor, který chce dílo dál používat — ' +
        'třeba v portfoliu — si to musí vymínit.',
      consequence: 'doporuceni',
      law: '§ 2360 odst. 1 zák. č. 89/2012 Sb.',
      detect: /portfoli|referen|autor\S*\s+může\s+dílo\s+užít|vlastn\S*\s+prezentac/i,
      detectSample: 'Autor je oprávněn dílo užít ve svém portfoliu a referencích',
      reviewCheck:
        'Výhradní licence bez výhrady pro autora. Autor pak nesmí dílo užít ani ' +
        've vlastním portfoliu — bývá to nechtěný důsledek.',
    },
    {
      id: 'licence-vyhradni-porusena',
      kind: 'default',
      requirement:
        'Poskytne-li poskytovatel za trvání výhradní licence licenci třetí osobě ' +
        'bez písemného souhlasu nabyvatele, taková licence NEVZNIKNE. Nevýhradní ' +
        'licence poskytnutá dříve však zůstává zachována.',
      consequence: 'doporuceni',
      law: '§ 2360 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že dříve poskytnuté nevýhradní licence výhradní licencí ' +
        'zanikají. Zůstávají zachovány.',
    },

    // ─── Odměna ──────────────────────────────────────────────────────────────
    {
      id: 'licence-odmena',
      kind: 'essential',
      label: 'odměna nebo bezúplatnost',
      requirement:
        'Uveď odměnu, způsob jejího určení, NEBO výslovně to, že se licence ' +
        'poskytuje bezúplatně. Není-li ani jedno a z jednání stran plyne vůle ' +
        'uzavřít smlouvu úplatnou, platí odměna obvyklá — což je otevřený spor.',
      consequence: 'nevznikne',
      law: '§ 2366 odst. 1 zák. č. 89/2012 Sb.',
      detect: /odměn|bezúplatn|licenčn\S*\s+poplat|Kč|royalt/i,
      detectSample: 'Odměna za licenci činí 120 000 Kč',
      reviewCheck: 'Chybí odměna i výslovné ujednání o bezúplatnosti licence.',
    },
    {
      id: 'licence-dodatecna-odmena',
      kind: 'prohibited',
      requirement:
        'Je-li ujednaná odměna tak nízká, že je ve zřejmém nepoměru k výnosům ' +
        'z využití licence, může autor požadovat přiměřenou DODATEČNOU ODMĚNU. ' +
        'K ujednáním, která toto právo vylučují nebo omezují, se NEPŘIHLÍŽÍ — ' +
        'a to i tehdy, vzdá-li se autor tohoto práva výslovně.',
      consequence: 'neprihlizi-se',
      law: '§ 2374 odst. 2 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva vylučuje právo autora na dodatečnou odměnu nebo obsahuje jeho ' +
        'vzdání se. K takovému ujednání se nepřihlíží — klauzule je bezcenná ' +
        'a vzbuzuje falešnou jistotu.',
    },
    {
      id: 'licence-pevna-castka',
      kind: 'default',
      requirement:
        'Odměna může být ujednána jako pevná částka pouze v odůvodněných případech ' +
        'a s ohledem na zvláštnosti daného odvětví. Přihlíží se k účelu licence, ' +
        'způsobu užití, velikosti tvůrčího příspěvku a k rozsahu licence.',
      consequence: 'doporuceni',
      law: '§ 2374 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Pevná částka za neomezenou licenci bez odůvodnění. U děl s dlouhodobým ' +
        'komerčním využitím to bývá napadnutelné.',
    },
    {
      id: 'licence-vyuctovani',
      kind: 'mandatory',
      label: 'vyúčtování a informace o užití',
      requirement:
        'Je-li odměna závislá na výnosech, umožní nabyvatel poskytovateli kontrolu ' +
        'účetních záznamů. U úplatné licence k autorskému dílu navíc nabyvatel ' +
        'předkládá autorovi ALESPOŇ JEDNOU ROČNĚ aktuální a úplné informace o užití ' +
        'díla.',
      consequence: 'riziko',
      law: '§ 2366 odst. 2 a § 2374a zák. č. 89/2012 Sb.',
      detect: /vyúčtován|kontrol\S*\s+účetn|jednou\s+ročně|informac\S*\s+o\s+užití/i,
      detectSample: 'Nabyvatel předloží autorovi jednou ročně informace o užití díla',
      reviewCheck:
        'Chybí ujednání o vyúčtování a o roční informační povinnosti podle § 2374a.',
    },

    // ─── Nakládání s licencí ─────────────────────────────────────────────────
    {
      id: 'licence-podlicence',
      kind: 'mandatory',
      label: 'podlicence',
      requirement:
        'Nabyvatel může oprávnění poskytnout třetí osobě (podlicence) JEN bylo-li ' +
        'to ujednáno. Mlčení znamená zákaz — pro agenturu, která dílo předává ' +
        'svému klientovi, je to zásadní.',
      consequence: 'riziko',
      law: '§ 2363 zák. č. 89/2012 Sb.',
      detect: /podlicenc|sublicenc|poskytnout\s+třetí\s+osobě/i,
      detectSample: 'Nabyvatel je oprávněn poskytnout podlicenci třetí osobě',
      reviewCheck:
        'Chybí ujednání o podlicenci. Bez něj ji nabyvatel poskytnout nesmí, ' +
        'i kdyby to byl celý smysl obchodu.',
    },
    {
      id: 'licence-postoupeni',
      kind: 'default',
      requirement:
        'Licenci lze postoupit třetí osobě jen se souhlasem poskytovatele; souhlas ' +
        'vyžaduje písemnou formu. Postoupení musí nabyvatel bez zbytečného odkladu ' +
        'oznámit. Při převodu obchodního závodu se souhlas vyžaduje, jen bylo-li to ' +
        'zvlášť ujednáno.',
      consequence: 'doporuceni',
      law: '§ 2364 a § 2365 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že licenci nelze postoupit nikdy, nebo naopak že ji lze ' +
        'postoupit volně. Rozhoduje souhlas poskytovatele — s výjimkou převodu závodu.',
    },
    {
      id: 'licence-povinnost-vyuzit',
      kind: 'mandatory',
      label: 'ujednání o povinnosti licenci využít',
      requirement:
        'U licence k autorskému dílu je nabyvatel POVINEN licenci využít, není-li ' +
        'ujednáno jinak. Je to opak obecného pravidla § 2359 odst. 1. Nechce-li se ' +
        'nabyvatel zavázat, musí to být ve smlouvě výslovně.',
      consequence: 'riziko',
      law: '§ 2372 odst. 2 zák. č. 89/2012 Sb.',
      detect: /povinen\S*\s+licenci\s+využít|není\s+povinen\s+licenci\s+využít|povinnost\S*\s+využít/i,
      detectSample: 'Nabyvatel není povinen licenci využít',
      reviewCheck:
        'Chybí ujednání o povinnosti licenci využít. U autorského díla platí ' +
        'povinnost ze zákona a nabyvatel se jí nevědomky zavazuje.',
    },
    {
      id: 'licence-odstoupeni-necinnost',
      kind: 'default',
      requirement:
        'Nevyužívá-li nabyvatel VÝHRADNÍ licenci vůbec, může autor od smlouvy ' +
        'odstoupit nebo licenci omezit — ale teprve poté, co nabyvatele vyzve ' +
        'k využití v přiměřené lhůtě a ve výzvě jej na tento následek UPOZORNÍ. ' +
        'Výzvy není třeba, prohlásí-li nabyvatel, že licenci nevyužije.',
      consequence: 'doporuceni',
      law: '§ 2378 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text tvrdí, že autor může při nečinnosti nabyvatele odstoupit okamžitě. ' +
        'Předchozí výzva s upozorněním na následek je podmínkou.',
    },
    {
      id: 'licence-vypoved-rok',
      kind: 'default',
      requirement:
        'Je-li licenční smlouva uzavřena na dobu neurčitou, nabývá výpověď ' +
        'účinnosti až uplynutím JEDNOHO ROKU od konce kalendářního měsíce, v němž ' +
        'došla druhé straně. Chcete-li kratší výpovědní dobu, ujednejte ji.',
      consequence: 'doporuceni',
      law: '§ 2370 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva na dobu neurčitou bez ujednání o výpovědi. Uplatní se roční ' +
        'výpovědní doba běžící od konce měsíce — pro obě strany bývá překvapením.',
    },

    // ─── Kdy licence není potřeba ────────────────────────────────────────────
    {
      id: 'licence-zamestnanecke-dilo',
      kind: 'default',
      requirement:
        'Vytvořil-li dílo ZAMĚSTNANEC ke splnění povinností z pracovněprávního ' +
        'vztahu, vykonává majetková práva zaměstnavatel svým jménem a na svůj účet, ' +
        'není-li ujednáno jinak. Licenci od zaměstnance tedy zaměstnavatel ' +
        'nepotřebuje.',
      consequence: 'doporuceni',
      law: '§ 58 odst. 1 zák. č. 121/2000 Sb.',
      appliesWhen: 'Autorem je zaměstnanec a dílo vzniklo při plnění pracovních povinností.',
      reviewCheck:
        'Zaměstnavatel si nechává od zaměstnance poskytnout licenci k zaměstnaneckému ' +
        'dílu. Majetková práva už vykonává ze zákona — takové ujednání je nadbytečné ' +
        'a může naopak zúžit, co má.',
    },
    {
      id: 'licence-dilo-na-objednavku',
      kind: 'mandatory',
      requirement:
        'U díla vytvořeného na objednávku podle smlouvy o dílo platí, že autor ' +
        'poskytl licenci K ÚČELU vyplývajícímu ze smlouvy. K užití NAD RÁMEC tohoto ' +
        'účelu je objednatel oprávněn jen na základě licenční smlouvy. Autor navíc ' +
        'může dílo sám užít a licencovat jinému, není-li to v rozporu s oprávněnými ' +
        'zájmy objednatele.',
      consequence: 'riziko',
      law: '§ 61 zák. č. 121/2000 Sb.',
      appliesWhen: 'Dílo vzniklo na objednávku podle smlouvy o dílo.',
      reviewCheck:
        'Objednatel počítá s užitím nad rámec účelu smlouvy o dílo — například ' +
        's dalším prodejem nebo licencováním — aniž by na to byla uzavřena licenční ' +
        'smlouva. Zákonná licence podle § 61 na to nestačí.',
    },

    // ─── Forma ───────────────────────────────────────────────────────────────
    {
      id: 'licence-pisemna-forma',
      kind: 'form',
      label: 'písemná forma u výhradní licence',
      requirement:
        'Písemnou formu vyžaduje smlouva jen tehdy, poskytuje-li se licence ' +
        'VÝHRADNÍ, nebo má-li být zapsána do veřejného seznamu. Nevýhradní licenci ' +
        'lze poskytnout i jinak — u nevýhradní tedy nehlas absenci písemné formy ' +
        'jako vadu.',
      consequence: 'neplatnost',
      law: '§ 2358 odst. 2 zák. č. 89/2012 Sb.',
      detect: /podpis|v\s+\S+\s+dne|za\s+poskytovatele/i,
      detectSample: 'V Praze dne 1. 4. 2027, podpisy obou stran',
      reviewCheck:
        'Výhradní licence bez písemné formy. U nevýhradní licence naopak písemnou ' +
        'formu nevyžaduj.',
    },
    {
      id: 'licence-rozmnozenina-pro-autora',
      kind: 'recommended',
      requirement:
        'Lze-li to spravedlivě požadovat a je-li to obvyklé, poskytne nabyvatel ' +
        'autorovi na své náklady alespoň jednu rozmnoženinu díla z těch, které ' +
        'na základě licence pořídil.',
      consequence: 'doporuceni',
      law: '§ 2377 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí ujednání o rozmnoženině díla pro autora.',
    },
  ],
}
