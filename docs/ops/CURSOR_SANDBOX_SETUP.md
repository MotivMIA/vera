# Cursor sandbox — `~/Documents/projects` access

Grant the agent read/write to the **whole projects folder** so sibling repos (`ai-ops`, future tools) work without repeated approval prompts. **Sandbox stays on.**

This is **not** a monorepo — each subdirectory remains its own git repo.

## 1. User-level sandbox config (recommended)

Create or merge **`~/.cursor/sandbox.json`**:

```json
{
  "type": "workspace_readwrite",
  "additionalReadwritePaths": [
    "/Users/nathanwilliams/Documents/projects"
  ],
  "enableSharedBuildCache": true
}
```

Replace the path if your home directory differs. See [Cursor sandbox.json reference](https://cursor.com/docs/reference/sandbox).

Paths are **unioned** — your open workspace (e.g. `visual-era`) plus everything under `Documents/projects`.

## 2. Open Cursor on the product repo

**File → Open Folder** → `~/Documents/projects/visual-era`

You do **not** need a `.code-workspace` file. Optional: open `~/Documents/projects/ai-ops` in another window for council work.

## 3. Agent auto-run (UI)

**Cursor Settings → Agents → Auto-Run:** prefer **Allowlist (with Sandbox)** so commands run in the sandbox when possible.

## 4. What stays protected

Cursor still blocks writes to `.cursor/*.json`, `.git/config`, etc. per [official rules](https://cursor.com/docs/reference/sandbox). Do not use `"type": "insecure_none"` unless you accept disabling the sandbox entirely.

## 5. Verify

From Agent chat (with `visual-era` open), a command touching a sibling should not ask for broad filesystem approval every time:

```bash
ls ~/Documents/projects/ai-ops
```

If prompts persist, reload the window (**Cmd+Shift+P** → “Developer: Reload Window”) after editing `sandbox.json`.

## Related

- [LOCAL_WORKSPACE_STRATEGY.md](./LOCAL_WORKSPACE_STRATEGY.md)
- [AI_OPS_REFERENCE.md](./AI_OPS_REFERENCE.md)
