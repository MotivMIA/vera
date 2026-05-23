# Grok review model

Grok participates as an **innovation and product-review layer only**. It never touches the repository.

## When to use Grok

- UX critique of onboarding, home, or legal flows
- Feature brainstorming (monetization, creator tools, growth)
- Competitive or product positioning ideas
- “What would make this feel more premium?” reviews
- Prioritization of a backlog of ideas (before engineering)

## When NOT to use Grok

- Implementing or editing code
- Architecture or security decisions without ChatGPT + Cursor validation
- Production deploys, env vars, or Clerk/Supabase/Didit configuration
- Replacing Cursor as the coding agent
- Open-ended “keep improving until perfect” loops
- Tasks that already have an approved Cursor brief in flight

## Converting Grok ideas into implementation briefs

1. Run Grok with a template from [prompts/](prompts/) (product review or feature innovation).
2. Paste Grok output into **ChatGPT** with [chatgpt-orchestration-review.md](prompts/chatgpt-orchestration-review.md).
3. ChatGPT produces:
   - **Implement now** — scoped slug, acceptance criteria, risk tier
   - **Consider later** — one-line defer reason
   - **Reject** — why it conflicts with architecture or scope
   - **Needs clarification** — questions for the human
4. For **Implement now**, paste into Cursor using [cursor-implementation-intake.md](prompts/cursor-implementation-intake.md).
5. Cursor runs normal workflow: `start-agent-task.sh` → code → `agent-finish.sh`.

Grok never sends work directly to Cursor without the ChatGPT filter step.

## How Cursor validates Grok suggestions

Before coding, Cursor checks:

- Fits existing stack (Next.js, Clerk, Supabase, Didit, Vercel)
- Respects ownership (auth/API/middleware = Cursor-only)
- Small enough for one PR (split if not)
- No secrets, payment, or compliance changes without human flag
- Consistent with [CODEBASE_MAP.md](./CODEBASE_MAP.md) and onboarding flow
- Test plan is realistic (`agent-quick-check.sh` minimum)

If Grok suggests something that duplicates recent merged work, **reject or defer**.

## Avoiding innovation spirals

- **One Grok session → one review artifact** (not endless refinement)
- Cap **implement now** items to **1–3** per cycle
- Time-box Grok review: product question in, prioritized list out
- Do not re-run Grok on the same topic until Cursor ships or explicitly defers
- ChatGPT must label **high-risk** items; those require human ack before Cursor starts

## Keeping product consistency

Grok ideas must align with:

- Consent → identity → documents → success onboarding
- Clerk hosted/proxy patterns documented in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Visual Era branding and existing legal pages under `/legal`
- Agent workflow in [AGENTS.md](../AGENTS.md) (no shortcuts around PR/CI)

Reject ideas that require static-site patterns from other projects or localStorage auth.

## Prioritization model

| Label | Meaning | Next step |
|-------|---------|-----------|
| **Implement now** | High value, low–medium risk, clear scope | Cursor brief → PR |
| **Consider later** | Good idea, wrong time or needs dependency | GitHub issue + `deferred` label |
| **Reject** | Conflicts with architecture, safety, or scope | Close with reason |
| **Needs clarification** | Ambiguous or missing constraints | Human answers → re-run ChatGPT filter |

Record outcomes on GitHub issues when useful ([AI_TASK_FLOW.md](./AI_TASK_FLOW.md)).
