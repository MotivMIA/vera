# Repository restructure audit — VERA / Visual Era

**Audit date:** 2026-05-25  
**Auditor:** Cursor (read-only; no protections or remotes changed)  
**Worktree:** `visual-era` (local folder name; not authoritative)  
**Scope:** Post–org restructure consistency, workflow integrity, product-repo scope

---

## Executive summary

| Verdict | Detail |
|---------|--------|
| **Canonical repo** | ✅ **`Vera-Platforms/vera`** — matches `origin`, `scripts/lib/github-repo.sh`, `AGENTS.md`, CI |
| **Workflow scripts** | ✅ Agent branch / PR / CI philosophy intact on `main` |
| **Product-only scope** | ✅ **No external planning scaffolding on `main`** — `./scripts/check-repo-boundaries.sh` in CI |
| **Identity docs** | ✅ **Updated 2026-05-25** — `natew-dev` personal; MotivMIA + Vera-Platforms as **sibling** orgs (see OPERATIONAL_IDENTITY, ACCOUNT_STRUCTURE) |
| **Legacy migration docs** | ⚠️ Superseded paths remain (intentional history) but easy to misread |
| **Tooling footers** | ✅ `check-github-owner-refs.sh` updated to Vera-Platforms/vera |
| **Scalability** | ✅ Architecture is sound **after** identity doc cleanup; product repo stays deployable-only |

**Recommendation:** Treat this audit as **report-only**. Ship **one low-risk docs PR** to align identity narrative with the structure below; defer dashboard work to humans.

---

## 1. Detected canonical configuration (from this worktree)

Discovered automatically — do not assume other clones match until verified.

| Setting | Detected value | Source |
|---------|----------------|--------|
| **Remote `origin`** | `https://github.com/Vera-Platforms/vera.git` | `git remote -v` |
| **Default branch** | `main` | `refs/remotes/origin/HEAD` → `origin/main` |
| **Script default slug** | `Vera-Platforms/vera` | `scripts/lib/github-repo.sh` → `DEFAULT_REPO` |
| **Override** | `export GITHUB_REPO=...` | Same file |
| **Production URL (docs + CI)** | `https://visual-era.com` | `AGENTS.md`, `.github/workflows/ci.yml` |
| **Vercel fallback** | `visual-era.vercel.app` | Docs / transition |
| **Local folder name** | `visual-era` (arbitrary) | Filesystem only |

### Canonical architecture (human-confirmed)

**Legal / corporate:**

```text
Motiv MIA (parent company)
    → Visual Era (subsidiary)
        → VERA (product)
```

**Platform / GitHub** (separate orgs by design):

```text
natew-dev (personal) — administers both orgs
    ├── MotivMIA (org) — incubator / holding-side engineering
    └── Vera-Platforms (org) — Visual Era / VERA production
            └── vera — canonical app repo
```

**visual-era.com** — production domain

Legal parent/subsidiary does **not** mean Vera-Platforms is nested inside MotivMIA on GitHub. Do not document `MotivMIA/vera` or collapse orgs for convenience.

**Correction for orchestrators (ChatGPT):** Active repo slug is **`Vera-Platforms/vera` only**. Do not use `MotivMIA/vera`, `visualera/vera`, or `natew-dev/vera` for new work.

**Personal account:** **`natew-dev`** (not a separate `MotivMIA` GitHub user for day-to-day dev). Commit email remains `admin@visual-era.com`.

---

## 2. Workflow preservation (verified)

Philosophy on `main` remains consistent with [AGENTS.md](../../AGENTS.md):

| Control | Status |
|---------|--------|
| Protected `main` | Documented; enforced via GitHub (verify in UI) |
| PR-required changes | Documented |
| No direct push to `main` | Agent scripts enforce clean tree + branch workflow |
| CI gate **CI checks** | `.github/workflows/ci.yml` on `pull_request` → `main` |
| Auto-merge after checks | `agent-finish.sh` / `open-agent-pr.sh` |
| Agent branches `agent-<agent>-<feature>` | `start-agent-task.sh`, `agent-branch.sh` |
| Cursor = implement + PR | Documented |
| ChatGPT = orchestrate only | Documented |
| Codex = optional `agent-codex-*` | Documented |
| Grok = ideas → ChatGPT | Documented |

