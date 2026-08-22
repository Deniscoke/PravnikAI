/**
 * Smlouva o dílo — § 2586 a násl. zák. č. 89/2012 Sb.
 *
 * The distinguishing feature is a *result*, not activity: the contractor owes a
 * finished work, and is paid only once it is handed over. What trips most
 * templates up is the price — the obligation to pay is essential, but the amount
 * is not, so a contract with no figure is still valid and the customary price
 * applies. Templates that treat a missing price as fatal give wrong advice.
 */

import type { ContractLegalProfile } from '../types'

export const SERVICES_PROFILE: ContractLegalProfile = {
  family: 'services',
  label: 'Smlouva o dílo',
  primaryLaw: '§ 2586–2635 zák. č. 89/2012 Sb. (občanský zákoník)',
  characterisation:
    'Zhotovitel se zavazuje provést na svůj náklad a nebezpečí dílo, objednatel se ' +
    'zavazuje dílo převzít a zaplatit cenu.',
  lastVerified: '2026-08-21',
  sources: [
    'https://www.zakonyprolidi.cz/cs/2012-89 (§ 2586 a násl.)',
    'https://obcanskyzakonik.justice.cz/index.php/smluvni-pravo/konkretni-zmeny-ve-zvlastni-casti/smlouva-o-dilo',
  ],
  rules: [
    // ─── Podstatné náležitosti ───────────────────────────────────────────────
    {
      id: 'services-vymezeni-dila',
      kind: 'essential',
      label: 'předmět díla',
      requirement:
        'Dílo musí být vymezeno určitě — co má být zhotoveno, opraveno, upraveno nebo ' +
        'udržováno, v jakém rozsahu a jaké kvalitě. U stavby odkaž na projektovou ' +
        'dokumentaci nebo specifikaci a učiň ji přílohou smlouvy.',
      consequence: 'nevznikne',
      law: '§ 2586 odst. 1 a § 553 zák. č. 89/2012 Sb.',
      detect: /předmět\S*\s+díla|dílem\s+se\s+rozumí|specifikac\S*\s+díla/i,
      reviewCheck:
        'Dílo popsané obecně („rekonstrukce koupelny") bez rozsahu prací, materiálů ' +
        'a kvalitativních parametrů — nejčastější příčina sporů u stavebních zakázek.',
    },
    {
      id: 'services-uplatnost',
      kind: 'essential',
      label: 'cena díla',
      requirement:
        'Podstatnou náležitostí je úplatnost — nikoli však konkrétní výše ceny. ' +
        'Cenu lze určit pevnou částkou, odkazem na rozpočet, nebo odhadem. ' +
        'Není-li ujednána vůbec, platí cena obvyklá za srovnatelné dílo.',
      consequence: 'nevznikne',
      law: '§ 2586 odst. 2 a § 2610 zák. č. 89/2012 Sb.',
      detect: /cen\S*|úplat\S*|odměn\S*/i,
      reviewCheck:
        'Nehlas chybějící číselnou cenu jako důvod neplatnosti — smlouva je platná ' +
        'a uplatní se cena obvyklá. Skutečným rizikem je spor o její výši.',
    },

    // ─── Cena a rozpočet ─────────────────────────────────────────────────────
    {
      id: 'services-rozpocet',
      kind: 'default',
      requirement:
        'Je-li cena určena podle rozpočtu, uveď, zda jde o rozpočet závazný (úplný ' +
        'a zaručený), nezaručený, nebo neúplný — na tom závisí, zda a jak lze cenu zvýšit.',
      consequence: 'riziko',
      law: '§ 2612–2614 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Odkaz na rozpočet bez určení jeho povahy; ujednání umožňující zhotoviteli ' +
        'zvyšovat cenu jednostranně bez souhlasu objednatele.',
    },
    {
      id: 'services-vicepráce',
      kind: 'recommended',
      requirement:
        'Uprav postup u víceprací: písemný soupis, odsouhlasení objednatelem před ' +
        'provedením a dopad na cenu i termín. Bez toho vznikají nejčastější spory.',
      consequence: 'riziko',
      law: '§ 2594 a § 2612 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí režim víceprací a změn díla.',
    },
    {
      id: 'services-splatnost',
      kind: 'default',
      requirement:
        'Cena je splatná provedením díla, není-li ujednáno jinak. Zálohy, dílčí ' +
        'fakturace nebo zádržné je třeba sjednat výslovně.',
      consequence: 'doporuceni',
      law: '§ 2610 odst. 1 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí platební kalendář u díla trvajícího déle než několik týdnů.',
    },

    // ─── Provedení, termín, součinnost ───────────────────────────────────────
    {
      id: 'services-termin',
      kind: 'recommended',
      label: 'termín zhotovení',
      requirement:
        'Uveď termín provedení a předání díla. Není-li ujednán, je zhotovitel povinen ' +
        'dílo provést v době přiměřené jeho povaze.',
      consequence: 'riziko',
      law: '§ 2610 odst. 2 zák. č. 89/2012 Sb.',
      detect: /termín\S*|lhůt\S*/i,
      reviewCheck:
        'Chybí termín, nebo je vázán na neurčitou událost bez pevného data.',
    },
    {
      id: 'services-soucinnost',
      kind: 'recommended',
      requirement:
        'Vymez součinnost objednatele — přístup na staveniště, dodání podkladů, ' +
        'rozhodnutí, stavební povolení — a důsledek jejího neposkytnutí na termín a cenu.',
      consequence: 'riziko',
      law: '§ 2591 zák. č. 89/2012 Sb.',
      reviewCheck: 'Chybí ujednání o součinnosti — zhotovitel pak nese riziko cizího prodlení.',
    },
    {
      id: 'services-pokyny',
      kind: 'default',
      requirement:
        'Zhotovitel postupuje samostatně; pokyny objednatele je vázán jen tehdy, byly-li ' +
        'ujednány. Je povinen upozornit na nevhodnou povahu pokynů nebo věcí od objednatele, ' +
        'jinak odpovídá za vady z toho vzniklé.',
      consequence: 'riziko',
      law: '§ 2592 a § 2594 zák. č. 89/2012 Sb.',
    },

    // ─── Předání a převzetí ──────────────────────────────────────────────────
    {
      id: 'services-predani',
      kind: 'recommended',
      requirement:
        'Dílo je provedeno dokončením a předáním. Sjednej předávací protokol a postup ' +
        'při převzetí s výhradami. Objednatel nemá právo odmítnout převzetí pro ojedinělé ' +
        'drobné vady, které nebrání užívání.',
      consequence: 'riziko',
      law: '§ 2604–2609 a § 2628 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Chybí předávací protokol; ujednání umožňující objednateli odmítnout převzetí ' +
        'pro jakoukoli vadu — u stavby to odporuje § 2628.',
    },
    {
      id: 'services-vlastnictvi-nebezpeci',
      kind: 'default',
      requirement:
        'Uprav, komu patří zpracovávaná věc a kdy přechází nebezpečí škody na díle. ' +
        'Zpravidla přechází převzetím.',
      consequence: 'doporuceni',
      law: '§ 2599–2603 zák. č. 89/2012 Sb.',
    },

    // ─── Vady ────────────────────────────────────────────────────────────────
    {
      id: 'services-vady-obecne',
      kind: 'default',
      label: 'odpovědnost za vady díla',
      requirement:
        'Dílo má vadu, neodpovídá-li smlouvě. Objednatel musí vadu vytknout bez zbytečného ' +
        'odkladu; zjevné vady při převzetí, jinak právo z vady soud nepřizná, namítne-li ' +
        'zhotovitel opožděné vytknutí.',
      consequence: 'riziko',
      law: '§ 2615–2619 zák. č. 89/2012 Sb.',
      detect: /vad\S*/i,
    },
    {
      id: 'services-vady-stavba',
      kind: 'default',
      requirement:
        'U stavby může objednatel oznámit skrytou vadu do pěti let od převzetí. ' +
        'Zhotovitel se odpovědnosti zprostí jen prokázáním, že vadu způsobila ' +
        'nevhodná věc nebo pokyn objednatele, na které marně upozornil.',
      consequence: 'doporuceni',
      law: '§ 2629 a § 2630 zák. č. 89/2012 Sb.',
      appliesWhen: 'Předmětem díla je stavba.',
      reviewCheck:
        'Ujednání zkracující pětiletou lhůtu u stavby, nebo vylučující odpovědnost ' +
        'zhotovitele za skryté vady.',
    },
    {
      id: 'services-zaruka',
      kind: 'recommended',
      requirement:
        'Záruka za jakost je dobrovolná a musí být sjednána výslovně s uvedením délky. ' +
        'Nezaměňuj ji s odpovědností za vady, která plyne přímo ze zákona.',
      consequence: 'doporuceni',
      law: '§ 2113–2117 a § 2619 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Text zaměňuje záruku a odpovědnost za vady, nebo tvrdí, že „záruka je ze zákona ' +
        '24 měsíců" — to platí pro spotřebitelský prodej zboží, nikoli obecně pro dílo.',
    },
    {
      id: 'services-spotrebitel',
      kind: 'mandatory',
      requirement:
        'Je-li objednatel spotřebitel a zhotovitel podnikatel, použijí se přiměřeně ' +
        'ustanovení o právech z vadného plnění při spotřebitelském prodeji a spotřebitelská ' +
        'práva nelze zkrátit.',
      consequence: 'neprihlizi-se',
      law: '§ 2615 odst. 2 a § 2161 a násl. zák. č. 89/2012 Sb.',
      appliesWhen: 'Objednatel je spotřebitel a zhotovitel podnikatel.',
      reviewCheck: 'Ujednání omezující reklamační práva spotřebitele u díla na zakázku.',
    },

    // ─── Ukončení ────────────────────────────────────────────────────────────
    {
      id: 'services-odstoupeni',
      kind: 'default',
      requirement:
        'Objednatel může do dokončení díla kdykoli odstoupit; musí však zhotoviteli ' +
        'zaplatit částku odpovídající jeho dosavadním nákladům a ušlému zisku.',
      consequence: 'doporuceni',
      law: '§ 2533 a § 2635 zák. č. 89/2012 Sb.',
      reviewCheck:
        'Ujednání upírající objednateli právo odstoupit, nebo naopak umožňující ' +
        'odstoupení bez jakéhokoli vypořádání nákladů zhotovitele.',
    },
  ],
}
