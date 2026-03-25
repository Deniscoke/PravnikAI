# PrávníkAI — Projektový kontext (source of truth)

> Jediný autoritativní dokument o stavu projektu.
> **Poslední aktualizace:** 2026-03-25
> **Provozovatel:** IndiWeb · info.indiweb@gmail.com · 728 523 267

---

## 1. Co je PrávníkAI

**PrávníkAI** je full-stack webová aplikace pro české právníky a advokáty. Hlavní funkce:

1. **Generátor smluv** — právník vyplní dynamický formulář, AI vygeneruje kompletní smlouvu s citacemi zákonů přes 3-stage pipeline (draft → quality gate → integrity check)
2. **AI kontrola smluv** — vložte existující smlouvu, AI identifikuje rizika, chybějící ustanovení a celkové rizikové hodnocení (low/medium/high)
3. **DOCX export** — profesionální export s záhlavím, zápatím, stránkováním a disclaimery
4. **Historie** — všechny vygenerované smlouvy a kontroly uloženy v Supabase, přístupné na dashboardu

**Jurisdikce:** Výhradně české právo (NOZ, ZP, ZOK)
**Jazyk UI:** Čeština

---

## 2. Architektura

| Vrstva | Technologie | Stav |
|--------|------------|------|
| Framework | Next.js 15 App Router | Aktivní |
| Frontend | React 18 + TypeScript 5.5 | Aktivní |
| Autentizace | Supabase SSR (`@supabase/ssr`) | Aktivní |
| Databáze | Supabase PostgreSQL (RLS, 3 migrace) | Aktivní |
| LLM | OpenAI API (`openai` v4.67) — `gpt-5.4` / `gpt-5.4-pro` | Aktivní |
| Billing | Stripe (`stripe` v20.4) — checkout, portal, webhook | Aktivní |
| Export | `docx` v9.6 (server-side DOCX) | Aktivní |
| Rate limiting | In-memory sliding window (`lib/rateLimit.ts`) | Aktivní |
| Testy | Vitest 4.1 + React Testing Library | Aktivní |

**Dev server:** `npm run dev` → `localhost:3000`

---

## 3. Struktura souborů

