import type { ContractGuide } from './types'

export const DAROVACI_SMLOUVA: ContractGuide = {
  slug: 'darovaci-smlouva',
  generatorHint: 'Darovací smlouva',
  metaTitle: 'Darovací smlouva — vzor a návrh podle občanského zákoníku',
  metaDescription:
    'Co musí obsahovat darovací smlouva, kdy je nutná písemná forma, jak darovat nemovitost nebo auto a za jakých podmínek lze dar odvolat.',
  h1: 'Darovací smlouva',
  perex:
    'Darování vypadá jako nejjednodušší smlouva vůbec a skrývá dvě věci, které lidé nečekají. Písemná forma není potřeba vždy — ale u nemovitosti a u slibu darování do budoucna ano. A dar není nevratný: dárce jej může odvolat, upadne-li do nouze nebo chová-li se k němu obdarovaný nevděčně.',
  legalBasis: '§ 2055–2078 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení dárce a obdarovaného',
      body:
        'Jméno, datum narození nebo IČO a adresa u obou stran. U darování mezi příbuznými se vyplatí vztah uvést — má vliv na daňové posouzení.',
      law: '§ 2055 NOZ',
    },
    {
      title: 'Přesné určení daru',
      body:
        'U nemovitosti údaje z katastru: obec, katastrální území, číslo parcely nebo jednotky a list vlastnictví. U vozidla VIN, SPZ, značka a rok výroby. U peněz částka a měna.',
      law: '§ 2055 a § 553 NOZ',
    },
    {
      title: 'Výslovná bezplatnost',
      body:
        'Ze smlouvy musí být zřejmé, že se převádí bez protiplnění. Je-li sjednán jakýkoli doplatek nebo protislužba, nejde o darování, ale o jiný smluvní typ.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Přijetí daru',
      body:
        'Darování je dvoustranné právní jednání — obdarovaný musí dar přijmout. Jednostranné prohlášení dárce nestačí.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Popis stavu a známých vad',
      body:
        'Dárce odpovídá za vady jen v rozsahu, v jakém o nich věděl a neupozornil na ně. Popis stavu daru proto chrání obě strany.',
      law: '§ 2065 NOZ',
    },
    {
      title: 'U nemovitosti návrh na vklad',
      body:
        'Uveďte, kdo podá návrh na vklad do katastru a kdo hradí správní poplatek. Podpisy na vkladové listině musí být úředně ověřené a na téže listině.',
      law: '§ 1105 a § 561 odst. 2 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Tvrzení, že dar je neodvolatelný',
      body:
        'Není. Dárce může dar odvolat pro vlastní nouzi nebo pro nevděk obdarovaného a těchto práv se nelze předem vzdát. Formulace o neodvolatelnosti uvádí obě strany v omyl.',
      law: '§ 2068 a § 2072 NOZ',
    },
    {
      title: 'Vlastnictví nemovitosti podpisem smlouvy',
      body:
        'U nemovitosti zapisované do katastru přechází vlastnické právo až vkladem, nikoli podpisem. Smlouva, která tvrdí opak, mate obě strany o okamžiku převodu.',
      law: '§ 1105 NOZ',
    },
    {
      title: 'Darování až po smrti dárce',
      body:
        'Darování závislé na tom, že obdarovaný dárce přežije, se posuzuje jako odkaz a řídí se dědickým právem. Běžnou darovací smlouvou to sepsat nelze.',
      law: '§ 2063 NOZ',
    },
    {
      title: 'Skryté protiplnění',
      body:
        'Závazek obdarovaného postarat se o dárce nebo doplatit rozdíl znamená, že nejde o darování. Chcete-li si zajistit dožití v nemovitosti, řeší se to věcným břemenem, ne podmínkou v daru.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Dar ze společného jmění bez souhlasu manžela',
      body:
        'Patří-li dar do společného jmění manželů, je k darování nad rámec běžné záležitosti potřeba souhlas druhého manžela. Bez něj se může dovolat neplatnosti.',
      law: '§ 714 NOZ',
    },
    {
      title: 'Domněnky o dani',
      body:
        'Daň darovací byla zrušena a bezúplatný příjem se posuzuje podle zákona o daních z příjmů. Příbuzní v linii přímé a vyjmenovaní další příbuzní jsou osvobozeni, konkrétní případ ale patří daňovému poradci.',
      law: '§ 10 odst. 3 zák. č. 586/1992 Sb.',
    },
  ],

  faq: [
    {
      question: 'Musí být darovací smlouva písemně?',
      answer:
        'Ne vždy. Písemná forma je nutná u věci zapsané do veřejného seznamu — typicky nemovitosti — a tam, kde se dar nepředává současně s uzavřením smlouvy. Movitou věc předanou z ruky do ruky lze darovat i ústně.',
    },
    {
      question: 'Lze dar vzít zpět?',
      answer:
        'Ano, ve dvou případech: upadne-li dárce do nouze a nemá na nutnou výživu, nebo ublížil-li mu obdarovaný způsobem, který zjevně porušuje dobré mravy. Práva odvolat dar se nelze předem vzdát.',
    },
    {
      question: 'Platí se z daru daň?',
      answer:
        'Daň darovací neexistuje od roku 2014; bezúplatný příjem se posuzuje jako příjem podle zákona o daních z příjmů. Příbuzní v linii přímé a vyjmenovaní příbuzní v linii vedlejší jsou osvobozeni.',
    },
    {
      question: 'Jak darovat nemovitost?',
      answer:
        'Písemnou smlouvou s projevy vůle obou stran na téže listině a úředně ověřenými podpisy, a následně vkladem do katastru nemovitostí. Vlastnictví přechází až vkladem.',
    },
    {
      question: 'Můžu darovat auto?',
      answer:
        'Ano. Vozidlo určete VIN, SPZ, značkou a rokem výroby a nezapomeňte na zápis změny vlastníka v registru silničních vozidel.',
    },
  ],
}
