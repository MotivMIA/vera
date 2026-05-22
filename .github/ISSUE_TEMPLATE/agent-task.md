---
name: Agent task
about: Assign scoped work to Cursor (supervisor) or Codex (worker)
title: "[cursor] "
labels: []
assignees: []
---

## Supervisor

- [ ] Cursor (orchestrator)
- [ ] Human only

## Worker

- [ ] Codex
- [ ] Cursor (implements directly)
- [ ] Human

## Task

<!-- Clear, bounded outcome -->

## Acceptance criteria

- [ ] 
- [ ] 

## Branch (when started)

`agent-<agent>-<feature>` — create with:

```bash
./scripts/start-agent-task.sh cursor <feature-slug>
```

## Constraints

- Do not push to `main`
- PR required; CI must pass before merge
- One agent per branch per feature

## Notes

<!-- Links, screenshots, related PRs -->
