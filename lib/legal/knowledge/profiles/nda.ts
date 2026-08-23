/**
 * Dohoda o mlčenlivosti (NDA) — nepojmenovaná smlouva dle § 1746 odst. 2 NOZ
 *
 * Czech law has no contract type called an NDA. It is an innominate contract,
 * which means nothing fills the gaps the parties leave — there are no default
 * rules to fall back on. Everything that matters has to be written down, and
 * the definition of what is confidential has to be certain enough to satisfy
 * § 553, or the whole obligation is disregarded.
 *
 * The translated templates that circulate here import Anglo-American habits —
 * perpetual terms, liquidated damages, "any and all information" — that Czech
 * courts treat very differently.
 */

import type { ContractLegalProfile } from '../types'

export const NDA_PROFILE: ContractLegalProfile = {
  family: 'nda',
  label: 'Dohoda o mlčenlivosti (NDA)',
  primaryLaw:
    '§ 1746 odst. 2 zák. č. 89/2012 Sb. (nepojmenovaná smlouva); § 504 a § 2985 tamtéž',
  characterisation:
    'Strany se zavazují zachovávat mlčenlivost o vymezených důvěrných informacích ' +
    'a neužít je k jinému účelu, než pro který byly poskytnuty.',
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 504, § 1730, § 1746, § 2985)',
    'https://www.zakonyprolidi.cz/cs/2006-262 (§ 310 — hranice vůči konkurenční doložce)',
  ],
  rules: [
    // ─── Určitost předmětu ───────────────────────────────────────────────────
    {
      id: 'nda-vymezeni-informaci',
      kind: 'essential',
      label: 'definice důvěrných informací',
      requirement:
        'Důvěrné informace musí být vymezeny určitě — druhem, okruhem, nebo způsobem ' +
        'označení při předání. Musí být zjistitelné, co konkrétně mlčenlivosti podléhá.',
      consequence: 'neprihlizi-se',
      law: '§ 553 a § 1746 odst. 2 zák. č. 89/2012 Sb.',
      detect: /důvěrn\S*\s+informac/i,
      detectSample: 'Důvěrné informace zahrnují obchodní plány',
      reviewCheck:
        'Definice typu „veškeré informace, které strana obdrží" bez jakéhokoli omezení — ' +
        'pro neurčitost k ní nemusí být přihlédnuto a celá povinnost padá.',
    },
    {
      id: 'nda-vyjimky',
      kind: 'recommended',
      requirement:
        'Vymez výjimky: informace veřejně známé, informace známé straně před poskytnutím, ' +
        'informace získané po právu od třetí osoby, informace vyvinuté nezávisle ' +
        'a případy, kdy sdělení ukládá zákon nebo orgán veřejné moci.',
      consequence: 'riziko',
      law: 'Smluvní praxe; § 553 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí výjimka pro sdělení vyžadované zákonem — strana se pak dostává do ' +
        'neřešitelného rozporu mezi smlouvou a zákonnou povinností.',
    },
    {
      id: 'nda-ucel',
      kind: 'recommended',
      label: 'povinnost mlčenlivosti a účel',
      requirement:
        'Uveď účel, pro který se informace poskytují, a zákaz jejich užití k jinému účelu. ' +
        'Bez vymezení účelu nelze posoudit, zda došlo k porušení.',
      consequence: 'riziko',
      law: '§ 1730 odst. 2 zák. č. 89/2012 Sb.',
      detect: /mlčenlivost|účel/i,
      detectSample: 'Povinnost mlčenlivosti se sjednává pro účel spolupráce',
      reviewCheck: 'Chybí vymezení účelu — povinnost mlčenlivosti pak nemá měřítko.',
    },

    // ─── Doba ────────────────────────────────────────────────────────────────
    {
      id: 'nda-doba-trvani',
      kind: 'recommended',
      requirement:
        'Uveď dobu trvání povinnosti mlčenlivosti a zda přetrvává po skončení spolupráce. ' +
        'Časově neomezená povinnost je u běžných obchodních informací obtížně obhajitelná ' +
        'a může narazit na dobré mravy; u obchodního tajemství je namístě vázat ji na ' +
        'trvání jeho zákonných znaků.',
      consequence: 'riziko',
      law: '§ 504 a § 580 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Mlčenlivost „na dobu neurčitou" nebo „navždy" bez vazby na povahu informace — ' +
        'u nepodstatných informací je nepřiměřená.',
    },

    // ─── Obchodní tajemství ──────────────────────────────────────────────────
    {
      id: 'nda-obchodni-tajemstvi',
      kind: 'default',
      requirement:
        'Obchodní tajemství je chráněno přímo zákonem, splňuje-li znaky § 504 — ' +
        'konkurenčně významné, určitelné, ocenitelné, běžně nedostupné a odpovídajícím ' +
        'způsobem utajované. Jeho porušení je zároveň nekalou soutěží.',
      consequence: 'doporuceni',
      law: '§ 504, § 2976 a § 2985 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Smlouva označuje vše za obchodní tajemství — označení samo o sobě znaky ' +
        '§ 504 nezaloží. Zároveň platí, že bez „odpovídajícího utajování" ochrana zaniká.',
    },

    // ─── Sankce ──────────────────────────────────────────────────────────────
    {
      id: 'nda-smluvni-pokuta',
      kind: 'default',
      requirement:
        'Smluvní pokuta musí být ujednána určitě — za jaké konkrétní porušení a v jaké výši. ' +
        'Nepřiměřeně vysokou pokutu může soud snížit. Chceš-li vedle pokuty i náhradu škody, ' +
        'musí to být výslovně ujednáno.',
      consequence: 'riziko',
      law: '§ 2048–2051 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Pokuta navázaná na „jakékoli porušení této smlouvy" bez rozlišení závažnosti; ' +
        'chybí ujednání o souběhu s náhradou škody — bez něj se náhrada nad rámec pokuty ' +
        'nepřiznává.',
    },
    {
      id: 'nda-nahrada-skody',
      kind: 'prohibited',
      requirement:
        'Náhradu újmy způsobené úmyslně nebo z hrubé nedbalosti nelze předem vyloučit ' +
        'ani omezit; vůči slabší straně nelze předem omezit náhradu jakékoli újmy.',
      consequence: 'neprihlizi-se',
      law: '§ 2898 zák. č. 89/2012 Sb.',
      reviewCheck: 'Limitace odpovědnosti pevnou částkou bez výhrady pro úmysl a hrubou nedbalost.',
    },

    // ─── Rozsah osob ─────────────────────────────────────────────────────────
    {
      id: 'nda-treti-osoby',
      kind: 'recommended',
      requirement:
        'Uprav, komu smí strana informace zpřístupnit (zaměstnanci, poradci, subdodavatelé) ' +
        'a že za jejich porušení odpovídá jako za vlastní.',
      consequence: 'riziko',
      law: 'Smluvní praxe; § 1769 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Absolutní zákaz zpřístupnění komukoli — znemožňuje běžný provoz a v praxi ' +
        'se poruší hned první den.',
    },
    {
      id: 'nda-vraceni-informaci',
      kind: 'recommended',
      requirement:
        'Uprav povinnost vrátit nebo zničit nosiče informací po skončení spolupráce ' +
        'a lhůtu k jejímu splnění. Zohledni zákonné archivační povinnosti.',
      consequence: 'doporuceni',
      law: 'Smluvní praxe',
      reviewCheck: 'Chybí režim vrácení či likvidace podkladů.',
    },

    // ─── Hranice vůči pracovnímu právu ───────────────────────────────────────
    {
      id: 'nda-hranice-konkurencni-dolozka',
      kind: 'prohibited',
      requirement:
        'Je-li zavázanou stranou zaměstnanec, nesmí NDA fakticky nahrazovat konkurenční ' +
        'doložku. Omezení výdělečné činnosti po skončení pracovního poměru je platné jen ' +
        'za podmínek § 310 zákoníku práce — nejvýše jeden rok a za peněžité vyrovnání.',
      consequence: 'neplatnost',
      law: '§ 310 zák. č. 262/2006 Sb.',
      appliesWhen: 'Zavázanou stranou je zaměstnanec.',
      reviewCheck:
        'NDA se zaměstnancem, které mu zakazuje pracovat pro konkurenci — bez peněžitého ' +
        'vyrovnání je v této části neplatné, ať je nazváno jakkoli.',
    },

    // ─── Osobní údaje ────────────────────────────────────────────────────────
    {
      id: 'nda-osobni-udaje',
      kind: 'mandatory',
      requirement:
        'Zahrnují-li důvěrné informace osobní údaje, NDA nenahrazuje zpracovatelskou ' +
        'smlouvu podle čl. 28 GDPR. Ta musí být uzavřena samostatně.',
      consequence: 'riziko',
      law: 'čl. 28 nařízení (EU) 2016/679; zák. č. 110/2019 Sb.',
      appliesWhen: 'Předmětem sdílení jsou osobní údaje.',
      reviewCheck:
        'Smlouva řeší osobní údaje pouhou doložkou o mlčenlivosti — chybí zpracovatelská ' +
        'smlouva se všemi náležitostmi čl. 28 odst. 3 GDPR.',
    },

    // ─── Vzájemnost a spory ──────────────────────────────────────────────────
    {
      id: 'nda-vzajemnost',
      kind: 'recommended',
      requirement:
        'Uveď, zda je mlčenlivost jednostranná nebo vzájemná. U jednostranné NDA ' +
        'zkontroluj, zda je nerovnováha odůvodněná povahou spolupráce.',
      consequence: 'riziko',
      law: 'Smluvní praxe',
      reviewCheck:
        'Jednostranná povinnost tam, kde si informace fakticky vyměňují obě strany.',
    },
  ],
}
