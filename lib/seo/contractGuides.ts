/**
 * Content for the /vzory/* landing pages.
 *
 * These pages target what people actually search for ("kupní smlouva vzor",
 * "co musí obsahovat kupní smlouva") and route that traffic into the generator.
 * Content lives here so a new guide is a data entry, not a new page component.
 *
 * Editorial rules — the same honesty the rest of the product follows:
 *   - describe what the law requires, never advise on a specific case
 *   - cite the provision so the reader can verify it
 *   - always end at "a working draft, have a lawyer check it"
 */

export interface GuideSection {
  title: string
  body: string
  /** Statutory reference shown as a small tag, e.g. "§ 2079 NOZ" */
  law?: string
}

export interface GuideFaq {
  question: string
  answer: string
}

export interface ContractGuide {
  /** URL segment: /cs/vzory/<slug> */
  slug: string
  /** Contract type in the generator this page sends people to */
  generatorHint: string
  /** <title> */
  metaTitle: string
  metaDescription: string
  h1: string
  perex: string
  legalBasis: string
  mustContain: GuideSection[]
  pitfalls: GuideSection[]
  faq: GuideFaq[]
}

const KUPNI_SMLOUVA: ContractGuide = {
  slug: 'kupni-smlouva',
  generatorHint: 'Kupní smlouva',
  metaTitle: 'Kupní smlouva — vzor a návrh podle českého práva',
  metaDescription:
    'Co musí kupní smlouva obsahovat podle § 2079 a násl. občanského zákoníku, časté chyby a jak si během pár minut připravit pracovní návrh smlouvy.',
  h1: 'Kupní smlouva',
  perex:
    'Kupní smlouvou se prodávající zavazuje odevzdat kupujícímu věc a umožnit mu nabýt vlastnické právo k ní, a kupující se zavazuje věc převzít a zaplatit kupní cenu. Níže najdete, co by smlouva měla obsahovat, na čem nejčastěji ztroskotá a jak si připravit vlastní návrh.',
  legalBasis: '§ 2079–2183 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení smluvních stran',
      body:
        'Jméno nebo obchodní firma, adresa bydliště či sídla a datum narození nebo IČO. Podnikatel uvádí IČO a údaj o zápisu ve veřejném rejstříku. Strany musí být určeny tak, aby je nebylo možné zaměnit.',
      law: '§ 435 NOZ',
    },
    {
      title: 'Předmět koupě',
      body:
        'Věc musí být popsána dostatečně určitě — typ, značka, model, výrobní či sériové číslo, stav, u vozidla VIN a stav tachometru, u nemovitosti údaje z katastru. Vágní popis je nejčastější příčina pozdějších sporů.',
      law: '§ 2079 NOZ',
    },
    {
      title: 'Kupní cena',
      body:
        'Cena musí být ujednána nebo musí být alespoň určen způsob jejího výpočtu. Uvádějte ji číslem i slovy a doplňte, zda je s DPH, nebo bez ní. Připojte způsob úhrady a termín splatnosti, u převodu i číslo účtu.',
      law: '§ 2080 NOZ',
    },
    {
      title: 'Přechod vlastnického práva',
      body:
        'Výslovně si ujednejte okamžik, kdy vlastnictví přechází — typicky předáním věci nebo zaplacením celé kupní ceny. Bez takového ujednání se u movitých věcí uplatní zákonné pravidlo, které nemusí odpovídat vaší představě.',
      law: '§ 1099 NOZ',
    },
    {
      title: 'Předání věci a přechod nebezpečí škody',
      body:
        'Uveďte místo, termín a způsob předání. Nebezpečí škody na věci přechází na kupujícího zpravidla převzetím — od té chvíle nese riziko poškození on, i kdyby ještě nebyl vlastníkem. Doporučuje se předávací protokol.',
      law: '§ 2121 NOZ',
    },
    {
      title: 'Práva z vadného plnění',
      body:
        'Prodávající odpovídá za vady, které má věc při přechodu nebezpečí škody. U použité věci vyplatí se známé vady výslovně popsat — na vadu, na kterou byl kupující upozorněn, se odpovědnost nevztahuje.',
      law: '§ 2099–2117 NOZ',
    },
    {
      title: 'Závěrečná ujednání a podpisy',
      body:
        'Rozhodné právo, způsob řešení sporů, počet vyhotovení, datum a místo uzavření a podpisy obou stran. Bez podpisového bloku není dokument způsobilý k podpisu.',
    },
  ],

  pitfalls: [
    {
      title: 'Příliš obecný popis předmětu',
      body:
        '„Notebook“ nebo „vozidlo“ nestačí. Chybí-li identifikační znaky, obtížně se prokazuje, co přesně bylo předmětem koupě — a spor se vede právě o to.',
    },
    {
      title: 'Mlčení o okamžiku přechodu vlastnictví',
      body:
        'Mnoho lidí automaticky předpokládá, že vlastnictví přechází až zaplacením. Pokud si to nesjednáte, může nastat jiný okamžik, než jste čekali.',
      law: '§ 1099 NOZ',
    },
    {
      title: 'Zkracování práv spotřebitele',
      body:
        'Prodává-li podnikatel spotřebiteli, nelze se odchýlit od zákonné úpravy v neprospěch spotřebitele. Ujednání, které jeho práva zkracuje, se nepoužije.',
      law: '§ 2158 a násl. NOZ',
    },
    {
      title: 'Neuvedené vady u použité věci',
      body:
        'U ojetého zboží je popis známých vad v zájmu obou stran — prodávajícímu snižuje riziko reklamace, kupujícímu dává jistotu, co kupuje.',
    },
    {
      title: 'Chybějící písemná forma u nemovitosti',
      body:
        'Převádí-li se nemovitá věc, vyžaduje smlouva písemnou formu a podpisy na téže listině. Ústní ujednání zde nestačí.',
      law: '§ 560 NOZ',
    },
  ],

  faq: [
    {
      question: 'Musí být kupní smlouva písemná?',
      answer:
        'U movitých věcí zákon písemnou formu obecně nevyžaduje — smlouva vznikne i ústně. Písemná podoba se ale doporučuje, protože slouží jako důkaz o tom, co bylo ujednáno. U nemovitých věcí je písemná forma povinná a podpisy musí být na téže listině (§ 560 NOZ).',
    },
    {
      question: 'Kdy na kupujícího přechází vlastnické právo?',
      answer:
        'Podle § 1099 NOZ se vlastnické právo k určené věci nabývá již účinností smlouvy, pokud si strany neujednají něco jiného. Právě proto se doporučuje okamžik přechodu výslovně sjednat — například předáním věci nebo úplným zaplacením kupní ceny.',
    },
    {
      question: 'Co když se po koupi objeví vada?',
      answer:
        'Prodávající odpovídá za vady, které měla věc při přechodu nebezpečí škody na kupujícího. Kupující uplatňuje práva z vadného plnění podle § 2099 a násl. NOZ; je-li kupujícím spotřebitel, uplatní se zvláštní ochrana podle § 2158 a násl. Rozsah práv závisí na povaze vady a na tom, zda na ni byl kupující předem upozorněn.',
    },
    {
      question: 'Můžu použít vzor smlouvy staženy z internetu?',
      answer:
        'Vzor je výchozí bod, ne hotové řešení. Obvykle neodpovídá vaší situaci, může vycházet ze starší úpravy nebo dokonce z jiného právního řádu. Právo365 připraví návrh podle údajů, které zadáte, a doplní odkazy na příslušná ustanovení — finální verzi je ale vždy vhodné nechat zkontrolovat advokátem.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 je nástroj pro rychlou přípravu pracovního návrhu a orientační kontrolu textu podle českého práva. Neposkytuje právní poradenství ve smyslu zákona č. 85/1996 Sb., o advokacii, a nenahrazuje posouzení konkrétního případu advokátem.',
    },
  ],
}

export const CONTRACT_GUIDES: ReadonlyArray<ContractGuide> = [KUPNI_SMLOUVA]

export function getContractGuide(slug: string): ContractGuide | undefined {
  return CONTRACT_GUIDES.find((g) => g.slug === slug)
}
