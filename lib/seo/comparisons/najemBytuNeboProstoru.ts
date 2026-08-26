import type { Comparison } from './types'

/**
 * The one comparison where the reader does not get to choose.
 *
 * Every other page in this folder helps someone pick between two instruments.
 * This one has to say the opposite: § 2302 odst. 1 attaches to the facts, "bez
 * ohledu na to, zda je účel nájmu v nájemní smlouvě vyjádřen". A contract
 * headed "nájemní smlouva na byt" over premises actually used for business
 * falls under § 2302 and following anyway, and one headed the other way round
 * does not escape the tenant protection of § 2235.
 *
 * That is why the verdict leads with the test rather than with a recommendation.
 */
export const NAJEM_BYTU_NEBO_PROSTORU: Comparison = {
  slug: 'najem-bytu-nebo-prostoru-slouziciho-podnikani',
  leftGuideSlug: 'najemni-smlouva',
  rightGuideSlug: 'najem-prostoru-slouziciho-podnikani',
  leftLabel: 'Nájem bytu',
  rightLabel: 'Prostor sloužící podnikání',

  metaTitle: 'Nájem bytu, nebo prostoru sloužícího podnikání? Rozhoduje účel',
  metaDescription:
    'O režimu nájmu nerozhoduje název smlouvy, ale k čemu prostor převážně slouží. Liší se výpovědní doba, kauce i ochrana nájemce.',
  h1: 'Nájem bytu, nebo prostoru sloužícího podnikání?',
  perex:
    'Dvě úpravy v jednom zákoně, které se chovají skoro opačně. U bytu je nájemce chráněn kogentně a pronajímatel může vypovědět jen ze zákonných důvodů; u prostoru sloužícího podnikání platí smluvní volnost, delší výpovědní doba a nárok na náhradu za zákaznickou základnu. Nejdražší omyl přitom nespočívá ve špatné volbě, ale v přesvědčení, že si lze vybrat.',
  legalBasis:
    '§ 2235–2301 (nájem bytu) a § 2302–2315 (prostor sloužící podnikání) zák. č. 89/2012 Sb.',

  verdict:
    'Nevybíráte si — rozhoduje účel a skutečné užívání, nikoli název smlouvy. Je-li účelem nájmu podnikání a prostor pak podnikání alespoň PŘEVÁŽNĚ slouží, uplatní se § 2302 a násl. bez ohledu na to, co je ve smlouvě napsáno. Slouží-li prostor k zajištění bytových potřeb, jde o nájem bytu se vší kogentní ochranou nájemce. Pracovat nebo podnikat z pronajatého bytu přitom smíte — samo o sobě to z bytu prostor sloužící podnikání nedělá.',

  rows: [
    {
      criterion: 'Co rozhoduje o režimu',
      left: 'Přenechání bytu nebo domu k zajištění bytových potřeb nájemce',
      right: 'Účel nájmu je podnikání a prostor pak podnikání alespoň převážně slouží',
      law: '§ 2235 odst. 1 a § 2302 odst. 1 NOZ',
    },
    {
      criterion: 'Rozhoduje název smlouvy',
      left: 'Ne',
      right: 'Ne — výslovně „bez ohledu na to, zda je účel v nájemní smlouvě vyjádřen"',
      law: '§ 2302 odst. 1 NOZ',
    },
    {
      criterion: 'Lze se od úpravy odchýlit v neprospěch nájemce',
      left: 'Ne — k takovým ujednáním se nepřihlíží',
      right: 'Ano, platí smluvní volnost',
      law: '§ 2235 odst. 1 NOZ',
    },
    {
      criterion: 'Kdo může být nájemcem',
      left: 'Zpravidla fyzická osoba — jde o bytovou potřebu',
      right: 'Kdokoli, typicky podnikatel nebo obchodní korporace',
      law: '§ 2235 a § 2302 NOZ',
    },
    {
      criterion: 'Strop kauce',
      left: 'Jistota a smluvní pokuta v souhrnu nejvýše trojnásobek měsíčního nájemného',
      right: 'Žádný zákonný strop — § 2254 se zde nepoužije',
      law: '§ 2254 odst. 1 NOZ',
    },
    {
      criterion: 'Výpovědní doba u doby neurčité',
      left: 'Tři měsíce, běží od prvního dne následujícího kalendářního měsíce',
      right: 'Šest měsíců; při vážném důvodu tři. Trvá-li nájem přes pět let a strana výpověď nemohla předpokládat, vždy šest',
      law: '§ 2286 odst. 1 a § 2312 NOZ',
    },
    {
      criterion: 'Výpovědní důvody pronajímatele',
      left: 'Jen zákonné důvody, výpovědní doba tři měsíce',
      right: 'U doby neurčité důvod netřeba; u doby určité jen z důvodů podle § 2308 a § 2309',
      law: '§ 2288 a § 2308–2310 NOZ',
    },
    {
      criterion: 'Poučení ve výpovědi',
      left: 'Pronajímatel musí nájemce poučit o právu vznést námitky a navrhnout soudní přezkum, jinak je výpověď neplatná',
      right: 'Poučení se nevyžaduje; námitky může do jednoho měsíce písemně vznést kterákoli vypovídaná strana',
      law: '§ 2286 odst. 2 a § 2314 NOZ',
    },
    {
      criterion: 'Náhrada za zákaznickou základnu',
      left: '—',
      right: 'Skončí-li nájem výpovědí pronajímatele, náleží nájemci náhrada (neplatí při výpovědi pro hrubé porušení povinností)',
      law: '§ 2315 NOZ',
    },
    {
      criterion: 'Podnikání v pronajatém prostoru',
      left: 'Nájemce smí v bytě pracovat i podnikat, nezpůsobí-li to zvýšené zatížení bytu nebo domu',
      right: 'To je samotný účel nájmu',
      law: '§ 2255 odst. 2 NOZ',
    },
  ],

  chooseLeft: {
    title: 'Jde o nájem bytu, když',
    bullets: [
      'Prostor slouží k bydlení nájemce nebo členů jeho domácnosti.',
      'Nájemce z bytu občas pracuje nebo podniká, ale byt tím není zvýšeně zatížen — home office z bytu prostor sloužící podnikání nedělá.',
      'Prostor je sice zčásti využíván k podnikání, ale převažuje bydlení.',
    ],
  },

  chooseRight: {
    title: 'Jde o prostor sloužící podnikání, když',
    bullets: [
      'Účelem nájmu je provozovat v prostoru podnikatelskou činnost — prodejnu, ordinaci, kancelář, dílnu, sklad.',
      'Prostor pak podnikání alespoň převážně slouží, i když je ve smlouvě nazván jinak.',
      'Nájemce si prostor bere pro provoz, u něhož si buduje okruh zákazníků vázaný na místo.',
    ],
  },

  pitfalls: [
    {
      title: 'Smlouva nazvaná „nájem nebytových prostor"',
      body:
        'Pojem „nebytový prostor" pochází ze zrušeného zákona č. 116/1990 Sb. a občanský zákoník ho nezná. Použití starého názvu samo o sobě smlouvu neruší, ale bývá průvodním znakem šablony psané podle úpravy neplatné od roku 2014 — a s ní i podmínek, které dnes neobstojí.',
      law: '§ 2302 NOZ',
    },
    {
      title: 'Tříměsíční výpovědní doba u nájmu provozovny na dobu neurčitou',
      body:
        'Nejčastější důsledek přepsání bytové šablony. U prostoru sloužícího podnikání je výpovědní doba na dobu neurčitou šestiměsíční; tříměsíční jen tehdy, má-li vypovídající strana vážný důvod. Trvá-li nájem déle než pět let a druhá strana výpověď nemohla předpokládat, je vždy šestiměsíční.',
      law: '§ 2312 NOZ',
    },
    {
      title: 'Kauce omezená na tři nájmy u provozovny',
      body:
        'Strop podle § 2254 je úprava nájmu bytu a na prostor sloužící podnikání nedopadá. Vyšší jistotu si zde strany ujednat mohou. Opačně to ale neplatí: u bytu se do trojnásobku musí vejít jistota a smluvní pokuta DOHROMADY.',
      law: '§ 2254 odst. 1 NOZ',
    },
    {
      title: 'Poučení o námitkách ve výpovědi z provozovny',
      body:
        'Poučení podle § 2286 odst. 2 je náležitostí výpovědi z nájmu bytu. U prostoru sloužícího podnikání má vlastní režim: námitky může vznést kterákoli vypovídaná strana do jednoho měsíce, písemně. Přenesené poučení výpověď nezneplatní, ale ukazuje, že byla použita nesprávná úprava — a s ní bývá špatně i výpovědní doba.',
      law: '§ 2314 NOZ',
    },
    {
      title: 'Vzdání se náhrady za zákaznickou základnu bez rozmyslu',
      body:
        'Právo podle § 2315 vzniká jen nájemci prostoru sloužícího podnikání a jen při výpovědi ze strany pronajímatele. U provozovny s vybudovaným okruhem zákazníků jde o citelnou položku a ustanovení, kterým se ho nájemce vzdává, patří k nejdůležitějším v celé smlouvě.',
      law: '§ 2315 NOZ',
    },
    {
      title: 'Přesvědčení, že bydlení v ateliéru je vždy nájem bytu',
      body:
        'Rozhoduje účel a převažující užívání, nikoli kolaudace. Prostor kolaudovaný jako ateliér a pronajatý k bydlení bývá nájmem bytu; prostor kolaudovaný jako byt a pronajatý k provozu ordinace spadá pod § 2302.',
      law: '§ 2235 odst. 1 a § 2302 odst. 1 NOZ',
    },
  ],

  faq: [
    {
      question: 'Rozhoduje o režimu nájmu název smlouvy?',
      answer:
        'Nerozhoduje. Ustanovení o prostoru sloužícím podnikání se použijí, je-li účelem nájmu podnikání a slouží-li prostor pak podnikání alespoň převážně — výslovně bez ohledu na to, zda je účel ve smlouvě vyjádřen.',
    },
    {
      question: 'Můžu podnikat v pronajatém bytě?',
      answer:
        'Ano. Nezpůsobí-li to zvýšené zatížení pro byt nebo dům, může nájemce v bytě pracovat i podnikat. Nájem se tím nemění na nájem prostoru sloužícího podnikání.',
    },
    {
      question: 'Jaká je výpovědní doba u nájmu provozovny na dobu neurčitou?',
      answer:
        'Šestiměsíční. Má-li vypovídající strana vážný důvod, je tříměsíční. Trvá-li nájem déle než pět let a druhá strana nemohla vzhledem k okolnostem výpověď předpokládat, je vždy šestiměsíční.',
    },
    {
      question: 'Platí strop kauce tři měsíční nájmy i u provozovny?',
      answer:
        'Neplatí. § 2254 je úpravou nájmu bytu. U prostoru sloužícího podnikání zákon výši jistoty neomezuje.',
    },
    {
      question: 'Může pronajímatel vypovědět nájem provozovny bez důvodu?',
      answer:
        'U nájmu na dobu neurčitou ano, v zákonné výpovědní době. U nájmu na dobu určitou jen z důvodů uvedených v § 2308 a § 2309, a důvod musí být ve výpovědi uveden — jinak je neplatná.',
    },
    {
      question: 'Co je náhrada za převzetí zákaznické základny?',
      answer:
        'Skončí-li nájem prostoru sloužícího podnikání výpovědí pronajímatele, má nájemce právo na náhradu za výhodu, kterou pronajímatel nebo nový nájemce získali převzetím zákaznické základny vybudované vypovězeným nájemcem. Nemá ji, byl-li vypovězen pro hrubé porušení povinností.',
    },
    {
      question: 'Můžeme si ve smlouvě o nájmu bytu ujednat smluvní pokutu?',
      answer:
        'Ano. Zákaz byl z § 2239 vypuštěn s účinností od 1. 7. 2020. Jistota a právo na zaplacení smluvní pokuty však nesmí v souhrnu přesáhnout trojnásobek měsíčního nájemného.',
    },
  ],
}
