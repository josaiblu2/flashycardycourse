# FlashyCardy — Architecture Brief

**Rev 2026-05-29** · One-page reference · MVP complete

Freemium flashcard SaaS: create decks, study with flip cards, generate content with AI on Pro. Deployed as a public demo on Vercel with Clerk auth/billing, Neon Postgres, and OpenAI.

| Metric | Value |
|--------|-------|
| App routes | 7 |
| DB tables | 4 |
| Server Actions | 6 |
| AI cards per run | 20 |

---

## System topology

```
Browser (React 19 · shadcn/ui)
        │ HTTPS
        ▼
Vercel — Next.js 16 (proxy.ts · RSC · Server Actions)
        │
        ├── lib/ai/          → OpenAI (gpt-5-mini)
        ├── lib/billing/     → Clerk (auth · billing features)
        ├── lib/admin/       → Clerk (user management)
        └── db/queries/      → Neon PostgreSQL (Drizzle ORM)
```

---

## Core patterns

| Layer | Rule |
|-------|------|
| Reads | Server Components call `db/queries/` helpers |
| Writes | Server Actions + Zod validation → `db/queries/` |
| Auth | `auth()` server-side; never trust client-supplied user IDs |
| Cards | Ownership verified via deck join on every query |
| UI | shadcn/ui only; Clerk Sign In/Up in modal mode |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing; signed-in users → `/dashboard` |
| `/dashboard` | Deck list and creation |
| `/deck/[id]` | Card CRUD, AI generation |
| `/deck/[id]/study` | Flip-card session (not persisted) |
| `/pricing` | Clerk `<PricingTable />` |
| `/admin` | Suspend / delete users |
| `/admin/waitlist` | Lead analytics (allowlist only) |

---

## Plans & entitlements

| Tier | Decks | AI | Enforcement |
|------|-------|-----|-------------|
| Free (`free_user`) | Max 3 | No | `3_deck_limit` feature + transactional insert |
| Pro | Unlimited | Yes (demo caps) | `unlimited_decks`, `ai_flashcard_generation` |
| Admin | Unlimited | Bypass all limits | `ADMIN_CLERK_USER_IDS` or Clerk `role=admin` |

Billing: **Clerk Billing B2C** — no Stripe in codebase.

---

## AI generation pipeline

1. **Gate** — Pro feature check or admin bypass
2. **Reserve** — Insert into `ai_generation_usage` with PostgreSQL advisory locks
3. **Generate** — `gpt-5-mini`, batches of 6, review pass, deduplication
4. **Persist** — `createCardRecordsForDeck` → `revalidatePath`
5. **Limit hit** — Waitlist form (interest category + price expectation)

**Demo limits (defaults):** 3/day per user · 20/month per user · 100/month global

---

## Database schema

| Table | Key columns | Notes |
|-------|-------------|-------|
| `decks` | `clerkUserId`, `name`, `description` | User-scoped |
| `cards` | `deckId` → `decks.id` | CASCADE delete |
| `ai_generation_usage` | `clerkUserId`, `deckId`, `createdAt` | Reserved before OpenAI call |
| `waitlist` | `email`, `source`, `priceExpectation` | Lead capture on limit errors |

---

## Environment variables

**Required:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `OPENAI_API_KEY`

**Optional:** `ADMIN_CLERK_USER_IDS`, `AI_USER_DAILY_LIMIT` (3), `AI_USER_MONTHLY_LIMIT` (20), `AI_GLOBAL_MONTHLY_LIMIT` (100)

---

## Security & limitations

- All authorization server-side; deck/card queries scoped to session `userId`
- Admin waitlist page requires env allowlist (stricter than general admin)
- AI usage consumed before generation; not rolled back on persistence failure
- Study progress not persisted; no spaced repetition yet

---

**Stack:** Next.js 16 · React 19 · TypeScript · Clerk 7 · Drizzle · Neon · Vercel AI SDK · Vercel

**Full docs:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [FEATURES.md](./FEATURES.md) · [ROADMAP.md](./ROADMAP.md)
