import type { Comparison } from './types'

export const ODSTOUPENI_NEBO_VYPOVED: Comparison = {
  slug: 'odstoupeni-nebo-vypoved-ze-smlouvy',
  leftGuideSlug: 'odstoupeni-od-smlouvy',
  rightGuideSlug: 'vypoved-z-najmu-bytu',
  leftLabel: 'Odstoupení',
  rightLabel: 'Výpověď',

  metaTitle: 'Odstoupení, nebo výpověď? Rozdíl je v tom, co se vrací',
  metaDescription:
    'Odstoupením se závazek ruší od počátku a plnění se vrací. Výpověď působí do budoucna. Odstoupit lze jen z ujednaného nebo zákonného důvodu.',
  h1: 'Odstoupení, nebo výpověď?',
  perex:
    'Obojí ukončuje smlouvu a v běžné řeči se to zaměňuje. Právně jsou to ale dva různé nástroje s opačným účinkem na to, co už bylo zaplaceno a dodáno — a dokument nadepsaný špatně nevyvolá účinky, které si pisatel představoval.',
  legalBasis: '§ 1998 až § 2005 zák. č. 89/2012 Sb., občanský zákoník',

  verdict:
    'Odstoupením se závazek ruší OD POČÁTKU a strany si vrátí, co si už plnily. Výpověď ukončuje smlouvu do budoucna a minulosti se nedotýká. Chcete-li peníze zpět, potřebujete odstoupení — a k němu důvod ujednaný ve smlouvě nebo stanovený zákonem. Chcete-li jen přestat, stačí výpověď.',

  rows: [
    {
      criterion: 'Účinek na už poskytnutá plnění',
      left: 'Závazek se ruší od počátku, strany si vrátí, co si plnily',
      right: 'Plnění z minulosti zůstává — smlouva končí do budoucna',
      law: '§ 2004 odst. 1 a § 1998 NOZ',
    },
    {
      criterion: 'Je třeba důvod',
      left: 'Ano — ujednaný ve smlouvě nebo stanovený zákonem',
      right: 'U smlouvy na dobu neurčitou zpravidla ne',
      law: '§ 2001 NOZ',
    },
    {
      criterion: 'Kdy nastanou účinky',
      left: 'Dojitím druhé straně, bez výpovědní doby',
      right: 'Uplynutím výpovědní doby',
      law: '§ 570 a § 1998 odst. 2 NOZ',
    },
    {
      criterion: 'Při podstatném porušení',
      left: 'Lze odstoupit bez zbytečného odkladu poté, co se strana o porušení dozvěděla',
      right: '—',
      law: '§ 2002 NOZ',
    },
    {
      criterion: 'Při nepodstatném porušení',
      left: 'Až po marném uplynutí dodatečné přiměřené lhůty poskytnuté výzvou',
      right: '—',
      law: '§ 1978 a § 2003 NOZ',
    },
    {
      criterion: 'Co ukončení přežije',
      left: 'Smluvní pokuta, úrok z prodlení, náhrada škody i ujednání o řešení sporů',
      right: 'Totéž',
      law: '§ 2005 odst. 2 NOZ',
    },
    {
      criterion: 'Hodí se na trvající závazky',
      left: 'Obtížně — plnění za uplynulé měsíce nelze vrátit',
      right: 'Ano, je to jejich přirozené ukončení',
      law: '§ 2004 NOZ',
    },
    {
      criterion: 'Spotřebitel u nákupu na dálku',
      left: 'Zvláštní právo odstoupit do 14 dnů bez udání důvodu',
      right: '—',
      law: '§ 1829 NOZ',
    },
  ],

  chooseLeft: {
    title: 'Kdy použít odstoupení',
    bullets: [
      'Chcete zpět peníze, které jste už zaplatili.',
      'Druhá strana smlouvu podstatně porušila — nebo porušila nepodstatně a nesplnila ani v dodatečné lhůtě, kterou jste jí dali.',
      'Smlouva odstoupení pro daný případ výslovně umožňuje.',
      'Jde o nákup na dálku a jste do čtrnácti dnů od převzetí.',
    ],
  },

  chooseRight: {
    title: 'Kdy použít výpověď',
    bullets: [
      'Jde o trvající vztah — nájem, služby, licence — kde už bylo plněno a vracet není co.',
      'Nemáte důvod, který by odstoupení opravňoval, a jen chcete skončit.',
      'Smlouva je na dobu neurčitou a stačí vám ukončení do budoucna.',
    ],
  },

  pitfalls: [
    {
      title: 'Dokument nadepsaný „odstoupení" s výpovědní dobou',
      body:
        'Vnitřně rozporný text. Odstoupením se závazek ruší od počátku, takže žádná výpovědní doba neběží. Popisuje-li dokument ukončení do budoucna, nejde o odstoupení a jeho účinky nenastanou.',
      law: '§ 2004 NOZ',
    },
    {
      title: 'Odstoupení bez uvedení důvodu',
      body:
        'Na rozdíl od výpovědi u smlouvy na dobu neurčitou nelze odstoupit „jen tak". Bez důvodu ujednaného ve smlouvě nebo stanoveného zákonem odstoupení účinky nemá.',
      law: '§ 2001 NOZ',
    },
    {
      title: 'Odstoupení pro nepodstatné porušení bez předchozí výzvy',
      body:
        'Nejčastější důvod, proč odstoupení neobstojí. Nejprve je nutné poskytnout dodatečnou přiměřenou lhůtu a teprve po jejím marném uplynutí odstoupit.',
      law: '§ 1978 a § 2003 NOZ',
    },
    {
      title: 'Přesvědčení, že odstoupením zaniká všechno',
      body:
        'Nezaniká. Právo na smluvní pokutu, úrok z prodlení a náhradu škody z porušení smlouvy trvá — stejně jako ujednání o řešení sporů.',
      law: '§ 2005 odst. 2 NOZ',
    },
    {
      title: 'Záměna čtrnáctidenního práva spotřebitele s obecným odstoupením',
      body:
        'Čtrnáctidenní odstoupení bez důvodu existuje jen u smluv uzavřených distančním způsobem nebo mimo obchodní prostory. V kamenné prodejně nevzniká.',
      law: '§ 1829 NOZ',
    },
  ],

  faq: [
    {
      question: 'Jaký je hlavní rozdíl mezi odstoupením a výpovědí?',
      answer:
        'Odstoupením se závazek ruší od počátku a strany si vrátí, co si plnily. Výpověď ukončuje smlouvu do budoucna a plnění z minulosti se nedotýká.',
    },
    {
      question: 'Můžu odstoupit, když se mi jen rozmyslelo?',
      answer:
        'Zpravidla ne. Odstoupit lze jen tehdy, ujednaly-li si to strany nebo stanoví-li tak zákon. Výjimkou je čtrnáctidenní právo spotřebitele u nákupu na dálku či mimo obchodní prostory.',
    },
    {
      question: 'Musím před odstoupením dát druhé straně lhůtu?',
      answer:
        'U nepodstatného porušení ano — odstoupit lze až poté, co nesplní ani v dodatečné přiměřené lhůtě. U podstatného porušení výzva nutná není, ale je třeba jednat bez zbytečného odkladu.',
    },
    {
      question: 'Běží u odstoupení výpovědní doba?',
      answer:
        'Neběží. Odstoupení působí dojitím druhé straně a ruší závazek od počátku.',
    },
    {
      question: 'Zanikne odstoupením i smluvní pokuta?',
      answer:
        'Nezanikne. Odstoupení se nedotýká práva na smluvní pokutu, úrok z prodlení ani náhradu škody vzniklé porušením smlouvy.',
    },
    {
      question: 'Co použít u nájmu, který už rok trvá?',
      answer:
        'Zpravidla výpověď. Odstoupení míří na zrušení od počátku, a nájemné za uplynulé měsíce vrátit nelze — u trvajících závazků je proto přirozeným nástrojem výpověď.',
    },
  ],
}
