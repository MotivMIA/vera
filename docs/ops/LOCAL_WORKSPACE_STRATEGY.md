# Local workspace — Visual Era (`visual-era`)

**Scope:** This repository only — [natew-dev/vera](https://github.com/natew-dev/vera).

---

## Canonical layout

| Item | Value |
|------|--------|
| **Local folder** | `~/Documents/projects/visual-era` (name is arbitrary; remote is authoritative) |
| **GitHub** | `natew-dev/vera` |
| **Production** | https://visual-era.com |
| **Cursor workspace** | Open **this folder** — not a parent directory |

Other projects on your machine use **separate folders and separate Cursor windows**. They are not documented here.

---

## Script portability

VERA shell scripts resolve the repo root from their own path (`AGENT_GIT_ROOT`, `ROOT="$(cd "$(dirname "$0")/.." && pwd)"`). Cloning to a different path does not break agent or ops scripts.

**Machine-local (update if you move the clone):**

| Item | Action |
|------|--------|
| Git `includeIf` | `docs/GIT_CONFIG_SETUP.md` — point `gitdir` at your `visual-era/` path |
| `.env` | App secrets — gitignored; see [LOCAL_ENV.md](./LOCAL_ENV.md) |
| `.cursor/mcp.env` | MCP tokens only — copy from `.cursor/mcp.env.example` |
| `node_modules/` | Run `npm ci` after clone or move |

---

## Cursor workflow

1. **Open** `~/Documents/projects/visual-era` in Cursor.
2. **Sandbox** — keep enabled; see [CURSOR_SANDBOX_SETUP.md](./CURSOR_SANDBOX_SETUP.md).
3. **Auto-Run** — Settings → Agents → Allowlist (with Sandbox) so scripts run without constant approval.
4. **Agent** — single implementation chat: **vera-website**; prompt: `docs/agents/prompts/vera-onboarding.md`.
5. **Env** — `npm run env:check` before dev; [LOCAL_ENV.md](./LOCAL_ENV.md).

---

## Shell helper (optional)

```bash
# ~/.zshrc — example only
alias vera='cd "$HOME/Documents/projects/visual-era"'
```

Scripts in this repo use `AGENT_GIT_ROOT`, not `$vera` — so clones work without the alias.

---

## Verification

| Check | Command |
|-------|---------|
| Remote | `git remote -v` → `natew-dev/vera` |
| Env keys | `npm run env:check` |
| Dev server | `npm run dev` → http://localhost:3001 |
| Route smoke | `npm run dev:smoke` (with dev server running) |
| Agent scripts | `./scripts/agent-status.sh` |
| Ops verify | `./scripts/ops/run-phase2-verify.sh` |
| Repo boundaries | `./scripts/check-repo-boundaries.sh` |

---

## Related docs

- [LOCAL_ENV.md](./LOCAL_ENV.md)
- [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md)
- [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md)
