import type { ContractGuide } from './types'

export const ODSTOUPENI_OD_SMLOUVY: ContractGuide = {
  slug: 'odstoupeni-od-smlouvy',
  generatorHint: 'Odstoupení od smlouvy',
  metaTitle: 'Odstoupení od smlouvy — vzor a náležitosti podle § 2001 a násl. NOZ',
  metaDescription:
    'Kdy lze od smlouvy odstoupit, proč se závazek ruší od počátku a čím se odstoupení liší od výpovědi. Podstatné i nepodstatné porušení a 14 dnů spotřebitele.',
  h1: 'Odstoupení od smlouvy',
  perex:
    'Odstoupení a výpověď se pletou nejčastěji ze všech právních jednání — a rozdíl mezi nimi rozhoduje o tom, kdo komu co vrátí. Odstoupením se závazek ruší OD POČÁTKU a strany si vrátí, co si už plnily. Výpověď působí do budoucna a minulosti se nedotýká. Odstoupit navíc nelze kdykoli: musí pro to existovat důvod ujednaný ve smlouvě nebo stanovený zákonem.',
  legalBasis: '§ 2001–2005 a § 1829 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení smlouvy, od které odstupujete',
      body:
        'Typ smlouvy, datum uzavření, smluvní strany a předmět — případně číslo objednávky. Bez toho není zřejmé, co se ruší.',
      law: '§ 553 NOZ',
    },
    {
      title: 'Důvod odstoupení a skutečnosti, které jej naplňují',
      body:
        'Odstoupit lze jen tehdy, ujednaly-li si to strany, nebo stanoví-li tak zákon. Uveďte, o který důvod jde — odkaz na ujednání ve smlouvě nebo na zákonné ustanovení — a popište, co se stalo. Právní kvalifikace bez skutkového popisu nestačí.',
      law: '§ 2001 NOZ',
    },
    {
      title: 'Výslovné prohlášení, že od smlouvy odstupujete',
      body:
        'Formulace musí být jednoznačná. „Nejsem spokojen a žádám nápravu" není odstoupení — je to výzva k plnění, která žádný závazek neruší.',
    },
    {
      title: 'Vypořádání vzájemných plnění',
      body:
        'Uveďte, co a v jaké lhůtě má být vráceno, a číslo účtu pro vrácení peněz. Bez toho zůstává vypořádání otevřené a spor pokračuje.',
      law: '§ 2004 a § 2993 NOZ',
    },
    {
      title: 'Co odstoupením nezaniká',
      body:
        'Odstoupení se nedotýká práva na smluvní pokutu, úrok z prodlení ani náhradu škody vzniklé porušením smlouvy. Nedotýká se ani ujednání o řešení sporů a dalších ujednání, která mají zavazovat i po zániku závazku.',
      law: '§ 2005 odst. 2 NOZ',
    },
    {
      title: 'Datum, způsob doručení a podpis',
      body:
        'Odstoupení je jednostranné právní jednání a působí až dojitím druhé straně. Podepisuje je jen odstupující strana.',
      law: '§ 570 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Odstoupení, které se chová jako výpověď',
      body:
        'Dokument nadepsaný „odstoupení", který ale mluví o výpovědní době a o zániku smlouvy ke dni doručení. Odstoupením se závazek ruší od počátku — žádná výpovědní doba neběží. Takový text nevyvolá účinky, které si pisatel představoval.',
      law: '§ 2004 odst. 1 NOZ',
    },
    {
      title: 'Odstoupení bez uvedení důvodu',
      body:
        'Na rozdíl od výpovědi u nájmu na dobu neurčitou nelze odstoupit „jen tak". Bez důvodu ujednaného ve smlouvě nebo stanoveného zákonem nemá odstoupení účinky. Výjimkou je čtrnáctidenní právo spotřebitele.',
      law: '§ 2001 NOZ',
    },
    {
      title: 'Nepodstatné porušení bez předchozí výzvy',
      body:
        'Nejčastější důvod, proč odstoupení neobstojí. Při nepodstatném porušení lze odstoupit až poté, co druhá strana nesplní ani v dodatečné přiměřené lhůtě, kterou jste jí výslovně poskytli. Tu výzvu je třeba mít a umět prokázat.',
      law: '§ 1978 a § 2003 NOZ',
    },
    {
      title: 'Zdlouhavé rozmýšlení u podstatného porušení',
      body:
        'Při podstatném porušení je třeba odstoupit bez zbytečného odkladu poté, co jste se o porušení dozvěděli. Odstoupení podané se značným odstupem se zpochybňuje snadno.',
      law: '§ 2002 NOZ',
    },
    {
      title: 'Záměna čtrnáctidenního práva spotřebitele s obecným odstoupením',
      body:
        'Čtrnáctidenní odstoupení bez udání důvodu podle § 1829 je samostatné právo a existuje jen u smluv uzavřených distančním způsobem nebo mimo obchodní prostory. U nákupu v kamenné prodejně nevzniká — a naopak, u nákupu na dálku po spotřebiteli nikdo důvod vyžadovat nesmí.',
      law: '§ 1829 NOZ',
    },
    {
      title: 'Odstoupení tam, kde plnění nelze vrátit',
      body:
        'U trvajících závazků, kde už bylo plněno a vrátit to nelze — například u nájmu za uplynulé měsíce — bývá namístě výpověď. Odstoupení míří na zrušení od počátku a tam, kde je nelze provést, naráží.',
      law: '§ 2004 NOZ',
    },
  ],

  faq: [
    {
      question: 'Jaký je rozdíl mezi odstoupením a výpovědí?',
      answer:
        'Odstoupením se závazek ruší od počátku — strany si vrátí, co si plnily. Výpověď ukončuje smlouvu do budoucna a plnění z minulosti se nedotýká. Odstoupení vyžaduje důvod, výpověď u smlouvy na dobu neurčitou zpravidla ne.',
    },
    {
      question: 'Můžu od smlouvy odstoupit bez důvodu?',
      answer:
        'Jen tehdy, dovoluje-li to smlouva, nebo jde-li o čtrnáctidenní právo spotřebitele u nákupu na dálku či mimo obchodní prostory. Obecné odstoupení podle § 2001 důvod vyžaduje vždy.',
    },
    {
      question: 'Co je podstatné porušení smlouvy?',
      answer:
        'Takové, o němž porušující strana už při uzavření smlouvy věděla nebo musela vědět, že by druhá strana smlouvu neuzavřela, kdyby je předvídala. Při podstatném porušení lze odstoupit bez zbytečného odkladu, bez předchozí výzvy.',
    },
    {
      question: 'Musím před odstoupením poskytnout dodatečnou lhůtu?',
      answer:
        'U nepodstatného porušení ano — odstoupit lze až poté, co druhá strana nesplní ani v dodatečné přiměřené lhůtě. U podstatného porušení výzva nutná není.',
    },
    {
      question: 'Zanikne odstoupením i smluvní pokuta?',
      answer:
        'Ne. Odstoupení se nedotýká práva na smluvní pokutu, úrok z prodlení ani náhradu škody vzniklé porušením smlouvy, ani ujednání o řešení sporů.',
    },
    {
      question: 'Odkdy je odstoupení účinné?',
      answer:
        'Ode dne, kdy dojde druhé straně. Odeslání nestačí, proto volte doručení, které umíte prokázat.',
    },
  ],
}
