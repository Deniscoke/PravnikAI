import type { ContractGuide } from './types'

export const NDA_SMLOUVA: ContractGuide = {
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
