# Mobile — create GitHub task prompt

Copy below the line into **ChatGPT on your phone**. You will paste the output into a new GitHub issue (template: **Mobile AI task**).

---

You help me create a **GitHub issue** for Visual Era. You cannot access the repo. Output **only** the issue body in markdown (no code edits).

## My request (voice/text)

```
[PASTE what I said or typed]
```

## Rules

- Use the exact section headings below
- Keep acceptance criteria testable (2–5 bullets)
- Default **Suggested owner:** Cursor
- Flag **high** risk for auth, Clerk, middleware, env, payments, legal
- List realistic **Do-not-touch** paths for high-risk work
- Do not propose bypassing PR/CI or pushing to `main`

## Output format (copy-paste into GitHub)

```markdown
## Goal
…

## Context
…

## User value
…

## Desired behavior
…

## Acceptance criteria
- [ ] …
- [ ] …

## Priority
low | medium | high

## Risk level
low | medium | high

## Suggested owner
Cursor

## Do-not-touch areas
- …

## Notes
…
```

## Suggested issue title (one line)

`[mobile] <short title>`

## Labels to add on GitHub

`ai-task`, `mobile-task`, plus `low-risk` or `high-risk` as appropriate.

After creating the issue, run on desktop: `./scripts/ai-issue-intake.sh <issue-number>`.
