# Kde co najdu — mapa projektu

> Orientační mapa. Odpovídá na otázku „chci změnit X, kam mám sáhnout".
> Není to dokumentace kódu — ta je v komentářích u jednotlivých souborů.

---

## Nejdřív: dokumenty, které si mám přečíst

Všechny jsou ve složce `docs/`.

| Soubor | K čemu je | Kdy do něj sáhnout |
|---|---|---|
| **`CO_UDELAT_JA.md`** | Návod na věci, které se nedají udělat v kódu — Search Console, PageSpeed, právník, odkazy | Teď |
| **`PRAVNI_REVIZE_PODKLAD.md`** | Podklad pro právníka. **Generuje se z kódu** | Posílám právníkovi |
| `ROADMAP_TYPY_SMLUV.md` | Které typy dokumentů jsou hotové a co zbývá | Když plánujeme další práci |
| `PRAVNI_ZDROJE.md` | Odkud pochází právní obsah a jak často se má ověřovat | Při revizi práva |
| `DEPLOY_PRAVO365.md` | Nasazení, doména, environment proměnné | Při nasazování |
| `STRIPE_SETUP.md` | Platby | Když se řeší předplatné |
| `LEGAL_REVIEW_CHECKLIST.md` | Starší ruční checklist. **Je zastaralý** — nahradil ho `PRAVNI_REVIZE_PODKLAD.md` | Nesahat |

---

## Kde je právní obsah

Tohle je jádro produktu. Když se změní zákon, mění se tady.

```
lib/legal/
  czechLegalFacts.ts        ← 12 zákonných čísel (mzda, lhůty, pokuty)
  staleLawGuard.ts          ← 10 tvrzení „tohle už neplatí"
  reviewPacket.ts           ← generátor podkladu pro právníka
  knowledge/
    common.ts               ← pravidla platná pro každou smlouvu
    types.ts                ← tvar pravidla (co je essential, mandatory…)
    index.ts                ← registr profilů + rozpoznávání typu z textu
    profiles/               ← 22 souborů, jeden na typ dokumentu
```

### Chci opravit zákonné číslo

`lib/legal/czechLegalFacts.ts`. Jedna strana. U každé hodnoty je paragraf,
datum účinnosti a datum, kdy jsme to naposledy ověřovali. Změňte hodnotu
a `lastVerified` — testy hlídají, že se nikde neopisuje ručně.

### Chci opravit pravidlo u konkrétního typu

`lib/legal/knowledge/profiles/<typ>.ts`. Například:

- reklamace → `complaint.ts`
- výpověď z pracovního poměru → `employmentNotice.ts`
- licenční smlouva → `licence.ts`
- nájem provozovny → `businessPremisesLease.ts`

Každý soubor začíná komentářem, který vysvětluje, **proč je ten typ zrádný**.
Stojí za přečtení dřív než za změnu.

### Chci přidat nový typ dokumentu

Čtyři místa, v tomhle pořadí:

1. `lib/legal/knowledge/profiles/<novy>.ts` — právní pravidla
2. `lib/contracts/types.ts` — přidat do seznamu `ContractFamily`
3. `lib/legal/knowledge/index.ts` — zaregistrovat profil a rozpoznávání
4. `lib/contracts/schemas/cz/<novy>.ts` — formulář
5. `lib/contracts/contractSchemas.ts` — zaregistrovat schéma
6. `lib/seo/guides/<novy>.ts` — landing page (jinak testy spadnou)

Testy vás povedou — když něco vynecháte, řeknou co.

---

## Kde jsou formuláře a generování

```
lib/contracts/
  schemas/cz/               ← 23 formulářů, jeden na typ
  contractSchemas.ts        ← registr všech schémat
  promptBuilder.ts          ← skládá zadání pro AI
  systemPrompt.ts           ← systémové pokyny
  validators.ts             ← kontrola vyplněných polí
  integrityValidator.ts     ← kontrola vygenerovaného textu
  qualityGate.ts            ← poslední brána před vydáním dokumentu
  conditionals.ts           ← podmíněná pole (jedno místo pro všechny)
  types.ts                  ← typy pro celý modul
```

### Chci změnit, na co se formulář ptá

`lib/contracts/schemas/cz/<typ>.ts`, sekce `sections`.

### Chci změnit, co se říká AI

Tentýž soubor, `metadata.aiInstructions`. Pozor: **právní požadavky tam
nepatří** — ty se berou z profilu automaticky. Do `aiInstructions` jdou jen
pokyny „takhle to napiš, tohle nikdy nepiš".

