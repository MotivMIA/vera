# AI task flow

End-to-end path from idea to production, with optional Grok and ChatGPT layers.

## Standard flow

```text
Idea (human, mobile ChatGPT, or Grok)
    → GitHub issue (ai-task / mobile-task / grok-idea)
    → ./scripts/ai-issue-intake.sh <n>
    → ./scripts/start-ai-issue-task.sh <n>
    → Cursor implements on agent-cursor-issue-<n>-*
    → agent-quick-check.sh → agent-finish.sh
    → PR (Closes #<n>) + CI checks
    → Auto-merge (default)
    → Vercel production (main)
```

**Mobile path:** [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md)

## Legacy flow (no issue)

```text
Idea (human or Grok)
    → ChatGPT orchestration (classify, plan, filter)
    → Cursor: start-agent-task.sh cursor <slug>
    → Implement + agent-quick-check.sh
    → agent-finish.sh "[cursor] …"
    → PR + CI checks
    → Auto-merge (default)
    → Vercel production (main)
```

## Optional Grok path

```text
Grok review (prompt template)
    → ChatGPT orchestration-review (filter)
    → GitHub issue (optional) with labels
    → Cursor implementation intake
    → Same PR/CI/merge path as above
```

## GitHub issues as mediation

Use issues when:

- Multiple AI sessions need a single source of truth
- Grok produces several ideas to triage over time
- Human wants async approval before Cursor starts

**Issue template (minimal):**

```markdown
## Goal
…

## Source
- [ ] Human  [ ] ChatGPT  [ ] Grok review

## Classification
- Risk: low | medium | high
- Owner: cursor-only | codex-assisted (Cursor PR)

## Acceptance criteria
- …

## Out of scope
- …
```

Link the PR in the issue when opened. Close issue when merged.

## Label conventions

| Label | Use |
|-------|-----|
| `ai-task` | Structured task in the AI/mobile pipeline |
| `mobile-task` | Created from phone ChatGPT workflow |
| `grok-idea` | Originated from Grok; not yet approved for code |
| `cursor-accepted` | Cleared for `./scripts/start-ai-issue-task.sh` |
| `cursor-deferred` | Good idea; not scheduled — do not start |
| `cursor-rejected` | Rejected — do not implement |
| `ai-review` | Needs ChatGPT or human triage |
| `orchestration` | Process/workflow/docs; planning |
| `ux` | UI/onboarding/copy |
| `product` | Product/feature scope |
| `bug` | Bug fix |
| `enhancement` | Enhancement |
| `architecture` | Structural; Cursor-only |
| `high-risk` | Auth, payments, prod config — human ack required |
| `low-risk` | Docs, copy, isolated UI |
| `approved` | Legacy alias — prefer `cursor-accepted` |
| `deferred` | Legacy alias — prefer `cursor-deferred` |

Setup: `./scripts/setup-ai-issue-labels.sh` (safe to rerun).

## Ownership locking

- **One active implementation PR** per feature slug when possible
- Codex branch must not overlap Cursor-owned files without review
- Grok-labeled issues do **not** authorize coding until `cursor-accepted` (or human says go in chat)

Check before PR: `./scripts/agent-status.sh --pre-pr`  
Issue intake: `./scripts/ai-issue-intake.sh` · start from issue: `./scripts/start-ai-issue-task.sh <n>`

## Codex delegation flow

Only when Cursor explicitly delegates:

```text
Cursor classifies codex-assisted
    → start-agent-task.sh codex <slug>
    → Codex commits [codex], pushes
    → Cursor reviews diff
    → Cursor opens PR (always)
    → CI + auto-merge
```

Codex never skips Cursor PR creation.

## Commands reference

| Step | Command |
|------|---------|
| List / intake issue | `./scripts/ai-issue-intake.sh` or `… <n>` |
| Start from issue | `./scripts/start-ai-issue-task.sh <n>` |
| Start | `./scripts/start-agent-task.sh cursor <slug>` |
| Quick check | `./scripts/agent-quick-check.sh` |
| Ship | `./scripts/agent-finish.sh "[cursor] …"` |
| Status | `./scripts/ai-task-status.sh` |
| Review paste | `./scripts/ai-review-summary.sh` |
| Setup issue labels | `./scripts/setup-ai-issue-labels.sh` |

See [AI_OPERATING_MODEL.md](./AI_OPERATING_MODEL.md) and [AGENTS.md](../AGENTS.md).
