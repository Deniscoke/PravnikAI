import type { ContractGuide } from './types'

export const REKLAMACE: ContractGuide = {
  slug: 'reklamace-zbozi',
  generatorHint: 'Reklamace',
  metaTitle: 'Reklamace zboží 2026 — vzor, lhůty a práva po novele',
  metaDescription:
    'Dva roky na projevení vady, roční domněnka, 30 dnů na vyřízení. Co se změnilo novelou 374/2022 Sb. a proč nežádat vrácení peněz hned v prvním dopise.',
  h1: 'Reklamace zboží',
  perex:
    'Od 6. ledna 2023 platí jiná pravidla, než jaká najdete ve většině článků i na reklamačních řádech e-shopů. Zákonná „záruka 24 měsíců" už neexistuje — místo ní máte právo vytknout vadu, která se projeví do dvou let od převzetí, a to je právo silnější. Zmizela také lhůta tří pracovních dnů na rozhodnutí o reklamaci. A pořadí nároků je pevné: nejdřív oprava nebo výměna, teprve potom peníze.',
  legalBasis:
    '§ 2161 a násl. zák. č. 89/2012 Sb. a § 19 zák. č. 634/1992 Sb., ve znění zák. č. 374/2022 Sb.',

  mustContain: [
    {
      title: 'Identifikace koupě',
      body:
        'Co bylo koupeno, kdy a za kolik, číslo objednávky nebo účtenky. Vadu vytýkáte prodávajícímu, u kterého jste věc koupili — je-li však k opravě určena jiná osoba ve vašem okolí, obracíte se na ni.',
      law: '§ 2172 NOZ',
    },
    {
      title: 'Skutkový popis vady',
      body:
        'V čem se vada projevuje, kdy se projevila poprvé a za jakých okolností. „Nefunguje to" umožní prodávajícímu reklamaci odmítnout pro neurčitost — popište místo toho, co konkrétně se děje.',
      law: '§ 2161 a § 2165 NOZ',
    },
    {
      title: 'Jaký způsob vyřízení požadujete',
      body:
        'Uveďte výslovně, zda chcete opravu, nebo dodání nové věci. Volba je na vás a prodávající ji musí uvést v potvrzení o uplatnění reklamace. Odmítnout ji může jen tehdy, je-li zvolený způsob nemožný nebo ve srovnání s druhým nepřiměřeně nákladný.',
      law: '§ 2169 odst. 1 NOZ',
    },
    {
      title: 'Důvod, žádáte-li slevu nebo vrácení peněz',
      body:
        'Přiměřenou slevu nebo odstoupení lze požadovat jen ve čtyřech situacích: prodávající vadu odmítl odstranit nebo ji neodstranil řádně, vada se projevila opakovaně, jde o podstatné porušení smlouvy, nebo je zjevné, že vada nebude odstraněna v přiměřené době. Který z důvodů nastal, ve zprávě popište.',
      law: '§ 2171 odst. 1 NOZ',
    },
    {
      title: 'Lhůta k vyřízení a kontakt',
      body:
        'Reklamace musí být vyřízena a vy o tom informováni do třiceti dnů ode dne uplatnění, nedohodnete-li se na delší lhůtě. Uveďte proto kontakt, na který vás má prodávající vyrozumět.',
      law: '§ 19 odst. 2 a 3 zák. č. 634/1992 Sb.',
    },
    {
      title: 'Náhrada nákladů a podpis',
      body:
        'Máte právo i na náhradu účelně vynaložených nákladů — poštovné, dopravu, znalecký posudek. Uplatněte ji rovnou. Reklamaci podepisuje jen kupující; není to dohoda.',
      law: '§ 1924 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Odvolávání se na „zákonnou záruku 24 měsíců"',
      body:
        'Zákonná záruka po novele neexistuje. Dva roky nejsou záruční dobou ani lhůtou pro podání reklamace — je to doba, ve které se vada musí projevit. Rozdíl je ve váš prospěch: soud vám právo z vady přizná i tehdy, když jste ji nevytkli hned, jakmile jste ji mohli zjistit.',
      law: '§ 2165 odst. 1 a 3 NOZ',
    },
    {
      title: 'Domněnka počítaná na šest měsíců',
      body:
        'Do 5. ledna 2023 platila šest měsíců, dnes rok. Projeví-li se vada do jednoho roku od převzetí, má se za to, že věc byla vadná už při převzetí, a neexistenci vady musí prokázat prodávající. Po roce leží důkazní břemeno na vás.',
      law: '§ 2161 odst. 5 NOZ',
    },
    {
      title: 'Požadování peněz hned v prvním dopise',
      body:
        'Nejčastější důvod zamítnutí, který si kupující způsobí sám. Nenastala-li některá ze čtyř situací § 2171, náleží vám oprava nebo výměna — a prodávající vás odmítne oprávněně. Peníze přicházejí na řadu až potom.',
      law: '§ 2169 a § 2171 NOZ',
    },
    {
      title: 'Lhůta tří pracovních dnů na rozhodnutí',
      body:
        'Tuto povinnost § 19 zákona o ochraně spotřebitele neobsahuje. Platí třicetidenní lhůta na vyřízení reklamace, jejíž součástí je i to, že vás prodávající o výsledku informuje.',
      law: '§ 19 odst. 3 zák. č. 634/1992 Sb.',
    },
    {
      title: 'Marné uplynutí třiceti dnů jako „podstatné porušení smlouvy"',
      body:
        'Dřívější konstrukce. Dnes vám zákon dává právo přímo: po marném uplynutí lhůty můžete od smlouvy odstoupit nebo požadovat přiměřenou slevu, bez oklik přes § 2002.',
      law: '§ 19 odst. 4 zák. č. 634/1992 Sb.',
    },
    {
      title: 'Placení dopravy k reklamaci',
      body:
        'K odstranění vady převezme prodávající věc na vlastní náklady. Vyžaduje-li to demontáž věci, kterou předtím sám namontoval, provede ji nebo uhradí náklady s tím spojené.',
      law: '§ 2170 odst. 2 NOZ',
    },
    {
      title: 'Snaha prokázat, že vada je významná',
      body:
        'Odstoupit nelze u nevýznamné vady — ale zákon výslovně předpokládá, že vada nevýznamná není. Prokázat opak musí prodávající, ne vy.',
      law: '§ 2171 odst. 3 NOZ',
    },
    {
      title: 'Respektování reklamačního řádu, který práva zkracuje',
      body:
        'Ujednají-li strany dřív, než kupující vytkne vadu, že se jeho práva omezí nebo zaniknou, nepřihlíží se k tomu. Obchodní podmínky vaše zákonná práva nezmenší, i když to tvrdí.',
      law: '§ 2174 NOZ',
    },
  ],

  faq: [
    {
      question: 'Platí ještě dvouletá záruka?',
      answer:
        'Zákonná záruka jako taková ne. Máte právo vytknout vadu, která se projeví do dvou let od převzetí. Záruka za jakost existuje dál, ale jen jako dobrovolný závazek prodávajícího nebo výrobce, doložený záručním listem.',
    },
    {
      question: 'Do kdy musí být reklamace vyřízena?',
      answer:
        'Do třiceti dnů ode dne uplatnění, nedohodnete-li se na delší lhůtě. Ve stejné lhůtě vás prodávající musí o vyřízení informovat. U digitálního obsahu platí přiměřená doba podle jeho povahy.',
    },
    {
      question: 'Co když prodávající třicetidenní lhůtu nedodrží?',
      answer:
        'Můžete od smlouvy odstoupit nebo požadovat přiměřenou slevu. Vyplývá to přímo z § 19 odst. 4 zákona o ochraně spotřebitele.',
    },
    {
      question: 'Můžu rovnou žádat vrácení peněz?',
      answer:
        'Jen ve čtyřech případech podle § 2171: prodávající vadu odmítl odstranit nebo ji neodstranil řádně, vada se projevila opakovaně, jde o podstatné porušení smlouvy, nebo je zjevné, že vada nebude odstraněna v přiměřené době. Jinak vám náleží oprava nebo výměna podle vaší volby.',
    },
    {
      question: 'Kdo prokazuje, že vada byla už při koupi?',
      answer:
        'Projeví-li se vada do jednoho roku od převzetí, prokazuje opak prodávající. Po uplynutí roku prokazujete existenci vady při převzetí vy.',
    },
    {
      question: 'Reklamoval jsem po dvou letech, mám smůlu?',
      answer:
        'Rozhoduje, kdy se vada projevila, ne kdy jste reklamovali. Projevila-li se ve dvouleté době, právo trvá — soud je přizná i tehdy, když jste ji nevytkli bez zbytečného odkladu.',
    },
    {
      question: 'Platí na použité zboží jen roční lhůta?',
      answer:
        'Jen bylo-li zkrácení ujednáno. Zákon stranám dovoluje zkrátit dobu u použité věci až na jeden rok, ale samo od sebe se to nestane.',
    },
    {
      question: 'Kdy reklamaci uznat nemusí?',
      answer:
        'Způsobili-li jste vadu sami, nebo jde-li o opotřebení běžným užíváním — u použité věci o opotřebení odpovídající míře jejího předchozího používání.',
    },
  ],
}
