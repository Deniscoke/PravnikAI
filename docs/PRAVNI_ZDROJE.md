# Právní zdroje a údržba právních hodnot

Tento dokument popisuje, odkud Právo365 bere právní hodnoty, jak se udržují aktuální
a co dělat, když se změní zákon.

**Proč vznikl:** aplikace dlouho pracovala s minimální mzdou z roku 2024 a se zkušební
dobou podle úpravy před flexinovelou. Obojí prošlo validací jako správné. Chyba nebyla
v modelu ani v promptu — nikdo se prostě neptal, jestli ta čísla ještě platí.

---

## 1. Kde právní znalosti žijí

Právní obsah aplikace má **dvě vrstvy** a obě jsou jediným zdrojem pravdy pro to,
co pokrývají.

### 1.1 Čísla — `lib/legal/czechLegalFacts.ts`

Minimální mzda, zkušební doba, jistota, limit hotovosti. Každá hodnota nese
ustanovení, datum účinnosti, zdroj a **datum posledního ověření člověkem**.
Validátory, schémata i prompty z ní jen čtou — nikde jinde se číslo nepíše natvrdo.

### 1.2 Pravidla — `lib/legal/knowledge/`

```
types.ts                 typový systém (viz níže)
common.ts                pravidla platná pro každou smlouvu
profiles/sale.ts         kupní smlouva
profiles/tenancy.ts      nájem bytu
profiles/employment.ts   pracovní smlouva
profiles/services.ts     smlouva o dílo
profiles/nda.ts          dohoda o mlčenlivosti
index.ts                 registr + renderery pro prompty
```

Každé pravidlo nese požadavek, **následek jeho porušení**, citaci ustanovení
a volitelně to, co má kontrola v hotovém textu hledat.

