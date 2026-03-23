# PrávníkAI — Souhrn projektu & QA Report

> **Datum:** 22. března 2026
> **Verze:** 0.4-beta
> **Stav:** Produkčně připravený pro 5 typů smluv, sjednocené UI s light/dark režimem

---

## 1. O projektu

**PrávníkAI** je AI-powered generátor a reviewer právních smluv pro české právo.

| Aspekt | Detail |
|--------|--------|
| **Cílový trh** | Česká republika (NOZ, ZP, ZOK) |
| **Cílová skupina** | Právníci, advokáti, firemní právníci, notáři, podnikatelé |
| **Jazyk UI** | Čeština (celá aplikace) |
| **Monetizace** | SaaS model (Stripe integrace v plánu) |

### Hlavní funkce
1. **Generátor smluv** — vyplníte formulář → AI vygeneruje právní dokument s citacemi zákonů
2. **Review smluv** — vložíte text smlouvy → AI analyzuje rizika, chybějící ustanovení, vyjednávací body
3. **Export do DOCX** — profesionální formátování se záhlavím, zápatím, právními citacemi
4. **Dashboard** — historie generovaných a recenzovaných smluv s možností mazání
5. **Light/Dark režim** — plný glassmorphism design s přepínačem motivů

---

## 2. Tech Stack

| Vrstva | Technologie | Verze |
|--------|-------------|-------|
| **Frontend** | Next.js (App Router) | 16.2.0 |
| **UI** | React + CSS custom properties (glassmorphism) | 18.3.1 |
| **Jazyk** | TypeScript (strict mode) | 5.5.2 |
| **Auth** | Supabase (Google OAuth + RLS) | 2.99.3 |
| **LLM** | OpenAI GPT-4o (temperature 0.1) | 4.67.0 |
| **Export** | docx (Node.js library) | 9.6.1 |
| **Testy** | Vitest + Testing Library | 4.1.0 |
| **Design** | Liquid Glass UI Kit (vlastní port) | — |

---

## 3. Architektura

### 3.1 Schema-Driven Design (jádro systému)

```
ContractSchema (single source of truth)
    ├── → DynamicContractForm (generuje formulář)
    ├── → validators.ts (3-vrstvá validace)
    ├── → promptBuilder.ts (sestaví prompt pro LLM)
    └── → export-docx (formátování výstupu)
```

Každý typ smlouvy je definován jedním schema souborem v `lib/contracts/schemas/`. Přidání nového typu smlouvy = 1 nový soubor.

### 3.2 3-vrstvá validace

| Vrstva | Účel | Výsledek |
|--------|------|----------|
| **UI validace** | Formátové kontroly (IČO, email, datum) | Chybové hlášky u polí |
| **Business-Legal** | Právní konzistence (datum ukončení > datum začátku) | Varování |
| **Generation Readiness** | Kompletnost dat pro generování | Režim: complete / draft / review-needed |

### 3.3 Generovací pipeline

```
POST /api/generate-contract
  1. Resolve schemaId (+ legacy slug podpora)
  2. 3-vrstvá validace
  3. Určení režimu (complete / draft / review-needed)
  4. Sestavení system + user promptu (promptBuilder)
  5. Volání LLM (gpt-4o, temp 0.1)
  6. Uložení do historie (async, neblokující)
  7. Response: { contractText, warnings, legalBasis, mode }
```

### 3.4 Review pipeline

```
POST /api/review-contract
  1. Validace textu smlouvy (50–100K znaků)
  2. Sestavení review promptu
  3. Volání LLM s JSON mode
  4. Parsování a validace struktury odpovědi
  5. Response: { overallRisk, riskyClauses[], missingClauses[], negotiationFlags[] }
```

---

## 4. Struktura souborů

### 4.1 App Router (app/)

| Soubor | Typ | Účel |
|--------|-----|------|
| `layout.tsx` | RSC | Root layout, fonty, AuthProvider, ThemeToggle, animované bloby |
| `page.tsx` | Client | Landing page — hero, features, kroky, typy smluv, FAQ, CTA, footer |
| `login/page.tsx` | Client | Google OAuth přihlášení |
| `generator/page.tsx` | Client | Výběr typu smlouvy → dynamický formulář → výsledek |
| `review/page.tsx` | Client | Vstup textu smlouvy → AI analýza rizik |
| `dashboard/page.tsx` | RSC | Chráněná stránka, onboarding gate, historie |

