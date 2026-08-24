import type { ContractGuide } from './types'

export const NAJEM_PROSTORU_PODNIKANI: ContractGuide = {
  slug: 'najem-prostoru-slouziciho-podnikani',
  generatorHint: 'Nájem prostoru sloužícího podnikání',
  metaTitle: 'Nájem prostoru sloužícího podnikání — vzor a § 2302 a násl.',
  metaDescription:
    'Proč se na provozovnu nedá použít vzor nájmu bytu: šestiměsíční výpovědní doba, námitky do měsíce a náhrada za převzetí zákaznické základny.',
  h1: 'Nájem prostoru sloužícího podnikání',
  perex:
    'Nejčastější chybou je vzít vzor nájmu bytu a přepsat „byt" na „provozovnu". Přinese to trojnásobný strop jistoty, který zde neplatí, výpovědní režim, který zde neplatí, a poučení o námitkách, které patří do jiného oddílu — a nechá venku § 2315, tedy náhradu za převzetí zákaznické základny, která u provozovny s vlastní klientelou bývá tím nejcennějším, co nájemce má. Zvláštní úprava se navíc použije podle skutečnosti: rozhoduje, že prostor převážně slouží podnikání, ne to, zda je to ve smlouvě napsáno.',
  legalBasis: '§ 2302–2315 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Jednoznačné vymezení prostoru',
      body:
        'Adresa, číslo jednotky nebo místnosti, podlaží a výměra v m². U části budovy popište i to, které společné prostory smí nájemce užívat.',
      law: '§ 2302 a § 2201 NOZ',
    },
    {
      title: 'Účel nájmu',
      body:
        'K jaké podnikatelské činnosti prostor slouží. Zvláštní úprava se sice použije i bez toho, ale účel vymezuje, co smí nájemce dělat — a zakládá nájemci výpovědní důvod, ztratí-li k té činnosti způsobilost.',
      law: '§ 2302 odst. 1 a § 2308 NOZ',
    },
    {
      title: 'Nájemné, DPH a splatnost',
      body:
        'Výše, den splatnosti a výslovně i režim DPH — u pronájmu podnikateli bývá nájemné zdanitelným plněním. Doplňte inflační doložku, má-li nájem trvat roky.',
    },
    {
      title: 'Služby a jejich vyúčtování',
      body:
        'Které služby pronajímatel zajišťuje, jaké zálohy se platí a kdy se vyúčtují. Je-li s nájmem spojeno poskytování služeb, použijí se obdobně pravidla platná u nájmu bytu.',
      law: '§ 2303 NOZ',
    },
    {
      title: 'Doba nájmu a výpovědní doba',
      body:
        'U nájmu na dobu neurčitou je výpovědní doba šestiměsíční, tříměsíční jen má-li vypovídající strana vážný důvod. Trvá-li nájem déle než pět let a strana nemohla výpověď předpokládat, je vždy šestiměsíční. U doby určité činí tři měsíce.',
      law: '§ 2310 odst. 2 a § 2312 NOZ',
    },
    {
      title: 'Náhrada za převzetí zákaznické základny',
      body:
        'Skončí-li nájem výpovědí pronajímatele, náleží nájemci náhrada za výhodu, kterou pronajímatel nebo nový nájemce získali převzetím jeho klientely. Rozhodněte se k tomu vědomě — ať už právo ponecháte, vyčíslíte, nebo vyloučíte.',
      law: '§ 2315 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Použití vzoru nájmu bytu',
      body:
        'Přináší pravidla, která se na provozovnu nevztahují, a vynechává ta, která platí. Zvláštní úprava se přitom použije podle skutečného stavu — stačí, že prostor alespoň převážně slouží podnikání, bez ohledu na to, zda je účel ve smlouvě vyjádřen.',
      law: '§ 2302 odst. 1 NOZ',
    },
    {
      title: 'Tříměsíční výpovědní doba u nájmu na dobu neurčitou',
      body:
        'Tříměsíční lhůta je úpravou nájmu bytu. Zde je šestiměsíční, nemá-li vypovídající strana vážný důvod. Nezačíná ani prvním dnem následujícího měsíce — to je opět pravidlo pro byty.',
      law: '§ 2312 NOZ',
    },
    {
      title: 'Výpověď bez uvedení důvodu',
      body:
        'U nájmu na dobu určitou musí výpověď obsahovat důvod. Výpověď, v níž důvod uveden není, je neplatná — a to bez ohledu na to, která strana ji dává.',
      law: '§ 2310 odst. 1 NOZ',
    },
    {
      title: 'Zmeškání měsíční lhůty pro námitky',
      body:
        'Vypovídaná strana může do jednoho měsíce od doručení výpovědi vznést písemné námitky. Nevznese-li je včas, právo žádat přezkoumání oprávněnosti výpovědi zanikne úplně — nejde jen o oddálení sporu.',
      law: '§ 2314 NOZ',
    },
    {
      title: 'Vyklizení prostoru jako projev souhlasu',
      body:
        'Vyklidí-li nájemce prostor v souladu s výpovědí, považuje se výpověď za platnou a přijatou bez námitek. Kdo chce výpověď rozporovat, nesmí se odstěhovat a namítat až potom.',
      law: '§ 2313 NOZ',
    },
    {
      title: 'Mlčení o zákaznické základně',
      body:
        'Vzory § 2315 zpravidla neuvádějí vůbec. Pro kavárnu, ordinaci nebo obchod s vybudovanou klientelou to bývá nárok převyšující roční nájemné. Nájemce o něj přijde jen tehdy, byl-li vypovězen pro hrubé porušení povinností.',
      law: '§ 2315 NOZ',
    },
    {
      title: 'Očekávání stropu jistoty',
      body:
        'Trojnásobek měsíčního nájemného je limit pro nájem bytu. U prostoru sloužícího podnikání zákon výši jistoty neomezuje — vyšší jistota není protizákonná, ale měla by být vyvážená jinými ujednáními.',
      law: '§ 2254 NOZ',
    },
    {
      title: 'Zapomenutý souhlas se štíty — a lhůta, která hraje pro nájemce',
      body:
        'Označení provozovny vyžaduje souhlas pronajímatele, ten jej však může odmítnout jen z vážného důvodu. Požádá-li nájemce písemně a pronajímatel se do jednoho měsíce nevyjádří, souhlas se považuje za daný.',
      law: '§ 2305 NOZ',
    },
  ],

  faq: [
    {
      question: 'Kdy se použije zvláštní úprava pro prostor sloužící podnikání?',
      answer:
        'Je-li účelem nájmu provozování podnikatelské činnosti a prostor pak alespoň převážně slouží podnikání — bez ohledu na to, zda je účel v nájemní smlouvě vyjádřen. Rozhoduje skutečný stav.',
    },
    {
      question: 'Jak dlouhá je výpovědní doba?',
      answer:
        'U nájmu na dobu neurčitou šest měsíců, tři měsíce má-li vypovídající strana vážný důvod. Trvá-li nájem déle než pět let a strana nemohla výpověď předpokládat, je vždy šestiměsíční. U nájmu na dobu určitou tři měsíce.',
    },
    {
      question: 'Musí výpověď obsahovat důvod?',
      answer:
        'U nájmu na dobu určitou ano — výpověď bez uvedeného důvodu je neplatná. Důvody jsou pro nájemce vymezeny v § 2308 a pro pronajímatele v § 2309.',
    },
    {
      question: 'Co jsou námitky proti výpovědi?',
      answer:
        'Písemné vyjádření nesouhlasu, které může vypovídaná strana podat do jednoho měsíce od doručení výpovědi. Bez nich právo na soudní přezkum oprávněnosti výpovědi zaniká.',
    },
    {
      question: 'Co je náhrada za převzetí zákaznické základny?',
      answer:
        'Skončí-li nájem výpovědí pronajímatele, má nájemce právo na náhradu za výhodu, kterou pronajímatel nebo nový nájemce získali převzetím klientely, již nájemce vybudoval. Nemá ji, byl-li vypovězen pro hrubé porušení povinností.',
    },
    {
      question: 'Platí u provozovny strop jistoty jako u bytu?',
      answer:
        'Ne. Trojnásobek měsíčního nájemného je limit pro nájem bytu podle § 2254. U prostoru sloužícího podnikání je výše jistoty na dohodě stran.',
    },
    {
      question: 'Můžu nájem převést spolu s prodejem podniku?',
      answer:
        'Ano, s předchozím souhlasem pronajímatele a v souvislosti s převodem podnikatelské činnosti, jíž prostor slouží. Souhlas i smlouva o převodu vyžadují písemnou formu.',
    },
    {
      question: 'Smím v prostoru změnit druh podnikání?',
      answer:
        'Nepodstatné změny zákon nezakazuje. Změnu, která by zhoršila poměry v nemovitosti nebo nad přiměřenou míru poškozovala pronajímatele či ostatní uživatele, provést nesmíte.',
    },
  ],
}
