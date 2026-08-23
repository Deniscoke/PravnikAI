import type { ContractGuide } from './types'

export const UZNANI_DLUHU: ContractGuide = {
  slug: 'uznani-dluhu',
  generatorHint: 'Uznání dluhu',
  metaTitle: 'Uznání dluhu — vzor, deset let promlčení a co podpis způsobí',
  metaDescription:
    'Co uznání dluhu opravdu dělá: obrací důkazní břemeno, prodlužuje promlčení na deset let a u promlčeného dluhu nárok obnoví. Náležitosti podle § 2053.',
  h1: 'Uznání dluhu',
  perex:
    'Krátká listina s velkými následky — a jako jediný dokument tady ji zpravidla podepisuje ten, komu uškodí. Uznáním vzniká domněnka, že dluh trvá, takže po podpisu musí jeho neexistenci prokazovat dlužník, ne věřitel. Promlčecí lhůta se prodlužuje ze tří let na deset. A uzná-li někdo dluh, který už byl promlčený, nárok se obnoví — vrátí věřiteli pohledávku, kterou už nemohl vymoci. Proto je první krok vždy stejný: ověřit promlčení, teprve pak číst text.',
  legalBasis: '§ 2053 a § 2054 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Písemná forma',
      body:
        'Uznání dluhu vyžaduje písemnou formu. Ústní uznání ani potvrzení po telefonu domněnku podle § 2053 nezaloží a desetiletá lhůta z něj neběží.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Důvod dluhu',
      body:
        'Z čeho dluh vznikl — smlouva nebo faktura, datum, předmět plnění. Zákon žádá uznání „co do důvodu i výše"; samotné „uznávám, že dlužím" nestačí.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Výše dluhu, jistina odděleně',
      body:
        'Částka v korunách, s jistinou uvedenou zvlášť od úroků a nákladů. Domněnka působí jen v tom rozsahu, v jakém byl dluh uznán — co uznáno není, se jí netýká.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Výslovné prohlášení o uznání',
      body:
        'Text musí obsahovat, že dlužník dluh uznává. Popis dluhu, byť podrobný, uznáním sám o sobě není.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Doba splnění',
      body:
        'Do kdy bude dluh uhrazen. Má dvojí význam: věřitel ví, odkdy může vymáhat, a desetiletá lhůta pak běží až od posledního dne této doby — tedy déle, než by běžela bez ní.',
      law: '§ 639 NOZ',
    },
    {
      title: 'Podpis dlužníka a datum',
      body:
        'Podepisuje pouze dlužník. Je to jeho prohlášení, nikoli dohoda — objeví-li se v textu „strany se dohodly" nebo podpis věřitele, jde o jiný dokument s jiným režimem.',
      law: '§ 2053 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Podpis bez ověření promlčení',
      body:
        'Nejzávažnější chyba, jakou dlužník může udělat. Uzná-li dluh, který je už promlčený, nárok se obnoví a začne běžet nová lhůta. Věřitel tím zdarma získá zpět pohledávku, kterou u soudu nemohl uplatnit. Obecná promlčecí lhůta činí tři roky — spočítejte ji od splatnosti dřív, než cokoli podepíšete.',
      law: '§ 653 odst. 1 a § 629 NOZ',
    },
    {
      title: 'Podcenění obráceného důkazního břemene',
      body:
        'Před uznáním musí existenci dluhu prokázat věřitel. Po uznání platí domněnka, že dluh v uznaném rozsahu trvá, a prokázat opak musí dlužník. Je to nejpraktičtější dopad celé listiny.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Představa, že uznání nelze vyvrátit',
      body:
        'Domněnka je vyvratitelná. Dlužník může prokázat, že dluh nevznikl, zanikl nebo je nižší. Text, který tvrdí opak nebo který dlužníka nechává „vzdát se námitek", jde nad rámec toho, co § 2053 zakládá.',
      law: '§ 2053 NOZ',
    },
    {
      title: 'Počítání se třemi lety i po uznání',
      body:
        'Po uznání je promlčecí lhůta desetiletá. Je-li v uznání uvedena i doba splnění, běží deset let až od jejího posledního dne — celková doba vymahatelnosti tak může být výrazně delší.',
      law: '§ 639 NOZ',
    },
    {
      title: 'Neúmyslné uznání zaplacením části dluhu',
      body:
        'Placení úroků se považuje za uznání dluhu ohledně částky, z níž se platí, a částečná úhrada může mít účinky uznání zbytku. U již promlčené pohledávky to však neplatí — tam částečné plnění nárok neobnoví.',
      law: '§ 2054 NOZ',
    },
    {
      title: 'Ztráta výhody splátek v jednostranném uznání',
      body:
        'Právo věřitele žádat celý dluh při nesplnění jedné splátky vzniká jen tehdy, ujednaly-li si to strany — a věřitel je musí uplatnit nejpozději do splatnosti nejbližší příští splátky. V jednostranném uznání taková klauzule nepůsobí; patří do dohody o splátkách.',
      law: '§ 1931 NOZ',
    },
    {
      title: 'Zapomenuté vrácení listiny po zaplacení',
      body:
        'Po splnění musí věřitel dlužní úpis vrátit nebo na něm vyznačit částečné plnění. Jinak zůstane v oběhu listina, která dluh presumuje, i když už byl uhrazen.',
      law: '§ 1952 NOZ',
    },
  ],

  faq: [
    {
      question: 'Co uznání dluhu vlastně způsobí?',
      answer:
        'Vzniká vyvratitelná domněnka, že dluh v uznaném rozsahu v době uznání trvá. Prakticky to znamená, že jeho neexistenci musí od té chvíle prokazovat dlužník, nikoli věřitel.',
    },
    {
      question: 'Jak dlouho se dluh promlčuje po uznání?',
      answer:
        'Deset let ode dne uznání. Je-li v uznání uvedena i doba, do které dlužník splní, promlčí se právo za deset let od posledního dne této doby.',
    },
    {
      question: 'Můžu uznat dluh, který je už promlčený?',
      answer:
        'Můžete, ale je to zpravidla to nejhorší, co lze udělat. Uznáním se promlčený nárok obnoví a začne běžet nová promlčecí lhůta. Před podpisem si vždy ověřte, zda lhůta neuplynula.',
    },
    {
      question: 'Musí být uznání písemné?',
      answer:
        'Ano. § 2053 vyžaduje prohlášení učiněné v písemné formě. Ústní uznání domněnku nezaloží.',
    },
    {
      question: 'Stačí napsat, že dlužím, bez uvedení částky?',
      answer:
        'Nestačí. Zákon žádá uznání co do důvodu i výše. Bez obojího domněnka nevznikne a listina svůj účel nesplní.',
    },
    {
      question: 'Uznal jsem dluh. Můžu se ještě bránit?',
      answer:
        'Ano — domněnka je vyvratitelná. Můžete prokazovat, že dluh nevznikl, že zanikl nebo že je nižší než uznaná částka. Důkazní břemeno ale nesete vy.',
    },
    {
      question: 'Je částečná úhrada uznáním dluhu?',
      answer:
        'Může být. Placení úroků se považuje za uznání částky, z níž se platí, a částečné plnění může mít účinky uznání zbytku, lze-li to z okolností usoudit. U promlčené pohledávky to neplatí.',
    },
    {
      question: 'Podepisuje uznání i věřitel?',
      answer:
        'Ne. Je to jednostranné prohlášení dlužníka. Podpis věřitele naznačuje, že jde ve skutečnosti o dohodu — například o uznání dluhu se splátkovým kalendářem, což je jiný dokument.',
    },
  ],
}
