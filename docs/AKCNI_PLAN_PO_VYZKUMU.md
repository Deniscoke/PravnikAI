# Právo365 — finální akční plán po hloubkovém výzkumu

> Vstup: hloubkový výzkum (`zprava-hluboky-vyzkum.md`) + reálný stav kódu po fázích 1–3D + Beta 1A.
> Klíčová poznámka: **výzkum crawloval starší/cachovaný stav webu.** Mnoho jeho P0
> „červených vlajek" jsme už opravili (fáze 1–3). Tento dokument odděluje
> **✅ HOTOVO** od **❌ OTEVŘENÉ** podle skutečného kódu.
> Markery: „k ověření s českým advokátem", „k otestování v betě".

---

## 0. Cross-reference výzkumu proti reálnému kódu (číst první!)

Výzkum označil 6 právních červených vlajek. Stav podle skutečného repozitáře:

| Červená vlajka z výzkumu | Reálný stav v kódu |
|---|---|
| DE/UK jurisdikce na homepage, hreflang, SEO | ✅ **HOTOVO** (fáze 1–2): routing /de,/en → /cs, hreflang jen cs, cs.ts CZ-only |
| „legal certainty", „complete legal document", „AI assistant for lawyers" | ⚠️ **ČÁSTEČNĚ**: cs.ts opravené ✅, ale **stále živé v `app/layout.tsx` root metadata** a v `lib/i18n/messages/en.ts` (dead code) ❌ |
| „unlimited" / „neomezené" pricing | ⚠️ **ČÁSTEČNĚ**: Team tier opraven ✅, ale **Pro tier `plans.ts` má pořád „Neomezené generování/kontroly/exporty"** ❌ |
| Neúplná Privacy/GDPR/Terms transparentnost | ✅ **HOTOVO** (fáze 3B): hashovaná IP, OpenAI data flow, retence, soft delete — ale chybí AI Notice + procesní detaily ❌ |
| Team tarif na veřejném pricingu | ✅ **HOTOVO** (dříve): `TEAM_CHECKOUT_ENABLED=false`, badge „Již brzy" |
| Hranice „sepisování listin" (zákon o advokacii) | ❌ **OTEVŘENÉ** — k ověření s advokátem (čistě právní, ne kód) |

**Pět skutečně otevřených, snadno opravitelných položek (našel je výzkum správně):**
1. `app/layout.tsx` root metadata: `"AI legal contract drafting (CZ · DE · UK)"` (řádky 15, 24, 29) — anglicky + DE/UK + rizikový claim. **Toto vidí crawler/Google jako `<title>` fallback.**
2. `lib/billing/plans.ts:82` — Pro `description: 'Pro advokáty a právníky'` → konflikt s SMB-first positioningem.
3. `lib/billing/plans.ts:84–86` — Pro features: „Neomezené generování/kontroly/exporty" → konflikt s férovým denním limitem (ve fázi 3C jsme opravili jen Team, ne Pro).
4. `components/billing/PricingSection.tsx:491` — telefon `+421 728 523 267` (slovenská předvolba!) vs. `+420` jinde → nekonzistence u právního produktu.
5. `lib/i18n/messages/en.ts` — „AI assistant for lawyers", „built by lawyers, for lawyers", „Legal certainty", „complete legal document", „Three jurisdictions" — dead code (neservíruje se, locale je cs), ale v repu a riziko při cachovaném /en/.

---

## 1. Executive summary

