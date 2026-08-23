import type { ContractGuide } from './types'

export const DOHODA_O_PROVEDENI_PRACE: ContractGuide = {
  slug: 'dohoda-o-provedeni-prace',
  generatorHint: 'Dohoda o provedení práce (DPP)',
  metaTitle: 'Dohoda o provedení práce (DPP) — vzor a návrh podle zákoníku práce',
  metaDescription:
    'Co musí obsahovat dohoda o provedení práce, limit 300 hodin, minimální odměna, dovolená a zrušení dohody. Časté chyby a jak si připravit vlastní návrh.',
  h1: 'Dohoda o provedení práce (DPP)',
  perex:
    'Dohoda o provedení práce je nejrozšířenější způsob, jak si v Česku přivydělat vedle studia nebo hlavního zaměstnání. Není to pracovní smlouva a nezakládá pracovní poměr — proto se na ni nevztahují pravidla o výpovědní době ani nárok na čtyři týdny dovolené. Zákon ji omezuje třemi sty hodinami ročně u jednoho zaměstnavatele a vyžaduje písemnou formu.',
  legalBasis: '§ 74–77 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Označení smluvních stran',
      body:
        'Zaměstnavatel obchodní firmou nebo jménem, IČO a sídlem; zaměstnanec jménem, datem narození a bydlištěm. Rodné číslo uvádět nemusíte — datum narození postačí.',
      law: '§ 77 odst. 1 ZP',
    },
    {
      title: 'Vymezení sjednané práce',
      body:
        'Dohoda se uzavírá na konkrétní pracovní úkol. Popište, co má být vykonáno — čím konkrétněji, tím menší prostor pro spor o rozsah práce.',
      law: '§ 75 ZP',
    },
    {
      title: 'Doba, na kterou se dohoda uzavírá',
      body:
        'Uveďte období, ve kterém má být práce provedena, nebo termín splnění úkolu. Bez časového vymezení není zřejmé, kdy závazek končí.',
      law: '§ 75 ZP',
    },
    {
      title: 'Rozsah práce — nejvýše 300 hodin ročně',
      body:
        'Jde o strop pro všechny dohody o provedení práce u téhož zaměstnavatele v jednom kalendářním roce dohromady. Máte-li u jedné firmy dvě DPP, sčítají se. Potřebujete-li víc, přichází v úvahu dohoda o pracovní činnosti nebo pracovní poměr.',
      law: '§ 75 ZP',
    },
    {
      title: 'Odměna a její splatnost',
      body:
        'Odměna nesmí být nižší než minimální mzda přepočtená na hodinu. Splatnost je nejpozději v kalendářním měsíci následujícím po měsíci, ve kterém nárok vznikl — dřívější termín je pro zaměstnance výhodnější a nic mu nebrání.',
      law: '§ 111 a § 141 ZP',
    },
    {
      title: 'Místo výkonu práce',
      body:
        'Není povinnou náležitostí jako u pracovní smlouvy, ale patří tam. Od místa se odvíjí i případné cestovní náhrady, pokud si je strany sjednají.',
    },
    {
      title: 'Písemná forma',
      body:
        'Dohoda musí být písemná a jedno vyhotovení obdrží zaměstnanec. Ústně sjednaná dohoda je vadná.',
      law: '§ 77 odst. 1 ZP',
    },
  ],

  pitfalls: [
    {
      title: 'Kopírování pracovní smlouvy',
      body:
        'Nejčastější chyba. Do dohody se přenese výpovědní doba podle § 51, nárok na čtyři týdny dovolené podle § 213 nebo odstupné — všechno ustanovení, která se na dohodu nevztahují. Buď nic neznamenají, nebo matou.',
      law: '§ 77 odst. 2 ZP',
    },
    {
      title: 'Překročení tří set hodin',
      body:
        'Limit platí na součet všech DPP u jednoho zaměstnavatele za kalendářní rok. Práce nad limit se posuzuje jako výkon práce bez platného právního titulu a hrozí pokuta od inspektorátu práce.',
      law: '§ 75 ZP',
    },
    {
      title: 'Očekávání dovolené jako v pracovním poměru',
      body:
        'Od 1. 1. 2024 vzniká právo na dovolenou i z dohody, ale za jiných podmínek: pracovněprávní vztah musí v kalendářním roce nepřetržitě trvat alespoň 28 dní a zaměstnanec musí odpracovat alespoň 80 hodin. Nejde o nárok na čtyři týdny.',
      law: '§ 77 odst. 8 ZP',
    },
    {
      title: 'Nejasnosti kolem ukončení',
      body:
        'Není-li ujednáno jinak, lze dohodu zrušit dohodou stran, výpovědí z jakéhokoli důvodu i bez důvodu s patnáctidenní lhůtou počínající dnem doručení, nebo okamžitým zrušením v případech, kdy lze okamžitě zrušit pracovní poměr. Chybějící ujednání není vada — uplatní se zákon.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Chybějící rozvrh pracovní doby',
      body:
        'Zaměstnavatel musí pracovní dobu předem rozvrhnout písemně a seznámit s ní zaměstnance nejpozději tři dny předem, pokud se strany nedohodnou na jiné lhůtě. Kratší lhůta je přípustná, ale musí být sjednána.',
      law: '§ 74 odst. 2 ZP',
    },
    {
      title: 'Záměna s dohodou o pracovní činnosti',
      body:
        'DPČ nemá roční hodinový strop, ale rozsah práce nesmí v průměru překročit polovinu stanovené týdenní pracovní doby, posuzováno nejvýše za 52 týdnů. Pro pravidelnou práci po celý rok je vhodnější DPČ.',
      law: '§ 76 ZP',
    },
  ],

  faq: [
    {
      question: 'Kolik hodin lze na DPP odpracovat?',
      answer:
        'Nejvýše 300 hodin v kalendářním roce u jednoho zaměstnavatele. U jiného zaměstnavatele běží limit samostatně, takže souběh více DPP u různých firem je možný.',
    },
    {
      question: 'Musí být dohoda o provedení práce písemně?',
      answer:
        'Ano, § 77 odst. 1 zákoníku práce vyžaduje písemnou formu a jedno vyhotovení musí zaměstnavatel vydat zaměstnanci.',
    },
    {
      question: 'Má zaměstnanec na DPP nárok na dovolenou?',
      answer:
        'Od roku 2024 ano, ale jen pokud vztah v kalendářním roce nepřetržitě trval alespoň 28 dní a zaměstnanec odpracoval alespoň 80 hodin. Podmínky se liší od pracovního poměru.',
    },
    {
      question: 'Jak se dohoda o provedení práce ukončuje?',
      answer:
        'Dohodou stran, výpovědí i bez udání důvodu s patnáctidenní lhůtou od doručení, nebo okamžitým zrušením ze zákonných důvodů. Výpovědní doba podle § 51 se na dohodu nevztahuje.',
    },
    {
      question: 'Jaká je minimální odměna na DPP?',
      answer:
        'Odměna nesmí být nižší než minimální mzda přepočtená na hodinu. U řady prací je navíc závazná vyšší zaručená mzda podle skupiny prací.',
    },
    {
      question: 'Je DPP totéž co brigáda?',
      answer:
        'Brigáda je hovorové označení, právně jde nejčastěji právě o dohodu o provedení práce nebo o dohodu o pracovní činnosti. Zákoník práce pojem brigáda nezná.',
    },
  ],
}
