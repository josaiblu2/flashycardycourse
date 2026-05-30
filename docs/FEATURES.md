# Features — FlashyCardy

Implemented capabilities as of **2026-05-29**, verified against the codebase.

---

## Implemented features

### Core learning

| Feature | Description |
|---------|-------------|
| **Landing page** | Marketing page with product overview, how-it-works, Free vs Pro comparison |
| **User accounts** | Sign up / sign in via Clerk modals; redirect to dashboard after auth |
| **Dashboard** | List all user decks with creation date; deck count indicator for free users |
| **Deck management** | Create, rename, describe, and delete decks |
| **Manual cards** | Add, edit, and delete flashcards (front/back, length limits enforced) |
| **Study mode** | Flip cards, keyboard navigation (←/→/Space), shuffle, progress bar, session completion |

### Monetization & plans

| Feature | Description |
|---------|-------------|
| **Pricing page** | Clerk `<PricingTable />` at `/pricing` |
| **Plan badge** | Header shows Free or Pro based on Clerk plan |
| **Upgrade prompts** | Tooltips and CTAs link to pricing when features are locked |

### AI flashcards (Pro)

| Feature | Description |
|---------|-------------|
| **AI generation** | Generate 20 flashcards per request from deck title + description |
| **Generation options** | Language (11 presets + custom), level, format (Q&A, term/definition, translation) |
| **Duplicate avoidance** | Existing deck cards sent to model; server-side deduplication |
| **Quality pipeline** | Batch generation, review pass, sanitization, meta-commentary filtering |
| **Inline deck edit** | Update title/description in generation dialog before running AI |

### Demo protection & growth

| Feature | Description |
|---------|-------------|
| **AI usage limits** | Per-user daily/monthly and global monthly caps |
| **Pro waitlist** | Lead capture when limits are hit (interest, price sensitivity, source tracking) |
| **Waitlist admin** | Dashboard with totals, category/price breakdowns, recent signups |

### Administration

| Feature | Description |
|---------|-------------|
| **User admin panel** | List users, view deck counts, suspend, delete accounts |
| **Waitlist admin** | Analytics for waitlist leads (allowlisted admins only) |

---

## Free plan capabilities

Enforced server-side via Clerk feature `3_deck_limit` (plan `free_user`):

| Capability | Free |
|------------|------|
| Create decks | Up to **3** |
| Manual flashcards | Unlimited per deck |
| Study mode | Yes |
| AI generation | **No** |
| Pricing page access | Yes |

UI uses `<Show when={{ feature: "unlimited_decks" }}>` to swap create-deck vs upgrade button at limit.

---

## Pro plan capabilities

Granted via Clerk plan `pro` with features `unlimited_decks` and `ai_flashcard_generation`:

| Capability | Pro |
|------------|-----|
| Decks | **Unlimited** |
| Manual flashcards | Unlimited per deck |
| Study mode | Yes |
| AI generation | **Yes** (subject to demo usage limits below) |
| Header badge | "Pro" |

Server checks `has({ feature: "ai_flashcard_generation" })` before AI runs.

---

## Demo limitations

The app explicitly positions AI as a **demo** with consumption caps:

| Limit | Default | Behavior when reached |
|-------|---------|----------------------|
| AI runs per user per day | 3 | Error + waitlist prompt |
| AI runs per user per month | 20 | Error + waitlist prompt |
| AI runs globally per month | 100 | Error + waitlist prompt (all Pro users) |

Defaults are configurable via environment variables. Limit messages reference "demo version" and exhausted monthly credits.

Additional demo constraints:

- **20 cards** generated per AI request (fixed constant in `generate-cards.ts`)
- Usage is **reserved before** the OpenAI call and not rolled back on failure
- Model: **gpt-5-mini** (cost/latency tradeoff)

---

## Waitlist functionality

### When it appears

The waitlist form is shown when AI generation fails with:

- `USER_DAILY_LIMIT_REACHED`
- `USER_MONTHLY_LIMIT_REACHED`
- `GLOBAL_MONTHLY_LIMIT_REACHED`

Also available in the generation dialog when a limit error occurs.

### Data collected

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Pre-filled from Clerk profile |
| Email | Yes | Verified primary email from Clerk (read-only) |
| Interest category | No | languages, certifications, school, professional, other |
| Price expectation | Yes | under $10, $10–20, over $20, free only, not sure |
| Privacy acknowledgment | Yes | Explicit checkbox |
| Source | Auto | Which limit triggered signup |

### Duplicate handling

- One entry per Clerk user ID
- Email uniqueness enforced; orphan email records can be claimed on sign-up

### Admin visibility

`/admin/waitlist` shows total leads, breakdown by category and price expectation, and 50 most recent entries. Requires user ID in `ADMIN_CLERK_USER_IDS` (stricter than general admin metadata role).

---

## AI usage protection mechanisms

| Mechanism | Implementation |
|-----------|----------------|
| **Pro gating** | Clerk `has({ feature: "ai_flashcard_generation" })` in Server Action |
| **Usage reservation** | Transactional insert with conditional counts (`ai_generation_usage` table) |
| **Concurrency safety** | PostgreSQL advisory locks (per-user + global) |
| **Admin bypass** | `isAdminUser()` skips Pro check and all usage limits |
| **Deck prerequisites** | Title and description required before generation |
| **Input validation** | Zod schemas for deck ID and generation options |
| **Output validation** | Zod structured output + sanitize/dedupe pipeline |
| **OpenAI key guard** | Server-side check; clear error if missing |
| **Lead capture fallback** | Waitlist form converts limit friction into product feedback |

---

## Not implemented (see ROADMAP.md)

- Study progress persistence / spaced repetition
- Stripe or custom payment flows (Clerk Billing only)
- Product analytics dashboards
- Public API
- Email notifications for waitlist
- Card import/export
