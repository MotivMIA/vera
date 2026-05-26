# Ops verification scripts (Phase 2)

Read-only checks for platform agents and humans. **No writes.** No secrets committed.

## Run all

Loads **`.cursor/mcp.env`** automatically (gitignored). Bootstrap:

```bash
./scripts/setup-cursor-mcp.sh
./scripts/ops/run-phase2-verify.sh
```

See [docs/ops/LOCAL_STACK_SETUP.md](../../docs/ops/LOCAL_STACK_SETUP.md).

## Individual scripts

| Script | Agent | Needs token? |
|--------|-------|----------------|
| `verify-github-repo-health.sh` | GitHub | `gh auth login` |
| `verify-cloudflare-dns.sh` | Cloudflare | Optional: `CLOUDFLARE_API_TOKEN` (zone id auto-resolved) |
| `verify-email-dns.sh` | Cloudflare / Resend | Public DNS (`dig` or `host`) |
| `verify-vercel-env.sh` | Vercel | Optional: `VERCEL_TOKEN` + Vercel CLI |
| `verify-resend-domain.sh` | Resend | `RESEND_API_KEY` |
| `verify-clerk-redirects.sh` | Clerk | Optional: `CLERK_SECRET_KEY` |
| `verify-git-identity.sh` | GitHub / onboarding | `gh auth` optional |

Store tokens in **`.cursor/mcp.env`** (gitignored) — see [LOCAL_STACK_SETUP.md](../../docs/ops/LOCAL_STACK_SETUP.md).

## GitHub org migration

```bash
./scripts/check-github-owner-refs.sh
```

See [docs/ops/GITHUB_ORG_MIGRATION.md](../../docs/ops/GITHUB_ORG_MIGRATION.md) · [POST_MIGRATION_CONNECTIONS.md](../../docs/ops/POST_MIGRATION_CONNECTIONS.md) · [CUSTOM_DOMAIN_SETUP.md](../../docs/ops/CUSTOM_DOMAIN_SETUP.md).

```bash
./scripts/ops/verify-custom-domain.sh
```

## Exit codes

- `SKIP` — token not configured (not a failure in Phase 2 rollout)
- `FAIL` — check failed; script exits non-zero
- `OK` / `WARN` — informational
