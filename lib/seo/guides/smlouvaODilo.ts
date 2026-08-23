import type { ContractGuide } from './types'

export const SMLOUVA_O_DILO: ContractGuide = {
  slug: 'smlouva-o-dilo',
  generatorHint: 'Smlouva o dílo',
  metaTitle: 'Smlouva o dílo — vzor a návrh podle českého práva',
  metaDescription:
    'Co musí smlouva o dílo obsahovat podle § 2586 a násl. občanského zákoníku, jak ošetřit cenu a vícepráce, časté chyby a jak si připravit vlastní návrh.',
  h1: 'Smlouva o dílo',
  perex:
    'Smlouvou o dílo se zhotovitel zavazuje provést na svůj náklad a nebezpečí dílo a objednatel se zavazuje dílo převzít a zaplatit cenu. Používá se na stavební práce, zakázkovou výrobu, IT vývoj i grafiku. Nejvíc sporů vzniká kolem vymezení díla, ceny a víceprací.',
  legalBasis: '§ 2586–2635 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení smluvních stran',
      body:
        'Objednatel a zhotovitel s identifikačními údaji. U podnikatele IČO a údaj o zápisu ve veřejném rejstříku.',
    },
    {
      title: 'Vymezení díla',
      body:
        'Co přesně má vzniknout — rozsah, technická specifikace, materiál, případně odkaz na projektovou dokumentaci nebo zadání jako přílohu. Čím konkrétnější, tím méně prostoru pro spor.',
      law: '§ 2586 NOZ',
    },
    {
      title: 'Cena díla',
      body:
        'Buď pevná částka, nebo alespoň způsob jejího určení. Je-li cena určena podle rozpočtu, uveďte, zda je rozpočet závazný a úplný — na tom závisí, kdo nese riziko víceprací.',
      law: '§ 2586, § 2620 NOZ',
    },
    {
      title: 'Termín provedení',
      body:
        'Datum dokončení, případně dílčí milníky. U delších zakázek se vyplatí navázat platby na milníky a stanovit, co se stane při prodlení.',
    },
    {
      title: 'Předání a převzetí díla',
      body:
        'Způsob předání, přejímací řízení a protokol. Dílo je provedeno, je-li dokončeno a předáno — od převzetí běží lhůty pro vady.',
      law: '§ 2604, § 2605 NOZ',
    },
    {
      title: 'Odpovědnost za vady a záruka',
      body:
        'Zákonná odpovědnost za vady platí i bez ujednání; záruka za jakost je nad její rámec a musí být sjednána výslovně, s uvedením délky.',
      law: '§ 2615–2619 NOZ',
    },
    {
      title: 'Závěrečná ustanovení a podpisy',
      body:
        'Rozhodné právo, řešení sporů, forma změn smlouvy a podpisy obou stran.',
    },
  ],

  pitfalls: [
    {
      title: 'Vágní popis díla',
      body:
        '„Rekonstrukce koupelny“ bez specifikace rozsahu a materiálů je nejčastější zdroj sporu o to, co bylo součástí ceny.',
      law: '§ 2586 NOZ',
    },
    {
      title: 'Vícepráce bez písemného dodatku',
      body:
        'Ústní pokyn na dodatečné práce se špatně prokazuje. Sjednejte, že změna rozsahu i ceny vyžaduje písemný dodatek — a dodržujte to.',
      law: '§ 2612 NOZ',
    },
    {
      title: 'Nejasný status rozpočtu',
      body:
        'Rozpočet může být závazný, nezávazný, úplný či neúplný — a podle toho se liší, zda může zhotovitel žádat víc. Bez určení se dohadují obě strany.',
      law: '§ 2620–2622 NOZ',
    },
    {
      title: 'Převzetí bez protokolu',
      body:
        'Bez protokolu se obtížně prokazuje, kdy bylo dílo předáno a s jakými výhradami. Od převzetí přitom běží lhůty.',
      law: '§ 2604 a § 2605 NOZ',
    },
    {
      title: 'Zaměňování záruky a odpovědnosti za vady',
      body:
        'Odpovědnost za vady plyne ze zákona. Záruka za jakost vzniká jen výslovným ujednáním — „zákonná záruka 24 měsíců“ u díla mezi podnikateli neplatí automaticky.',
      law: '§ 2113 ve spojení s § 2615 NOZ',
    },
  ],

  faq: [
    {
      question: 'Musí být smlouva o dílo písemná?',
      answer:
        'Zákon obecně písemnou formu nevyžaduje, u zakázek nad rámec drobných prací se ale rozhodně doporučuje — bez písemné smlouvy se prokazuje rozsah díla i sjednaná cena velmi obtížně.',
    },
    {
      question: 'Kdy mohu žádat vyšší cenu za vícepráce?',
      answer:
        'Záleží na tom, jak byla cena určena. Byla-li určena podle závazného a úplného rozpočtu, nelze cenu zvýšit jen proto, že si dílo vyžádalo více práce (§ 2620 NOZ). U neúplného nebo nezávazného rozpočtu jsou podmínky jiné (§ 2621–2622 NOZ). Změnu je vždy nejlepší podchytit dodatkem.',
    },
    {
      question: 'Kdy je dílo provedeno?',
      answer:
        'Dílo je provedeno, je-li dokončeno a předáno (§ 2604 NOZ). Objednatel převezme dílo s výhradami, nebo bez nich — a právě od převzetí se odvíjí lhůty pro uplatnění vad.',
    },
    {
      question: 'Komu patří dílo před předáním?',
      answer:
        'Zhotovitel provádí dílo na svůj náklad a nebezpečí. Vlastnické právo a nebezpečí škody se řídí § 2599 a násl. NOZ a je vhodné okamžik přechodu ve smlouvě výslovně ujednat.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 je nástroj pro přípravu pracovního návrhu a orientační kontrolu textu. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii; u zakázek s vyšší hodnotou nechte návrh zkontrolovat advokátem.',
    },
  ],
}
