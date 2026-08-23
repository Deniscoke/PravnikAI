import type { ContractGuide } from './types'

export const SMLOUVA_O_ZAPUJCCE: ContractGuide = {
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
