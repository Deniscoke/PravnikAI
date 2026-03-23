# PrávníkAI — Projektový kontext (source of truth)

> Jediný autoritatívní dokument o stavu projektu.
> **Poslední aktualizace:** 2026-03-23
> **Provozovatel:** IndiWeb · info.indiweb@gmail.com · 728 523 267

---

## 1. Co je PrávníkAI

**PrávníkAI** je full-stack webová aplikace pro české právníky. Hlavní funkce:

1. **Generátor smluv** — právník vyplní dynamický formulář, AI vygeneruje kompletní smlouvu s citacemi zákonů
2. **AI kontrola smluv** — vložte existující smlouvu, AI identifikuje rizika a chybějící ustanovení
3. **DOCX export** — profesionální export s záhlavím, zápatím a disclaimery

**Jurisdikce:** Výhradně české právo (NOZ, ZP, ZOK)
**Jazyk UI:** Čeština

---

## 2. Architektura

| Vrstva | Technologie | Stav |
|--------|------------|------|
| Framework | Next.js 16.2.0 (App Router) | Aktivní |
| Frontend | React 18 + TypeScript 5.5 | Aktivní |
| Autentizace | Supabase SSR (`@supabase/ssr`) | Aktivní |
| Databáze | Supabase PostgreSQL (RLS, 3 migrace) | Aktivní |
| LLM | OpenAI API (`openai` v4.67) | Aktivní |
| Billing | Stripe (`stripe` v20.4) — checkout, portal, webhook | Aktivní |
| Export | `docx` v9.6 (server-side DOCX) | Aktivní |
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
│   │   └── __tests__/
│   ├── review/
│   │   ├── page.tsx                  ← AI kontrola smluv
│   │   └── __tests__/
│   ├── dashboard/
│   │   └── page.tsx                  ← Dashboard (onboarding + historie)
│   ├── login/
│   │   └── page.tsx                  ← Přihlášení (Google OAuth)
│   ├── auth/
│   │   ├── callback/route.ts         ← Supabase OAuth callback
│   │   └── __tests__/
│   └── api/
│       ├── generate-contract/
│       │   ├── route.ts              ← POST — generování smlouvy
│       │   └── __tests__/
│       ├── review-contract/
│       │   ├── route.ts              ← POST — AI kontrola smlouvy
│       │   └── __tests__/
│       ├── export-docx/
│       │   └── route.ts              ← POST — DOCX export
│       ├── account/
│       │   └── route.ts              ← GET (profil) + DELETE (⚠️ stub)
│       └── billing/
│           ├── checkout/route.ts     ← POST — Stripe Checkout
│           ├── portal/route.ts       ← POST — Stripe Portal
│           └── webhook/route.ts      ← POST — Stripe webhook handler
│
├── components/
│   ├── ThemeToggle.tsx
│   ├── auth/
│   │   ├── AuthProvider.tsx          ← React Context pro session
│   │   └── UserMenu.tsx             ← Login/logout + Google OAuth
│   ├── contract/
│   │   ├── DynamicContractForm.tsx   ← Schema-driven formulář
│   │   └── ContractResult.tsx        ← Výsledek generování
│   ├── dashboard/
│   │   ├── HistoryList.tsx           ← Seznam vygenerovaných smluv
│   │   └── OnboardingView.tsx        ← Onboarding flow
│   └── review/
│       └── ReviewResult.tsx          ← Výsledek AI kontroly
│
├── lib/
│   ├── contracts/
│   │   ├── types.ts                  ← Kompletní typový systém
│   │   ├── contractSchemas.ts        ← SCHEMA_REGISTRY (5 schémat)
│   │   ├── systemPrompt.ts           ← LLM system prompt (české právo)
│   │   ├── promptBuilder.ts          ← Sestavení promptu pro LLM
│   │   ├── validators.ts             ← Třívrstvá validace
│   │   ├── schemas/
│   │   │   ├── kupniSmlouva.ts       ← § 2079–2183 NOZ
│   │   │   ├── pracovniSmlouva.ts    ← § 33–73 ZP
│   │   │   ├── najemniSmlouva.ts     ← Nájemní smlouva na byt
│   │   │   ├── smlouvaODilo.ts       ← Smlouva o dílo
│   │   │   └── ndaSmlouva.ts         ← NDA (§ 504 + § 1746 NOZ)
│   │   └── __tests__/
│   ├── billing/
│   │   ├── guard.ts                  ← Billing enforcement (route-level)
│   │   ├── helpers.ts                ← Billing utilities
│   │   ├── plans.ts                  ← Tarify: free / pro / team
│   │   └── stripe.ts                ← Stripe client instance
│   ├── llm/
│   │   └── openaiClient.ts          ← OpenAI wrapper
│   ├── review/
│   │   ├── reviewPromptBuilder.ts    ← Prompt pro AI kontrolu
│   │   └── types.ts                  ← Review response types
│   └── supabase/
│       ├── actions.ts                ← DB write helpers (save history)
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
├── middleware.ts                      ← Auth guard (Edge Runtime)
├── next.config.js
├── tsconfig.json                      ← Strict mode, @/* alias
├── vitest.config.ts
├── package.json
├── .env.local.example                 ← Template pro env vars
│
├── docs/
│   └── plans/
│       └── 2026-03-18-contract-generator-design.md
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
Generování smlouvy. Pipeline: parse → resolve schema → 3-vrstvá validace → build prompt → LLM call → save to history.

```typescript
// Request
{ schemaId: string, formData: NormalizedFormData }

// Response (200)
{
  schemaId: string,
  mode: 'complete' | 'draft' | 'review-needed',
  contractText: string,
  warnings: ContractWarning[],
  missingFields: string[],
  legalBasis: string[],
  generatedAt: string  // ISO 8601
}

// Errors: 400 (validation), 404 (schema), 422 (too many errors), 402 (billing), 502 (LLM)
```

### POST `/api/review-contract`
AI kontrola existující smlouvy. Detekuje typ, identifikuje rizika, hodnotí overall risk (low/medium/high).

### POST `/api/export-docx`
Export smlouvy do DOCX. Logs export to `export_log` for billing.

### POST `/api/billing/checkout`
Vytvoří Stripe Checkout session. Lazy-creates Stripe Customer.

### POST `/api/billing/portal`
Redirect na Stripe Customer Portal (správa předplatného).

### POST `/api/billing/webhook`
Stripe webhook handler. Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.updated`.

### GET `/api/account`
Vrací profil + preference přihlášeného uživatele.

### DELETE `/api/account`
⚠️ **STUB** — vrací 501. GDPR smazání účtu dosud neimplementováno.

### GET `/app/auth/callback`
Supabase OAuth callback (Google sign-in).

---

## 5. Databáze (Supabase PostgreSQL)

### Tabulky (public schema, RLS enabled)

| Tabulka | Účel | RLS |
|---------|------|-----|
| `profiles` | Rozšíření auth.users — display_name, onboarding, stripe_customer_id | SELECT/UPDATE own |
| `contract_generations_history` | Vygenerované smlouvy (soft-delete) | SELECT/INSERT/UPDATE own |
| `contract_reviews_history` | AI kontroly smluv (soft-delete) | SELECT/INSERT/UPDATE own |
| `user_preferences` | Jazyk, notifikace, marketing consent, subscription_tier (cache) | SELECT/UPDATE own |
| `subscriptions` | Stripe subscription cache (webhook-only writes) | SELECT own only |
| `export_log` | DOCX export counter pro billing | SELECT/INSERT own |

### Tabulky (private schema, NOT PostgREST-accessible)

| Tabulka | Účel |
|---------|------|
| `private.audit_events` | Hashed IP audit log (user_id SET NULL on deletion) |

### Klíčové vlastnosti
- Soft-delete pattern (`deleted_at`)
- Auto-created profiles + preferences on signup (trigger)
- Partial unique index: max 1 active subscription per user
- ON DELETE CASCADE z auth.users
- GDPR: žádné raw IP, marketing consent oddělen od terms

---

## 6. Billing (Stripe)

### Tarify

| Tier | Cena | Generování | Kontroly | Exporty |
|------|------|-----------|----------|---------|
| **Zdarma** | 0 EUR | 3/měsíc | 3/měsíc | 5/měsíc |
| **Pro** | 19 EUR/měs (15 EUR/měs ročně) | Neomezené | Neomezené | Neomezené |
| **Tým** | 49 EUR/měs | Neomezené | Neomezené | Neomezené |

### Billing flow
1. User klikne "Upgrade" → `POST /api/billing/checkout` → Stripe Checkout
2. Stripe Checkout completed → webhook → upsert `subscriptions` + sync `user_preferences.subscription_tier`
3. Každý API call → `assertBillingAccess()` → derive tier from `subscriptions` table (NOT cache)
4. Free tier: calendar month reset. Paid tier: Stripe billing period.

### Stripe Price mapping
- `STRIPE_PRO_MONTHLY_PRICE_ID` → `pro`
- `STRIPE_PRO_YEARLY_PRICE_ID` → `pro`
- `STRIPE_TEAM_MONTHLY_PRICE_ID` → `team`
- Unknown price ID → `free` (fail-safe)

---

## 7. Autentizace

- **Provider:** Supabase Auth (Google OAuth)
- **Session refresh:** `middleware.ts` refreshes JWT via `getUser()` on every request
- **Protected routes:** `/dashboard/*`, `/account/*`, `/onboarding/*` → redirect to `/login`
- **Login redirect:** `/login` → `/dashboard` if already authenticated
- **AuthProvider:** React Context in `layout.tsx` — SSR-hydrated initial user

---

## 8. Contract Schema System

### Registry
`SCHEMA_REGISTRY` v `lib/contracts/contractSchemas.ts` — single source of truth.

5 implementovaných schémat:

| Schema ID | Typ smlouvy | Právní základ | Sensitivity |
|-----------|------------|--------------|-------------|
| `kupni-smlouva-v1` | Kupní smlouva | § 2079–2183 NOZ | standard |
| `pracovni-smlouva-v1` | Pracovní smlouva | § 33–73 ZP | sensitive |
| `najemni-smlouva-byt-v1` | Nájemní smlouva na byt | NOZ | standard |
| `smlouva-o-dilo-v1` | Smlouva o dílo | NOZ | standard |
| `nda-smlouva-v1` | NDA | § 504 + § 1746 NOZ | sensitive |

### Přidání nové schémy
1. Vytvořit `lib/contracts/schemas/novaSmlouva.ts`
2. Importovat v `contractSchemas.ts` a přidat do `SCHEMA_REGISTRY`
3. Volitelně: přidat do `LEGACY_SLUG_MAP` (pokud má SK ekvivalent)

### Třívrstvá validace (`types.ts`)
1. **UI validace** — real-time, per-field
2. **Business-legal** — cross-field, české právní constraints
3. **Generation readiness** → `complete` / `draft` / `review-needed`

### Generační módy
- `complete` — vše vyplněno, kompletní smlouva
- `draft` — povinná pole OK, volitelná chybí → `[DOPLNIT]` placeholders
- `review-needed` — povinná chybí → `⚠️ ZKONTROLOVAT` markery

---

## 9. Environment Variables

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

## 10. ⚠️ Otevřené produkční problémy

### 🔴 Kritické

**1. Žádný rate limiting**
API routes nemají žádné omezení rychlosti. Billing guard počítá jen per-period usage, ale nebrání burst útoku (1000 požadavků/s). Každý request volá OpenAI = náklady. `RATE_LIMITED` error code existuje v `types.ts` ale nikde se nepoužívá.

**2. GDPR smazání účtu — pouze stub**
`DELETE /api/account` vrací 501. Schází: export dat, smazání z tabulek, smazání auth usera přes service role, vyčištění session. Právní požadavek dle GDPR čl. 17.

**3. Billing guard otevřený pro nepřihlášené**
V `lib/billing/guard.ts:89`: nepřihlášení uživatelé dostávají `allowed: true` bez jakéhokoliv limitu. To efektivně obchází celý billing systém. Každý, kdo se nepřihlásí, může generovat neomezeně.

### 🟡 Střední

**4. Chybí cookie consent banner**
Aplikace používá localStorage (theme) a Supabase auth cookies. Pro GDPR compliance potřeba consent banner.

**5. Žádný error tracking**
Bez Sentry/Bugsnag/LogRocket. Production chyby jsou tiché.

**6. Legacy soubory v repozitáři**
`index.html`, `index-cz.html`, `server.js`, `styles.css`, `pure-css-glassmorphism-liquid-glass-ui-kit/` — matoucí pro přispěvatele a AI session.

### 🟢 Drobné

**7. Footer "Právní" odkazy vedou na `/dashboard`**
Obchodní podmínky, Ochrana osobních údajů, GDPR — všechny linkují na `/dashboard` místo reálných stránek.

**8. Pricing sekce chybí**
Homepage nemá sekci s tarify. Uživatelé nevidí cenovou nabídku.

---

## 11. Podpora a kontakt

| | |
|-|-|
| **Provozovatel** | IndiWeb |
| **Email** | info.indiweb@gmail.com |
| **Telefon** | 728 523 267 |
| **Produkt** | PrávníkAI |

Kontakt musí být uveden v:
- Homepage footer
- Účtu / podpora messaging
- Billing error messages
- Právní stránky (obchodní podmínky, ochrana údajů) — až budou vytvořeny

---

## 12. Kódové konvence

- TypeScript strict mode, všechny API kontrakty v `lib/contracts/types.ts`
- BEM pro CSS: `.block__element--modifier`
- CSS custom properties pro barvy/spacing
- SVG ikony inline (Lucide-style, stroke-width 1.5)
- Schema IDs verzionované (`kupni-smlouva-v1`) — nikdy neměnit po nasazení
- `@/*` path alias → repo root
- Testy v `__tests__/` vedle zdrojových souborů
- Accessibility: `aria-*`, `role`, keyboard navigation

---

## 13. Design systém

**Styl:** Glassmorphism / Liquid Glass
**Témy:** Dark (default) + Light (toggle, localStorage persist)

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

## 14. Legacy soubory — kandidáti na archivaci

Tyto soubory patří ke starší statické HTML/server.js architektuře a nemají žádné napojení na aktivní Next.js aplikaci:

| Soubor | Původní účel | Nahrazeno |
|--------|-------------|-----------|
| `index.html` | SK landing page | `app/page.tsx` |
| `index-cz.html` | CZ landing page | `app/page.tsx` |
| `server.js` | HTTP static server (port 3456) | Next.js dev server (port 3000) |
| `styles.css` | Vlastní CSS | `app/globals.css` |
| `pure-css-glassmorphism-liquid-glass-ui-kit/` | UI kit | CSS extrahováno do globals.css |

**Doporučení:** Přesunout do `_archive/` nebo smazat. Zachování v kořenu je matoucí.

---

## 15. Prioritní roadmapa

| P | Úkol | Dopad |
|---|------|-------|
| 0 | Archivovat/smazat legacy soubory | Odstraní zmatek v repo |
| 1 | Rate limiting na API routes | Bezpečnost, ochrana před zneužitím a náklady |
| 1 | Implementovat GDPR DELETE /api/account | Právní požadavek |
| 1 | Opravit billing guard pro nepřihlášené | Monetizace |
| 2 | Cookie consent banner | GDPR compliance |
| 2 | Error tracking (Sentry) | Produkční spolehlivost |
| 2 | Pricing sekce na homepage | Konverze |
| 3 | Právní stránky (podmínky, GDPR, ochrana údajů) | Compliance |
| 3 | IndiWeb kontakt do footer a support UI | Podpora |
| 3 | Další typy smluv | Rozšíření produktu |
