# PrávnikAI — Súhrn projektu pre externý review

> Tento dokument popisuje stav projektu ku dňu **21. marca 2026**.
> Určený na konzultáciu a odporúčania (napr. cez ChatGPT).

---

## 1. Čo je PrávnikAI

**PrávnikAI** je webová aplikácia pre slovenských a českých právnikov a podnikateľov.
Hlavná funkcia: **AI generátor právnych zmlúv** — používateľ vyplní formulár a systém vygeneruje hotový právny dokument podľa českého práva.

- **Cieľový trh:** Česká republika (české právo — NOZ, ZP, ZOK)
- **Cieľová skupina:** Právnici, advokáti, podnikatelia
- **Jazyk UI:** Čeština (v generátore), slovenčina (v landing page)
- **Monetizácia:** Zatiaľ nedefinovaná (SaaS model v pláne)

---

## 2. Technologický stack

| Vrstva | Technológia | Dôvod výberu |
|--------|-------------|--------------|
| Frontend framework | **Next.js 14** (App Router) | SSR, TypeScript, file-based routing |
| Jazyk | **TypeScript** | Type safety pre schémy a API |
| Štýlovanie | **CSS custom properties** + glassmorphism UI kit | Prémiový vizuál bez závislosti na CSS frameworku |
| AI provider | **OpenAI GPT-4o** | Najlepšia kvalita pre dlhý štruktúrovaný výstup |
| Runtime | **Node.js** (dev server na porte 3456) | — |
| Deployment | Zatiaľ nenasadené | Plán: Vercel alebo Netlify |

---

## 3. Architektúra systému

### 3.1 Filozofia: Schema-Driven Design

`ContractSchema` je **jediný zdroj pravdy** pre celý systém:

```
ContractSchema
     │
     ├── DynamicContractForm   (schema → vyrenderovaný formulár)
     ├── validators             (schema → 3-vrstvová validácia)
     ├── promptBuilder          (schema + dáta → LLM prompt)
     └── /api/generate-contract (Next.js App Router POST endpoint)
```

Výhoda: pridanie nového typu zmluvy = vytvorenie jedného súboru schémy + registrácia. Nulové zmeny vo formulári, validátore ani API route.

### 3.2 Dátový model — kľúčové typy

```typescript
// Každá zmluva má schému s metadátami, stranami a sekciami
interface ContractSchema {
  metadata: SchemaMetadata    // ID, verzia, jurisdikcia, právny základ
  parties: ContractParty[]   // škálovateľné (2-stranové, 3-stranové zmluvy)
  sections: ContractSection[] // dynamické sekcie s conditional rendering
}

// GDPR-aware citlivosť každého poľa
type FieldSensitivity = 'public' | 'personal' | 'regulated' | 'sensitive'

// Výsledok generovania — nie surový text, ale štruktúrovaný objekt
interface GenerateContractResponse {
  schemaId: string
  mode: GenerationMode          // 'complete' | 'draft' | 'review-needed'
  contractText: string
  warnings: ContractWarning[]
  missingFields: string[]
  legalBasis: string[]          // citácie zákonných ustanovení
  generatedAt: string           // ISO 8601
}
```

### 3.3 Trojvrstvová validácia

```
Vrstva 1 — UI validácia      Real-time, per-field. Povinné polia, regex, typy.
Vrstva 2 — Biznis/právna     Cross-field. Česká právna obmedzenia (napr. dátum prevodu musí byť pred dátumom zmluvy podľa § 2090 NOZ)
Vrstva 3 — Pripravenosť      Pred API volaním. Určuje generation mode:
                              complete / draft / review-needed
```

### 3.4 Generation modes

| Mode | Trigger | Správanie |
|------|---------|-----------|
| `complete` | Všetky povinné + kľúčové voliteľné polia vyplnené | Kompletná zmluva bez medzier |
| `draft` | Povinné polia OK, voliteľné chýbajú | Zmluva s `[DOPLNIT]` placeholdermi |
| `review-needed` | Povinné polia chýbajú / konflikt | Kostra zmluvy s `⚠️ ZKONTROLOVAT` markermi |

