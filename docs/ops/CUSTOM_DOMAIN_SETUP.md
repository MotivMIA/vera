# Custom domain — visual-era.com → Vercel

Production should use **`https://visual-era.com`** (not only `visual-era.vercel.app`).

**Status:** Domains added in Vercel project `visual-era`. **DNS at Cloudflare must be updated** (human step).

---

## Vercel (done via CLI)

These domains are attached to project **visual-era** (`motivmias-projects`):

- `visual-era.com`
- `www.visual-era.com`
- `visual-era.vercel.app` (default Vercel URL — keep as alias)

Verify:

```bash
vercel domains ls
vercel inspect visual-era.com
```

---

## Cloudflare DNS (required — you)

Zone: **visual-era.com** (nameservers: Cloudflare — keep them).

### If Cloudflare says “CNAME already exists”

**Do not add a second `www` record.** Edit the existing one:

1. Cloudflare → **visual-era.com** → **DNS**
2. Find the row for **`www`** (or `www.visual-era.com`)
3. **Edit** (pencil) — do not “Add record”
4. Set **Target** to `cname.vercel-dns.com`
5. **Proxy status:** DNS only (grey cloud) for first setup
6. Save

For apex **`@`**:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| **A** | `@` | `76.76.21.21` | DNS only (grey cloud) |

Remove duplicate apex **A** rows that point at Cloudflare IPs (`104.21.x` / `172.67.x`) after adding Vercel’s A record, or run the script below.

### Automated (API token)

```bash
export CLOUDFLARE_API_TOKEN='…'   # Zone → DNS → Edit
./scripts/ops/configure-cloudflare-vercel-dns.sh        # preview
./scripts/ops/configure-cloudflare-vercel-dns.sh --apply
```

Vercel recommends for apex while staying on Cloudflare:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| **A** | `@` (apex) | `76.76.21.21` | **DNS only** (grey cloud) recommended for first setup |
| **CNAME** | `www` | `cname.vercel-dns.com` | DNS only or proxied per Vercel docs |

After saving DNS, wait for propagation (minutes–hours). Vercel will email when verification completes.

**Do not** switch nameservers to Vercel unless you intend to move DNS off Cloudflare entirely.

### Optional: keep Cloudflare proxy (orange cloud)

If you proxy apex through Cloudflare, use [Vercel + Cloudflare guidance](https://vercel.com/docs/domains/working-with-domains/add-a-domain#cloudflare) and ensure SSL mode **Full (strict)**.

---

## Vercel environment variables (required after domain works)

In Vercel → **visual-era** → **Settings** → **Environment Variables** → **Production** (and Preview if needed):

```text
NEXT_PUBLIC_SITE_URL=https://visual-era.com
```

Keep existing Clerk, Supabase, Didit keys unchanged unless rotating.

Redeploy production after updating:

```bash
vercel --prod
# or push to main on Vera-Platforms/vera after Git reconnect
```

---

## Clerk (required after domain live)

In [Clerk Dashboard](https://dashboard.clerk.com) → your instance → **Domains** / **Paths**:

- Add **`https://visual-era.com`** to allowed origins
- Keep **`https://visual-era.vercel.app`** during transition
- Confirm sign-in / sign-up redirect URLs still match app paths (`/sign-in`, `/onboarding/consent`, etc.)

Same-origin `/__clerk` proxy unchanged — see `docs/VERCEL_DEPLOYMENT.md`.

Smoke test:

```bash
PRODUCTION_URL=https://visual-era.com ./scripts/production-clerk-proxy-smoke.sh
```

---

## Verify locally

```bash
./scripts/ops/verify-custom-domain.sh
```

---

## Rollback

- Remove custom domain in Vercel → Domains
- Revert `NEXT_PUBLIC_SITE_URL` to `https://visual-era.vercel.app`
- Traffic continues on `visual-era.vercel.app`