**Následek je uzavřený typ, ne volný text.** České právo rozlišuje neplatnost
(vada při vzniku), zdánlivost („nepřihlíží se") a porušení smlouvy zakládající
právo odstoupit. Model tyto instituty opakovaně zaměňoval a výsledek zněl
sebejistě a byl nesprávný. Tím, že si následek nemůže zvolit sám, tato chyba
zmizela z principu.

### 1.3 Kdo z toho čte

| Vrstva | Generování smlouvy | Kontrola smlouvy |
|---|---|---|
| `czechLegalFacts` | validátory, schémata, prompty | validátory |
| `knowledge` | `renderKnowledgeForDrafting()` | `renderKnowledgeForReview()` |

Renderery jsou **oddělené záměrně**: generátor dostane jen požadavky, kontrola
jen kontrolní body. Znalost se píše jednou, do promptu jde vždy jen jeho polovina —
tyto texty se posílají při každém požadavku a tvoří provozní náklad produktu.

> **Schémata už zákonné požadavky neobsahují.** V `aiInstructions` zůstaly pouze
> pokyny ke stylu a pravidla proti vymýšlení obsahu. Právní checklist tam byl
> duplicitně a duplicity se časem rozejdou — přesně to je chyba, kterou tento
> dokument řeší.

### 1.4 Hlídač překonané úpravy — `lib/legal/staleLawGuard.ts`

Model má nastudovaný **český internet z doby před flexinovelou** mnohotisíckrát,
současné znění řádově méně. I když v promptu dostane správnou hodnotu, ve volném
textu sáhne po formulaci, kterou zná — „zkušební doba nejvýše 3 měsíce".

Hlídač hledá **šest konkrétních zrušených tvrzení**:

| Tvrzení | Platilo do | Dnes |
|---|---|---|
| Zkušební doba nejvýše 3 (6) měsíců | 31. 5. 2025 | 4 (8) měsíců |
| Výpovědní doba začíná prvním dnem dalšího měsíce | 31. 5. 2025 | běží od doručení |
| Minimální mzda 18 900 Kč a starší | 31. 12. 2025 | 22 400 Kč |
| Jistota až šestinásobek nájemného | 30. 6. 2020 | trojnásobek |
| Limit hotovosti 350 000 Kč | 2018 | 270 000 Kč |
| „Ze zákona záruka 24 měsíců" | 5. 1. 2023 | práva z vadného plnění, 2 roky |

Pracuje **proximitně, ne podle klíčových slov**. Každé z těch čísel je někde
zcela správné — „tři měsíce" je správná výpovědní doba u nájmu bytu. Pravidlo
se spustí jen tehdy, když se zastaralá hodnota objeví *společně* s tématem,
o kterém by byla nesprávná, v krátkém úseku textu. Falešný poplach je horší než
přehlédnutí: zamlčel by správnou formulaci a uživateli tvrdil, že jeho v pořádku
sepsaná smlouva je vadná.

Kde se uplatní:

- **generování** — nález je chyba a smlouva se přeřadí na `review-needed`
- **kontrola** — navrhované znění s překonanou úpravou se uživateli vůbec nezobrazí

> Přibude-li novela, přidej pravidlo sem. Je to nejlevnější místo, kde jde
> zastaralou právní znalost zachytit — funguje i tehdy, když prompt selže.

### 1.5 Testy stáří

`lib/legal/__tests__/czechLegalFacts.test.ts` a
`lib/legal/knowledge/__tests__/knowledge.test.ts` upozorní, jakmile je hodnota
nebo profil neověřený déle než **rok**. Ty testy mají selhat — je to připomínka,
ne chyba.

Druhý z nich navíc hlídá, že podstatná náležitost nikdy nemá následek
„doporučeno", že zakázané ujednání vždy nese skutečnou sankci a že se do znalostní
báze nedostane konkrétní procento úroku z prodlení (mění se každé pololetí).

---

## 2. Předpisy, na kterých závisíme

| Předpis | Co z něj bereme | Kde hlídat |
|---|---|---|
| **zák. č. 89/2012 Sb.** (občanský zákoník) | kupní smlouva, nájem, dílo, jistota, vady | [e-Sbírka](https://zakony.gov.cz/) |
| **zák. č. 262/2006 Sb.** (zákoník práce) | minimální mzda, zkušební doba, doba určitá, dovolená, výpovědní doba | [MPSV](https://mpsv.gov.cz/) + e-Sbírka |
| **zák. č. 90/2012 Sb.** (ZOK) | obchodní korporace | e-Sbírka |
| **zák. č. 254/2004 Sb.** | limit plateb v hotovosti | e-Sbírka |
| **zák. č. 85/1996 Sb.** (o advokacii) | vymezení, co *není* právní služba — týká se provozovatele | e-Sbírka |
| **GDPR / zák. č. 110/2019 Sb.** | zpracování osobních údajů | [ÚOOÚ](https://www.uoou.cz) |
| **nař. vlády č. 351/2013 Sb.** | úrok z prodlení — **vzorec**, nikdy pevné procento (repo ČNB + 8 p. b., mění se pololetně) | [ČNB](https://www.cnb.cz/) |
| **zák. č. 216/1994 Sb.** | rozhodčí doložka — od 1. 12. 2016 zakázaná ve spotřebitelských smlouvách | e-Sbírka |
| **nař. vlády č. 308/2015 Sb.** | vymezení běžné údržby a drobných oprav v nájmu | e-Sbírka |
| **zák. č. 256/2013 Sb.** (katastrální) | vklad vlastnického práva k nemovitosti | [ČÚZK](https://www.cuzk.cz) |
| **zák. č. 56/2001 Sb.** | přepis vozidla v registru | e-Sbírka |

---

## 3. Zdroje dat

**Oficiální — e-Sbírka (`zakony.gov.cz`)**
Od 15. 1. 2024 poskytuje otevřená data a veřejné API ve formátech XML a JSON.
Je to státem garantovaná databáze právních předpisů.

**Komerční — Zákony pro lidi (`zakonyprolidi.cz/help/api.htm`)**
Placené API s aktuálním zněním předpisů, historií verzí a vzájemnými vazbami.
Obsahově odpovídá Sbírce.

**Minimální mzda — MPSV**
Od roku 2025 se odvozuje indexačním mechanismem, takže se mění **každý leden**.
Je to nejrychleji zastarávající hodnota v celém systému.

---

## 4. Kdy kontrolovat

| Kdy | Co |
|---|---|
| **Každý leden** | minimální a zaručená mzda — mění se pravidelně |
| **Čtvrtletně** | projít účinné novele NOZ a ZP; zkontrolovat, zda test na stáří hodnot neselhává |
| **Při každém selhání testu stáří** | ověřit dotčenou hodnotu a posunout `lastVerified` |
| **Ad hoc** | když se v médiích objeví „od ledna se mění…" k některému z předpisů výše |

> **Automatické sledování legislativy zatím nepoužíváme.** e-Sbírka sice API má, ale
> spolehlivý hlídač je samostatný projekt, který navíc může tiše přestat fungovat —
> a tiché selhání je horší než kalendářní připomínka. Až bude produkt vydělávat,
> stojí za zvážení.

---

## 5. Postup při změně zákona

1. Ověř novou hodnotu v oficiálním zdroji (ne v článku na zpravodajském webu).
2. **Jde-li o číslo** — uprav `value` a `effectiveFrom` v `lib/legal/czechLegalFacts.ts`.
   **Jde-li o pravidlo** — uprav dotčené pravidlo v `lib/legal/knowledge/`; zkontroluj,
   zda se nezměnil i jeho `consequence`.
3. Nastav `lastVerified` na dnešní datum — u hodnoty i u celého profilu.
4. Spusť `npm test` — část testů na hodnotách schválně trvá, takže uvidíš, co se rozjelo.
5. Projdi texty, které hodnotu **popisují slovy** (SEO stránky `lib/seo/contractGuides.ts`)
   — ty se z konstanty negenerují vždy.
6. Nasaď a zaznamenej změnu do commit message i sem, pokud šlo o věcnou novelu.

> Změnil-li se výklad, ale ne text zákona, stačí upravit `reviewCheck` — kontrola
> pak hledá nový jev, aniž by se měnil samotný požadavek.

---

## 6. Historie věcných změn

| Datum | Změna | Dopad |
|---|---|---|
| 2026-08-21 | Zavedena `lib/legal/knowledge` — pravidla pro pět smluvních typů; kontrola smluv poprvé dostává typový checklist | Zrušen duplicitní checklist ve schématech; opravena formulace u § 2239 (nešlo o neplatnost, ale o zdánlivost) |
| 2026-08-21 | Zavedena `czechLegalFacts` jako jediný zdroj pravdy | Opraveny tři zastaralé hodnoty najednou |
| 2026-01-01 | Minimální mzda 22 400 Kč (indexace) | `MINIMUM_MONTHLY_WAGE_CZK` |
| 2025-06-01 | Flexinovela ZP (zák. č. 120/2025 Sb.): zkušební doba 4/8 měsíců, výpovědní doba běží od doručení | `PROBATION_MAX_MONTHS`, texty ke zkušební a výpovědní době |

---

## 7. Co tento systém nezajišťuje

Je to **kontrola konzistence, ne právní garance**. Hlídá, že se čísla nerozejdou a že
se pravidelně ověřují. Neřekne, že výklad ustanovení je správný, ani nepokryje
judikaturu.

Právní správnost obsahu musí potvrdit advokát — viz `docs/LEGAL_REVIEW_CHECKLIST.md`.