### 4.2 API Routes

| Endpoint | Metoda | Účel | Runtime |
|----------|--------|------|---------|
| `/api/generate-contract` | POST | Generování smlouvy | Node.js |
| `/api/review-contract` | POST | AI review smlouvy | Node.js |
| `/api/export-docx` | POST | Export do DOCX | Node.js |
| `/api/account` | POST | GDPR export/smazání | Node.js (STUB) |
| `/auth/callback` | GET | OAuth callback | Edge |

### 4.3 Komponenty (components/)

| Soubor | Účel |
|--------|------|
| `ThemeToggle.tsx` | Přepínač dark/light motivu, localStorage persistence |
| `auth/AuthProvider.tsx` | Supabase auth context, SSR hydration |
| `auth/UserMenu.tsx` | Profilové menu, odhlášení |
| `contract/DynamicContractForm.tsx` | Schema-driven renderer formuláře |
| `contract/ContractResult.tsx` | Zobrazení vygenerované smlouvy + export |
| `dashboard/HistoryList.tsx` | Historie generací a recenzí |
| `dashboard/OnboardingView.tsx` | Přijetí podmínek |
| `review/ReviewResult.tsx` | Zobrazení analýzy rizik |

### 4.4 Knihovny (lib/)

| Soubor | LOC | Účel |
|--------|-----|------|
| `contracts/types.ts` | 266 | Typové definice (ContractSchema, ContractField, FieldSensitivity) |
| `contracts/contractSchemas.ts` | 79 | Registr schémat, resolution, legacy mapping |
| `contracts/validators.ts` | 640 | 3-vrstvá validace |
| `contracts/promptBuilder.ts` | 552 | Deterministické sestavení promptu |
| `contracts/systemPrompt.ts` | 51 | Systémové instrukce pro LLM |
| `llm/openaiClient.ts` | 73 | Provider-agnostický wrapper |
| `review/reviewPromptBuilder.ts` | 150 | Prompt pro review smluv |
| `supabase/server.ts` | 70 | Server-side Supabase klient |
| `supabase/actions.ts` | 200 | Server actions (onboarding, historie) |

### 4.5 Schémata smluv

| Schema | Název | Právní základ | Stav |
|--------|-------|---------------|------|
| `kupniSmlouva` | Kupní smlouva | § 2079–2183 NOZ | ✅ |
| `smlouvaODilo` | Smlouva o dílo | § 2586–2629 NOZ | ✅ |
| `pracovniSmlouva` | Pracovní smlouva | § 33–48 ZP | ✅ |
| `najemniSmlouva` | Nájemní smlouva na byt | § 2235–2271 NOZ | ✅ |
| `ndaSmlouva` | Smlouva o mlčenlivosti (NDA) | § 504 NOZ | ✅ |

---

## 5. UI/UX Design

### 5.1 Design systém

| Vlastnost | Hodnota |
|-----------|---------|
| **Styl** | Glassmorphism (Liquid Glass UI Kit) |
| **Fonty** | Italiana (display) + DM Sans (body) |
| **Dark mode** | `#0b0e1a` pozadí, bílý text, jasné akcenty |
| **Light mode** | `#e8f0fa` pozadí, tmavý text, WCAG-compliant akcenty |
| **Ikony** | SVG (Lucide-styl, stroke-width 1.5), žádné emoji |
| **Animace** | Plovoucí bloby, glass reflection, hover shimmer |
| **Responsive** | Mobile-first (375 / 768 / 1024) |
| **Přístupnost** | prefers-reduced-motion, focus-visible, aria-labels, min 44px touch targets |

### 5.2 Klíčové CSS tokeny

```css
/* Dark (default) */
--accent-aqua:    #5ee7df;
--accent-violet:  #b490f5;
--color-bg:       #0b0e1a;

/* Light */
--accent-aqua:    #0891b2;  /* cyan-600, WCAG AA */
--accent-violet:  #6d28d9;  /* violet-700, WCAG AA */
--color-bg:       #e8f0fa;
```

