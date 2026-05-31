# Agent full-access setup — Visual Era (one-time)

Goal: let **vera-website** (Cursor Agent) implement and operate the onboarding site with minimal human clicks — without putting secrets in chat or git.

**Repo:** `natew-dev/vera` · **Prod URL:** https://visual-era.com · **Local:** http://localhost:3001

---

## Rules (always)

| Do | Don't |
|----|--------|
| Store app keys in **`.env`** (gitignored) | Paste API keys in Cursor chat |
| Store MCP tokens in **`.cursor/mcp.env`** | Commit `.env` or `mcp.env` |
| Use **Auto-Run** + sandbox for scripts | Share personal Gmail password for “automation” |
| Rotate keys after major dev phase | Use production DB from local unless you accept risk |

---

## Phase 0 — Cursor Cloud secrets (cloud agents only)

In **Cursor → Cloud Agent → Secrets** for this repo, add at minimum:

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client auth (required for UI) |
| `CLERK_SECRET_KEY` | Server auth + webhooks |
| `NEXT_PUBLIC_SUPABASE_URL` | Database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client DB |
| `SUPABASE_SERVICE_ROLE_KEY` | Server onboarding snapshot |
| `NEXT_PUBLIC_SITE_URL` | Use `http://localhost:3001` for cloud dev |

Optional for full onboarding slice: Didit keys (`DIDIT_*`), `CLERK_WEBHOOK_SIGNING_SECRET`.

Without Clerk publishable key, the marketing auth card stays on a loading spinner.

Use **`pk_test_` / `sk_test_`** for cloud dev — do **not** set `NEXT_PUBLIC_CLERK_PROXY_URL` in Cloud secrets (dev instances do not support FAPI proxy).

---

## Phase 0b — Cursor desktop (5 minutes)

1. **Open folder:** `~/Documents/projects/visual-era` (repo root only).
2. **Settings → Agents → Auto-Run:** **Allowlist (with Sandbox)**.
3. **Sandbox:** [CURSOR_SANDBOX_SETUP.md](./CURSOR_SANDBOX_SETUP.md) — allow read/write for this repo path.
4. Tell the agent once:

   ```text
   Full-access mode: keys in .env, MCP connected. Proceed without asking for secrets.
   ```

---

## Phase 1 — Local app env (`.env`)

You already use a single **`.env`**. Verify:

```bash
npm run env:check
npm run dev
npm run dev:smoke
```

| Key | Local value | Vercel Production |
|-----|-------------|-------------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` | `https://visual-era.com` |
| `ALLOW_DEV_AUTH_BYPASS` | `true` | **unset** |
| All Clerk / Supabase / Didit keys | filled | same names, import via dashboard |

Details: [LOCAL_ENV.md](./LOCAL_ENV.md)

---

## Phase 2 — GitHub

**Terminal (one-time):**

```bash
gh auth login
gh auth status
```

**Optional — GitHub MCP:**

```bash
cp .cursor/mcp.env.example .cursor/mcp.env
# Add fine-grained PAT: repo natew-dev/vera, contents + PRs + issues
```

**Cursor:** enable **user-github** MCP if listed in MCP settings.

**Agent can:** branches, PRs, issues, CI status — not delete repo or change org billing.

---

## Phase 3 — Vercel

**Terminal:**

```bash
vercel login
vercel link --yes --project visual-era   # creates .vercel/project.json
./scripts/sync-vercel-env.sh             # push missing keys from .env (no values printed)
```

**Cursor:** enable **Vercel** MCP (`user-vercel` or plugin-vercel).

**Agent can:** `vercel` CLI + Vercel MCP — deployments, logs, env sync script, project status.

**Production overrides (not in local `.env`):**

- `NEXT_PUBLIC_SITE_URL=https://visual-era.com`
- **No** `ALLOW_DEV_AUTH_BYPASS` on Production/Preview

---

## Phase 4 — Supabase

**Cursor:** enable **Supabase** MCP → select your Visual Era project.

**`.env` must have:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Agent can:** read schema, advisors, logs; migrations **via PR** in repo.

**Human-only unless you explicitly say apply:** remote `supabase db push` / production DDL.

---

## Phase 5 — Clerk

**`.env` must have:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET` ← from Clerk Dashboard → Webhooks

**Cursor:** enable **Clerk** MCP.

**Clerk Dashboard (one-time per environment):**

| Setting | Production | Local dev |
|---------|------------|-----------|
| Allowed origins | `https://visual-era.com` | `http://localhost:3001` |
| Webhook endpoint | `https://visual-era.com/api/webhooks/clerk` | use tunnel or skip local webhooks |
| After sign-in URL | `/onboarding/consent` | (same; env URLs in `.env`) |

**Agent can:** implement webhook route + tests; read instance metadata via MCP.

**Agent cannot:** change prod SAML/SSO or delete instance without you.

---

## Phase 6 — Didit

**No Didit MCP** — access is **API keys in `.env` only:**

- `DIDIT_API_KEY`
- `DIDIT_WORKFLOW_ID`
- `DIDIT_WEBHOOK_SECRET`
- `DIDIT_WEBHOOK_SECRET_PREVIOUS` (optional)

**Didit Dashboard (one-time):**

- Webhook URL (production): `https://visual-era.com/api/didit/...` (exact path in [CODEBASE_MAP.md](../CODEBASE_MAP.md))
- Local webhooks: Cloudflare Tunnel or ngrok → temporary URL

**Agent can:** `lib/didit.ts`, `app/api/didit/**`, verification UI.

---

## Phase 7 — Optional (email / DNS)

| Service | Access | Notes |
|---------|--------|-------|
| **Resend** | Resend MCP | Transactional email only |
| **Cloudflare** | Cloudflare MCP / zone token | DNS for visual-era.com |

Skip until you need email or DNS changes.

---

## Phase 8 — Handoff message to agent

When Phases 0–6 are done, send in **vera-website** chat:

```text
Platform access is configured. Keys in .env (do not print). MCP: GitHub, Vercel, Supabase, Clerk connected.
Auto-run enabled. Proceed with onboarding work; ask only for irreversible prod actions.
```

---

## What will always need you (by design)

- First-time **OAuth / MCP connect** clicks in Cursor
- **2FA** challenges on provider logins
- **Billing**, org ownership, domain purchase
- **Production** migration apply (unless you explicitly delegate)
- **Key rotation** after launch (planned)

---

## Verify everything

```bash
npm run env:check
gh auth status
vercel whoami
npm run dev:smoke    # with dev server running
./scripts/agent-quick-check.sh
```
