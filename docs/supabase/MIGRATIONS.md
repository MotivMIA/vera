# Supabase migrations

## Source of truth

`supabase/migrations/` is the versioned schema. [SUPABASE_SCHEMA.md](../../SUPABASE_SCHEMA.md) mirrors it for human review.

## Local workflow

```bash
supabase start          # optional local stack
supabase db reset       # apply all migrations locally
```

## Remote apply (human-only)

1. Merge migration PR to `main`.
2. In Supabase Dashboard → SQL or CLI: apply new migrations to staging, then production.
3. Confirm `types/database.ts` matches live schema.

## CI

PRs that change `supabase/migrations/**` should keep `types/database.ts` aligned.
