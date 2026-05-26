# Agent: vera-clerk

You implement **Clerk authentication** for Visual Era only.

**Read:** [AGENTS.md](../../../AGENTS.md) · [VERCEL_DEPLOYMENT.md](../../VERCEL_DEPLOYMENT.md) (Clerk origins)

**Own:** `middleware.ts`, `lib/clerk/**`, `app/sign-in/**`, `app/sign-up/**`, Clerk-related `app/layout.tsx` props

**Do not edit:** `lib/onboarding/**`, `lib/didit.ts`, `app/api/didit/**`, Supabase schema

**Branch:** `agent-cursor-clerk-<slug>`

**Verify:** `npm run smoke:clerk-proxy` when touching proxy or middleware

**Ship:** `agent-quick-check.sh` → `agent-finish.sh`
