# Architecture — FlashyCardy

Accurate snapshot of the application as implemented in the repository. Last reviewed: **2026-05-29**.

---

## 1. Product overview

**FlashyCardy** (package name: `flashycardycourse`) is a SaaS flashcard learning platform. Users create decks, add cards manually or with AI (Pro), and study with an interactive flip-card session. The app runs as a **public demo** with Clerk Billing for plan gating and configurable AI usage caps.

| Layer | Status |
|-------|--------|
| Landing page (`/`) | Implemented |
| Authentication (Clerk modals) | Implemented |
| Dashboard & deck CRUD | Implemented |
| Card CRUD | Implemented |
| Study mode | Implemented (client-side session, no persistence) |
| Clerk Billing / pricing | Implemented (`/pricing`) |
| AI flashcard generation | Implemented (Pro + admin bypass) |
| AI usage limits & waitlist | Implemented |
| Admin panel | Implemented (`/admin`, `/admin/waitlist`) |

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Browser (React 19)                              │
│  shadcn/ui · Client Components (dialogs, study, auth triggers)              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Vercel — Next.js 16 App Router                       │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │  proxy.ts   │  │ Server Components │  │ Server Actions ("use server")   │ │
│  │ clerkMiddle │  │ auth() + queries  │  │ Zod → auth → db/queries         │ │
│  │ ware        │  │ from db/queries/  │  │ revalidatePath                  │ │
│  └──────┬──────┘  └────────┬─────────┘  └───────────────┬─────────────────┘ │
│         │                  │                             │                   │
│         └──────────────────┴─────────────────────────────┘                   │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐              │
│         ▼                          ▼                          ▼              │
│  lib/ai/ (OpenAI)          lib/billing/              lib/admin/              │
│  lib/waitlist/             lib/cards/                  lib/generate-cards-*    │
└─────────┬──────────────────────────┬──────────────────────────┬──────────────┘
          │                          │                          │
          ▼                          ▼                          ▼
   OpenAI API                  Clerk API                 Neon PostgreSQL
   (gpt-5-mini)           (auth, billing, users)         (Drizzle ORM)