```
právnikAI/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← Root layout (AuthProvider, theme, fonts)
│   ├── page.tsx                      ← Homepage / landing page
│   ├── globals.css                   ← Globální styly (glassmorphism)
│   ├── generator/
│   │   ├── page.tsx                  ← Dynamický formulář + výsledek
│   │   ├── [id]/page.tsx             ← Detail vygenerované smlouvy z historie
│   │   └── __tests__/
│   ├── review/
│   │   ├── page.tsx                  ← AI kontrola smluv
│   │   ├── [id]/page.tsx             ← Detail kontroly z historie
│   │   └── __tests__/
│   ├── dashboard/
│   │   └── page.tsx                  ← Dashboard (onboarding gate + historie)
│   ├── onboarding/
│   │   ├── page.tsx                  ← Onboarding stránka (nutné pro prvního přihlášení)
│   │   ├── OnboardingForm.tsx        ← Formulář onboardingu (souhlas s podmínkami)
│   │   └── __tests__/
│   ├── login/
│   │   └── page.tsx                  ← Přihlášení (Google OAuth)
│   ├── auth/
│   │   ├── callback/route.ts         ← Supabase OAuth callback
│   │   └── __tests__/
│   ├── terms/page.tsx                ← Obchodní podmínky
│   ├── privacy/page.tsx              ← Ochrana osobních údajů
│   ├── gdpr/page.tsx                 ← GDPR informace
│   ├── error.tsx                     ← Chybová stránka (App Router)
│   ├── global-error.tsx              ← Globální chybová stránka
│   └── api/
│       ├── generate-contract/
│       │   ├── route.ts              ← POST — generování smlouvy (3-stage pipeline)
│       │   └── __tests__/
│       ├── review-contract/
│       │   ├── route.ts              ← POST — AI kontrola smlouvy
│       │   └── __tests__/
│       ├── export-docx/
│       │   └── route.ts              ← POST — DOCX export
│       ├── account/
│       │   └── route.ts              ← GET (profil) + DELETE (⚠️ stub 501)
│       └── billing/
│           ├── checkout/route.ts     ← POST — Stripe Checkout
│           ├── portal/route.ts       ← POST — Stripe Portal
│           └── webhook/route.ts      ← POST — Stripe webhook handler
│
├── components/
│   ├── ThemeToggle.tsx               ← Dark/light toggle (localStorage persist)
│   ├── CookieConsent.tsx             ← Cookie consent banner (GDPR)
│   ├── auth/
│   │   ├── AuthProvider.tsx          ← React Context pro session
│   │   └── UserMenu.tsx              ← Login/logout + Google OAuth
│   ├── billing/
│   │   └── PricingSection.tsx        ← Pricing tabulka (Free/Pro/Tým)
│   ├── contract/
│   │   ├── DynamicContractForm.tsx   ← Schema-driven formulář
│   │   └── ContractResult.tsx        ← Výsledek generování + warnings
│   ├── dashboard/
│   │   ├── HistoryList.tsx           ← Seznam vygenerovaných smluv + kontrol
│   │   └── OnboardingView.tsx        ← Onboarding flow na dashboardu
│   └── review/
│       └── ReviewResult.tsx          ← Výsledek AI kontroly
│
├── lib/
│   ├── contracts/
│   │   ├── types.ts                  ← Kompletní typový systém (single import)
│   │   ├── contractSchemas.ts        ← SCHEMA_REGISTRY (5 schémat) + legacy slug resolver
│   │   ├── systemPrompt.ts           ← CZECH_LAW_SYSTEM_PROMPT + SELF_CHECK_SYSTEM_PROMPT
│   │   ├── promptBuilder.ts          ← 7-sekční prompt builder (A–G), buildPrompt()
│   │   ├── validators.ts             ← Třívrstvá validace, runFullValidation()
│   │   ├── qualityGate.ts            ← Stage 2: strukturovaný JSON verdict (pass/warn/block)
│   │   ├── integrityValidator.ts     ← Stage 3b: deterministické kontroly bez LLM
│   │   ├── schemas/
│   │   │   ├── kupniSmlouva.ts       ← § 2079–2183 NOZ
│   │   │   ├── pracovniSmlouva.ts    ← § 33–73 ZP
│   │   │   ├── najemniSmlouva.ts     ← Nájemní smlouva na byt
│   │   │   ├── smlouvaODilo.ts       ← Smlouva o dílo
│   │   │   └── ndaSmlouva.ts         ← NDA (§ 504 + § 1746 NOZ)
│   │   └── __tests__/
│   ├── billing/
│   │   ├── guard.ts                  ← assertBillingAccess() — blokuje neauth + over-limit
│   │   ├── helpers.ts                ← Billing utilities
│   │   ├── plans.ts                  ← TIER_LIMITS, PLAN_INFO, Stripe price mapping
│   │   └── stripe.ts                 ← Stripe client instance
│   ├── llm/
│   │   ├── openaiClient.ts           ← generateText() — gpt-5.4 / gpt-5.4-pro wrapper
│   │   └── __tests__/
│   ├── review/
│   │   ├── reviewPromptBuilder.ts    ← Prompt pro AI kontrolu smluv
│   │   └── types.ts                  ← ReviewContractRequest / ReviewContractResponse
│   ├── rateLimit.ts                  ← In-memory sliding window (10 req/60s per IP)
│   └── supabase/
│       ├── actions.ts                ← saveGenerationToHistory(), saveReviewToHistory()
│       ├── browser.ts                ← Supabase client (browser)
│       ├── server.ts                 ← Supabase client (server + service role)
│       ├── types.ts                  ← DB types (ručně, sync s migrací)
│       └── __tests__/
│
├── supabase/
│   └── migrations/
│       ├── 001_accounts_history.sql  ← Profiles, history, preferences, audit
│       ├── 002_billing.sql           ← Subscriptions, stripe_customer_id
│       └── 003_export_log.sql        ← Export counter pro billing
│
├── middleware.ts                      ← Auth guard (Edge Runtime) — chráněné routy
├── next.config.js
├── tsconfig.json                      ← Strict mode, @/* alias
├── vitest.config.ts
├── package.json
├── .env.local.example                 ← Template pro env vars
│
├── docs/
│   └── plans/
│       └── 2026-03-18-contract-generator-design.md  ← Detailní architektura
│
│  ──── LEGACY (kandidáti na archivaci) ────────────────
├── index.html                         ← ⛔ Starý SK landing page
├── index-cz.html                      ← ⛔ Starý CZ landing page
├── server.js                          ← ⛔ Starý statický HTTP server
├── styles.css                         ← ⛔ Starý CSS (nahrazen globals.css)
└── pure-css-glassmorphism-liquid-glass-ui-kit/  ← ⛔ Starý UI kit
```

