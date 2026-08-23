# Právo365 — které smluvní typy doplnit

> Podklad pro rozhodování o pořadí, ne seznam pro seznam. České právo zná přes
> třicet pojmenovaných smluvních typů; drtivá většina z nich se v praxi
> nesepisuje a přidat je znamená nést jejich právní údržbu navždy.
>
> Řazeno podle toho, kolik lidí to skutečně potřebuje × jak velké je riziko, že
> to uděláme špatně. Poslední oddíl je stejně důležitý jako první: **co
> nenabízet vůbec.**
>
> Stav k 22. 8. 2026.

---

## 1. Co už umíme

| Typ | Právní základ | Generování | Kontrola |
|---|---|---|---|
| Kupní smlouva | § 2079 a násl. NOZ | ✅ | ✅ |
| Nájem bytu | § 2235 a násl. NOZ | ✅ | ✅ |
| Pracovní smlouva | § 34 a násl. ZP | ✅ | ✅ |
| Smlouva o dílo | § 2586 a násl. NOZ | ✅ | ✅ |
| NDA (mlčenlivost) | § 1746 odst. 2 NOZ | ✅ | ✅ |
| **Dohoda o provedení práce** | § 75 ZP | ❌ | ✅ |

Poslední řádek je aktuální mezera: právní profil pro DPP vznikl při opravě
kontroly, generátor k němu chybí.

---

## 2. Podle čeho je to seřazené

1. **Kolik lidí to reálně potřebuje.** Ne kolik typů zákon zná.
2. **Riziko chyby.** Čím větší hodnota transakce a čím méně vratná, tím opatrněji.
3. **Kolik práce navíc.** Typ blízký něčemu, co už máme, je levnější než nový svět.
4. **Kolik údržby přidá.** Každý typ je další sada hodnot, které mohou zastarat.

---

## 3. Vlna 1 — nejvyšší poměr dopadu k práci

**Hotovo — všech sedm typů má znalostní profil, schéma, landing page i regresní testy.**

| # | Typ | Právní základ | Proč |
|---|---|---|---|
| 1 | **Dohoda o provedení práce (DPP)** | § 75 ZP | Nejběžnější pracovněprávní dokument v ČR — brigády, studenti, částečné úvazky. Profil hotový. |
| 2 | **Dohoda o pracovní činnosti (DPČ)** | § 76 ZP | Sourozenec DPP, jiný limit rozsahu. Marginální práce navíc, jakmile bude DPP. |
| 3 | **Smlouva o zápůjčce** | § 2390 a násl. NOZ | Půjčka mezi lidmi. Obrovská poptávka, jednoduchý dokument, časté spory kvůli chybějícímu písemnému záznamu. |
| 4 | **Darovací smlouva** | § 2055 a násl. NOZ | Movitá i nemovitá věc. U nemovitosti společné jádro s kupní smlouvou (katastr, vklad). |
| 5 | **Plná moc** | § 441 a násl. NOZ | Není smlouva, ale poptávka je enormní a dokument triviální. Pozor na rozsah a formu u nemovitostí. |
| 6 | **Smlouva o poskytování služeb** | § 1746 odst. 2 NOZ | Nepojmenovaná, ale nejčastější dokument freelancerů a agentur. Dnes ji lidé nahrazují smlouvou o dílo, což často nesedí. |
| 7 | **Zpracovatelská smlouva (DPA)** | čl. 28 GDPR | B2B povinnost, kterou skoro nikdo nemá v pořádku. Opakovaná potřeba u každého dodavatele. |

> Body 1 a 2 nejsou stejná práce dvakrát — DPP a DPČ sdílejí § 74 i § 77 a liší
> se hlavně limitem rozsahu. Jakmile bude jeden, druhý je přírůstek.

---

## 4. Vlna 2 — solidní poptávka

| # | Typ | Právní základ | Poznámka |
|---|---|---|---|
| 8 | Nájem prostoru sloužícího podnikání | § 2302 a násl. NOZ | **Jiný režim než nájem bytu** — ochrana nájemce je výrazně slabší. Nesmí se sloučit s bytem. |
| 9 | Smlouva o smlouvě budoucí | § 1785 a násl. NOZ | Standardní krok u nemovitostí. |
| 10 | Podnájemní smlouva | § 2274 a násl. NOZ | Navazuje na nájem, potřebuje souhlas pronajímatele. |
| 11 | Uznání dluhu se splátkovým kalendářem | § 2053 NOZ | Vymáhání pohledávek, přerušuje promlčení. |
| 12 | Dohoda o narovnání | § 1903 a násl. NOZ | Ukončení sporu bez soudu. |
| 13 | Licenční smlouva | § 2358 a násl. NOZ | Software, grafika, texty. Doplňuje smlouvu o dílo, kde dnes licence chybí. |
| 14 | Dohoda o rozvázání pracovního poměru | § 49 ZP | Častější než výpověď a méně konfliktní. |
| 15 | Dohoda o odpovědnosti za svěřené hodnoty | § 252 ZP | Pokladní, sklad, prodejna. |
| 16 | Předávací protokol | smluvní praxe | Není smlouva, ale u nájmu a díla rozhoduje spory. Levné doplnit. |
| 17 | Smlouva o výkonu funkce | § 59 ZOK | Každé s.r.o. ji má mít; většina ji nemá. |

---

## 5. Vlna 3 — užší nebo náročnější