1. Produkt je technicky CZ-only a copy v `cs.ts` je už vyčištěná — výzkum reaguje na cachovaný stav; reálný rozsah zbývající práce je menší, než report tvrdí.
2. Tři největší zjištění: (a) hlavní právní riziko není disclaimer, ale hranice „sepisování listin" dle zákona o advokacii — řeší se positioningem a flow, ne větou „není poradenství" (k ověření s advokátem); (b) EU AI Act čl. 50 od 2. 8. 2026 vyžaduje označení AI-generovaného textu i v exportech; (c) pět konkrétních copy/pricing nekonzistencí stále žije v `layout.tsx`, `plans.ts`, `PricingSection.tsx`.
3. Tři nejrychlejší výhry: opravit root `layout.tsx` metadata na CZ-only bez rizikového claimu; vyhodit „Neomezené" z Pro tieru a „Pro advokáty a právníky" z Pro popisu; sjednotit telefon na +420.
4. Tři věci, které se nesmí pokazit před veřejnou betou: (a) žádný rizikový claim („legal certainty / hotová smlouva / unlimited") na živé stránce; (b) viditelný + strojově čitelný AI label v exportu (AI Act); (c) GDPR upload warning před vložením cizího textu do kontroly smluv.

---

## 2. Největší právní a compliance rizika

### P0 — blocker před veřejnou betou

**P0-A | Root metadata „AI legal contract drafting (CZ · DE · UK)"** (`app/layout.tsx`)
- Proč riziko: anglický + multi-jurisdikční + „legal … drafting" claim je v `<title>`/OG fallbacku pro všechny ne-`[locale]` routy; vidí to vyhledávače.
- Co změnit: na `Právo365 — návrhy smluv podle českého práva` (a OG/twitter stejně).
- Kde: root metadata (`app/layout.tsx`).
- Advokát: ne (jen copy).

**P0-B | Pro tier „Neomezené" + „Pro advokáty a právníky"** (`lib/billing/plans.ts`)
- Proč riziko: „neomezené" je v rozporu s férovým denním AI capem (skrytá podmínka → toxické u právního SW); „pro advokáty a právníky" je v rozporu s SMB-first.
- Co změnit: features → „Vysoký měsíční objem v rámci férového denního limitu", „Bez pevných měsíčních kvót (ochrana proti zneužití)"; description → „Pro OSVČ a malé firmy, které smlouvy řeší pravidelně".
- Kde: pricing.
- Advokát: ne.

**P0-C | AI Notice + výstupní label** (nová stránka + UI)
- Proč riziko: AI Act čl. 50 odst. 1 (info o interakci s AI) + odst. 2 (označení syntetického textu).
- Co změnit: stránka `/cs/ai` („Jak AI v Právo365 funguje, co umí a neumí"); v každém výstupu label „Tento návrh vytvořila umělá inteligence — pracovní verze".
- Kde: nová stránka, generátor, kontrola.
- Advokát: ano — formulace intended purpose (k ověření).

**P0-D | Telefon +421 → +420** (`PricingSection.tsx:491`)
- Proč riziko: slovenská předvolba na českém právním produktu = ztráta důvěry, nekonzistence.
- Co změnit: `+420 728 523 267` (sjednotit s footerem/GDPR).
- Advokát: ne.

### P1 — důležité před širší propagací

**P1-A | Export AI labeling (strojově čitelné)** — DOCX/PDF metadata + viditelná patička „Vygenerováno AI – pracovní návrh". (AI Act čl. 50 odst. 2.) Advokát: technicko-právní, formulaci ověřit.

**P1-B | GDPR upload warning v kontrole smluv** — před vložením textu: „Nevkládejte zvláštní kategorie osobních údajů ani údaje bez právního titulu; je-li to možné, anonymizujte." (GDPR čl. 5, 9.) Advokát: doporučeno.

**P1-C | Rozšířit Privacy/GDPR o procesní detail** — retenční matice, OpenAI retence/DPA režim, role správce/zpracovatel u obsahu dokumentů, přenosy mimo EU. Advokát: **ano** (role-model je právní rozhodnutí).

**P1-D | en.ts dead strings** — odstranit rizikové anglické texty z `messages/en.ts` (nebo celé en.ts/de.ts při budoucím type-narrowingu). Advokát: ne.

### P2 — pozdější

Zero-data-retention rollout u OpenAI, pseudonymizační/redaction helper, procesorské rozhraní pro Team/firmy, release gate s AI/GDPR checklistem.

---

## 3. Bezpečné positioning a messaging

- **One-liner:** „Český AI nástroj pro rychlou přípravu pracovního návrhu smlouvy a orientační kontrolu textu podle českého práva. Nenahrazuje advokáta."
- **Hero headline:** „Pracovní návrh smlouvy podle českého práva — během pár minut."
- **Hero subheadline:** „Vyplníte formulář, Právo365 připraví strukturovaný návrh s odkazy na relevantní české předpisy. Pracovní verze pro vás i vašeho advokáta — ne hotová smlouva k podpisu."
- **5 bezpečných claimů:** „pracovní návrh podle českého práva"; „orientační AI kontrola textu"; „nezačínáte od prázdné šablony"; „vhodné ke kontrole advokátem"; „výstup může obsahovat nepřesnosti a vyžaduje lidskou revizi".
- **5 zakázaných/rizikových claimů:** „právní jistota"; „hotová smlouva k podpisu"; „AI právník / náhrada advokáta"; „garantovaná platnost"; „neomezeně".
- **Disclaimer homepage:** „Právo365 je AI nástroj pro přípravu návrhů smluv podle českého práva. Neposkytuje právní poradenství ani nenahrazuje advokáta. Výstup je pracovní verze, kterou doporučujeme před podpisem nechat zkontrolovat advokátem."
- **Disclaimer generátor:** „Tento výstup je pracovní návrh vytvořený AI podle českého práva. Může obsahovat nepřesnosti nebo chybějící údaje. Před právním jednáním jej nechte zkontrolovat advokátem." (Aktuální `jurisdictionNotice` je už blízko — stačí doplnit „může obsahovat nepřesnosti".)
- **Disclaimer kontrola smluv:** „Jde o orientační AI kontrolu podle českého práva, ne o závazný právní posudek. Výsledek nenahrazuje konzultaci s advokátem." (Aktuální `reviewPage.notice` je už v souladu.)
- **Disclaimer DOCX/PDF export:** stávající text v `lib/export/strings.ts` je vyhovující; doplnit jen „Vygenerováno umělou inteligencí" do viditelné patičky + metadata.

---

## 4. Prioritizovaný backlog

| ID | Oblast | Doporučení | Proč | Konkrétní úkol | Úsilí | Riziko | Priorita | Měřitelný výsledek |
|---|---|---|---|---|---|---|---|---|
| B-01 | Copy/SEO | Root metadata CZ-only bez rizikového claimu | Title/OG fallback vidí Google; „legal drafting (CZ·DE·UK)" je rozpor | Upravit `app/layout.tsx` metadata default/OG/twitter | S | S | **P0** | 0 anglických/DE-UK řetězců v `<title>`/OG na produkci |
| B-02 | Pricing | Vyhodit „Neomezené" z Pro + změnit Pro description | Konflikt s férovým capem + SMB-first | Upravit `lib/billing/plans.ts` PLAN_INFO.pro | S | S | **P0** | Pricing bez slova „neomezené"; description cílí na OSVČ/SMB |
| B-03 | Trust | Sjednotit telefon na +420 | Slovenská předvolba sráží důvěru | Opravit `PricingSection.tsx:491` | S | S | **P0** | Jednotný kontakt napříč webem |
| B-04 | Compliance | AI Notice stránka `/cs/ai` + výstupní label | AI Act čl. 50; transparentnost | Nová route + label v generátoru/kontrole | M | S | **P0** | Stránka live + label v každém výstupu |
| B-05 | Compliance | Export AI label (viditelný + metadata) | AI Act čl. 50 odst. 2 | Doplnit do `export-docx`/`export-pdf` route patičku + DOCX `subject`/PDF metadata „AI-generated draft" | M | S | P1 | Export obsahuje viditelný i strojový label; test v CI |
| B-06 | GDPR | Upload warning v kontrole smluv | Cizí osobní údaje v textu | Text + checkbox/nota nad textarea v `/cs/review` | S | S | P1 | Warning viditelný před vložením; prokliky logované |
| B-07 | Compliance | Rozšířit Privacy/GDPR (retence, OpenAI DPA, role) | GDPR čl. 13/28/32/44 | Doplnit sekce + placeholdery k doplnění advokátem | M | M | P1 | Publikované doplněné dokumenty + interní data-map |
| B-08 | UX | Re-edit historie (form_data_snapshot je v DB) | Největší hodnota pro opakované použití + důvod na Pro | Načíst snapshot z historie do generátoru | M | M | P1 | +15 % druhé použití do 14 dní (k otestování v betě) |
| B-09 | UX/Trust | Pre-export gate: badge + unresolved `[DOPLNIT]` | Méně chybných exportů, vyšší důvěra | Souhrn před exportem v `ContractResult` | M | S | P1 | -20 % exportů s nevyplněnými poli (k otestování) |
| B-10 | UX | Risk explanations po klauzulích v kontrole | Z „AI kecá" → „AI pomáhá pochopit" | Rozšířit `ReviewResult` o „proč / kdy / co doplnit" | M | M | P1 | +10 % completion review flow (k otestování) |
| B-11 | Trust | Trust Center `/cs/duvera` | Trust je u legal AI součást UX | Nová stránka: data, kontroly, co umí/neumí | S | S | P1 | Vyšší signup→first-action; méně support dotazů |
| B-12 | GTM | Feedback loop tagovaný podle typu/failure | Nejrychlejší beta learnings | (Beta 1A hotovo) + kategorie do e-mailu | S | S | P1 | 30+ kvalitních feedbacků/měsíc |
| B-13 | Pricing | CZK display na frontendu + credit pack test | ČR mimo eurozónu; občasní uživatelé | Marketingová cena v CZK; jednorázový balík | M | M | P1 | +10–20 % checkout initiation (k otestování) |
| B-14 | Quality | Eval set 20–30 scénářů/typ + rubric audit | Měření kvality bez velkého týmu | Statický eval dataset + měsíční audit 10–15 výstupů | M | S | P1 | Regresní skóre v release; trend nahoru |
| B-15 | Cleanup | Odstranit rizikové en.ts dead strings | Dead code s rizikovými claimy | Smazat/přepsat `messages/en.ts` rizikové texty | S | S | P2 | Grep „lawyers/legal certainty" = 0 |
| B-16 | Product | Licenční smlouva + rámcová smlouva o službách | Nejlepší poměr SMB poptávka/riziko | 2 nová CZ schémata | M | M | P2 | 2 typy s completion ≥ top-5 |
| B-17 | Quality | RAG nad ověřenými českými právními texty | Méně halucinací, auditovatelnost | Retrieval po malých úryvcích | L | M | P2 | Lepší accuracy v eval setu |
| B-18 | Compliance | Structured Outputs (JSON schema) pro review + quality gate | Stabilnější výstupy, méně parse chyb | Strict JSON schema u podporovaných modelů | M | M | P2 | Méně parse errorů; stabilní pole |

---

## 5. Copy úpravy webu

> Pozn.: cs.ts hero/features/steps jsou už CZ-only (fáze 1–3). Níže jen co zbývá nebo zostřit.

- **Homepage hero:** viz sekce 3 (headline/subheadline). Důvod: odstraní poslední rizikové fallbacky a zostří „pracovní návrh".
- **„Jak to funguje":** stávající 3 kroky OK; do kroku 3 přidat „před podpisem necháte zkontrolovat advokátem" (už je). Bezpečnější + nastavuje očekávání.
- **Nová sekce „Co Právo365 umí / neumí":** Umí: připravit strukturovaný návrh, orientačně zkontrolovat text, exportovat DOCX/PDF. Neumí: poskytnout právní poradenství, zaručit platnost, nahradit advokáta. Důvod: explicitní hranice = nižší právní i konverzní riziko.
- **Pricing Free:** „3 návrhy smluv, 3 kontroly, 5 exportů měsíčně. Pro vyzkoušení." (OK, jen „generování smluv" → „návrhy smluv".)
- **Pricing Pro:** „Pro OSVČ a malé firmy, které smlouvy řeší pravidelně. Vysoký měsíční objem v rámci férového denního limitu." Důvod: pravdivý slib > „unlimited".
- **Team waitlist:** „Týmové funkce (sdílená knihovna, role, audit) připravujeme. Přidejte se na waitlist." (Badge „Již brzy" už je.)
- **CTA tlačítka:** „Vytvořit návrh smlouvy" / „Zkontrolovat text" (už je).
- **Beta banner:** „Právo365 je v beta verzi. Pomáhá připravit pracovní návrh smlouvy podle českého práva. Budeme rádi za zpětnou vazbu." (Beta 1A.)
- **Feedback tlačítko:** „Zpětná vazba" (Beta 1A).
- **Trust/security sekce:** „Server-side zpracování, GDPR, technické cookies, hashovaná IP. Text smluv posíláme do OpenAI API jen pro vygenerování/kontrolu — dle pravidel API se nepoužívá k trénování modelů." Důvod: konkrétní > „GDPR-aware".