---

## 4. API Routes

### POST `/api/generate-contract`

3-stage generovací pipeline:

```
0a. Rate limit (10 req/60s per IP)
0b. Billing guard (assertBillingAccess) — blokuje neauth + over-limit + onboarding
1.  Parse & validate body
2.  Resolve schemaId (legacy slug mapping)
3.  Třívrstvá validace → GenerationMode
4.  buildPrompt() — 7 sekcí A–G (včetně DraftingPosture pokud je)
5.  Stage 1: gpt-5.4, temp=0.1, max_tokens=16384, reasoning=high
6.  Stage 2: Quality gate — gpt-5.4, jsonMode, structured JSON verdict
7.  Stage 3 (optional, premium=true): gpt-5.4-pro final polish
7b. Integrity check — deterministické kontroly (placeholders, keywords, signature)
8.  Build warnings (validace + quality gate + integrity)
9.  Sestavit response
10. saveGenerationToHistory() — fire-and-forget Supabase
```

**Request:**
```typescript
{
  schemaId: string,
  formData: NormalizedFormData,
  premium?: boolean,            // Stage 3 polish (gpt-5.4-pro)
  posture?: DraftingPosture     // Optional: zastoupená strana, risk, B2B/B2C...
}
```

**Response (200):**
```typescript
{
  schemaId: string,
  mode: 'complete' | 'draft' | 'review-needed',
  contractText: string,
  warnings: ContractWarning[],  // z validace + quality gate + integrity
  missingFields: string[],      // composite IDs (sectionId.fieldId)
  legalBasis: string[],
  generatedAt: string           // ISO 8601
}
```

**Errors:** `400` (validation) · `401` (neauth) · `403` (onboarding) · `404` (schema) · `402` (billing) · `422` (příliš chyb) · `429` (rate limit) · `502` (LLM)

---

### POST `/api/review-contract`

AI kontrola existující smlouvy (1 LLM call, jsonMode).

**Request:** `{ contractText: string (50–100 000 znaků), contractTypeHint?: string }`

**Response:** `ReviewContractResponse` — `overallRisk` (low/medium/high), `summary`, `riskyClauses[]`, `missingClauses[]`, `negotiationFlags[]`, `lawyerReviewRequired`, `detectedContractType`, `legalBasis[]`

**Limits:** max 100 000 znaků vstupního textu

---

### POST `/api/export-docx`

Export smlouvy do DOCX. Loguje do `export_log` pro billing.
Vrací `.docx` binary (Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).

---

### POST `/api/billing/checkout`
Vytvoří Stripe Checkout session. Lazy-creates Stripe Customer.

### POST `/api/billing/portal`
Redirect na Stripe Customer Portal (správa předplatného).

