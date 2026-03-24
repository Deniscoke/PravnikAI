# PrávníkAI — Kompletný projektový súhrn pre konzultáciu

> Verzia: 2026-03-24
> Účel: Podkladový dokument pre AI konzultáciu (ChatGPT, Claude, Gemini atď.)
> Jazyk UI/domény: Čeština
> Jurisdikcia: Česká republika

---

## 1. Čo aplikácia robí (Product Overview)

**PrávníkAI** je SaaS webová aplikácia, ktorá využíva AI (OpenAI GPT-4) na pomoc s právnymi dokumentmi podľa českého práva. Má dve hlavné funkcie:

1. **Generátor zmlúv** — používateľ vypĺňa formulár (strany, podmienky), AI vygeneruje plnú zmluvu v českom práve
2. **Kontrola zmlúv** — používateľ vloží text zmluvy, AI analyzuje riziká, chýbajúce klauzuly a odporúčania

**Cieľová skupina:** Fyzické osoby, advokáti, právnici, advokátske kancelárie v ČR

**Monetizácia:** Freemium SaaS cez Stripe — Free / Pro (19 EUR/mes) / Team (49 EUR/mes)

---

## 2. Tech Stack

| Vrstva | Technológia |
|--------|-------------|
| Framework | Next.js 16.2 (App Router, React Server Components) |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL + RLS + Auth) |
| Auth | Supabase Auth — Google OAuth |
| AI/LLM | OpenAI GPT-4 (`openai` SDK v4.67) |
| Platby | Stripe (`stripe` SDK v20.4) |
| Export | `docx` knižnica — generovanie .docx súborov |
| Monitoring | Sentry (`@sentry/nextjs` v10.45) |
| Hosting | Vercel (Edge + Serverless Functions) |
| Testy | Vitest + Testing Library (461 testov, všetky pass) |
| Jazyk | TypeScript 5.5 |

---

## 3. Adresárová štruktúra

```
pravnikAI/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (glassmorphism dizajn, česky)
│   ├── layout.tsx                # Root layout (Sentry, meta)
│   ├── generator/page.tsx        # Generátor zmlúv (hlavná feature)
│   ├── review/page.tsx           # Kontrola zmluvy (hlavná feature)
│   ├── dashboard/page.tsx        # História + pricing tabuľka
│   ├── login/page.tsx            # Google OAuth prihlásenie
│   ├── terms/page.tsx            # Podmienky používania
│   ├── privacy/page.tsx          # Ochrana súkromia
│   ├── gdpr/page.tsx             # GDPR informácie
│   ├── error.tsx                 # Error boundary
│   ├── global-error.tsx          # Sentry global error
│   ├── robots.ts                 # SEO robots.txt
│   ├── sitemap.ts                # SEO sitemap.xml
│   └── api/
│       ├── generate-contract/route.ts   # POST — AI generovanie zmluvy
│       ├── review-contract/route.ts     # POST — AI kontrola zmluvy
│       ├── export-docx/route.ts         # POST — Export do DOCX
│       ├── account/route.ts             # GET (profil) + DELETE (GDPR)
│       └── billing/
│           ├── checkout/route.ts        # POST — Stripe Checkout Session
│           ├── portal/route.ts          # POST — Stripe Customer Portal
│           └── webhook/route.ts         # POST — Stripe Webhook handler
│
├── lib/
│   ├── contracts/
│   │   ├── types.ts              # Celý type system (ContractSchema, ValidationResult atď.)
│   │   ├── contractSchemas.ts    # Registry všetkých schém
│   │   ├── systemPrompt.ts       # Systémový prompt pre AI
│   │   ├── promptBuilder.ts      # Builduje user prompt z dát formulára
│   │   ├── validators.ts         # 3-vrstvová validácia (UI + business-legal + readiness)
│   │   └── schemas/
│   │       ├── kupniSmlouva.ts   # Kupní smlouva (§ 2079–2183 NOZ)
│   │       ├── pracovniSmlouva.ts # Pracovní smlouva (zákoník práce)
│   │       ├── najemniSmlouva.ts  # Nájemní smlouva (§ 2235–2301 NOZ)
│   │       ├── smlouvaODilo.ts    # Smlouva o dílo (§ 2586–2635 NOZ)
│   │       └── ndaSmlouva.ts      # NDA / Mlčenlivost
│   ├── review/
│   │   ├── types.ts              # ReviewContractRequest/Response typy
│   │   └── reviewPromptBuilder.ts # Builduje prompt pre analýzu zmluvy
│   ├── billing/
│   │   ├── plans.ts              # TIER_LIMITS, PLAN_INFO, Stripe price mapping
│   │   ├── guard.ts              # assertBillingAccess() — billing enforcement
│   │   ├── stripe.ts             # Stripe client wrapper
│   │   └── helpers.ts            # Pomocné funkcie
│   ├── supabase/
│   │   ├── server.ts             # createClient() pre server-side (RSC, API routes)
│   │   ├── browser.ts            # createBrowserClient() pre klienta
│   │   ├── actions.ts            # Server actions (ukladanie histórie)
│   │   └── types.ts              # DB typy (Profile, ContractGenerationHistory atď.)
│   ├── llm/
│   │   └── openaiClient.ts       # OpenAI client wrapper
│   └── rateLimit.ts              # In-memory sliding window rate limiter
│
├── supabase/
│   └── migrations/
│       ├── 001_accounts_history.sql  # Profily, história, preferencie, audit
│       ├── 002_billing.sql           # Subscriptions, Stripe integrácia
│       └── 003_export_log.sql        # Export log pre billing counting
│
├── proxy.ts                      # Edge middleware — auth guard pre chránené routes
├── next.config.js                # Security headers, Sentry konfigurácia, Turbopack
├── vitest.config.ts              # Test konfigurácia
└── package.json
```

