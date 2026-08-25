import type { ContractGuide } from './types'
import { MINIMUM_HOURLY_WAGE_CZK } from '@/lib/legal/czechLegalFacts'

const HOURLY = MINIMUM_HOURLY_WAGE_CZK.value.toLocaleString('cs-CZ')

export const DOHODA_O_PRACOVNI_CINNOSTI: ContractGuide = {
  slug: 'dohoda-o-pracovni-cinnosti',
  generatorHint: 'Dohoda o pracovní činnosti (DPČ)',
  metaTitle: 'Dohoda o pracovní činnosti (DPČ) — vzor a rozsah podle § 76 ZP',
  metaDescription:
    'Kolik hodin lze na DPČ odpracovat, jak se ruší patnáctidenní výpovědí, kdy vzniká dovolená a proč se na dohodu nevztahují pravidla pracovního poměru.',
  h1: 'Dohoda o pracovní činnosti (DPČ)',
  perex:
    'Sourozenec dohody o provedení práce, a plete se s ní i s pracovní smlouvou. DPČ nemá roční strop tři sta hodin, zato nesmí v průměru překročit polovinu stanovené týdenní pracovní doby. A stejně jako u DPP se na ni nevztahuje aparát kolem pracovního poměru: žádné výpovědní důvody, žádná dvouměsíční výpovědní doba, žádné odstupné. Patnáct dnů ode dne doručení, z obou stran, i bez udání důvodu.',
  legalBasis: '§ 76 a § 77 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Písemná forma a vyhotovení pro obě strany',
      body:
        'Dohoda musí být písemná a každá strana musí obdržet jedno vyhotovení. Ústní ujednání dohodu nezaloží.',
      law: '§ 77 odst. 1 ZP',
    },
    {
      title: 'Sjednaná práce',
      body:
        'Vymezte, jakou práci zaměstnanec vykonává. U dohody jde o konkrétní činnost, ne o druh práce v celé jeho šíři jako u pracovní smlouvy.',
      law: '§ 76 odst. 1 ZP',
    },
    {
      title: 'Rozsah práce',
      body:
        'Na DPČ nelze pracovat v rozsahu překračujícím v průměru polovinu stanovené týdenní pracovní doby — u čtyřicetihodinového týdne tedy v průměru dvacet hodin. Průměr se posuzuje nejvýše za 52 týdnů, takže nerovnoměrné rozložení je možné.',
      law: '§ 76 odst. 2 a 3 ZP',
    },
    {
      title: 'Doba, na kterou se dohoda uzavírá',
      body:
        'Určitá, nebo neurčitá. Na rozdíl od pracovního poměru se na DPČ nevztahuje pravidlo o řetězení na dobu určitou podle § 39.',
      law: '§ 76 odst. 4 ZP',
    },
    {
      title: 'Odměna a její splatnost',
      body:
        `Odměna nesmí být nižší než minimální mzda přepočtená na hodinu — od ${MINIMUM_HOURLY_WAGE_CZK.effectiveFrom} činí ${HOURLY} Kč za hodinu. Pro řadu prací je závazná vyšší zaručená mzda. Uveďte i splatnost.`,
      law: MINIMUM_HOURLY_WAGE_CZK.law,
    },
    {
      title: 'Rozvrh pracovní doby',
      body:
        'Zaměstnavatel musí pracovní dobu předem rozvrhnout písemným rozvrhem a seznámit s ním zaměstnance nejpozději tři dny před začátkem směny nebo období. Kratší lhůtu lze v dohodě sjednat.',
      law: '§ 74 odst. 2 ZP',
    },
  ],

  pitfalls: [
    {
      title: 'Záměna limitu s tříma sty hodinami',
      body:
        'Roční strop tři sta hodin patří dohodě o provedení práce. U DPČ jde o průměr — nejvýše polovina stanovené týdenní pracovní doby, posuzováno až za 52 týdnů.',
      law: '§ 76 odst. 2 ZP',
    },
    {
      title: 'Použití vzoru pracovní smlouvy',
      body:
        'Do dohody se pak dostanou výpovědní důvody podle § 52, dvouměsíční výpovědní doba nebo odstupné podle § 67. Na dohodu se nevztahuje ani jedno z toho.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Očekávání dovolené v rozsahu čtyř týdnů',
      body:
        'Právo na dovolenou z dohody vzniká od 1. ledna 2024, ale jen trval-li vztah v kalendářním roce nepřetržitě alespoň 28 dní a zaměstnanec odpracoval alespoň 80 hodin. Není to nárok podle § 213.',
      law: '§ 77 odst. 8 ZP',
    },
    {
      title: 'Výpovědní doba počítaná od dalšího měsíce',
      body:
        'Není-li v dohodě sjednáno jinak, činí výpovědní doba patnáct dnů a běží dnem, v němž byla výpověď doručena. Nezačíná prvním dnem následujícího měsíce.',
      law: '§ 77 odst. 4 písm. b) ZP',
    },
    {
      title: 'Rozšíření odpovědnosti za škodu',
      body:
        'Odpovědnost zaměstnance za škodu z nedbalosti je omezena čtyřapůlnásobkem průměrného měsíčního výdělku. Dohodou nelze tento strop rozšířit ani nahradit obecnou odpovědností.',
      law: '§ 257 odst. 2 ZP',
    },
    {
      title: 'Chybějící rozvrh pracovní doby',
      body:
        'Možnost zaměstnavatele měnit směny bez jakéhokoli oznámení je vada. Zákon žádá předem sestavený písemný rozvrh; jen lhůtu seznámení lze zkrátit dohodou.',
      law: '§ 74 odst. 2 ZP',
    },
    {
      title: 'Spoléhání na to, že se z odměny neodvádí',
      body:
        'U DPČ vzniká účast na pojištění při dosažení takzvaného rozhodného příjmu. Ten se každoročně valorizuje a jeho výši pro daný rok vyhlašuje MPSV — zákonná základní částka je 4 500 Kč. Aktuální hodnotu si vždy ověřte, neboť se mění k 1. lednu.',
      law: '§ 6 odst. 2 zák. č. 187/2006 Sb.',
    },
  ],

  faq: [
    {
      question: 'Kolik hodin můžu odpracovat na DPČ?',
      answer:
        'V průměru nejvýše polovinu stanovené týdenní pracovní doby, tedy zpravidla dvacet hodin týdně. Průměr se posuzuje nejvýše za 52 týdnů, takže v některých týdnech můžete odpracovat víc a v jiných méně.',
    },
    {
      question: 'Jaký je rozdíl mezi DPP a DPČ?',
      answer:
        'DPP má roční strop tři sta hodin u jednoho zaměstnavatele. DPČ strop v hodinách nemá, ale nesmí překročit v průměru polovinu stanovené týdenní pracovní doby. Pravidla pro formu, zrušení i dovolenou mají obě společná.',
    },
    {
      question: 'Jak se DPČ ukončuje?',
      answer:
        'Dohodou stran ke sjednanému dni, výpovědí z jakéhokoli důvodu nebo bez uvedení důvodu s patnáctidenní výpovědní dobou od doručení, nebo okamžitým zrušením v případech, kdy lze okamžitě zrušit pracovní poměr.',
    },
    {
      question: 'Musím uvést důvod výpovědi?',
      answer:
        'Ne. Dohodu lze vypovědět i bez udání důvodu, a to oběma stranami. Výpovědní důvody podle § 52 se na dohodu nevztahují.',
    },
    {
      question: 'Mám na DPČ nárok na dovolenou?',
      answer:
        'Ano, ale jen trval-li pracovněprávní vztah v kalendářním roce nepřetržitě alespoň 28 dní a odpracovali jste alespoň 80 hodin. Rozsah se počítá jinak než u pracovního poměru.',
    },
    {
      question: 'Kolik musím dostat zaplaceno?',
      answer:
        `Nejméně minimální mzdu přepočtenou na hodinu, což od ${MINIMUM_HOURLY_WAGE_CZK.effectiveFrom} činí ${HOURLY} Kč. Pro řadu prací je závazná vyšší zaručená mzda podle skupiny prací.`,
    },
    {
      question: 'Náleží mi odstupné?',
      answer:
        'Ne. Odstupné podle § 67 zákoníku práce se váže na skončení pracovního poměru z organizačních důvodů a na dohody konané mimo pracovní poměr nedopadá.',
    },
    {
      question: 'Odvádí se z DPČ pojistné?',
      answer:
        'Účast na pojištění vzniká při dosažení rozhodného příjmu za kalendářní měsíc. Jeho výše se každoročně valorizuje a vyhlašuje ji MPSV, proto si aktuální částku pro daný rok ověřte u ČSSZ nebo své zdravotní pojišťovny.',
    },
  ],
}
