# Cursor sandbox — Visual Era workspace

Grant the agent read/write to this repository while keeping the Cursor sandbox enabled.

## 1. Open the product repo

**File → Open Folder** → `~/Documents/projects/visual-era`

Do not open `~/Documents/projects` or your home directory as the agent root for product work.

## 2. Optional user-level sandbox path

If the agent repeatedly asks for approval to run commands inside this repo, create or merge **`~/.cursor/sandbox.json`**:

```json
{
  "type": "workspace_readwrite",
  "additionalReadwritePaths": [
    "/Users/nathanwilliams/Documents/projects/visual-era"
  ],
  "enableSharedBuildCache": true
}
```

Replace the path if your clone lives elsewhere. See [Cursor sandbox.json reference](https://cursor.com/docs/reference/sandbox).

## 3. Agent auto-run (UI)

**Cursor Settings → Agents → Auto-Run:** prefer **Allowlist (with Sandbox)**.

## 4. Auto-run (recommended)

**Cursor Settings → Agents → Auto-Run:** **Allowlist (with Sandbox)** so the agent can run:

- `npm run env:check`
- `npm run dev:smoke`
- `./scripts/agent-quick-check.sh`
- `./scripts/start-agent-task.sh`

## 5. Verify

From Agent chat with `visual-era` open:

```bash
npm run env:check
./scripts/agent-quick-check.sh
```

## Related

- [LOCAL_ENV.md](./LOCAL_ENV.md)
- [LOCAL_WORKSPACE_STRATEGY.md](./LOCAL_WORKSPACE_STRATEGY.md)
- [AGENTS.md](../../AGENTS.md)
