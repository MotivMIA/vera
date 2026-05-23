# Codex Cloud workflow

Use **Codex Cloud** (Cursor Desktop → **Cloud**, or [cursor.com/agents](https://cursor.com/agents)) for **large, isolated** jobs. **Cursor** remains lead engineer: review, consistency, and **PR/merge authority**.

Setup details: [CODEX_CLOUD_DELEGATION.md](./CODEX_CLOUD_DELEGATION.md) · prompt: [prompts/codex-cloud-delegation.md](./prompts/codex-cloud-delegation.md).

## When to use Codex Cloud

### Use for

- Large refactors (scoped, with allow-list)
- Multi-file cleanup
- Test generation across many files
- Isolated feature builds (Codex-safe paths)
- Repetitive migration-style edits
- Broad codebase analysis → implementation slice with a written brief

### Do not use for

- Secrets or `.env` values
- Auth / security architecture
- Production deployment or Vercel settings
- Payment / billing
- Environment configuration
- Unclear product decisions (resolve with ChatGPT Desktop first)
- Opening PRs, merging, or pushing to `main`

If unsure → **cursor-only** on `agent-cursor-*`.

## Flow

```text
ChatGPT Desktop → delegation brief
    ↓
./scripts/delegate-codex-cloud.sh <slug>  →  agent-codex-<slug>
    ↓
Codex Cloud implements → [codex] commits → push branch
    ↓
Cursor reviews (Codex IDE panel for polish)
    ↓
agent-quick-check.sh → agent-finish.sh  →  PR → CI → auto-merge
```

Codex Cloud stops at **push**. Cursor ships.

## Step-by-step

### 1. Plan (ChatGPT Desktop + Cursor)

- Classify: **codex-cloud** vs **cursor-only**.
- Write allow-list, acceptance criteria, test plan.
- Confirm no Cursor-owned paths unless Cursor will review them explicitly.

### 2. Delegate

```bash
./scripts/delegate-codex-cloud.sh <feature-slug>
```

Edit `.agent/delegation/codex-<slug>.md`, commit, push.

```bash
./scripts/delegate-codex-cloud.sh <slug> --print-only
```

Paste prompt into **Cursor Cloud** (or external Codex with same branch rules).

### 3. Cloud worker rules

- Branch: `agent-codex-<slug>` only
- Commits: `[codex] …`
- Run: `./scripts/agent-quick-check.sh` before handoff
- **No PR**, **no merge**, **no main**

### 4. Review in Cursor

```bash
git fetch origin
git checkout agent-codex-<slug>
git pull
./scripts/agent-status.sh --pre-pr
./scripts/agent-quick-check.sh
```

- Fix gaps on `agent-cursor-*` or on the codex branch as needed.
- Use **Codex IDE panel** for finishing touches (still Cursor-supervised).

### 5. Ship (complete unit only)

When the slice is done — not mid-iteration:

```bash
./scripts/agent-finish.sh "[cursor] summary (codex-assisted)"
```

- Cursor opens PR with `[cursor]` title.
- Auto-merge after **CI checks** pass.
- Codex Cloud does not trigger deploy; Vercel follows `main` merge.

## Merge paths

| Situation | Branch for PR |
|-----------|-----------------|
| Cursor-only work | `agent-cursor-*` |
| Codex Cloud only | `agent-codex-*` after Cursor review |
| Cursor fixes after Codex | `agent-cursor-*` with merged/cherry-picked work, or PR from reviewed codex branch |

Cursor always runs `agent-finish.sh` — never the cloud worker.

## Safety

- `.cursor/environment.json` runs `npm ci` on cloud VM start
- No secrets in briefs or cloud chat
- `agent-status.sh --pre-pr` blocks unsafe Codex paths when configured
- No autonomous loops — one brief, one slice, hand off

## Related

- [CHATGPT_CURSOR_CODEX_STACK.md](./CHATGPT_CURSOR_CODEX_STACK.md) — full daily stack
- [AGENTS.md](../AGENTS.md) — golden rules
