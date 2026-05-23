---
name: Mobile AI task
about: Structured task from mobile ChatGPT (ready for Cursor intake)
title: "[mobile] "
labels:
  - ai-task
  - mobile-task
assignees: []
---

## Goal

<!-- One sentence outcome -->

## Context

<!-- Where this came from: mobile chat, production issue, user report -->

## User value

<!-- Why this matters to creators/users -->

## Desired behavior

<!-- What should happen after implementation -->

## Acceptance criteria

- [ ] 
- [ ] 

## Priority

<!-- low | medium | high -->

## Risk level

<!-- low | medium | high — high-risk needs human ack before Cursor starts -->

## Suggested owner

<!-- Cursor (default) | Codex (scoped helper only) | Grok-review (ideas only, no code) -->

- [ ] Cursor
- [ ] Codex (Cursor reviews + opens PR)
- [ ] Grok-review

## Do-not-touch areas

<!-- e.g. middleware.ts, auth, env, payments — leave blank if none -->

- 

## Notes

<!-- Links, screenshots, related issues -->

---

**Workflow:** ChatGPT formats on phone → paste this issue → `./scripts/ai-issue-intake.sh <n>` → `./scripts/start-ai-issue-task.sh <n>` → Cursor implements → PR with `Closes #<n>`.
