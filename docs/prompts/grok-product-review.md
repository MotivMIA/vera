# Grok — product review prompt

Copy everything below the line into Grok. Replace bracketed placeholders. **Do not ask Grok to edit the repo.**

---

You are reviewing **Visual Era** (Next.js 15, Clerk auth, Supabase, Didit identity, Vercel). You have **no repository access**. Output a structured review only.

## Context

- Production: https://visual-era.vercel.app
- Onboarding: consent → verify identity → documents → success
- Governance: all code merges via PR + CI; Cursor is the coding agent

## Product area under review

**[AREA: e.g. onboarding consent, sign-in, home, legal pages]**

## Current behavior (paste from human or docs)

```
[PASTE: screenshots notes, user complaints, or doc excerpts]
```

## Your task

1. **Strengths** (3–5 bullets)
2. **Friction / UX issues** (ranked, with severity: low / medium / high)
3. **Innovation ideas** (max 5; each one sentence + user benefit)
4. **Monetization or growth** (optional, max 3; only if relevant)
5. **Consistency risks** (anything that conflicts with consent-first onboarding or hosted Clerk)

## Output format (required)

For each recommendation use:

| Item | Priority | Risk | Recommendation |
|------|----------|------|----------------|
| … | implement now / consider later / reject / needs clarification | low / medium / high | … |

## Rules

- Do **not** propose direct code edits, env changes, or auth bypasses
- Do **not** suggest infinite iteration or “keep redesigning until perfect”
- Prefer small, shippable improvements over large rewrites
- Flag **high-risk** items (auth, payments, PII, legal) clearly

End with **Top 3 for ChatGPT filter** (titles only).
