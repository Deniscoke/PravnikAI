import type { Comparison } from './types'
import { MINIMUM_HOURLY_WAGE_CZK } from '@/lib/legal/czechLegalFacts'

const HOURLY = MINIMUM_HOURLY_WAGE_CZK.value.toLocaleString('cs-CZ')

export const DPP_NEBO_DPC: Comparison = {
  slug: 'dpp-nebo-dpc',
  leftGuideSlug: 'dohoda-o-provedeni-prace',
  rightGuideSlug: 'dohoda-o-pracovni-cinnosti',
  leftLabel: 'DPP',
  rightLabel: 'DPČ',

  metaTitle: 'DPP nebo DPČ? Rozdíly, limity hodin a co se vyplatí',
  metaDescription:
    'Rozhoduje rozsah práce: DPP má strop 300 hodin ročně, DPČ v průměru polovinu týdenní doby. Ostatní pravidla mají obě dohody společná.',
  h1: 'DPP, nebo DPČ?',
  perex:
    'Obě dohody stojí mimo pracovní poměr a v drtivé většině pravidel se chovají stejně — forma, ukončení, dovolená i minimální odměna jsou společné. Liší se v jediném, zato podstatném: v tom, kolik se na ně smí odpracovat.',
  legalBasis: '§ 75 až § 77 zák. č. 262/2006 Sb., zákoník práce',

  verdict:
    'Rozhoduje rozsah práce. Nepřesáhne-li u jednoho zaměstnavatele 300 hodin za kalendářní rok, stačí DPP. Má-li se pracovat pravidelně každý týden a součet by 300 hodin překročil, je namístě DPČ — u té není strop v hodinách, ale rozsah nesmí v průměru překročit polovinu stanovené týdenní pracovní doby.',

  rows: [
    {
      criterion: 'Limit rozsahu práce',
      left: 'Nejvýše 300 hodin v kalendářním roce u jednoho zaměstnavatele',
      right: 'V průměru nejvýše polovina stanovené týdenní pracovní doby, tedy zpravidla 20 hodin týdně',
      law: '§ 75 a § 76 odst. 2 ZP',
    },
    {
      criterion: 'Jak se limit počítá',
      left: 'Součet hodin za kalendářní rok',
      right: 'Průměr posuzovaný nejvýše za 52 týdnů — nerovnoměrné rozložení je možné',
      law: '§ 76 odst. 3 ZP',
    },
    {
      criterion: 'Forma',
      left: 'Písemně, každá strana obdrží jedno vyhotovení',
      right: 'Písemně, každá strana obdrží jedno vyhotovení',
      law: '§ 77 odst. 1 ZP',
    },
    {
      criterion: 'Ukončení',
      left: 'Dohodou, výpovědí s patnáctidenní dobou od doručení i bez důvodu, nebo okamžitým zrušením',
      right: 'Totožné',
      law: '§ 77 odst. 4 ZP',
    },
    {
      criterion: 'Výpovědní důvody a odstupné',
      left: 'Nevztahují se — § 52 ani § 67 na dohodu nedopadají',
      right: 'Nevztahují se',
      law: '§ 77 odst. 4 ZP',
    },
    {
      criterion: 'Ochranná doba při nemoci',
      left: 'Neuplatní se',
      right: 'Neuplatní se',
      law: '§ 53 ZP',
    },
    {
      criterion: 'Dovolená',
      left: 'Vzniká při trvání alespoň 28 dní a 80 odpracovaných hodinách',
      right: 'Totožné',
      law: '§ 77 odst. 8 ZP',
    },
    {
      criterion: 'Minimální odměna',
      left: `Nejméně ${HOURLY} Kč za hodinu`,
      right: `Nejméně ${HOURLY} Kč za hodinu`,
      law: MINIMUM_HOURLY_WAGE_CZK.law,
    },
    {
      criterion: 'Rozvrh pracovní doby',
      left: 'Předem písemně, seznámení 3 dny předem; kratší lhůtu lze sjednat',
      right: 'Totožné',
      law: '§ 74 odst. 2 ZP',
    },
  ],

  chooseLeft: {
    title: 'Kdy zvolit DPP',
    bullets: [
      'Práce je nárazová nebo sezonní a roční součet zůstane pod 300 hodinami.',
      'Spolupráce je krátkodobá — brigáda, výpomoc, jednorázová zakázka.',
      'Rozsah kolísá a nechcete se vázat na pravidelný týdenní objem.',
    ],
  },

  chooseRight: {
    title: 'Kdy zvolit DPČ',
    bullets: [
      'Pracuje se pravidelně každý týden a 300 hodin ročně by nestačilo.',
      'Spolupráce má trvat déle než pár měsíců.',
      'Rozsah je nerovnoměrný, ale v průměru nepřekročí polovinu týdenní pracovní doby — průměr se posuzuje až za 52 týdnů.',
    ],
  },

  pitfalls: [
    {
      title: 'Rozdělení práce na dvě DPP u téhož zaměstnavatele',
      body:
        'Strop 300 hodin platí u jednoho zaměstnavatele, nikoli u jedné dohody. Uzavřít se stejným zaměstnavatelem dvě DPP a odpracovat na každé 300 hodin limit neobejde.',
      law: '§ 75 ZP',
    },
    {
      title: 'Domněnka, že u DPČ platí strop 300 hodin',
      body:
        'U DPČ žádný roční strop v hodinách není. Omezením je průměr — nejvýše polovina stanovené týdenní pracovní doby, posuzováno až za 52 týdnů.',
      law: '§ 76 odst. 2 a 3 ZP',
    },
    {
      title: 'Použití vzoru pracovní smlouvy pro kteroukoli z nich',
      body:
        'Do dohody se pak dostanou výpovědní důvody podle § 52, dvouměsíční výpovědní doba nebo odstupné podle § 67 — na dohodu nedopadá nic z toho.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Dohoda tam, kde jde ve skutečnosti o závislou práci',
      body:
        'Rozhoduje obsah, ne název. Práce ve vztahu nadřízenosti a podřízenosti, podle pokynů a osobně vykonávaná musí být konána v pracovněprávním vztahu — a dohoda konaná mimo pracovní poměr jím sice je, ale nesmí zastírat plný úvazek.',
      law: '§ 2 a § 3 ZP',
    },
  ],

  faq: [
    {
      question: 'Co je výhodnější, DPP nebo DPČ?',
      answer:
        'Nejde o výhodnost, ale o rozsah práce. Do 300 hodin ročně u jednoho zaměstnavatele stačí DPP; při pravidelné práci každý týden je namístě DPČ. Ostatní podmínky jsou u obou dohod prakticky shodné.',
    },
    {
      question: 'Kolik hodin můžu odpracovat na DPP?',
      answer:
        'Nejvýše 300 hodin v kalendářním roce u jednoho zaměstnavatele. U jiného zaměstnavatele běží limit znovu.',
    },
    {
      question: 'Kolik hodin můžu odpracovat na DPČ?',
      answer:
        'Roční strop v hodinách u DPČ není. Rozsah nesmí v průměru překročit polovinu stanovené týdenní pracovní doby, přičemž průměr se posuzuje nejvýše za 52 týdnů.',
    },
    {
      question: 'Liší se ukončení DPP a DPČ?',
      answer:
        'Ne. U obou platí § 77 odst. 4 — dohodou ke sjednanému dni, výpovědí s patnáctidenní výpovědní dobou od doručení i bez udání důvodu, nebo okamžitým zrušením v případech, kdy lze okamžitě zrušit pracovní poměr.',
    },
    {
      question: 'Mám na dohodu nárok na dovolenou?',
      answer:
        'U obou stejně: právo vzniká, trval-li vztah v kalendářním roce nepřetržitě alespoň 28 dní a odpracovali jste alespoň 80 hodin.',
    },
    {
      question: 'Můžu mít DPP a DPČ současně?',
      answer:
        'Ano, i u téhož zaměstnavatele, jde-li o jiný druh práce. Limity se posuzují u každé dohody podle jejího vlastního pravidla.',
    },
  ],
}
