# Roadmap — FlashyCardy

Current state and planned direction. Based on codebase gaps and product positioning as a **portfolio SaaS demo** with commercialization potential.

---

## Current state (2026-05-29)

FlashyCardy is a **fully functional MVP** deployed as a public demo:

| Area | Status |
|------|--------|
| Auth & user isolation | Production-ready (Clerk) |
| Deck & card CRUD | Complete |
| Study mode | Complete (session-only) |
| Clerk Billing (Free / Pro) | Integrated |
| AI generation | Complete with demo limits |
| Waitlist / lead capture | Complete |
| Admin panel | Basic (users + waitlist) |
| Tests | Unit tests for AI/admin helpers only |
| Stripe | Not started |
| Analytics | Not started |

The app successfully demonstrates a **full-stack SaaS architecture**: auth, billing features, Postgres, AI, usage limiting, and admin tooling.

---

## Planned improvements

### Learning experience

| Item | Priority | Notes |
|------|----------|-------|
| Persist study progress | High | Track cards reviewed, correctness, last studied |
| Spaced repetition (SM-2 or similar) | High | Core differentiator for flashcard apps |
| Deck sharing (read-only links) | Medium | Viral growth; requires public route + auth model |
| Card import/export (CSV, Anki) | Medium | Migration path for power users |
| Deck templates | Low | Pre-built starter decks by category |

### Product polish

| Item | Priority | Notes |
|------|----------|-------|
| Dashboard link in header | Low | Signed-in users rely on redirect from `/` |
| Deck `updatedAt` on card changes | Low | Currently deck timestamp not bumped on card edits |
| AI usage rollback on total failure | Medium | Today usage is consumed even if zero cards save |
| Usage quota display for Pro users | Medium | Show remaining daily/monthly AI runs |
| Light theme toggle | Low | Currently dark-only |

### Technical debt

| Item | Priority | Notes |
|------|----------|-------|
| Drizzle migrations in repo | Medium | Currently `db:push` only |
| Integration tests for Server Actions | Medium | Auth + billing + limits |
| Error monitoring (Sentry, etc.) | High for production | Not present |
| Rate limiting on non-AI actions | Low | Deck/card mutations unthrottled |

---

## Stripe integration

**Status: Not implemented.** All billing flows use **Clerk Billing B2C** with `<PricingTable />`.

### Future options

| Approach | Tradeoffs |
|----------|-----------|
| Stay on Clerk Billing | Simplest; beta API, less control over invoices/tax |
| Clerk + Stripe (Clerk's Stripe connector) | Unified auth + Stripe as payment processor |
| Direct Stripe Checkout | Full control; must sync subscription state to Clerk metadata or local DB |

### Recommended path

1. Evaluate Clerk Billing stability for production revenue targets.
2. If migrating: add Stripe webhooks → update Clerk `publicMetadata` or a `subscriptions` table.
3. Keep **server-side feature checks** (`has({ feature })`) as the enforcement layer regardless of payment provider.

---

## Production billing

| Milestone | Description |
|-----------|-------------|
| Clerk plan pricing finalized | Align Free/Pro pricing with waitlist price sensitivity data |
| Remove or raise demo AI caps | Replace global monthly cap with plan-based quotas |
| Billing webhooks | Handle subscription created/canceled → feature access |
| Grace period handling | Downgrade Pro → enforce 3-deck limit without data loss |
| Invoice & tax | Stripe Tax or merchant of record if leaving Clerk Billing |

---

## Analytics

**Status: Not implemented.**

| Capability | Purpose |
|------------|---------|
| Product analytics (Posthog, Mixpanel, Vercel Analytics) | Funnel: sign-up → deck → study → AI → upgrade |
| AI usage dashboard | Cost per user, model latency, failure rates |
| Waitlist conversion | Limit source → waitlist → eventual Pro |
| Admin metrics | DAU, decks created, cards studied |

Waitlist admin (`/admin/waitlist`) is the only lead analytics surface today.

---

## Lead management

**Partially implemented** via waitlist.

| Next step | Description |
|-----------|-------------|
| Export waitlist (CSV) | Admin download for email campaigns |
| CRM integration | HubSpot, Loops, or Resend audience sync |
| Automated nurture emails | "AI limits expanded" when caps increase |
| Segment by interest/price | Targeted launch messaging |
| Waitlist → Pro invite flow | Early access codes or discounted first month |

---

## Admin dashboard

**Basic version exists.** Expansion ideas:

| Feature | Description |
|---------|-------------|
| AI usage overview | Global/monthly consumption vs limits |
| User search & pagination | Beyond 100-user Clerk list cap |
| Grant Pro manually | Override for beta testers |
| Feature flags | Toggle AI limits without redeploy |
| Audit log | Admin actions (suspend, delete) |
| Content moderation | Flag/report decks (if sharing added) |

Note: `/admin/waitlist` currently requires **allowlisted** IDs only, while `/admin` also accepts Clerk `publicMetadata.role === "admin"`. Consider unifying policy.

---

## Future AI enhancements

| Enhancement | Description |
|-------------|-------------|
| User-specified card count | Today fixed at 20 per generation |
| Generate from URL/PDF upload | Expand input sources beyond deck description |
| Regenerate single card | Replace one card without full batch |
| Multi-model support | Cheaper model for drafts, premium for review |
| Streaming UI | Show cards as they generate |
| Image/occlusion cards | Visual flashcards for anatomy, maps, etc. |
| Language detection | Auto language from deck content |
| AI study coach | Suggest weak areas based on study performance (needs progress tracking) |

---

## Commercialization roadmap (summary)

```
Phase 1 (current)     Public demo + waitlist + Clerk Billing
        │
Phase 2               Raise AI limits, add analytics, error monitoring
        │
Phase 3               Spaced repetition + progress (retention)
        │
Phase 4               Production billing (Stripe if needed), email nurture
        │
Phase 5               Sharing, import/export, mobile PWA
```

Prioritize **retention features** (spaced repetition) and **production ops** (monitoring, billing hardening) before major growth features.
