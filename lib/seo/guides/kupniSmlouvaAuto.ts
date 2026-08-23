import type { ContractGuide } from './types'

export const KUPNI_SMLOUVA_AUTO: ContractGuide = {
  slug: 'kupni-smlouva-auto',
  generatorHint: 'Kupní smlouva',
  metaTitle: 'Kupní smlouva na auto — vzor a návrh podle českého práva',
  metaDescription:
    'Co musí obsahovat kupní smlouva na ojeté vozidlo, jak popsat stav a vady, do kdy přepsat auto v registru a čemu se vyhnout. Připravte si návrh za pár minut.',
  h1: 'Kupní smlouva na auto',
  perex:
    'Prodej ojetého vozidla mezi soukromými osobami se řídí obecnou úpravou kupní smlouvy. Nejvíc sporů vzniká kolem stavu vozidla, tachometru a přepisu v registru — právě tyto body se vyplatí ve smlouvě ošetřit nejpečlivěji.',
  legalBasis: '§ 2079 a násl. zák. č. 89/2012 Sb.; zák. č. 56/2001 Sb. o podmínkách provozu vozidel',

  mustContain: [
    {
      title: 'Označení prodávajícího a kupujícího',
      body:
        'Jméno, adresa a datum narození nebo IČO. U vozidla je vhodné doplnit i číslo občanského průkazu pro potřeby přepisu v registru.',
    },
    {
      title: 'Jednoznačná identifikace vozidla',
      body:
        'Tovární značka, model, rok výroby, VIN (číslo karoserie), registrační značka, číslo velkého technického průkazu, barva a objem motoru. VIN je nezaměnitelný identifikátor — bez něj je vozidlo popsáno nedostatečně.',
      law: '§ 2079 NOZ',
    },
    {
      title: 'Stav tachometru',
      body:
        'Uveďte počet najetých kilometrů ke dni prodeje. Prohlášení o stavu tachometru je jedním z nejčastějších předmětů pozdějších sporů.',
    },
    {
      title: 'Kupní cena a způsob úhrady',
      body:
        'Částka číslem i slovy, způsob a termín platby. U hotovosti pamatujte na zákonný limit pro platby v hotovosti — nad stanovenou hranici je nutný bezhotovostní převod.',
      law: 'zák. č. 254/2004 Sb.',
    },
    {
      title: 'Popis stavu a známých vad',
      body:
        'Konkrétně: poškození laku, opotřebení, závady, po havárii, výměna dílů. Na vadu, na kterou byl kupující výslovně upozorněn, se odpovědnost prodávajícího nevztahuje — v zájmu obou stran je popsat je co nejpřesněji.',
      law: '§ 2103 NOZ',
    },
    {
      title: 'Předání vozidla a přechod vlastnictví',
      body:
        'Datum a místo předání, seznam předávaných věcí (klíče, technický průkaz, servisní knížka, sada kol) a okamžik, kdy přechází vlastnické právo a nebezpečí škody.',
      law: '§ 2087 NOZ',
    },
    {
      title: 'Závazek k přepisu v registru vozidel',
      body:
        'Ujednejte, kdo podá žádost o zápis změny vlastníka a do kdy. Zákon na to stanoví lhůtu; nepodání ohrožuje obě strany — prodávajícímu chodí pokuty a povinné ručení za vozidlo, které už nemá.',
      law: 'zák. č. 56/2001 Sb.',
    },
  ],

  pitfalls: [
    {
      title: 'Nezapsaný přepis vozidla',
      body:
        'Dokud není změna vlastníka zapsána v registru, zůstává prodávající vedený jako provozovatel — s odpovědností za pokuty a povinné ručení. Zápis je nutné podat v zákonné lhůtě.',
      law: 'zák. č. 56/2001 Sb.',
    },
    {
      title: 'Věta „kupující byl seznámen se stavem vozidla"',
      body:
        'Sama o sobě prodávajícího nezbaví odpovědnosti. Účinná je jen konkrétní specifikace vad — obecná formulace u soudu neobstojí.',
      law: '§ 1916 odst. 2 NOZ',
    },
    {
      title: 'Zamlčený stav tachometru nebo havárie',
      body:
        'Zamlčení podstatné vady může vést k odstoupení od smlouvy i k odpovědnosti za škodu. U vozidel po havárii to platí dvojnásob.',
      law: '§ 583 a § 1728 odst. 2 NOZ',
    },
    {
      title: 'Prodej podnikatelem bez respektu k právům spotřebitele',
      body:
        'Prodává-li vozidlo autobazar nebo podnikatel spotřebiteli, nelze zákonná práva z vadného plnění zkrátit — ujednání v neprospěch spotřebitele se nepoužije.',
      law: '§ 2158 a násl. NOZ',
    },
    {
      title: 'Chybějící seznam předávaných věcí',
      body:
        'Druhý klíč, servisní knížka nebo zimní sada kol — pokud nejsou ve smlouvě, těžko se pak dokazuje, že měly být součástí prodeje.',
    },
  ],

  faq: [
    {
      question: 'Musí být kupní smlouva na auto písemná?',
      answer:
        'Zákon u movitých věcí písemnou formu nevyžaduje, prakticky je však nezbytná: budete ji potřebovat při zápisu změny vlastníka v registru vozidel a slouží jako důkaz o tom, co bylo ujednáno.',
    },
    {
      question: 'Do kdy je nutné auto přepsat?',
      answer:
        'Zápis změny vlastníka se podává u příslušného úřadu ve lhůtě stanovené zákonem č. 56/2001 Sb. Do doby zápisu zůstává v registru veden dosavadní provozovatel, kterému chodí případné pokuty. Termín i odpovědnost za podání žádosti proto ve smlouvě výslovně ujednejte.',
    },
    {
      question: 'Co když se po koupi objeví vada?',
      answer:
        'Prodávající odpovídá za vady, které vozidlo mělo při přechodu nebezpečí škody. Neplatí to pro vady, na které byl kupující výslovně upozorněn nebo které musel z okolností poznat (§ 2103 NOZ). Kupuje-li spotřebitel od podnikatele, má navíc zvláštní ochranu podle § 2158 a násl. NOZ.',
    },
    {
      question: 'Můžu zaplatit celou částku v hotovosti?',
      answer:
        'Jen do zákonného limitu pro platby v hotovosti podle zák. č. 254/2004 Sb.; nad tuto hranici je nutná bezhotovostní platba. U vyšších částek je bankovní převod bezpečnější i z hlediska prokazování úhrady.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 připraví pracovní návrh podle zadaných údajů a doplní odkazy na příslušná ustanovení. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii — u dražších vozidel nebo sporu se obraťte na advokáta.',
    },
  ],
}