---

## 4. Súborová štruktúra

```
právnikAI/
│
├── index.html                          ← Pôvodná landing page (HTML/CSS, glassmorphism)
├── styles.css                          ← Custom CSS override layer
├── server.js                           ← Jednoduchý dev server (port 3456)
│
├── app/                                ← Next.js App Router
│   ├── layout.tsx                      ← Root layout (fonty, globálny CSS)
│   ├── page.tsx                        ← Root redirect → /generator
│   ├── globals.css                     ← Globálne štýly + CSS custom properties
│   └── generator/
│       └── page.tsx                    ← Hlavná stránka generátora (state machine: selecting → filling → result)
│
├── components/
│   └── contract/
│       ├── DynamicContractForm.tsx     ← (v pláne) Schema → renderovaný formulár
│       └── ContractResult.tsx          ← Zobrazenie výsledku + copy, warnings, legal basis chips
│
├── lib/
│   ├── contracts/
│   │   ├── types.ts                    ← Všetky TypeScript interfacy (single source)
│   │   ├── contractSchemas.ts          ← Registry schemaId → ContractSchema
│   │   ├── systemPrompt.ts             ← Systémový prompt (české právo only)
│   │   ├── promptBuilder.ts            ← (v pláne) Data + schema → LLM user prompt
│   │   ├── validators.ts               ← (v pláne) 3-vrstvová validácia
│   │   └── schemas/
│   │       ├── kupniSmlouva.ts         ← Kúpna zmluva (§ 2079–2183 NOZ) ✅
│   │       ├── ndaSmlouva.ts           ← NDA / Zmluva o mlčanlivosti (§ 504 NOZ) ✅
│   │       ├── pracovniSmlouva.ts      ← Pracovná zmluva (§ 33 ZP) ✅
│   │       ├── najemniSmlouva.ts       ← Nájomná zmluva (§ 2235 NOZ) ✅
│   │       └── smlouvaODilo.ts         ← Zmluva o dielo (§ 2586 NOZ) ✅
│   └── llm/
│       └── openaiClient.ts             ← OpenAI wrapper (provider-agnostic interface)
│
├── docs/
│   └── plans/
│       └── 2026-03-18-contract-generator-design.md  ← Architektonický design doc
│
└── pure-css-glassmorphism-liquid-glass-ui-kit/      ← CSS UI kit (externý, glassmorphism)
```

---

## 5. Dizajn systém

| Prvok | Hodnota |
|-------|---------|
| Štýl | Glassmorphism / Liquid Glass (backdrop-filter blur) |
| Témy | Dark mode (default) + Light mode (toggle) |
| Display font | `Italiana` (serif) — elegantný, právnický |
| UI font | `DM Sans` (sans-serif) — čitateľný, moderný |
| Primárna akcentná farba | `#5ee7df` (aqua) |
| Sekundárna farba | `#b490f5` (violet) |
| Pozadie | `#0b0e1a` (tmavé) |
| Spacing base | 4px (scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96) |

**Glassmorphism komponenty z UI kitu:**
- `.glass-card` — karta s hover parallax efektom
- `.glass-btn` / `--primary` / `--ghost` — varianty tlačidiel
- `.glass-input` / `.glass-input-wrap` — formulárové polia
- `.glass-accordion` — FAQ sekcia
- `GlassToast.show(type, title, desc)` — notifikácie

---

## 6. LLM integrácia

### System prompt (systemPrompt.ts)
- Asistent je nastavený **výhradne na české právo** (NOZ, ZP, ZOK)
- Explicitný zákaz slovenského práva a slovenských vzorov
- Vyžaduje citácie zákonných ustanovení v texte
- Temperature `0.1` — právny text musí byť deterministický, nie kreatívny
- Model: `gpt-4o`, max tokens: `4096`

### LLM provider wrapper (openaiClient.ts)
- Zvyšok kódu je **provider-agnostic** — volá len `generateText()`
- Prepnutie na iný provider (Claude, Gemini) = zmena jedného súboru

