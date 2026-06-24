# Deployment — ai-audit → aivible.tokyo

## Overview

The `main` branch auto-deploys to **https://aivible.tokyo** via GitHub Actions on every push.

| Environment | URL | Source |
|---|---|---|
| Production | https://aivible.tokyo | `main` branch, Next.js on DigitalOcean |
| Staging | https://staging.aivible.tokyo | Old Vite static build (aivible-app), manual deploy |
| Dev (Vercel) | https://shorobik.com | Vercel auto-deploy, devrayat000's account |

---

## Infrastructure

**Server:** DigitalOcean droplet `159.223.83.208`
**Runtime:** bun runs the app; PM2 (on Node 20) supervises it + auto-restarts on boot
**Reverse proxy:** Caddy (TLS auto-provisioned via Let's Encrypt)
**App directory:** `/var/www/ai-audit/` (Next.js standalone bundle — self-contained, no `node_modules` install on the server)

**Caddy config** (`/etc/caddy/Caddyfile`):
```
aivible.tokyo, www.aivible.tokyo {
    reverse_proxy localhost:3000
    encode gzip
}

staging.aivible.tokyo {
    root * /var/www/aivible/dist
    file_server
    try_files {path} {path}/ /index.html
    encode gzip
}

:80 {
    redir https://{host}{uri} permanent
}
```

---

## GitHub Actions workflow

File: `.github/workflows/deploy.yml`

**Trigger:** push to `main` or manual `workflow_dispatch`

**Steps:**
1. Checkout + install bun (`oven-sh/setup-bun`)
2. `bun install --frozen-lockfile`
3. `bun run build` with `BUILD_STANDALONE=true` (secrets injected as env vars) → emits a self-contained `.next/standalone/` bundle. `next.config.ts` gates `output: "standalone"` on this env var so local/Vercel builds are unaffected.
4. Copy `.next/static` and `public/` into the standalone bundle (Next omits them)
5. SCP `.next/standalone/` (server.js + traced `node_modules` + `.next` + `public`) → `/var/www/ai-audit/` with `strip_components: 2`
6. SSH: ensure bun is on `PATH` (self-installs on first run), write `.env.local`, then `pm2 restart ai-audit --update-env || pm2 start server.js --name ai-audit --interpreter ~/.bun/bin/bun` (PORT 3000, HOSTNAME 127.0.0.1). No `node_modules` install needed — it's in the bundle.

---

## Required GitHub secrets

Add at: **devrayat000/ai-audit → Settings → Secrets → Actions**

| Secret | Source | Set by |
|---|---|---|
| `DO_HOST` | `159.223.83.208` | Ely (done) |
| `DO_USER` | `root` | Ely (done) |
| `DO_SSH_KEY` | Private key for droplet | Ely (done) |
| `NEXT_PUBLIC_APP_URL` | `https://aivible.tokyo` | Ely (done) |
| `SITE_APEX_HOSTS` | `aivible.tokyo,localhost:3000,localhost` | Ely (done) |
| `SITE_PUBLIC_APEX` | `aivible.tokyo` | Ely (done) |
| `NEXT_PUBLIC_SITE_APEX` | `aivible.tokyo` | Ely (done) |
| `ANTHROPIC_API_KEY` | Vercel project env vars | Dev |
| `BLOB_READ_WRITE_TOKEN` | Vercel project env vars | Dev |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Vercel project env vars | Dev |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Vercel project env vars | Dev |
| `DATABASE_URL` | Postgres connection string | Dev |
| `BETTER_AUTH_SECRET` | Random 32+ char secret (`openssl rand -base64 32`) | Dev |
| `BETTER_AUTH_URL` | `https://aivible.tokyo/api/auth` | Dev |
| `GOOGLE_CLIENT_ID` | Google OAuth client | Dev |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client | Dev |

---

## Server setup (one-time, already done 2026-06-24)

```bash
# Node 20 (for PM2; the app itself runs on bun)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# bun (app runtime) — the deploy workflow also self-installs this on first run
curl -fsSL https://bun.sh/install | bash

# App directory
mkdir -p /var/www/ai-audit
```

---

## Manual operations

**SSH into server:**
```bash
ssh -i ~/.ssh/id_ed25519_jozzua.old root@159.223.83.208
```

**Check app status:**
```bash
pm2 status
pm2 logs ai-audit --lines 50
```

**Reload Caddy after config change:**
```bash
systemctl reload caddy
```

**Staging site** (`staging.aivible.tokyo`) is the old aivible-app Vite build. Deploy to staging by updating `/var/www/aivible/dist` — the aivible-app GitHub Actions workflow at `jozzua/aivible-app` still targets that directory.
