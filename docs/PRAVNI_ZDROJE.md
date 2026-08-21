# Právní zdroje a údržba právních hodnot

Tento dokument popisuje, odkud Právo365 bere právní hodnoty, jak se udržují aktuální
a co dělat, když se změní zákon.

**Proč vznikl:** aplikace dlouho pracovala s minimální mzdou z roku 2024 a se zkušební
dobou podle úpravy před flexinovelou. Obojí prošlo validací jako správné. Chyba nebyla
v modelu ani v promptu — nikdo se prostě neptal, jestli ta čísla ještě platí.

---

## 1. Kde hodnoty žijí

Všechny zákonné hodnoty jsou na jediném místě:

```
lib/legal/czechLegalFacts.ts
```

Každá nese ustanovení, datum účinnosti, zdroj a **datum posledního ověření člověkem**.
Validátory, schémata i prompty z ní jen čtou — nikde jinde se číslo nepíše natvrdo.

Test `lib/legal/__tests__/czechLegalFacts.test.ts` upozorní, jakmile je některá hodnota
neověřená déle než **rok**. Ten test má selhat — je to připomínka, ne chyba.

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
2. Uprav `value` a `effectiveFrom` v `lib/legal/czechLegalFacts.ts`.
3. Nastav `lastVerified` na dnešní datum.
4. Spusť `npm test` — část testů na hodnotách schválně trvá, takže uvidíš, co se rozjelo.
5. Projdi texty, které hodnotu **popisují slovy** (SEO stránky `lib/seo/contractGuides.ts`,
   instrukce pro AI v `lib/contracts/schemas/`) — ty se z konstanty negenerují vždy.
6. Nasaď a zaznamenej změnu do commit message i sem, pokud šlo o věcnou novelu.

---

## 6. Historie věcných změn

| Datum | Změna | Dopad |
|---|---|---|
| 2026-08-21 | Zavedena `czechLegalFacts` jako jediný zdroj pravdy | Opraveny tři zastaralé hodnoty najednou |
| 2026-01-01 | Minimální mzda 22 400 Kč (indexace) | `MINIMUM_MONTHLY_WAGE_CZK` |
| 2025-06-01 | Flexinovela ZP (zák. č. 120/2025 Sb.): zkušební doba 4/8 měsíců, výpovědní doba běží od doručení | `PROBATION_MAX_MONTHS`, texty ke zkušební a výpovědní době |

---

## 7. Co tento systém nezajišťuje

Je to **kontrola konzistence, ne právní garance**. Hlídá, že se čísla nerozejdou a že
se pravidelně ověřují. Neřekne, že výklad ustanovení je správný, ani nepokryje
judikaturu.

Právní správnost obsahu musí potvrdit advokát — viz `docs/LEGAL_REVIEW_CHECKLIST.md`.
