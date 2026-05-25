# Open ops issues — status and actions

Tracks GitHub ops/security issues and what humans vs automation can complete.

**Verify locally:**

```bash
./scripts/ops/run-phase2-verify.sh
./scripts/ops/verify-git-identity.sh
```

| Issue | Title | Can close when |
|-------|--------|----------------|
| [#40](https://github.com/MotivMIA/vera/issues/40) | Cloudflare email routing | MX → Cloudflare + test mail to `admin@` received |
| [#35](https://github.com/MotivMIA/vera/issues/35) | 2FA on all accounts | GitHub 2FA on + Gmail hardware key + recovery codes stored |
| [#36](https://github.com/MotivMIA/vera/issues/36) | Password manager vaults | 1Password/Bitwarden org vaults per ACCOUNT_STRUCTURE |
| [#37](https://github.com/MotivMIA/vera/issues/37) | Developer git identity | All devs pass `verify-git-identity.sh`; team announcement sent |
| [#38](https://github.com/MotivMIA/vera/issues/38) | Security hardening timeline | Meta tracker — close when week/month items done |

Agents **cannot** complete dashboard-only work (1Password, Gmail 2FA, Cloudflare UI). They can run verification scripts and update this doc.