---

## 6. UX a produktové změny (podle dopadu)

**1) Re-edit historie (B-08)** — Problém: smlouvy se mění (cena, datum, strany), uživatel musí vyplňovat znovu. Řešení: tlačítko „Upravit a vygenerovat znovu" načte `form_data_snapshot` z `contract_generations_history` do formuláře. Mini-spec: detail historie → načíst snapshot → předvyplnit `DynamicContractForm`. Akceptace: z historie lze otevřít a re-generovat beze ztráty dat. Metrika: druhé použití do 14 dní. (k otestování v betě)

**2) Pre-export gate (B-09)** — Problém: export i s nevyplněnými `[DOPLNIT]`. Řešení: před exportem souhrn (chybějící údaje, badge stavu, počet `[DOPLNIT]`). Mini-spec: spočítat nevyřešené markery v `ContractResult`, zobrazit varování + potvrzení. Akceptace: u návrhu s `[DOPLNIT]` se zobrazí upozornění před stažením. Metrika: podíl exportů s nevyplněnými poli.

**3) Risk explanations v kontrole (B-10)** — Problém: holý seznam rizik. Řešení: u každého rizika „proč na tom záleží / kdy je běžné / co doplnění řeší". Mini-spec: rozšířit `ReviewResult` o vysvětlující pole z odpovědi (zůstat orientační, ne individualizované). Akceptace: každé riziko má vysvětlení. Metrika: completion review flow, CSAT.

