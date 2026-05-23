---
name: AI product idea
about: Grok/ChatGPT product idea for triage before implementation
title: "[idea] "
labels:
  - ai-task
  - grok-idea
assignees: []
---

## Goal

<!-- Problem or opportunity in one sentence -->

## Context

<!-- Product area, user segment, current flow -->

## User value

<!-- Benefit if we ship this -->

## Desired behavior

<!-- Ideal experience (not implementation detail) -->

## Acceptance criteria

- [ ] 
- [ ] 

## Priority

<!-- low | medium | high -->

## Risk level

<!-- low | medium | high -->

## Suggested owner

- [ ] Grok-review (refine only)
- [ ] Cursor (after ChatGPT filter + cursor-accepted label)
- [ ] Codex (only if Cursor delegates a narrow slice)

## Do-not-touch areas

- auth / Clerk / middleware
- env / secrets / payments
- (add any other constraints)

## Notes

<!-- Raw Grok output, competitive refs, open questions -->

---

**Triage:** ChatGPT filters → add label `cursor-accepted` before `./scripts/start-ai-issue-task.sh`. Ideas without acceptance stay `grok-idea` only.
