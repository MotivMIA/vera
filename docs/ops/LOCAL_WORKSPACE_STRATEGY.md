# Local workspace — Visual Era (`visual-era`)

**Scope:** This repository only — [Vera-Platforms/vera](https://github.com/Vera-Platforms/vera).

---

## Canonical layout

| Item | Value |
|------|--------|
| **Local folder** | `~/Documents/projects/visual-era` (name is arbitrary; remote is authoritative) |
| **GitHub** | `Vera-Platforms/vera` |
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
| `.env.local` | Stays inside this repo |
| `.cursor/mcp.env` | Local MCP secrets — gitignored |
| `node_modules/` | Run `npm ci` after clone or move |

---

## Cursor workflow

1. **Open** `~/Documents/projects/visual-era` in Cursor.
2. **Sandbox** — keep enabled; see [CURSOR_SANDBOX_SETUP.md](./CURSOR_SANDBOX_SETUP.md).
3. **Agents** — read [AGENTS.md](../../AGENTS.md) and [docs/agents/ROSTER.md](../agents/ROSTER.md); use `agent-cursor-*` branches only.
4. **Domain discipline** — one domain per chat (`vera-clerk`, `vera-onboarding`, etc.); new chat when switching domains.

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
| Remote | `git remote -v` → `Vera-Platforms/vera` |
| Dev server | `npm ci && npm run dev` |
| Agent scripts | `./scripts/agent-status.sh` |
| Ops verify | `./scripts/ops/run-phase2-verify.sh` |
| Repo boundaries | `./scripts/check-repo-boundaries.sh` |

---

## Related docs

- [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md)
- [REPO_RESTRUCTURE_AUDIT.md](./REPO_RESTRUCTURE_AUDIT.md)
- [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md)