**No weakening changes were made during this audit.**

---

## 3. Product-only scope

| Check | Result |
|-------|--------|
| Product code focus | `app/`, `lib/`, platform stack — appropriate |
| External planning docs/scripts | **Absent** on `main` — enforced by `./scripts/check-repo-boundaries.sh` |
| Orchestration workflow | ChatGPT (or human) → brief → Cursor on `agent-cursor-*` — paste text only |

**Rule:** `Vera-Platforms/vera` is the Visual Era **product** repo only. Do not commit cross-repo planning scaffolding here.

---

## 4. Contradictions and stale references

### 4.1 High-impact contradictions (addressed 2026-05-25)

| Topic | Was | Now |
|-------|-----|-----|
| **Personal GitHub user** | Docs said `MotivMIA` user | **`natew-dev`** in OPERATIONAL_IDENTITY + ACCOUNT_STRUCTURE |
| **Who owns `vera`** | MotivMIA org listed `vera` | **Vera-Platforms** only |
| **Org relationship** | Diagram implied Vera under MotivMIA | **Sibling orgs** under `natew-dev` |

### 4.2 Stale but intentionally historical (keep with banners)

| File | Issue | Action |
|------|-------|--------|
| [docs/GITHUB_REPO_MIGRATION.md](../GITHUB_REPO_MIGRATION.md) | `MotivMIA/vera` → `visualera/vera` plan | ✅ Superseded banner exists; **do not follow** |
| [docs/ops/GITHUB_ORG_MIGRATION.md](./GITHUB_ORG_MIGRATION.md) | Pre-transfer checklists reference `natew-dev/vera` | ✅ Keep as **completed migration** record; add top “post-transfer only” pointer to POST_MIGRATION |

### 4.3 Low-risk stale snippets (safe cleanup PR)

| Location | Stale content | Suggested fix |
|----------|---------------|---------------|
| `scripts/check-github-owner-refs.sh:94` | “live repo: **natew-dev/vera**” | → `Vera-Platforms/vera` |
| `scripts/audit-github-repo-settings.sh` header comment | example `visualera/vera` | → `Vera-Platforms/vera` |
| `scripts/setup-github-branch-protection.sh` header comment | example `visualera/vera` | → `Vera-Platforms/vera` |
| [docs/ops/GITHUB_ORG_MIGRATION.md](./GITHUB_ORG_MIGRATION.md):22 | “clones may still show MotivMIA/vera” | Add “or natew-dev/vera” or “stale remotes” generically |

### 4.4 Reference scan summary

`./scripts/check-github-owner-refs.sh` (2026-05-25):

- **~176** legacy slug matches (many in superseded `GITHUB_REPO_MIGRATION.md`)
- **Canonical URLs** in active ops docs point to **Vera-Platforms/vera**
- Product strings `visual-era.com` / `@visual-era.com` are **expected** (not stale)

---

## 5. Recommended sources of truth (canonical)

Use these **in order** when docs conflict:

| Priority | Document | Use for |
|----------|----------|---------|
| 1 | [AGENTS.md](../../AGENTS.md) | Agent workflow, branch rules, repo slug in footer |
| 2 | [docs/ops/POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md) | Dashboard reconnect checklist (post-transfer) |
| 3 | [docs/ops/GITHUB_ORG_MIGRATION.md](./GITHUB_ORG_MIGRATION.md) | Transfer history + smoke tests |
| 4 | [docs/OPERATIONAL_IDENTITY.md](../OPERATIONAL_IDENTITY.md) | Commit email, org hierarchy (**after** natew-dev/MotivMIA cleanup) |
| 5 | [scripts/lib/github-repo.sh](../../scripts/lib/github-repo.sh) | Programmatic `GITHUB_REPO` default |
| 6 | [docs/GITHUB_REPO_MIGRATION.md](../GITHUB_REPO_MIGRATION.md) | **Historical only** — never for new work |

**Deprecated repo slugs:** `visualera/vera`, `MotivMIA/vera` as owner.

---

