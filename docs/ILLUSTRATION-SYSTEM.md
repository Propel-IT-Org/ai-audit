# AIVIBLE — Illustration System

Flat geometric vector illustrations for the Japan Blue Index brand. All scenes feature **Shirube** (the guidepost mascot) and follow a strict no-gradient, no-outline rule.

> **SVG source files:** `public/mockups/illustrations/`
> **WebP finals (app use):** `public/mockups/traveler-journey/illustrations/` and `public/mockups/sme-journey/illustrations/`

---

## Style direction

**Name:** Japan-blue flat / Ukiyo-e minimal

| Rule | Spec |
|---|---|
| Fills | Flat solid only — **zero gradients anywhere** |
| Outlines | None on fills. If linework needed: single ~2px weight in `#18243F` |
| Corners | Rounded 4–8px; rounded line caps |
| Detail level | Mid-low — 2–4 colors per object, readable at 320px wide |
| Depth | Flatness + simple overlap. No realistic lighting, bevels, or 3D |
| Background | Transparent OR washi cream `#F5EEDC` |
| Japan cues | Seigaiha arcs, simplified Fuji, noren, paper lantern, minimal torii, onsen steam, tea cup, ramen bowl, ryokan rooflines, map pins, shoji geometry |

**Avoid:** geisha/samurai/ninja stereotypes · cherry-blossom overload · neon cyberpunk Tokyo · anime faces · gold dragons · sparkles / "magic" effects · gradients · heavy outlines · 3D/bevels · busy tourist-poster collages

**The Japan test:** 1–2 motifs per image, geometric and calm. If it looks like an airport souvenir, cut detail and color until it reads like a quiet regional inn.

**Why flat over isometric or hand-drawn:**
- Echoes the wave logo mark (already flat geometric SVG shapes)
- No-outline flat reads credible B2B tool, not consumer toy
- Harmonizes with Inter typeface and flat shadcn UI
- Shirube is flat → mascot, logo, and UI all speak the same visual language

---

## Color palette (strict — no other colors)

| Token | Hex | Role in illustrations |
|---|---|---|
| `--kon` | `#18243F` | Primary shapes, navy fills, Shirube's body |
| `--kon-2` | `#223A70` | Secondary shapes, storefronts, UI elements |
| `--wave` | `#1F4788` | Wave arcs, seigaiha, water, large background shapes |
| `--gold` | `#C8A859` | Shirube's arrow, score arc, gem badge, one highlight per image — **use sparingly** |
| `--sun` | `#D6452C` | Logo disc, map pins, hanko seal, single accent only |
| `--paper` | `#F5EEDC` | Background fills, washi texture areas |
| White | `#FFFFFF` | Shirube's eyes, foam dots, text on dark |

