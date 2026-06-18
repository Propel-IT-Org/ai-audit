# Frontend Replacement (aivible) + Map/Pins/MDX/Admin

## Context

The main app (`ai-audit`, Next.js 16.2.4 App Router) currently has a thin, utilitarian frontend (audit form, results, publish wizard, templates). The `aivible/` subfolder is the original, fully-designed product — a Vite + React Router SPA on Supabase with two journeys (Traveler + SME), a polished design system, i18n (EN/JA), and a working Leaflet map.

This update replaces the current frontend by porting **all** of aivible's UI into the main Next.js project and rewiring it from Supabase to our backend (Better Auth + Drizzle/Postgres + Vercel Blob + Workflow SDK). On top of that, we add the requested new features:

1. **Map with pins** — each pin shows a preview (name, address, AI overview); click opens a full restaurant page.
2. **Restaurant pages from admin-uploaded MDX** — rendered at runtime.
3. **Admin upload** — an auth-gated form to create pins + upload MDX.

Decisions confirmed with user:

- **Scope:** full replicate both journeys.
- **Pin storage:** new Postgres table via Drizzle, **rich** (aivible-`businesses`-compatible) shape.
- **Admin:** simple auth-gated upload form, gated by the **better-auth admin plugin** (role-based).
- **Package manager:** **pnpm** for all install/run commands (not npm).
- **MDX:** runtime compile via `next-mdx-remote/rsc` (admin uploads, no rebuild).
- **No-backend aivible features** (Plan/Discover/Editor): port UI, stub backend ("coming soon" / placeholder) until built.

---

## Architecture: SPA → App Router

aivible is client-heavy (BrowserRouter, TanStack Query, React Context). Port pragmatically: keep page bodies as **client components**, convert routing to file-based, and swap the platform glue:

| aivible (Vite/RR) | Main project (Next.js) |
|---|---|
| `react-router-dom` `Routes`/`Route` | file-based routes under `src/app/` |
| `useParams` / `useNavigate` / `Link` / `NavLink` | `next/navigation` (`useParams`,`useRouter`,`usePathname`) + `next/link` |
| `BrowserRouter` in `App.tsx` | route-group layouts |
| `import.meta.env.VITE_*` | `process.env.NEXT_PUBLIC_*` |
| Supabase auth (`AuthContext`) | `better-auth` client (`src/lib/auth-client.ts`: `useSession`/`signIn`/`signOut`) |
| `supabase.functions.invoke()` / `.from()` | `fetch('/api/...')` to our routes + Drizzle queries |
| Leaflet imported directly | Leaflet via `dynamic(import, { ssr:false })` + `'use client'` |

