# Codex cloud delegation

Run **large or parallel-friendly** work in the cloud while **Cursor (local)** keeps architecture, review, and **PR/merge authority**. This repo treats **Codex** as the optional worker role (`agent-codex-*`, `[codex]` commits) whether the worker runs locally, in **Cursor Cloud**, or in **OpenAI Codex** (CLI/app).

## Is cloud execution supported?

| Runtime | Supported? | Notes |
|---------|------------|-------|
| **Cursor Cloud Agent** | Yes | Cursor Desktop → **Cloud** in agent dropdown; or [cursor.com/agents](https://cursor.com/agents). Requires Cursor plan with Cloud Agents. |
| **OpenAI Codex (CLI / app)** | Yes (external) | Separate product; must follow this repo’s `agent-codex-*` branch rules when touching the repo. |
| **Local Cursor (default)** | Yes | Default executor on `agent-cursor-*`. |

**Repo config:** `.cursor/environment.json` runs `npm ci` before cloud agents start. Cloud agents read `AGENTS.md` automatically.

**Not configured in-repo:** API keys, MCP secrets, or dashboard snapshots — set those in Cursor Settings / Cloud Agents dashboard (never commit secrets).

## Architecture

```text
You + Cursor (local supervisor)
    → classify + write brief + agent-codex-* branch
    → delegate prompt → Cursor Cloud / Codex cloud
    → worker pushes [codex] commits to agent-codex-*
    → Cursor (local) reviews diff
    → Cursor opens PR + agent-finish.sh → CI → auto-merge
```

**Cursor local** never relinquishes authority on PRs, merges, and final review. Cloud workers **never** merge to `main` or open unsupervised PRs.

## When to delegate to the cloud (Codex worker)

| Delegate (cloud OK) | Keep on Cursor local |
|---------------------|----------------------|
| Large test suites / repetitive multi-file edits | Architecture, middleware, auth |
| Docs cleanup (non-deploy) | `app/api/*`, `lib/env.ts`, `lib/didit.ts` |
| Isolated UI components (Codex-safe paths) | DB migrations, Vercel/production config |
| Utility scripts from a written brief | Ambiguous scope, high-risk onboarding/auth |
| Parallel research implementation (separate branch) | PR creation and merge decisions |

**Rule:** If unsure → **cursor-only**. Cloud does not bypass ownership checks (`agent-status.sh --pre-pr`).

## When NOT to delegate

- Secrets, `.env`, Clerk/Supabase/Didit production config
- `middleware.ts`, payments, branch protection scripts
- Tasks without a **written brief** and explicit file allow-list
- Anything labeled `high-risk` without human ack
- Opening PRs or enabling auto-merge from the cloud worker session

## Setup (one-time)

### Cursor Cloud Agents

1. Cursor → **Settings** → confirm **Cloud Agents** enabled for your plan.
2. Connect **GitHub** (MotivMIA/vera) in Cursor Cloud Agents dashboard.
3. Repo includes `.cursor/environment.json` (`npm ci` on agent start).
4. Optional: save an environment **snapshot** in the dashboard after first successful cloud run.

### OpenAI Codex (optional external worker)

1. Install [Codex CLI](https://developers.openai.com/codex) or use Codex in ChatGPT if available on your plan.
2. Clone this repo locally or let Codex attach to GitHub — worker must push only to `agent-codex-*` branches Cursor created.
3. Do **not** point Codex at `main` or bypass hooks.

## Standard delegation flow

### 1. Cursor (local) prepares delegation

```bash
./scripts/delegate-codex-cloud.sh <feature-slug>
```

This:

- Creates `agent-codex-<feature-slug>` from latest `main`
- Writes `.agent/delegation/codex-<feature-slug>.md` brief
- Prints a **copy-paste cloud prompt**

### 2. Run worker in the cloud

**Cursor Cloud:** Desktop → Agent → **Cloud** → paste prompt from step 1.

**Codex cloud:** Paste the same prompt; ensure branch is `agent-codex-<slug>`.

Worker must:

- Commit with `[codex]` prefix
- Push to `origin agent-codex-<slug>`
- **Not** open a PR or merge

### 3. Cursor (local) supervises

```bash
git fetch origin
git checkout agent-codex-<feature-slug>
git pull
./scripts/agent-status.sh --pre-pr
./scripts/agent-quick-check.sh
```

Fix gaps on `agent-cursor-*` if needed, or open PR from the codex branch:

```bash
# After review — Cursor opens PR (supervisor authority)
./scripts/agent-finish.sh "[cursor] <summary> (codex-assisted)"
```

Use `[cursor]` in the PR title even when commits are `[codex]` — Cursor owns the merge path.

## Large tasks: split pattern

For tasks too big for one cloud session:

1. Cursor breaks work into **slices** (each with its own brief).
2. One `agent-codex-*` branch per slice, or sequential commits on one branch.
3. Cursor reviews **each push** before expanding scope.
4. One PR when the full brief is satisfied (avoid multiple auto-merge PRs for the same feature when possible).

## Safety

- No secrets in cloud prompts or briefs (env **names** only)
- No `--admin` merge, no push to `main`
- Cloud worker stops when brief is done — no infinite loops
- CI **CI checks** required before merge
- Human can revoke delegation anytime

## Related

- [AGENTS.md](../AGENTS.md) — golden rules
- [AI_AGENT_WORKFLOW.md](./AI_AGENT_WORKFLOW.md) — supervisor/worker diagram
- [prompts/codex-cloud-delegation.md](./prompts/codex-cloud-delegation.md) — prompt template
