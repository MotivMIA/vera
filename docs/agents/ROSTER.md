# Visual Era — agent roster

**Workspace:** `~/Documents/projects/visual-era` only · **Repo:** [natew-dev/vera](https://github.com/natew-dev/vera)

One **implementation agent** for the onboarding website. See [DECISIONS.md](../DECISIONS.md).

---

## Active agent

| Agent ID | Owns | Branch prefix |
|----------|------|---------------|
| **vera-website** | Public site + onboarding end-to-end (`app/**` except `app/dashboard/**`, DIDIT, onboarding APIs) | `agent-cursor-` (CI: `agent-cursor-<slug>`) |

**Prompt:** [prompts/vera-website.md](./prompts/vera-website.md)

**Guardrails:** [DECISIONS.md](../DECISIONS.md#vera-website-guardrails)

---

## Deferred

| Agent ID | When |
|----------|------|
| **vera-product** | After onboarding ships — owns `app/dashboard/**` and product APIs |

---

## Starting a chat

```text
Agent: vera-website
Read and follow: docs/agents/prompts/vera-website.md
```

Then send your task (branch slug, acceptance).
