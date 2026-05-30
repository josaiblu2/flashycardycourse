# Portfolio Summary — FlashyCardy

Executive summary for LinkedIn posts, portfolio websites, and resume project descriptions.

---

## One-liner

FlashyCardy is a full-stack SaaS flashcard platform where learners create decks, study with interactive cards, and generate content with AI — built to demonstrate production-grade auth, billing, database design, and AI integration.

---

## What the application does

FlashyCardy helps users master any subject through digital flashcards. After signing up, users create themed decks, add question-and-answer cards manually or generate 20 cards at a time with AI, and study using a flip-card interface with keyboard shortcuts and shuffle mode.

The product follows a freemium model: free users get up to three decks; Pro subscribers unlock unlimited decks and AI-powered card generation. A public demo mode protects AI costs with configurable usage limits and captures upgrade interest through a Pro waitlist when limits are reached.

---

## Why it was built

FlashyCardy was built as a **portfolio-grade SaaS application** to demonstrate end-to-end product engineering — not just UI, but authentication, subscription gating, PostgreSQL data modeling, server-side AI orchestration, usage limiting, admin tooling, and deployment practices used in real commercial products.

It solves the gap between tutorial projects and production systems by combining multiple services (Clerk, Neon, OpenAI, Vercel) into a cohesive, user-facing product with clear business logic.

---

## Technologies used

| Category | Stack |
|----------|-------|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Server Components, Server Actions, Zod validation |
| Auth & billing | Clerk (modals, sessions, Billing B2C, feature flags) |
| Database | Neon PostgreSQL, Drizzle ORM |
| AI | Vercel AI SDK, OpenAI gpt-5-mini, structured Zod output |
| Deployment | Vercel, environment-based configuration |
| Testing | Vitest (AI and admin utility tests) |

---

## Problems solved

1. **Secure multi-tenant data** — Users only access their own decks and cards; all queries scoped server-side via Clerk session.
2. **Freemium enforcement** — Deck limits and AI access gated with Clerk Billing features, enforced in Server Actions (not client-only checks).
3. **AI cost control** — Transactional usage tracking with PostgreSQL advisory locks prevents race conditions and runaway OpenAI spend on a public demo.
4. **Lead capture at friction points** — Waitlist forms appear when AI limits hit, collecting pricing sensitivity and interest data for future monetization.
5. **Admin operations** — Suspend, delete, and monitor users without a separate admin auth system (Clerk + env allowlist).
6. **AI quality** — Multi-step generation pipeline with batching, review pass, deduplication, and content sanitization.

---

## Skills demonstrated

- **Next.js App Router** — Server Components for reads, Client Components for interactivity
- **TypeScript** — End-to-end typed actions, schemas, and query helpers
- **Clerk Authentication** — Modal sign-in/up, session middleware, user management
- **Production Clerk Deployment** — Billing plans, feature flags, PricingTable
- **Vercel Deployment** — Standard Next.js production build and env management
- **Custom Domain Configuration** — Compatible architecture (Clerk + Vercel domains)
- **Drizzle ORM** — Schema design, typed queries, transactional patterns
- **Neon PostgreSQL** — Serverless Postgres with advisory locks for concurrency
- **OpenAI API Integration** — Structured generation via AI SDK
- **AI SDK** — `generateText` with `Output.object` and Zod schemas
- **Server Components** — Page-level data fetching without client waterfalls
- **Server Actions** — Typed mutations with validation and revalidation
- **Zod Validation** — Input schemas on every mutation
- **Role-Based Access Concepts** — Admin allowlist, Clerk metadata roles, feature gating
- **SaaS Architecture** — Freemium tiers, upgrade flows, entitlement helpers
- **Usage Limiting** — Per-user and global quotas with atomic reservation
- **Lead Capture / Waitlist** — Form, persistence, admin analytics
- **Environment Management** — Secrets, configurable limits, admin IDs
- **Production Deployment Practices** — Server-only modules, no exposed API keys

---

## Future commercialization roadmap

| Phase | Focus |
|-------|-------|
| **Now** | Public demo with Clerk Billing, AI limits, waitlist for demand validation |
| **Next** | Spaced repetition, study progress persistence, product analytics |
| **Growth** | Stripe or hardened Clerk Billing, email nurture from waitlist, raised AI quotas for paying users |
| **Scale** | Deck sharing, import/export, mobile PWA, premium AI features |

The waitlist and price-expectation data collected during demo limits provide a feedback loop for pricing and feature prioritization before full commercial launch.

---

## Suggested resume bullet

> Built FlashyCardy, a freemium flashcard SaaS with Next.js, Clerk auth/billing, Neon PostgreSQL, and OpenAI-powered card generation — implementing server-side entitlement checks, transactional AI usage limits, admin tooling, and a Pro waitlist for lead capture on a Vercel-deployed production demo.

---

## Suggested LinkedIn post (short)

I built **FlashyCardy** — a full-stack flashcard SaaS that goes beyond CRUD demos.

Users create decks, study with flip cards, and generate flashcards with AI on Pro. Under the hood: Clerk auth + billing, Neon Postgres with Drizzle, Server Actions with Zod, and OpenAI via the Vercel AI SDK — plus usage limits, a waitlist, and an admin panel for a real SaaS shape.

Stack: Next.js 16 · React 19 · TypeScript · Clerk · Neon · OpenAI

---

## Suggested LinkedIn post (long)

Most portfolio projects stop at a to-do app. I wanted to show what a **production-shaped SaaS** looks like.

**FlashyCardy** is a flashcard learning platform:
- Free tier: 3 decks, manual cards, full study mode
- Pro tier: unlimited decks + AI generation (20 cards per run)
- Public demo with smart AI caps so costs stay controlled
- Waitlist captures leads when users hit limits — with pricing feedback built in

Technical highlights:
- **Clerk** for auth, modal sign-in, and Billing feature flags
- **Neon + Drizzle** with transactional deck limits and AI usage reservation (PostgreSQL advisory locks)
- **Server Actions + Zod** — no client-trusted user IDs
- **OpenAI gpt-5-mini** with structured output, batching, review pass, and deduplication
- **Admin panel** for user suspend/delete and waitlist analytics

Deployed on **Vercel**. Dark UI with shadcn/ui.

If you're hiring for full-stack / SaaS / AI product work — this is the kind of system I build.

#NextJS #TypeScript #SaaS #Clerk #OpenAI #PostgreSQL #WebDevelopment
