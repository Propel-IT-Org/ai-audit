# AIVIBLE — Design System

**Japan Blue Index** brand system. Combines concept #2 (score-as-brand gauge), concept #5 (Ukiyo-e wave logo mark), and concept #3 (Shirube mascot). Documented after the June 2026 design sprint.

> **Canonical reference for the dev build:** `devrayat000/ai-audit`. This repo (`aivible-app`) is the design sandbox — mockups, brand assets, and edge function proofs of concept live here.

---

## Table of contents

1. [Brand identity](#1-brand-identity)
2. [Color tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Logo system](#4-logo-system)
5. [Mascot — Shirube](#5-mascot--shirube)
6. [Score ring](#6-score-ring)
7. [Illustration system](#7-illustration-system)
8. [Icon set](#8-icon-set)
9. [Primitives (atoms)](#9-primitives-atoms)
10. [Components (molecules & organisms)](#10-components-molecules--organisms)
11. [Mockup screens](#11-mockup-screens)
12. [Design changelog — June 2026](#12-design-changelog--june-2026)

---

## 1. Brand identity

**Positioning:** "The AI Visibility Assistant" — a craftsman-certifier for Japanese tourism SMEs, not a consumer travel app or a generic SEO tool.

**Tone:** Calm, certain, trustworthy. Omotenashi (hospitality-as-service), not magic or urgency. The brand never flails.

**Brand pillars (combined from three voted concepts):**

| Concept | What it contributed |
|---|---|
| #2 Japan Blue Index | Score-as-identity: the conic gold gauge IS the brand promise |
| #5 Ukiyo-e wave | Logo mark: simplified Hokusai wave = Japan + digital index |
| #3 Shirube mascot | In-product guide: a Japanese stone guidepost as the AI assistant |

**Live styleguide:** `http://159.223.83.208/styleguide.html`

---

## 2. Color tokens

### Canonical hex values (source of truth)

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--kon` | `#18243F` | `hsl(222 45% 17%)` | Primary text, deep UI, score ring bg |
| `--kon-2` | `#223A70` | `hsl(222 53% 29%)` | Buttons, CTAs, links, active nav |
| `--wave` | `#1F4788` | `hsl(217 63% 33%)` | Wave logo mark, hero bg element |
| `--gold` | `#C8A859` | `hsl(43 50% 57%)` | Score arc, gem badges, eyebrow text, Shirube's arrow — **use sparingly** |
| `--sun` | `#D6452C` | `hsl(9 67% 51%)` | Logo red dot, map pins, hanko seal |
| `--paper` | `#F5EEDC` | `hsl(43 56% 91%)` | Washi cream — Shirube avatar bg, illustration bg, warm fills |
| `--shirube-1` | `#6E80E0` | `hsl(231 65% 65%)` | Mascot gradient start (indigo light) |
| `--shirube-2` | `#4A5DC4` | `hsl(231 51% 53%)` | Mascot gradient end (indigo deep) |

### Color rules

- **Gold is scarce.** Only for: score arc, ★ gem badge, Shirube's arrow, one highlight per illustration. Never large fills.
- **Sun red is a dot/accent.** Logo mark, map pins, hanko, single CTA accent. Never a large fill.
- **Navy is the workhorse.** `--kon` for text/dark surfaces; `--kon-2` for interactive elements.
- **Paper is warmth.** Shirube always sits on `--paper`. Illustration backgrounds default to paper or transparent.

### Dev repo note

The `devrayat000/ai-audit` `globals.css` names these tokens differently:

| Our token | Dev token |
|---|---|
| `--gold` | `--color-gold-av` (Tailwind) + `--gold` (different value — `#c9a657`) |
| `--paper` | `--color-paper-av` + `--paper` (different value — `#faf8f4`, near-white) |
| `--shirube-1/2` | `--aivy1/2` |
| `--sun` | `--japan-red` |

The dev's `--paper: #faf8f4` is used as the page background (near-white), while our `--paper: #F5EEDC` (washi cream) is used as Shirube's background and illustration fills. Both are intentional and serve different roles. **Do not merge them.**

---

## 3. Typography

**Font:** [Inter](https://fonts.google.com/specimen/Inter) — Google Fonts  
**Weights loaded:** 400, 500, 600, 700, 800  
**Stack:** `'Inter', system-ui, sans-serif`

> **Dev build exception:** `devrayat000/ai-audit` applies a serif font (`var(--font-serif)`) to `h1–h3`. This is a deliberate dev-side creative decision — confirm with Ely before overriding.

### Scale

| Class | Size | Weight | Usage |
|---|---|---|---|
| `text-4xl font-extrabold` | 2.25rem / 36px | 800 | Page heroes |
| `text-3xl font-extrabold` | 1.875rem / 30px | 800 | Section headings |
| `text-2xl font-bold` | 1.5rem / 24px | 700 | Card headings |
| `text-xl font-bold` | 1.25rem / 20px | 700 | Day labels, subheadings |
| `text-base font-semibold` | 1rem / 16px | 600 | Stop names, primary labels |
| `text-sm` | 0.875rem / 14px | 400 | Body, descriptions |
| `text-xs` | 0.75rem / 12px | 400 | Meta, location, captions |
| `.av-eyebrow` | 0.62rem / ~10px | 800 | Uppercase section eyebrows |

### `.av-eyebrow`

```css
.av-eyebrow {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--gold);
}
```

Used for: "For travelers", "For businesses", "Plan a trip", section intros. Always gold. Always before a headline.

---

## 4. Logo system

**Mark:** Ukiyo-e wave (concept #5) — a simplified Hokusai composition.

**Anatomy:**
- Washi cream `#F5EEDC` rounded-rect background (8px radius)
- Sun-red `#D6452C` circle (top-right) — the red sun disc
- Prussian-blue `#1F4788` wave path (lower half) — Hokusai arc
- Three white foam dots on the wave crest

**Wordmark:** `AIVIBLE` — Inter 800, all-caps, tracking-tight. Sits immediately right of the mark.

**Injection:** `brand.js` (loaded on all mockup screens) automatically swaps every `<span class="japan-red">●</span>` with the wave SVG. Size is inferred from Tailwind text-size classes (`text-xl` → 26px, `text-lg` → 23px, default → 18px).

```html
<!-- Trigger pattern in HTML -->
<span class="japan-red text-xl">●</span>
<!-- brand.js replaces this with the wave SVG at runtime -->
```

**Source:** `public/concept-traveler-journey/brand.js` (inline SVG, no external file dependency)

---

## 5. Mascot — Shirube

**Name:** Shirube (標 / シルベ) — Japanese for "guidepost" or "sign."  
**Renamed from:** Aivy (retired 2026-06-16 — "Aivy" conflicted with the LINE bot name and read as a generic droplet mascot).

### Character design

- **Form:** A flat, rounded-cornered vertical stone post (michishirube), proportioned like a calm standing figure
- **Arms:** Two short minimal arms with small rounded hands
- **Eyes:** Dot eyes, soft smile
- **Body emblem:** Fixed gold "this way" arrow (identity marker — always present)
- **Face:** Vertical こちらへ text down the face
- **Seal:** Small red hanko square, white 藍 kanji near the base
- **Style:** Flat vector, **no gradient** — consistent with logo and UI

### Persona

Calm, certain, reassuring. Points and presents (omotenashi spirit). Never flails, never surprised, never "magical." A craftsman-certifier, not a cute squishy mascot.

### Visual rules

| DO | DON'T |
|---|---|
| Flat fills only | Gradients anywhere on the character |
| One calm gesture (pointing / presenting) | Flailing arms, overly expressive |
| Sits on `--paper` (`#F5EEDC`) background | Transparent bg for in-chat use only |
| Gold arrow always visible | Hiding or removing the arrow |

### SVG assets

| File | Usage |
|---|---|
| `public/concept-traveler-journey/icons/shirube.svg` | In-product avatar (chat, nav, empty states) |
| `docs/illustration-comps/_shirube-character.svg` | Canonical construction reference |

### Inline SVG (via `brand.js`)

`brand.js` injects Shirube to replace `<span>✨</span>` gradient-blob avatars in older mockups. The injector reads Tailwind size classes (`w-8` → 30px, `w-7` → 26px) to scale correctly.

---

## 6. Score ring

The AI visibility score gauge is a brand-level element — it represents the product's core promise.

```css
.score-ring {
  position: relative;
  width: 7rem; height: 7rem;
  border-radius: 9999px;
  padding: 0.5rem;
  background: conic-gradient(
    var(--gold) calc(var(--pct, 0) * 1%),
    rgba(255,255,255,0.14) 0
  );
  box-shadow: 0 10px 26px rgba(24,36,63,0.35);
}
.score-ring__face {
  width: 100%; height: 100%;
  border-radius: 9999px;
  background: var(--kon);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: #fff;
}
.score-ring__grade { font-size: 2.6rem; font-weight: 800; line-height: 1; }
.score-ring__num   { font-size: 0.72rem; font-weight: 600; color: var(--gold); }
```

**Drive with CSS custom property:**
```html
<div class="score-ring" style="--pct:72;">
  <div class="score-ring__face">
    <span class="score-ring__grade">B</span>
    <span class="score-ring__num">72 / 100</span>
  </div>
</div>
```

**Grade thresholds:** A ≥ 90, B 70–89, C 50–69, D < 50

---

## 7. Illustration system

### Style: flat geometric vector ("Japan-blue flat")

- Clean shapes, **no outlines**, flat fills only
- **Zero gradients** — every shape is a single flat fill
- Rounded corners 4–8px, rounded line caps
- Mid-low detail: 2–4 colors per object, readable at 320px
- Background: transparent OR washi-cream `#F5EEDC`
- Japan motifs used tastefully: seigaiha arcs, simplified Fuji, noren, tea cup, map pins, ryokan rooflines

**Avoid:** geisha/samurai stereotypes, cherry-blossom overload, neon Tokyo, anime faces, gradients, sparkles/magic effects, heavy outlines, 3D/bevels

### Generation workflow

DALL·E/ChatGPT outputs are **comps (layout references), not finals**. ChatGPT forces glow and gradients on scenes.

```
1. Generate scene → approve composition
2. Vectorize in Figma/Illustrator (Image Trace or redraw)
3. Recolor to exact hex tokens
4. Export: WebP for app use, SVG for the docs/illustration-comps/ archive
5. WebP-compress before committing (no raw multi-MB PNGs)
```

### Illustration inventory

**WebP finals** — `public/concept-traveler-journey/illustrations/`

| File | Scene | Used on |
|---|---|---|
| `hero-a.webp` | Traveler + AI phone + hidden gems map | FrontDoor hero |
| `onboarding-plan.webp` | Shirube + itinerary card | `/plan` before first query |
| `empty-itinerary.webp` | Blank trip canvas | Empty/no-results state |
| `audit-score.webp` | Score gauge + ryokan | SME audit results |
| `bilingual-search.webp` | JP/EN search bar | `/discover` |
| `ai-builds-website.webp` | Browser + restaurant assembling | Storefront generate loading |
| `verified-gem.webp` | Gold pin + hidden onsen map | `/explore` |
| `no-results.webp` | Shirube apologetic + empty card | Search empty state |
| `loading.webp` | Shirube + cycling dots | AI generation in progress |
| `success.webp` | Storefront with gem badge in itinerary | Post-generate success |
| `share-trip.webp` | Itinerary card shared traveler-to-traveler | `/plan-share` |
| `not-found.webp` | Lost traveler + Shirube at fork | 404 page |
| `onboarding-discover.webp` | Phone + Japan map with gems | Onboarding / discover |

**SVG vectorized comps** — `docs/illustration-comps/`

| File | Status |
|---|---|
| `_shirube-character.svg` | Canonical construction reference |
| `_japan.svg` | Japan outline base shape |
| `verified-gem.svg` | ✅ Vectorized |
| `audit-score.svg` | ✅ Vectorized |
| `bilingual-search.svg` | ✅ Vectorized |
| `loading.svg` | ✅ Vectorized |
| `no-results.svg` | ✅ Vectorized |
| `empty-itinerary.svg` | ✅ Vectorized |
| `ai-builds-website.svg` | ✅ Vectorized |
| `onboarding-plan.svg` | ✅ Vectorized |
| `onboarding-discover.svg` | ✅ Vectorized |
| `success.svg` | ✅ Vectorized |
| `404-lost-traveler.svg` | ✅ Vectorized |

Compare PNG vs SVG: `http://159.223.83.208/_comps-gallery.html`

### House-style prompt prefix

Prepend to every new illustration prompt:

> *Flat geometric vector illustration, modern Japanese minimal style, clean simple shapes with no outlines and flat solid fills, gently rounded corners, generous negative space — matching a brand that uses a simplified Hokusai-wave logo and the Inter typeface. Strict palette only: dark navy #18243F, mid navy #223A70, Prussian "Japan blue" #1F4788, gold accent #C8A859 (used sparingly), ukiyo-e sun-red #D6452C (small accents/pins only), washi-paper cream #F5EEDC for background. NO gradients anywhere — every shape is a single flat fill. The mascot "Shirube" is a small, friendly, flat Japanese stone guidepost (michishirube): a rounded-cornered vertical Japan-blue post proportioned like a calm standing figure, with two short minimal arms and small rounded hands, simple dot eyes and a soft smile, a fixed gold "this way" arrow on his body, vertical Japanese text こちらへ down his face, and a tiny red hanko square with the white kanji 藍. Calm, trustworthy, quietly certain — a craftsman-certifier, never flailing, never cutesy. Flat SVG-style vector, no 3D, no bevels, no gradients, no heavy shadows.*

Full prompts for all 14 scenes: see [`docs/illustration-style-guide.md`](illustration-style-guide.md)

---

## 8. Icon set

**Location:** `public/concept-traveler-journey/icons/`  
**Format:** SVG  
**Style:** matches illustration system — flat, navy fills, no outlines

| File | Usage |
|---|---|
| `shirube.svg` | Mascot avatar (chat, nav, empty states) |
| `gem.svg` | Verified Gem badge icon |
| `compass.svg` | Explore / discover nav |
| `itinerary.svg` | Itinerary nav tab (navy) |
| `itinerary-white.svg` | Itinerary nav tab (white, for dark bg) |
| `home.svg` | Home / FrontDoor |
| `noren.svg` | SME / business section |
| `brush.svg` | Editor / customize |
| `traveler-map.svg` | Traveler journey entry card |

---

## 9. Primitives (atoms)

Indivisible UI elements. Used directly or composed into components — never broken down further.

### Buttons

| Variant | Classes | Usage |
|---|---|---|
| Primary CTA | `bg-[#223A70] text-white rounded-xl font-bold px-5 py-2.5` | Main actions: "Plan", "Generate", "Check" |
| Dark CTA | `bg-[#18243F] text-white rounded-xl font-bold px-5 py-2.5` | Secondary CTA on light bg |
| Outline | `border-2 border-[#223A70] text-[#223A70] rounded-xl font-bold px-5 py-2.5` | Save, secondary actions |
| Preset chip | `rounded-full border border-border px-3 py-1 text-sm hover:border-[#223A70]` | Destination presets, filter chips |
| URL chip | `rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs text-pink-600` | "📎 Paste another link" |
| Icon button (send) | `w-9 h-9 rounded-lg bg-[#223A70] text-white` | Chat send button |

### Badges

| Variant | Classes | Usage |
|---|---|---|
| Verified Gem | `bg-[#F8F2E2] text-[#9a7b27] font-bold text-xs rounded-full px-2 py-0.5` | Hidden gem stops |
| Grade | `bg-[#223A70] text-white font-bold text-xs rounded-full px-2 py-0.5` | AI visibility grade |
| Score (gold) | `bg-[#F8F2E2] text-[#9a7b27] font-bold text-xs rounded-full px-2 py-0.5` | 💎 Score A/B/C/D |
| URL-added (pink) | `bg-pink-100 text-pink-600 font-bold text-xs rounded-full px-2 py-0.5` | 📸 Added (from URL paste) |
| JP-only find | `bg-red-50 text-red-600 border border-red-100 font-bold text-xs rounded-full px-2 py-0.5` | Discover results |
| EN result | `bg-gray-100 text-gray-600 font-bold text-xs rounded-full px-2 py-0.5` | Discover results |
| JP+EN match | `bg-[#EEF1F8] text-[#223A70] font-bold text-xs rounded-full px-2 py-0.5` | Discover best match |
| Platform source | `bg-pink-50 border border-pink-100 text-pink-600 text-[10px] font-bold rounded-full px-2 py-0.5` | "Instagram Reel", "Google Maps" |

### Map pins

| Variant | Style | Usage |
|---|---|---|
| Numbered | `w-7 h-7 rounded-full bg-[#D6452C] text-white font-bold` | Itinerary stop order |
| Gem | `w-7 h-7 rounded-full bg-[#C8A859] text-[#18243F] font-bold` (★) | Verified gem stop |
| URL-added | `w-7 h-7 rounded-full bg-pink-600 text-white` + glow ring | Instagram/URL-sourced stop |
| Nearby dot | `w-3 h-3 rounded-full bg-[#223A70] opacity-60 border-2 border-white` | Surrounding POIs |

**Implementation:** `@vis.gl/react-google-maps` `AdvancedMarker` in dev build. Custom `divIcon` in legacy Leaflet.

---

## 10. Components (molecules & organisms)

Primitives composed into purposeful UI units.

### Stop card — molecule

`icon atom` + `text stack` + `badge atom` → single itinerary row

```html
<!-- Normal stop (links to /stop/:id) -->
<div class="flex gap-3 rounded-lg border border-gray-200 bg-white p-3">
  <span class="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">🍵</span>
  <div>
    <div class="flex items-start justify-between gap-2">
      <h4 class="font-semibold text-sm">Ippodo Tea</h4>
      <span class="gem-badge">★ Verified Gem</span>
    </div>
    <p class="text-xs text-gray-400">Café · 📍 Nakagyo, Kyoto</p>
    <p class="text-xs text-gray-600">Sip premium matcha in a serene tearoom.</p>
  </div>
</div>

<!-- URL-added stop (ephemeral — not DB-backed) -->
<div class="flex gap-3 rounded-lg border-2 border-pink-200 bg-pink-50/60 p-3">
  <!-- Same structure, pink border/bg, 📸 icon, "📸 Added" badge -->
</div>
```

URL-added stops: `border-pink-200 bg-pink-50/60`. Not persisted to DB — ephemeral session state only.

### Chat panel — organism

`Shirube avatar atom` + `message bubbles` + `reading indicator` + `place card molecule` + `chip atoms` → full URL-paste interaction

```css
/* User bubble */
.chat-user {
  background: #223A70; color: #fff;
  border-radius: 1rem 1rem 0 1rem;
  padding: .6rem 1rem;
}

/* Shirube bubble */
.chat-bot {
  background: #F3F4F6; border: 1px solid #E5E7EB;
  border-radius: 1rem 1rem 1rem 0;
  padding: .6rem 1rem;
}

/* Reading indicator pill */
.reading-pill {
  background: #EEF1F8; border: 1px solid #B6C2E0;
  color: #223A70; border-radius: 9999px;
  padding: .35rem .75rem; font-size: .75rem; font-weight: 600;
}
```

**URL-paste flow states:**
1. User types/pastes URL → detected by `isUrl()` → different submit path
2. "Reading link…" pill with dot-bounce animation
3. `read-url` edge function fetches og:tags + Claude identifies place
4. Success: Shirube bubble + place card molecule + "📸 Added" stop appended to Day 1
5. Instagram reel opaque: hint message — "tap the 📍 location tag → copy that Google Maps link instead"
6. No place found: generic error

**Backend:** `supabase/functions/read-url/index.ts` (deployed). Uses `facebookexternalhit/1.1` UA + Claude Sonnet to identify Japan travel destinations. Returns `{ success, stop }` or `{ success: false, errorType }`.

### Navigation — organism

`Logo atom` + `nav links` + `auth button atom` → full page header + tab bar

**TopNav:** white bg, `border-b`, sticky. Logo left, links + Sign in right.  
**BottomNav (traveler only):** 4 tabs — Plan 🗺️, Explore 💎, Discover 🔍, Itinerary 📋. Active tab in `--kon-2`.

---

## 11. Mockup screens

All mockups live in `public/` and are accessible on the live server at `http://159.223.83.208/`.

### Traveler journey — `concept-traveler-journey/`

| File | Screen | Notes |
|---|---|---|
| `sitemap.html` | Full journey sitemap | Start here for orientation |
| `index.html` | FrontDoor `/` | Two-card hero, Traveler + SME entry |
| `plan-start.html` | Plan `/plan` — form | Destination + dates + presets |
| `building-trip.html` | Plan — AI generating | Loading state |
| `trip-canvas.html` | Itinerary + map | Split panel: stops + Leaflet map |
| `trip-canvas-instagram.html` | **Itinerary + URL paste flow** | **KEY DIFFERENTIATOR** — animated chat sequence |
| `itinerary.html` | Itinerary detail | Day view, stop list |
| `itinerary-stop.html` | Stop detail `/stop/:id` | Business page |
| `plan-cap.html` | Free plan cap modal | "Save to keep planning" |
| `plan-share.html` | Share your trip | Share-to-earn traveler screen |
| `discover.html` | Discover `/discover` | Bilingual JP+EN search |
| `businesses.html` | Explore `/explore` | Verified gems list + map |
| `ai-recommends.html` | AI recommendations | Shirube chat panel |
| `login.html` | Auth / sign in | Google OAuth gate |
| `analyzing.html` | Processing state | Loading animation |
| `results.html` | Audit results | Score + fixes |
| `storefront.html` | Storefront view | Generated SME page |
| `editor.html` | Storefront editor | Chat-edit interface |
| `editor-2.html` | Editor v2 | Refined editor with credits |
| `editor-paywall.html` | Editor paywall | Credits exhausted / upgrade |
| `sov.html` | Share of Voice | AI ranking tracker |
| `generating.html` | Storefront generation | Loading state |
| `logo-concepts.html` | Branding vote archive | Concepts #1–5 |
| `indexmock.html` | Alt landing variant | — |

### SME journey — `concept-customer-journey/`

| File | Screen | Notes |
|---|---|---|
| `index.html` | SME landing | Audit entry |
| `analyzing.html` | Audit processing | — |
| `results.html` | Audit results | Score + issue list |
| `generating.html` | Storefront generation | AI building website |
| `storefront.html` | Storefront preview | Generated page |
| `editor.html` | Editor | Chat-edit |
| `editor-2.html` | Editor v2 | With credits meter |
| `editor-paywall.html` | Paywall | — |
| `editor-refer.html` | Refer another SME | Share-to-earn |
| `editor-referred.html` | Referred landing | Invite recipient view |
| `login.html` | Auth | — |
| `sov.html` | Share of Voice | — |

### Shared CSS/JS

- `brand.css` — CSS custom properties + `.score-ring`, `.av-eyebrow`, `.hero-map`
- `brand.js` — Runtime injector: `● → wave SVG`, `✨ → Shirube SVG`

Both are co-located in each concept folder and loaded on every screen.

---

## 12. Design changelog — June 2026

### 2026-06-19
- **Styleguide built** — `public/styleguide.html`. 7 sections, live at `/styleguide.html`.
- **Atomic design split** — Section 04 "Components" split into 04 Primitives (atoms: buttons, badges, map pins) and 05 Components (molecules/organisms: stop card, chat panel, navigation). Molecule/organism labels added per component.

### 2026-06-18
- **URL-paste chat flow shipped** — `supabase/functions/read-url/index.ts` deployed. `src/lib/api/readUrl.ts` + `src/pages/Plan.tsx` chat panel. Tourists paste any URL (Google Maps, Instagram location pages, travel blogs) → Shirube reads og:tags + Claude identifies place → "📸 Added" stop appended to Day 1.
- **Instagram reel limitation documented** — Instagram killed og:tags for reels (`facebookexternalhit` UA gets React shell). `errorType: "instagramReelOpaque"` triggers a hint to use the 📍 Google Maps link instead.
- **`trip-canvas-instagram.html`** — animated mockup for the URL-paste differentiator flow.

### 2026-06-17
- **Full illustration set vectorized** — all 11 illustration comps vectorized to SVG from DALL·E PNGs. Files in `docs/illustration-comps/*.svg`.
- **Shirube SVG icon** added to `public/concept-traveler-journey/icons/shirube.svg` — usable directly in HTML mockups without brand.js.
- **New mockup screens** — `ai-recommends.html`, `analyzing.html`, `building-trip.html`, `discover.html`, `editor-2.html`, `editor-paywall.html`, `generating.html`, `indexmock.html`, `itinerary-stop.html`, `login.html`, `plan-cap.html`, `plan-share.html`, `results.html`, `sov.html`.
- **Itinerary + trip-canvas polish** — typing UI, 3-dot loader, animated chat sequence.

### 2026-06-16
- **Aivy → Shirube rebrand** — in-product mascot renamed from "Aivy" to "Shirube" (標). Aivy lives on as the team LINE bot name only. All mockups updated.
- **`brand.js`** updated to inject Shirube SVG in place of `✨` gradient-blob avatars.
- **Storefront editor shipped** — chat-edit + credits + paywall + SoV upsell live in production. `editor.html` / `editor-2.html` / `editor-paywall.html` added to both concept folders.
- **Share-to-earn screens** — `plan-share.html` (traveler), `editor-refer.html` / `editor-referred.html` (SME).
- **SME journey folder** — `concept-customer-journey/` created; `brand.css` / `brand.js` co-located.

### 2026-06-15 and earlier
- **Logo system finalized** — concept #5 Ukiyo-e wave mark selected. `brand.js` injector created.
- **Brand identity consolidated** — Japan Blue Index (#2) + wave mark (#5) + Shirube mascot (#3).
- **Illustration style guide written** — `docs/illustration-style-guide.md`. House-style prefix + 14 scene prompts (a–n). Flat-vector mandate, no-gradient rule, Shirube character brief.
- **Illustration comps generated** — DALL·E comps for all 13 scenes + character sheet. Workflow: DALL·E → comp → vectorize → recolor to exact hex → WebP-compress → commit.
- **Score ring** introduced as brand-level component (not just a UI widget).
- **Color tokens** locked: `--kon`, `--kon-2`, `--wave`, `--gold`, `--sun`, `--paper`, `--shirube-1/2`.