### 5.3 Glass efekt

Karty a komponenty používají `.glass` / `.glass-card` třídu:
- `backdrop-filter: blur(18px)` — rozmazání pozadí
- `::before` — gradient reflection (simulace světla na skle)
- `::after` — hover shimmer overlay
- `box-shadow: var(--shadow-glass)` — hluboký stín s vnitřním odleskem
- Hover: `translateY(-6px) scale(1.01)` + `shadow-float`

### 5.4 Theme Toggle

- Přepínač v pravém horním rohu (slunce/měsíc SVG ikony)
- Ukládá preferenci do `localStorage` klíč `glass-theme`
- Inline `<script>` v `<head>` zabraňuje flash of wrong theme
- `data-theme="light"` na `<html>` přepisuje všechny CSS custom properties

---

## 6. Autentizace & Bezpečnost

### 6.1 Auth flow

```
Google OAuth → Supabase → Cookie session → RLS enforcement
```

1. Uživatel klikne "Přihlásit se" → Supabase OAuth endpoint
2. Google OAuth callback → `/auth/callback` → session cookie
3. Middleware refreshuje JWT při každém requestu
4. RLS politiky omezují přístup k datům jen na vlastní záznamy

### 6.2 Bezpečnostní opatření

| Opatření | Stav |
|----------|------|
| API klíč na serveru (nikdy v prohlížeči) | ✅ |
| RLS politiky v Supabase | ✅ |
| GDPR citlivostní tagy na polích | ✅ |
| Validace vstupů (3 vrstvy) | ✅ |
| `export const runtime = 'nodejs'` na API routes | ✅ |
| HTTP-only session cookies | ✅ |
| Rate limiting | ❌ Chybí |
| GDPR export/smazání účtu | ❌ Stub |
| Error tracking (Sentry) | ❌ Chybí |

---

## 7. QA Report

### 7.1 Testovací pokrytí

| Oblast | Soubory | Pokrytí |
|--------|---------|---------|
| Generátor API | `route.test.ts` | ✅ Validace, režimy, chyby |
| Review API | `route.test.ts` | ✅ Validace, JSON parsing |
| Auth callback | `callback.test.ts` | ✅ OAuth exchange |
| Dashboard | `page.test.tsx` | ✅ Onboarding, historie |
| Generator UI | `page.test.tsx`, `async-safety.test.tsx` | ✅ Stavy, race conditions |
| Review UI | `page.test.tsx` | ✅ Input, výsledky |
| Validátory | `validators.quality.test.ts` | ✅ 3 vrstvy |
| Prompt builder | `promptBuilder.test.ts` | ✅ Deterministický výstup |
| Server actions | `actions.test.ts` | ✅ Supabase integrace |

### 7.2 Funkční testy (manuální verifikace)

| Funkce | Stav | Poznámka |
|--------|------|----------|
| Landing page (dark) | ✅ | Všech 7 sekcí renderuje správně |
| Landing page (light) | ✅ | Všechny tokeny se přepínají |
| Theme toggle persistence | ✅ | localStorage funguje |
| Theme toggle — žádný flash | ✅ | Inline script v `<head>` |
| Generátor smluv | ✅ | Schema-driven formulář |
| Export DOCX | ✅ | Node.js runtime, profesionální formátování |
| Review smluv | ✅ | JSON mode, risk analysis |
| Google OAuth | ✅ | Supabase integration |
| Dashboard historie | ✅ | Generace + recenze |
| Responsive (mobile) | ✅ | Bloby se zmenší, grid se zjednoduší |
| prefers-reduced-motion | ✅ | Animace se vypnou |
| Animované bloby | ✅ | Větší a výraznější než v0.3 |
| Glass reflection efekt | ✅ | ::before gradient na kartách |
| Glass hover shimmer | ✅ | ::after gradient overlay |

### 7.3 Známé problémy a rizika