---

## 4. Databázová schéma (Supabase PostgreSQL)

### Tabuľky (public schema, chránené RLS)

```sql
-- Profily používateľov (auto-vytvorené triggerom pri sign-up)
profiles (
  id UUID PK → auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,  -- nullable, lazy-created
  created_at, updated_at
)

-- História generovaných zmlúv
contract_generations_history (
  id UUID PK,
  user_id UUID → auth.users(id),
  schema_id TEXT,          -- "kupni-smlouva-v1" atď.
  title TEXT,
  mode TEXT,               -- 'complete' | 'draft' | 'review-needed'
  contract_text TEXT,      -- vygenerovaný text
  form_data_snapshot JSONB,-- snapshot formulárových dát
  warnings JSONB,
  legal_basis TEXT[],
  status TEXT,             -- 'completed' | 'failed'
  created_at, updated_at,
  deleted_at TIMESTAMPTZ   -- soft delete
)

-- História kontrol zmlúv
contract_reviews_history (
  id UUID PK,
  user_id UUID → auth.users(id),
  detected_contract_type TEXT,
  title TEXT,
  overall_risk TEXT,       -- 'low' | 'medium' | 'high'
  summary TEXT,
  review_result JSONB,     -- plná ReviewContractResponse
  input_text_preview TEXT, -- prvých ~200 znakov
  status TEXT,
  created_at, updated_at, deleted_at
)

-- Preferencie používateľa (billing tier cache)
user_preferences (
  user_id UUID PK → auth.users(id),
  preferred_language TEXT DEFAULT 'cs',
  email_notifications BOOLEAN,
  marketing_consent BOOLEAN,       -- GDPR opt-in
  marketing_consent_at TIMESTAMPTZ,
  subscription_tier TEXT DEFAULT 'free',  -- UI cache (source of truth = subscriptions table)
  created_at, updated_at
)

-- Stripe subscriptions (webhook-only writable)
subscriptions (
  id UUID PK,
  user_id UUID → auth.users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT CHECK ('active','canceled','past_due','incomplete',...),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  created_at, updated_at
)

-- Export log (billing counting)
export_log (
  id UUID PK,
  user_id UUID → auth.users(id),
  created_at TIMESTAMPTZ
)
```

### Súkromná schéma (private — nie je cez PostgREST)
```sql
private.audit_events (
  id, user_id, event_type, metadata JSONB,
  ip_hash TEXT,  -- SHA-256, nie raw IP (GDPR)
  created_at
)
```

### Automatické triggery
- `on_auth_user_created` → auto-vytvorí `profiles` + `user_preferences` pri sign-up
- `set_updated_at` → automaticky aktualizuje `updated_at` na všetkých tabuľkách

---

## 5. API Routes (serverless functions)

