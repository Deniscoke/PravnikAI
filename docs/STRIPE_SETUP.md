# Stripe — spustenie platieb pre Právo365 (pravo365.cz)

Kód checkoutu je hotový. Na Vercel a v Stripe Dashboard treba doplniť **6 env premenných** + webhook.

---

## Krok 1 — Stripe účet (live mode)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → dokončite aktiváciu účtu
2. Prepniť **Live mode** (vpravo hore)

---

## Krok 2 — Produkty a ceny

**Product catalog → Add product**

| Produkt | Cena | Interval |
|---------|------|----------|
| Právo365 Pro | 19,00 EUR | Monthly (recurring) |
| Právo365 Pro | 180,00 EUR | Yearly (recurring) |
| Právo365 Team | 49,00 EUR | Monthly (recurring) |

Skopírujte **Price ID** (`price_...`) pre každú cenu.

---

## Krok 3 — Customer Portal

**Settings → Billing → Customer portal → Activate**

Zapnite: zmena karty, faktúry, zrušenie predplatného, zmena plánu.  
Pridajte produkty Pro a Team.

---

## Krok 4 — Webhook

**Developers → Webhooks → Add endpoint**

- **URL:** `https://pravo365.cz/api/billing/webhook`
- **Events:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `customer.updated`

**Signing secret** (`whsec_...`) → Vercel env `STRIPE_WEBHOOK_SECRET`

---

## Krok 5 — Vercel Environment Variables (Production)

| Premenná | Príklad / zdroj |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `https://pravo365.cz` |
| `STRIPE_SECRET_KEY` | Developers → API keys → **Secret key** (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook → Signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Pro → 19 €/mesiac |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Pro → 180 €/rok |
| `STRIPE_TEAM_MONTHLY_PRICE_ID` | Team → 49 €/mesiac |

**Dôležité:** Všetky kľúče musia byť z **live** režimu. Test `price_` + live `sk_live_` nefunguje.

Po uložení: **Deployments → Redeploy** (bez redeploy sa env neaplikujú).

---

## Krok 6 — Test platby

1. Prihlásenie: [pravo365.cz/cs/login](https://pravo365.cz/cs/login)
2. Onboarding (prvýkrát)
3. Dashboard alebo homepage → **Přejít na Pro**
4. Stripe Checkout → platba kartou
5. Návrat na `/cs/dashboard?billing=success`
6. Stripe → Webhooks → posledný event = **200 OK**
7. V app: tarif Pro, neobmedzené limity

---

## Riešenie problémov

| Chyba | Príčina | Riešenie |
|-------|---------|----------|
| „Pro nákup se musíte přihlásit“ | Nie ste prihlásení | Login cez Google |
| „Platební systém není nakonfigurován“ | Chýbajú Price ID na Vercel | Doplňte `STRIPE_*_PRICE_ID`, redeploy |
| „Nepodařilo se vytvořit platební relaci“ | Zlý `STRIPE_SECRET_KEY` | Skontrolujte live kľúč |
| Platba OK, tarif sa nezmení | Webhook zlyhá | Skontrolujte URL, secret, eventy; Supabase `SUPABASE_SERVICE_ROLE_KEY` |
| Redirect na localhost | Zlý `NEXT_PUBLIC_APP_URL` | Nastavte `https://pravo365.cz`, redeploy |

---

## Tok platby (technicky)

```
Používateľ → POST /api/billing/checkout
          → Stripe Checkout (hosted)
          → Platba kartou
          → Stripe webhook → POST /api/billing/webhook
          → Supabase: subscriptions + user_preferences.subscription_tier
          → Používateľ má Pro/Tým
```

Správa predplatného: **Účet → Správa predplatného** → `POST /api/billing/portal` → Stripe Customer Portal.
