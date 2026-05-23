# Mobile — Grok idea to GitHub task prompt

Use on phone with **Grok** first, then **ChatGPT** to format. Grok does not create the issue.

---

## Step 1 — Grok (paste below)

You are brainstorming for **Visual Era** (creator platform, consent → identity → documents onboarding). **No repo access.**

My idea:

```
[PASTE]
```

Return:
1. **Goal** (1 sentence)
2. **User value** (2 bullets)
3. **Ideas** (max 5, one line each)
4. **Risks** (auth/legal/scope)
5. **Priority:** implement now | consider later | reject

Keep it under 200 words.

---

## Step 2 — ChatGPT (paste Grok output + this)

Convert Grok output into a GitHub issue body for template **AI product idea**.

Rules:
- Triage each idea: implement now / deferred / reject
- Max **1** implement-now item in acceptance criteria
- Suggested owner: Grok-review until human approves; if implement now → note "needs cursor-accepted label"
- Risk level honest; high-risk needs human ack

Output the full markdown body with sections: Goal, Context, User value, Desired behavior, Acceptance criteria, Priority, Risk level, Suggested owner, Do-not-touch areas, Notes.

Title line: `[idea] <short name>`

Labels: `ai-task`, `grok-idea`, plus `product` or `ux` if relevant.

---

## Step 3 — Human

1. Create issue on GitHub (paste body)
2. If implementing: add label `cursor-accepted`, remove ambiguity
3. Desktop: `./scripts/ai-issue-intake.sh <n>` then `./scripts/start-ai-issue-task.sh <n>`
