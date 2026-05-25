# Platform agent task template

Copy into Cursor (or ChatGPT → Cursor handoff). **Cursor dispatches;** the platform agent does not merge code or change production alone.

---

## Task header

```text
Platform agent: <GitHub | Vercel | Supabase | Cloudflare | Resend | Clerk | Docs/Research>
Risk: <low | medium | high>
Phase: <2 read-only | 3 controlled write — requires human approval ID>
Related issue: Vera-Platforms/vera#<number>
```

---

## Objective

_One sentence — what to verify or research._

---

## Context

- Branch (if any): `agent-cursor-<slug>`
- Environment: production | preview | local
- Links: docs, prior PR, incident

---

## Allowed for this task

_Check only what applies._

- [ ] Run read-only script: `./scripts/ops/<script>.sh`
- [ ] MCP read (which server): ___
- [ ] `gh` read commands: ___
- [ ] Docs/Research: official vendor docs only

---

## Prohibited for this task

- [ ] No writes to DNS, Clerk prod, Vercel prod env values
- [ ] No secret values in output (names only)
- [ ] No merge, no push to `main`
- [ ] No Stripe/banking

---

## Commands to run

```bash
# Example — adjust per agent
./scripts/ops/run-phase2-verify.sh
# or single agent:
./scripts/ops/verify-cloudflare-dns.sh
```

---

## Expected output format

```text
## Platform agent report — <Agent name>

### Summary
<1–3 sentences>

### Checks
| Check | Result | Notes |
|-------|--------|-------|
| ... | OK / WARN / FAIL / SKIP | |

### Recommended Cursor actions
- [ ] Code change needed? → Cursor implements on agent-cursor-*
- [ ] Human approval needed? → Issue #___

### Evidence (redacted)
- PR / deployment URL / record names only — no tokens
```

---

## Handoff back to Cursor

After the report:

1. Cursor decides if app/config PR is required.  
2. If yes → implement on `agent-cursor-*`, `agent-quick-check.sh`, ship with `agent-finish.sh`.  
3. If human approval → comment on issue and stop.  

---

## Agent-specific quick picks

| Agent | Phase 2 command | High-risk trigger |
|-------|-----------------|-------------------|
| GitHub | `verify-github-repo-health.sh` | Protection disabled |
| Vercel | `verify-vercel-env.sh` | Missing prod keys |
| Supabase | MCP schema read | RLS disabled suggestion |
| Resend | `verify-resend-domain.sh` | Domain unverified |
| Cloudflare | `verify-cloudflare-dns.sh` + `verify-email-dns.sh` | No MX when routing expected |
| Clerk | `verify-clerk-redirects.sh` | Prod API change request |
| Docs/Research | — | N/A |

---

## References

- [PLATFORM_AGENT_ARCHITECTURE.md](../PLATFORM_AGENT_ARCHITECTURE.md)
- [ENTERPRISE_AUTOMATION_ACCESS.md](../ENTERPRISE_AUTOMATION_ACCESS.md)
- [AGENTS.md](../../AGENTS.md)