### `POST /api/generate-contract`
**Čo robí:** Validuje dáta formulára, builduje prompt, volá OpenAI, ukladá do histórie
**Auth:** Vyžaduje prihlásenie (401 ak nie je)
**Billing:** Kontroluje limit podľa subscription tier (402 ak prekročený)
**Rate limit:** 10 req/min na IP
**Response:** `GenerateContractResponse` — contractText, mode, warnings, legalBasis

### `POST /api/review-contract`
**Čo robí:** Prijme text zmluvy, pošle AI na analýzu (JSON mode), uloží výsledok
**Auth + Billing + Rate limit:** Rovnaké ako generate
**Response:** `ReviewContractResponse` — overallRisk, riskyClauses, missingClauses, negotiationFlags

### `POST /api/export-docx`
**Čo robí:** Konvertuje contractText na .docx súbor pomocou `docx` knižnice
**Auth + Billing:** Kontroluje export limit (5/mes free, unlimited pro/team)
**Rate limit:** 20 req/min
**Response:** Binary `.docx` file stream

### `GET /api/account`
**Čo robí:** Vracia profil + preferencie + subscription + usage
**Auth:** Vyžaduje prihlásenie

### `DELETE /api/account`
**Čo robí:** GDPR právo na výmaz — soft-deletes história, maže profil
**Auth:** Vyžaduje prihlásenie

### `POST /api/billing/checkout`
**Čo robí:** Vytvorí Stripe Checkout Session pre upgrade na Pro/Team
**Response:** `{ url: string }` — redirect URL

### `POST /api/billing/portal`
**Čo robí:** Vytvorí Stripe Customer Portal session (správa predplatného)

### `POST /api/billing/webhook`
**Čo robí:** Spracúva Stripe eventy — synchonizuje subscriptions tabuľku, aktualizuje subscription_tier
**Eventy:** `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`, `customer.updated`
**Bezpečnosť:** Verifikuje Stripe webhook signature

---

## 6. Billing systém (detailne)

### Tiery a limity

| Tier | Cena | Generácie/mes | Kontroly/mes | Exporty/mes |
|------|------|--------------|-------------|------------|
| Free | 0 EUR | 3 | 3 | 5 |
| Pro | 19 EUR/mes alebo 15 EUR/mes (ročne = 180 EUR/rok) | Neobmedzené | Neobmedzené | Neobmedzené |
| Team | 49 EUR/mes | Neobmedzené | Neobmedzené | Neobmedzené |

### Billing guard logika (lib/billing/guard.ts)
1. `getUser()` — server-validated JWT (nie `getSession()`)
2. Čítanie aktívnej subscription z `subscriptions` tabuľky
3. Derivácia tier z `stripe_price_id` cez `mapStripePriceToPlan()`
4. Počítanie usage z history tabuliek (parallel queries)
5. Porovnanie s `TIER_LIMITS`

**Kľúčové:** Tier sa VŽDY derivuje z `subscriptions` tabuľky, nie z `user_preferences.subscription_tier` (tá je len UI cache). `past_due` subscriptions dostávajú paid-tier prístup (Stripe ešte retruje platbu).

---

## 7. Typy zmlúv (ContractSchemas)

Každá zmluva je definovaná ako `ContractSchema` objekt:

| Schema ID | Názov | Právny základ |
|-----------|-------|--------------|
| `kupni-smlouva-v1` | Kupní smlouva | § 2079–2183 NOZ |
| `pracovni-smlouva-v1` | Pracovní smlouva | Zákoník práce č. 262/2006 Sb. |
| `najemni-smlouva-v1` | Nájemní smlouva | § 2235–2301 NOZ |
| `smlouva-o-dilo-v1` | Smlouva o dílo | § 2586–2635 NOZ |
| `nda-smlouva-v1` | Dohoda o mlčenlivosti | § 1746 odst. 2 NOZ |

### Generačné módy
- `complete` — všetky polia vyplnené → plná zmluva
- `draft` — požadované polia OK, voliteľné chýbajú → `[DOPLNIT]` markery
- `review-needed` — chýbajú požadované polia → `⚠️ ZKONTROLOVAT` markery

### 3-vrstvová validácia
1. **UI** — real-time per-field validácia (required, format, min/max)
2. **Business-legal** — cross-field, česky právne obmedzenia (napr. cena musí byť >0)
3. **Generation readiness** — určuje mode výstupu

