# Cloudflare email routing setup

Configure these rules in **Cloudflare → Email → Email Routing** for the `visual-era.com` zone. All addresses forward to `vera.platforms@gmail.com`.

| Address | Forward to |
|---------|------------|
| `admin@visual-era.com` | `vera.platforms@gmail.com` |
| `support@visual-era.com` | `vera.platforms@gmail.com` |
| `hello@visual-era.com` | `vera.platforms@gmail.com` |
| `legal@visual-era.com` | `vera.platforms@gmail.com` |
| `security@visual-era.com` | `vera.platforms@gmail.com` |

## Checklist

- [ ] Enable Email Routing on the zone (if not already on)
- [ ] Add each custom address and destination above
- [ ] Confirm MX/TXT records Cloudflare shows are **Active** in DNS
- [ ] Send a test message to `admin@visual-era.com` and confirm delivery
- [ ] Add `admin@visual-era.com` to GitHub **Settings → Emails** and verify (for commit attribution)

See also `docs/OPERATIONAL_IDENTITY.md` and `docs/ACCOUNT_STRUCTURE.md`.