| # | Typ | Právní základ |
|---|---|---|
| 18 | Příkazní smlouva | § 2430 a násl. NOZ |
| 19 | Zprostředkovatelská smlouva | § 2445 a násl. NOZ |
| 20 | Postoupení pohledávky | § 1879 a násl. NOZ |
| 21 | Ručitelské prohlášení | § 2018 a násl. NOZ |
| 22 | Zástavní smlouva | § 1309 a násl. NOZ |
| 23 | Smlouva o zřízení služebnosti | § 1257 a násl. NOZ |
| 24 | Smlouva o převodu podílu v s.r.o. | § 207 a násl. ZOK — písemně s úředně ověřenými podpisy |
| 25 | Směnná smlouva | § 2184 a násl. NOZ |
| 26 | Smlouva o úschově | § 2402 a násl. NOZ |
| 27 | Výpůjčka a výprosa | § 2189–2200 NOZ |
| 28 | Pacht (zemědělský, pacht závodu) | § 2332 a násl. NOZ |
| 29 | Obchodní zastoupení | § 2483 a násl. NOZ |
| 30 | Smlouva o dílo na stavbu | § 2586 + § 2623–2630 NOZ — varianta stávajícího typu |

---

## 6. Co záměrně NEGENEROVAT

Toto není o obtížnosti. U těchto dokumentů zákon vyžaduje **formu veřejné
listiny (notářský zápis)** — dokument sepsaný jinak je neplatný. Vygenerovat
jej znamená dát uživateli papír, který vypadá jako smlouva a právně neexistuje.

| Dokument | Proč ne |
|---|---|
| **Společenská smlouva / zakladatelská listina s.r.o.** | § 8 ZOK — vyžaduje veřejnou listinu. Totéž platí pro její změny. |
| **Předmanželská smlouva** (smlouva o manželském majetkovém režimu) | § 716 NOZ — vyžaduje veřejnou listinu. |
| **Dědická smlouva** | § 1582 NOZ — vyžaduje veřejnou listinu a osobní jednání stran. |

Doporučení: místo generátoru u nich nabídnout **krátkou stránku, která
vysvětlí, že to musí sepsat notář, a proč**. Je to dobrý SEO obsah, chrání
uživatele a buduje důvěru víc než další formulář.

### Další, kde bych byl opatrný

| Dokument | Riziko |
|---|---|
| Závěť | Formálně ji lze sepsat vlastní rukou, ale chyba se projeví, až když ji nelze opravit. Vysoká emocionální i majetková hodnota. |
| Rozvodová dohoda / úprava poměrů k dětem | Schvaluje soud, po novele 268/2025 Sb. nová úprava. Citlivé a individuální. |
| Pojistné smlouvy | § 2758 a násl. — sepisuje pojistitel, uživatel je nikdy nepíše. |
| Spotřebitelský úvěr | Zvláštní regulace (zák. č. 257/2016 Sb.), licencovaná činnost. |

---

## 7. Jednostranné úkony — jiná kategorie, velká poptávka

Nejsou to smlouvy, ale lidé je hledají stejně často a dnes je nemáme.
Jsou krátké a formálně přísné, takže poměr užitku k práci je výborný.

| Dokument | Právní základ | Stav | Pozor na |
|---|---|---|---|
| Výpověď z nájmu bytu (pronajímatel) | § 2288–2291 NOZ | ✅ | Musí obsahovat důvod **a poučení o právu podat námitky a navrhnout přezkum soudem**, jinak je vadná. |
| Výpověď z nájmu bytu (nájemce) | § 2287 NOZ | ✅ | Bez důvodu, tříměsíční lhůta. |
| Výpověď z pracovního poměru (zaměstnanec) | § 50 ZP | ✅ | Bez důvodu; od 1. 6. 2025 běží lhůta od doručení. |
| Výpověď z pracovního poměru (zaměstnavatel) | § 52 ZP | ✅ | Jen z taxativních důvodů — vysoké riziko chyby. |
| Zrušení dohody (DPP/DPČ) | § 77 odst. 4 ZP | ✅ | Patnáct dní, i bez důvodu. |
| Odstoupení od smlouvy | § 2001–2005 NOZ | ✅ | Musí existovat důvod ve smlouvě nebo v zákoně. |
| Odstoupení spotřebitele do 14 dnů | § 1829 NOZ | ✅ | Jen u smluv uzavřených distančně. |
| Reklamace | § 2165 a násl. NOZ | ✅ | Lhůty po novele 374/2022 Sb. |
| Předžalobní výzva | § 142a OSŘ | ✅ | Podmínka náhrady nákladů řízení. |

---

## 8. Co bych dělal v tomto pořadí

1. **DPP + DPČ** — mezera v tom nejběžnějším, právní práce hotová.
2. **Zápůjčka + darovací** — vysoká poptávka, nízké riziko, blízko kupní smlouvě.
3. **Jednostranné úkony (výpovědi)** — krátké dokumenty, obrovské hledanosti,
   a přesně tam, kde lidé nejčastěji udělají formální chybu.

Body 1–3 jsou hotové. Z **vlny 2** jsou hotové uznání dluhu a dohoda o rozvázání
pracovního poměru; zbývají nájem prostoru sloužícího podnikání, smlouva o smlouvě
budoucí a licenční smlouva.
4. **Zpracovatelská smlouva GDPR** — jiný typ zákazníka (B2B), opakovaná potřeba.
5. **Nájem prostoru sloužícího podnikání** — jakmile bude kapacita na druhý
   nájemní režim.

Body 1–3 zároveň pokrývají nejsilnější dlouhé vyhledávací dotazy
(„dohoda o provedení práce vzor", „smlouva o půjčce vzor", „výpověď z nájmu vzor"),
takže se potkávají s obsahovou strategií.
