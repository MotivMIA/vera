# Ops verification scripts (Phase 2)

Read-only checks for platform agents and humans. **No writes.** No secrets committed.

## Run all

```bash
./scripts/ops/run-phase2-verify.sh
```

## Individual scripts

| Script | Agent | Needs token? |
|--------|-------|----------------|
| `verify-github-repo-health.sh` | GitHub | `gh auth login` |
| `verify-cloudflare-dns.sh` | Cloudflare | Optional: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID` |
| `verify-email-dns.sh` | Cloudflare / Resend | Public DNS (`dig` or `host`) |
| `verify-vercel-env.sh` | Vercel | Optional: `VERCEL_TOKEN` + Vercel CLI |
| `verify-resend-domain.sh` | Resend | `RESEND_API_KEY` |
| `verify-clerk-redirects.sh` | Clerk | Optional: `CLERK_SECRET_KEY` |

Store tokens in 1Password or local gitignored env — see [docs/ENTERPRISE_AUTOMATION_ACCESS.md](../../docs/ENTERPRISE_AUTOMATION_ACCESS.md).

## Exit codes

- `SKIP` — token not configured (not a failure in Phase 2 rollout)
- `FAIL` — check failed; script exits non-zero
- `OK` / `WARN` — informational
