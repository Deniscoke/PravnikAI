import type { ContractGuide } from './types'

export const ZPRACOVATELSKA_SMLOUVA: ContractGuide = {
  slug: 'zpracovatelska-smlouva-gdpr',
  generatorHint: 'Zpracovatelská smlouva (GDPR)',
  metaTitle: 'Zpracovatelská smlouva podle GDPR — vzor a povinné náležitosti',
  metaDescription:
    'Co musí obsahovat zpracovatelská smlouva podle čl. 28 GDPR, všech osm povinných ustanovení, kdy ji vůbec potřebujete a proč vzory z internetu nestačí.',
  h1: 'Zpracovatelská smlouva (GDPR)',
  perex:
    'Zpracovatelská smlouva je jediný typ smlouvy, u kterého zákon vypisuje obsah bod po bodu. Článek 28 odst. 3 GDPR jmenuje pět věcí, které musí smlouva popsat, a osm povinností, které musí uložit. Chybí-li kterákoli, smlouva požadavky nesplňuje — a to není otázka vkusu, ale nařízení.',
  legalBasis: 'čl. 28 nařízení (EU) 2016/679 (GDPR); zák. č. 110/2019 Sb.',

  mustContain: [
    {
      title: 'Předmět a doba zpracování',
      body:
        'Co zpracovatel dělá a jak dlouho. Doba může být navázána na trvání hlavní smlouvy, ale musí být určitelná.',
      law: 'čl. 28 odst. 3 GDPR',
    },
    {
      title: 'Povaha a účel zpracování',
      body:
        'Jaké operace se s údaji provádějí (ukládání, zpřístupňování, výmaz) a k čemu je správce zpracovává.',
      law: 'čl. 28 odst. 3 GDPR',
    },
    {
      title: 'Typy osobních údajů a kategorie subjektů',
      body:
        'Vyjmenujte konkrétní údaje — jméno, adresa, číslo účtu — a čí jsou: zaměstnanci, zákazníci, uchazeči. Obecné „osobní údaje" nestačí. Zahrnuje-li zpracování zvláštní kategorie podle čl. 9, uveďte to výslovně.',
      law: 'čl. 28 odst. 3 a čl. 9 GDPR',
    },
    {
      title: 'Zpracování jen na doložené pokyny správce',
      body:
        'První z osmi povinností. Zpracovatel nesmí s údaji nakládat po svém, včetně předání do třetí země.',
      law: 'čl. 28 odst. 3 písm. a)',
    },
    {
      title: 'Mlčenlivost oprávněných osob',
      body:
        'Osoby, které se k údajům dostanou, musí být vázány mlčenlivostí — smluvně nebo ze zákona.',
      law: 'čl. 28 odst. 3 písm. b)',
    },
    {
      title: 'Konkrétní technická a organizační opatření',
      body:
        'Ne odkaz na čl. 32, ale výčet toho, co je skutečně zavedeno: šifrování v úložišti i při přenosu, řízení přístupových práv, zálohy a testovaná obnovitelnost, dvoufaktorové ověření.',
      law: 'čl. 28 odst. 3 písm. c) a čl. 32',
    },
    {
      title: 'Režim dalších zpracovatelů',
      body:
        'Buď konkrétní souhlas pro každého, nebo obecné povolení s povinností oznámit změnu a s právem správce vznést námitku. Na subdodavatele musí být přeneseny tytéž povinnosti.',
      law: 'čl. 28 odst. 2 a odst. 3 písm. d)',
    },
    {
      title: 'Součinnost při právech subjektů údajů',
      body:
        'Zpracovatel pomáhá správci vyřídit žádosti o přístup, opravu nebo výmaz. Uveďte lhůtu — správce má na vyřízení jeden měsíc a potřebuje podklady dřív.',
      law: 'čl. 28 odst. 3 písm. e)',
    },
    {
      title: 'Ohlašování porušení zabezpečení',
      body:
        'Uveďte lhůtu v hodinách. Správce musí ohlásit dozorovému úřadu do 72 hodin od okamžiku, kdy se o porušení dozvěděl — pokud mu zpracovatel slíbí jen „bez zbytečného odkladu", nemá jak lhůtu dodržet.',
      law: 'čl. 28 odst. 3 písm. f) a čl. 33',
    },
    {
      title: 'Výmaz nebo vrácení údajů po skončení',
      body:
        'Volbu činí správce, nikoli zpracovatel. Uveďte i lhůtu a to, že se mažou i kopie a zálohy.',
      law: 'čl. 28 odst. 3 písm. g)',
    },
    {
      title: 'Doložení souladu a právo na audit',
      body:
        'Zpracovatel musí poskytnout informace potřebné k doložení splnění povinností a umožnit audit. Upravte praktické podmínky — oznámení předem, četnost, náklady.',
      law: 'čl. 28 odst. 3 písm. h)',
    },
  ],

  pitfalls: [
    {
      title: 'Smlouva, která jen opisuje nařízení',
      body:
        'Nejčastější vada. Evropský sbor pro ochranu osobních údajů výslovně uvádí, že smlouva nemá text čl. 28 opakovat, ale konkrétně popsat, jak budou požadavky splněny. Věta „zpracovatel přijme vhodná technická opatření" neříká správci nic, co by nevěděl už ze zákona.',
      law: 'EDPB Guidelines 07/2020',
    },
    {
      title: 'Uzavření zpracovatelské smlouvy tam, kde nepatří',
      body:
        'Zpracovává-li druhá strana údaje pro vlastní účely, jde o samostatného správce a čl. 28 se nepoužije. Zpracovatelská smlouva mezi dvěma správci je nadbytečná a vytváří falešný dojem, že je vztah ošetřen.',
      law: 'čl. 4 bod 7 a 8 GDPR',
    },
    {
      title: 'Ohlašování incidentu „bez zbytečného odkladu"',
      body:
        'Pro správce nepoužitelné. Jeho vlastní lhůta je 72 hodin od zjištění, takže potřebuje od zpracovatele zprávu řádově dřív — v praxi do 24 nebo 48 hodin.',
      law: 'čl. 33 GDPR',
    },
    {
      title: 'Paušální souhlas se subdodavateli',
      body:
        'Obecné povolení je přípustné, ale musí být doprovázeno oznamováním změn a právem správce vznést námitku. Bez toho správce ztrácí přehled o tom, kdo s údaji nakládá.',
      law: 'čl. 28 odst. 2 GDPR',
    },
    {
      title: 'Předání mimo EHP bez mechanismu',
      body:
        'Souhlas správce sám o sobě nestačí. Je třeba uvést rozhodnutí o odpovídající ochraně, standardní smluvní doložky nebo závazná podniková pravidla. Odkaz na Safe Harbor nebo Privacy Shield je neplatný — obě rozhodnutí byla zrušena.',
      law: 'čl. 44–49 GDPR',
    },
    {
      title: 'Vyloučení odpovědnosti zpracovatele',
      body:
        'Vůči subjektům údajů je takové ujednání neúčinné. Zpracovatel odpovídá za újmu, pokud nedodržel povinnosti uložené přímo jemu nebo jednal mimo pokyny správce.',
      law: 'čl. 82 GDPR',
    },
  ],

  faq: [
    {
      question: 'Kdy zpracovatelskou smlouvu potřebuji?',
      answer:
        'Vždy, když pro vás někdo zpracovává osobní údaje — účetní, mzdová firma, poskytovatel cloudu, e-mailingový nástroj, vývojář se přístupem k produkční databázi. Nepotřebujete ji tam, kde druhá strana zpracovává údaje pro sebe.',
    },
    {
      question: 'Musí být písemná?',
      answer:
        'Ano, ale postačí elektronická forma podle čl. 28 odst. 9 GDPR.',
    },
    {
      question: 'Stačí mi vzor z internetu?',
      answer:
        'Jako kostra ano, jako hotový dokument ne. Vzory bývají opisem nařízení a neobsahují to podstatné — jmenovaná bezpečnostní opatření, konkrétní lhůty a seznam subdodavatelů. Právě to od smlouvy dozorový úřad čeká.',
    },
    {
      question: 'Co když zpracovatel používá subdodavatele?',
      answer:
        'Musí mít vaše povolení — konkrétní pro každého, nebo obecné s oznamováním změn a vaším právem vznést námitku. Na subdodavatele musí přenést tytéž povinnosti, které má sám.',
    },
    {
      question: 'Jak rychle mi musí zpracovatel nahlásit únik dat?',
      answer:
        'Zákon říká „bez zbytečného odkladu", ale vy máte na ohlášení úřadu 72 hodin. Ve smlouvě si proto sjednejte konkrétní lhůtu v hodinách, typicky 24 nebo 48.',
    },
    {
      question: 'Kdo rozhoduje, zda se údaje po skončení smažou nebo vrátí?',
      answer:
        'Správce. Čl. 28 odst. 3 písm. g) dává volbu jemu, nikoli zpracovateli.',
    },
  ],
}