| Priorita | Problém | Dopad | Řešení |
|----------|---------|-------|--------|
| 🔴 HIGH | Chybí rate limiting | Zneužití API, náklady | Implementovat middleware |
| 🔴 HIGH | GDPR účet export/smazání je stub | Právní riziko | Implementovat endpoint |
| 🟡 MEDIUM | Chybí cookie consent banner | GDPR compliance | Přidat consent komponent |
| 🟡 MEDIUM | Chybí error tracking | Neviditelné produkční chyby | Přidat Sentry |
| 🟡 MEDIUM | Stripe integrace chybí | Žádná monetizace | Implementovat billing |
| 🟢 LOW | `server.js` + `index.html` jsou zastaralé | Zbytečné soubory | Smazat |
| 🟢 LOW | PDF export chybí | DOCX stačí pro MVP | Přidat později |
| 🟢 LOW | SEO meta tagy | Vyhledávače | Přidat Open Graph |

### 7.4 Architektonická rizika

| Riziko | Závažnost | Mitigace |
|--------|-----------|----------|
| Závislost na jednom LLM provideru (OpenAI) | Střední | `openaiClient.ts` je wrapper — snadná výměna |
| Supabase vendor lock-in | Nízká | Standardní PostgreSQL + JWT, migrace je možná |
| CSS custom properties — IE nepodporuje | Žádná | Cílová skupina používá moderní prohlížeče |
| `docx` library vyžaduje Node.js Buffer | Řešeno | `runtime = 'nodejs'` na API routes |

---

## 8. Struktura databáze (Supabase)

### Tabulky

| Tabulka | Účel | RLS |
|---------|------|-----|
| `profiles` | Uživatelský profil, onboarding stav | ✅ user_id |
| `contract_generations` | Historie generovaných smluv | ✅ user_id |
| `contract_reviews` | Historie recenzí smluv | ✅ user_id |

### Klíčové sloupce (contract_generations)

```
id, user_id, schema_id, mode, contract_text,
warnings[], legal_basis[], form_data (JSONB),
created_at, deleted_at (soft delete)
```

---

## 9. Prostředí a konfigurace

### Proměnné prostředí (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

### Skripty (package.json)

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest"
}
```

### Porty

| Server | Port | Stav |
|--------|------|------|
| Next.js (hlavní aplikace) | 3000 | ✅ Aktivní |
| server.js (starý static server) | 3456 | ⚠️ Zastaralý, ke smazání |

---

## 10. Doporučení pro další vývoj

### Priorita 1 (kritické pro produkci)
1. **Rate limiting** — middleware na API routes (100 req/min/user)
2. **GDPR compliance** — implementovat `/api/account` (export + smazání dat)
3. **Smazat zastaralé soubory** — `server.js`, `index.html`, `index-cz.html`

### Priorita 2 (důležité pro business)
4. **Stripe billing** — subscription plány, usage tracking
5. **Cookie consent** — GDPR banner
6. **Error tracking** — Sentry integration
7. **Další typy smluv** — darovací, mandátní, licenční...

### Priorita 3 (nice-to-have)
8. **PDF export** — vedle DOCX
9. **SEO** — Open Graph meta tagy, strukturovaná data
10. **Email notifikace** — Resend/Postmark integration
11. **Vícejazyčnost** — slovenská mutace

---

## 11. Changelog (v0.4-beta)

### Nové v0.4 (2026-03-22)
- ✅ UI sjednocení — glassmorphism landing page portována do Next.js
- ✅ Light/dark mode přepínač s localStorage persistencí
- ✅ Glass efekty — reflection, shimmer, shadow-float
- ✅ Větší a výraznější animované bloby
- ✅ WCAG-compliant akcentové barvy pro light mode
- ✅ Inline script pro prevenci theme flash
- ✅ ThemeToggle React komponent (SVG ikony)

### Z v0.3 (2026-03-18–21)
- ✅ 5 typů smluv (kupní, dílo, pracovní, nájemní, NDA)
- ✅ DOCX export s Node.js runtime fix
- ✅ 3-vrstvá validace
- ✅ Contract review s JSON mode
- ✅ Google OAuth + Supabase RLS
- ✅ Dashboard s historií
- ✅ Schema-driven architektura