```

---

## 3. Technology stack

| Technology | Version | Role |
|------------|---------|------|
| Next.js | 16.x | App Router, RSC, Server Actions, `proxy.ts` |
| React | 19.x | UI |
| TypeScript | 5.x | Static typing |
| Tailwind CSS | 4.x | Styling (`globals.css` tokens) |
| shadcn/ui | 4.x (base-nova) | UI components only |
| Clerk | 7.x | Auth, billing features, user management |
| Drizzle ORM | 0.45.x | Database access |
| Neon | serverless driver | PostgreSQL hosting |
| Vercel AI SDK (`ai`) | 6.x | Structured OpenAI generation |
| OpenAI (`@ai-sdk/openai`) | 3.x | `gpt-5-mini` model |
| Zod | 4.x | Input validation in Server Actions |
| Vitest | 4.x | Unit tests for AI/admin helpers |

---

## 4. Repository structure

```
flashycardycourse/
├── app/
│   ├── layout.tsx              # Root layout, ClerkProvider, header
│   ├── page.tsx                # Landing (redirects signed-in → /dashboard)
│   ├── dashboard/page.tsx      # Deck list
│   ├── deck/[deckId]/
│   │   ├── page.tsx            # Deck detail + cards
│   │   └── study/page.tsx      # Study session
│   ├── pricing/page.tsx        # Clerk PricingTable
│   ├── admin/
│   │   ├── page.tsx            # User management
│   │   └── waitlist/page.tsx   # Waitlist analytics
│   └── actions/                # Server Actions
│       ├── decks.ts
│       ├── cards.ts
│       ├── delete-deck.ts
│       ├── generate-cards.ts
│       ├── waitlist.ts
│       └── admin.ts
├── components/                   # UI (shadcn + feature components)
├── db/
│   ├── schema.ts
│   ├── index.ts                # Neon + Drizzle client
│   └── queries/                # All DB reads/writes
├── lib/
│   ├── ai/                     # Generation, limits, prompts, validation
│   ├── admin/                  # Admin auth + Clerk user ops
│   ├── billing/                # Entitlement helpers
│   ├── cards/                  # Card field limits
│   └── waitlist/               # Schemas, privacy, status
├── proxy.ts                    # Clerk middleware (Next 16)
├── docs/                       # Project documentation
└── .cursor/rules/              # IDE conventions
```

**Import alias:** `@/*` → project root (`tsconfig.json`).

---

## 5. Frontend architecture

### Rendering model

- **Server Components** fetch data via `auth()` + `db/queries/` helpers. Used for pages: dashboard, deck detail, study (data load), admin, pricing shell.
- **Client Components** (`"use client"`) handle interactivity: dialogs, forms, study UI, auth modal triggers, AI generation dialog.
- **No Route Handlers** (`app/api/`) and **no client-side data fetching** for page-level reads.

### UI system

- All controls use **shadcn/ui** from `@/components/ui/*`.
- Clerk Sign In / Sign Up open in **modal** mode; triggers are shadcn `<Button>`.
- Dark theme fixed in root layout; Poppins via `next/font/google`.

### Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | RSC | Public | Landing; signed-in users redirect to `/dashboard` |
| `/dashboard` | RSC | Required | List decks, create deck, deck limit UI |
| `/deck/[deckId]` | RSC | Required | View/edit deck, cards, AI generate |
| `/deck/[deckId]/study` | RSC + client | Required | Flip-card study session |
| `/pricing` | RSC | Public | Clerk `<PricingTable />` |
| `/admin` | RSC | Clerk session + admin role | Suspend/delete users |
| `/admin/waitlist` | RSC | Allowlisted admin only | Waitlist lead dashboard |

---

## 6. Backend architecture

### Server Actions (mutations)

All writes go through Server Actions with this pattern:

1. Parse typed input with **Zod** (never `FormData`).
2. Call `auth()` for `userId` and optionally `has()` for billing features.
3. Delegate to **`db/queries/`** — no inline Drizzle in actions.
4. `revalidatePath()` affected routes.

| Action file | Operations |
|-------------|------------|
| `decks.ts` | Create, update deck |
| `delete-deck.ts` | Delete deck (cascade cards) |
| `cards.ts` | Create, update, delete card |
| `generate-cards.ts` | AI generation orchestration |
| `waitlist.ts` | Join Pro waitlist |
| `admin.ts` | Suspend, unsuspend, delete user |

### Data access layer

All Drizzle queries live in `db/queries/`:

| File | Responsibility |
|------|----------------|
| `decks.ts` | Deck CRUD, transactional deck-limit insert |
| `cards.ts` | Card CRUD scoped via deck ownership join |
| `ai-generation-usage.ts` | Usage reservation with advisory locks |
| `waitlist.ts` | Waitlist CRUD and aggregations |
| `admin-decks.ts` | Admin-only bulk deck delete, deck counts |

---

## 7. Authentication architecture

```
Request → proxy.ts (clerkMiddleware)
              │
              ├─ /admin* → auth.protect() (must be signed in)
              │
              └─ All routes → Clerk session attached

Page / Action → auth() from @clerk/nextjs/server
              │
              ├─ userId from session (never from client)
              ├─ has({ feature }) for billing entitlements
              └─ redirect("/") if unauthenticated on protected pages
```

### Clerk integration

| Piece | Location | Purpose |
|-------|----------|---------|
| Session middleware | `proxy.ts` | Runs on every matched request |
| Provider | `app/layout.tsx` | `ClerkProvider`, dark theme, post-auth redirect to `/dashboard` |
| Modal auth | `components/auth-buttons.tsx` | `SignInButton` / `SignUpButton` `mode="modal"` |
| Header | `components/header-auth.tsx` | Pricing link, auth buttons, Pro/Free badge, `UserButton` |
| Billing UI | `app/pricing/page.tsx` | `<PricingTable />` |

### Data isolation

- **Decks:** every query filters by `clerkUserId` from `auth()`.
- **Cards:** no `clerkUserId` column; ownership verified via `INNER JOIN decks` on `deckId` + user's `clerkUserId`.

---

## 8. Billing & entitlements architecture

Configured in the **Clerk Dashboard** (Clerk Billing B2C):

| Plan slug | Features |
|-----------|----------|
| `free_user` | `3_deck_limit` — max 3 decks |
| `pro` | `unlimited_decks`, `ai_flashcard_generation` |

Server enforcement in `lib/billing/entitlements.ts`:

- `hasUnlimitedDecks(has)` → skip 3-deck cap
- `hasAIFlashcardGeneration(has)` → allow AI (unless admin)
- Deck creation uses **transactional insert** with `pg_advisory_xact_lock` when limit applies

Client visibility via Clerk `<Show when={{ feature: ... }}>` and `<Show when={{ plan: "pro" }}>`.

**No Stripe integration** in the codebase — billing is Clerk-native.

---

## 9. AI generation architecture

```
User clicks "Generate cards with AI" (Pro or admin)
        │
        ▼
generateCardsWithAI (Server Action)
        │
        ├─ auth() + Zod validate deckId/options
        ├─ Verify deck ownership + title/description present
        ├─ Admin? → skip Pro check + usage limits
        ├─ Pro? → has({ feature: "ai_flashcard_generation" })
        ├─ reserveAiGenerationWithinLimits() → DB transaction
        │     (daily / monthly user / global monthly caps)
        │
        ▼
generateFlashcards() in lib/ai/
        │
        ├─ Model: openai("gpt-5-mini") via @ai-sdk/openai
        ├─ Structured output: Zod schema, 20 cards per run
        ├─ Batched generation (6 cards/batch), review pass
        ├─ Sanitize + dedupe against existing deck cards
        │
        ▼
createCardRecordsForDeck() → persist cards
        │
        └─ revalidatePath deck + study pages
```

### Generation options

Deck **name** = topic; **description** = scope. User selects language, level (beginner/intermediate/advanced), and format (Q&A, term/definition, translation).

### Usage limits (demo protection)

Defaults (overridable via env):

| Limit | Default | Env var |
|-------|---------|---------|
| Per user per day | 3 | `AI_USER_DAILY_LIMIT` |
| Per user per month | 20 | `AI_USER_MONTHLY_LIMIT` |
| Global per month | 100 | `AI_GLOBAL_MONTHLY_LIMIT` |

Reservation uses PostgreSQL advisory locks + conditional `INSERT` in a transaction (`db/queries/ai-generation-usage.ts`). Usage is **recorded before** the OpenAI call; failed persistence still consumes a credit.

---

## 10. Waitlist architecture

Triggered when a Pro user hits an AI usage limit. The UI shows `ProWaitlistForm` with:

- Name, verified email (from Clerk), optional interest category, required price expectation, privacy acknowledgment
- Source tag derived from limit type: `global_limit`, `user_daily_limit`, `user_monthly_limit`

Stored in `waitlist` table. Admin dashboard at `/admin/waitlist` (allowlisted IDs only) shows totals, breakdowns, and recent leads.

---

## 11. Admin architecture

### Authorization (two tiers)

| Check | Used for |
|-------|----------|
| `isAdminUser(userId)` | AI bypass, `/admin` page, admin Server Actions |
| `isAllowlistedAdmin(userId)` | `/admin/waitlist` page only |

`isAdminUser` returns true if:

1. User ID is in `ADMIN_CLERK_USER_IDS` (comma-separated env), **or**
2. Clerk `publicMetadata.role === "admin"`

### Admin capabilities

- List Clerk users (latest 100) with deck counts
- Suspend / unsuspend (Clerk ban)
- Delete user: remove decks from DB, then delete Clerk user
- View waitlist analytics

`proxy.ts` calls `auth.protect()` on `/admin*` routes (requires sign-in; role checked in page/action).

---

## 12. Database schema

PostgreSQL on **Neon**, accessed via `@neondatabase/serverless` + Drizzle.

```
decks
├── id              integer PK (identity)
├── clerkUserId     varchar(255) NOT NULL
├── name            varchar(255) NOT NULL
├── description     text
├── createdAt       timestamp
└── updatedAt       timestamp

cards
├── id              integer PK (identity)
├── deckId          integer FK → decks.id ON DELETE CASCADE
├── front           text NOT NULL
├── back            text NOT NULL
├── createdAt       timestamp
└── updatedAt       timestamp

ai_generation_usage
├── id              integer PK (identity)
├── clerkUserId     varchar(255) NOT NULL
├── deckId          integer FK → decks.id ON DELETE SET NULL
└── createdAt       timestamp

waitlist
├── id              integer PK (identity)
├── clerkUserId     varchar(255) UNIQUE (nullable)
├── name            varchar(255) NOT NULL
├── email           varchar(255) NOT NULL UNIQUE
├── interestCategory varchar(100)
├── priceExpectation varchar(50)
├── source          varchar(100) NOT NULL
└── createdAt       timestamp
```

Schema sync: `npm run db:push` (Drizzle Kit). No committed migration folder at time of review.

---

## 13. Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server only) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes (for AI) | OpenAI API key (server only) |
| `ADMIN_CLERK_USER_IDS` | No | Comma-separated Clerk user IDs for admin |
| `AI_USER_DAILY_LIMIT` | No | Default: 3 |
| `AI_USER_MONTHLY_LIMIT` | No | Default: 20 |
| `AI_GLOBAL_MONTHLY_LIMIT` | No | Default: 100 |

See `.env.example` for a starter template.

---

## 14. Production deployment architecture

```
GitHub repo → Vercel (build: next build)
                  │
                  ├─ Environment variables (Clerk, Neon, OpenAI, admin, AI limits)
                  ├─ Custom domain (optional, configured in Vercel + Clerk)
                  │
                  ├─ Clerk (hosted auth + billing)
                  └─ Neon (serverless Postgres, DATABASE_URL)
```

- **No `vercel.json`** — standard Next.js zero-config deployment.
- **No edge runtime** for DB; Neon HTTP driver runs on server.
- **`proxy.ts`** runs in Node.js (Next 16 proxy, not Edge middleware).
- Clerk Billing plans/features must match code expectations in the Clerk Dashboard.

---

## 15. Security considerations

| Area | Implementation |
|------|----------------|
| Authentication | Clerk session; no custom auth |
| Authorization | Server-side `auth()` on every protected page/action |
| Data isolation | All deck/card queries scoped to authenticated user |
| Input validation | Zod on all Server Actions |
| Secrets | `.env*` gitignored; no `NEXT_PUBLIC_*` for API keys |
| Admin | Env allowlist + optional Clerk metadata role; actions call `requireAdmin()` |
| AI cost control | Transactional usage caps before OpenAI calls |
| Admin waitlist | Stricter allowlist-only gate (not metadata role alone) |
| Waitlist PII | Name + verified email stored; privacy notice required |

---

## 16. Current limitations

- **Study progress** is not persisted; sessions are in-memory only.
- **No spaced repetition** or scheduling algorithms.
- **No REST API** or mobile clients.
- **Clerk user list** in admin capped at 100 users per page.
- **AI usage** is consumed even if card persistence partially fails.
- **Billing** depends on Clerk Billing beta; no direct Stripe integration.
- **No analytics** (product usage, funnel, etc.) beyond waitlist admin views.
- **No automated tests** for Server Actions or integration flows (unit tests exist for AI/admin helpers only).
- **Deck/card `updatedAt`** on decks is not auto-updated when cards change.

---

## 17. Document maintenance

Update this file when adding routes, dependencies, schema changes, env vars, or auth/billing behavior.

### Changelog

| Date | Change |
|------|--------|
| 2026-05-19 | Initial doc (landing + auth only) |
| 2026-05-29 | Full rewrite reflecting decks, cards, study, AI, billing, waitlist, admin |
