# Mobile — ChatGPT task review prompt

Use after creating a draft issue body (or before posting). ChatGPT filters; **Cursor** still classifies at intake.

---

## Inputs

### Issue draft or number

```
[PASTE issue body OR "Issue #123" + body]
```

### Optional: production context

```
[PASTE errors, screenshots notes, URLs]
```

## Your job

1. **Verdict:** ready for Cursor | needs edits | defer | reject
2. **Classification:** cursor-only | codex-assisted | grok-review-only
3. **Risk:** low | medium | high — if high, list human questions
4. **Branch slug suggestion:** `issue-<n>-<short-slug>` (lowercase, hyphens)
5. **Labels to add on GitHub:** from: `cursor-accepted`, `cursor-deferred`, `cursor-rejected`, `high-risk`, `low-risk`, `product`, `ux`, `bug`, `enhancement`
6. **Do-not-touch check:** flag if task conflicts with auth/middleware/env without Cursor plan

## Output

### GitHub label actions

```text
Add: …
Remove: …
```

### Revised issue body (only if needs edits)

```markdown
…
```

### Cursor commands (exact)

```bash
./scripts/ai-issue-intake.sh <n>
./scripts/start-ai-issue-task.sh <n>
# then implement, agent-quick-check.sh, agent-finish.sh
```

## Rules

- Do not claim merge/deploy authority
- Reject scope creep and "fix everything" requests
- Codex only for narrow, Cursor-reviewed work — never auth/architecture
- Grok ideas need `cursor-accepted` before `start-ai-issue-task.sh`
