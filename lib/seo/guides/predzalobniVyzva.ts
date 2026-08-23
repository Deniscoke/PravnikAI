import type { ContractGuide } from './types'

export const PREDZALOBNI_VYZVA: ContractGuide = {
  slug: 'predzalobni-vyzva',
  generatorHint: 'Předžalobní výzva',
  metaTitle: 'Předžalobní výzva — vzor a lhůta 7 dnů podle § 142a OSŘ',
  metaDescription:
    'Bez předžalobní výzvy vyhrajete spor a náklady si zaplatíte sami. Co musí obsahovat, proč sedm dnů a proč výzva nestaví promlčecí lhůtu.',
  h1: 'Předžalobní výzva k plnění',
  perex:
    'Krátký dopis, který bývá cennější než samotná pohledávka. Bez něj totiž věřitel, který ve sporu o zaplacení uspěje, zpravidla nemá právo na náhradu nákladů řízení — a u menších dluhů převyšují náklady na advokáta samotný dluh. Podmínky jsou tři a všechny se dají snadno minout: odeslat nejméně sedm dnů před podáním žaloby, na adresu pro doručování, ve věci o splnění povinnosti.',
  legalBasis: '§ 142a zák. č. 99/1963 Sb., občanský soudní řád',

  mustContain: [
    {
      title: 'Vymezení pohledávky',
      body:
        'Z čeho dluh vznikl — smlouva nebo faktura, datum, předmět plnění — a jistina v korunách. Bez určitého vymezení nemusí soud výzvu k § 142a vůbec vztáhnout.',
      law: '§ 142a odst. 1 OSŘ',
    },
    {
      title: 'Datum splatnosti',
      body:
        'Den, kdy se dluh stal splatným. Od něj se počítá prodlení i běh úroku z prodlení, takže bez něj nelze příslušenství vůbec vyčíslit.',
      law: '§ 1968 NOZ',
    },
    {
      title: 'Výslovná výzva k zaplacení',
      body:
        'Musí být zřejmé, že dlužníka vyzýváte k úhradě — a kam má zaplatit. Uveďte číslo účtu a variabilní symbol. Pouhé konstatování, že dluh existuje, výzvou k plnění není.',
      law: '§ 142a odst. 1 OSŘ',
    },
    {
      title: 'Lhůta, která je delší než sedm dnů',
      body:
        'Zákon požaduje odstup nejméně sedmi dnů mezi odesláním výzvy a podáním žaloby. V praxi se dává deset až čtrnáct dnů, aby byla podmínka splněna s rezervou i při pomalejším doručení.',
      law: '§ 142a odst. 1 OSŘ',
    },
    {
      title: 'Úrok z prodlení',
      body:
        'Náleží vám, i když jste jej ve smlouvě nesjednali — zákonná výše se považuje za ujednanou. Uveďte jej vedle jistiny.',
      law: '§ 1970 NOZ',
    },
    {
      title: 'Doložitelné odeslání a podpis',
      body:
        'Zasílejte na adresu pro doručování, případně na poslední známou adresu, a tak, abyste odeslání uměli prokázat. Splnění podmínky § 142a prokazuje věřitel. Výzvu podepisuje jen věřitel nebo jeho zástupce.',
      law: '§ 142a odst. 1 OSŘ',
    },
  ],

  pitfalls: [
    {
      title: 'Lhůta kratší než sedm dnů',
      body:
        'Nejdražší chyba v celém dokumentu. Podáte-li žalobu dřív než sedmý den po odeslání výzvy, podmínka splněna není a náhradu nákladů řízení zpravidla nedostanete — i když spor vyhrajete.',
      law: '§ 142a odst. 1 OSŘ',
    },
    {
      title: 'Přesvědčení, že bez výzvy nelze žalovat',
      body:
        'Žalovat lze i bez ní. Výzva je podmínkou náhrady nákladů, ne podmínkou žaloby. Soud navíc může náklady výjimečně přiznat i bez výzvy, jsou-li tu důvody hodné zvláštního zřetele.',
      law: '§ 142a odst. 1 a 2 OSŘ',
    },
    {
      title: 'Spoléhání, že výzva staví promlčení',
      body:
        'Nestaví. Promlčecí lhůta trvá tři roky a zastaví se až uplatněním práva u soudu. Uzná-li dlužník dluh, promlčí se právo za deset let od uznání — proto je uznání to nejcennější, co lze z korespondence získat.',
      law: '§ 629, § 639 a § 648 NOZ',
    },
    {
      title: 'Uvedení pevného procenta úroku z prodlení',
      body:
        'Zákonná sazba je repo sazba ČNB pro první den kalendářního pololetí, v němž došlo k prodlení, zvýšená o osm procentních bodů. Není to konstanta — dvě pohledávky splatné v různých pololetích nesou v tomtéž okamžiku různou sazbu. Vzory s napevno uvedeným procentem jsou proto zpravidla nesprávné.',
      law: '§ 2 odst. 1 nař. vl. č. 351/2013 Sb.',
    },
    {
      title: 'Zapomenutá paušální náhrada 1 200 Kč',
      body:
        'Jde-li o vzájemný závazek podnikatelů, náleží věřiteli k náhradě nejméně 1 200 Kč nákladů spojených s uplatněním každé pohledávky. Nárok plyne přímo z nařízení vlády a stačí jej uplatnit — přesto se na něj běžně zapomíná.',
      law: '§ 3 nař. vl. č. 351/2013 Sb.',
    },
    {
      title: 'Odeslání na jinou než doručovací adresu',
      body:
        'Zákon jmenuje adresu pro doručování, případně poslední známou adresu. E-mail bez potvrzení nebo zpráva na sociální síti podmínku nesplní.',
      law: '§ 142a odst. 1 OSŘ',
    },
    {
      title: 'Pohrůžky, které do výzvy nepatří',
      body:
        'Trestní oznámení, zveřejnění dlužníka nebo exekuce bez exekučního titulu. U soukromoprávního dluhu nic z toho nepomůže a věřiteli to může uškodit — výzva je důkaz u soudu, ne emotivní dopis.',
    },
    {
      title: 'Podání žaloby i poté, co dlužník zaplatil',
      body:
        'Žalovaný, který svým chováním nezavdal příčinu k podání návrhu, má právo na náhradu nákladů proti žalobci. Zaplatí-li dlužník ve lhůtě, spor odpadá.',
      law: '§ 143 OSŘ',
    },
  ],

  faq: [
    {
      question: 'Musím poslat předžalobní výzvu, než podám žalobu?',
      answer:
        'Nemusíte, ale bez ní zpravidla nezískáte náhradu nákladů řízení, i když spor vyhrajete. Soud může výjimečně náklady přiznat i bez výzvy, jsou-li pro to důvody hodné zvláštního zřetele.',
    },
    {
      question: 'Jak dlouho musím po odeslání čekat?',
      answer:
        'Nejméně sedm dnů. Výzva musí být odeslána ve lhůtě nejméně sedmi dnů před podáním návrhu na zahájení řízení, proto se v praxi dává lhůta deset až čtrnáct dnů.',
    },
    {
      question: 'Staví předžalobní výzva promlčecí lhůtu?',
      answer:
        'Nestaví. Tříletá promlčecí lhůta se zastaví až uplatněním práva u orgánu veřejné moci. Uznání dluhu dlužníkem naopak zakládá novou desetiletou lhůtu.',
    },
    {
      question: 'Jak vysoký je úrok z prodlení?',
      answer:
        'Odpovídá repo sazbě ČNB pro první den kalendářního pololetí, v němž došlo k prodlení, zvýšené o osm procentních bodů. Konkrétní sazbu je třeba dohledat podle toho, kdy se dlužník dostal do prodlení.',
    },
    {
      question: 'Náleží mi úrok, když jsme si jej ve smlouvě nesjednali?',
      answer:
        'Ano. Neujednají-li strany výši úroku z prodlení, považuje se za ujednanou výše stanovená nařízením vlády.',
    },
    {
      question: 'Co když je dlužník i věřitel podnikatel?',
      answer:
        'Pak vám kromě jistiny a úroku náleží i paušální náhrada nákladů spojených s uplatněním pohledávky, nejméně 1 200 Kč za každou pohledávku.',
    },
    {
      question: 'Stačí poslat výzvu e-mailem?',
      answer:
        'Zákon požaduje odeslání na adresu pro doručování, případně na poslední známou adresu. Splnění podmínky prokazuje věřitel, proto je bezpečnější doporučená zásilka nebo datová schránka.',
    },
    {
      question: 'Dlužník po výzvě zaplatil. Mám žalovat kvůli nákladům?',
      answer:
        'Zpravidla ne. Žalovaný, který nezavdal příčinu k podání návrhu, má naopak právo na náhradu nákladů řízení proti žalobci.',
    },
  ],
}