---

## Kde je kontrola cizích smluv

```
lib/review/
  structuralAudit.ts        ← deterministická kontrola „je to tam?"
  citationGuard.ts          ← zahazuje nálezy o nepoužitelných paragrafech
  findingTriage.ts          ← přesouvá „je v souladu" pryč od rizik
  suggestionGuard.ts        ← brání doporučením, která uškodí
  reviewPromptBuilder.ts    ← skládá zadání pro kontrolu
```

---

## Kde jsou stránky pro vyhledávače

```
lib/seo/
  site.ts                   ← adresa webu, název, klíčová slova
  faq.ts                    ← časté otázky na domovské stránce
  guides/                   ← 24 příruček („co má obsahovat…")
  comparisons/              ← 5 porovnání („DPP nebo DPČ?")
app/
  sitemap.ts                ← sitemap.xml
  robots.ts                 ← robots.txt
  [locale]/vzory/           ← rozcestník + jednotlivé příručky
  [locale]/porovnani/       ← porovnávací stránky
```

### Chci upravit text příručky

`lib/seo/guides/<typ>.ts`. Struktura je vždycky stejná: co má dokument
obsahovat, časté chyby, časté otázky. Testy hlídají délku meta popisů,
citace u úskalí i to, že tam není slovenština.

### Chci přidat porovnání

`lib/seo/comparisons/<nove>.ts` + zaregistrovat v `index.ts` tamtéž.
Musí odkazovat na dvě **existující** příručky — test to ověří.

---

## Kde jsou veřejné stránky

| Adresa | Soubor |
|---|---|
| `/cs` | `app/[locale]/page.tsx` |
| `/cs/vzory` | `app/[locale]/vzory/page.tsx` |
| `/cs/vzory/<slug>` | `app/[locale]/vzory/[slug]/page.tsx` |
| `/cs/porovnani/<slug>` | `app/[locale]/porovnani/[slug]/page.tsx` |
| `/cs/generator` | `app/[locale]/generator/page.tsx` |
| `/cs/review` | `app/[locale]/review/page.tsx` |
| `/cs/dashboard` | `app/[locale]/dashboard/page.tsx` |

Společný obal všech stránek je `app/layout.tsx`. **Do něj nepatří čtení
cookies ani hlaviček** — odstavilo by to statické generování celého webu.
Hlídá to test.

---

## Příkazy, které budu potřebovat

```bash
npm test
```
Všechny testy. 1671 testů v 54 souborech, běží asi minutu.

```bash
npm run type-check
```
Kontrola typů bez sestavení.

```bash
npm run build
```
Produkční sestavení. V jeho výpisu se dá poznat, které stránky jsou
předgenerované (`●`) a které se renderují na vyžádání (`ƒ`).

```bash
npm run dev
```
Vývojový server na `localhost:3000`.

```bash
UPDATE_DOCS=1 npx vitest run lib/legal/__tests__/reviewPacket
```
**Pregeneruje podklad pro právníka** po změně právního obsahu. Bez tohohle
test spadne s hláškou, že je podklad zastaralý — to je záměr.

---

## Když něco spadne

| Hláška | Co to znamená |
|---|---|
| `docs/PRAVNI_REVIZE_PODKLAD.md is stale` | Změnili jste právní obsah, pregenerujte podklad (viz výše) |
| `leaked a rule id` | Pravidlo nemá `label` a uživateli by se ukázalo interní id |
| `pattern never matches its own sample` | `detect` vzor nesedí na `detectSample` — pravidlo by nikdy nic nenašlo |
| `contract types with no landing page` | Nový typ nemá příručku v `lib/seo/guides/` |
| `AuthProvider in the root layout` | Někdo vrátil auth do `app/layout.tsx`, což zabije statické generování |
| `useAuth was called outside an AuthProvider` | Komponenta s přihlášením je na stránce, která provider nemá |

---

## Jedna věc, kterou je dobré vědět

Právní obsah je **na jednom místě** a všechno ostatní z něj čte:

```
profil (lib/legal/knowledge/profiles/*.ts)
   ├── zadání pro generování dokumentu
   ├── zadání pro kontrolu cizí smlouvy
   ├── deterministická kontrola úplnosti
   └── podklad pro právníka
```

Když právník opraví jedno pravidlo v profilu, propíše se to **do všech čtyř**
najednou. Proto se nikde nic neopisuje ručně — a proto testy tak úporně
hlídají, aby to tak zůstalo.
