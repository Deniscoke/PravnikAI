import type { ContractGuide } from './types'

export const SMLOUVA_O_SMLOUVE_BUDOUCI: ContractGuide = {
  slug: 'smlouva-o-smlouve-budouci',
  generatorHint: 'Smlouva o smlouvě budoucí',
  metaTitle: 'Smlouva o smlouvě budoucí — vzor, lhůta a § 1785 a násl.',
  metaDescription:
    'Nevyzvete-li druhou stranu včas, závazek zanikne sám — bez porušení a bez náhrady. Co musí obsahovat a proč vágní znění celý dokument vyprázdní.',
  h1: 'Smlouva o smlouvě budoucí',
  perex:
    'Nejčastěji nezanikne sporem, ale mlčením. Nevyzve-li oprávněná strana druhou stranu k uzavření budoucí smlouvy včas, povinnost ji uzavřít prostě zanikne — nejde o porušení, není co vytýkat a není za co žádat náhradu. Lhůta je ta, kterou si strany ujednaly; neujednaly-li žádnou, je roční. Druhá věc, na které to stojí: soud může obsah budoucí smlouvy určit sám, ale jen z toho, co jste do ní napsali. Vágní znění tedy dokument nezpružní, nýbrž vyprázdní.',
  legalBasis: '§ 1785–1788 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Obsah budoucí smlouvy alespoň obecným způsobem',
      body:
        'Kdo, co, za kolik a za jakých podstatných podmínek. Není to formalita: podle § 1787 může obsah budoucí smlouvy určit soud, ale vychází přitom z toho, co strany ujednaly, z účelu smlouvy a z jejich návrhů.',
      law: '§ 1785 NOZ',
    },
    {
      title: 'Jednoznačné označení předmětu',
      body:
        'U nemovitosti údaje z katastru — číslo jednotky nebo parcely, katastrální území a list vlastnictví. U jednotky nezapomeňte na podíl na společných částech.',
    },
    {
      title: 'Cena nebo způsob jejího určení',
      body:
        'Pevná částka, nebo mechanismus výpočtu — například znalecký posudek k určitému dni. Bez ceny ani mechanismu nemá soud podle čeho obsah budoucí smlouvy určit.',
      law: '§ 1787 odst. 2 NOZ',
    },
    {
      title: 'Lhůta pro výzvu k uzavření',
      body:
        'Do kdy musí oprávněná strana druhou stranu vyzvat. Neujednáte-li ji, platí jeden rok — a jejím marným uplynutím závazek zaniká.',
      law: '§ 1785 a § 1788 odst. 1 NOZ',
    },
    {
      title: 'Lhůta k uzavření po výzvě a způsob doručení',
      body:
        'Zákon říká „bez zbytečného odkladu", což si každá strana vykládá jinak. Konkrétní počet dnů a prokazatelný způsob doručení výzvy spor předchází.',
      law: '§ 1786 NOZ',
    },
    {
      title: 'Osud zálohy a změna okolností',
      body:
        'Co se stane se zálohou, nedojde-li k uzavření — a rozlišeno podle toho, na čí straně důvod leží. K tomu ujednání o změně okolností a o povinnosti zavázané strany oznámit ji bez zbytečného odkladu.',
      law: '§ 1788 odst. 2 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Čekání, až se ozve druhá strana',
      body:
        'Nejčastější konec těchto smluv. Obě strany předpokládají, že závazek trvá, dokud jej někdo nevypoví — mezitím uplyne lhůta pro výzvu a povinnost uzavřít budoucí smlouvu zanikne sama.',
      law: '§ 1788 odst. 1 NOZ',
    },
    {
      title: 'Znění typu „strany se dohodly, že spolu uzavřou kupní smlouvu"',
      body:
        'Bez předmětu, ceny a podmínek nemá soud z čeho obsah budoucí smlouvy určit. Právo podle § 1787 pak existuje jen na papíře a zbývá nanejvýš spor o zálohu.',
      law: '§ 1785 NOZ',
    },
    {
      title: 'Přesvědčení, že jediným následkem je smluvní pokuta',
      body:
        'Nesplní-li zavázaná strana povinnost, může oprávněná strana žádat, aby obsah budoucí smlouvy určil soud nebo osoba ve smlouvě určená. Smlouva pak vznikne i bez součinnosti druhé strany — to je hlavní důvod, proč se tento dokument uzavírá.',
      law: '§ 1787 NOZ',
    },
    {
      title: 'Neošetřená změna okolností',
      body:
        'Změní-li se poměry natolik, že po zavázané straně nelze rozumně požadovat uzavření, povinnost zanikne. Zavázaná strana to však musí oznámit bez zbytečného odkladu — jinak nahradí škodu. Bez tohoto ujednání se druhá strana dozví o konci pozdě.',
      law: '§ 1788 odst. 2 NOZ',
    },
    {
      title: 'Záloha bez ujednání, co se s ní stane',
      body:
        'Nedojde-li k uzavření, vzniká spor pokaždé. Ošetřete zvlášť případ, kdy důvod leží na straně budoucího prodávajícího, a zvlášť ten, kdy leží na straně kupujícího.',
    },
    {
      title: 'Smluvní pokuta bez ujednání o náhradě škody',
      body:
        'Bez výslovného ujednání nelze vedle smluvní pokuty požadovat náhradu škody. Přesahuje-li skutečná škoda výši pokuty, rozdíl je nevymahatelný.',
      law: '§ 2050 NOZ',
    },
    {
      title: 'Domněnka, že chybějící písemná forma činí smlouvu neplatnou',
      body:
        'Písemnou formu vyžaduje jednání, kterým se věcné právo k nemovitosti zřizuje nebo převádí — smlouva o smlouvě budoucí takové jednání není. Písemně ji přesto sepište: bez textu nemá soud podle čeho obsah budoucí smlouvy určit.',
      law: '§ 560 NOZ',
    },
    {
      title: 'Podcenění ověření podpisů u nemovitosti',
      body:
        'Nejsou-li podpisy na listině pro katastr úředně ověřeny, musí navrhovatel prokázat jejich pravost do 30 dnů od podání návrhu na vklad. Neprokáže-li ji, katastrální úřad řízení zastaví.',
      law: '§ 7 odst. 2 zák. č. 256/2013 Sb.',
    },
  ],

  faq: [
    {
      question: 'Do kdy musím druhou stranu vyzvat k uzavření smlouvy?',
      answer:
        'Ve lhůtě, kterou jste si ujednali. Neujednali-li jste žádnou, do jednoho roku. Po marném uplynutí povinnost uzavřít budoucí smlouvu zaniká.',
    },
    {
      question: 'Co se stane, když druhá strana odmítne smlouvu uzavřít?',
      answer:
        'Můžete žádat, aby obsah budoucí smlouvy určil soud nebo osoba určená ve smlouvě. Soud vychází z účelu smlouvy, z návrhů stran a z toho, aby práva a povinnosti byly poctivě uspořádány.',
    },
    {
      question: 'Jak podrobná musí smlouva být?',
      answer:
        'Obsah budoucí smlouvy stačí ujednat alespoň obecným způsobem. Prakticky ale platí, že čím konkrétnější je, tím snadněji ji lze vymoci — soud nemůže doplnit to, co nikde není.',
    },
    {
      question: 'Musí být smlouva o smlouvě budoucí písemná?',
      answer:
        'Zákon to výslovně nevyžaduje, protože smlouva o smlouvě budoucí sama žádné věcné právo nepřevádí. Bez písemného znění však prakticky nelze prokázat, co bylo ujednáno.',
    },
    {
      question: 'Může se zavázat jen jedna strana?',
      answer:
        'Ano. § 1785 mluví o závazku „nejméně jedné strany". Musí to však být ze smlouvy zřejmé.',
    },
    {
      question: 'Kdy povinnost uzavřít smlouvu zanikne kvůli změně okolností?',
      answer:
        'Změní-li se okolnosti, z nichž strany zřejmě vycházely, do té míry, že po zavázané straně nelze rozumně požadovat uzavření. Musí to ale bez zbytečného odkladu oznámit, jinak nahradí vzniklou škodu.',
    },
    {
      question: 'Vrací se záloha, když k uzavření nedojde?',
      answer:
        'Podle toho, co jste si ujednali. Není-li ujednáno nic, řeší se to podle pravidel o bezdůvodném obohacení a spor je pravděpodobný — proto osud zálohy do smlouvy patří.',
    },
    {
      question: 'Můžu vedle smluvní pokuty žádat i náhradu škody?',
      answer:
        'Jen bylo-li to výslovně ujednáno. Bez takového ujednání smluvní pokuta náhradu škody nahrazuje.',
    },
  ],
}