Gold rule: **one gold element per illustration maximum** (the score arc, OR Shirube's arrow, OR a gem pin — not all three).

---

## Mascot — Shirube (標)

Shirube is a friendly Japanese stone guidepost (michishirube) reimagined as a calm standing figure. He appears in most illustrations as the presenting/guiding character.

### Construction

```
Body:    Rounded-corner vertical rectangle — Japan blue (#18243F / #1F4788)
         Proportioned like a calm standing figure
Arms:    Two short minimal arms, small rounded hands
Eyes:    Two dot eyes + soft smile arc — white/dark on navy body
Arrow:   Fixed gold "this way" → arrow on chest — always present, his identity emblem
Text:    Vertical こちらへ (kochirae) down the face
Seal:    Small red square hanko near the base, white 藍 (ai) kanji
```

### Persona rules

- **Calm and certain** — never surprised, never flailing
- Gestures: pointing (one hand) or presenting (both hands open, palms up)
- Omotenashi spirit — guiding, inviting, never selling
- No sparkles, no magic effects around him

### Reference files

| File | Purpose |
|---|---|
| `public/mockups/illustrations/_shirube-character.svg` | Canonical construction reference — upload with every new scene prompt |
| `public/mockups/traveler-journey/icons/shirube.svg` | In-product avatar (chat, nav, empty states) |

**Always attach `_shirube-character.svg` as a reference image when generating new scenes** — text alone drifts the character.

---

## Generation workflow

DALL·E / ChatGPT outputs are **layout comps, not finals**. ChatGPT reliably adds gradients and glow to scenes even when instructed not to. Treat AI output as a composition reference only.

```
1. Write prompt (house-style prefix + scene description)
2. Attach _shirube-character.svg as reference image
3. Generate → approve composition / reject if gradient/glow/3D appeared
4. Vectorize in Figma or Illustrator (Image Trace or manual redraw)
5. Recolor all fills to exact hex tokens
6. Remove any stray gradient, bevel, or outline
7. Export WebP for app use (compress — target <30KB per image)
8. Save SVG to public/mockups/illustrations/
9. Never commit raw PNG DALL·E output
```

**Reject rule:** if output has outlines, gradients, 3D, neon, sparkles, or kitsch Japan motifs → regenerate with *"flat 2D vector only, no gradients, no 3D, no sparkles, fewer details, calmer regional Japan"*

---

## House-style prompt prefix

Prepend to **every** new illustration prompt:

> *Flat geometric vector illustration, modern Japanese minimal style, clean simple shapes with no outlines and flat solid fills, gently rounded corners, generous negative space — matching a brand that uses a simplified Hokusai-wave logo and the Inter typeface. Strict palette only: dark navy #18243F, mid navy #223A70, Prussian "Japan blue" #1F4788, gold accent #C8A859 (used sparingly — one element maximum), ukiyo-e sun-red #D6452C (small accents only), washi-paper cream #F5EEDC for background. NO gradients anywhere — every shape is a single flat fill. The mascot "Shirube" is a small, friendly, flat Japanese stone guidepost (michishirube): a rounded-cornered vertical Japan-blue post proportioned like a calm standing figure, with two short minimal arms and small rounded hands, simple white dot eyes and a soft smile, a fixed gold "this way" arrow on his body, vertical Japanese text こちらへ down his face, and a tiny red hanko square with the white kanji 藍. Calm, trustworthy, quietly certain — a craftsman-certifier, never flailing, never cutesy. Flat SVG-style vector, no 3D, no bevels, no gradients, no heavy shadows. Background: [transparent OR flat washi cream #F5EEDC].*

---

## Illustration inventory

### SVG vectorized source files — `public/mockups/illustrations/`

| File | Scene | Status |
|---|---|---|
| `_shirube-character.svg` | Shirube character construction sheet | Reference only |
| `_japan.svg` | Japan outline base shape | Utility shape |
| `verified-gem.svg` | Gold pin on seigaiha map — hidden onsen | ✅ |
| `audit-score.svg` | Score gauge + ryokan storefront + Shirube | ✅ |
| `bilingual-search.svg` | Search bar + JP/EN speech ribbons | ✅ |
| `loading.svg` | Shirube + cycling dots ring | ✅ |
| `no-results.svg` | Shirube apologetic + empty washi card | ✅ |
| `empty-itinerary.svg` | Blank trip canvas + empty pin outlines | ✅ |
| `ai-builds-website.svg` | Browser assembling from flat blocks | ✅ |
| `onboarding-plan.svg` | Shirube + itinerary card with tea/torii stops | ✅ |
| `onboarding-discover.svg` | Phone + Japan map with gem pin | ✅ |
| `success.svg` | Storefront with gem badge in itinerary card | ✅ |
| `404-lost-traveler.svg` | Traveler at fork + Shirube pointing home | ✅ |

### WebP app finals — `public/mockups/traveler-journey/illustrations/`

| File | Used on | Size |
|---|---|---|
| `hero-a.webp` | FrontDoor hero | 72K |
| `onboarding-plan.webp` | `/plan` before first query | 18K |
| `empty-itinerary.webp` | Empty state | 15K |
| `audit-score.webp` | SME audit results | 23K |
| `bilingual-search.webp` | `/discover` | 12K |
| `ai-builds-website.webp` | Storefront generate loading | 23K |
| `verified-gem.webp` | `/explore` | 22K |
| `no-results.webp` | Search empty state | 27K |
| `loading.webp` | AI generation in progress | 15K |
| `success.webp` | Post-generate confirmation | 19K |
| `share-trip.webp` | `/plan-share` | 13K |
| `not-found.webp` | 404 page | 16K |
| `onboarding-discover.webp` | Onboarding / discover | 17K |

### WebP app finals — `public/mockups/sme-journey/illustrations/`

| File | Used on |
|---|---|
| `refer-business.webp` | `editor-refer.html` — share-to-earn hero |

---

## Icon set

**Location:** `public/mockups/traveler-journey/icons/` (identical copy in `sme-journey/icons/`)
**Format:** SVG · **Style:** flat, navy fills, no outlines — same language as illustrations

| File | Usage | Color |
|---|---|---|
| `shirube.svg` | Mascot avatar — chat, nav, empty states | Indigo gradient body `#6E80E0→#4A5DC4`, white eyes, red seal |
| `gem.svg` | Verified Gem badge | Gold `#C8A859` |
| `compass.svg` | Explore / Discover nav tab | Navy `#18243F` |
| `itinerary.svg` | Itinerary nav tab | Navy `#18243F` |
| `itinerary-white.svg` | Itinerary nav tab on dark bg | White |
| `home.svg` | Home / FrontDoor | Navy `#18243F` |
| `noren.svg` | SME / business section | Navy `#18243F` |
| `brush.svg` | Editor / customize | Navy `#18243F` |
| `traveler-map.svg` | Traveler journey entry card | Navy `#18243F` |

> **Note on `shirube.svg`:** This is the only icon with a gradient (the mascot's indigo body `#6E80E0 → #4A5DC4`). The gradient exception applies to the mascot character only — all other icons and illustrations are flat fills.

---

## Naming conventions

| Type | Location | Format | Example |
|---|---|---|---|
| SVG source | `public/mockups/illustrations/` | `kebab-case.svg` | `verified-gem.svg` |
| WebP final (traveler) | `public/mockups/traveler-journey/illustrations/` | `kebab-case.webp` | `verified-gem.webp` |
| WebP final (SME) | `public/mockups/sme-journey/illustrations/` | `kebab-case.webp` | `refer-business.webp` |
| Icon | `public/mockups/*/icons/` | `kebab-case.svg` | `shirube.svg` |
| Utility/base shape | `public/mockups/illustrations/` | `_underscore-prefix.svg` | `_shirube-character.svg` |

---

## Scenes still needed

| # | Name | Prompt key | Priority |
|---|---|---|---|
| m | Refer a business owner | Share-to-earn hero for `editor-refer.html` | Medium |
| n | Share your trip (traveler) | Hero for `plan-share.html` | Medium |
| — | Hero variant for `/plan` | Shirube presenting blank Japan map | Low |

Full prompts for all scenes: [`docs/DESIGN-SYSTEM.md → Section 7`](DESIGN-SYSTEM.md#7-illustration-system)
