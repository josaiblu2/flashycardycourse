# FlashyCardy

A freemium flashcard learning platform built as a production-shaped SaaS demo. Create decks, study with interactive cards, and generate flashcards with AI on Pro — with Clerk auth, Neon Postgres, and OpenAI integration.

## Problem statement

Learners need a simple way to create, organize, and review flashcards across subjects — but building a trustworthy study tool requires more than a CRUD app: secure accounts, plan-based limits, cost-controlled AI, and infrastructure that scales from demo to commercial product.

## Solution

FlashyCardy delivers a focused flashcard workflow (create deck → add cards → study) wrapped in a SaaS architecture. Free users get three decks and manual cards; Pro users unlock unlimited decks and AI generation. Demo-mode AI limits protect costs, and a waitlist captures upgrade interest when limits are hit.

## Key features

- **Deck & card management** — Create, edit, and delete decks and flashcards
- **Study mode** — Flip cards, shuffle, keyboard navigation, progress tracking
- **AI generation (Pro)** — 20 flashcards per run with language, level, and format options
- **Freemium billing** — Clerk Billing with Free and Pro plans
- **Usage limits** — Configurable daily/monthly AI caps for demo protection
- **Pro waitlist** — Lead capture with interest and pricing feedback
- **Admin panel** — User management and waitlist analytics

## Technology stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Server Components, Server Actions, Zod |
| Auth & billing | Clerk 7 (modals, Billing B2C, feature flags) |
| Database | Neon PostgreSQL, Drizzle ORM |
| AI | Vercel AI SDK, OpenAI (`gpt-5-mini`) |
| Deployment | Vercel |
| Testing | Vitest |

## Architecture summary

```
Browser → Next.js (RSC + Server Actions) → Neon Postgres
                    ↓
              Clerk (auth/billing) + OpenAI (AI generation)
```

- All database access goes through `db/queries/` helpers
- Mutations use Server Actions with Zod validation
- Authorization is server-side via `auth()` — never client-supplied user IDs
- Clerk Billing features gate deck limits and AI access
- AI usage is reserved transactionally before OpenAI calls

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full architecture reference.

## Screenshots

<!-- Add screenshots of the landing page, dashboard, deck view, study mode, and AI generation dialog -->

| Screen | Description |
|--------|-------------|
| Landing | Hero, features, Free vs Pro |
| Dashboard | Deck grid with limit indicator |
| Deck detail | Cards list + AI generate button |
| Study mode | Flip-card session with progress |
| Pricing | Clerk PricingTable |

## Deployment

The app is designed for **Vercel** deployment:

1. Connect the GitHub repository to Vercel
2. Set environment variables in the Vercel project settings
3. Configure Clerk allowed origins and redirect URLs for your domain
4. Point `DATABASE_URL` to a Neon PostgreSQL database
5. Deploy — build command: `next build`

Clerk Billing plans (`free_user`, `pro`) and features (`3_deck_limit`, `unlimited_decks`, `ai_flashcard_generation`) must be configured in the [Clerk Dashboard](https://dashboard.clerk.com).

## Local development setup

### Prerequisites

- Node.js 20+
- Clerk application ([dashboard.clerk.com](https://dashboard.clerk.com))
- Neon PostgreSQL database ([neon.tech](https://neon.tech))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### Steps

```bash
git clone <repository-url>
cd flashycardycourse
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run db:push   # sync schema to Neon
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Drizzle Studio GUI |

## Environment variables required

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key (for AI generation) |
| `ADMIN_CLERK_USER_IDS` | No | Comma-separated Clerk user IDs for admin access |
| `AI_USER_DAILY_LIMIT` | No | Pro AI runs per user per day (default: 3) |
| `AI_USER_MONTHLY_LIMIT` | No | Pro AI runs per user per month (default: 20) |
| `AI_GLOBAL_MONTHLY_LIMIT` | No | Total AI runs per month (default: 100) |

## Project structure

```
app/              Routes and Server Actions
components/       UI components (shadcn + feature)
db/               Schema, client, query helpers
lib/              AI, billing, admin, waitlist utilities
docs/             Architecture, features, roadmap, portfolio summary
proxy.ts          Clerk session middleware (Next.js 16)
```

## Security considerations

- Clerk handles authentication; sessions validated on every protected request
- All deck and card queries scoped to the authenticated user's `clerkUserId`
- Server Actions validate input with Zod; no raw `FormData`
- API keys (`CLERK_SECRET_KEY`, `OPENAI_API_KEY`, `DATABASE_URL`) are server-only
- Admin actions require `requireAdmin()`; AI bypass limited to configured admins
- AI usage limits prevent unbounded OpenAI spend on public demos

## Current status

**MVP complete and demo-ready.** Core flows (auth, decks, cards, study, billing UI, AI generation, waitlist, admin) are implemented. Study progress is not persisted; billing uses Clerk Billing (no Stripe); AI runs under demo usage caps.

| Document | Content |
|----------|---------|
| [Architecture](./docs/ARCHITECTURE.md) | Technical architecture and flows |
| [Features](./docs/FEATURES.md) | Implemented features and plan capabilities |
| [Roadmap](./docs/ROADMAP.md) | Planned improvements |
| [Portfolio summary](./docs/PORTFOLIO_SUMMARY.md) | Executive summary for resumes and LinkedIn |

## Portfolio skills demonstrated

This project demonstrates proficiency with:

- Next.js App Router
- TypeScript
- Clerk Authentication
- Production Clerk Deployment
- Vercel Deployment
- Custom Domain Configuration
- Drizzle ORM
- Neon PostgreSQL
- OpenAI API Integration
- AI SDK
- Server Components
- Server Actions
- Zod Validation
- Role-Based Access Concepts
- SaaS Architecture
- Usage Limiting
- Lead Capture / Waitlist
- Environment Management
- Production Deployment Practices

## License

Private project — see repository settings for license terms.
