# Právo365 — interní právní checklist (k ověření s advokátem)

> Účel: interní seznam otevřených právních otázek. **Není určeno k publikaci.**
> Veřejné stránky obsahují pouze opatrné, pravdivé formulace bez konkrétních
> nepotvrzených právních závěrů; otevřené body jsou shromážděny zde.
> Poslední aktualizace: 21. srpna 2026.
>
> Dokument má dvě části: **A) smluvní právo** (obsah, který aplikace produkuje)
> a **B) GDPR a provoz**.

---

# ČÁST A — Smluvní právo

## Jak z toho udělat levnou kontrolu

Advokát nemusí číst kód. Veškerý právní obsah je ve **dvou souborech a pěti
profilech**, dohromady zhruba dvacet stran čitelného textu:

| Soubor | Co obsahuje | Rozsah |
|---|---|---|
| `lib/legal/czechLegalFacts.ts` | všechna zákonná čísla s citací a datem účinnosti | 1 strana |
| `lib/legal/knowledge/common.ts` | pravidla platná pro každou smlouvu | 3 strany |
| `lib/legal/knowledge/profiles/*.ts` | pět smluvních typů | 3 strany každý |

**Nejlevnější první krok:** nechat ověřit `czechLegalFacts.ts`. Je to jedna
strana čísel a chyba v ní se propíše do každé vygenerované smlouvy.

## Co je citace a co je úsudek

Toto je pro kontrolu podstatné. Pravidla nejsou stejně jistá:

- **Doslovné znění zákona** — jistota nejvýše trojnásobek (§ 2254), zkušební doba
  4/8 měsíců (§ 35), výpovědní doba běží od doručení (§ 51). Tady stačí ověřit,
  že jsme opsali správně.
