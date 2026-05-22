# Cursor + Codex — avoid overwriting each other

You are **not** clashing because both agents are evil. Clashes happen when **two writers edit the same branch at the same time** without pulling first.

## The simple rule

| Situation | What to do |
|-----------|------------|
| Codex is building a feature | **Only Codex** edits; Cursor reads/reviews after push |
| Cursor is fixing/reviewing | **Only Cursor** edits on `cursor` (or `main` if you agree) |
| Switching agents | **Commit or stash** → `git pull` → then let the other agent continue |

**Never** have Codex and Cursor both changing files in the same uncommitted working tree.

## Recommended lanes (pick one style)

### Style A — Single production branch (what you use now)

- Everyone commits to **`main`** (or PR into `main`).
- **One agent at a time** until the deploy is verified.
- After Codex finishes: **stop Codex**, let Cursor review, commit, deploy.
- After Cursor deploys: **pause Cursor edits** until you test production.

### Style B — Two branches (less collision)

- **Codex** → branch `codex` → push → PR to `main`
- **Cursor** → branch `cursor` → merge/review → PR to `main`
- Only one PR merged at a time.

## Who owns what (default)

| Area | First choice |
|------|----------------|
| Big multi-file builds | Codex |
| Production bugs, stuck UI, deploy | Cursor |
| `lib/didit.ts`, `didit-embed.tsx` | One agent per session — not both same day without merge |

## Before you open Codex

1. Pull latest: `git pull origin main`
2. Tell Codex: **“Work only on branch X; do not change middleware unless asked.”**
3. When done: **commit + push** before opening Cursor Agent.

## Before you open Cursor

1. Pull latest (includes Codex pushes).
2. Say: **“Review only”** or **“Fix and deploy”** so scope is clear.
3. Do not run Codex on the same files in parallel.

## This is not one shared prompt (yet)

Cursor and Codex do **not** run from a single message. Use one brief in both panels, or one agent at a time — see [UNIFIED_PROMPT.md](./UNIFIED_PROMPT.md).
