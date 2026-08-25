import type { Comparison } from './types'

export const DILO_NEBO_SLUZBY: Comparison = {
  slug: 'smlouva-o-dilo-nebo-o-poskytovani-sluzeb',
  leftGuideSlug: 'smlouva-o-dilo',
  rightGuideSlug: 'smlouva-o-poskytovani-sluzeb',
  leftLabel: 'Smlouva o dílo',
  rightLabel: 'Smlouva o službách',

  metaTitle: 'Smlouva o dílo, nebo o poskytování služeb? Výsledek vs. činnost',
  metaDescription:
    'U díla se slibuje výsledek a nese se riziko, že nastane. U služby činnost s odbornou péčí. Rozhoduje obsah, ne název dokumentu.',
  h1: 'Smlouva o dílo, nebo o poskytování služeb?',
  perex:
    'Pro freelancery a agentury nejčastější rozhodnutí a nejčastěji chybné. Rozdíl není v tom, jak je dokument nadepsaný, ale v tom, co se slibuje: hotový výsledek, který se předává a přebírá, nebo činnost prováděná s odbornou péčí. Na tom pak závisí, kdo nese riziko, kdy vzniká nárok na zaplacení a jaký režim platí pro vady.',
  legalBasis: '§ 1746 odst. 2, § 2430 a násl. a § 2586 a násl. zák. č. 89/2012 Sb.',

  verdict:
    'Slibujete-li konkrétní výsledek, který objednatel převezme, jde o dílo — a nese se riziko, že výsledek nastane. Slibujete-li činnost prováděnou s odbornou péčí bez záruky výstupu, jde o službu. Rozhoduje obsah závazku, nikoli název dokumentu.',

  rows: [
    {
      criterion: 'Co se slibuje',
      left: 'Výsledek — dílo se provede, předá a převezme',
      right: 'Činnost prováděná s odbornou péčí',
      law: '§ 2586 a § 2432 NOZ',
    },
    {
      criterion: 'Kdo nese riziko výsledku',
      left: 'Zhotovitel — nedosáhne-li výsledku, nesplnil',
      right: 'Nikdo. Poskytovatel odpovídá za péči, ne za výstup',
      law: '§ 2586 NOZ',
    },
    {
      criterion: 'Kdy vzniká nárok na zaplacení',
      left: 'Zpravidla provedením díla, tedy dokončením a předáním',
      right: 'Za poskytnutou činnost, typicky periodicky',
      law: '§ 2604 a § 2610 NOZ',
    },
    {
      criterion: 'Předání a převzetí',
      left: 'Ano, včetně protokolu a výhrad',
      right: 'Nepředává se dílo, vykazuje se poskytnutá služba',
      law: '§ 2605 NOZ',
    },
    {
      criterion: 'Režim vad',
      left: 'Odpovědnost za vady díla',
      right: 'Neuplatní se — odpovídá se za odbornou péči',
      law: '§ 2615 NOZ',
    },
    {
      criterion: 'Ukončení u doby neurčité bez ujednání',
      left: 'Dílo má konec ve svém dokončení',
      right: 'Jen ke konci kalendářního čtvrtletí, tři měsíce předem',
      law: '§ 1999 odst. 1 NOZ',
    },
    {
      criterion: 'Autorská práva k výstupu',
      left: 'Licence k účelu vyplývajícímu ze smlouvy; nad rámec účelu je třeba licenční smlouva',
      right: 'Totéž, jde-li o autorské dílo',
      law: '§ 61 zák. č. 121/2000 Sb.',
    },
    {
      criterion: 'Riziko švarcsystému u OSVČ',
      left: 'Existuje',
      right: 'Existuje a je vyšší — dlouhodobá činnost pro jednoho objednatele',
      law: '§ 2 a § 3 zák. č. 262/2006 Sb.',
    },
  ],

  chooseLeft: {
    title: 'Kdy zvolit smlouvu o dílo',
    bullets: [
      'Máte dodat konkrétní výstup — web, aplikaci, stavbu, návrh, překlad.',
      'Objednatel má výstup převzít a od převzetí běží lhůty.',
      'Cena se váže na hotové dílo, ne na odpracovaný čas.',
    ],
  },

  chooseRight: {
    title: 'Kdy zvolit smlouvu o poskytování služeb',
    bullets: [
      'Poskytujete průběžnou činnost — správu, údržbu, konzultace, účetnictví, marketing.',
      'Výsledek nelze zaručit ani smysluplně vymezit jako předávaný výstup.',
      'Odměna se váže na období nebo rozsah činnosti, ne na dokončení.',
    ],
  },

  pitfalls: [
    {
      title: 'Smlouva o službách, která slibuje měřitelný výsledek',
      body:
        'Slib obratu, počtu zákazníků nebo pozice ve vyhledávači mění povahu závazku. Takový závazek se posuzuje jako dílo a poskytovatel nese riziko, které neovlivní.',
      law: '§ 2586 NOZ',
    },
    {
      title: 'Smlouva o dílo na průběžnou správu',
      body:
        'Správa serverů nebo účetnictví nemá „dílo", které by šlo předat a převzít. Režim předání a odpovědnosti za vady na ni nesedí a spor pak začíná otázkou, co vlastně mělo být dodáno.',
      law: '§ 2605 NOZ',
    },
    {
      title: 'Chybějící ujednání o výpovědi u služeb',
      body:
        'U smlouvy na dobu neurčitou zavazující k opakované činnosti lze bez ujednání skončit jen ke konci kalendářního čtvrtletí a s tříměsíčním předstihem. Kdo počítal s měsíční výpovědí, je vázán déle.',
      law: '§ 1999 odst. 1 NOZ',
    },
    {
      title: 'Spoléhání, že s dílem přejdou i autorská práva',
      body:
        'Nepřejdou — autorská práva jsou nepřevoditelná. U díla na objednávku platí licence jen k účelu vyplývajícímu ze smlouvy; k dalšímu prodeji nebo licencování je třeba licenční smlouva.',
      law: '§ 61 zák. č. 121/2000 Sb.',
    },
    {
      title: 'Znaky závislé práce v kterékoli z nich',
      body:
        'Pracovní doba, dovolená, nadřízený nebo docházka ve smlouvě s OSVČ. Umožnění výkonu závislé práce mimo pracovněprávní vztah je přestupkem s pokutou až 10 000 000 Kč, nejméně však 50 000 Kč.',
      law: '§ 140 zák. č. 435/2004 Sb.',
    },
  ],

  faq: [
    {
      question: 'Jak poznám, jestli jde o dílo, nebo o službu?',
      answer:
        'Podle toho, co se slibuje. Je-li slíben konkrétní výstup, který objednatel převezme, jde o dílo. Je-li slíbena činnost prováděná s odbornou péčí bez záruky výstupu, jde o službu. Název dokumentu na tom nic nemění.',
    },
    {
      question: 'Můžu mít jednu smlouvu na obojí?',
      answer:
        'Lze, ale je lepší oddělit je — například rámcovou smlouvu o službách a jednotlivé objednávky jako dílo. Smíšený dokument se u sporu vykládá po částech a nejistota je pak na obou stranách.',
    },
    {
      question: 'Kdy mám nárok na zaplacení?',
      answer:
        'U díla zpravidla jeho provedením, tedy dokončením a předáním. U služby za poskytnutou činnost, typicky v dohodnutých obdobích.',
    },
    {
      question: 'Platí u služeb odpovědnost za vady jako u díla?',
      answer:
        'Neplatí. Režim vad díla se vztahuje na dílo. U služby se odpovídá za to, že činnost byla provedena s odbornou péčí.',
    },
    {
      question: 'Jak dlouhá je výpovědní doba u smlouvy o službách?',
      answer:
        'Jakou si sjednáte. Bez ujednání lze u smlouvy na dobu neurčitou zavazující k opakované činnosti skončit jen ke konci kalendářního čtvrtletí, a to výpovědí podanou alespoň tři měsíce předem.',
    },
    {
      question: 'Získám s dílem i práva k jeho užití?',
      answer:
        'Licenci k účelu, který ze smlouvy vyplývá. K užití nad tento rámec — dalšímu prodeji, licencování jinému — je třeba samostatná licenční smlouva.',
    },
  ],
}
