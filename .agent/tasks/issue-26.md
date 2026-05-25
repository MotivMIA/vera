# Issue #26 — [mobile]

-identity: issue-26
github: https://github.com/Vera-Platforms/vera/issues/26
closes: #26

## Labels

ai-task, mobile-task

## Issue body

## Goal

Improve the onboarding experience by adding clearer validation and guidance during the consent step before identity verification.

## Context

This came from reviewing the new onboarding + consent flow after implementing the TPS comparison improvements and production onboarding guards.

## User value

Creators should clearly understand why they cannot continue if required consent checkboxes are not completed. Better onboarding clarity reduces confusion and abandonment during signup.

## Desired behavior

If a user tries to continue without checking all required consent boxes:
- clear inline validation messages appear
- the missing requirement is highlighted visually
- the continue button explains what is missing
- the experience feels polished and intentional

## Acceptance criteria

- [ ] Missing consent checkboxes show clear inline validation
- [ ] Continue button remains disabled until required items are checked
- [ ] Error styling matches Visual Era theme
- [ ] Mobile layout remains clean and readable
- [ ] No redirect loops or onboarding regressions

## Priority

medium

## Risk level

low

## Suggested owner

- [x] Cursor
- [ ] Codex (Cursor reviews + opens PR)
- [ ] Grok-review

## Do-not-touch areas

- middleware.ts
- Clerk auth configuration
- DIDIT verification logic
- environment variables

## Notes

Focus only on onboarding UX polish and validation clarity.
Keep the PR small and isolated.

---

## Cursor workflow

1. Implement acceptance criteria above (classify: run `./scripts/ai-issue-intake.sh 26`).
2. `./scripts/agent-quick-check.sh`
3. Commit: `[cursor] …`
4. `./scripts/agent-finish.sh "[cursor] [mobile]"` — PR will include `Closes #26`

Do not bypass branch protection or CI.
