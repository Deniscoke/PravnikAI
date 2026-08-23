import type { ContractGuide } from './types'

export const DOHODA_O_ROZVAZANI: ContractGuide = {
  slug: 'dohoda-o-rozvazani-pracovniho-pomeru',
  generatorHint: 'Dohoda o rozvázání pracovního poměru',
  metaTitle: 'Dohoda o rozvázání pracovního poměru — vzor a odstupné',
  metaDescription:
    'Proč na jedné větě závisí odstupné, že u dohody neběží výpovědní doba ani ochranná doba, a proč dohodou o podporu v nezaměstnanosti nepřijdete.',
  h1: 'Dohoda o rozvázání pracovního poměru',
  perex:
    'Vypadá jako nejjednodušší způsob rozchodu a bývá i nejrychlejší — ale o tom, jestli zaměstnanec odejde s tříměsíčním platem nebo s ničím, rozhoduje jediná věta. Odstupné náleží i při skončení dohodou, avšak jen tehdy, končí-li poměr z organizačních důvodů „z týchž důvodů" jako u výpovědi. Není-li ten důvod v dohodě uveden, musí jej zaměstnanec později prokazovat sám — proti zaměstnavateli, který k tomu nemá důvod pomáhat.',
  legalBasis: '§ 49 a § 67 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Označení ukončovaného pracovního poměru',
      body:
        'Pracovní smlouva, kterou dohoda ukončuje — datum uzavření a sjednaný druh práce. Zaměstnanec mohl mít u téhož zaměstnavatele více vztahů.',
    },
    {
      title: 'Konkrétní den skončení',
      body:
        'Dohodou končí pracovní poměr sjednaným dnem. Může jím být i den podpisu — výpovědní doba tu neběží, takže potřebujete-li čas navíc, musí být sjednán jako pozdější den skončení.',
      law: '§ 49 odst. 1 ZP',
    },
    {
      title: 'Důvod skončení, jde-li o organizační důvody',
      body:
        'Zrušení nebo přemístění zaměstnavatele a nadbytečnost — tedy § 52 písm. a) až c). Uveďte důvod výslovně a s odkazem na příslušné písmeno. Na téhle větě stojí nárok na odstupné.',
      law: '§ 67 odst. 1 ZP',
    },
    {
      title: 'Výše odstupného a kdy bude vyplaceno',
      body:
        'Nejméně jednonásobek průměrného výdělku při trvání poměru do roku, dvojnásobek od jednoho do dvou let, trojnásobek od dvou let. Do doby trvání se započítá i předchozí poměr u téhož zaměstnavatele, pokud mezi nimi neuplynulo více než šest měsíců.',
      law: '§ 67 odst. 1 a 2 ZP',
    },
    {
      title: 'Vypořádání ke dni skončení',
      body:
        'Mzda, nevyčerpaná dovolená a svěřené věci — co, kolik a do kdy. Nevyčerpanou dovolenou zaměstnavatel při skončení proplácí.',
      law: '§ 222 odst. 2 ZP',
    },
    {
      title: 'Písemná forma, dvě vyhotovení a podpisy obou stran',
      body:
        'Dohoda musí být písemná a každá strana musí obdržet jedno vyhotovení. Podepisují ji obě strany — jednostranným podpisem dohoda nevzniká.',
      law: '§ 49 odst. 2 a 3 ZP',
    },
  ],

  pitfalls: [
    {
      title: 'Dohoda bez uvedení důvodu',
      body:
        'Nejčastější a nejdražší vada. Zaměstnavatelé nabízejí verzi, která říká jen „strany se dohodly na rozvázání", protože je levnější — a pro zaměstnance vypadá stejně. Bez zaznamenaného organizačního důvodu se odstupné podle § 67 prokazuje jen obtížně.',
      law: '§ 67 odst. 1 ZP',
    },
    {
      title: 'Očekávání výpovědní doby',
      body:
        'U dohody neběží. Pracovní poměr končí sjednaným dnem, klidně týmž dnem, kdy byla podepsána. Potřebujete-li dva měsíce na hledání práce, musí být ten den sjednán o dva měsíce později.',
      law: '§ 49 odst. 1 ZP',
    },
    {
      title: 'Spoléhání na ochrannou dobu',
      body:
        'Ochranná doba podle § 53 chrání před výpovědí, nikoli před dohodou. Zaměstnanec v pracovní neschopnosti i těhotná zaměstnankyně mohou dohodu platně uzavřít — a je to zpravidla okamžik, kdy ji dokážou posoudit nejhůř.',
      law: '§ 53 ZP',
    },
    {
      title: 'Přesvědčení, že dohodou přijdete o podporu',
      body:
        'Rozšířená a dnes už nesprávná rada. Procentní sazba podpory v nezaměstnanosti činí 80 % průměrného čistého výdělku první dva měsíce, 50 % další dva a 40 % po zbývající dobu — bez ohledu na to, jak pracovní poměr skončil. U uchazečů nad 52 let jsou první dvě období tříměsíční.',
      law: '§ 50 odst. 3 zák. č. 435/2004 Sb.',
    },
    {
      title: 'Slib dvanáctinásobného odstupného po pracovním úrazu',
      body:
        'Dvanáctinásobek náleží jen při skončení z důvodu dosažení nejvyšší přípustné expozice na pracovišti podle § 52 písm. e). U pracovního úrazu a nemoci z povolání jej od června 2025 nahradila jednorázová náhrada.',
      law: '§ 67 odst. 3 ZP',
    },
    {
      title: 'Nezapočtený předchozí poměr u téhož zaměstnavatele',
      body:
        'Do doby trvání rozhodné pro výši odstupného se započítá i předchozí pracovní poměr u stejného zaměstnavatele, byla-li mezi nimi přestávka nejvýše šesti měsíců. Rozdíl mezi dvoj- a trojnásobkem to rozhodne často.',
      law: '§ 67 odst. 2 ZP',
    },
    {
      title: 'Podpis bez druhého vyhotovení',
      body:
        'Zákon výslovně žádá, aby každá strana obdržela jedno vyhotovení. Zaměstnanci se běžně stává, že podepíše dvě kopie a žádnou si neodnese.',
      law: '§ 49 odst. 3 ZP',
    },
  ],

  faq: [
    {
      question: 'Mám při dohodě nárok na odstupné?',
      answer:
        'Ano, končí-li pracovní poměr z organizačních důvodů podle § 52 písm. a) až c) — tedy při zrušení nebo přemístění zaměstnavatele a při nadbytečnosti. Důvod ale musí být v dohodě uveden, jinak jej budete muset prokazovat sami.',
    },
    {
      question: 'Běží u dohody výpovědní doba?',
      answer:
        'Ne. Pracovní poměr končí dnem sjednaným v dohodě, i kdyby to byl den jejího podpisu. Chcete-li čas navíc, musíte si sjednat pozdější den skončení.',
    },
    {
      question: 'Přijdu dohodou o podporu v nezaměstnanosti?',
      answer:
        'Ne. Sazba činí 80 % za první dva měsíce, 50 % za další dva a 40 % po zbývající dobu bez ohledu na způsob skončení. Dřívější snížená sazba za skončení dohodou už v zákoně není.',
    },
    {
      question: 'Můžu podepsat dohodu, když jsem v pracovní neschopnosti?',
      answer:
        'Ano. Ochranná doba podle § 53 se vztahuje na výpověď, nikoli na dohodu. Právě proto stojí za to text v takové situaci nepodepisovat ve spěchu.',
    },
    {
      question: 'Jak vysoké odstupné mi náleží?',
      answer:
        'Nejméně jednonásobek průměrného výdělku, trval-li poměr méně než rok, dvojnásobek při trvání jeden až dva roky a trojnásobek od dvou let. Vyšší odstupné lze sjednat — zákonné minimum je podlaha, ne cíl.',
    },
    {
      question: 'Můžu dohodu po podpisu vzít zpět?',
      answer:
        'Jednostranně ne. Dohoda je dvoustranné právní jednání a její zrušení vyžaduje souhlas druhé strany.',
    },
  ],
}