**Route groups** (mirror aivible's two shells):

- `src/app/(traveler)/layout.tsx` ← `TravelerLayout` (TopNav + BottomNav)
- `src/app/(sme)/layout.tsx` ← `SmeLayout` (TopNav only)
- `src/app/editor/[id]/page.tsx` — full-screen, no group layout

**Route map** (aivible → Next):

- `/` FrontDoor → `(traveler)/page.tsx` (replaces current landing `src/app/page.tsx`)
- `/plan`, `/explore`, `/discover`, `/stop/[id]` → under `(traveler)/`
- `/business` (audit), `/generate`, `/storefronts`, `/storefront/[id]`, `/map` → under `(sme)/`
- `/editor/[id]`, `/auth/callback` → top-level
- `/restaurants/[slug]` → **new** MDX restaurant detail page (full page opened from map pin)

**Keep** existing backend-output routes: `src/app/sites/[subdomain]/**` (published restaurant sites — this is publish-flow output, not frontend chrome) and all of `src/app/api/**`.
**Replace/remove** superseded current pages: `src/app/page.tsx`, `results/`, `customize/`, `templates/`, `preview/`, `upgrade/`, `signup/`, and the `src/components/*` audit/publish UI that aivible's equivalents supersede (verify no `/api` route imports them before deleting).

**Root providers:** create `src/app/providers.tsx` (`'use client'`) wrapping `QueryClientProvider` + `LanguageProvider` + `TooltipProvider` + `Toaster`/`Sonner`; mount in `src/app/layout.tsx`. Port `LanguageContext` + `src/locales/{en,ja}.ts` as-is (work fine in client components).

---

## Dependencies to add

Install with **pnpm** (use `pnpm` for every command in this plan — `pnpm add`, `pnpm dlx drizzle-kit ...`, `pnpm dev`, `pnpm build`):

```
pnpm add leaflet react-leaflet @tanstack/react-query next-mdx-remote sonner
pnpm add -D @types/leaflet
```

`next-mdx-remote` → `/rsc` runtime MDX. `sonner` → toasts (aivible uses it). better-auth admin plugin is already in the installed `better-auth` package — no new dep.
Drop Supabase deps from ported code (do not install `@supabase/supabase-js`). Import `leaflet/dist/leaflet.css` (and aivible's pin CSS) in the map components/`globals.css`.

Merge aivible's design tokens: port `aivible/src/index.css` HSL variables + component classes (`.av-eyebrow`, `.score-ring`, `.hero-map`) and `tailwind.config.ts` (fonts/colors) into the main project's `src/app/globals.css` / Tailwind v4 config. Reconcile with existing shadcn tokens — aivible's set is the new source of truth for the replaced UI. Copy `aivible/src/assets/illustrations/*` and needed `public/` assets into the main project's `public/`.

shadcn components: copy any aivible `src/components/ui/*` not already present in `src/components/ui/` (aivible has 40+; main has ~7). Reconcile import paths (`@/` alias already matches).

---

## Data layer: restaurant/pins table

New Drizzle schema file `src/lib/db/schema/restaurant.ts` (rich, aivible-compatible). Columns:

- `id` (text pk), `slug` (text unique — drives `/restaurants/[slug]`)
- `nameEn`, `nameJp`, `address`
- `aiOverview` (text — shown in pin preview), `shortEn`, `shortJp`
- `category`, `subcategory`, `area`, `prefecture`, `region`, `price`
- `lat`, `lng` (`doublePrecision`)
- `imageUrl`, `imageEmoji`, `websiteUrl`, `hiddenGem` (boolean)
- `auditScore` (integer), `auditGrade` (text)
- `mdxBody` (text — uploaded MDX content)
- `publishedSubdomain` (text, nullable — link to publish-flow site)
- `createdAt`, `updatedAt`

Wiring:

- Update `drizzle.config.ts` to include the new schema (point at a schema dir/glob, keep `auth-schema.ts`).
- Update `src/lib/db.ts` to import the new schema into the drizzle `schema` object.
- Generate migration: `pnpm dlx drizzle-kit generate` → new file in `drizzle/`; apply with `pnpm dlx drizzle-kit migrate` (or `push`). Combine with the auth-schema admin-plugin fields in one migration run.
- Query module `src/lib/restaurants/queries.ts` — Drizzle replacement for `aivible/src/lib/api/businesses.ts`: `listRestaurants(opts)`, `getRestaurant(slug)`, `getRestaurantsForMap()` (rows with non-null lat/lng).
- API route `src/app/api/restaurants/route.ts` (GET list, with filters) + `src/app/api/restaurants/[slug]/route.ts` (GET one) so client components / React Query can fetch. Rewrite `aivible/src/lib/api/businesses.ts` to `fetch('/api/restaurants...')` instead of Supabase.

---

## Map feature (the headline)

- Port `aivible/src/components/map/markers.ts` as-is (pure Leaflet `divIcon` factories — gem/numbered/osm pins).
- Port `BusinessesDirectory` (`/explore`) and `ItineraryMap` map component; wrap Leaflet in `dynamic(() => import(...), { ssr:false })` inside a `'use client'` boundary (Leaflet touches `window`).
- Pin **preview popup** renders name + address + `aiOverview` (the user's spec); a "View" action links to `/restaurants/[slug]`.
- Map data from `getRestaurantsForMap()` via `/api/restaurants`.
- `/map` (SME) and `/explore` (traveler) both consume the same data layer.

---

## MDX restaurant pages (runtime)

- `src/app/restaurants/[slug]/page.tsx` — **server component**. `await params`, `getRestaurant(slug)`; 404 via `notFound()` if missing.
- Render with `next-mdx-remote/rsc`: `<MDXRemote source={row.mdxBody} components={mdxComponents} />`.
- `src/components/mdx-components.tsx` — map MDX elements to styled/shadcn components (`h1..h3`, `p`, `a`→`next/link`, `img`→`next/image`, `ul/ol`, `blockquote`, code). Also surface the structured fields (name/address/AI overview/map mini-pin) around the MDX body in the page shell.
- Add `remotePatterns` to `next.config.ts` for any external image hosts used in MDX. No `pageExtensions`/`@next/mdx` change needed (runtime, not file-based MDX).

---

## Admin (better-auth admin plugin)

Use the **better-auth admin plugin** for role-based gating (not an email allowlist).

- **Server** (`src/lib/auth.ts`): add `admin()` to the `betterAuth({ plugins: [...] })` list. The plugin adds fields to the user table (`role`, `banned`, `banReason`, `banExpires`) and session (`impersonatedBy`) — these must be reflected in `src/lib/auth-schema.ts` and migrated (see below). Optionally set `adminRoles`/`defaultRole` or seed specific admin user IDs in the plugin config.
- **Client** (`src/lib/auth-client.ts`): add `adminClient()` to `createAuthClient` plugins.
- **Gate** `src/app/admin/page.tsx` (server component): `auth.api.getSession()` → check `session.user.role === "admin"` (or `auth.api.userHasPermission`); redirect non-admins. Add a `requireAdmin()` helper in `src/lib/auth.ts`.
- Client form: lat, lng, name(EN/JP), address, AI overview, category/prefecture/etc., + `.mdx` file input (read as text). Submits JSON/multipart to:
- `src/app/api/admin/restaurants/route.ts` (POST) — re-check admin server-side via `requireAdmin()`, validate with `zod`, insert/update row (`mdxBody` ← uploaded file text, generate `slug`). Optional: push images to Vercel Blob (reuse `src/lib/storage/blob.ts`).
- **Granting admin:** set a user's `role` to `admin` (DB update / seed, or `authClient.admin.setRole`). Document one bootstrap admin.

### Auth schema migration (admin plugin fields)

Add to `src/lib/auth-schema.ts`: `user.role` (text), `user.banned` (boolean), `user.banReason` (text), `user.banExpires` (timestamp); `session.impersonatedBy` (text). Generate + apply via `pnpm dlx drizzle-kit generate` / `migrate` (same run as the restaurant table migration).

---

## Backend rewiring of ported journeys

- **Audit** (`/business`): aivible `runAudit()` expects one JSON response; our `/api/audit` streams SSE via Workflow SDK. Adapter — reuse the existing SSE-consumption pattern in `src/components/audit-loading.tsx` / `landing-content.tsx`, feeding aivible's `AuditResults`/`AuditLoading` UI. Map our `AuditReport` (`src/lib/types.ts`) → aivible's `AuditResult` shape, or adapt the UI to our shape.
- **Storefronts** (`/storefronts`, `/storefront/[id]`): map to publish flow — `GET /api/publish/site` (Blob `PublishedSite`). `generate` → `POST /api/publish/start`.
- **Editor** (`/editor/[id]`), **Plan** (`/plan`), **Discover** (`/discover`): port UI, stub data with a "coming soon" state (port `aivible/src/pages/ComingSoon.tsx`). Flag as follow-up backend work.
- **Auth**: replace `AuthContext` + `/auth/callback` with Better Auth Google (already configured in `src/lib/auth.ts`/`auth-client.ts`). aivible `useAuth()` → `useSession()`.

---

## Suggested execution order

1. **Foundation** — add deps; port design tokens/Tailwind/shadcn ui; `providers.tsx` + root layout; LanguageContext + locales; route-group layouts (TravelerLayout/SmeLayout) + TopNav/BottomNav; brand components.
2. **Data layer** — restaurant Drizzle schema + migration; queries + `/api/restaurants`; admin gate + `/admin` + `/api/admin/restaurants`.
3. **Map + MDX (new features)** — markers, Explore/Map pages, pin preview; `/restaurants/[slug]` MDX page + `mdx-components`. *(Deliver/verify here — this is the core ask.)*
4. **Port journeys** — FrontDoor/landing, audit (wire to `/api/audit`), storefronts (wire to publish), Stop/Itinerary; stub Plan/Discover/Editor.
5. **Cleanup** — remove superseded current pages/components once replacements verified.

---

## Verification

- `pnpm dlx drizzle-kit generate && pnpm dlx drizzle-kit migrate` — migration applies; `restaurant` table + admin-plugin user/session fields exist.
- `pnpm dev`. Grant one user `role=admin`, then seed 2–3 restaurants via `/admin` (upload a sample `.mdx`).
- `/explore` and `/map`: pins render at correct lat/lng; clicking a pin shows preview (name/address/AI overview); "View" navigates to `/restaurants/[slug]`.
- `/restaurants/[slug]`: uploaded MDX renders with styled components; unknown slug → 404.
- `/admin`: non-admin session is redirected/blocked; `POST /api/admin/restaurants` rejects non-admins (server-side, via admin plugin role check).
- `/business` audit runs end-to-end against `/api/audit` (SSE) and shows results in ported UI.
- Leaflet pages don't error on SSR (no `window` errors); `pnpm build` succeeds.
- i18n EN/JA toggle works across ported pages.

---

# Follow-up: Kill useEffect-fetch antipattern → server components

## Context

Several ported pages still fetch initial data client-side: a `"use client"` component calls a server *action* (or `fetch`) inside `useEffect` and stores the result in `useState`. This is the React-Router/SPA habit, not Next App Router. It costs a client round-trip after hydration, shows spinners/timeouts/retry UI for data the server already has, and ships query glue to the browser. Fix: fetch on the server (server component / direct query) and pass data down as props; keep only genuinely interactive bits as client components.

**SSE stays as-is** (cannot be a server action): `business/BusinessClient.tsx` audit form → `/api/audit`; `generate/GenerateClient.tsx` → `/api/publish/start`.
**Non-data client effects stay** (browser-only, no fetch): `ChatGptDemo.tsx` (typing anim), `RestaurantNav.tsx` (scroll), `MenuCategoryNav.tsx` (IntersectionObserver).
**Already correct** (server components): `storefronts/page.tsx`, `storefront/[id]/page.tsx`.

## Offenders + fix (4 spots)

1. **`(traveler)/stop/[slug]/page.tsx`** — whole page is `"use client"` with `useParams` + `getRestaurantAction(slug)` in useEffect.
   → Rewrite as `async function StopPage({ params })`: `const { slug } = await params`; call `getRestaurant(slug)` from [queries.ts](src/lib/restaurants/queries.ts) directly; `notFound()` when null (drop the in-page "not found" branch). Markup is otherwise static except the one `window.history.back()` button → extract a tiny `"use client"` `BackButton` component. Remove the loading-spinner branch.

2. **`(sme)/map/page.tsx` + `map/SmeMapClient.tsx`** — client fetches `getRestaurantsForMapAction()` in useEffect.
   → `map/page.tsx` becomes `async`: `const restaurants = (await getRestaurantsForMap()).filter(r => r.lat != null && r.lng != null)`; render `<SmeMapClient restaurants={restaurants} />`. `SmeMapClient` takes `restaurants` prop, drops useEffect + `loading` state + spinner; keeps prefecture filter + `dynamic(SmeMapView, { ssr:false })` (Leaflet must stay client).

3. **`(traveler)/explore/page.tsx` + `explore/ExploreClient.tsx`** — useEffect calls `listRestaurantsAction()` and (on map-view) `getRestaurantsForMapAction()`.
   → `explore/page.tsx` becomes `async`: fetch both in parallel (`Promise.all([listRestaurants(), getRestaurantsForMap()])`); pass `restaurants` + `mapRestaurants` (lat/lng-filtered) as props. `ExploreClient` drops both useEffects, the `load` callback, `loading`/`loadError`/`mapLoaded` state, the 12s timeout + retry UI; keeps all filter/view-toggle client state and `useMemo`s seeded from the props.

4. **`RecentShowcase.tsx` + `(sme)/business/page.tsx` + `business/BusinessClient.tsx`** — `RecentShowcase` (`"use client"`) calls `listStorefrontsAction(3)` in useEffect; it is rendered deep inside the client `BusinessClient` landing page.
   → Make `RecentShowcase` presentational taking `storefronts: StorefrontSummaryItem[]` (no `"use client"`, no useEffect/useState; keep `if (length===0) return null`). `business/page.tsx` becomes `async`, fetches summaries, passes `initialStorefronts` to `BusinessClient`, which forwards `<RecentShowcase storefronts={initialStorefronts} />`.
   - Extract the summary-mapping body of `listStorefrontsAction` into a plain server query `src/lib/sites/queries.ts` → `listStorefrontSummaries(limit)` (move `StorefrontSummaryItem` type there). Server components import the query.

## Cleanup

After the four conversions, these action wrappers have no remaining callers (verified by grep) — delete them, keep the underlying queries:

- `src/lib/restaurants/actions.ts`: `listRestaurantsAction`, `getRestaurantsForMapAction`, `getRestaurantAction` (file ends empty → delete file).
- `src/lib/sites/actions.ts`: `listStorefrontsAction` unused after extraction → delete (or keep as thin wrapper if a future client mutation needs it).

## Verification

- `pnpm tsc --noEmit` clean (filter `.next/`); `pnpm build` succeeds, no `window`/SSR errors from Leaflet.
- `pnpm dev`: `/explore` (list + map toggle), `/map`, `/stop/[slug]`, `/business` recent-showcase all render with data present on first paint (no post-hydration spinner). Unknown `/stop/<bad>` → 404.
- Grep confirms no `useEffect` wrapping a data fetch remains outside the SSE forms; the removed action names have zero references.

---

# Batch 5: Google Maps + Plan + Itinerary (driving routes + AI chat) + Editor chat

## Context

Four asks: (1) replace Leaflet with Google Maps everywhere; (2) chat interfaces — implement BOTH the itinerary customize-chat and the Editor storefront-edit chat; (3) build the empty Plan page; (4) build the Itinerary maker — pick a date range → Claude returns a day-by-day plan grounded on our restaurant DB → map shows numbered pins **plus real Google driving routes** connecting each day's stops.

Confirmed decisions: user provides `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; lib = `@vis.gl/react-google-maps` (official); routes = **Directions API** (real road routes); itinerary chat = **real Claude regen**; build **both** itinerary + Editor chats.

Reference (read-only): aivible Plan = real Claude edge fn → day list; aivible Itinerary = mocked pins (no routes) + mocked chat; aivible Editor = real `edit-storefront` chat. We upgrade routes (real) and chat (real).

Reused patterns: Claude client/JSON pattern in [ai-enrich.ts](src/lib/sites/ai-enrich.ts) (`new Anthropic({apiKey})`, `messages.create`, `parseJsonLenient`); blob persistence in [sites/storage.ts](src/lib/sites/storage.ts); restaurant queries `getRestaurantsForMap()`/`listRestaurants(opts)` in [queries.ts](src/lib/restaurants/queries.ts); marker factories in [markers.ts](src/components/map/markers.ts) (to be retired).

---

## 1. Google Maps migration (replace Leaflet)

- **Deps:** `pnpm add @vis.gl/react-google-maps`; `pnpm remove leaflet react-leaflet @types/leaflet`. Drop `@import "leaflet/dist/leaflet.css";` from [globals.css](src/app/globals.css).
- **Shared map kit** — new `src/components/map/GoogleMap.tsx` (`"use client"`):
  - `<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>` wrapper (exported as `MapProvider`).
  - `<Map>` with `mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID"}` (AdvancedMarker needs a mapId), `defaultCenter`, `defaultZoom`, `gestureHandling`.
  - Pin content components replacing `markers.ts` divIcons: `GemPin` (gold ★), `NumberedPin(n)` (navy), `DotPin` — rendered inside `<AdvancedMarker>`. Keep the gold/navy palette.
- **Rewrite the 3 map components** to the new kit, same props/behavior:
  - [explore/MapView.tsx](src/app/(traveler)/explore/MapView.tsx) — restaurant pins + InfoWindow popup (name/address/aiOverview + "View full page" link). Keep `dynamic(..., {ssr:false})` usage in [ExploreClient.tsx](src/app/(traveler)/explore/ExploreClient.tsx).
  - [map/SmeMapView.tsx](src/app/(sme)/map/SmeMapView.tsx) — business pins + InfoWindow.
  - [restaurants/[slug]/RestaurantMiniMap.tsx](src/app/restaurants/[slug]/RestaurantMiniMap.tsx) — single marker.
- Delete [markers.ts](src/components/map/markers.ts) after migration (Leaflet-only). InfoWindow replaces Leaflet `<Popup>`.

## 2. Itinerary data + generation backend

- **Types** `src/lib/itineraries/types.ts`: `ItineraryStop { id; slug; name; nameJp?; category?; area?; lat; lng; blurb; imageUrl?; hiddenGem; price?; }`, `ItineraryDay { dayNumber; title; area?; stops: ItineraryStop[] }`, `Itinerary { slug; destination; style?; startDate?; endDate?; totalDays; days[]; createdAt; meta?: { source: "claude" | "fallback" } }`.
- **Blob storage** `src/lib/itineraries/storage.ts` (mirror sites/storage): `writeItinerary(it)` → key `itineraries/{slug}.json`; `readItinerary(slug)` (cache + head/list/fetch); `newItinerarySlug(destination)` = slugified destination + short random.
- **Generator** `src/lib/itineraries/generate.ts`:
  - `totalDays` from date range (fallback 3, clamp 1–10).
  - Candidates: `listRestaurants({ limit })` filtered to those with lat/lng, optionally region/prefecture/area matching `destination` (string match on area/prefecture/region); cap ~40. Pass compact rows (slug,name,category,area,lat,lng,aiOverview,hiddenGem,price) to Claude.
  - Claude (reuse ai-enrich client + `parseJsonLenient`, model `claude-sonnet-4-6`): system "trip planner; choose & order candidate places into N days, geographically sensible; output ONLY JSON {days:[{title,area,stopSlugs:[]}]}". Map returned slugs back to candidate rows → build `Itinerary` with per-stop `blurb` (use aiOverview/shortEn).
  - **Fallback** (no key/parse fail): round-robin candidates across days by area.
- **Server actions** `src/lib/itineraries/actions.ts` (`"use server"`): `planItineraryAction(input)` → generate → `writeItinerary` → return `{ slug }`; `customizeItineraryAction(slug, message)` → read current + candidates → Claude adjusts (re-pick/re-order/filter per request) → `writeItinerary` (overwrite) → return `{ itinerary, reply }`.

## 3. Plan page (`/plan`)

- Replace stub [plan/page.tsx](src/app/(traveler)/plan/page.tsx) with a client form (port aivible Plan UX, aivible styling/shadcn): destination input + preset chips (Kyoto/Hakone/Kanazawa/Takayama/Yamanashi), date-range (from/to), free-text "style", validation, loading state.
- Submit → `planItineraryAction` → `router.push('/itinerary/{slug}')` (full viewer with map+routes is the deliverable).

## 4. Itinerary page (`/itinerary/[slug]`) — map routes + real chat

- Server [itinerary/[slug]/page.tsx](src/app/(traveler)/itinerary/[slug]/page.tsx): `readItinerary(slug)` → `notFound()` if missing → render client `ItineraryView`.
- `src/app/(traveler)/itinerary/[slug]/ItineraryView.tsx` (`"use client"`): 3-pane (Day sidebar | Map+Chat | Stop detail), shadcn Card/Badge/Separator/Button, aivible palette.
  - **Map:** new `ItineraryMap` on the Google kit — numbered `AdvancedMarker` per stop, `GemPin` for hidden gems, InfoWindow, pan-to selected stop.
  - **Routes (Directions API):** `DayRoutes` component using `useMapsLibrary("routes")` → for each day `DirectionsService.route({ origin, destination, waypoints: middleStops, travelMode: DRIVING })` rendered via `DirectionsRenderer({ suppressMarkers:true, polylineOptions:{ strokeColor: dayColor } })` (one color per day). Few stops/day ≪ 25-waypoint limit.
  - **Chat (real):** ChatPanel (turns `{role,content,pending?}`) → `customizeItineraryAction(slug, msg)`; on return, swap pending turn with `reply` and replace itinerary state → sidebar + map + routes re-render. Quick-tweak chips ("budget","family-friendly","foodie","nature","culture").
  - **Detail panel:** selected stop → image, tags, blurb, hidden-gem badge, links to `/restaurants/[slug]`.

## 5. Editor storefront chat (`/editor/[id]`) — ask #2 (both)

- **Backend** `src/lib/sites/edit.ts`: `editStorefront(subdomain, message, history)` → `readPublishedSite` → Claude (ai-enrich client) with current `site.data` JSON + message + last ~6 turns → returns `{ data: <updated>, reply, suggestions }`; validate, `writePublishedSite`, return. Bounded to editable `data` fields (name, tagline, description, about, highlights, hours, contact).
- **Action** `src/lib/sites/edit-actions.ts` (`"use server"`) `editStorefrontAction(subdomain, message, history)`.
- **UI** replace stub [editor/[id]/page.tsx](src/app/editor/[id]/page.tsx): server loads site → client `EditorClient` = left ChatPanel (port aivible `ChatPanel`/`ChatMessage` turn model + TypingDots + suggestion chips) + right live preview (iframe `/storefront/{id}`, reload key after each edit). Guard: only the publish owner/admin (reuse session check) may edit — keep simple (admin or any signed-in for now; note as follow-up).

## Dependencies / env

- Add `@vis.gl/react-google-maps`; remove `leaflet`,`react-leaflet`,`@types/leaflet`.
- `.env.example`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=` (optional). User enables **Maps JavaScript API + Directions API** + a Map ID on the key.
- No DB migration (itineraries live in blob).

## Execution order

1. Maps migration (kit + 3 components, remove Leaflet) — verify existing explore/map/restaurant maps still work.
2. Itinerary types + storage + generator + actions.
3. Plan page → generates + redirects.
4. Itinerary view (map + Directions routes + real chat).
5. Editor chat (backend + action + UI).

## Verification

- `pnpm build` + `pnpm tsc --noEmit` clean; no `leaflet` imports remain (`grep -ri leaflet src` empty).
- With key set: `/explore`, `/map`, `/restaurants/[slug]` render Google maps + pins/InfoWindows.
- `/plan`: fill destination + 3-day range → redirects to `/itinerary/{slug}`; day sidebar shows Day 1..3, map shows numbered pins + colored driving routes per day; clicking a pin opens detail.
- Itinerary chat: "make it budget / family-friendly" → days/map update + assistant reply.
- `/editor/{publishedSubdomain}`: chat "change the tagline to X" → preview reflects change; blob updated.

## Open follow-ups (post-merge)

- Discover (bilingual search) page still stubbed.
- Itinerary ownership/sharing + Editor auth hardening; image uploads to Blob from admin; full admin CRUD.
