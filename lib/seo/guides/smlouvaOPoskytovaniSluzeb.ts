import type { ContractGuide } from './types'

export const SMLOUVA_O_POSKYTOVANI_SLUZEB: ContractGuide = {
  slug: 'smlouva-o-poskytovani-sluzeb',
  generatorHint: 'Smlouva o poskytování služeb',
  metaTitle: 'Smlouva o poskytování služeb — vzor, švarcsystém a § 1999',
  metaDescription:
    'Čím se liší od smlouvy o dílo, jak se vyhnout znakům závislé práce a proč bez ujednání o výpovědi končí smlouva až na konci čtvrtletí.',
  h1: 'Smlouva o poskytování služeb',
  perex:
    'Dvě hranice rozhodují o všem ostatním. Vůči dílu: služba je závazek k činnosti prováděné s odbornou péčí, ne k výsledku, který se předává a přebírá. Vůči zaměstnání: je-li poskytovatelem člověk, který pracuje podle pokynů, v pracovní době a na pracovišti objednatele, nejde o službu, ale o závislou práci — a ta smí být konána výlučně v pracovněprávním vztahu. Pokuta pro objednatele dosahuje deseti milionů.',
  legalBasis: '§ 1746 odst. 2 a § 2430 a násl. zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Vymezení činnosti, ne výsledku',
      body:
        'Popište, jaká činnost se poskytuje, v jakém rozsahu a jak často. Slibuje-li poskytovatel konkrétní výstup, který objednatel převezme, jde ve skutečnosti o smlouvu o dílo — s jiným režimem předání i odpovědnosti za vady.',
      law: '§ 1746 odst. 2 a § 2586 NOZ',
    },
    {
      title: 'Samostatnost poskytovatele',
      body:
        'Ujednejte výslovně, že poskytovatel určuje způsob a čas provedení sám, nese vlastní náklady a odpovědnost, používá vlastní prostředky a může plnit prostřednictvím třetí osoby. Právě tato ujednání odlišují smlouvu od závislé práce.',
      law: '§ 2 zák. č. 262/2006 Sb.',
    },
    {
      title: 'Odměna, DPH a splatnost',
      body:
        'Výše odměny nebo způsob jejího určení, fakturační období a splatnost. Uveďte, zda je částka s DPH, nebo bez ní, případně že poskytovatel není plátcem.',
      law: '§ 1746 odst. 2 NOZ',
    },
    {
      title: 'Náklady',
      body:
        'Ujednejte, zda odměna zahrnuje náklady poskytovatele, nebo se hradí zvlášť. Bez ujednání náleží příkazníkovi náhrada nákladů účelně vynaložených při plnění příkazu.',
      law: '§ 2436 NOZ',
    },
    {
      title: 'Doba trvání a výpověď',
      body:
        'Určitá, nebo neurčitá — a jak lze smlouvu ukončit. Ujednání o výpovědi nevynechávejte, jinak nastoupí zákonné pravidlo, které si zpravidla nepřeje ani jedna strana.',
      law: '§ 1998 a § 1999 NOZ',
    },
    {
      title: 'Mlčenlivost a osobní údaje',
      body:
        'Zpracovává-li poskytovatel pro objednatele osobní údaje, je zpracovatelem a je nutná samostatná zpracovatelská smlouva podle čl. 28 GDPR. Ustanovení o mlčenlivosti ji nenahrazuje.',
      law: 'čl. 28 nařízení (EU) 2016/679',
    },
  ],

  pitfalls: [
    {
      title: 'Znaky závislé práce ve smlouvě s OSVČ',
      body:
        'Pracovní doba, dovolená, nadřízený, docházka, pracoviště objednatele nebo povinnost výhradně osobního výkonu. Závislá práce je práce ve vztahu nadřízenosti a podřízenosti, jménem zaměstnavatele, podle jeho pokynů a vykonávaná osobně — a smí být konána jen v pracovněprávním vztahu.',
      law: '§ 2 a § 3 zák. č. 262/2006 Sb.',
    },
    {
      title: 'Podcenění sankce za švarcsystém',
      body:
        'Umožnění výkonu závislé práce mimo pracovněprávní vztah je přestupkem s pokutou až 10 000 000 Kč, nejméně však 50 000 Kč. Vedle toho lze uložit zákaz činnosti až na dva roky a zveřejnění rozhodnutí na úřední desce. Postihován je objednatel.',
      law: '§ 140 zák. č. 435/2004 Sb.',
    },
    {
      title: 'Chybějící ujednání o výpovědi',
      body:
        'U smlouvy na dobu neurčitou zavazující k nepřetržité nebo opakované činnosti lze bez ujednání závazek zrušit jen ke konci kalendářního čtvrtletí, výpovědí podanou alespoň tři měsíce předem. Kdo počítal s měsíční výpovědní dobou, může být vázán o půl roku déle.',
      law: '§ 1999 odst. 1 NOZ',
    },
    {
      title: 'Záruka měřitelného výsledku',
      body:
        'Slib obratu, počtu zákazníků nebo pozice ve vyhledávači mění povahu závazku. U služby se odpovídá za odbornou péči; zaručený výsledek se posuzuje jako dílo a nese riziko, které poskytovatel neovlivní.',
      law: '§ 2586 NOZ',
    },
    {
      title: 'Odměna za odpracovaný čas bez vazby na výstup',
      body:
        'Hodinová sazba sama o sobě smlouvu nediskvalifikuje, ale u OSVČ pracující výhradně pro jednoho objednatele je to jeden ze znaků, které inspekce práce hodnotí. Paušál nebo cena za službu je bezpečnější.',
      law: '§ 2 odst. 2 zák. č. 262/2006 Sb.',
    },
    {
      title: 'Spoléhání na mlčenlivost místo zpracovatelské smlouvy',
      body:
        'Doložka o mlčenlivosti není zpracovatelská smlouva. Zpracovává-li poskytovatel osobní údaje jménem objednatele, vyžaduje článek 28 GDPR samostatný dokument s předepsaným obsahem.',
      law: 'čl. 28 nařízení (EU) 2016/679',
    },
  ],

  faq: [
    {
      question: 'Jaký je rozdíl mezi smlouvou o dílo a smlouvou o poskytování služeb?',
      answer:
        'U díla se slibuje výsledek, který se předává a přebírá, a zhotovitel nese riziko, že jej dosáhne. U služby se slibuje činnost provedená s odbornou péčí. Rozhoduje obsah, ne název dokumentu.',
    },
    {
      question: 'Co je švarcsystém a proč je rizikový?',
      answer:
        'Výkon závislé práce mimo pracovněprávní vztah, tedy „zaměstnanec na IČO". Umožnění nelegální práce je přestupkem s pokutou až 10 000 000 Kč a nejméně 50 000 Kč, doplnitelnou zákazem činnosti až na dva roky.',
    },
    {
      question: 'Co ze smlouvy prozradí závislou práci?',
      answer:
        'Pracovní doba, dovolená, určený nadřízený, docházka, práce výhradně na pracovišti objednatele, jeho prostředky a na jeho náklady, a povinnost osobního výkonu bez možnosti zastoupení.',
    },
    {
      question: 'Jak dlouhá je výpovědní doba, když ji ve smlouvě nemáme?',
      answer:
        'U smlouvy na dobu neurčitou zavazující k nepřetržité nebo opakované činnosti lze závazek zrušit jen ke konci kalendářního čtvrtletí, a to výpovědí podanou alespoň tři měsíce předem.',
    },
    {
      question: 'Může poskytovatel použít subdodavatele?',
      answer:
        'Je-li to ve smlouvě ujednáno, ano — a je to zároveň jeden z rysů, které smlouvu odlišují od závislé práce. Povinnost výhradně osobního výkonu působí opačně.',
    },
    {
      question: 'Musíme uzavřít zpracovatelskou smlouvu?',
      answer:
        'Ano, pokud poskytovatel zpracovává osobní údaje jménem objednatele — například spravuje databázi zákazníků nebo mzdovou agendu. Vyžaduje to článek 28 GDPR a doložka o mlčenlivosti ji nenahradí.',
    },
  ],
}