**4) Trust Center (B-11)**, **5) Onboarding zostření** (3 otázky: co dostanu / co ne / kdy advokát), **6) Feedback loop** (Beta 1A), **7) Dashboard** (označit záznamy jako „návrh"), **8) Pricing flow** (CZK display). Detaily v backlogu.

---

## 7. AI kvalita a technické guardraily

> Inkrementálně, žádný velký refaktor. Pipeline draft → quality gate → integrity check zůstává.

- **Snížení halucinací:** nejdřív určit typ/režim dokumentu, až pak přiřazovat citace § (ne citovat předčasně). Proč: falešná přesnost. Jak: pořadí kroků v promptu už máme; doplnit pravidlo „necituj §, dokud není jasný typ". Nedělat: velký RAG hned.
- **Lepší validace:** rozšířit deterministický `integrityValidator` o kontrolu kolizí (datum konce > začátku, cena > 0, chybějící rozhodné právo). Jak: přidat pravidla do stávajícího validátoru. Nedělat: LLM na to, co zvládne deterministika.
- **Structured Outputs / JSON schema (B-18, P2):** u review a quality gate přejít z `json_object` na strict `json_schema`. Proč: méně parse chyb, povinná pole. Jak: jen u modelů, co to umí, s fallbackem. Nedělat: měnit celý pipeline najednou.
- **RAG (B-17, P2):** retrieval po malých úryvcích z ověřených českých textů. Proč: auditovatelnost. Jak: později, samostatná fáze. Nedělat: long-context dump.
- **Eval set (B-14, P1):** 20–30 scénářů/typ, rubric scoring (úplnost, soulad s typem, klíčové klauzule, konzistence, přesnost citací, nebezpečné formulace). Jak: statická data + skript. Nedělat: drahé „LLM-as-judge" bez rubriky.
- **Lidský audit:** měsíčně 10–15 výstupů, jednoduchá tabulka. **Kontrola citací:** u review vracet spíš „oblast práva" než agresivní §, je-li model nejistý. **Fallback režimy:** quality gate selže → použít draft + downgrade na „pracovní návrh" (už máme). **Bezpečnostní statusy:** „kompletní návrh / pracovní návrh / vyžaduje kontrolu" (už máme) — zviditelnit je silněji.

---

## 8. GDPR / Privacy / AI Act checklist

| Bod | Status | Kdo | Výstup |
|---|---|---|---|
| Viditelný „interakce s AI" indikátor | must-have | vývoj/copy | label v UI výstupu |
| Strojově čitelné označení AI textu v exportu | must-have | vývoj | DOCX/PDF metadata + patička |
| AI Notice stránka (intended purpose, co umí/neumí) | must-have | copy + právník | `/cs/ai` |
| Upload warning (cizí osobní údaje) v kontrole | must-have | vývoj/copy | nota nad textarea |
| Identifikace správce + účely + právní základy | must-have | právník | Privacy text |
| Procesoři (OpenAI, Supabase, Stripe, Vercel, Resend, Upstash, Sentry) + DPA | should-have | právník/founder | seznam + interní DPA evidence |
| Retenční matice (co/jak dlouho) | should-have | právník/vývoj | tabulka v Privacy |
| Přenosy mimo EU (OpenAI US) + mechanismus | should-have | právník | Privacy sekce |
| Role správce vs. zpracovatel u obsahu dokumentů | must-have | **právník** | rozhodnutí → Terms/Privacy |
| OpenAI retence 30 dní / ZDR režim | should-have | vývoj/founder | interní dokument |
| AI literacy mini-program pro tým | should-have | founder | 1 stránka pravidel |
| Release gate s AI/GDPR checklistem | should-have | vývoj | PR template |
| Zero-data-retention rollout | later | vývoj | konfigurace API |

---

## 9. Beta launch plán na 90 dní

**Dny 1–14 — „nesmí být rozpor".** Cíl: web a výstupy bez rizikových claimů + beta feedback běží. Kroky: B-01..B-04 (P0), Beta 1A feedback, beta banner. Kanály: zatím zavřený okruh 5–10 lidí z okolí. Metriky: 0 rizikových claimů, funkční feedback. Rozhodnutí: pustit dál jen když P0 hotové. Nespouštět: placené kampaně.

**Dny 15–30 — „prvních 30–50 testerů".** Cíl: aktivace + kvalitativní feedback. Kroky: B-05, B-06, B-09. Kanály: osobní outreach na účetní a malé poradenské kanceláře, LinkedIn na freelancery (marketing/dev/design/řemesla). Scénář pro testera: „vygeneruj 1 smlouvu, zkontroluj 1 vlastní, napiš 3 věty". Metriky: registration→first-action 40–55 % (target, **k ověření**). Nespouštět: Team tarif.

**Dny 31–60 — „retence + partnerství".** Cíl: druhé použití, první konverze. Kroky: B-08 (re-edit), B-10, B-11, B-13. Kanály: účetní, coworking/startup komunity, koncipientské skupiny. Metriky: 14denní návratovost 20–30 %, free→paid 2–5 % (target). Rozhodnutí: pricing experiment dle dat.

**Dny 61–90 — „SEO + škálování učení".** Cíl: organická akvizice. Kroky: obsah bottom-of-funnel („kupní smlouva vzor", „co musí obsahovat…") se 2 CTA; B-14 eval set; B-16 zvážit. Kanály: SEO/obsah. Metriky: completion-to-export 30–45 %, 30+ feedbacků/měsíc. Nespouštět: velkou expanzi typů smluv, dokud nejsou top-5 vyladěné.

---

## 10. Pricing a monetizace

- **Měna:** ČR mimo eurozónu (k 6/2026) → **doporučuji CZK na frontendu** (marketingová cena), billing může zůstat EUR. Důvod: snížit „zahraniční" dojem. (k otestování)
- **Pro 19 €:** hladina není fatální; doporučený **CZK ekvivalent ~ 449–499 Kč/měs** (k ověření kurzem + ochotou platit, **k otestování v betě**).
- **Férový denní limit:** nikdy „neomezeně"; komunikovat „vysoký měsíční objem v rámci férového denního limitu proti zneužití".
- **Jednorázové balíčky:** ano, testovat „balík exportů" / „balík generování" pro občasné uživatele (nekanibalizuje předplatné). Nevyžaduje velký přepis.
- **Team:** nespouštět jako placený tarif — **waitlist** s konkrétním promise (sdílená knihovna, role, audit, DPA-ready).
- **Free vs Pro:** přesunout placenou hodnotu z „počtu promptů" do „pracovní kontinuity" — re-edit historie, uložené drafty, plně editovatelný export → Pro.
- **Doporučené názvy/limity:** Zdarma (3/3/5), Pro (vysoký objem + re-edit + plný export), Tým (waitlist).
- **Pricing claim:** „Začněte zdarma. Pro pravidelnou práci přejděte na Pro — vyšší limity v rámci férového denního limitu."

---

## 11. „Červené vlajky" (tvrdě, před širší propagací)

1. **Root metadata „AI legal contract drafting (CZ · DE · UK)".** Problém: rizikový + DE/UK claim ve `<title>`/OG. Co hrozí: SEO/PR ukazuje produkt jako mezinárodního „AI legal" hráče = právní i message rozpor. Minimální oprava: B-01 (1 soubor).
2. **Pro tier „Neomezené".** Problém: skrytá podmínka (denní cap). Co hrozí: ztráta důvěry, stížnost, vrácení peněz. Minimální oprava: B-02.
3. **Telefon +421.** Problém: slovenská předvolba. Co hrozí: působí nedůvěryhodně/nedbale. Minimální oprava: B-03 (1 řádek).
4. **Chybí AI label v exportu.** Problém: AI Act čl. 50 odst. 2 od 8/2026. Co hrozí: nesoulad. Minimální oprava: B-05.
5. **Chybí upload warning u kontroly smluv.** Problém: cizí osobní/citlivé údaje do OpenAI. Co hrozí: GDPR. Minimální oprava: B-06.
6. **Hranice „sepisování listin".** Problém: zákon o advokacii. Co hrozí: regulatorní riziko. Minimální oprava: stanovisko advokáta + vymezení intended purpose (sekce 12). **k ověření.**
7. **en.ts dead rizikové claimy.** Problém: „legal certainty / for lawyers" v repu. Co hrozí: únik při cachovaném /en/. Minimální oprava: B-15.

---

## 12. Otevřené otázky pro českého advokáta

1. **Hranice zákona o advokacii:** Je samoobslužná AI příprava „pracovního návrhu smlouvy" za předplatné v riziku jako „sepisování listin / poskytování právních služeb"? Jak vymezit intended purpose v Terms a UI, aby to nebylo individualizované poskytování právní služby? (zák. 85/1996 Sb. — k ověření)
2. **GDPR role:** Jsme u obsahu vložených/generovaných smluv **správce, zpracovatel, nebo hybrid** podle typu zákazníka? Potřebujeme DPA pro B2B uživatele?
3. **AI Act čl. 50:** Jak konkrétně implementovat označení AI-generovaného textu v exportech, aby bylo nejen viditelné, ale technicky obhajitelné?
4. **Rizikové typy smluv:** Vyžadují DPP/DPČ, spotřebitelské VOP nebo pracovněprávní dodatky silnější warningy či oddělený režim?
5. **Affiliate/partnerství s advokáty:** Vytvoří nabídka navazující „advokátní kontroly" přes partnera regulatorní povinnosti (zprostředkování právních služeb)?
6. **Disclaimery:** Jsou stávající disclaimery (homepage, generátor, kontrola, export) dostatečné, nebo je potřeba upravit formulace?
7. **Terms — omezení odpovědnosti:** Je formulace „uživatel používá výstupy na vlastní odpovědnost" v ČR vymahatelná v tomto kontextu?

---

## 13. Implementační prompty pro coding agenta (Cursor / Claude Code)

> Každý prompt drží stávající pravidla projektu: Next.js 16 App Router, TS strict, Supabase RLS,
> auth přes `getUser()`, billing přes `assertBillingAccess()`, žádné secrets v klientu, minimální diff,
> žádné rozbití Stripe/testů, žádné nové skipped testy.

### A) Homepage / root metadata copy
Cíl: odstranit rizikové a DE/UK claimy z `<title>`/OG. Kontext: produkt je CZ-only.
Najdi: `app/layout.tsx` (metadata default/openGraph/twitter), `lib/seo/site.ts`.
Pravidla: žádné „legal certainty/drafting/lawyers/CZ·DE·UK"; CZ pozicování „návrhy smluv podle českého práva".
Akceptace: title/OG = `Právo365 — návrhy smluv podle českého práva`. Testy: grep „AI legal contract drafting" = 0. Nerozbít: build, ostatní metadata.

### B) Pricing copy
Cíl: odstranit „Neomezené" z Pro a „Pro advokáty a právníky". Kontext: férový denní cap, SMB-first.
Najdi: `lib/billing/plans.ts` (PLAN_INFO.pro), `components/billing/PricingSection.tsx` (telefon +421).
Pravidla: neměnit limity/Stripe/ceny, jen texty; telefon → +420.
Akceptace: Pro bez „neomezené", description SMB; jednotný +420. Testy: grep „neomezené"/„+421" = 0. Nerozbít: billing logiku, testy.

### C) AI Notice stránka
Cíl: nová `/cs/ai` stránka (intended purpose, co umí/neumí, AI label). Kontext: AI Act čl. 50.
Najdi: vzor podle `app/[locale]/gdpr/page.tsx`; přidat odkaz do footeru (`HomePage.tsx`).
Pravidla: bezpečné claimy; bez „náhrada advokáta". Akceptace: stránka renderuje, odkaz ve footeru. Testy: route 200. Nerozbít: layout.

### D) Export disclaimer + AI metadata
Cíl: viditelný + strojový AI label v DOCX/PDF. Kontext: AI Act čl. 50 odst. 2.
Najdi: `app/api/export-docx/route.ts`, `app/api/export-pdf/route.ts`, `lib/export/strings.ts`.
Pravidla: čeština; DOCX `subject` a PDF metadata = „AI-generated working draft (CZ)"; patička „Vygenerováno umělou inteligencí — pracovní návrh". Akceptace: export obsahuje obojí. Testy: assert na metadata/patičku. Nerozbít: formátování.

### E) Re-edit historie
Cíl: načíst `form_data_snapshot` z historie do generátoru. Kontext: opakované použití.
Najdi: `app/[locale]/generator/[id]/page.tsx`, `components/contract/DynamicContractForm.tsx`, `lib/supabase/actions.ts`.
Pravidla: RLS (jen vlastní záznamy), `getSchemaOrNull` fallback pro legacy. Akceptace: z detailu lze předvyplnit formulář a re-generovat. Testy: render + předvyplnění. Nerozbít: existující detail.

### F) Pre-export unresolved-issues gate
Cíl: před exportem souhrn chybějících údajů + badge. Kontext: méně chybných exportů.
Najdi: `components/contract/ContractResult.tsx`, `lib/contracts/integrityValidator.ts`.
Pravidla: jen UI vrstva, žádná změna pipeline. Akceptace: u návrhu s `[DOPLNIT]` se zobrazí varování před stažením. Testy: komponenta. Nerozbít: export flow.

### G) Feedback ukládání do DB (Beta 1B)
Cíl: tabulka `feedback_reports` + zápis v `/api/feedback`. Kontext: navazuje na Beta 1A (e-mail).
Najdi: `supabase/migrations/` (nová 005), `app/api/feedback/route.ts`.
Pravidla: RLS (insert auth user, select jen service role), service role jen server-side, žádné secrets v klientu. Akceptace: feedback se uloží i odešle e-mailem. Testy: route insert + RLS. Nerozbít: existující e-mail flow.

### H) Trust Center stránka
Cíl: `/cs/duvera` (data, kontroly, co umí/neumí). Kontext: trust = UX u legal AI.
Najdi: vzor `gdpr/page.tsx`, footer v `HomePage.tsx`.
Pravidla: bezpečné claimy. Akceptace: stránka + odkaz. Testy: route 200.

### I) GDPR/Privacy placeholdery pro právníka
Cíl: doplnit do Privacy/GDPR sekce s placeholdery `[K DOPLNĚNÍ ADVOKÁTEM: …]` (retence, role správce/zpracovatel, přenosy, DPA). Kontext: P1-C.
Najdi: `app/[locale]/privacy/page.tsx`, `app/[locale]/gdpr/page.tsx`.
Pravidla: nehalucinovat právní závěry; jen označená místa k doplnění. Akceptace: placeholdery viditelné, jasně označené. Testy: route 200.

---

## 14. Finální doporučené pořadí práce (14 dní)

**Den 1–2:** B-01 (root metadata), B-02 (Pro pricing), B-03 (telefon +420). Tři nejrychlejší, nulové riziko, smažou nejviditelnější rozpory.
**Den 3–5:** B-04 (AI Notice + výstupní label), B-06 (upload warning v kontrole). Compliance must-have před betou.
**Den 6–10:** B-05 (export AI label), B-09 (pre-export gate), B-12 (feedback kategorie). Důvěra + AI Act + beta learnings.
**Den 11–14:** B-07/B-15 (Privacy doplnění + en.ts cleanup), B-11 (Trust Center). Dokončit compliance balík + trust.

**Co spustit hned:** B-01, B-02, B-03 (dnes, malý diff).
**Co odložit:** B-13 (CZK pricing — vyžaduje rozhodnutí), B-16/B-17/B-18 (P2, po betě).
**Co ověřit právně:** sekce 12 (hranice advokacie, GDPR role, AI Act labeling) — poslat advokátovi paralelně.
**Jak poznáme, že beta je připravená:** (1) 0 rizikových claimů na produkci (grep + manuální QA); (2) AI label viditelný i v exportu; (3) upload warning u kontroly; (4) feedback flow funkční; (5) Privacy/Terms bez „k doplnění" P0 míst nebo s jasnými placeholdery.

---

## Zdroje (z výzkumu, zachováno)

- Zákon č. 85/1996 Sb., o advokacii: https://www.zakonyprolidi.cz/cs/1996-85
- EU AI Act (EUR-Lex): https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
- Evropská komise, AI Act framework/timeline: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- GDPR (EUR-Lex): https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- OpenAI Enterprise privacy: https://openai.com/enterprise-privacy/
- LegalBench-RAG: https://arxiv.org/abs/2408.10343
- KRAG Framework: https://arxiv.org/abs/2410.07551
- ContractEval: https://arxiv.org/abs/2508.03080
- Reuters (AI hallucinations v právu): https://www.reuters.com/legal/litigation/sullivan-cromwell-law-firm-apologizes-ai-hallucinations-court-filing-2026-04-21/
- Reuters (ČR mimo eurozónu k 6/2026): https://www.reuters.com/business/eu-countries-outside-euro-not-yet-ready-adopt-it-commission-says-2026-06-24/

> Pozn.: paragrafy a právní závěry pocházejí z dodaného výzkumu; před právním jednáním ověřit s českým advokátem. Nehalucinoval jsem nové zákony ani judikaturu.
