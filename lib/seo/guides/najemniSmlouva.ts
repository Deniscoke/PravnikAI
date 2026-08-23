import type { ContractGuide } from './types'

export const NAJEMNI_SMLOUVA: ContractGuide = {
  slug: 'najemni-smlouva',
  generatorHint: 'Nájemní smlouva na byt',
  metaTitle: 'Nájemní smlouva na byt — vzor a návrh podle českého práva',
  metaDescription:
    'Co musí nájemní smlouva na byt obsahovat podle § 2235 a násl. občanského zákoníku, jaká je maximální jistota, časté chyby a jak si připravit vlastní návrh.',
  h1: 'Nájemní smlouva na byt',
  perex:
    'Nájemní smlouvou přenechává pronajímatel nájemci byt k dočasnému užívání za nájemné. Úprava nájmu bytu je z velké části kogentní — ujednání, která zkracují práva nájemce, se nepoužijí. Níže je přehled toho, co smlouva musí obsahovat a kde se nejčastěji chybuje.',
  legalBasis: '§ 2235–2301 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení smluvních stran',
      body:
        'Pronajímatel a nájemce s uvedením jména, adresy a data narození nebo IČO. U více nájemců uveďte všechny — společný nájem má vlastní pravidla.',
    },
    {
      title: 'Přesné označení bytu',
      body:
        'Adresa, číslo bytu, podlaží, počet místností a podlahová plocha. Součástí bývá i výčet příslušenství (sklep, garážové stání) a vybavení předávaného s bytem.',
      law: '§ 2236 NOZ',
    },
    {
      title: 'Výše nájemného a jeho splatnost',
      body:
        'Uveďte částku, termín splatnosti a způsob úhrady. Není-li ujednáno jinak, platí se nájemné měsíčně předem, nejpozději do pátého dne příslušného platebního období.',
      law: '§ 2246, § 2251 NOZ',
    },
    {
      title: 'Služby a zálohy',
      body:
        'Vymezte, které služby pronajímatel zajišťuje (voda, teplo, odvoz odpadu) a jak se hradí — zálohou s ročním vyúčtováním, nebo paušálem. Vyúčtování musí být doloženo.',
      law: '§ 2247 NOZ',
    },
    {
      title: 'Doba nájmu',
      body:
        'Určitá, nebo neurčitá. U doby určité uveďte konkrétní datum konce. Není-li doba ujednána, platí, že jde o nájem na dobu neurčitou.',
      law: '§ 2204 NOZ',
    },
    {
      title: 'Jistota (kauce)',
      body:
        'Je-li sjednána, nesmí přesáhnout trojnásobek měsíčního nájemného. Ujednejte, kdy a za jakých podmínek se vrací a co z ní lze čerpat.',
      law: '§ 2254 NOZ',
    },
    {
      title: 'Předání bytu a podpisy',
      body:
        'Termín předání a předávací protokol se stavy měřičů a popisem stavu bytu. Protokol je nejlepší ochranou obou stran při skončení nájmu.',
      law: '§ 2205 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Jistota vyšší než trojnásobek nájemného',
      body:
        'K ujednání nad zákonný limit se nepřihlíží. Vyšší kauce vám tedy nezajistí víc — jen vytvoří spor.',
      law: '§ 2254 NOZ',
    },
    {
      title: 'Ujednání zkracující práva nájemce',
      body:
        'Nájem bytu je chráněn kogentně. Zákaz návštěv, plošná pokuta za drobné porušení nebo vzdání se práva na náhradu — k takovým ujednáním se nepřihlíží.',
      law: '§ 2235 NOZ',
    },
    {
      title: 'Úplný zákaz chovu zvířat',
      body:
        'Nájemce má právo chovat v bytě zvíře, nepůsobí-li to pronajímateli nebo ostatním obyvatelům nepřiměřené obtíže. Paušální zákaz neobstojí.',
      law: '§ 2258 NOZ',
    },
    {
      title: 'Vymyšlené výpovědní důvody',
      body:
        'Důvody výpovědi nájmu bytu stanoví zákon. Rozšířit je nad rámec úpravy v neprospěch nájemce nelze.',
      law: '§ 2288–2291 NOZ',
    },
    {
      title: 'Nevymezené služby a zálohy',
      body:
        'Chybí-li, které služby jsou v ceně a jak se vyúčtují, končí to obvykle sporem o doplatek po skončení roku.',
    },
  ],

  faq: [
    {
      question: 'Musí být nájemní smlouva na byt písemná?',
      answer:
        'Ano, zákon vyžaduje písemnou formu (§ 2237 NOZ). Pronajímatel však nemůže vůči nájemci namítat neplatnost smlouvy pro nedostatek formy — ochrana směřuje ve prospěch nájemce.',
    },
    {
      question: 'Jak vysoká může být kauce?',
      answer:
        'Jistota nesmí přesáhnout trojnásobek měsíčního nájemného (§ 2254 NOZ). Při skončení nájmu ji pronajímatel vrátí, může si z ní ale započíst, co mu nájemce dluží.',
    },
    {
      question: 'Může pronajímatel jednostranně zvýšit nájemné?',
      answer:
        'Jen v mezích zákona. Nedohodnou-li se strany, může pronajímatel navrhnout zvýšení až do výše srovnatelného nájemného v místě, přičemž navržené zvýšení spolu s tím, k němuž došlo v posledních třech letech, nesmí přesáhnout dvacet procent (§ 2249 NOZ).',
    },
    {
      question: 'Jak lze nájem bytu vypovědět?',
      answer:
        'Pronajímatel může vypovědět jen z důvodů uvedených v zákoně a výpověď musí být písemná, odůvodněná a s poučením o právu podat námitky u soudu (§ 2288 a násl. NOZ). Nájemce má postavení volnější.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 připraví pracovní návrh podle zadaných údajů a doplní odkazy na příslušná ustanovení. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii, a nenahrazuje posouzení konkrétní situace advokátem.',
    },
  ],
}
