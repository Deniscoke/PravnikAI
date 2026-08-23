import type { ContractGuide } from './types'

export const VYPOVED_Z_PRACOVNIHO_POMERU: ContractGuide = {
  slug: 'vypoved-z-pracovniho-pomeru',
  generatorHint: 'Výpověď z pracovního poměru',
  metaTitle: 'Výpověď z pracovního poměru — vzor a náležitosti podle zákoníku práce',
  metaDescription:
    'Co musí výpověď obsahovat, jak dlouhá je výpovědní doba po flexinovele, kdy náleží odstupné a proč zaměstnavatel nesmí důvod dodatečně měnit.',
  h1: 'Výpověď z pracovního poměru',
  perex:
    'Výpověď vypadá stejně, ať ji dává kdokoli — ale právně jsou to dva zcela odlišné dokumenty. Zaměstnanec může odejít kdykoli a bez udání důvodu. Zaměstnavatel jen z důvodů, které zákon vyjmenovává, musí je popsat skutkově a později je nemůže vyměnit. Od 1. června 2025 navíc platí jiná pravidla než ve většině vzorů, které na internetu najdete.',
  legalBasis: '§ 50–54 a § 67 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Písemná forma a doručení',
      body:
        'Výpověď musí být písemná a doručena druhé straně. Nedoručená výpověď nemá žádné účinky, i kdyby byla sepsána bezvadně — proto si doručení zajistěte tak, abyste je uměli prokázat.',
      law: '§ 50 odst. 1 ZP',
    },
    {
      title: 'Označení pracovního poměru',
      body:
        'Uveďte pracovní smlouvu, kterou vypovídáte — datum uzavření, sjednaný druh práce. Bez toho není zřejmé, co se ukončuje.',
    },
    {
      title: 'Výpovědní důvod (dává-li výpověď zaměstnavatel)',
      body:
        'Musí jít o jeden z důvodů § 52 a musí být vymezen skutkově — tedy popsán tak, aby jej nebylo možné zaměnit s jiným. Pouhý odkaz „podle § 52 písm. c)" nestačí.',
      law: '§ 50 odst. 4 a § 52 ZP',
    },
    {
      title: 'Výpovědní doba',
      body:
        'Nejméně dva měsíce. U výpovědi z důvodů podle § 52 písm. f) až h) nejméně jeden měsíc. Musí být stejná pro obě strany.',
      law: '§ 51 ZP',
    },
    {
      title: 'Odstupné, náleží-li',
      body:
        'Při výpovědi z organizačních důvodů podle § 52 písm. a) až c) náleží odstupné ve výši jednonásobku, dvojnásobku nebo trojnásobku průměrného výdělku podle toho, jak dlouho poměr trval.',
      law: '§ 67 odst. 1 ZP',
    },
    {
      title: 'Datum a podpis vypovídající strany',
      body:
        'Výpověď podepisuje pouze ten, kdo ji dává. Podpis druhé strany slouží nejvýše jako potvrzení převzetí, nikoli jako souhlas.',
    },
  ],

  pitfalls: [
    {
      title: 'Výpovědní doba počítaná od dalšího měsíce',
      body:
        'Nejrozšířenější chyba ve vzorech psaných před červnem 2025. Výpovědní doba dnes běží ode dne doručení výpovědi a končí dnem se stejným číselným označením. Pravidlo o počítání času podle § 333 ZP se nepoužije. U nájmu bytu přitom stále platí start od prvního dne dalšího měsíce — obojí se snadno zamění.',
      law: '§ 51 ZP ve znění zák. č. 120/2025 Sb.',
    },
    {
      title: 'Slib dvanáctinásobného odstupného při pracovním úrazu',
      body:
        'Od 1. června 2025 náleží dvanáctinásobek průměrného výdělku pouze při skončení poměru z důvodu dosažení nejvyšší přípustné expozice na pracovišti. U pracovního úrazu a nemoci z povolání jej nahradila jednorázová náhrada.',
      law: '§ 67 odst. 3 ZP',
    },
    {
      title: 'Důvod uvedený jen odkazem na paragraf',
      body:
        'Skutkové vymezení je podmínkou platnosti. Napište, co se stalo — kdy padlo rozhodnutí o zrušení pozice, čeho konkrétně se porušení povinnosti týkalo.',
      law: '§ 50 odst. 4 ZP',
    },
    {
      title: 'Dodatečná změna důvodu',
      body:
        'Uvedený důvod nelze měnit. Ukáže-li se jako neobstojný, nelze jej v soudním řízení nahradit jiným — proto se nevyplácí uvádět alternativy „a případně též".',
      law: '§ 50 odst. 4 ZP',
    },
    {
      title: 'Výpověď v ochranné době',
      body:
        'V době pracovní neschopnosti, těhotenství, mateřské nebo rodičovské dovolené zaměstnavatel výpověď dát nesmí, až na zákonné výjimky. Doručená výpověď je zpravidla neplatná.',
      law: '§ 53 ZP',
    },
    {
      title: 'Snaha vzít výpověď zpět',
      body:
        'Doručenou výpověď lze odvolat jen se souhlasem druhé strany, a to písemně. Jednostranně to nejde.',
      law: '§ 50 odst. 5 ZP',
    },
    {
      title: 'Zmeškání dvouměsíční lhůty',
      body:
        'Neplatnost rozvázání pracovního poměru je třeba uplatnit u soudu do dvou měsíců ode dne, kdy měl poměr skončit. Po marném uplynutí lhůty je i vadná výpověď nenapadnutelná.',
      law: '§ 72 ZP',
    },
  ],

  faq: [
    {
      question: 'Musí zaměstnanec uvést důvod výpovědi?',
      answer:
        'Ne. Zaměstnanec může dát výpověď z jakéhokoli důvodu nebo bez uvedení důvodu. Povinnost uvést a skutkově vymezit důvod má pouze zaměstnavatel.',
    },
    {
      question: 'Odkdy běží výpovědní doba?',
      answer:
        'Ode dne doručení výpovědi. Do 31. května 2025 začínala prvním dnem následujícího kalendářního měsíce — vzory psané dřív mají tuto část chybně.',
    },
    {
      question: 'Jak dlouhá je výpovědní doba?',
      answer:
        'Nejméně dva měsíce, u výpovědi z důvodů § 52 písm. f) až h) nejméně jeden měsíc. Delší lze sjednat, ale musí být stejná pro obě strany.',
    },
    {
      question: 'Kdy mám nárok na odstupné?',
      answer:
        'Při výpovědi z organizačních důvodů podle § 52 písm. a) až c), tedy při zrušení nebo přemístění zaměstnavatele a při nadbytečnosti. Výše je jedno-, dvoj- nebo trojnásobek průměrného výdělku podle délky trvání poměru.',
    },
    {
      question: 'Může mi dát zaměstnavatel výpověď, když jsem nemocný?',
      answer:
        'Zpravidla ne — dočasná pracovní neschopnost je ochrannou dobou podle § 53. Zákon zná několik výjimek, například zrušení zaměstnavatele.',
    },
    {
      question: 'Co když je výpověď vadná?',
      answer:
        'Její neplatnost je třeba uplatnit u soudu do dvou měsíců ode dne, kdy měl pracovní poměr skončit. Po uplynutí lhůty se neplatnosti dovolat nelze.',
    },
  ],
}
