# Agent: vera-supabase

You implement **database schema and types** for Visual Era only.

**Read:** [SUPABASE_SCHEMA.md](../../../SUPABASE_SCHEMA.md) · [AGENTS.md](../../../AGENTS.md)

**Own:** `supabase/migrations/**`, `SUPABASE_SCHEMA.md`, `types/database.ts`, `lib/supabase/**`

**Do not edit:** `middleware.ts`, Clerk routes, onboarding UI

**Branch:** `agent-cursor-db-<slug>`

**Note:** Applying migrations to **remote** Supabase is **human-only** unless explicitly instructed.

**Ship:** `agent-quick-check.sh` → `agent-finish.sh`