---

## 7. UI/UX flow (Generator page)

Stránka je implementovaná ako **stavový stroj** so 4 stavmi:

```
selecting → filling → result
                ↓
             error
```

- **selecting:** Grid kariet s typmi zmlúv (kúpna zmluva, NDA — aktívne; ďalšie v pláne)
- **filling:** DynamicContractForm pre zvolený typ
- **result:** ContractResult — text zmluvy + varovania + copy + legal basis chips
- **error:** Chybová správa + možnosť retry / zmeny typu

Breadcrumb navigácia umožňuje vrátiť sa na predchádzajúci krok.

---

## 8. Bezpečnosť a GDPR

- Polia sú označené `sensitivity` tagom: `public | personal | regulated | sensitive`
- Regulované polia (rodné číslo, bankový účet) sa **nikdy nelog**ujú
- API kľúč nikdy nedosiahne prehliadač (server-side only)
- Generovaný dokument je **pracovný návrh** — disclaimer pri každom výsledku

---

## 9. Čo je hotové (✅) vs. čo ešte treba (🔲)

### Hotové
- ✅ Kompletný TypeScript type systém (`types.ts`) — všetky interfacy
- ✅ 5 contract schém: kupniSmlouva, ndaSmlouva, pracovniSmlouva, najemniSmlouva, smlouvaODilo
- ✅ Czech-law system prompt (`systemPrompt.ts`)
- ✅ OpenAI provider wrapper (`openaiClient.ts`)
- ✅ Generator page — stavový stroj (selecting → filling → result/error)
- ✅ ContractResult komponent — zobrazenie výsledku, varovaní, copy-to-clipboard
- ✅ Breadcrumb navigácia
- ✅ Landing page s kompletným UI (hero, features, FAQ, generátor formulár)
- ✅ Dark/Light mode toggle s localStorage
- ✅ Design doc (`docs/plans/2026-03-18-contract-generator-design.md`)

### V pláne / nedokončené
- 🔲 `DynamicContractForm.tsx` — schema-driven formulár (kľúčová komponenta)
- 🔲 `validators.ts` — 3-vrstvová validácia
- 🔲 `promptBuilder.ts` — zostavenie LLM promptu z dát a schémy
- 🔲 `/api/generate-contract` — Next.js API route (POST endpoint)
- 🔲 Export do PDF a DOCX
- 🔲 Loading stav / skeleton počas generovania
- 🔲 Prihlasovanie a dashboard pre uložené zmluvy
- 🔲 SEO, sitemap, meta tagy
- 🔲 Pricing sekcia
- 🔲 Deployment (Vercel / Netlify)
- 🔲 GDPR cookie consent banner
- 🔲 Analytics

---

## 10. Otvorené otázky pre review

1. **Schema-driven vs. template-based:** Je schema-driven prístup (TypeScript interfacy) správna voľba pre 20+ typov zmlúv, alebo by bol jednoduchší prístup cez Handlebars/Mustache šablóny?

2. **LLM provider:** GPT-4o vs. Claude Opus 4 pre právne texty — ktorý má lepší výkon pre štruktúrovaný dlhý výstup v češtine?

3. **Validácia na strane LLM:** Má zmysel žiadať LLM, aby vrátil validačné poznámky ako súčasť odpovede (structured output / JSON mode), alebo je lepšie to riešiť len na serverovej strane?

4. **Ukladanie zmlúv:** Aký databázový model je vhodný pre historické verzie zmlúv (event sourcing vs. jednoduché CRUD)?

5. **Právna zodpovednosť:** Ako najlepšie formulovať disclaimer, aby bolo jasné, že ide o pracovný návrh a nie právne poradenstvo (slovenský/český zákon o advokácii)?

6. **Multi-jurisdikčnosť:** Má zmysel v budúcnosti rozšíriť na slovenské právo (SK), alebo zostať špecialistom na CZ?

---

*Generované: 2026-03-21 | Projekt: PrávnikAI | Verzia: 0.1-alpha*
