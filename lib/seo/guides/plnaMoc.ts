import type { ContractGuide } from './types'

export const PLNA_MOC: ContractGuide = {
  slug: 'plna-moc',
  generatorHint: 'Plná moc',
  metaTitle: 'Plná moc — vzor a návod podle občanského zákoníku',
  metaDescription:
    'Co musí plná moc obsahovat, kdy je nutný úředně ověřený podpis, jak vymezit rozsah zmocnění a proč úřady plné moci nejčastěji odmítají.',
  h1: 'Plná moc',
  perex:
    'Plná moc je jednostranné prohlášení, kterým dáváte někomu oprávnění jednat za vás. Je krátká a působí jednoduše, ale úřady ji odmítají překvapivě často — a téměř vždy ze dvou důvodů: má špatnou formu, nebo je rozsah zmocnění napsaný jako cíl místo jako výčet úkonů.',
  legalBasis: '§ 441–449 zák. č. 89/2012 Sb., občanský zákoník',

  mustContain: [
    {
      title: 'Označení zmocnitele a zmocněnce',
      body:
        'U obou uveďte jméno, datum narození nebo IČO a adresu. Třetí osoba, které plnou moc předložíte, musí být schopna ověřit, kdo koho zmocnil.',
      law: '§ 441 odst. 1 NOZ',
    },
    {
      title: 'Rozsah zmocnění jako výčet úkonů',
      body:
        'Nejdůležitější část dokumentu. Vyjmenujte konkrétní úkony, ne zamýšlený výsledek. Oprávnění „podepsat kupní smlouvu" nezahrnuje podání návrhu na vklad ani další jednání s katastrálním úřadem — pokud je má zmocněnec činit, musí být uvedeny zvlášť.',
      law: '§ 441 odst. 1 NOZ',
    },
    {
      title: 'Určení, čeho se zmocnění týká',
      body:
        'U nemovitosti uveďte údaje z katastru, u vozidla VIN a SPZ, u řízení jeho spisovou značku. Bez toho není zřejmé, k čemu se oprávnění vztahuje.',
    },
    {
      title: 'Doba platnosti',
      body:
        'Uveďte, do kdy plná moc platí, nebo ji navažte na splnění vyjmenovaných úkonů. Bez omezení platí, dokud ji neodvoláte — a na to se snadno zapomene.',
      law: '§ 448 NOZ',
    },
    {
      title: 'Datum, místo a podpis zmocnitele',
      body:
        'Plnou moc podepisuje pouze zmocnitel. Datum je nezbytné pro posouzení, zda zmocnění ještě trvá.',
    },
  ],

  pitfalls: [
    {
      title: 'Špatná forma u nemovitosti',
      body:
        'Vyžaduje-li zastupované jednání zvláštní formu, musí ji mít i plná moc. U převodu nemovitosti to znamená úředně ověřený podpis zmocnitele — bez něj katastrální úřad plnou moc nepřijme a převod se zdrží.',
      law: '§ 441 odst. 2 NOZ',
    },
    {
      title: 'Rozsah napsaný jako cíl',
      body:
        'Nejčastější důvod odmítnutí. „Zmocňuji k prodeji bytu" nestačí — je třeba vyjmenovat podpis smlouvy, podání návrhu na vklad, převzetí rozhodnutí a jakékoli další kroky, které má zmocněnec udělat.',
      law: '§ 441 odst. 1 NOZ',
    },
    {
      title: 'Generální plná moc bez rozmyslu',
      body:
        'Zmocnění „ke všem právním jednáním" je platné, ale zmocněnec s ním může nakládat i s majetkem, na který jste nemysleli. Pokud nejde o osobu, které bezvýhradně důvěřujete, rozsah omezte.',
    },
    {
      title: 'Očekávání, že zmocněnec může pověřit někoho dalšího',
      body:
        'Zmocněnec jedná osobně. Dalšího zástupce může ustanovit jen tehdy, bylo-li to ujednáno nebo vyžaduje-li to nutná potřeba. Chcete-li to umožnit, napište to výslovně.',
      law: '§ 438 NOZ',
    },
    {
      title: 'Ujednání, že plnou moc nelze odvolat',
      body:
        'Zmocnitel se práva odvolat zmocnění nemůže platně vzdát. Odvolání je vůči třetím osobám účinné, jakmile se o něm dozvědí — proto je vhodné je oznámit i tomu, kdo s plnou mocí přišel do styku.',
      law: '§ 448 a § 449 NOZ',
    },
    {
      title: 'Jednání nad rámec zmocnění',
      body:
        'Překročí-li zmocněnec rozsah, zmocnitele to nezavazuje, ledaže jednání dodatečně schválí. Třetí osoba se pak může domáhat plnění po zmocněnci samotném.',
      law: '§ 446 NOZ',
    },
  ],

  faq: [
    {
      question: 'Musí být plná moc písemně?',
      answer:
        'Zákon obecně formu nepředepisuje, ale vyžaduje-li zastupované jednání zvláštní formu, musí ji mít i plná moc. V praxi se plná moc píše vždy — jinak ji nemáte čím prokázat.',
    },
    {
      question: 'Kdy potřebuji úředně ověřený podpis?',
      answer:
        'Vždy, když zastupované jednání vyžaduje ověřený podpis — typicky u nemovitostí zapisovaných do katastru. Ověření provede notář, advokát, pošta (Czech POINT) nebo obecní úřad.',
    },
    {
      question: 'Jak plnou moc zrušit?',
      answer:
        'Odvoláním. Je vhodné je učinit písemně a doručit zmocněnci; vůči třetím osobám je odvolání účinné, jakmile se o něm dozvědí, takže je rozumné informovat i úřad nebo protistranu.',
    },
    {
      question: 'Musí zmocněnec plnou moc podepsat?',
      answer:
        'Nemusí — jde o jednostranné jednání zmocnitele. V praxi se přijetí často připojuje, protože usnadňuje prokázání, že zmocněnec o zmocnění ví.',
    },
    {
      question: 'Platí plná moc i po smrti zmocnitele?',
      answer:
        'Zpravidla ne. Zmocnění zaniká, nevyplývá-li z jeho obsahu něco jiného — na to je třeba myslet zejména u dlouhodobých zmocnění.',
    },
  ],
}
