# Mobile AI task workflow

Create tasks from your phone via ChatGPT or Grok, track output structured as structured **GitHub issues**, and let **Cursor** implement through the existing agent branch → PR → CI → auto-merge path.

## Architecture

```text
Mobile ChatGPT / Grok
    → structured GitHub issue (labels + template)
    → ./scripts/ai-issue-intake.sh <n>   (classify, read-only)
    → ./scripts/start-ai-issue-task.sh <n> (branch + brief)
    → Cursor implements
    → ./scripts/agent-quick-check.sh
    → ./scripts/agent-finish.sh
    → PR with Closes #<n>
    → CI → auto-merge → issue closed
```

No webhooks, daemons, or Grok repo access — only `gh` CLI on your machine.

## Create a task from your phone

### Option A — ChatGPT task (implementation-ready)

1. Open [docs/prompts/mobile-create-task.md](prompts/mobile-create-task.md) on phone (or paste into ChatGPT).
2. Describe the task in voice or text.
3. Copy ChatGPT’s markdown body.
4. On GitHub: **New issue** → template **Mobile AI task** → paste body.
5. Title: `[mobile] short description`
6. Labels (if not from template): `ai-task`, `mobile-task`, `low-risk` or `high-risk`

### Option B — Grok idea → issue

1. Use [mobile-grok-idea-to-task.md](prompts/mobile-grok-idea-to-task.md) (Grok then ChatGPT).
2. Create issue with template **AI product idea**.
3. Labels: `ai-task`, `grok-idea`, `product` / `ux` as needed.
4. **Do not start coding** until ChatGPT/human adds `cursor-accepted`.

### Optional review

Run [mobile-chatgpt-task-review.md](prompts/mobile-chatgpt-task-review.md) before posting or before Cursor starts.

### One-time label setup (repo admin)

```bash
./scripts/setup-ai-issue-labels.sh
```

## How ChatGPT / Grok should format issues

Required sections (both templates):

- Goal, Context, User value, Desired behavior
- Acceptance criteria (checkboxes)
- Priority, Risk level
- Suggested owner (Cursor / Codex / Grok-review)
- Do-not-touch areas
- Notes

**Grok** never creates issues directly — human pastes ChatGPT-filtered body.

**ChatGPT** should not invent file paths or claim merge authority; it prepares issue text only.

## How Cursor consumes an issue

```bash
# List open ai-task / mobile-task / grok-idea issues
./scripts/ai-issue-intake.sh

# Classify one issue (no code changes)
./scripts/ai-issue-intake.sh 123

# Start branch + brief (requires clean tree)
./scripts/start-ai-issue-task.sh 123
```

This creates:

- Branch: `agent-cursor-issue-123-<slug>`
- Brief: `.agent/tasks/issue-123.md` (committed; links `Closes #123`)

Then normal workflow:

```bash
# … implement …
./scripts/agent-quick-check.sh
git add -A && git commit -m "[cursor] …"
./scripts/agent-finish.sh "[cursor] issue title"
```

`agent-finish.sh` → `open-agent-pr.sh` adds **`Closes #123`** to the PR body when the brief or branch references the issue.

## Automatic issue closing

When the PR merges to `main`, GitHub closes the linked issue if the PR body contains:

```text
Closes #123
```

No extra automation required.

## Labels

| Label | Meaning |
|-------|---------|
| `ai-task` | In AI/mobile workflow pipeline |
| `mobile-task` | Created from phone ChatGPT flow |
| `grok-idea` | Idea from Grok — needs triage |
| `cursor-accepted` | Approved for `start-ai-issue-task.sh` |
| `cursor-deferred` | Not now — intake script refuses start |
| `cursor-rejected` | Do not implement |
| `high-risk` | Auth, prod, payments — human ack |
| `low-risk` | Docs, copy, isolated UI |
| `product` | Product scope |
| `ux` | UX / onboarding |
| `bug` | Bug fix |
| `enhancement` | Enhancement |

See also [AI_TASK_FLOW.md](./AI_TASK_FLOW.md).

## Human judgment still required

- **High-risk** issues (auth, Clerk, middleware, env, payments, legal)
- **Grok ideas** without `cursor-accepted`
- Production verification after sensitive merges
- Rejecting or deferring bad scope (`cursor-rejected`, `cursor-deferred`)
- Override any agent classification

Cursor **classifies at intake** and refuses unknown or blocked issues — it does not auto-implement from raw issue text without `start-ai-issue-task.sh`.

## Safety

- No Grok repo write access
- No bypass of branch protection or CI
- Codex cannot own architecture/auth/security/deployment
- `start-ai-issue-task.sh` refuses dirty working tree
- Grok-labeled issues require `cursor-accepted` before branch creation

## Related

- [AGENTS.md](../AGENTS.md)
- [AI_OPERATING_MODEL.md](./AI_OPERATING_MODEL.md)
- [AI_TASK_FLOW.md](./AI_TASK_FLOW.md)
