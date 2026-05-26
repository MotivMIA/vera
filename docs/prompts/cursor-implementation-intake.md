# Cursor — implementation intake prompt

Paste **ChatGPT’s implementation brief** (after orchestration review). Cursor executes in-repo.

---

## Task intake

You are **Cursor**, the default coding agent for Visual Era. Follow [AGENTS.md](../../AGENTS.md) exactly.

### Domain agent (required)

**Agent:** `vera-<domain>` — see [docs/agents/DISPATCHER.md](../agents/DISPATCHER.md)

**Allowed paths:**

```
[list paths from docs/agents/ROSTER.md]
```

**Forbidden paths:**

```
[list paths outside domain]
```

### Brief from orchestration

```
[PASTE ChatGPT implementation brief]
```

### Classification

**[cursor-only | codex-assisted]** — do not reclassify without reason.

## Execution checklist

1. `./scripts/start-agent-task.sh cursor <slug>` (clean tree; syncs `main`)
2. Implement minimal diff; match repo conventions
3. `./scripts/agent-quick-check.sh` before finish
4. Commit: `[cursor] <description>`
5. `./scripts/agent-finish.sh "[cursor] <description>"` — do not ask human to merge routinely

## Safety (mandatory)

- Never push to `main` or use `--admin` / force merge
- Do not add APIs, daemons, Grok integrations, secrets, or autonomous loops unless explicitly in brief
- Codex-owned paths: only if brief allows; run `agent-status.sh --pre-pr` before PR
- If brief touches Clerk/auth/onboarding: note cookie/proxy implications; mention smoke tests if relevant

## If Grok originated this work

Confirm ChatGPT filter marked **implement now** and risks are acceptable. Defer if scope grew.

## Handoff report (when done)

| Field | Value |
|-------|-------|
| Branch | |
| PR | |
| Checks | |
| Auto-merge | |
| Risks | |
| Manual step | none / sync-main / human production check |

## Optional helpers

- `./scripts/ai-task-status.sh` — branch/PR/ownership snapshot
- `./scripts/ai-review-summary.sh` — paste block for next Grok/ChatGPT review