## 6. Operational risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Agent brief cites wrong repo slug | Medium | ChatGPT uses `Vera-Platforms/vera`; paste this audit |
| Identity doc misleads new devs | Medium | Docs PR + TEAM_ANNOUNCEMENT addendum |
| Vercel still linked to old GitHub path | High | [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md) §2 |
| Clerk origin missing custom domain | High | Same doc §4 |
| Push rejected (GH007 private email) | Low | GitHub email settings or `noreply` on **contributor** account |
| Re-introducing external planning scaffolding | Medium | `./scripts/check-repo-boundaries.sh` + CI |
| Many stale agent branches on remote | Low | Hygiene pass later (not in this audit) |

---

## 7. Unresolved TBD (human)

| Item | Owner |
|------|-------|
| ~~Canonical personal GitHub username~~ | **Resolved:** `natew-dev` |
| Whether `MotivMIA` org still holds non-VERA repos only | Human |
| Branch protection on private org (403 without Pro) | Human / GitHub plan |
| All POST_MIGRATION dashboard steps complete | Human |

---

## 8. Manual dashboard checks still required

From [POST_MIGRATION_CONNECTIONS.md](./POST_MIGRATION_CONNECTIONS.md) and [OPEN_OPS_ISSUES.md](./OPEN_OPS_ISSUES.md):

- [ ] Cloudflare DNS → Vercel ([CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md))
- [ ] Vercel Git → **Vera-Platforms/vera**
- [ ] `NEXT_PUBLIC_SITE_URL=https://visual-era.com` (Production)
- [ ] Clerk allowed origins include **visual-era.com**
- [ ] Supabase GitHub re-auth (if used)
- [ ] Cursor / Codex GitHub app → **Vera-Platforms/vera**
- [ ] Issues #35–#40 (2FA, vaults, git identity, security, email routing)

Agents **cannot** complete UI-only steps.

---

## 9. Recommended cleanup actions (for a follow-up PR)

### Low risk (docs + script comments only)

1. ~~Identity doc alignment~~ — **Done** (OPERATIONAL_IDENTITY, ACCOUNT_STRUCTURE, check-github-owner-refs footer).
2. Fix example `GITHUB_REPO=` in `audit-github-repo-settings.sh` / `setup-github-branch-protection.sh` headers (`visualera` → `Vera-Platforms`).
3. Optional: link this audit from POST_MIGRATION_CONNECTIONS.

### Medium risk (do not batch with product features)

- Re-run `./scripts/ops/run-phase2-verify.sh` after dashboard reconnect.
- `GITHUB_REPO=Vera-Platforms/vera ./scripts/audit-github-repo-settings.sh` (needs `gh` auth).

### Out of scope / do not do

- Delete remote agent branches
- Change branch protection via API without human
- Move repo again
- Add external planning scaffolding to VERA
- Modify secrets or Vercel env via automation without brief

---

## 10. Future org/repo scaling

| Layer | Suggested use |
|-------|----------------|
| **natew-dev** | Personal forks, experiments, pre-incubator work |
| **MotivMIA** | Incubator org — templates, R&D, non-production repos |
| **Vera-Platforms** | Customer-facing product repos (`vera`, future apps) |
VERA repo stays deployable product only; external planning must not be committed here.

---

## 11. Is the architecture clean and scalable?

**Yes, with caveats.**

- **Repo and workflow layer** are already aligned on **Vera-Platforms/vera** and protected PR/CI — scalable for team growth.
- **Identity narrative layer** is **aligned** with natew-dev + sibling orgs (MotivMIA / Vera-Platforms) as of 2026-05-25.
- **Product-only scope** is clean on `main` today; CI boundary check helps keep it that way.

---

## Appendix: Commands used

```bash
git remote -v
git symbolic-ref refs/remotes/origin/HEAD
cat scripts/lib/github-repo.sh
./scripts/check-github-owner-refs.sh
./scripts/check-repo-boundaries.sh
rg 'natew-dev|MotivMIA/vera|visualera/vera' docs scripts
```

---

*Next step: human confirms personal GitHub username, then Cursor opens `agent-cursor-repo-restructure-doc-cleanup` for §9 low-risk items only.*
