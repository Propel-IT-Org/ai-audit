# Aivible Security Threat Register

> Last updated: 2026-06-25
> Scope: ai-audit Next.js app + DigitalOcean infra + CI/CD pipeline

This document is the living security reference for the Aivible platform. Update it when threats are mitigated or new ones are identified. Written in anticipation of rapid growth — the issues listed here are low-friction at current scale but exploitable at higher traffic/user counts.

---

## Priority Summary

| # | Finding | Severity | Status | File |
|---|---------|----------|--------|------|
| 1 | Unauthenticated SSRF via `/api/img` | **Critical** | Open | `src/app/api/img/route.ts` |
| 2 | `/api/audit` unauthenticated — unbounded LLM cost | **High** | Open | `src/app/api/audit/route.ts` |
| 3 | No rate limiting on any route | **High** | Open | all routes |
| 4 | `.env` written to droplet disk by CI, likely world-readable | **High** | Open | `.github/workflows/deploy.yml:81` |
| 5 | `BLOB_READ_WRITE_TOKEN` single token for all ops | **High** | Open | `src/lib/storage/blob.ts` |
| 6 | Admin API routes may lack `requireAdmin()` | **High** | Open | `src/app/admin/layout.tsx` |
| 7 | CI actions pinned to mutable tags (supply chain) | **Medium** | Open | `deploy.yml:45,56` |
| 8 | Prompt injection via unvalidated `audit` payload | **Medium** | Open | `src/app/api/publish/start/route.ts:36` |
| 9 | No branch protection on `master` | **Medium** | Open | GitHub settings |
| 10 | No DNSSEC on DigitalOcean DNS | **Medium** | Open | infra |
| 11 | `/api/publish/check` leaks `sourceUrl` of tenants | **Medium** | Open | `src/app/api/publish/check/route.ts` |
| 12 | Google Maps API key unrestricted by referrer | **Medium** | Open | Google Cloud Console |
| 13 | No CSP or HTTP security headers | **Medium** | Open | `next.config.ts` |
| 14 | `playwright` in prod dependencies | **Medium** | Open | `package.json:31` |
| 15 | `workflow` package — unknown provenance | **Medium** | Open | `package.json:37` |
| 16 | No `bun audit` in CI | **Low** | Open | `deploy.yml` |
| 17 | Health endpoint leaks infra details unauthenticated | **Low** | Open | `src/app/api/publish/health/route.ts` |
| 18 | No DNSSEC / no Cloudflare proxy | **Medium** | Open | infra |

---

## 1. Server / Infra Hardening

### 1.1 SSRF via `/api/img` — Critical

**Attack vector:** `GET /api/img?u=<url>` fetches any URL server-side with no host filtering. An attacker can point this at `http://169.254.169.254/latest/meta-data/` (DigitalOcean metadata API) to extract the droplet's IAM credentials, or probe internal services on the droplet's LAN.

**Current exposure:** `src/app/api/img/route.ts` — URL validation is `new URL(raw)` + protocol check only. No blocklist of RFC-1918 ranges, no auth check, no allowlist.

**Fix:**
```ts
// Before fetch(), reject private/internal IPs:
const { hostname } = new URL(url);
const resolved = await dns.resolve4(hostname);
const blocked = resolved.some(ip => isPrivateIP(ip)); // use 'private-ip' npm pkg
if (blocked) return new Response("Forbidden", { status: 403 });
```
Also add authentication — there is no reason an unauthenticated visitor needs server-side image proxying.

---

### 1.2 `.env` written world-readable to droplet — High

**Attack vector:** `deploy.yml` lines 81–95 writes `/var/www/ai-audit/.env` via heredoc as root. Default umask means any local process (including a compromised Wiki.js or Chromium on the same network) can read `DATABASE_URL`, `ANTHROPIC_API_KEY`, `BETTER_AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, etc.

**Fix:**
```bash
# In deploy.yml, before writing:
umask 077 && cat > /var/www/ai-audit/.env << ENVEOF
...
ENVEOF
# Also:
chmod 750 /var/www/ai-audit
```
Long term: use PM2 `ecosystem.config.js` for runtime secrets instead of a `.env` file on disk.

---

### 1.3 No HTTP security headers — Medium

**Attack vector:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, or `Strict-Transport-Security` from the app layer. XSS payloads in scraped SME content (MDX body, gallery URLs) have no CSP backstop.

**Fix — add to `next.config.ts`:**
```ts
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; img-src 'self' https: data:" },
    ],
  }];
}
```

---

## 2. CI/CD Pipeline Security

### 2.1 Third-party actions pinned to mutable tags — Medium

**Attack vector:** `deploy.yml` uses `appleboy/scp-action@v0.1.7` and `appleboy/ssh-action@v1.0.3` — mutable git tags. A supply-chain compromise of these repos could inject steps that exfiltrate all secrets passed as `envs:`.

**Fix:** Pin to full commit SHA:
```yaml
# Before:
uses: appleboy/ssh-action@v1.0.3
# After:
uses: appleboy/ssh-action@7eef1606c4a34f... # v1.0.3
```
Add Dependabot for GitHub Actions to keep SHAs updated.

### 2.2 No branch protection on `master` — Medium

**Attack vector:** Any push to `master` triggers a production deploy. A compromised contributor account → direct code push → prod.

**Fix:** In GitHub repo settings → Branches → Add rule for `master`:
- Require 1 approving review
- Require status checks to pass
- Disallow force pushes

### 2.3 All secrets injected at build time — High

**Attack vector:** 13 secrets (including `ANTHROPIC_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`) are passed to `bun run build`. Secrets in the build environment can leak via Next.js telemetry, error traces, or source maps.

**Fix:** Separate build-time from runtime secrets. Only `NEXT_PUBLIC_*` vars belong in the build step. Runtime secrets should be injected only at process start via PM2.

### 2.4 No `bun audit` in CI — Low

**Fix:** Add to `deploy.yml` before the build step:
```yaml
- name: Security audit
  run: bun audit --audit-level moderate