---

## 8. Bezpečnosť

| Oblasť | Implementácia |
|--------|---------------|
| Auth | `getUser()` — server-validated JWT, nikdy `getSession()` |
| API ochrana | Billing guard — 401 pre anonymous, 402 pre over-limit |
| Rate limiting | In-memory sliding window (10/min generate+review, 20/min export) |
| Open redirect | Validácia `/?redirect=` parametra v proxy.ts |
| HTTP headers | X-Frame-Options: DENY, nosniff, HSTS, Referrer-Policy, Permissions-Policy |
| Stripe | Webhook signature verifikácia |
| GDPR | Soft delete, IP hashovaná (SHA-256 nie raw), marketing consent opt-in |
| Secrets | Iba server-side env vars (žiadne v NEXT_PUBLIC_*) |
| RLS | Row Level Security na všetkých Supabase tabuľkách |
| Audit | private.audit_events (nie cez PostgREST) |

---

## 9. Environment Variables

```bash
# OpenAI
OPENAI_API_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         # pre webhook handler (bypasses RLS)

# Stripe
STRIPE_SECRET_KEY                  # sk_live_... v produkcii
STRIPE_WEBHOOK_SECRET              # whsec_... z Stripe Dashboard
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID
STRIPE_TEAM_MONTHLY_PRICE_ID

# App
NEXT_PUBLIC_APP_URL               # https://pravnik-ai-five.vercel.app

# Sentry (voliteľné pre produkciu)
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

---

## 10. Testovacie pokrytie

**461 testov · 10 test súborov · 100% pass rate**

| Test súbor | Čo pokrýva |
|-----------|-----------|
| `proxy.test.ts` | Auth redirect logika, open redirect ochrana |
| `app/api/generate-contract/__tests__/route.test.ts` | LLM pipeline, rate limiting, billing, validácia |
| `app/api/review-contract/__tests__/route.test.ts` | Review parsing, JSON mode, error handling |
| `lib/contracts/__tests__/validators.quality.test.ts` | 3-vrstvová validácia, všetky typy zmlúv |
| `lib/contracts/__tests__/promptBuilder.test.ts` | Prompt generovanie pre každý mode |
| `lib/supabase/__tests__/actions.test.ts` | History save actions |
| `app/auth/__tests__/callback.test.ts` | OAuth callback |
| `app/generator/__tests__/page.test.tsx` | Generator UI komponent |
| `app/review/__tests__/page.test.tsx` | Review UI komponent |
| `app/generator/__tests__/async-safety.test.tsx` | AbortController, race conditions |

---

## 11. Deployment

- **Hosting:** Vercel (pravnik-ai-five.vercel.app)
- **GitHub:** github.com/Deniscoke/PravnikAI (master branch)
- **Auto-deploy:** Push na master → automatický Vercel deploy
- **CI:** `npm run type-check` + `npm test` pred deployom

### Stripe Webhook konfigurácia (produkcia)
Endpoint: `https://pravnik-ai-five.vercel.app/api/billing/webhook`
Eventy: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.updated`

---

## 12. Čo NIE JE implementované (Known gaps / TODO)

1. **Žiadna custom doména** — beží na `pravnik-ai-five.vercel.app`
2. **Rate limiter nie je distribuovaný** — in-memory, nezachováva stav medzi Vercel instancemi. Pre produkciu treba Upstash Redis + `@upstash/ratelimit`
3. **Onboarding flow** — endpoint `/onboarding` chráni proxy.ts, ale samotná onboarding stránka nie je implementovaná
4. **Team features** — Team tier existuje v bilingu, ale správa tímu (invite members, team dashboard) nie je implementovaná
5. **Email notifications** — pole v DB existuje, ale email sending nie je implementovaný
6. **Data retention** — soft-delete existuje, ale automatické mazanie po 30 dňoch nie je implementované (TODO v SQL)
7. **GDPR data export** — DELETE endpoint existuje, ale GET export (Art. 15 right of access) nie je plne implementovaný
8. **Distributed rate limiting** — komentár v kóde: "upgrade to @upstash/ratelimit + Upstash Redis"
9. **Stripe webhooks pre Team billing** — Team má iba monthly, žiadna yearly možnosť
10. **Re-editing histórie** — `form_data_snapshot` je uložený v DB, ale UI pre načítanie a úpravu starej zmluvy nie je

---

## 13. Moje návrhy na ďalšie vylepšenia (Prioritizované)

### 🔴 Kritické (pred ostrým spustením)
1. **Distribuovaný rate limiter** — Upstash Redis (`@upstash/ratelimit`), inak boty môžu obísť limit cez parallel requests na rôzne Vercel instancey
2. **Custom doména** — `pravnikAI.cz` alebo `pravnik-ai.cz` + SSL
3. **Onboarding stránka** — používateľ musí prejsť GDPR disclaimer pred použitím (middleware to vyžaduje, stránka chýba)

### 🟡 Vysoká priorita (krátkodobé)
4. **Re-editing histórie** — "Otvoriť a upraviť" existujúcu zmluvu z dashboardu (form_data_snapshot je v DB)
5. **Email notifikácie** — potvrdenie registrácie, billing eventy (Resend alebo Postmark)
6. **Yearly billing pre Team tier** — Pro má monthly+yearly, Team iba monthly
7. **GDPR data export** — stiahnuť vlastné dáta ako JSON (Art. 15)

### 🟢 Strednodobé (growth features)
8. **RAG / Vector search** — uložiť generované zmluvy do Pinecone/pgvector, AI môže porovnávať s predošlými podobnými zmluvami
9. **PDF export** — okrem DOCX aj PDF (pomocou Puppeteer alebo react-pdf)
10. **Multi-language** — slovenčina, angličtina (i18n s `next-intl`)
11. **Clause library** — knižnica klauzúl, ktoré si používateľ môže vkladať
12. **Team collaboration** — zdieľanie zmlúv v rámci tímu, komentáre, schvaľovanie
13. **Webhook retry logic** — Stripe webhook handler bez idempotency key môže pri retry duplikovať záznamy
14. **AI model upgrade prompt** — možnosť vybrať GPT-4o vs GPT-4-turbo pre rôzne use cases

### 🔵 Dlhodobé (product vision)
15. **e-Podpis integrácia** — Signaturit, DocuSign alebo SigniFlow pre CZ trh
16. **Notárske overenie tracking** — sledovanie stavu zmluvy (draft → podpísaná → overená)
17. **API pre law firms** — REST API pre advokátske kancelárie s vlastným brandingom
18. **Mobile app** — React Native alebo PWA

---

## 14. Klúčové architektonické rozhodnutia (pre kontext)

1. **getUser() nie getSession()** — Supabase best practice; getSession() číta z cookie bez server-side validácie
2. **Subscription tier z DB, nie z cache** — `user_preferences.subscription_tier` je iba UI cache, billing guard vždy číta z `subscriptions` tabuľky
3. **Soft delete** — história sa nikdy fyzicky nemaže, iba nastavuje `deleted_at` (GDPR + audit)
4. **Private schema** — audit_events nie sú vystavené cez PostgREST API
5. **SECURITY DEFINER trigger** — `handle_new_user()` beží s právami tvorcu funkcie, nie používateľa
6. **JSON mode OpenAI** — review endpoint používa `response_format: { type: 'json_object' }` pre spoľahlivú štruktúru
7. **In-memory rate limit** — vedome zvolený ako jednoduchšia alternatíva, kód obsahuje upgrade path na Upstash
8. **Billing na základe history tabuliek** — žiadna špeciálna usage_tracking tabuľka, COUNT queries na existujúcich tabuľkách s partial indexami

---

## 15. Otázky pre ďalšiu konzultáciu

Môžete sa ChatGPT/Clauda opýtať na tieto témy:

- "Ako pridať Upstash Redis rate limiter do existujúcej Next.js aplikácie s týmto kódom?"
- "Navrhni architektúru pre Team collaboration features (zdieľanie zmlúv medzi členmi tímu)"
- "Ako implementovať idempotency v Stripe webhook handleri aby som predišiel duplikátom?"
- "Aký je najlepší spôsob implementovať PDF export v Next.js 16 pre server-side rendering?"
- "Navrhni RAG architektúru pre právne dokumenty v českom jazyku"
- "Ako pridať i18n (slovenčina/angličtina) do existujúcej Next.js App Router aplikácie?"
- "Ako implementovať onboarding wizard s GDPR checkboxmi a ukladaním do Supabase?"
