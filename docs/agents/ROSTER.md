# Visual Era — domain agent roster

**Workspace:** `~/Documents/projects/visual-era` only · **Repo:** [Vera-Platforms/vera](https://github.com/Vera-Platforms/vera)

One **domain agent** per Cursor chat. Start a **new chat** when the domain changes.

---

## Agents

| Agent ID | Owns | Branch prefix | MCP / plugins |
|----------|------|---------------|---------------|
| **vera-onboarding** | `lib/onboarding/**`, `app/onboarding/**`, `app/verify-identity/**`, `app/documents/**`, `app/success/**`, `components/onboarding/**`, `app/api/onboarding/**`, `app/api/documents/**` | `agent-cursor-onb-` | None |
| **vera-identity** | `lib/didit.ts`, `app/api/didit/**`, DIDIT UI | `agent-cursor-idn-` | None |
| **vera-clerk** | `middleware.ts`, `lib/clerk/**`, `app/sign-in/**`, `app/sign-up/**`, Clerk sections of `app/layout.tsx` | `agent-cursor-clerk-` | Clerk only |
| **vera-supabase** | `supabase/**`, `SUPABASE_SCHEMA.md`, `types/database.ts`, `lib/supabase/**` | `agent-cursor-db-` | Supabase only |
| **vera-vercel** | `docs/VERCEL_DEPLOYMENT.md`, `.vercel/**`, `scripts/ops/verify-vercel-env.sh`, infra-only `next.config.ts` | `agent-cursor-vercel-` | Vercel only |
| **vera-github** | `.github/**`, `scripts/agent-*.sh`, `scripts/lib/github-repo.sh` | `agent-cursor-gh-` | GitHub optional |
| **vera-platform-verify** | `scripts/ops/*` read-only reports | — | As needed |
| **vera-docs** | `docs/**`, `AGENTS.md` (not product code) | `agent-cursor-docs-` | None |

**Codex Cloud:** `agent-codex-<slug>` — one domain per brief; Cursor reviews and opens PR.

---

## Session header (paste first message)

```markdown
Agent: vera-<domain>
Repo: Vera-Platforms/vera
Branch: agent-cursor-<prefix>-<slug>
Allowed paths: <from table>
Forbidden: <paths outside domain>
Task: <one sentence>
Acceptance: ./scripts/agent-quick-check.sh
```

Prompt templates: [prompts/](prompts/) · Routing: [DISPATCHER.md](./DISPATCHER.md)

---

## Handoffs

| If task touches… | Sequence |
|------------------|----------|
| Clerk webhook + DB column | vera-supabase (migration) → vera-clerk (webhook) → vera-onboarding (call sites + tests) |
| DIDIT + onboarding state | vera-identity → vera-onboarding |

Prefer **separate PRs** per domain when possible.

---

## Prohibited in vera sessions

- References to other repos or planning systems in code/docs
- `middleware.ts` edits except **vera-clerk**
- Production secret values in chat or commits
- Multiple domains in one chat without explicit handoff

See [AGENTS.md](../../AGENTS.md).
