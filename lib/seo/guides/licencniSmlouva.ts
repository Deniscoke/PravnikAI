import type { ContractGuide } from './types'

export const LICENCNI_SMLOUVA: ContractGuide = {
  slug: 'licencni-smlouva',
  generatorHint: 'Licenční smlouva',
  metaTitle: 'Licenční smlouva — vzor a proč autorská práva nelze převést',
  metaDescription:
    'Autorská práva jsou nepřevoditelná — poskytuje se licence. Bez uvedení území a doby platí ČR a jeden rok. Co dál doplní zákon v neprospěch nabyvatele.',
  h1: 'Licenční smlouva',
  perex:
    'Věta „autor převádí na objednatele veškerá autorská práva" je v polovině českých IT, grafických a marketingových smluv — a je právně nemožná. Majetková i osobnostní autorská práva jsou nepřevoditelná; poskytnout lze jedině licenci. Druhá věc, kterou vzory přehlížejí: neuvedete-li územní a časový rozsah, zákon je doplní sám, a to úsporně — Česká republika a nejvýše jeden rok. Smlouva, která zní neomezeně, tak bývá roční a tuzemská.',
  legalBasis: '§ 2358–2383 zák. č. 89/2012 Sb. a zák. č. 121/2000 Sb., autorský zákon',

  mustContain: [
    {
      title: 'Jednoznačné vymezení díla',
      body:
        'Název, druh, forma a rozsah díla, ideálně s přílohou. U softwaru uveďte verzi a výslovně to, zda licence zahrnuje zdrojový kód — po skončení spolupráce je to nejčastější spor.',
      law: '§ 2358 a § 2371 NOZ',
    },
    {
      title: 'Způsoby užití',
      body:
        'Rozmnožování, rozšiřování, sdělování veřejnosti, úprava, zpracování, zařazení do jiného díla. Neujedná-li se nic, má se za to, že licence pokrývá jen to, co je nutné k dosažení účelu smlouvy — obvykle výrazně méně, než nabyvatel očekává.',
      law: '§ 2376 odst. 2 NOZ',
    },
    {
      title: 'Výhradnost',
      body:
        'Výslovně: výhradní, nebo nevýhradní. Bez výslovného ujednání je licence nevýhradní a poskytovatel může totéž poskytnout komukoli dalšímu.',
      law: '§ 2362 NOZ',
    },
    {
      title: 'Územní, časový a množstevní rozsah',
      body:
        'Chcete-li licenci celosvětovou a na dobu trvání majetkových práv, musí to být napsáno. Jinak zákon doplní území České republiky a dobu obvyklou, nejvýše však jeden rok od poskytnutí licence.',
      law: '§ 2376 odst. 3 NOZ',
    },
    {
      title: 'Odměna, nebo výslovná bezúplatnost',
      body:
        'Buď výše odměny či způsob jejího určení, nebo výslovné ujednání, že se licence poskytuje bezúplatně. Chybí-li obojí a z jednání plyne vůle uzavřít smlouvu úplatnou, platí odměna obvyklá — tedy otevřený spor.',
      law: '§ 2366 odst. 1 NOZ',
    },
    {
      title: 'Podlicence a postoupení',
      body:
        'Podlicenci smí nabyvatel poskytnout jen bylo-li to ujednáno; mlčení znamená zákaz. Postoupit licenci lze jen s písemným souhlasem poskytovatele — s výjimkou převodu obchodního závodu.',
      law: '§ 2363 a § 2364 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Smlouva psaná jako převod autorských práv',
      body:
        'Nejzávažnější a nejčastější vada, obvykle převzatá z amerických vzorů. Majetkových práv se autor nemůže vzdát a jsou nepřevoditelná; totéž platí o osobnostních právech. Taková smlouva nepřevede nic — v lepším případě z ní soud vyloží licenci, ovšem v rozsahu, který si nikdo nezvolil.',
      law: '§ 26 odst. 1 a § 11 odst. 4 autorského zákona',
    },
    {
      title: 'Neuvedený časový rozsah',
      body:
        'Bez ujednání je licence časově omezena na dobu obvyklou u daného druhu díla, nejvýše však na jeden rok. Firma, která zaplatila za logo „navždy", tak může mít licenci na dvanáct měsíců.',
      law: '§ 2376 odst. 3 písm. b) NOZ',
    },
    {
      title: 'Neuvedené území',
      body:
        'Bez ujednání se licence omezí na území České republiky. U e-shopu nebo aplikace dostupné odkudkoli to bývá v přímém rozporu se záměrem.',
      law: '§ 2376 odst. 3 písm. a) NOZ',
    },
    {
      title: 'Výhradní licence bez výhrady pro autora',
      body:
        'U výhradní licence se poskytovatel zdrží i vlastního výkonu práva, není-li výslovně ujednán opak. Autor pak nesmí dílo ukázat ani ve svém portfoliu — což si zpravidla neuvědomí ani jedna strana.',
      law: '§ 2360 odst. 1 NOZ',
    },
    {
      title: 'Licence „i ke způsobům užití dosud neznámým"',
      body:
        'Autor může poskytnout oprávnění jen ke způsobům užití známým v době uzavření smlouvy. K opačnému ujednání se nepřihlíží — nabyvateli to tedy nic nepřidá.',
      law: '§ 2372 odst. 1 NOZ',
    },
    {
      title: 'Vyloučení práva autora na dodatečnou odměnu',
      body:
        'Je-li ujednaná odměna ve zřejmém nepoměru k výnosům z licence, může autor žádat přiměřenou dodatečnou odměnu. K ujednáním, která toto právo vylučují nebo omezují, se nepřihlíží — a to i tehdy, vzdá-li se autor tohoto práva výslovně. Klauzule tedy vzbuzuje jen falešnou jistotu.',
      law: '§ 2374 odst. 2 NOZ',
    },
    {
      title: 'Zapomenutá podlicence u agentury',
      body:
        'Agentura, která dílo předává svému klientovi, potřebuje výslovné oprávnění poskytnout podlicenci. Bez něj nesmí klientovi předat nic, i kdyby to byl celý smysl zakázky.',
      law: '§ 2363 NOZ',
    },
    {
      title: 'Licence od vlastního zaměstnance',
      body:
        'U zaměstnaneckého díla vykonává majetková práva zaměstnavatel svým jménem a na svůj účet už ze zákona. Licenční smlouva se zaměstnancem je nadbytečná a nešikovně sepsaná může zaměstnavateli to, co má, naopak zúžit.',
      law: '§ 58 odst. 1 autorského zákona',
    },
    {
      title: 'Spoléhání na dílo vytvořené na objednávku',
      body:
        'U díla podle smlouvy o dílo platí licence jen k účelu vyplývajícímu ze smlouvy. K užití nad tento rámec — dalšímu prodeji, licencování jinému — je třeba samostatná licenční smlouva. Autor navíc může dílo sám užít, není-li to v rozporu s oprávněnými zájmy objednatele.',
      law: '§ 61 autorského zákona',
    },
    {
      title: 'Roční výpovědní doba, se kterou nikdo nepočítal',
      body:
        'U licenční smlouvy na dobu neurčitou nabývá výpověď účinnosti až uplynutím jednoho roku od konce kalendářního měsíce, v němž došla druhé straně. Kratší výpovědní dobu je nutné sjednat.',
      law: '§ 2370 NOZ',
    },
  ],

  faq: [
    {
      question: 'Můžu si nechat převést autorská práva k dílu?',
      answer:
        'Nemůžete. Majetková ani osobnostní autorská práva nelze převést a autor se jich nemůže vzdát. Poskytnout lze jedině licenci — oprávnění dílo užít ve sjednaném rozsahu.',
    },
    {
      question: 'Jak dlouho licence platí, když ve smlouvě není doba?',
      answer:
        'Po dobu obvyklou u daného druhu díla a způsobu užití, nejvýše však jeden rok od poskytnutí licence. Má-li být dílo odevzdáno později, běží lhůta od odevzdání.',
    },
    {
      question: 'Platí licence i v zahraničí?',
      answer:
        'Bez ujednání je omezena na území České republiky. Celosvětový rozsah je třeba ve smlouvě uvést.',
    },
    {
      question: 'Je licence automaticky výhradní, když jsem za ni zaplatil?',
      answer:
        'Není. Bez výslovného ujednání výhradnosti jde o licenci nevýhradní, i kdyby byla odměna vysoká.',
    },
    {
      question: 'Smí autor po udělení výhradní licence dílo dál používat?',
      answer:
        'Bez výslovného ujednání ne — u výhradní licence se poskytovatel zdrží i vlastního výkonu práva. Chce-li autor dílo ukazovat v portfoliu, musí si to vymínit.',
    },
    {
      question: 'Potřebuji licenci od zaměstnance?',
      answer:
        'U díla, které vytvořil ke splnění pracovních povinností, ne. Majetková práva vykonává zaměstnavatel svým jménem a na svůj účet, není-li ujednáno jinak.',
    },
    {
      question: 'Objednal jsem dílo smlouvou o dílo. Můžu ho prodat dál?',
      answer:
        'Jen na základě licenční smlouvy. Ze smlouvy o dílo plyne licence pouze k účelu, který z ní vyplývá; užití nad tento rámec je třeba sjednat zvlášť.',
    },
    {
      question: 'Musí být licenční smlouva písemná?',
      answer:
        'Jen poskytuje-li se licence jako výhradní, nebo má-li být zapsána do veřejného seznamu. Nevýhradní licenci lze poskytnout i jinak — třeba přijetím licenčních podmínek.',
    },
    {
      question: 'Můžu se ve smlouvě vzdát nároku na dodatečnou odměnu?',
      answer:
        'Nemůžete s účinkem. K ujednáním, která právo autora na dodatečnou odměnu vylučují nebo omezují, se nepřihlíží, a to i v případě výslovného vzdání se.',
    },
  ],
}
