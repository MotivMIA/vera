# Platform agent architecture

Cursor remains the **lead engineer and dispatcher**. Narrow **platform agents** handle tedious infrastructure checks and API-backed tasks through scripts, MCP, and `gh` — not browser automation and not full-account access.

**Status:** Phase 2 — read-only scripts + documentation. No background daemons. No new tokens in repo.

**Related:** [ENTERPRISE_AUTOMATION_ACCESS.md](ENTERPRISE_AUTOMATION_ACCESS.md) · [PLATFORM_AGENT_ROLLOUT.md](PLATFORM_AGENT_ROLLOUT.md) · [prompts/platform-agent-task.md](prompts/platform-agent-task.md) · [AGENTS.md](../AGENTS.md)

---

## Design overview

```text
Human
  ↓
ChatGPT Desktop (plan, classify, innovate — no merge)
  ↓
Cursor (dispatcher + lead engineer)
  ├── GitHub Agent      → gh / GitHub MCP / Actions
  ├── Vercel Agent      → Vercel MCP / CLI / verify-vercel-env.sh
  ├── Supabase Agent    → Supabase MCP / migration PRs only
  ├── Resend Agent      → verify-resend-domain.sh / API read
  ├── Cloudflare Agent  → verify-cloudflare-dns.sh / verify-email-dns.sh
  ├── Clerk Agent       → verify-clerk-redirects.sh / API read (restricted)
  └── Docs/Research Agent → official docs, best practices (no prod API)
  ↓
Code changes → agent-cursor-* branch → PR → CI → main
```

### Dispatcher rules (Cursor)

| Cursor does | Platform agents do |
|-------------|-------------------|
| Architecture, `app/api/*`, auth code, PR creation | Scoped read checks, structured reports |
| Delegate via [platform-agent-task.md](prompts/platform-agent-task.md) | Run scripts / MCP read APIs |
| Review all agent output before ship | **Never** merge, deploy prod, or rotate secrets alone |
| Batch commits; `agent-finish.sh` when ready | Propose writes only as Phase 3 scripts + human gate |

### Global prohibitions (all agents)

- No full-account or org-admin tokens
- No personal browser sessions for automation
- No secrets in repo, issues, or chat logs
- No autonomous Stripe/banking
- No production Clerk auth changes without human + Cursor review
- No production DNS/email writes without confirmation (Phase 3)
- Platform vendor “AI assistants” (Cloudflare AI, etc.) — **research only**, not production execution

---

## Agent catalog (implementation order)

Safest first; **Cloudflare** and **Clerk** are most restricted (DNS/auth blast radius).

| Order | Agent | Phase 2 script | MCP / connector |
|-------|-------|----------------|-----------------|
| 1 | GitHub | `verify-github-repo-health.sh` | `gh`, GitHub MCP |
| 2 | Vercel | `verify-vercel-env.sh` | Vercel MCP |
| 3 | Supabase | _(schema via PR + MCP read)_ | Supabase MCP |
| 4 | Resend | `verify-resend-domain.sh` | REST read |
| 5 | Cloudflare | `verify-cloudflare-dns.sh`, `verify-email-dns.sh` | Zone-scoped token |
| 6 | Clerk | `verify-clerk-redirects.sh` | Secret key read (dev preferred) |
| 7 | Docs/Research | — | Web/docs only |

---

## 1. GitHub Agent

| Field | Detail |
|-------|--------|
| **Purpose** | Issues, PRs, labels, branch/CI status, protection awareness |
| **Allowed actions** | List/create issues and comments; open/update PRs on `agent-*`; read checks; read workflow conclusions; apply labels |
| **Prohibited actions** | Push to `main`; force-push; disable protection; org billing; delete repo; store PAT in repo |
| **Token scope** | `gh` OAuth or fine-grained PAT: repo contents, PRs, issues, actions:read |
| **Human approval** | Org settings, protection rule changes, required reviewers, repo transfer |
| **Safe read-only** | `gh pr checks`, `gh issue list`, `verify-github-repo-health.sh` |
| **Controlled write (Phase 3)** | None — writes stay in git + PR flow only |
| **Rollback** | Revert merge commit; close/reopen PR |
| **Audit/logging** | GitHub audit log (human); agent logs issue/PR URLs in task report |

---

## 2. Vercel Agent

| Field | Detail |
|-------|--------|
| **Purpose** | Deployment status, env key inventory, preview URLs, build log pointers |
| **Allowed actions** | List deployments; read build status; compare env **key names** to `lib/env.ts` / `.env.example` |
| **Prohibited actions** | Set production secret values; delete project; change team; promote prod without Cursor |
| **Token scope** | Project-scoped token; Vercel MCP read |
| **Human approval** | Production env values, custom domains, team billing |
| **Safe read-only** | `verify-vercel-env.sh`, Vercel MCP deployment list |
| **Controlled write (Phase 3)** | Preview redeploy with `--confirm-prod` gate (see ENTERPRISE doc) |
| **Rollback** | Rollback deployment in Vercel UI |
| **Audit/logging** | Deployment URLs in PR/issue comments only |

---

## 3. Supabase Agent

