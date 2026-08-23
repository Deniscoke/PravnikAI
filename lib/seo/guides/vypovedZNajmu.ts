import type { ContractGuide } from './types'

export const VYPOVED_Z_NAJMU: ContractGuide = {
  slug: 'vypoved-z-najmu-bytu',
  generatorHint: 'Výpověď z nájmu bytu',
  metaTitle: 'Výpověď z nájmu bytu — vzor a náležitosti podle § 2286 a násl. NOZ',
  metaDescription:
    'Co musí výpověď z nájmu obsahovat, odkdy běží tříměsíční výpovědní doba a proč je výpověď pronajímatele bez poučení o námitkách neplatná.',
  h1: 'Výpověď z nájmu bytu',
  perex:
    'Pro nájemce a pro pronajímatele platí zcela jiná pravidla. Nájemce může nájem na dobu neurčitou vypovědět kdykoli a bez důvodu. Pronajímatel jen z důvodů, které zákon vyjmenovává — a musí nájemce poučit o právu podat námitky a nechat výpověď přezkoumat soudem. Chybí-li ta jediná věta, je výpověď neplatná, i kdyby byl důvod zcela oprávněný.',
  legalBasis: '§ 2286–2296 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Písemná forma a doručení',
      body:
        'Výpověď musí být písemná a musí druhé straně dojít. Vyhotovení ani odeslání nestačí — rozhodující je okamžik dojití, protože od něj se odvíjí běh výpovědní doby. Volte proto způsob, který umíte prokázat.',
      law: '§ 2286 odst. 1 a § 570 NOZ',
    },
    {
      title: 'Označení vypovídaného nájmu',
      body:
        'Uveďte nájemní smlouvu, kterou vypovídáte — datum jejího uzavření a byt, kterého se týká: adresu, číslo bytu, patro. Bez toho není zřejmé, co se ukončuje.',
      law: '§ 553 NOZ',
    },
    {
      title: 'Výpovědní důvod (dává-li výpověď pronajímatel)',
      body:
        'Pronajímatel musí uvést důvod, a to důvod, který zákon připouští — například hrubé porušení povinností nájemce nebo potřeba bytu pro sebe či příbuzného. Nájem bytu nelze vypovědět „bez udání důvodu". Ujednání ve smlouvě, které to pronajímateli dovoluje, zkracuje práva nájemce a nepřihlíží se k němu.',
      law: '§ 2288 NOZ',
    },
    {
      title: 'Poučení o právu vznést námitky (dává-li výpověď pronajímatel)',
      body:
        'Pronajímatel musí nájemce poučit o právu vznést proti výpovědi námitky a navrhnout přezkoumání její oprávněnosti soudem. Je to samostatná náležitost, ne formalita — bez ní je výpověď neplatná.',
      law: '§ 2286 odst. 2 NOZ',
    },
    {
      title: 'Tříměsíční výpovědní doba',
      body:
        'Výpovědní doba činí tři měsíce, nejde-li o výpověď bez výpovědní doby podle § 2291. Kratší doba zkracuje práva nájemce.',
      law: '§ 2288 odst. 1 NOZ',
    },
    {
      title: 'Datum a podpis vypovídající strany',
      body:
        'Výpověď podepisuje pouze ten, kdo ji dává. Podpis druhé strany slouží nejvýše jako potvrzení převzetí, nikoli jako souhlas — jinak by šlo o dohodu o skončení nájmu, což je jiný dokument s jinými pravidly.',
    },
  ],

  pitfalls: [
    {
      title: 'Chybějící poučení o námitkách',
      body:
        'Nejzávažnější a zároveň nejčastější vada výpovědi z nájmu. Pronajímatel popíše důvod přesně, doručí prokazatelně — a přesto neuspěje, protože ve výpovědi není věta o právu nájemce vznést námitky a navrhnout přezkoumání soudem.',
      law: '§ 2286 odst. 2 NOZ',
    },
    {
      title: 'Výpovědní doba počítaná ode dne doručení',
      body:
        'U nájmu bytu začíná výpovědní doba běžet až prvním dnem kalendářního měsíce následujícího po měsíci, v němž výpověď došla. Pravidlo „ode dne doručení" platí od června 2025 u pracovního poměru — u nájmu se nezměnilo nic. Vzory obojí běžně zaměňují.',
      law: '§ 2286 odst. 1 NOZ',
    },
    {
      title: 'Okamžitá výpověď bez předchozí výzvy',
      body:
        'Výpověď bez výpovědní doby je možná jen při zvlášť závažném porušení povinností nájemce a pronajímatel jej musí předtím vyzvat, aby závadné chování v přiměřené době odstranil. Bez té výzvy neobstojí.',
      law: '§ 2291 NOZ',
    },
    {
      title: 'Nájemce vypovídající nájem na dobu určitou bez důvodu',
      body:
        'Na dobu neurčitou může nájemce odejít kdykoli a bez důvodu. U nájmu na dobu určitou to jde jen tehdy, změní-li se okolnosti natolik, že po něm nelze rozumně požadovat, aby v nájmu pokračoval — a tuto změnu musí ve výpovědi uvést.',
      law: '§ 2287 NOZ',
    },
    {
      title: 'Požadování náležitostí, které se na nájemce nevztahují',
      body:
        'Uvedení důvodu a poučení o námitkách ukládá zákon pouze pronajímateli. Výpověď nájemce je bez nich zcela v pořádku.',
      law: '§ 2287 NOZ',
    },
    {
      title: 'Zmeškání dvouměsíční lhůty pro námitky',
      body:
        'Má-li nájemce za to, že výpověď pronajímatele není oprávněná, může navrhnout její přezkoumání soudem do dvou měsíců ode dne, kdy mu výpověď došla.',
      law: '§ 2290 NOZ',
    },
  ],

  faq: [
    {
      question: 'Může mě pronajímatel vystěhovat bez udání důvodu?',
      answer:
        'Ne. Nájem bytu lze ze strany pronajímatele vypovědět jen z důvodů uvedených v § 2288. Ujednání ve smlouvě, které by mu dovolovalo vypovědět nájem bez důvodu, zkracuje práva nájemce a nepřihlíží se k němu.',
    },
    {
      question: 'Odkdy běží tříměsíční výpovědní doba?',
      answer:
        'Od prvního dne kalendářního měsíce následujícího po měsíci, v němž výpověď došla druhé straně. Dojde-li výpověď 20. března, běží výpovědní doba od 1. dubna a nájem skončí 30. června.',
    },
    {
      question: 'Musím jako nájemce uvést důvod?',
      answer:
        'U nájmu na dobu neurčitou ne — můžete vypovědět kdykoli a bez důvodu s tříměsíční výpovědní dobou. U nájmu na dobu určitou musíte uvést podstatnou změnu okolností.',
    },
    {
      question: 'Co když ve výpovědi chybí poučení o námitkách?',
      answer:
        'Výpověď pronajímatele je pak neplatná. Nájemce může proti výpovědi vznést námitky a do dvou měsíců od jejího doručení navrhnout, aby ji přezkoumal soud.',
    },
    {
      question: 'Kdy lze vypovědět nájem bez výpovědní doby?',
      answer:
        'Jen při zvlášť závažném porušení povinností nájemce — například neplacení nájemného a služeb po dobu alespoň tří měsíců nebo poškozování bytu závažným způsobem. Pronajímatel musí nájemce nejprve vyzvat k nápravě.',
    },
    {
      question: 'Je výpověď totéž co dohoda o skončení nájmu?',
      answer:
        'Není. Výpověď je jednostranná a podepisuje ji jen ten, kdo ji dává. Dohoda vyžaduje souhlas obou stran, zato může nájem ukončit ke kterémukoli dni bez výpovědní doby.',
    },
  ],
}