- **Zatřídění následku** — kam patří které porušení. Rozlišujeme neplatnost,
  zdánlivost („nepřihlíží se") a porušení smlouvy. U řady pravidel je to zjevné,
  u některých jde o výklad. Ty jsou níže vypsané zvlášť.

## Otevřené otázky — smluvní právo

| ID | Oblast | Otázka pro advokáta | Kde se projeví | Priorita |
|----|--------|---------------------|----------------|----------|
| C-01 | Zákonné hodnoty | Ověřit všech sedm hodnot v `czechLegalFacts.ts` proti aktuálnímu znění. | Každá vygenerovaná smlouva | **P0** |
| C-02 | § 2239 a úrok z prodlení | Vztahuje se zákaz smluvní pokuty vůči nájemci i na **smluvní** úrok z prodlení? Novější judikatura tomu nasvědčuje. Dnes to nehlídáme — hlídáme jen pokutu. | `profiles/tenancy.ts`, hlídač v `integrityValidator` | **P0** |
| C-03 | Zákaz chovu zvířat | Naše pravidlo říká, že k paušálnímu zákazu se nepřihlíží (§ 2258 ve spojení s § 2235 odst. 2). Je toto zatřídění správné, nebo jde spíš o neplatnost? | `profiles/tenancy.ts` | P1 |
| C-04 | Vstup pronajímatele | Totéž u ujednání o vstupu do bytu bez souhlasu nájemce. | `profiles/tenancy.ts` | P1 |
| C-05 | NDA na dobu neurčitou | Je časově neomezená mlčenlivost u běžných obchodních informací v rozporu s dobrými mravy, nebo jen nevymahatelná v části? Dnes ji označujeme za riziko, ne za neplatnost. | `profiles/nda.ts` | P1 |
| C-06 | NDA vs. konkurenční doložka | Kde přesně leží hranice, za kterou se mlčenlivost zaměstnance posuzuje podle § 310 ZP? Naše formulace je „fakticky brání práci v oboru". | `profiles/nda.ts`, `profiles/employment.ts` | P1 |
| C-07 | Rozsah upozornění | Je disclaimer u kontroly i generování dostatečný vůči zák. č. 85/1996 Sb., o advokacii? Formulace je v `reviewPromptBuilder.ts`. | Výstup kontroly i generování | **P0** |
| C-08 | Navrhovaná znění | Kontrola uživateli navrhuje konkrétní znění klauzulí. Je to ještě informace, nebo už právní služba? Případně jak formulaci upravit. | Výstup kontroly | **P0** |
| C-09 | Vozidlo — přepis | Ověřit lhůtu a rozdělení povinností při zápisu změny vlastníka (zák. č. 56/2001 Sb.). | `profiles/sale.ts` | P2 |
| C-10 | Úschova kupní ceny | Doporučujeme advokátní/notářskou úschovu u nemovitostí. Ověřit, že formulace nezakládá dojem, že ji zajišťujeme my. | `profiles/sale.ts` | P2 |

## Co tento systém nezajišťuje

Je to **kontrola konzistence, ne právní garance**. Hlídá, že se čísla nerozejdou,
že se pravidelně ověřují a že se do výstupu nedostane překonaná úprava.
Neřekne, že výklad ustanovení je správný, a nepokrývá judikaturu.

---

# ČÁST B — GDPR a provoz

Otevřené otázky k dokumentům Ochrana osobních údajů a GDPR.

## Jak používat

Každou položku má potvrdit advokát, případně provozovatel (u provozních lhůt).
Po potvrzení se odpovídající veřejný text upraví na konkrétní znění. Do té doby
veřejné stránky drží obecnou, opatrnou formulaci.

## Otevřené otázky

| ID | Oblast | Otázka pro advokáta/provozovatele | Kde se projeví | Priorita |
|----|--------|-----------------------------------|----------------|----------|
| L-01 | Identita správce | Doplnit identifikační údaje provozovatele (IČO, sídlo) a sjednotit je napříč dokumenty. | Privacy §1 | P1 |
| L-02 | Správce vs. zpracovatel | Potvrdit roli (správce / zpracovatel / hybrid) u obsahu vložených a generovaných smluv; od toho se odvíjí potřeba DPA pro B2B uživatele. | Privacy §1, GDPR §7 | P0 |
| L-03 | Právní základ | Potvrdit konkrétní právní základ (čl. 6 GDPR) pro jednotlivé účely zpracování (provoz účtu, generování, kontrola, historie, export, platby, rate limiting, diagnostika, zpětná vazba, účetnictví). | Privacy §3, §8 | P0 |
| L-04 | DPA evidence | Ověřit u každého poskytovatele (Supabase, OpenAI, Stripe, Vercel, Upstash, Sentry, Resend, Google) uzavření zpracovatelské smlouvy (DPA) a její evidenci. | Privacy §4 | P1 |
| L-05 | OpenAI API | Ověřit finální formulaci k OpenAI API: retence vstupů/výstupů, smluvní režim (DPA / zero-data-retention) a případné přenosy mimo EHP dle aktuální dokumentace poskytovatele. | Privacy §5 | P0 |
| L-06 | Přenosy mimo EHP | Ověřit konkrétní předávací mechanismy (SCC nebo jiný platný mechanismus) pro OpenAI, Stripe, Vercel, Supabase, Sentry, Resend a Upstash. | Privacy §7 | P1 |
| L-07 | Retenční lhůty | Doplnit přesné retenční doby pro: historii návrhů/kontrol, billing metadata, audit/rate-limit logy, zpětnou vazbu, Sentry logy a soft-deleted data (do trvalého výmazu). | Privacy §6 | P1 |
| L-08 | Výmaz | Ověřit rozsah a lhůty údajů ponechaných po výmazu účtu z titulu zákonných povinností, účetnictví, bezpečnosti a obrany právních nároků. | GDPR §3 | P1 |
| L-09 | Údaje třetích osob | Potvrdit povinnosti a doporučení k údajům třetích osob a zvláštním kategoriím podle GDPR ve vložených smluvních textech (anonymizace, právní titul uživatele). | GDPR §7, Privacy §6 | P0 |

## Poznámka k veřejným textům

Veřejné stránky používají tyto opatrné formulace (potvrzené jako pravdivé vůči kódu):
- Právní základ: „liší se podle konkrétního účelu …" (bez vynuceného článku GDPR).
- Retence: „pouze po dobu nezbytnou pro daný účel …" (bez napevno uvedených čísel).
- Přenosy mimo EHP: „založeno na odpovídajících zárukách podle GDPR …".
- OpenAI: „AI jako technický nástroj … výstup může obsahovat nepřesnosti a vyžaduje lidskou kontrolu".
