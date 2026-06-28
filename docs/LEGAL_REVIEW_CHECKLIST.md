# Právo365 — interní právní checklist (k ověření s advokátem)

> Účel: interní seznam otevřených právních otázek k dokumentům Ochrana osobních
> údajů a GDPR. **Není určeno k publikaci.** Veřejné stránky (`/cs/privacy`,
> `/cs/gdpr`) obsahují pouze opatrné, pravdivé formulace bez konkrétních
> nepotvrzených právních závěrů; otevřené body jsou shromážděny zde.
> Poslední aktualizace: 31. května 2026.

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
