# Cursor + Codex collaborative operating instructions

Read [AGENTS.md](../AGENTS.md) first.

**Stack context:** [CHATGPT_CURSOR_CODEX_STACK.md](./CHATGPT_CURSOR_CODEX_STACK.md) · Codex Cloud: [CODEX_CLOUD_WORKFLOW.md](./CODEX_CLOUD_WORKFLOW.md)

This document governs **in-IDE collaboration** (Cursor chat + Codex IDE panel + optional Codex Cloud). It does **not** replace ChatGPT Desktop for cross-session planning and briefs.

---

## Objective

Operate as the **primary in-repo orchestrator** while using Codex as a coding specialist when it improves implementation quality.

Do not let Codex blindly take over every coding task. Dynamically decide when Cursor should lead, when Codex should lead, and when both should collaborate.

## Core principle

| Layer | Orchestrator |
|-------|----------------|
| **Product / multi-session planning** | ChatGPT Desktop (briefs, classify) |
| **Repo session (this doc)** | **Cursor** |
| **Code-heavy slices** | Codex (IDE panel or `agent-codex-*` cloud) |

Codex is a **specialized implementation partner**, not the release authority.

Use the best capability for the task, not a rigid rule.

---

## Operating model

For every task:

1. Understand the full objective.
2. Classify the task:
   - architecture-heavy
   - code-heavy
   - debugging-heavy
   - refactor-heavy
   - UI/UX-heavy
   - documentation-heavy
   - mixed
3. Choose working mode (map to [AGENTS.md](../AGENTS.md) classifications):
   - **Cursor-led** → `cursor-only`
   - **Codex-assisted** → `codex-assisted` (small scoped slice)
   - **Codex-led** → `codex-cloud` (large isolated job on `agent-codex-*`)
   - **Collaborative** → Cursor plan → Codex implement → Cursor review (default for serious work)
4. Execute on the correct branch (`agent-cursor-*` or `agent-codex-*` — **one writer per branch**).
5. Synthesize one clear result; ship via PR when the unit is ready (`agent-finish.sh`).

---

## When Cursor should lead

- Architecture planning and tradeoffs
- Product and UX direction
- Repo strategy and file ownership
- Documentation structure
- Interpreting user intent
- Implementation order and risk
- Coordinating multi-area changes
- **PR creation, review, merge path**
- Cursor-owned paths: `middleware.ts`, `app/api/*`, `lib/env.ts`, `lib/didit.ts`, migrations, Vercel/prod

## When Codex should lead

Code-intensive work **on an allowed scope** (brief + file list):

- Complex feature implementation
- Bug fixes in isolated areas
- Large refactors (prefer `agent-codex-*` + cloud brief)
- Test generation
- Type-safety / lint fixes across many files
- Algorithmic logic
- Multi-file edits with clear boundaries

Codex **must not** own architecture, secrets, auth design, or PR/merge decisions.

## When both should collaborate (default for serious coding)

1. **Cursor** — goal, constraints, risks, plan, branch choice.
2. **Codex** — code-heavy implementation (IDE panel or `./scripts/delegate-codex-cloud.sh`).
3. **Cursor** — review for architecture, maintainability, safety, repo consistency, overengineering, edge cases.
4. **Codex** — targeted fixes if needed (still supervised).
5. **Cursor** — final summary, verification, PR when ready.

---

## Rules

**Do not:**

- Delegate blindly
- Overuse Codex for trivial one-file edits
- Let Codex make architectural decisions alone
- Let Codex modify unrelated files or Cursor-owned paths without review
- Run autonomous loops
- Deploy or change production secrets/env without human approval
- Skip verification (`agent-quick-check.sh`, relevant `scripts/ops/*`)
- Push to `main` or bypass CI

**Always:**

- Preserve repo boundaries ([AGENTS.md](../AGENTS.md))
- Keep changes focused; prefer small safe commits on the agent branch
- Explain what changed
- Run available checks before PR
- Report risks clearly
- Ask before destructive or production-impacting actions

---

## Final response format

At the end of each task, report:

| Section | Content |
|---------|---------|
| **Working mode** | Cursor-led · Codex-assisted · Codex-led · Collaborative |
| **Files changed** | List or summary |
| **Implemented** | What was done |
| **Codex** | Used or not — why |
| **Verification** | Commands run / results |
| **Risks** | Remaining concerns |
| **Next step** | One concrete recommendation |

---

## Best default

**Collaborative** for non-trivial coding:

- Cursor guides architecture and review.
- Codex handles deep implementation when useful.
- Cursor synthesizes and ships through the PR gate.

---

## Quick commands

| Action | Command |
|--------|---------|
| Start Cursor task | `./scripts/start-agent-task.sh cursor <slug>` |
| Delegate Codex Cloud | `./scripts/delegate-codex-cloud.sh <slug>` |
| Iterate | `./scripts/agent-quick-check.sh` |
| Ship | `./scripts/agent-finish.sh "[cursor] …"` |
