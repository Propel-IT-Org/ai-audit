# AIVIBLE — ai-audit

GEO (Generative Engine Optimization) tool for Japanese tourism SMEs. Audits AI visibility across ChatGPT / Gemini / Perplexity and generates optimized, foreigner-friendly storefronts.

**G-Incubate / G-Challenge startup project (Globis MBA). Pitch: Jun 25, 2026.**

---

## Getting started

**Prerequisites:** Node.js 20+, pnpm, a `.env.local` file (ask Ely for values).

```bash
git clone git@github.com:devrayat000/ai-audit.git
cd ai-audit
pnpm install
pnpm dev        # → http://localhost:3000
```

> Use **pnpm** for all install/run commands — not npm or yarn.

---

## Commands

```bash
pnpm dev          # Next.js dev server on :3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm tsc --noEmit # Type check (run from root)
pnpm dlx drizzle-kit generate   # Generate DB migration
pnpm dlx drizzle-kit migrate    # Apply migration
```

---

## Architecture

| Layer | What | Details |
|---|---|---|
| **Frontend** | Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui | `src/app/` |
| **Auth** | Better Auth + Google OAuth | `src/lib/auth.ts`, `src/lib/auth-client.ts` |
| **Database** | Drizzle ORM + Postgres | `src/lib/db/`, migrations in `drizzle/` |
| **Storage** | Vercel Blob | `src/lib/storage/` |
| **AI** | Anthropic Claude (`claude-sonnet-4-6`) | `src/lib/sites/ai-enrich.ts` |
| **Audit** | 6-check GEO audit via Workflow SDK (SSE) | `src/app/api/audit/` |

### Route groups

```
src/app/
├── (traveler)/       # Tourist-facing: FrontDoor, Plan, Itinerary, Explore, Discover, Stop
├── (sme)/            # Business-facing: Audit, Generate, Storefronts, Map
├── editor/[id]/      # Full-screen storefront chat editor
├── admin/            # Auth-gated pin + MDX upload (admin role only)
├── restaurants/[slug]/ # Runtime MDX restaurant detail pages
├── sites/[subdomain]/  # Published SME storefronts (publish-flow output)
└── api/              # All backend routes
```

### Key files

| File | What it does |
|---|---|
| `src/lib/db/schema/restaurant.ts` | Restaurant/pin schema (lat/lng, MDX body, audit score) |
| `src/lib/itineraries/generate.ts` | Claude-powered itinerary generator |
| `src/lib/itineraries/actions.ts` | Server actions: `planItineraryAction`, `customizeItineraryAction` |
| `src/lib/sites/ai-enrich.ts` | Claude client + JSON parsing used across the app |
| `src/components/map/GoogleMap.tsx` | Shared Google Maps kit (`@vis.gl/react-google-maps`) |
| `src/app/globals.css` | Design tokens (Japan Blue Index palette) |
| `PLAN.md` | Detailed implementation plan for all batches |

---

## Design system

**Japan Blue Index** brand — combines the Ukiyo-e wave logo mark, Shirube mascot, and score-as-brand gauge.

Full reference: [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md)

Live styleguide (mockup server): `http://159.223.83.208/styleguide.html`

### Quick token reference

```css
--kon:       #18243F   /* dark navy — primary text, deep UI */
--kon-2:     #223A70   /* mid navy — buttons, CTAs */
--wave:      #1F4788   /* Prussian blue — wave logo */
--gold:      #C8A859   /* gold — score arc, gem badges (use sparingly) */
--sun:       #D6452C   /* red — logo dot, map pins */
--paper:     #F5EEDC   /* washi cream — Shirube bg, illustration fills */
```

In `globals.css` these are registered as Tailwind v4 `@theme` tokens (`--color-kon`, `--color-kon2`, etc.) and as raw HSL vars for `hsl(var(--kon))` usage in component classes.

---

## Environment variables

```bash
# Auth
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Database
DATABASE_URL=

# AI
ANTHROPIC_API_KEY=

# Storage
BLOB_READ_WRITE_TOKEN=

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=   # optional — needed for AdvancedMarker
```

---

## Documentation

| Doc | What it covers |
|---|---|
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Brand identity, color tokens, typography, logo, Shirube mascot, illustration system, components, mockup inventory |
| [`PLAN.md`](PLAN.md) | Full implementation plan — all batches, architecture decisions, verification steps |

---

## Reference repo

`aivible-app` (private, Ely's org) is the design sandbox — HTML mockups, brand asset source files, and the `read-url` Supabase edge function proof of concept. It is **not** the active product build. This repo is.