### POST `/api/billing/webhook`
Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.updated`.

### GET `/api/account`
Vrací profil + preference přihlášeného uživatele.

### DELETE `/api/account`
⚠️ **STUB** — vrací 501. GDPR smazání účtu dosud neimplementováno.

### GET `/auth/callback`
Supabase OAuth callback (Google sign-in) → redirect na `/dashboard` nebo `/onboarding`.

---

## 5. Generovací pipeline — klíčové detaily

### DraftingPosture (volitelný)

Řídí clauseovou strategii a slovesný postoj bez porušení bezpečnostních pravidel:

```typescript
interface DraftingPosture {
  draftingSide?: string           // ID strany (z party.id) jejíž zájmy chránit
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive'
  negotiationPosture?: 'client-protective' | 'neutral' | 'compromise'
  transactionContext?: 'B2B' | 'consumer' | 'employment' | 'other'
  mustIncludeClauses?: string[]
  mustAvoidClauses?: string[]
  specialCommercialNotes?: string
}
```

`transactionContext: 'consumer'` vždy aktivuje povinnou spotřebitelskou ochranu (§ 1810–1867 NOZ).

### Quality Gate (Stage 2)

`lib/contracts/qualityGate.ts` — strukturovaný JSON verdict:

```typescript
interface QualityGateResult {
  status: 'pass' | 'warn' | 'block'
  recommendedMode: GenerationMode
  summary: string
  missingEssentialFacts: string[]
  missingEssentialClauses: string[]   // dle per-schema checklistu
  ambiguities: string[]
  contradictions: string[]
  riskyAssumptions: string[]
  czechLawSpecificRisks: string[]
  consumerOrRegulatoryFlags: string[]
  correctedText?: string              // opravený text pokud model udělal opravy
}
```

Per-schema essential clause checklists jsou v `ESSENTIAL_CLAUSES` — každé schéma má seznam klauzulí, které model musí zkontrolovat.

### Integrity Validator (Stage 3b — deterministický)

`lib/contracts/integrityValidator.ts` — bez LLM, vždy běží na finálním textu:

- Počítá `[DOPLNIT` placeholders
- Počítá `⚠️ ZKONTROLOVAT` markery
- Per-schema keyword presence (kupní cena, druh práce, předmět díla…)
- Detekuje signature block (`podpis`, `___` řádky…)
- Defined-term consistency (definovaný pojem musí být použit po definici)
- Consumer clause conflict (§ 1813 NOZ) pokud `transactionContext = 'consumer'`

### Mode downgrade — never-upgrade invarianta

```
PRIORITY: complete(0) < draft(1) < review-needed(2)

Quality gate:  block → review-needed
               warn  → complete→draft, draft/review-needed zůstanou
Integrity:     ZKONTROLOVAT > 0          → review-needed
               [DOPLNIT] > 2             → review-needed
               [DOPLNIT] > 0 + complete  → draft
               error-level issues        → alespoň draft
```

---

## 6. Databáze (Supabase PostgreSQL)

### Tabulky (public schema, RLS enabled)

| Tabulka | Účel | RLS |
|---------|------|-----|
| `profiles` | Rozšíření auth.users — display_name, onboarding_completed, stripe_customer_id | SELECT/UPDATE own |
| `contract_generations_history` | Vygenerované smlouvy (soft-delete) | SELECT/INSERT/UPDATE own |
| `contract_reviews_history` | AI kontroly smluv (soft-delete) | SELECT/INSERT/UPDATE own |
| `user_preferences` | Jazyk, notifikace, marketing consent, subscription_tier (UI cache) | SELECT/UPDATE own |
| `subscriptions` | Stripe subscription cache (webhook-only writes) | SELECT own only |
| `export_log` | DOCX export counter pro billing | SELECT/INSERT own |

### Tabulky (private schema, NOT PostgREST-accessible)

| Tabulka | Účel |
|---------|------|
| `private.audit_events` | Hashed IP audit log (user_id SET NULL on deletion) |

### Klíčové vlastnosti

- Soft-delete pattern (`deleted_at`) na history tabulkách
- Auto-created profiles + preferences on signup (trigger)
- `onboarding_completed` boolean na profiles — billing guard ho kontroluje
- Partial unique index: max 1 active subscription per user
- ON DELETE CASCADE z auth.users
- GDPR: žádné raw IP, marketing consent oddělen od terms
- `subscription_tier` v `user_preferences` je jen UI cache — billing guard čte vždy z `subscriptions`

---

## 7. Billing (Stripe)

### Tarify

| Tier | Cena | Generování | Kontroly | Exporty |
|------|------|-----------|----------|---------|
| **Zdarma** | 0 EUR | 3/měsíc | 3/měsíc | 5/měsíc |
| **Pro** | 19 EUR/měs · 15 EUR/měs ročně (180 EUR/rok) | Neomezené | Neomezené | Neomezené |
| **Tým** | 49 EUR/měs | Neomezené | Neomezené | Neomezené |

### Billing flow

1. User klikne "Upgrade" → `POST /api/billing/checkout` → Stripe Checkout
2. Stripe Checkout completed → webhook → upsert `subscriptions` + sync `user_preferences.subscription_tier`
3. Každý API call → `assertBillingAccess()` → tier z `subscriptions` (NOT cache)
4. Free tier: calendar month reset. Paid tier: Stripe billing period.
5. `past_due` subscriptions stále mají paid přístup (Stripe retry probíhá)

### Stripe Price mapping (env vars)

- `STRIPE_PRO_MONTHLY_PRICE_ID` → `pro`
- `STRIPE_PRO_YEARLY_PRICE_ID` → `pro`
- `STRIPE_TEAM_MONTHLY_PRICE_ID` → `team`
- Neznámé price ID → `free` (fail-safe)

### Billing guard (`lib/billing/guard.ts`)

`assertBillingAccess(action)` — voláno na začátku každé billable route:

1. Neautentifikovaný uživatel → **401** (blokováno)
2. Onboarding nedokončen → **403** (blokováno)
3. Over limit → **402** (blokováno, Czech error message s kontaktem)
4. OK → `{ allowed: true, user, billing }`

---

## 8. Autentizace a ochrana routes

- **Provider:** Supabase Auth (Google OAuth)
- **Session refresh:** `middleware.ts` refreshes JWT via `getUser()` na každém requestu (Edge Runtime)
- **Chráněné routes:** `/dashboard/*`, `/account/*`, `/onboarding/*` → redirect na `/login`
- **Login redirect:** `/login` → `/dashboard` pokud již auth
- **Onboarding gate:** po prvním přihlášení redirect na `/onboarding` → souhlas s podmínkami → `onboarding_completed = true` → `/dashboard`
- **AuthProvider:** React Context v `layout.tsx` — SSR-hydrated initial user

---

## 9. Contract Schema System

### Registry

`SCHEMA_REGISTRY` v `lib/contracts/contractSchemas.ts` — 5 implementovaných schémat:

| Schema ID | Typ smlouvy | Právní základ | Sensitivity |
|-----------|------------|--------------|-------------|
| `kupni-smlouva-v1` | Kupní smlouva | § 2079–2183 NOZ | standard |
| `pracovni-smlouva-v1` | Pracovní smlouva | § 33–73 ZP | sensitive |
| `najemni-smlouva-byt-v1` | Nájemní smlouva na byt | § 2235 NOZ | standard |
| `smlouva-o-dilo-v1` | Smlouva o dílo | § 2586 NOZ | standard |
| `nda-smlouva-v1` | NDA / Smlouva o mlčenlivosti | § 504 + § 1746 NOZ | sensitive |

### Přidání nové smlouvy (checklist)

1. Vytvořit `lib/contracts/schemas/novaSmlouva.ts`
2. Importovat v `contractSchemas.ts` a přidat do `SCHEMA_REGISTRY`
3. Přidat `ESSENTIAL_CLAUSES['nova-smlouva-v1']` do `lib/contracts/qualityGate.ts`
4. Přidat `ESSENTIAL_KEYWORDS['nova-smlouva-v1']` do `lib/contracts/integrityValidator.ts`
5. Volitelně: přidat do `LEGACY_SLUG_MAP` v `contractSchemas.ts`

### Prompt builder — 7 sekcí

| Sekce | Obsah |
|-------|-------|
| A) Kontext smlouvy | Typ, právní základ, role stran |
| B) Vyplněné údaje | Všechny hodnoty s právními poznámkami; podmínky honoured |
| C) Chybějící údaje | CRITICAL (required) + SUPPLEMENTARY (optional) s `[DOPLNIT]` |
| D) Pokyny | Mode-specific instrukce + 5 bezpečnostních pravidel |
| E) Struktura výstupu | Požadované sekce, formátovací pravidla |
| F) Závěrečná kontrola | Self-QA checklist (7–8 bodů) |
| G) Zastoupení / strategie | DraftingPosture — pouze pokud vyplněn |

---

## 10. LLM konfigurace

| Parametr | Hodnota | Důvod |
|----------|---------|-------|
| Výchozí model | `gpt-5.4` | Generování + quality gate JSON |
| Premium model | `gpt-5.4-pro` | Final text polish (NIKDY pro JSON) |
| Temperature | `0.1` | Deterministický právní text |
| Max tokens | `16 384` | Kompletní dlouhé smlouvy |
| Reasoning Stage 1 | `high` | Maximální přesnost právního textu |
| Reasoning Stage 2 | `medium` | Strukturovaná review |
| Review route | `4 096` tokens | Kompaktní JSON analýza |

---

## 11. Rate limiting

`lib/rateLimit.ts` — in-memory sliding window, v provozu na obou billable routes:

- **Limit:** 10 requestů za 60 sekund per IP
- **Response:** `429` + `Retry-After` header
- **Omezení:** per-instance (ne distribuovaný) — pro distribuovaný upgrade na `@upstash/ratelimit + Upstash Redis`
- IP extrakce: `x-forwarded-for` → `x-real-ip` → `'unknown'`

---

## 12. Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase (server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 13. ⚠️ Otevřené produkční problémy

### 🔴 Kritické

**1. GDPR smazání účtu — pouze stub**
`DELETE /api/account` vrací 501. Schází: export dat, smazání z tabulek, smazání auth usera přes service role, vyčištění session. Právní požadavek dle GDPR čl. 17.

### 🟡 Střední

**2. Žádný error tracking**
Bez Sentry/Bugsnag/LogRocket. Production chyby jsou tiché. Jedinou diagnostikou jsou `console.error` logy na serveru.

**3. Rate limiting není distribuovaný**
Aktuální `lib/rateLimit.ts` je in-memory per Vercel instance — při více instancích může burst projít. Upgrade: `@upstash/ratelimit` + Upstash Redis.

**4. Legacy soubory v repozitáři**
`index.html`, `index-cz.html`, `server.js`, `styles.css`, `pure-css-glassmorphism-liquid-glass-ui-kit/` — matoucí pro přispěvatele a AI session. Doporučeno přesunout do `_archive/` nebo smazat.

### 🟢 Drobné

**5. DOCX formát — bullet-point místo právní prózy**
Exportovaný DOCX zobrazuje smlouvu jako odrážkový výpis dat místo skutočné právní prózy. Nutné opravit v `buildModeBlock()` v `promptBuilder.ts` — explicitně instruovat LLM k próze i v `review-needed` módu.

**6. Pricing sekce na homepage**
`PricingSection.tsx` existuje jako komponenta, ale není jasné zda je zakomponována na homepage (`app/page.tsx`). Ověřit.

---

## 14. Dosud vyřešené problémy (z předchozí verze kontextu)

| Problém | Stav |
|---------|------|
| Žádný rate limiting | ✅ Implementováno — `lib/rateLimit.ts`, 10 req/60s |
| Billing guard pro nepřihlášené | ✅ Opraveno — vrací 401, ne `allowed: true` |
| Onboarding gate | ✅ Implementováno — blokuje uživatele bez `onboarding_completed` |
| Stage 2 quality gate | ✅ Implementováno — `lib/contracts/qualityGate.ts` |
| Stage 3b integrity check | ✅ Implementováno — `lib/contracts/integrityValidator.ts` |
| DraftingPosture | ✅ Implementováno — v types.ts + promptBuilder.ts + route.ts |
| History detail pages | ✅ Implementováno — `app/generator/[id]` + `app/review/[id]` |
| Cookie consent banner | ✅ Implementováno — `components/CookieConsent.tsx` |
| Právní stránky | ✅ Implementováno — `/terms`, `/privacy`, `/gdpr` |

---

## 15. Design systém

**Styl:** Glassmorphism / Liquid Glass
**Témy:** Light (default) + Dark (toggle, localStorage persist)

### Fonty
- **Display:** `Italiana` (serif)
- **Body:** `DM Sans` (sans-serif)

### Barvy (dark mode)

| Token | Hodnota | Použití |
|-------|---------|--------|
| `--accent-aqua` | `#5ee7df` | Primární akcent |
| `--accent-violet` | `#b490f5` | Sekundární, gradienty |
| `--accent-rose` | `#f7a8c4` | Required fields, chyby |
| `--accent-amber` | `#ffd27f` | Upozornění |
| `--color-bg` | `#0b0e1a` | Pozadí |
| `--color-text` | `#ffffff` | Text |

---

## 16. Kódové konvence

- TypeScript strict mode, všechny API kontrakty v `lib/contracts/types.ts`
- CSS custom properties pro barvy/spacing
- SVG ikony inline (Lucide-style, stroke-width 1.5)
- Schema IDs verzionované (`kupni-smlouva-v1`) — nikdy neměnit po nasazení
- `@/*` path alias → repo root
- Testy v `__tests__/` vedle zdrojových souborů
- Accessibility: `aria-*`, `role`, keyboard navigation
- Billable routes: vždy `checkRateLimit()` → `assertBillingAccess()` jako první 2 kroky

---

## 17. Podpora a kontakt

| | |
|-|-|
| **Provozovatel** | IndiWeb |
| **Email** | info.indiweb@gmail.com |
| **Telefon** | 728 523 267 |
| **Produkt** | PrávníkAI |

Kontakt je uveden v billing error messages. Přidat do: homepage footer, support UI.

---

## 18. Prioritní roadmapa

| P | Úkol | Dopad |
|---|------|-------|
| 0 | Opravit DOCX formát — próza místo bullet-pointů | Kvalita produktu |
| 1 | Implementovat GDPR DELETE /api/account | Právní požadavek |
| 1 | Archivovat legacy soubory | Přehlednost repo |
| 2 | Upgrade rate limiteru na Upstash Redis | Distribuovaná ochrana |
| 2 | Error tracking (Sentry) | Produkční spolehlivost |
| 3 | Ověřit PricingSection na homepage | Konverze |
| 3 | Přidat kontakt do homepage footer a support UI | Podpora |
| 4 | Další typy smluv | Rozšíření produktu |
