import type { ContractGuide } from './types'

export const ZRUSENI_DOHODY: ContractGuide = {
  slug: 'zruseni-dohody-dpp-dpc',
  generatorHint: 'Zrušení dohody (DPP / DPČ)',
  metaTitle: 'Zrušení dohody o provedení práce a DPČ — vzor a § 77 odst. 4 ZP',
  metaDescription:
    'Jak ukončit DPP nebo DPČ: patnáctidenní výpovědní doba ode dne doručení, i bez udání důvodu. Proč se pravidla pro pracovní poměr na dohodu nevztahují.',
  h1: 'Zrušení dohody o provedení práce a o pracovní činnosti',
  perex:
    'Nejkratší dokument v pracovním právu — a nejčastěji psaný z nesprávného vzoru. Dohoda není pracovní poměr, takže na její ukončení nedopadá nic z toho, co lidé znají z výpovědi ze zaměstnání: žádné zákonné výpovědní důvody, žádná dvouměsíční doba, žádné odstupné, žádná ochranná doba. Patnáct dnů ode dne doručení, z obou stran, i bez udání důvodu.',
  legalBasis: '§ 77 odst. 4 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Ověření, co říká samotná dohoda',
      body:
        'Zákonná úprava se použije jen tehdy, nesjednaly-li si strany způsob zrušení přímo v dohodě. Dohoda může stanovit jinou délku výpovědní doby i omezit důvody. Než sáhnete po § 77 odst. 4, přečtěte si, co jste podepsali.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Označení rušené dohody',
      body:
        'Uveďte, o kterou dohodu jde — zda o provedení práce nebo o pracovní činnosti, datum uzavření a sjednanou práci. Zaměstnavatel jich s vámi mohl uzavřít několik.',
    },
    {
      title: 'Písemná forma a doručení',
      body:
        'Výpověď dohody i okamžité zrušení musí být písemné a doručené druhé straně. Ústní zrušení nemá účinky. Doručení navíc určuje, kdy začne běžet výpovědní doba — proto je třeba je umět prokázat.',
      law: '§ 77 odst. 4 a odst. 6 ZP',
    },
    {
      title: 'Patnáctidenní výpovědní doba',
      body:
        'Není-li v dohodě sjednáno jinak, činí výpovědní doba patnáct dnů a začíná běžet dnem, v němž byla výpověď doručena druhé straně — nikoli prvním dnem dalšího měsíce.',
      law: '§ 77 odst. 4 písm. b) ZP',
    },
    {
      title: 'Vypořádání odměny',
      body:
        'Skončením dohody nárok na odměnu za již odvedenou práci nezaniká. Uveďte, kolik a kdy bude vyplaceno — ušetří to jeden spor navíc.',
      law: '§ 141 ve spojení s § 77 odst. 2 ZP',
    },
    {
      title: 'Datum a podpis vypovídající strany',
      body:
        'Podepisuje jen ten, kdo výpověď dává. Objeví-li se v textu „strany se dohodly", nejde už o výpověď, ale o dohodu o zrušení — a patnáctidenní doba se pak neuplatní, protože dohoda může skončit ke kterémukoli dni.',
    },
  ],

  pitfalls: [
    {
      title: 'Použití vzoru výpovědi z pracovního poměru',
      body:
        'Nejčastější chyba. Do výpovědi dohody se z nesprávného vzoru dostanou výpovědní důvody podle § 52, dvouměsíční výpovědní doba nebo odstupné podle § 67. Na dohodu se nevztahuje ani jedno z toho.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Výpovědní doba od prvního dne dalšího měsíce',
      body:
        'Patnáct dnů běží ode dne doručení. Je-li výpověď doručena 20. září, dohoda skončí 5. října — ne 15. listopadu.',
      law: '§ 77 odst. 4 písm. b) ZP',
    },
    {
      title: 'Hledání důvodu, který zákon nevyžaduje',
      body:
        'Dohodu lze vypovědět z jakéhokoli důvodu i bez uvedení důvodu, a to oběma stranami. Uvádět jej nemusíte — a uvedete-li jej, dáváte druhé straně něco, co může rozporovat.',
      law: '§ 77 odst. 4 písm. b) ZP',
    },
    {
      title: 'Okamžité zrušení bez zákonného důvodu',
      body:
        'Dohodu lze zrušit okamžitě jen v případech, kdy by bylo možné okamžitě zrušit pracovní poměr — tedy při odsouzení za úmyslný trestný čin nebo při porušení povinnosti zvlášť hrubým způsobem. Jinak neobstojí.',
      law: '§ 77 odst. 4 písm. a) ve spojení s § 55 a § 56 ZP',
    },
    {
      title: 'Očekávání ochranné doby při nemoci',
      body:
        'Ochranná doba podle § 53 chrání zaměstnance v pracovním poměru. U dohody se neuplatní — zaměstnavatel může vypovědět i během pracovní neschopnosti.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Zapomenuté potvrzení o zaměstnání',
      body:
        'I u dohody vydá zaměstnavatel při skončení potvrzení o zaměstnání. Zaměstnanec je potřebuje pro úřad práce i pro dalšího zaměstnavatele.',
      law: '§ 313 ZP',
    },
  ],

  faq: [
    {
      question: 'Musím uvést důvod, proč DPP ukončuji?',
      answer:
        'Ne. Dohodu o provedení práce i o pracovní činnosti lze vypovědět z jakéhokoli důvodu nebo bez uvedení důvodu. Platí to pro zaměstnance i pro zaměstnavatele.',
    },
    {
      question: 'Jak dlouhá je výpovědní doba u dohody?',
      answer:
        'Patnáct dnů, není-li v dohodě sjednáno jinak. Běží ode dne, kdy byla výpověď doručena druhé straně.',
    },
    {
      question: 'Mám nárok na odstupné?',
      answer:
        'Ne. Odstupné podle § 67 zákoníku práce náleží při skončení pracovního poměru z organizačních důvodů. Na dohody konané mimo pracovní poměr se nevztahuje.',
    },
    {
      question: 'Může mi zaměstnavatel ukončit DPP, když jsem nemocný?',
      answer:
        'Ano. Ochranná doba podle § 53 se vztahuje na pracovní poměr, nikoli na dohodu.',
    },
    {
      question: 'Dostanu zaplaceno za odpracované hodiny?',
      answer:
        'Ano. Skončením dohody nárok na odměnu za již vykonanou práci nezaniká. Odměna je splatná po vykonání práce, nejpozději v následujícím kalendářním měsíci.',
    },
    {
      question: 'Lze dohodu ukončit ze dne na den?',
      answer:
        'Dohodou obou stran ano, a to ke kterémukoli dni. Jednostranně jen okamžitým zrušením, a to pouze z důvodů, pro které by šlo okamžitě zrušit pracovní poměr.',
    },
  ],
}
