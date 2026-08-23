import type { ContractGuide } from './types'

export const PRACOVNI_SMLOUVA: ContractGuide = {
  slug: 'pracovni-smlouva',
  generatorHint: 'Pracovní smlouva',
  metaTitle: 'Pracovní smlouva — vzor a návrh podle zákoníku práce',
  metaDescription:
    'Co musí pracovní smlouva obsahovat podle § 34 zákoníku práce, jaká je maximální zkušební doba, časté chyby a jak si připravit vlastní návrh.',
  h1: 'Pracovní smlouva',
  perex:
    'Pracovní smlouva zakládá pracovní poměr a řídí se zákoníkem práce, který je z velké části kogentní — od zákonné úpravy se nelze odchýlit v neprospěch zaměstnance. Zákon vyžaduje písemnou formu a tři podstatné náležitosti; vše ostatní je na dohodě stran v mezích zákona.',
  legalBasis: '§ 33–39 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Druh práce',
      body:
        'Podstatná náležitost. Vymezte pracovní pozici dostatečně určitě — druh práce určuje, jakou práci lze zaměstnanci přidělovat.',
      law: '§ 34 odst. 1 ZP',
    },
    {
      title: 'Místo výkonu práce',
      body:
        'Podstatná náležitost. Může to být konkrétní adresa, obec, nebo šířeji vymezené území. Od místa výkonu práce se odvíjí i nárok na cestovní náhrady.',
      law: '§ 34 odst. 1 ZP',
    },
    {
      title: 'Den nástupu do práce',
      body:
        'Podstatná náležitost. Tímto dnem vzniká pracovní poměr — i kdyby zaměstnanec fakticky nenastoupil.',
      law: '§ 34 odst. 1 ZP',
    },
    {
      title: 'Mzda nebo plat',
      body:
        'Nemusí být přímo ve smlouvě — může být sjednána i v samostatné mzdové dohodě nebo stanovena mzdovým výměrem. Nesmí být nižší než minimální mzda a příslušná úroveň zaručené mzdy.',
      law: '§ 111, § 113 ZP',
    },
    {
      title: 'Zkušební doba (volitelně)',
      body:
        'Sjednává se písemně, nejpozději v den nástupu. Po novele č. 120/2025 Sb. činí nejvýše čtyři měsíce, u vedoucích zaměstnanců osm měsíců, a nesmí přesáhnout polovinu sjednané doby trvání pracovního poměru.',
      law: '§ 35 ZP',
    },
    {
      title: 'Doba trvání pracovního poměru',
      body:
        'Neurčitá, nebo určitá. U doby určité nesmí být delší než tři roky a lze ji opakovat nejvýše dvakrát — celkem tedy nejvýše devět let.',
      law: '§ 39 ZP',
    },
    {
      title: 'Písemná forma a podpisy',
      body:
        'Pracovní smlouva musí být uzavřena písemně a každá strana musí obdržet jedno vyhotovení.',
      law: '§ 34 odst. 2 a 5 ZP',
    },
  ],

  pitfalls: [
    {
      title: 'Zkušební doba sjednaná až po nástupu',
      body:
        'Sjednat ji lze nejpozději v den, který byl sjednán jako den nástupu do práce. Dodatečné sjednání je neplatné.',
      law: '§ 35 odst. 3 ZP',
    },
    {
      title: 'Mzda pod zákonným minimem',
      body:
        'Nižší mzda, než je minimální nebo zaručená pro danou skupinu prací, neobstojí — zaměstnavatel je povinen rozdíl doplatit.',
      law: '§ 111, § 112 ZP',
    },
    {
      title: 'Řetězení doby určité nad rámec zákona',
      body:
        'Doba určitá nad tři roky nebo více než dvojí opakování vede k tomu, že se pracovní poměr považuje za sjednaný na dobu neurčitou.',
      law: '§ 39 ZP',
    },
    {
      title: 'Příliš úzký druh práce',
      body:
        'Je-li druh práce vymezen velmi konkrétně, nelze zaměstnanci přidělovat jinou práci bez změny smlouvy. Opačný extrém — „jakákoli práce“ — zase neobstojí jako určité vymezení.',
    },
    {
      title: 'Chybějící informace o obsahu pracovního poměru',
      body:
        'Nejsou-li údaje jako délka dovolené, výpovědní doba nebo pracovní doba přímo ve smlouvě, musí o nich zaměstnavatel zaměstnance písemně informovat v zákonné lhůtě.',
      law: '§ 37 ZP',
    },
  ],

  faq: [
    {
      question: 'Co musí pracovní smlouva obsahovat minimálně?',
      answer:
        'Tři podstatné náležitosti: druh práce, místo výkonu práce a den nástupu do práce (§ 34 odst. 1 ZP). Smlouva musí být písemná a každá strana obdrží jedno vyhotovení.',
    },
    {
      question: 'Jak dlouhá může být zkušební doba?',
      answer:
        'Po novele zákoníku práce č. 120/2025 Sb. nejvýše čtyři měsíce po sobě jdoucí ode dne vzniku pracovního poměru, u vedoucích zaměstnanců nejvýše osm měsíců. Zároveň nesmí přesáhnout polovinu sjednané doby trvání pracovního poměru (§ 35 ZP). Sjednanou zkušební dobu lze písemnou dohodou prodloužit, ale jen v průběhu jejího trvání a v mezích těchto limitů.',
    },
    {
      question: 'Musí být mzda uvedena přímo ve smlouvě?',
      answer:
        'Nemusí. Mzda může být sjednána ve smlouvě, v samostatné mzdové dohodě, nebo ji zaměstnavatel stanoví mzdovým výměrem. V každém případě nesmí být nižší než minimální a zaručená mzda (§ 111, § 113 ZP).',
    },
    {
      question: 'Na jak dlouho lze uzavřít pracovní poměr na dobu určitou?',
      answer:
        'Nejdéle na tři roky a ode dne vzniku prvního pracovního poměru na dobu určitou jej lze opakovat nejvýše dvakrát (§ 39 odst. 2 ZP). Při porušení a písemném oznámení zaměstnance se poměr považuje za sjednaný na dobu neurčitou.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 připraví pracovní návrh podle zadaných údajů a upozorní na hodnoty mimo zákonné meze. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii, a nenahrazuje posouzení konkrétního případu.',
    },
  ],
}
