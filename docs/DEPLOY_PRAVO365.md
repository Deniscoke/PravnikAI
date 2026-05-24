# Právo365 — produkčný deploy (pravo365.cz)

Checklist po kúpe domény a pred spustením predaja.

## 1. Doména na Vercel

1. Vercel → projekt → **Settings → Domains → Buy** (alebo **Add** ak doménu vlastníte inde)
2. Pridajte `pravo365.cz` ako **Primary**
3. Voliteľne `www.pravo365.cz` — `vercel.json` presmeruje www → apex
4. Počkajte na zelený stav **Valid Configuration** (SSL automaticky)

## 2. Environment variables (Vercel → Production)

```bash
NEXT_PUBLIC_APP_URL=https://pravo365.cz

# Stripe LIVE
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...

# Supabase (EU region)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # len server — nikdy v prehliadači

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Rate limiting (odporúčané v produkcii)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Po uložení: **Deployments → Redeploy**.

## 3. Stripe webhook (live)

- URL: `https://pravo365.cz/api/billing/webhook`
- Eventy: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.updated`
- Signing secret → `STRIPE_WEBHOOK_SECRET`

## 4. Supabase Auth

**Authentication → URL Configuration:**

| Pole | Hodnota |
|------|---------|
| Site URL | `https://pravo365.cz` |
| Redirect URLs | `https://pravo365.cz/auth/callback`, `https://pravo365.cz/**` |

## 5. Bezpečnosť údajov (čo už app robí)

| Vrstva | Ochrana |
|--------|---------|
| Prevádzka | HTTPS (Vercel SSL), HSTS hlavičky |
| Autentifikácia | Supabase JWT, `getUser()` server-side validácia |
| Databáza | Row Level Security — používateľ vidí len svoje riadky |
| Citlivé kľúče | Iba server env (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`) |
| Platby | Stripe Checkout — karty nikdy neprechádzajú naším serverom |
| Webhook | Stripe podpis (`STRIPE_WEBHOOK_SECRET`) |
| API | Auth + billing guard + rate limit (Upstash) |
| Cookies | `Secure` + `SameSite=Lax` v produkcii |
| Audit | `private.audit_events` — mimo PostgREST API |

Údaje v Supabase sú šifrované at-rest (AES-256) a in-transit (TLS) — spravuje Supabase infraštruktúra.

## 6. Test pred spustením

1. Google login na `https://pravo365.cz`
2. Onboarding → dashboard
3. Stripe Checkout (live test platba)
4. Webhook 200 v Stripe Dashboard
5. Tier `pro` v dashboarde