| Field | Detail |
|-------|--------|
| **Purpose** | Schema awareness, migration hygiene, RLS/security review support, advisors |
| **Allowed actions** | Read schema/tables/policies via MCP; suggest SQL migrations in **PR only** |
| **Prohibited actions** | `service_role` in agent context; disable RLS; apply prod DDL outside PR; delete project |
| **Token scope** | MCP project access; anon for app patterns only in docs |
| **Human approval** | Production migration apply, JWT secret rotation, auth provider linkage |
| **Safe read-only** | MCP table list, policy read, advisor output in review |
| **Controlled write (Phase 3)** | None direct — migrations merged via CI only |
| **Rollback** | Forward-fix migration PR; PITR (human) |
| **Audit/logging** | Migration files + PR history |

---

## 4. Resend Agent

| Field | Detail |
|-------|--------|
| **Purpose** | Domain verification, DKIM/SPF alignment hints, transactional config checks |
| **Allowed actions** | List domains; read verification status; correlate with `verify-email-dns.sh` |
| **Prohibited actions** | Delete domain; change billing; bulk marketing sends |
| **Token scope** | API key: send + domains read |
| **Human approval** | New production domain, API key rotation, compliance templates |
| **Safe read-only** | `verify-resend-domain.sh`, `verify-email-dns.sh` |
| **Controlled write (Phase 3)** | `resend-add-domain.sh` with human approval |
| **Rollback** | Revoke key; re-verify domain in dashboard |
| **Audit/logging** | Domain ID + status in issue comment (no API key) |

---

## 5. Cloudflare Agent (restricted)

| Field | Detail |
|-------|--------|
| **Purpose** | DNS, email routing DNS, zone health — **high blast radius** |
| **Allowed actions** | Public `dig`; zone API **read** with zone-scoped token |
| **Prohibited actions** | Account-wide token; registrar; delete zone; WAF off; routing writes without Phase 3 confirm |
| **Token scope** | Zone `visual-era.com`: DNS read, Email Routing read (write Phase 3 only) |
| **Human approval** | Any DNS or email routing **write**; new zone |
| **Safe read-only** | `verify-cloudflare-dns.sh`, `verify-email-dns.sh` |
| **Controlled write (Phase 3)** | `cloudflare-add-dns-record.sh`, `cloudflare-email-routing.sh` + interactive confirm |
| **Rollback** | DNS export before change; revert record in dashboard/API |
| **Audit/logging** | Record name/type/action in GitHub issue; Cloudflare audit (human) |

---

## 6. Clerk Agent (restricted)

| Field | Detail |
|-------|--------|
| **Purpose** | Redirect URL parity, allowed origins checklist, dev/staging diagnostics |
| **Allowed actions** | Read instance metadata (dev key); env-based URL checklist; user/session debug in **dev only** |
| **Prohibited actions** | Production secret rotation; SAML/OAuth changes; JWT template edits via agent |
| **Token scope** | Dev `CLERK_SECRET_KEY` for API read; prod = dashboard human only |
| **Human approval** | **All production auth configuration** |
| **Safe read-only** | `verify-clerk-redirects.sh` |
| **Controlled write (Phase 3)** | Export redirect doc only — no prod API writes |
| **Rollback** | Revert app PR; restore Clerk dashboard settings manually |
| **Audit/logging** | Clerk dashboard changelog (human); agent cites expected URLs from `.env.example` |

---

## 7. Docs/Research Agent

| Field | Detail |
|-------|--------|
| **Purpose** | Official vendor docs, best-practice summaries, architecture options for ChatGPT/Cursor |
| **Allowed actions** | Read public docs; summarize; propose checklists; cross-link repo docs |
| **Prohibited actions** | Execute production changes; hold tokens; contradict ENTERPRISE_AUTOMATION_ACCESS |
| **Token scope** | None |
| **Human approval** | Adopting new vendors or changing security model |
| **Safe read-only** | All research |
| **Controlled write** | Updates to `docs/*` via normal PR only |
| **Rollback** | Git revert |
| **Audit/logging** | Citations (URLs) in PR description |

---

## Delegation flow

1. **ChatGPT** or **Human** defines goal and risk tier.
2. **Cursor** picks agent(s) and fills [platform-agent-task.md](prompts/platform-agent-task.md).
3. Agent runs **read-only scripts** or MCP reads; returns structured report.
4. If code/config change needed → **Cursor** implements on `agent-cursor-*`, not the platform agent alone.
5. **Cursor** runs `agent-quick-check.sh` → `agent-finish.sh` when the unit is complete.

### Innovation from ChatGPT

Grok/ChatGPT **innovation** stays upstream (ideas, architecture sketches). Platform agents execute **narrow, verifiable** tasks — they do not replace Cursor review.

---

## Code vs platform work

| Work type | Path |
|-----------|------|
| App code, API routes, middleware | Cursor → PR → CI |
| DNS, email, Resend domain | Cloudflare/Resend agent report → human/Cursor Phase 3 script |
| Clerk prod settings | Human dashboard + Cursor review |
| Docs | Docs agent or Cursor → PR |

---

## Related automation

- Phase 2 runner: `./scripts/ops/run-phase2-verify.sh`
- Access matrix: [ENTERPRISE_AUTOMATION_ACCESS.md](ENTERPRISE_AUTOMATION_ACCESS.md)
- Rollout phases: [PLATFORM_AGENT_ROLLOUT.md](PLATFORM_AGENT_ROLLOUT.md)