```

### 2.5 `bun-version: latest` in CI — Low

**Fix:** Pin to a specific version: `bun-version: "1.2.x"`.

---

## 3. Application-Level

### 3.1 `/api/audit` unauthenticated + unbounded LLM spend — High

**Attack vector:** `POST /api/audit` accepts any URL, crawls up to 50 pages, and runs a full Claude enrichment workflow — no auth check. A bot firing 10 concurrent requests = 500 HTTP fetches + 10 Claude completions = potentially hundreds of dollars in minutes.

**Fix:** Add session check as first line of the handler (same pattern as `publish/start/route.ts` lines 40–46). Gate behind rate limiting (see section 7).

### 3.2 Prompt injection via unvalidated `audit` payload — Medium

**Attack vector:** `POST /api/publish/start` accepts `audit: z.unknown()` and passes it as `audit: parsed.data.audit as never` directly into the Claude prompt in `publishSiteWorkflow`. A malicious user can craft an audit object with prompt injection content to override the system prompt or extract data through model output.

**Fix:** Define a strict `AuditReport` Zod schema and validate the `audit` field before passing to the workflow. The `as never` cast is a red flag — it means this was known to be untyped.

### 3.3 Admin API routes may lack `requireAdmin()` — High

**Attack vector:** `src/app/admin/layout.tsx` gates the UI with a role check but this only protects the RSC page render — not the API routes behind it. A logged-in non-admin user can call restaurant CRUD API routes directly if they lack their own `requireAdmin()` call.

**Fix:** Audit every API route callable from the admin panel and confirm each independently calls `requireAdmin()`. Consider a middleware that applies to all `/api/admin/*` routes automatically.

### 3.4 MDX rendering of AI-scraped content — Medium

**Attack vector:** `restaurant.mdxBody` (schema line 38) stores MDX scraped from external sites and rendered with `next-mdx-remote`. Without a restricted component allowlist, a compromised AI pipeline or malicious scrape target could inject JSX that executes in the browser.

**Fix:** Confirm `next-mdx-remote` is configured with a safe `components` prop that excludes `<script>`, raw HTML, and custom JSX. Sanitize `mdxBody` written by the AI enrichment pipeline.

### 3.5 `/api/publish/check` leaks tenant `sourceUrl` — Medium

**Attack vector:** The unauthenticated endpoint returns `takenBy: existing.sourceUrl` when a subdomain is taken. An attacker can enumerate all published businesses and their original URLs via automated POST requests.

**Fix:** Remove `takenBy` from the response for unauthenticated callers. `ok: false` is sufficient without revealing the occupying source URL.

---

## 4. Auth & Session Security

### 4.1 `trustedOrigins` derived from env var — Medium

**Attack vector:** `auth.ts` line 24 constructs `trustedOrigins` from `BETTER_AUTH_URL` at runtime. A misconfigured env var (e.g., staging env pointing to wrong domain) could expand the trusted origin list unexpectedly.

**Fix:** Hardcode `trustedOrigins` to explicit production domains rather than deriving them from env vars.

### 4.2 Auth config falls back to placeholder credentials — Low

**Attack vector:** `auth.ts` lines 19–21 use `"placeholder_client_id"` / `"placeholder_client_secret"` as defaults for Google OAuth. In a misconfigured environment, auth silently degrades rather than failing loudly.

**Fix:**
```ts
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("GOOGLE_CLIENT_ID is required");
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("GOOGLE_CLIENT_SECRET is required");
```

---

## 5. Data Exposure

### 5.1 `BLOB_READ_WRITE_TOKEN` used for all operations — High

**Attack vector:** The same read-write token is used for `head`, `list`, `get`, `put`, and `del` operations. If this token leaks (e.g., from the world-readable `.env`), an attacker can overwrite any published site JSON or delete the entire blob store.

**Fix:** Use Vercel Blob's scoped read-only token for `head`/`list`/`fetch` operations. Reserve the read-write token only for write paths (`writePublishedSite`, `deletePublishedSite`).

### 5.2 Google Maps API key unrestricted — Medium

**Attack vector:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is baked into the client JS bundle. Without HTTP referrer restrictions, anyone who extracts the key can make Maps API calls billed to the project.

**Fix:** In Google Cloud Console: restrict the key to `*.aivible.tokyo/*` and `aivible.tokyo/*` as allowed HTTP referrers. Restrict by API (Maps JavaScript API only).

### 5.3 Health endpoint leaks infra details — Low

**Attack vector:** `GET /api/publish/health` returns `nodeEnv`, `sitePublicApex`, and blob config status to unauthenticated callers.

**Fix:** Restrict to admin session or protect with a secret token header (`X-Health-Token`).

---

## 6. Dependency / Supply Chain

### 6.1 `playwright` in production dependencies — Medium

**Attack vector:** `playwright@^1.59.1` is in `dependencies` (not `devDependencies`), shipping a full Chromium binary into the production server process. This increases attack surface and binary size unnecessarily if Playwright is only used for scraping in the publish workflow.

**Fix:** If Playwright is needed for scraping, run it as a separate worker/microservice. At minimum move to `devDependencies` if it's not imported in runtime code paths, or use `serverExternalPackages` in `next.config.ts` to exclude it from the bundle.

### 6.2 `workflow` package — unknown provenance — Medium

**Attack vector:** The `workflow` package (imported as `"workflow/api"` with `"use workflow"` / `"use step"` directives) is not a well-known npm package. It controls long-running server processes with full access to the app's secret environment. Its supply chain provenance and security track record are unverified.

**Fix:** Verify the package's npm provenance, maintainer identity, and download count. Pin to an exact version (`"4.2.4"` not `"^4.2.4"`). Review the package source before each upgrade.

---

## 7. Rate Limiting & Abuse Prevention

### 7.1 No rate limiting on any route — High

Every API route is unprotected from abuse at volume. Specific risks at scale:

| Route | Abuse risk | Suggested limit |
|---|---|---|
| `POST /api/audit` | Each call = 300s Claude workflow + 50 page crawls = $$$  | 3/min per IP, 10/hr per user |
| `POST /api/publish/start` | Unlimited publishes per account | 5/hr per user |
| `GET /api/img` | Bandwidth exhaustion on 1-CPU droplet | 30/min per IP |
| `POST /api/publish/check` | Tenant enumeration | 20/min per IP |

**Fix:** Implement rate limiting in `middleware.ts` at project root using a token bucket (e.g., `@upstash/ratelimit` with Redis, or in-memory for a single-instance deploy). If moving to Cloudflare DNS (recommended), use Cloudflare Rate Limiting rules as the first line of defense.

### 7.2 Subdomain squatting via `autoUnique` — Low

**Attack vector:** A malicious authenticated user can pre-register `<brand>`, `<brand>-abc1`, `<brand>-abc2`, etc. via the `autoUnique` flag, blocking a legitimate SME from their own name.

**Fix:** Add per-user subdomain ownership limit in the DB. Consider a dispute/reclaim process for brand-name subdomains.

---

## 8. DNS / Network Layer

### 8.1 No DNSSEC — Medium

**Attack vector:** Without DNSSEC, DNS responses for `aivible.tokyo` and `*.aivible.tokyo` can be spoofed on-path (cache poisoning). An attacker who poisons a resolver can redirect users to a fake site or intercept OAuth redirects.

**Fix (option A — recommended):** Move DNS from DigitalOcean to Cloudflare. Free tier includes DNSSEC, DDoS mitigation, and WAF. Update registrar nameservers to Cloudflare's. Carry over existing DO records.

**Fix (option B):** Enable DNSSEC in DigitalOcean DNS panel → add the DS record at your registrar.

### 8.2 Single-droplet, no DDoS protection — Medium

**Attack vector:** A volumetric DDoS against `159.223.83.208` takes down the entire product. DigitalOcean offers basic network-level DDoS protection but no application-layer (L7) mitigation.

**Fix:** Put Cloudflare in front (proxied mode, orange cloud). All traffic hits Cloudflare's anycast edge before reaching the droplet. The droplet IP becomes the origin and can be locked to Cloudflare IPs only via Caddy allow rules.

---

## When to Revisit This Document

- Before any public launch / press coverage
- When monthly active users exceed ~500
- When first paying SME is onboarded
- After any incident or near-miss
- Quarterly as a routine hygiene check

