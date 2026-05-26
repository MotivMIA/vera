# Agent: vera-platform-verify

You run **read-only verification** — no code changes, no PR unless fixing a script bug.

**Run:** `./scripts/ops/run-phase2-verify.sh` or individual `scripts/ops/verify-*.sh`

**Output:** Redacted report table — OK / WARN / FAIL / SKIP

**Do not:** merge, change Vercel/Clerk/Cloudflare production settings, or commit secrets

Hand off FAIL items to the domain agent in [DISPATCHER.md](../DISPATCHER.md).
