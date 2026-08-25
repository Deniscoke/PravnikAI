import type { Comparison } from './types'

export const REKLAMACE_NEBO_ODSTOUPENI: Comparison = {
  slug: 'reklamace-nebo-odstoupeni-do-14-dnu',
  leftGuideSlug: 'reklamace-zbozi',
  rightGuideSlug: 'odstoupeni-od-smlouvy',
  leftLabel: 'Reklamace',
  rightLabel: 'Odstoupení do 14 dnů',

  metaTitle: 'Reklamace, nebo vrácení do 14 dnů? Kdy platí co',
  metaDescription:
    'Do 14 dnů lze vrátit zboží z e-shopu bez důvodu. Reklamace vyžaduje vadu, ale platí dva roky — a nejdřív dává opravu nebo výměnu, ne peníze.',
  h1: 'Reklamace, nebo vrácení do 14 dnů?',
  perex:
    'Dvě různá práva, která se v obchodech i v hlavách kupujících pravidelně slévají. Čtrnáctidenní vrácení nevyžaduje žádný důvod, ale existuje jen u nákupu na dálku a mimo obchodní prostory. Reklamace vyžaduje vadu, zato platí dva roky a v kamenné prodejně stejně jako na internetu.',
  legalBasis: '§ 1829 a § 2161 a násl. zák. č. 89/2012 Sb., ve znění zák. č. 374/2022 Sb.',

  verdict:
    'Koupili jste na dálku a zboží je v pořádku, jen ho nechcete? Odstoupení do 14 dnů — bez udání důvodu, peníze zpět. Má zboží vadu? Reklamace — platí dva roky, ale nejprve vám náleží oprava nebo výměna podle vaší volby, nikoli rovnou peníze.',

  rows: [
    {
      criterion: 'Kde právo platí',
      left: 'Kdekoli — v prodejně i na internetu',
      right: 'Jen u smluv uzavřených distančně nebo mimo obchodní prostory',
      law: '§ 2165 a § 1829 NOZ',
    },
    {
      criterion: 'Je třeba důvod',
      left: 'Ano — vada zboží',
      right: 'Ne. Důvod nikdo vyžadovat nesmí',
      law: '§ 1829 NOZ',
    },
    {
      criterion: 'Do kdy',
      left: 'Vada se musí projevit do dvou let od převzetí',
      right: 'Do čtrnácti dnů od převzetí zboží',
      law: '§ 2165 odst. 1 a § 1829 NOZ',
    },
    {
      criterion: 'Co dostanete',
      left: 'Nejprve opravu nebo novou věc podle vaší volby; sleva a odstoupení až za podmínek § 2171',
      right: 'Vrácení kupní ceny',
      law: '§ 2169 a § 2171 NOZ',
    },
    {
      criterion: 'Kdo prokazuje vadu',
      left: 'Do jednoho roku od převzetí prodávající, poté kupující',
      right: 'Nikdo — vada se nezkoumá',
      law: '§ 2161 odst. 5 NOZ',
    },
    {
      criterion: 'Náklady na dopravu',
      left: 'Věc k odstranění vady přebírá prodávající na vlastní náklady',
      right: 'Náklady na vrácení nese zpravidla kupující',
      law: '§ 2170 odst. 2 NOZ',
    },
    {
      criterion: 'Lhůta pro vyřízení',
      left: 'Vyřídit a informovat kupujícího do 30 dnů',
      right: 'Peníze vrátit bez zbytečného odkladu',
      law: '§ 19 odst. 3 zák. č. 634/1992 Sb.',
    },
    {
      criterion: 'Když lhůta marně uplyne',
      left: 'Můžete odstoupit nebo žádat přiměřenou slevu',
      right: '—',
      law: '§ 19 odst. 4 zák. č. 634/1992 Sb.',
    },
  ],

  chooseLeft: {
    title: 'Kdy reklamovat',
    bullets: [
      'Zboží má vadu — nefunguje, rozbilo se, neodpovídá popisu.',
      'Uplynulo víc než čtrnáct dnů od převzetí.',
      'Koupili jste v kamenné prodejně, kde čtrnáctidenní právo nevzniká.',
      'Chcete věc opravit nebo vyměnit, ne vrátit peníze.',
    ],
  },

  chooseRight: {
    title: 'Kdy odstoupit do 14 dnů',
    bullets: [
      'Nakoupili jste v e-shopu nebo mimo obchodní prostory.',
      'Jste do čtrnácti dnů od převzetí zboží.',
      'Zboží je v pořádku, jen vám nevyhovuje — velikost, barva, rozmyslel jste si to.',
      'Chcete peníze zpět, ne opravu.',
    ],
  },

  pitfalls: [
    {
      title: 'Žádost o peníze hned v první reklamaci',
      body:
        'Nejčastější důvod zamítnutí, který si kupující způsobí sám. Nenastala-li některá ze čtyř situací § 2171, náleží vám oprava nebo výměna — a prodávající vás odmítne oprávněně.',
      law: '§ 2169 a § 2171 NOZ',
    },
    {
      title: 'Uplatnění čtrnácti dnů na nákup v prodejně',
      body:
        'Právo odstoupit bez důvodu existuje jen u smluv uzavřených distančním způsobem nebo mimo obchodní prostory. V kamenné prodejně nevzniká — vstřícnost obchodu je dobrovolná.',
      law: '§ 1829 NOZ',
    },
    {
      title: 'Odvolávání se na „zákonnou záruku 24 měsíců"',
      body:
        'Zákonná záruka po novele č. 374/2022 Sb. neexistuje. Dva roky nejsou záruční dobou ani lhůtou pro podání reklamace — je to doba, ve které se vada musí projevit, a právo nezaniká tím, že jste ji nevytkli hned.',
      law: '§ 2165 odst. 1 a 3 NOZ',
    },
    {
      title: 'Domněnka, že po roce už reklamovat nelze',
      body:
        'Lze. Po roce se jen obrací důkazní břemeno: do jednoho roku od převzetí prokazuje neexistenci vady prodávající, po roce prokazujete existenci vady při převzetí vy.',
      law: '§ 2161 odst. 5 NOZ',
    },
    {
      title: 'Placení dopravy k reklamaci',
      body:
        'K odstranění vady přebírá prodávající věc na vlastní náklady. U čtrnáctidenního vrácení je to naopak — náklady na odeslání zpět nese zpravidla kupující.',
      law: '§ 2170 odst. 2 NOZ',
    },
  ],

  faq: [
    {
      question: 'Můžu vrátit zboží do 14 dnů, i když není vadné?',
      answer:
        'Ano, koupili-li jste je distančně nebo mimo obchodní prostory. Právo odstoupit do čtrnácti dnů nevyžaduje žádný důvod a nikdo jej po vás nesmí požadovat.',
    },
    {
      question: 'Platí čtrnáct dnů i v kamenném obchodě?',
      answer:
        'Neplatí. Vrátí-li obchod zboží bez důvodu, je to jeho vstřícnost, nikoli zákonná povinnost.',
    },
    {
      question: 'Kdy můžu žádat peníze zpět při reklamaci?',
      answer:
        'Ve čtyřech případech podle § 2171: prodávající vadu odmítl odstranit nebo ji neodstranil řádně, vada se projevila opakovaně, jde o podstatné porušení smlouvy, nebo je zjevné, že vada nebude odstraněna v přiměřené době.',
    },
    {
      question: 'Jak dlouho můžu reklamovat?',
      answer:
        'Rozhoduje, kdy se vada projevila — projeví-li se do dvou let od převzetí, právo trvá. Soud jej přizná i tehdy, když jste vadu nevytkli bez zbytečného odkladu.',
    },
    {
      question: 'Do kdy musí být reklamace vyřízena?',
      answer:
        'Do třiceti dnů ode dne uplatnění, nedohodnete-li se na delší lhůtě. Ve stejné lhůtě vás prodávající musí o vyřízení informovat. Po marném uplynutí můžete odstoupit nebo žádat slevu.',
    },
    {
      question: 'Kdo platí dopravu?',
      answer:
        'U reklamace přebírá prodávající věc na vlastní náklady. U čtrnáctidenního vrácení nese náklady na odeslání zpět zpravidla kupující.',
    },
  ],
}
