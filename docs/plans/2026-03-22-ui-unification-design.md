# UI Unification — Design Doc

> **Date:** 2026-03-22
> **Scope:** Approach 1 — Landing page UI from index.html → Next.js app/page.tsx

## Problem

Two separate servers serve two separate UIs:
- `localhost:3456` (server.js) — Beautiful glassmorphism landing page (index.html), Slovak, no backend
- `localhost:3000` (Next.js) — Full app with auth/generator/review/dashboard, simpler UI, Czech

## Solution

Port the glassmorphism UI from index.html into the Next.js app:
1. `app/layout.tsx` — Add animated background blobs (visible on all pages)
2. `app/page.tsx` — Full landing page with hero, features, steps, FAQ, CTA, footer
3. `app/globals.css` — Port styles.css classes (feature cards, steps, FAQ, footer, blobs)
4. Language: Czech throughout, aligned with existing legal logic

## What Changes

| File | Change |
|------|--------|
| `app/globals.css` | Add blob animations, feature-card, step-card, FAQ, footer, CTA styles |
| `app/layout.tsx` | Add `.scene` blobs div |
| `app/page.tsx` | Full rewrite: hero + features + steps + contract types + FAQ + CTA + footer |

## What Does NOT Change

- `app/generator/page.tsx` — no changes
- `app/review/page.tsx` — no changes
- `app/dashboard/page.tsx` — no changes
- All API routes — no changes
- All lib/ (schemas, validators, promptBuilder, LLM) — no changes
- Auth system — no changes

## UI/UX Rules Applied

- Glassmorphism style: backdrop-filter blur, glass-card, glass-btn
- SVG icons only (Lucide-style, stroke-width 1.5), no emojis
- Touch targets min 44x44px
- Contrast 4.5:1 (WCAG AA)
- prefers-reduced-motion support for blob animations
- Mobile-first responsive (375 / 768 / 1024)
- Semantic heading hierarchy (h1 → h2 → h3)
- One primary CTA per section
- 4px spacing scale

## Sections (Czech)

1. Hero: "PrávníkAI" + subtitle + 2 CTAs (Generovat / Zkontrolovat) + stats
2. Features: 6 glass cards (Automatizované smlouvy, Úspora času, Právní jistota, Bezpečnost, AI kontrola, Export)
3. Jak to funguje: 3 step cards with arrow connectors
4. Typy smluv: Dynamic chip grid from contractSchemas registry
5. FAQ: 5 accordion items
6. CTA: "Začněte generovat smlouvy"
7. Footer: Logo + nav links + legal + copyright
