import type { Comparison } from './types'

export const VYPOVED_NEBO_DOHODA: Comparison = {
  slug: 'vypoved-nebo-dohoda-o-rozvazani',
  leftGuideSlug: 'vypoved-z-pracovniho-pomeru',
  rightGuideSlug: 'dohoda-o-rozvazani-pracovniho-pomeru',
  leftLabel: 'Výpověď',
  rightLabel: 'Dohoda',

  metaTitle: 'Výpověď, nebo dohoda? Odstupné, lhůty a co ztratíte',
  metaDescription:
    'Dohoda končí hned, výpověď dává dva měsíce. Odstupné náleží i u dohody, ale jen je-li v ní uveden organizační důvod. Podpora se neliší.',
  h1: 'Výpověď, nebo dohoda o rozvázání pracovního poměru?',
  perex:
    'Zaměstnavatelé nabízejí dohodu jako vstřícný krok a bývá jím — je rychlá a bez dohadování. Rozdíl je ale ve dvou věcech, které se projeví až později: kdy pracovní poměr skutečně skončí a zda vám zůstane nárok na odstupné. Obojí se rozhoduje ve chvíli podpisu, ne po něm.',
  legalBasis: '§ 49 až § 52 a § 67 zák. č. 262/2006 Sb., zákoník práce',

  verdict:
    'Dohoda je rychlejší, výpověď dává čas. Končí-li poměr z organizačních důvodů, odstupné náleží u obou — ale u dohody jen tehdy, je-li v ní ten důvod výslovně uveden. Dohoda bez uvedeného důvodu je pro zaměstnavatele levnější právě proto, že důvod pak musí zaměstnanec prokazovat sám.',

  rows: [
    {
      criterion: 'Kolik podpisů je třeba',
      left: 'Jednostranné jednání — podepisuje jen ten, kdo výpověď dává',
      right: 'Dvoustranné — bez souhlasu druhé strany nevznikne',
      law: '§ 50 a § 49 ZP',
    },
    {
      criterion: 'Kdy pracovní poměr končí',
      left: 'Po uplynutí výpovědní doby, nejméně dva měsíce ode dne doručení',
      right: 'Ke dni sjednanému v dohodě — klidně týmž dnem',
      law: '§ 51 a § 49 odst. 1 ZP',
    },
    {
      criterion: 'Je třeba důvod',
      left: 'Zaměstnanec ne. Zaměstnavatel jen z důvodů § 52 a musí je vymezit skutkově',
      right: 'Zákon jej nevyžaduje — ale na něm závisí odstupné',
      law: '§ 50 odst. 4 a § 52 ZP',
    },
    {
      criterion: 'Odstupné při organizačních důvodech',
      left: 'Náleží při výpovědi z důvodů § 52 písm. a) až c)',
      right: 'Náleží „z týchž důvodů" — musí být v dohodě uveden',
      law: '§ 67 odst. 1 ZP',
    },
    {
      criterion: 'Výše odstupného',
      left: '1×, 2× nebo 3× průměrný výdělek podle délky trvání poměru',
      right: 'Stejná pravidla',
      law: '§ 67 odst. 1 a 2 ZP',
    },
    {
      criterion: 'Ochranná doba při nemoci či těhotenství',
      left: 'Chrání — výpověď zaměstnavatele je zpravidla neplatná',
      right: 'Nechrání. Dohodu lze platně uzavřít i v pracovní neschopnosti',
      law: '§ 53 ZP',
    },
    {
      criterion: 'Lze vzít zpět',
      left: 'Jen se souhlasem druhé strany, písemně',
      right: 'Jen dohodou obou stran',
      law: '§ 50 odst. 5 ZP',
    },
    {
      criterion: 'Podpora v nezaměstnanosti',
      left: '80 % / 50 % / 40 % podle fáze podpůrčí doby',
      right: 'Totožné — způsob skončení sazbu neovlivňuje',
      law: '§ 50 odst. 3 zák. č. 435/2004 Sb.',
    },
    {
      criterion: 'Napadení u soudu',
      left: 'Neplatnost je třeba uplatnit do dvou měsíců ode dne, kdy měl poměr skončit',
      right: 'Napadá se obtížněji — jde o projev vlastní vůle',
      law: '§ 72 ZP',
    },
  ],

  chooseLeft: {
    title: 'Kdy je lepší výpověď',
    bullets: [
      'Potřebujete čas — dva měsíce výpovědní doby jsou dva měsíce příjmu na hledání práce.',
      'Jste v pracovní neschopnosti, těhotná nebo na rodičovské a chcete využít ochrannou dobu.',
      'Zaměstnavatel tvrdí organizační důvod, ale odmítá jej napsat do dohody.',
      'Chcete si ponechat možnost domáhat se neplatnosti u soudu.',
    ],
  },

  chooseRight: {
    title: 'Kdy je lepší dohoda',
    bullets: [
      'Máte navazující práci a dvouměsíční výpovědní doba by vám bránila nastoupit.',
      'Organizační důvod je v dohodě výslovně uveden i s odkazem na § 52 písm. a) až c).',
      'Vyjednali jste odstupné vyšší než zákonné minimum — zákonná výše je podlaha, ne cíl.',
      'Chcete se rozejít bez sporu a podmínky vám vyhovují.',
    ],
  },

  pitfalls: [
    {
      title: 'Dohoda bez uvedení důvodu',
      body:
        'Nejdražší chyba celého rozhodování. Text „strany se dohodly na rozvázání pracovního poměru" vypadá neutrálně, ale odstupné podle § 67 pak musíte prokazovat sami — proti zaměstnavateli, který k tomu nemá důvod pomáhat.',
      law: '§ 67 odst. 1 ZP',
    },
    {
      title: 'Podpis dohody v pracovní neschopnosti',
      body:
        'Ochranná doba podle § 53 chrání před výpovědí, nikoli před dohodou. Právě v nemoci je nejtěžší posoudit, co podepisujete — a podpis platí.',
      law: '§ 53 ZP',
    },
    {
      title: 'Očekávání výpovědní doby u dohody',
      body:
        'U dohody neběží. Poměr končí sjednaným dnem. Potřebujete-li dva měsíce, musí být ten den o dva měsíce později — nevznikne sám.',
      law: '§ 49 odst. 1 ZP',
    },
    {
      title: 'Obava ze ztráty podpory',
      body:
        'Rozšířená a dnes nesprávná. Procentní sazba podpory v nezaměstnanosti se podle způsobu skončení neliší; dřívější snížení za skončení dohodou už zákon neobsahuje.',
      law: '§ 50 odst. 3 zák. č. 435/2004 Sb.',
    },
    {
      title: 'Podpis pod tlakem během jednání',
      body:
        'Dohoda je dvoustranná — nikdo vás nemůže donutit ji podepsat. Odmítnutím se nevystavujete ničemu: zaměstnavatel pak musí použít výpověď, a tam už potřebuje důvod podle § 52.',
      law: '§ 49 a § 52 ZP',
    },
  ],

  faq: [
    {
      question: 'Přijdu dohodou o odstupné?',
      answer:
        'Nemusíte. Odstupné náleží i při skončení dohodou, končí-li poměr z organizačních důvodů podle § 52 písm. a) až c). Podmínkou je, aby byl důvod v dohodě uveden — jinak jej budete muset prokazovat.',
    },
    {
      question: 'Musím dohodu podepsat, když ji zaměstnavatel předloží?',
      answer:
        'Ne. Je to dvoustranné právní jednání a bez vašeho souhlasu nevznikne. Odmítnete-li, může zaměstnavatel použít výpověď — k té ale potřebuje důvod podle § 52 a musí jej vymezit skutkově.',
    },
    {
      question: 'Kdy skončí pracovní poměr u dohody?',
      answer:
        'Dnem, který si strany sjednají. Může to být i den podpisu — výpovědní doba u dohody neběží.',
    },
    {
      question: 'Přijdu dohodou o podporu v nezaměstnanosti?',
      answer:
        'Ne. Sazba činí 80 % za první dva měsíce, 50 % za další dva a 40 % po zbývající dobu bez ohledu na to, jak pracovní poměr skončil.',
    },
    {
      question: 'Můžu dohodu po podpisu zrušit?',
      answer:
        'Jednostranně ne. Zrušení dohody vyžaduje souhlas druhé strany, stejně jako její uzavření.',
    },
    {
      question: 'Chrání mě nemoc před dohodou?',
      answer:
        'Nechrání. Ochranná doba podle § 53 se vztahuje na výpověď. Dohodu lze platně uzavřít i během pracovní neschopnosti nebo v těhotenství.',
    },
  ],
}
