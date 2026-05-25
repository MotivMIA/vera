# Enterprise automation access plan

Visual Era / VERA — which services may be automated, how agents authenticate, and what stays human-approved.

**Status:** Documentation only (Phase 1). No production API connections or secrets in this repository.

**Related:** [OPERATIONAL_IDENTITY.md](OPERATIONAL_IDENTITY.md) · [ACCOUNT_STRUCTURE.md](ACCOUNT_STRUCTURE.md) · [AGENTS.md](../AGENTS.md) · [CI_CD.md](CI_CD.md)

---

## Principles

| # | Rule |
|---|------|
| 1 | **Least privilege** — scoped tokens and roles only; no “admin because convenient.” |
| 2 | **No personal sessions for automation** — use service accounts, machine users, and dedicated API tokens; never automate via a developer’s browser login. |
| 3 | **No secrets in the repo** — `.env*`, `mcp.env`, and password-manager references only; see [Secret storage](#secret-storage). |
| 4 | **Prefer existing connectors** — GitHub (`gh`), Cursor MCP (GitHub / Supabase / Vercel where configured), GitHub Actions for CI — before custom long-lived tokens. |
| 5 | **Human gate for irreversible or high-blast-radius** — production auth, payments, banking, org ownership, and key rotation require explicit human approval. |
| 6 | **AI is advisory + scoped execution** — agents may read diagnostics and propose changes; write automation runs through scripts with confirmation or human merge (PR for code). |

### Access tiers (used below)

| Tier | Meaning |
|------|---------|
| **R0 — None** | No API token to agents; human-only UI. |
| **R1 — Read** | List/get status, logs, config metadata; no writes. |
| **R2 — Scoped write** | Writes limited to named resources (one zone, one project, one repo). |
| **R3 — Human only** | Even if API exists, automation is prohibited; human performs action. |

---

## Summary matrix

| Service | API | Preferred auth | Min permissions (automation) | AI: allowed | AI: prohibited | Human approval required |
|---------|-----|----------------|------------------------------|-------------|----------------|-------------------------|
| [GitHub](#github) | Yes | `gh` OAuth / fine-grained PAT / GitHub MCP | Repo-scoped: contents, PRs, issues, actions:read | Issues, PRs, branch CI, read workflows | Org delete, bypass protection, PAT on `main` | Org settings, billing, delete repo, change protection |
| [Vercel](#vercel) | Yes | Team token / Vercel MCP | Project read; preview deploy read | Env **names** (not values), deployment status | Production promote without approval | Prod env values, domain purchase, team billing |
| [Supabase](#supabase) | Yes | Supabase MCP / project-scoped token | Read schema, logs, advisors; no service role to agents | Migrations **via PR only**; read RLS policies | `service_role` in agent context, disable RLS | Prod DDL, auth provider keys, disable RLS |
| [Cloudflare](#cloudflare) | Yes | Zone-scoped API token | Zone DNS + Email Routing read; write = Phase 3 | DNS/MX verification (Phase 2) | Account-wide token, WAF bypass, registrar transfer | Zone delete, account member changes |
| [Resend](#resend) | Yes | API key (sending + domain read) | Send + domains read; no billing | Domain verification checks (Phase 2) | Mass broadcast without review | Billing, delete domain, API key with full account |
| [Clerk](#clerk) | Yes | Secret key (restricted env) | **Dev/staging** instance read; prod read-only metadata | List redirect URLs, instance metadata (read) | Prod secret keys, JWT templates, SAML | **All production auth config changes** |
| [Google / Gmail / Workspace](#google-gmail-workspace) | Partial | Service account (Workspace) or none for Gmail UI | None for consumer Gmail automation | N/A for `vera.platforms@gmail.com` inbox | Agent login to Gmail, read full mailbox | Account recovery, 2FA, delegation, Workspace admin |
| [1Password](#1password) | Yes (CLI/SDK) | Service account / Connect (server) | Inject named secrets into CI only | Reference secret **names** in docs | Full vault export to agent context | Vault structure, member access, recovery |
| [Stripe / banking](#stripe-banking) | Yes | Restricted Stripe key (future) | **None to agents** | Read-only test-mode metadata (future, human-gated) | Any charge, payout, connect, refund | **All** money movement and bank linking |

---

## GitHub

| Field | Detail |
|-------|--------|
| **API availability** | REST, GraphQL, GitHub Apps, fine-grained PATs, `gh` CLI |
| **Recommended auth** | **Primary:** `gh auth login` on developer/CI machines (OAuth). **Agents:** GitHub MCP (`api.githubcopilot.com/mcp`) with PAT from env (not committed). **CI:** `GITHUB_TOKEN` or GitHub App installation token |
| **Minimum permissions** | Single repo (`MotivMIA/vera`): Contents (read/write on branches), Pull requests, Issues, Actions (read), Metadata (read). No org admin |
| **Allowed AI actions** | Create/update issues and PRs on `agent-*` branches; comment on PRs; read checks and workflow runs; suggest code via PR (merge via CI + auto-merge policy) |
| **Prohibited AI actions** | Push to `main`; force-push; disable branch protection; create org-wide PATs; add collaborators; modify billing; delete repository |
| **Human approval** | Organization settings, SSO, billing, default branch protection changes, required reviewers count, repo transfer/delete |
| **Secret storage** | `GITHUB_TOKEN` in GitHub Actions secrets; local `gh` credential store; optional `GITHUB_PERSONAL_ACCESS_TOKEN` in `.cursor/mcp.env` (gitignored) — see `scripts/setup-cursor-mcp.sh` |
| **Rollback / recovery** | Revert PR merge on `main`; restore branch from tag; GitHub audit log for org events; redeploy prior Vercel deployment after code revert |

**Connector note:** Prefer `gh` + existing Actions workflows over new long-lived PATs.

---

## Vercel

| Field | Detail |
|-------|--------|
| **API availability** | REST API, Vercel MCP (`mcp.vercel.com`) |
| **Recommended auth** | Team-scoped token tied to **MotivMIA/visual-era** project only; MCP OAuth where available |
| **Minimum permissions** | Project: read deployments, read env **variable names**, read domains; no account billing |
| **Allowed AI actions** | List deployments and build logs; read preview URLs; document env key inventory (names only) |
| **Prohibited AI actions** | Set production env secrets via API; delete project; attach new production domain; change team ownership |
| **Human approval** | Production env **values**, custom domain on apex, team billing, deletion of project |
| **Secret storage** | Vercel dashboard → Project → Environment Variables; sync to local `.env.local` (gitignored); never commit |
| **Rollback / recovery** | Instant rollback to previous production deployment in Vercel UI; redeploy from known-good Git tag on `main` |

---

## Supabase

| Field | Detail |
|-------|--------|
| **API availability** | Management API, Supabase MCP, Postgres connection |
| **Recommended auth** | Supabase MCP with project-scoped access; **anon** key for app runtime only; **never** inject `service_role` into agent/MCP context |
| **Minimum permissions** | Read: schema, advisors, logs (where enabled), branch status. Writes: schema changes only through versioned SQL migrations in repo + human-reviewed PR |
| **Allowed AI actions** | Read table list, RLS policies (read-only), suggest migrations in PR; run local tests against dev/staging |
| **Prohibited AI actions** | Disable RLS; run arbitrary SQL with service role; rotate JWT secret via API; delete project; expose service role in client or docs |
| **Human approval** | Production migration apply, auth provider changes, enabling extensions, point-in-time recovery restore |
| **Secret storage** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env; `SUPABASE_SERVICE_ROLE_KEY` CI-only if needed; password manager item “Supabase — vera prod” |
| **Rollback / recovery** | Revert migration PR + forward-fix migration; Supabase backup/PITR per plan (human-triggered) |

---

## Cloudflare

| Field | Detail |
|-------|--------|
| **API availability** | REST API (zone-scoped tokens) |
| **Recommended auth** | **Zone-scoped API token** for `visual-era.com` only — not account-global |
| **Minimum permissions (Phase 1 token)** | Zone → DNS → Read; Zone → Email Routing → Read (add Write in Phase 3 only after runbook) |
| **Allowed AI actions (Phase 2)** | Verify DNS records, MX/SPF/DKIM for email routing (read-only scripts) |
| **Prohibited AI actions** | Account member changes; registrar transfer; delete zone; global API token; WAF disable on production |
| **Human approval** | New zone, billing, token creation with Write on production DNS, email routing rule changes (Phase 3: script + explicit confirm) |
| **Secret storage** | 1Password item: `Cloudflare API — visual-era.com (scoped)`; optional `CLOUDFLARE_API_TOKEN` in local env (gitignored) for Phase 2 scripts |
| **Rollback / recovery** | DNS snapshot/export before changes; revert record via API or dashboard; Email Routing rules documented in `docs/ops/CLOUDFLARE_EMAIL_ROUTING.md` |

**Phase 1 deliverable:** Create token in dashboard with Read-only DNS + Email Routing; store in Operations vault; document token ID and scopes in password manager (not in repo).

---

## Resend

| Field | Detail |
|-------|--------|
| **API availability** | REST API |
| **Recommended auth** | API key with **Sending access** + **Domains read** only (no full account admin) |
| **Minimum permissions** | Send from verified domains; list/verify domain status; no billing API |
| **Allowed AI actions (Phase 2)** | Verify domain DNS alignment with Cloudflare; read delivery logs for debugging |
| **Prohibited AI actions** | Create/delete sending domains without human approval; change billing; broadcast to marketing lists without review |
| **Human approval** | New production domain, API key rotation, template changes affecting legal/compliance copy |
| **Secret storage** | `RESEND_API_KEY` in Vercel (production/preview); 1Password item “Resend — vera transactional” |
| **Rollback / recovery** | Revoke key in Resend dashboard; issue new key; update Vercel env; no automatic “undo send” |

---

## Clerk

| Field | Detail |
|-------|--------|
| **API availability** | Backend API, Dashboard (no full automation for all settings) |
| **Recommended auth** | **Development** secret key for local/staging automation; **Production** — read-only metadata via restricted key or human export only |
| **Minimum permissions** | Dev instance: read instance settings, redirect URLs, JWT template names (not secrets). Prod: **no secret key in agent tools** |
| **Allowed AI actions** | Document redirect URL checklist; read dev instance config for parity testing; code changes to Clerk integration only via PR |
| **Prohibited AI actions** | Change production Clerk instance keys, SAML/OAuth providers, session settings, or user deletion via API without human sign-off |
| **Human approval** | **All production auth configuration changes** (instances, keys, social providers, webhooks, allowed origins) |
| **Secret storage** | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*` in Vercel; separate dev vs prod items in 1Password |
| **Rollback / recovery** | Revert application PR; restore previous Clerk dashboard export (manual); rotate secret if leaked |

---

## Google / Gmail / Workspace

| Field | Detail |
|-------|--------|
| **API availability** | Gmail API, Admin SDK (Workspace only), OAuth for user mailboxes |
| **Recommended auth** | **Do not** automate `vera.platforms@gmail.com` via agent OAuth. Future: Google Workspace service account with domain-wide delegation **only** if Visual Era moves to Workspace |
| **Minimum permissions** | **R0 for agents** on consumer Gmail infrastructure account |
| **Allowed AI actions** | Document aliases and routing in repo; human performs inbox/2FA in browser |
| **Prohibited AI actions** | Agent OAuth to infrastructure Gmail; read full mailbox; change recovery phone/email; disable 2FA |
| **Human approval** | Account creation, recovery options, 2FA device add/remove, forwarding rules on infrastructure account |
| **Secret storage** | Infrastructure Gmail password + 2FA in 1Password **Operations** vault only; recovery codes offline |
| **Rollback / recovery** | Google account recovery flow; revert Cloudflare email routing (see Cloudflare) |

---

## 1Password

| Field | Detail |
|-------|--------|
| **API availability** | 1Password CLI (`op`), Connect, Service Accounts |
| **Recommended auth** | **Service account** with access to **Operations** vault only — not Personal or full org |
| **Minimum permissions** | Read specific items referenced by name (`op read op://Operations/...`); no vault administration |
| **Allowed AI actions** | Document secret **item names** and rotation schedule; CI reads named fields via service account |
| **Prohibited AI actions** | Dump full vault to chat/logs; share service account token with agents; grant AI “full vault” MCP |
| **Human approval** | Vault creation, member invites, recovery, service account scope changes |
| **Secret storage** | 1Password is the **system of record**; repo contains only `op://` references in private runbooks (optional, not required in git) |
| **Rollback / recovery** | Item versioning in 1Password; re-issue service account token; audit Events API (human review) |

**Vault layout (from [ACCOUNT_STRUCTURE.md](ACCOUNT_STRUCTURE.md)):** Personal · Operations · Development — automation service account → **Operations** (+ Development for non-prod keys only).

---

## Stripe / banking

| Field | Detail |
|-------|--------|
| **API availability** | Stripe API; banking via institution portals (no unified API) |
| **Recommended auth** | **None for agents today.** Future: Stripe **restricted** read-only test key for dashboard scripts, held by human |
| **Minimum permissions** | **R0** — no Stripe or bank tokens in CI, MCP, or agent env |
| **Allowed AI actions** | Document payment architecture in repo; reference Stripe object names in issues only |
| **Prohibited AI actions** | Charges, refunds, payouts, Connect onboarding, customer PII export, bank login automation |
| **Human approval** | **All** payment and banking actions — API keys, webhooks, live mode, bank transfers, tax/billing identity |
| **Secret storage** | 1Password “Stripe — vera (live)” restricted to owners; never in Vercel until product launch with review |
| **Rollback / recovery** | Stripe Dashboard dispute/refund (human); no agent-initiated rollback |

---

## Secret storage (canonical)

| Location | Holds | Agents |
|----------|-------|--------|
| **GitHub Actions secrets** | `GITHUB_TOKEN`, deploy hooks | CI only |
| **Vercel env** | App runtime secrets (Clerk, Supabase, Resend, Didit) | No read of **values** by agents |
| **`.env.local` / `.cursor/mcp.env`** | Local dev, MCP PATs | Gitignored; never commit |
| **1Password Operations vault** | Cloudflare token, infra Gmail recovery, API rotation | CI service account read named items only |
| **1Password Development vault** | Dev/staging keys | Local dev humans |
| **Offline** | Hardware 2FA, recovery codes | Human only |

**Never:** commit tokens, paste secrets into Copilot/Cursor chat, store production Clerk/Stripe keys in issue bodies.

---

## AI agent boundaries (Cursor / Codex / ChatGPT)

| Context | May use | Must not use |
|---------|---------|--------------|
| **Cursor MCP (project)** | Supabase + Vercel read connectors; GitHub MCP when PAT configured | Production write tokens, Stripe, bank, full 1Password |
| **Codex Cloud** | Same as Cursor brief; branch-scoped code | PR merge, deploy, secrets |
| **ChatGPT Desktop** | Plans, briefs, issue text | Direct API calls with secrets |
| **GitHub Actions** | Repo + deployment secrets defined by humans | Ad-hoc elevation without workflow review |

High-risk paths remain **Cursor-owned** per [AGENTS.md](../AGENTS.md): `middleware.ts`, `app/api/*`, `lib/env.ts`, `lib/didit.ts`, migrations.

---

## Rollout plan

### Phase 1 — Document and scoped credentials (now)

**Goal:** Access matrix approved; tokens created but not wired into agent automation.

| Task | Owner | Done when |
|------|-------|-----------|
| Publish this document | Cursor / human review | Merged to `main` |
| Create Cloudflare zone token (DNS + Email Routing **Read**) | Human | Token in 1Password; scopes recorded |
| Create Resend API key (send + domains read) | Human | Key in Vercel + 1Password |
| Document Clerk dev vs prod restrictions | Cursor | Section above + runbook link in issue |
| Confirm banking/Stripe human-only | Human | No keys in Vercel/agents |
| Audit GitHub branch protection + agent naming | CI | Existing workflows green |
| Link from operational identity docs | Cursor | Cross-links in OPERATIONAL_IDENTITY / ACCOUNT_STRUCTURE (optional follow-up) |

**Out of scope Phase 1:** Production write scripts; MCP storing Cloudflare/Resend tokens.

---

### Phase 2 — Read-only verification scripts

**Goal:** Safe diagnostics runnable locally or in CI with read-only tokens.

| Script | Service | Checks |
|--------|---------|--------|
| `scripts/ops/verify-github-repo-health.sh` | GitHub | Open PRs, branch protection |
| `scripts/ops/verify-cloudflare-dns.sh` | Cloudflare | Apex/www records; optional CF API read |
| `scripts/ops/verify-email-dns.sh` | Cloudflare + Resend | MX, SPF, DKIM (dig) |
| `scripts/ops/verify-vercel-env.sh` | Vercel | Required env **keys** (not values) |
| `scripts/ops/verify-resend-domain.sh` | Resend | Domain list via API |
| `scripts/ops/verify-clerk-redirects.sh` | Clerk | Redirect env + optional instance read |

**Runner:** `./scripts/ops/run-phase2-verify.sh` · See [scripts/ops/README.md](../scripts/ops/README.md) and [PLATFORM_AGENT_ARCHITECTURE.md](PLATFORM_AGENT_ARCHITECTURE.md).

**Requirements:** Tokens from 1Password or env (gitignored); `SKIP` when unset; `FAIL` on drift; no writes; redacted logs only.

---

### Phase 3 — Controlled write automation

**Goal:** Repeatable operations with human confirmation gates (`confirm`, PR, or typed phrase).

| Script (planned) | Action | Gate |
|------------------|--------|------|
| `scripts/ops/cloudflare-add-dns-record.sh` | Add/update DNS record | Interactive confirm + dry-run |
| `scripts/ops/cloudflare-email-routing.sh` | Add routing rule | Human approval + issue link |
| `scripts/ops/rotate-api-key.sh` | Generic rotation checklist | Human performs vendor UI; script updates Vercel names only |
| `scripts/ops/vercel-redeploy.sh` | Redeploy preview or production | Production requires `--confirm-prod` |
| `scripts/ops/resend-add-domain.sh` | Register domain in Resend | Human approval |
| `scripts/ops/clerk-sync-redirects-doc.sh` | Export redirect list to doc | No prod writes |

**Prohibited in Phase 3 automation:** Clerk production auth changes, Stripe charges, 1Password vault admin, GitHub org admin.

---

## Human approval checklist (quick reference)

Use this before any automation token gets **write** scope or Phase 3 script runs against production:

- [ ] Documented in GitHub issue with risk label (`high-risk` / `ops`)
- [ ] Scoped to single service + single zone/project/repo
- [ ] Stored in 1Password Operations vault (not repo)
- [ ] Rollback steps written
- [ ] Production Clerk / Stripe / banking still human-only
- [ ] Second human ack for production DNS and email routing (recommended)

---

## Implementation tracking

Suggested GitHub issues (create when starting Phase 2):

1. **Phase 2 read-only ops scripts** — labels: `ops`, `enhancement`
2. **Cloudflare write token + Phase 3 DNS script** — labels: `ops`, `high-risk`
3. **Clerk production change runbook** — labels: `security`, `documentation`

Existing issues: [#35](https://github.com/MotivMIA/vera/issues/35)–[#38](https://github.com/MotivMIA/vera/issues/38) (security hardening), [#40](https://github.com/MotivMIA/vera/issues/40) (Cloudflare email routing).

---

**Last updated:** Phase 2 read-only scripts shipped; Phase 3 writes not implemented. No credentials in repository.
