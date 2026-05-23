# ChatGPT Desktop + Cursor workflow (Phase 2.5)

Live orchestration at your computer via **ChatGPT Desktop “Work with Apps”**, while **GitHub Issues** remain the mobile task queue. **Cursor** is still the default coding agent; **ChatGPT Desktop does not replace** branch protection, PRs, or CI.

## Two paths, one repo rules

```text
Computer (live):
  ChatGPT Desktop ↔ Cursor (Work with Apps context)
      → plan / debug / review / Cursor prompts
      → Cursor implements on agent-cursor-*
      → ./scripts/agent-finish.sh → PR → CI → auto-merge

Mobile (async queue):
  ChatGPT / Grok → GitHub Issue
      → ./scripts/ai-issue-intake.sh → ./scripts/start-ai-issue-task.sh
      → Cursor implements → PR → CI → auto-merge
```

Both paths converge on the same **agent branch → PR → CI** gate. ChatGPT Desktop accelerates thinking; it does not merge code.

## 1. When to use ChatGPT Desktop

Use at your desk when you want **live, iterative** help:

- Planning a feature before `./scripts/start-agent-task.sh`
- Debugging errors with open files / terminal context visible to ChatGPT
- Reviewing a diff or architecture question mid-session
- Drafting a **Cursor prompt** or implementation brief
- Unblocking Cursor when scope is ambiguous
- Pairing on high-risk areas (auth, onboarding, middleware) before coding

ChatGPT Desktop is the **orchestrator in the room** — not the committer.

## 2. When to use GitHub Issues

Use issues when work should be **queued, traceable, or mobile-origin**:

- Tasks captured on phone ([MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md))
- Grok ideas that need triage and labels
- Work you want to pick up later with a clear brief
- Multiple tasks you want visible in the repo backlog
- Closing work automatically via `Closes #n` on merge

**Rule of thumb:** Desktop = live session; Issues = durable queue.

| Situation | Prefer |
|-----------|--------|
| At computer, exploring/debugging now | ChatGPT Desktop + Cursor |
| On phone, idea for later | GitHub Issue |
| Need audit trail / labels / priority | GitHub Issue |
| Stuck on one file, need fast context | ChatGPT Desktop + Cursor |
| Grok brainstorm → filtered task | Issue first, then desktop intake optional |

## 3. Setting up Work with Apps / Cursor

1. **Install** [ChatGPT Desktop](https://openai.com/chatgpt/download/) (macOS or Windows).
2. **Install / open Cursor** with this repo cloned locally.
3. In **ChatGPT Desktop** → **Settings** → **Work with Apps** (or **Connected apps**):
   - Enable Work with Apps.
   - Add **Cursor** (or your editor if listed).
   - Grant permission when prompted (macOS may ask for Accessibility / Automation — approve for the apps you trust).
4. In Cursor, open the **Visual Era** workspace (`visual-era`).
5. Confirm ChatGPT can see **permitted context** (active file, selection, or app context — depends on ChatGPT version). Start with a low-risk read-only question about an open doc file to verify.
6. Read [AGENTS.md](../AGENTS.md) once so ChatGPT sessions inherit repo rules when you paste or reference it.

No repo secrets, API keys, or `.env` contents should enter chat context. Use env **names** only.

## 4. Safely using live context

**Do share (when helpful):**

- Open source files (non-secret)
- Error messages and stack traces (redact tokens/IDs)
- `AGENTS.md`, workflow docs, issue bodies
- Branch name, PR link, CI failure snippets
- Architecture questions about onboarding, Clerk proxy, etc.

**Do not share:**

- `.env`, `.env.local`, Vercel/Clerk/Supabase **secret values**
- User PII, session tokens, production cookies
- Full `gh auth` tokens or private keys
- Copy-paste of `middleware.ts` changes that embed secrets

**Session hygiene:**

- Start desktop sessions with: *“Follow AGENTS.md; Cursor implements; PR + CI only.”*
- When ChatGPT proposes code, **paste the plan into Cursor** (or use Cursor’s agent) — do not treat ChatGPT as having merged authority.
- For tasks that started as issues, keep the issue number in the Cursor prompt so `agent-finish.sh` can `Closes #n`.

## 5. What ChatGPT can help inspect

With Work with Apps + pasted context, ChatGPT can reasonably help review:

| Area | Examples |
|------|----------|
| **Workflow** | Which script to run, branch naming, issue intake |
| **App code** | Components, onboarding pages, API route logic (no secrets) |
| **Errors** | TypeScript, lint, CI log interpretation |
| **Architecture** | Consent → Didit → documents flow, Clerk same-origin proxy |
| **PR readiness** | Risk notes, rollback, test plan |
| **Prompts** | Cursor implementation briefs from [docs/prompts/](./prompts/) |

ChatGPT **cannot** reliably verify production Vercel env, live Clerk dashboard settings, or merged `main` without you pasting **sanitized** facts.

## 6. What still must go through agent branches + PRs

Everything that changes the repo:

| Action | Required path |
|--------|----------------|
| Code changes | `agent-cursor-*` → commit → PR |
| Docs / scripts in repo | Same |
| Closing a tracked task | PR with `Closes #n` when applicable |
| Merge to `main` | CI **CI checks** + auto-merge (default) |
| Production deploy | Merge to `main` → Vercel (no chat-triggered deploy) |

ChatGPT Desktop must **never**:

- Push to `main` or tell you to bypass branch protection
- Use `--admin` merge or force push
- Skip `./scripts/agent-quick-check.sh` for code changes
- Replace `./scripts/agent-finish.sh` for opening PRs

**Typical live session:**

```bash
./scripts/start-agent-task.sh cursor my-feature   # or start-ai-issue-task.sh N
# ChatGPT Desktop: plan, debug, draft Cursor instructions
# Cursor: implement
./scripts/agent-quick-check.sh
./scripts/agent-finish.sh "[cursor] short title"
```

## 7. Safety limits

| Limit | Why |
|-------|-----|
| **No secrets in chat** | Desktop context may be retained or logged |
| **No bypassing GitHub workflow** | CI + branch naming are the governance layer |
| **No direct `main` edits** | Protected branch; hooks block local mistakes |
| **No production changes without PR/CI** | Vercel promotes `main` after merge |
| **Cursor stays default coder** | ChatGPT plans; Cursor owns diffs and PRs |
| **High-risk needs human ack** | Auth, payments, env — see `high-risk` label |
| **No infinite autonomous loops** | Human stops runaway sessions |

## ChatGPT → Cursor handoff prompt (template)

Paste into Cursor after a desktop planning session:

```text
Read AGENTS.md first.

Task: [one sentence]
Branch: agent-cursor-[slug] (create with start-agent-task if needed)
Issue: #N (if any)

Acceptance criteria:
- …

Out of scope:
- …

Do-not-touch: middleware/auth/env unless explicitly in scope.

Workflow: agent-quick-check.sh → agent-finish.sh
```

Or use [prompts/cursor-implementation-intake.md](./prompts/cursor-implementation-intake.md) with ChatGPT’s brief filled in.

## Related

- [AGENTS.md](../AGENTS.md) — golden rules
- [AI_OPERATING_MODEL.md](./AI_OPERATING_MODEL.md) — roles and authority
- [MOBILE_AI_TASK_WORKFLOW.md](./MOBILE_AI_TASK_WORKFLOW.md) — phone → issue queue
- [AI_TASK_FLOW.md](./AI_TASK_FLOW.md) — labels and lifecycle
