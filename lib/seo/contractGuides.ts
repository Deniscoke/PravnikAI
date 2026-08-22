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

const NAJEMNI_SMLOUVA: ContractGuide = {
  slug: 'najemni-smlouva',
  generatorHint: 'Nájemní smlouva',
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

const SMLOUVA_O_DILO: ContractGuide = {
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
    },
    {
      title: 'Zaměňování záruky a odpovědnosti za vady',
      body:
        'Odpovědnost za vady plyne ze zákona. Záruka za jakost vzniká jen výslovným ujednáním — „zákonná záruka 24 měsíců“ u díla mezi podnikateli neplatí automaticky.',
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

const NDA_SMLOUVA: ContractGuide = {
  slug: 'nda-smlouva-o-mlcenlivosti',
  generatorHint: 'Smlouva o mlčenlivosti (NDA)',
  metaTitle: 'NDA — smlouva o mlčenlivosti: vzor a návrh podle českého práva',
  metaDescription:
    'Co musí smlouva o mlčenlivosti (NDA) obsahovat, jak vymezit důvěrné informace a smluvní pokutu, časté chyby a jak si připravit vlastní návrh.',
  h1: 'Smlouva o mlčenlivosti (NDA)',
  perex:
    'NDA chrání informace, které si strany sdělují při jednání o spolupráci, vývoji nebo prodeji. Český právní řád ji neupravuje jako zvláštní smluvní typ — uzavírá se jako smlouva nepojmenovaná a opírá se o ochranu obchodního tajemství a povinnost poctivého jednání.',
  legalBasis: '§ 1746 odst. 2, § 504, § 2976 zák. č. 89/2012 Sb.',

  mustContain: [
    {
      title: 'Označení stran a jejich rolí',
      body:
        'Kdo informace poskytuje a kdo přijímá. U vzájemné (oboustranné) NDA mají obě strany obě role — uveďte to výslovně.',
    },
    {
      title: 'Definice důvěrných informací',
      body:
        'Nejdůležitější ustanovení celé smlouvy. Vymezte kategorie (technická dokumentace, ceny, klientský seznam, zdrojový kód) a způsob označování. Příliš široká definice bývá u soudu obtížně vymahatelná, příliš úzká nechrání to podstatné.',
      law: '§ 504 NOZ',
    },
    {
      title: 'Účel poskytnutí',
      body:
        'Proč se informace sdělují — posouzení spolupráce, due diligence, plnění zakázky. Účel omezuje, k čemu smí příjemce informace použít.',
    },
    {
      title: 'Povinnosti příjemce',
      body:
        'Zákaz sdělení třetím osobám, zákaz použití k jinému účelu, povinnost zabezpečení a okruh osob, kterým lze informace zpřístupnit (zaměstnanci, poradci) — ti musí být zavázáni stejně.',
    },
    {
      title: 'Výjimky z mlčenlivosti',
      body:
        'Informace veřejně známé, získané nezávisle, nebo jejichž sdělení ukládá zákon či rozhodnutí orgánu veřejné moci. Bez výjimek je závazek nepřiměřený a hůře obhajitelný.',
    },
    {
      title: 'Doba trvání',
      body:
        'Jak dlouho povinnost trvá po skončení spolupráce. Obvykle dva až pět let; u obchodního tajemství lze i po dobu, po kterou znaky tajemství trvají.',
    },
    {
      title: 'Sankce a podpisy',
      body:
        'Smluvní pokuta se sjednává výslovně a v přiměřené výši. Připojte ujednání o náhradě škody, rozhodném právu a podpisy stran.',
      law: '§ 2048 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Definice „vše, co si sdělíme“',
      body:
        'Neomezená definice se špatně vymáhá — u sporu je nutné prokázat, co konkrétně bylo důvěrné a že to bylo porušeno.',
    },
    {
      title: 'Chybějící výjimky',
      body:
        'Bez výjimky pro veřejně známé informace a zákonnou povinnost se příjemce zavazuje k něčemu, co nemůže splnit.',
    },
    {
      title: 'Nepřiměřená smluvní pokuta',
      body:
        'Soud může nepřiměřeně vysokou pokutu na návrh snížit. Přemrštěná částka tedy nezvyšuje ochranu, jen riziko sporu o její výši.',
      law: '§ 2051 NOZ',
    },
    {
      title: 'Časově neomezená mlčenlivost',
      body:
        'Závazek „navždy“ bývá u běžných obchodních informací považován za nepřiměřený. Uveďte konkrétní dobu.',
    },
    {
      title: 'Nezavázaní spolupracovníci',
      body:
        'Pokud příjemce zpřístupní informace zaměstnancům či subdodavatelům, musí být vázáni stejně — jinak ochrana končí u první třetí osoby.',
    },
  ],

  faq: [
    {
      question: 'Je NDA podle českého práva vymahatelná?',
      answer:
        'Ano. Uzavírá se jako smlouva nepojmenovaná podle § 1746 odst. 2 NOZ. Vymahatelnost stojí a padá s tím, jak konkrétně jsou vymezeny důvěrné informace a jaké následky porušení smlouva stanoví.',
    },
    {
      question: 'Jednostranná, nebo oboustranná NDA?',
      answer:
        'Jednostranná chrání informace jedné strany (typicky při prezentaci záměru investorovi). Oboustranná zavazuje obě strany a používá se, když si citlivé údaje sdělují navzájem — například při jednání o partnerství.',
    },
    {
      question: 'Musím sjednat smluvní pokutu?',
      answer:
        'Nemusíte, ale bez ní je vymáhání obtížnější — museli byste prokazovat vzniklou škodu a její výši. Pokuta musí být sjednána písemně a v přiměřené výši; nepřiměřenou může soud na návrh snížit (§ 2051 NOZ).',
    },
    {
      question: 'Chrání NDA i obchodní tajemství?',
      answer:
        'Obchodní tajemství je chráněno již ze zákona (§ 504 NOZ, ochrana proti nekalé soutěži podle § 2976 a násl.). NDA tuto ochranu doplňuje: vymezuje konkrétní informace, účel jejich použití a smluvní následky porušení.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 připraví pracovní návrh NDA podle zadaných údajů. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii — u strategicky významných jednání nechte text zkontrolovat advokátem.',
    },
  ],
}

const PRACOVNI_SMLOUVA: ContractGuide = {
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

const KUPNI_SMLOUVA_AUTO: ContractGuide = {
  slug: 'kupni-smlouva-auto',
  generatorHint: 'Kupní smlouva',
  metaTitle: 'Kupní smlouva na auto — vzor a návrh podle českého práva',
  metaDescription:
    'Co musí obsahovat kupní smlouva na ojeté vozidlo, jak popsat stav a vady, do kdy přepsat auto v registru a čemu se vyhnout. Připravte si návrh za pár minut.',
  h1: 'Kupní smlouva na auto',
  perex:
    'Prodej ojetého vozidla mezi soukromými osobami se řídí obecnou úpravou kupní smlouvy. Nejvíc sporů vzniká kolem stavu vozidla, tachometru a přepisu v registru — právě tyto body se vyplatí ve smlouvě ošetřit nejpečlivěji.',
  legalBasis: '§ 2079 a násl. zák. č. 89/2012 Sb.; zák. č. 56/2001 Sb. o podmínkách provozu vozidel',

  mustContain: [
    {
      title: 'Označení prodávajícího a kupujícího',
      body:
        'Jméno, adresa a datum narození nebo IČO. U vozidla je vhodné doplnit i číslo občanského průkazu pro potřeby přepisu v registru.',
    },
    {
      title: 'Jednoznačná identifikace vozidla',
      body:
        'Tovární značka, model, rok výroby, VIN (číslo karoserie), registrační značka, číslo velkého technického průkazu, barva a objem motoru. VIN je nezaměnitelný identifikátor — bez něj je vozidlo popsáno nedostatečně.',
      law: '§ 2079 NOZ',
    },
    {
      title: 'Stav tachometru',
      body:
        'Uveďte počet najetých kilometrů ke dni prodeje. Prohlášení o stavu tachometru je jedním z nejčastějších předmětů pozdějších sporů.',
    },
    {
      title: 'Kupní cena a způsob úhrady',
      body:
        'Částka číslem i slovy, způsob a termín platby. U hotovosti pamatujte na zákonný limit pro platby v hotovosti — nad stanovenou hranici je nutný bezhotovostní převod.',
      law: 'zák. č. 254/2004 Sb.',
    },
    {
      title: 'Popis stavu a známých vad',
      body:
        'Konkrétně: poškození laku, opotřebení, závady, po havárii, výměna dílů. Na vadu, na kterou byl kupující výslovně upozorněn, se odpovědnost prodávajícího nevztahuje — v zájmu obou stran je popsat je co nejpřesněji.',
      law: '§ 2103 NOZ',
    },
    {
      title: 'Předání vozidla a přechod vlastnictví',
      body:
        'Datum a místo předání, seznam předávaných věcí (klíče, technický průkaz, servisní knížka, sada kol) a okamžik, kdy přechází vlastnické právo a nebezpečí škody.',
      law: '§ 1099, § 2121 NOZ',
    },
    {
      title: 'Závazek k přepisu v registru vozidel',
      body:
        'Ujednejte, kdo podá žádost o zápis změny vlastníka a do kdy. Zákon na to stanoví lhůtu; nepodání ohrožuje obě strany — prodávajícímu chodí pokuty a povinné ručení za vozidlo, které už nemá.',
      law: 'zák. č. 56/2001 Sb.',
    },
  ],

  pitfalls: [
    {
      title: 'Nezapsaný přepis vozidla',
      body:
        'Dokud není změna vlastníka zapsána v registru, zůstává prodávající vedený jako provozovatel — s odpovědností za pokuty a povinné ručení. Zápis je nutné podat v zákonné lhůtě.',
      law: 'zák. č. 56/2001 Sb.',
    },
    {
      title: 'Věta „kupující byl seznámen se stavem vozidla"',
      body:
        'Sama o sobě prodávajícího nezbaví odpovědnosti. Účinná je jen konkrétní specifikace vad — obecná formulace u soudu neobstojí.',
    },
    {
      title: 'Zamlčený stav tachometru nebo havárie',
      body:
        'Zamlčení podstatné vady může vést k odstoupení od smlouvy i k odpovědnosti za škodu. U vozidel po havárii to platí dvojnásob.',
    },
    {
      title: 'Prodej podnikatelem bez respektu k právům spotřebitele',
      body:
        'Prodává-li vozidlo autobazar nebo podnikatel spotřebiteli, nelze zákonná práva z vadného plnění zkrátit — ujednání v neprospěch spotřebitele se nepoužije.',
      law: '§ 2158 a násl. NOZ',
    },
    {
      title: 'Chybějící seznam předávaných věcí',
      body:
        'Druhý klíč, servisní knížka nebo zimní sada kol — pokud nejsou ve smlouvě, těžko se pak dokazuje, že měly být součástí prodeje.',
    },
  ],

  faq: [
    {
      question: 'Musí být kupní smlouva na auto písemná?',
      answer:
        'Zákon u movitých věcí písemnou formu nevyžaduje, prakticky je však nezbytná: budete ji potřebovat při zápisu změny vlastníka v registru vozidel a slouží jako důkaz o tom, co bylo ujednáno.',
    },
    {
      question: 'Do kdy je nutné auto přepsat?',
      answer:
        'Zápis změny vlastníka se podává u příslušného úřadu ve lhůtě stanovené zákonem č. 56/2001 Sb. Do doby zápisu zůstává v registru veden dosavadní provozovatel, kterému chodí případné pokuty. Termín i odpovědnost za podání žádosti proto ve smlouvě výslovně ujednejte.',
    },
    {
      question: 'Co když se po koupi objeví vada?',
      answer:
        'Prodávající odpovídá za vady, které vozidlo mělo při přechodu nebezpečí škody. Neplatí to pro vady, na které byl kupující výslovně upozorněn nebo které musel z okolností poznat (§ 2103 NOZ). Kupuje-li spotřebitel od podnikatele, má navíc zvláštní ochranu podle § 2158 a násl. NOZ.',
    },
    {
      question: 'Můžu zaplatit celou částku v hotovosti?',
      answer:
        'Jen do zákonného limitu pro platby v hotovosti podle zák. č. 254/2004 Sb.; nad tuto hranici je nutná bezhotovostní platba. U vyšších částek je bankovní převod bezpečnější i z hlediska prokazování úhrady.',
    },
    {
      question: 'Nahrazuje Právo365 advokáta?',
      answer:
        'Ne. Právo365 připraví pracovní návrh podle zadaných údajů a doplní odkazy na příslušná ustanovení. Neposkytuje právní poradenství podle zák. č. 85/1996 Sb., o advokacii — u dražších vozidel nebo sporu se obraťte na advokáta.',
    },
  ],
}

const DOHODA_O_PROVEDENI_PRACE: ContractGuide = {
  slug: 'dohoda-o-provedeni-prace',
  generatorHint: 'Dohoda o provedení práce (DPP)',
  metaTitle: 'Dohoda o provedení práce (DPP) — vzor a návrh podle zákoníku práce',
  metaDescription:
    'Co musí obsahovat dohoda o provedení práce, limit 300 hodin, minimální odměna, dovolená a zrušení dohody. Časté chyby a jak si připravit vlastní návrh.',
  h1: 'Dohoda o provedení práce (DPP)',
  perex:
    'Dohoda o provedení práce je nejrozšířenější způsob, jak si v Česku přivydělat vedle studia nebo hlavního zaměstnání. Není to pracovní smlouva a nezakládá pracovní poměr — proto se na ni nevztahují pravidla o výpovědní době ani nárok na čtyři týdny dovolené. Zákon ji omezuje třemi sty hodinami ročně u jednoho zaměstnavatele a vyžaduje písemnou formu.',
  legalBasis: '§ 74–77 zák. č. 262/2006 Sb., zákoník práce',

  mustContain: [
    {
      title: 'Označení smluvních stran',
      body:
        'Zaměstnavatel obchodní firmou nebo jménem, IČO a sídlem; zaměstnanec jménem, datem narození a bydlištěm. Rodné číslo uvádět nemusíte — datum narození postačí.',
      law: '§ 77 odst. 1 ZP',
    },
    {
      title: 'Vymezení sjednané práce',
      body:
        'Dohoda se uzavírá na konkrétní pracovní úkol. Popište, co má být vykonáno — čím konkrétněji, tím menší prostor pro spor o rozsah práce.',
      law: '§ 75 ZP',
    },
    {
      title: 'Doba, na kterou se dohoda uzavírá',
      body:
        'Uveďte období, ve kterém má být práce provedena, nebo termín splnění úkolu. Bez časového vymezení není zřejmé, kdy závazek končí.',
      law: '§ 75 ZP',
    },
    {
      title: 'Rozsah práce — nejvýše 300 hodin ročně',
      body:
        'Jde o strop pro všechny dohody o provedení práce u téhož zaměstnavatele v jednom kalendářním roce dohromady. Máte-li u jedné firmy dvě DPP, sčítají se. Potřebujete-li víc, přichází v úvahu dohoda o pracovní činnosti nebo pracovní poměr.',
      law: '§ 75 ZP',
    },
    {
      title: 'Odměna a její splatnost',
      body:
        'Odměna nesmí být nižší než minimální mzda přepočtená na hodinu. Splatnost je nejpozději v kalendářním měsíci následujícím po měsíci, ve kterém nárok vznikl — dřívější termín je pro zaměstnance výhodnější a nic mu nebrání.',
      law: '§ 111 a § 141 ZP',
    },
    {
      title: 'Místo výkonu práce',
      body:
        'Není povinnou náležitostí jako u pracovní smlouvy, ale patří tam. Od místa se odvíjí i případné cestovní náhrady, pokud si je strany sjednají.',
    },
    {
      title: 'Písemná forma',
      body:
        'Dohoda musí být písemná a jedno vyhotovení obdrží zaměstnanec. Ústně sjednaná dohoda je vadná.',
      law: '§ 77 odst. 1 ZP',
    },
  ],

  pitfalls: [
    {
      title: 'Kopírování pracovní smlouvy',
      body:
        'Nejčastější chyba. Do dohody se přenese výpovědní doba podle § 51, nárok na čtyři týdny dovolené podle § 213 nebo odstupné — všechno ustanovení, která se na dohodu nevztahují. Buď nic neznamenají, nebo matou.',
      law: '§ 77 odst. 2 ZP',
    },
    {
      title: 'Překročení tří set hodin',
      body:
        'Limit platí na součet všech DPP u jednoho zaměstnavatele za kalendářní rok. Práce nad limit se posuzuje jako výkon práce bez platného právního titulu a hrozí pokuta od inspektorátu práce.',
      law: '§ 75 ZP',
    },
    {
      title: 'Očekávání dovolené jako v pracovním poměru',
      body:
        'Od 1. 1. 2024 vzniká právo na dovolenou i z dohody, ale za jiných podmínek: pracovněprávní vztah musí v kalendářním roce nepřetržitě trvat alespoň 28 dní a zaměstnanec musí odpracovat alespoň 80 hodin. Nejde o nárok na čtyři týdny.',
      law: '§ 77 odst. 8 ZP',
    },
    {
      title: 'Nejasnosti kolem ukončení',
      body:
        'Není-li ujednáno jinak, lze dohodu zrušit dohodou stran, výpovědí z jakéhokoli důvodu i bez důvodu s patnáctidenní lhůtou počínající dnem doručení, nebo okamžitým zrušením v případech, kdy lze okamžitě zrušit pracovní poměr. Chybějící ujednání není vada — uplatní se zákon.',
      law: '§ 77 odst. 4 ZP',
    },
    {
      title: 'Chybějící rozvrh pracovní doby',
      body:
        'Zaměstnavatel musí pracovní dobu předem rozvrhnout písemně a seznámit s ní zaměstnance nejpozději tři dny předem, pokud se strany nedohodnou na jiné lhůtě. Kratší lhůta je přípustná, ale musí být sjednána.',
      law: '§ 74 odst. 2 ZP',
    },
    {
      title: 'Záměna s dohodou o pracovní činnosti',
      body:
        'DPČ nemá roční hodinový strop, ale rozsah práce nesmí v průměru překročit polovinu stanovené týdenní pracovní doby, posuzováno nejvýše za 52 týdnů. Pro pravidelnou práci po celý rok je vhodnější DPČ.',
      law: '§ 76 ZP',
    },
  ],

  faq: [
    {
      question: 'Kolik hodin lze na DPP odpracovat?',
      answer:
        'Nejvýše 300 hodin v kalendářním roce u jednoho zaměstnavatele. U jiného zaměstnavatele běží limit samostatně, takže souběh více DPP u různých firem je možný.',
    },
    {
      question: 'Musí být dohoda o provedení práce písemně?',
      answer:
        'Ano, § 77 odst. 1 zákoníku práce vyžaduje písemnou formu a jedno vyhotovení musí zaměstnavatel vydat zaměstnanci.',
    },
    {
      question: 'Má zaměstnanec na DPP nárok na dovolenou?',
      answer:
        'Od roku 2024 ano, ale jen pokud vztah v kalendářním roce nepřetržitě trval alespoň 28 dní a zaměstnanec odpracoval alespoň 80 hodin. Podmínky se liší od pracovního poměru.',
    },
    {
      question: 'Jak se dohoda o provedení práce ukončuje?',
      answer:
        'Dohodou stran, výpovědí i bez udání důvodu s patnáctidenní lhůtou od doručení, nebo okamžitým zrušením ze zákonných důvodů. Výpovědní doba podle § 51 se na dohodu nevztahuje.',
    },
    {
      question: 'Jaká je minimální odměna na DPP?',
      answer:
        'Odměna nesmí být nižší než minimální mzda přepočtená na hodinu. U řady prací je navíc závazná vyšší zaručená mzda podle skupiny prací.',
    },
    {
      question: 'Je DPP totéž co brigáda?',
      answer:
        'Brigáda je hovorové označení, právně jde nejčastěji právě o dohodu o provedení práce nebo o dohodu o pracovní činnosti. Zákoník práce pojem brigáda nezná.',
    },
  ],
}

const SMLOUVA_O_ZAPUJCCE: ContractGuide = {
  slug: 'smlouva-o-zapujcce',
  generatorHint: 'Smlouva o zápůjčce',
  metaTitle: 'Smlouva o zápůjčce — vzor a návrh podle občanského zákoníku',
  metaDescription:
    'Co musí obsahovat smlouva o zápůjčce, proč vzniká až předáním peněz, jak sjednat úroky a splátky a jaké chyby znemožní dluh vymoci.',
  h1: 'Smlouva o zápůjčce',
  perex:
    'Zápůjčka je to, čemu se běžně říká půjčka. Má jednu vlastnost, kterou většina vzorů z internetu opomíjí: vzniká až skutečným předáním peněz, ne podpisem smlouvy. Podepsaný papír, ke kterému peníze nikdy nedošly, žádný dluh nezakládá — a naopak předané peníze bez písemné smlouvy se prokazují jen velmi obtížně.',
  legalBasis: '§ 2390–2394 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení stran',
      body:
        'Zákon je nazývá zapůjčitel a vydlužitel, nikoli věřitel a dlužník. U obou uveďte jméno, datum narození nebo IČO a adresu, aby byly nezaměnitelné.',
      law: '§ 2390 NOZ',
    },
    {
      title: 'Výše zápůjčky',
      body:
        'Částku uveďte číselně i slovy a vždy s měnou. U nepeněžité zápůjčky popište věc tak, aby bylo zřejmé, co má být vráceno — vrací se věc stejného druhu, ne táž věc.',
      law: '§ 2390 NOZ',
    },
    {
      title: 'Potvrzení o předání peněz',
      body:
        'Nejdůležitější článek celé smlouvy. Buď potvrďte, že peníze byly předány, nebo popište, jak a kdy budou poskytnuty. Bezhotovostní převod má tu výhodu, že předání prokazuje sám o sobě.',
      law: '§ 2390 NOZ',
    },
    {
      title: 'Závazek vrátit',
      body:
        'Výslovné ujednání, že vydlužitel částku vrátí. Bez něj by šlo o darování, ne o zápůjčku.',
      law: '§ 2390 NOZ',
    },
    {
      title: 'Doba vrácení nebo splátkový kalendář',
      body:
        'Sjednejte konkrétní datum, případně výši a splatnost jednotlivých splátek. Není-li doba vrácení ujednána, závisí splatnost na výpovědi smlouvy — což zbytečně komplikuje situaci oběma stranám.',
      law: '§ 2393 NOZ',
    },
    {
      title: 'Úroky, pokud je chcete',
      body:
        'Zápůjčka je bezúročná, nejsou-li úroky výslovně ujednány. Sjednáváte-li je, uveďte sazbu i období, za které se počítají.',
      law: '§ 2392 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Chybějící doklad o předání',
      body:
        'Nejčastější důvod, proč se zápůjčku nepodaří vymoci. Vydlužitel u soudu uvede, že žádné peníze neobdržel, a bez potvrzení nebo bankovního výpisu je důkazní situace zapůjčitele velmi špatná.',
      law: '§ 2390 NOZ',
    },
    {
      title: 'Záměna zápůjčky a úvěru',
      body:
        'Úvěr podle § 2395 je závazek peníze poskytnout a je vždy úročený; zápůjčka vzniká předáním a úročená být nemusí. Pojmy nejsou zaměnitelné a smlouva by měla používat ten správný.',
      law: '§ 2390 a § 2395 NOZ',
    },
    {
      title: 'Záměna úroku ze zápůjčky a úroku z prodlení',
      body:
        'Úrok ze zápůjčky je cena za poskytnuté peníze a musí být sjednán. Úrok z prodlení náleží až při opoždění se splátkou, a to ze zákona i bez ujednání.',
      law: '§ 1970 a § 2392 NOZ',
    },
    {
      title: 'Nepřiměřeně vysoký úrok',
      body:
        'Úrok v hrubém nepoměru k poskytnutému plnění, zejména zneužil-li zapůjčitel tísně nebo nezkušenosti druhé strany, je neplatný jako lichva.',
      law: '§ 1796 NOZ',
    },
    {
      title: 'Splátky bez ztráty výhody splátek',
      body:
        'Není-li ujednáno jinak, znamená prodlení s jednou splátkou právo požadovat jen tuto splátku. Chcete-li mít možnost žádat celý zbytek najednou, musíte si to sjednat.',
      law: '§ 1931 NOZ',
    },
    {
      title: 'Podnikatelské půjčování spotřebitelům',
      body:
        'Poskytuje-li někdo zápůjčky spotřebitelům opakovaně v rámci podnikání, jde o spotřebitelský úvěr — činnost vyžaduje oprávnění České národní banky. Jednorázová zápůjčka mezi soukromými osobami sem nepatří.',
      law: 'zák. č. 257/2016 Sb.',
    },
  ],

  faq: [
    {
      question: 'Musí být smlouva o zápůjčce písemně?',
      answer:
        'Zákon to nevyžaduje, ale bez písemné formy se existence zápůjčky i její podmínky prokazují velmi obtížně. Písemná smlouva ve dvou vyhotoveních je proto samozřejmost.',
    },
    {
      question: 'Kdy zápůjčka vlastně vzniká?',
      answer:
        'Až skutečným přenecháním peněz nebo věci. Samotný podpis smlouvy dluh nezakládá, proto smlouva musí předání potvrzovat nebo popisovat.',
    },
    {
      question: 'Musí být zápůjčka úročená?',
      answer:
        'Ne. Nejsou-li úroky výslovně ujednány, je zápůjčka bezúročná. Tím se liší od úvěru, který je vždy úročený.',
    },
    {
      question: 'Co když jsme nesjednali datum vrácení?',
      answer:
        'Splatnost pak závisí na výpovědi smlouvy podle § 2393. Je jednodušší sjednat konkrétní datum rovnou.',
    },
    {
      question: 'Můžu peníze předat v hotovosti?',
      answer:
        'Do zákonného limitu pro hotovostní platby ano, ale bezhotovostní převod je bezpečnější — bankovní výpis předání prokazuje bez dalšího.',
    },
  ],
}

const DAROVACI_SMLOUVA: ContractGuide = {
  slug: 'darovaci-smlouva',
  generatorHint: 'Darovací smlouva',
  metaTitle: 'Darovací smlouva — vzor a návrh podle občanského zákoníku',
  metaDescription:
    'Co musí obsahovat darovací smlouva, kdy je nutná písemná forma, jak darovat nemovitost nebo auto a za jakých podmínek lze dar odvolat.',
  h1: 'Darovací smlouva',
  perex:
    'Darování vypadá jako nejjednodušší smlouva vůbec a skrývá dvě věci, které lidé nečekají. Písemná forma není potřeba vždy — ale u nemovitosti a u slibu darování do budoucna ano. A dar není nevratný: dárce jej může odvolat, upadne-li do nouze nebo chová-li se k němu obdarovaný nevděčně.',
  legalBasis: '§ 2055–2078 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení dárce a obdarovaného',
      body:
        'Jméno, datum narození nebo IČO a adresa u obou stran. U darování mezi příbuznými se vyplatí vztah uvést — má vliv na daňové posouzení.',
      law: '§ 2055 NOZ',
    },
    {
      title: 'Přesné určení daru',
      body:
        'U nemovitosti údaje z katastru: obec, katastrální území, číslo parcely nebo jednotky a list vlastnictví. U vozidla VIN, SPZ, značka a rok výroby. U peněz částka a měna.',
      law: '§ 2055 a § 553 NOZ',
    },
    {
      title: 'Výslovná bezplatnost',
      body:
        'Ze smlouvy musí být zřejmé, že se převádí bez protiplnění. Je-li sjednán jakýkoli doplatek nebo protislužba, nejde o darování, ale o jiný smluvní typ.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Přijetí daru',
      body:
        'Darování je dvoustranné právní jednání — obdarovaný musí dar přijmout. Jednostranné prohlášení dárce nestačí.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Popis stavu a známých vad',
      body:
        'Dárce odpovídá za vady jen v rozsahu, v jakém o nich věděl a neupozornil na ně. Popis stavu daru proto chrání obě strany.',
      law: '§ 2065 NOZ',
    },
    {
      title: 'U nemovitosti návrh na vklad',
      body:
        'Uveďte, kdo podá návrh na vklad do katastru a kdo hradí správní poplatek. Podpisy na vkladové listině musí být úředně ověřené a na téže listině.',
      law: '§ 1105 a § 561 odst. 2 NOZ',
    },
  ],

  pitfalls: [
    {
      title: 'Tvrzení, že dar je neodvolatelný',
      body:
        'Není. Dárce může dar odvolat pro vlastní nouzi nebo pro nevděk obdarovaného a těchto práv se nelze předem vzdát. Formulace o neodvolatelnosti uvádí obě strany v omyl.',
      law: '§ 2068 a § 2072 NOZ',
    },
    {
      title: 'Vlastnictví nemovitosti podpisem smlouvy',
      body:
        'U nemovitosti zapisované do katastru přechází vlastnické právo až vkladem, nikoli podpisem. Smlouva, která tvrdí opak, mate obě strany o okamžiku převodu.',
      law: '§ 1105 NOZ',
    },
    {
      title: 'Darování až po smrti dárce',
      body:
        'Darování závislé na tom, že obdarovaný dárce přežije, se posuzuje jako odkaz a řídí se dědickým právem. Běžnou darovací smlouvou to sepsat nelze.',
      law: '§ 2063 NOZ',
    },
    {
      title: 'Skryté protiplnění',
      body:
        'Závazek obdarovaného postarat se o dárce nebo doplatit rozdíl znamená, že nejde o darování. Chcete-li si zajistit dožití v nemovitosti, řeší se to věcným břemenem, ne podmínkou v daru.',
      law: '§ 2055 odst. 1 NOZ',
    },
    {
      title: 'Dar ze společného jmění bez souhlasu manžela',
      body:
        'Patří-li dar do společného jmění manželů, je k darování nad rámec běžné záležitosti potřeba souhlas druhého manžela. Bez něj se může dovolat neplatnosti.',
      law: '§ 714 NOZ',
    },
    {
      title: 'Domněnky o dani',
      body:
        'Daň darovací byla zrušena a bezúplatný příjem se posuzuje podle zákona o daních z příjmů. Příbuzní v linii přímé a vyjmenovaní další příbuzní jsou osvobozeni, konkrétní případ ale patří daňovému poradci.',
      law: '§ 10 odst. 3 zák. č. 586/1992 Sb.',
    },
  ],

  faq: [
    {
      question: 'Musí být darovací smlouva písemně?',
      answer:
        'Ne vždy. Písemná forma je nutná u věci zapsané do veřejného seznamu — typicky nemovitosti — a tam, kde se dar nepředává současně s uzavřením smlouvy. Movitou věc předanou z ruky do ruky lze darovat i ústně.',
    },
    {
      question: 'Lze dar vzít zpět?',
      answer:
        'Ano, ve dvou případech: upadne-li dárce do nouze a nemá na nutnou výživu, nebo ublížil-li mu obdarovaný způsobem, který zjevně porušuje dobré mravy. Práva odvolat dar se nelze předem vzdát.',
    },
    {
      question: 'Platí se z daru daň?',
      answer:
        'Daň darovací neexistuje od roku 2014; bezúplatný příjem se posuzuje jako příjem podle zákona o daních z příjmů. Příbuzní v linii přímé a vyjmenovaní příbuzní v linii vedlejší jsou osvobozeni.',
    },
    {
      question: 'Jak darovat nemovitost?',
      answer:
        'Písemnou smlouvou s projevy vůle obou stran na téže listině a úředně ověřenými podpisy, a následně vkladem do katastru nemovitostí. Vlastnictví přechází až vkladem.',
    },
    {
      question: 'Můžu darovat auto?',
      answer:
        'Ano. Vozidlo určete VIN, SPZ, značkou a rokem výroby a nezapomeňte na zápis změny vlastníka v registru silničních vozidel.',
    },
  ],
}

export const CONTRACT_GUIDES: ReadonlyArray<ContractGuide> = [
  KUPNI_SMLOUVA,
  KUPNI_SMLOUVA_AUTO,
  NAJEMNI_SMLOUVA,
  SMLOUVA_O_DILO,
  NDA_SMLOUVA,
  PRACOVNI_SMLOUVA,
  DOHODA_O_PROVEDENI_PRACE,
  SMLOUVA_O_ZAPUJCCE,
  DAROVACI_SMLOUVA,
]

export function getContractGuide(slug: string): ContractGuide | undefined {
  return CONTRACT_GUIDES.find((g) => g.slug === slug)
}
