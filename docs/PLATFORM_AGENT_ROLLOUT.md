# Platform agent rollout

Phased introduction of platform agents under Cursor dispatch. Aligns with [ENTERPRISE_AUTOMATION_ACCESS.md](ENTERPRISE_AUTOMATION_ACCESS.md) and [PLATFORM_AGENT_ARCHITECTURE.md](PLATFORM_AGENT_ARCHITECTURE.md).

**No background daemons.** Agents are roles + scripts + MCP reads invoked by Cursor or humans.

---

## Phase 1 — Documentation and access matrix (complete)

| Deliverable | Status |
|-------------|--------|
| [ENTERPRISE_AUTOMATION_ACCESS.md](ENTERPRISE_AUTOMATION_ACCESS.md) | Merged |
| [PLATFORM_AGENT_ARCHITECTURE.md](PLATFORM_AGENT_ARCHITECTURE.md) | This rollout |
| [prompts/platform-agent-task.md](prompts/platform-agent-task.md) | This rollout |
| Scoped tokens documented in 1Password | Human — not in repo |
| No production writes | Enforced |

---

## Phase 2 — Read-only checks (current)

**Goal:** Safe diagnostics; agents report drift without changing production.

### Scripts (implemented)

| Script | Agent | Notes |
|--------|-------|-------|
| `scripts/ops/verify-github-repo-health.sh` | GitHub | Needs `gh auth` |
| `scripts/ops/verify-vercel-env.sh` | Vercel | Key names only |
| `scripts/ops/verify-cloudflare-dns.sh` | Cloudflare | Public dig + optional CF API |
| `scripts/ops/verify-email-dns.sh` | Cloudflare / Resend | MX/SPF/DKIM dig |
| `scripts/ops/verify-resend-domain.sh` | Resend | Needs `RESEND_API_KEY` |
| `scripts/ops/verify-clerk-redirects.sh` | Clerk | Env + optional API read |

**Runner:**

```bash
./scripts/ops/run-phase2-verify.sh
```

### Agent implementation order (safest → most restricted)

1. **GitHub Agent** — adopt `gh` + `verify-github-repo-health.sh` in every ship checklist  
2. **Vercel Agent** — env key parity before `agent-finish.sh` on deploy-related PRs  
3. **Supabase Agent** — MCP schema read during migration PRs  
4. **Resend Agent** — domain verify when email work is in scope  
5. **Cloudflare Agent** — DNS/email dig before closing #40  
6. **Clerk Agent** — redirect check on auth/onboarding PRs  
7. **Docs/Research Agent** — parallel; no API  

### Cursor workflow addition

Before shipping infra-adjacent PRs:

```bash
./scripts/ops/run-phase2-verify.sh
```

Paste summary into PR body (redacted). SKIP lines are OK without tokens.

### Exit criteria for Phase 2

- [ ] Team runs `run-phase2-verify.sh` locally at least once  
- [ ] Optional: CI job runs dig-only checks (no secrets) on schedule  
- [ ] Cloudflare read token in 1Password (optional for API branch of scripts)  
- [ ] Resend read key available for domain script when using Resend  

---

## Phase 3 — Controlled writes (future)

**Goal:** Repeatable remediation with confirmation gates — not autonomous prod mutation.

| Capability | Agent | Gate |
|------------|-------|------|
| Add DNS record | Cloudflare | `confirm` + dry-run + issue link |
| Email routing rule | Cloudflare | Human approval (#40) |
| Preview redeploy | Vercel | No `--confirm-prod` without ack |
| Resend add domain | Resend | Human approval |
| API key rotation | Ops | Human in vendor UI; script checklist only |
| Low-risk auto-fix | TBD | e.g. label missing on issue — GitHub only, never DNS |

**Not in Phase 3 without explicit new policy:** Clerk prod auth, Stripe, banking, 1Password admin, `main` push.

---

## Phase 3b — Limited autonomous remediation (optional, far future)

Only after Phase 3 is stable:

- Auto-comment CI failure summary on PR (GitHub Agent)  
- Open tracking issue when verify script fails on schedule  
- **Never** auto-change DNS, Clerk prod, or Vercel prod env values  

---

## GitHub issues

| Issue | Topic |
|-------|--------|
| [#40](https://github.com/Vera-Platforms/vera/issues/40) | Cloudflare email routing (human + Phase 3 script) |
| [#35–#38](https://github.com/Vera-Platforms/vera/issues/35) | Security hardening backlog |

Suggested new issue after this PR merges: **“Platform agents Phase 2 — wire CI dig-only checks”** (`ops`, `enhancement`).

---

## What stays human-only

- Cloudflare email routing first-time setup  
- Clerk production instance settings  
- 1Password vault structure and member access  
- Stripe/banking (all phases)  
- Merging to `main` (CI + auto-merge policy, not agent discretion)
