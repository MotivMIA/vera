# Operational Identity & GitHub Structure

This document standardizes the organizational hierarchy, account ownership, commit identity, and operational security practices for the Visual Era / VERA stack.

## Organizational Hierarchy

Use **two layers** — legal/corporate and platform/GitHub. They are related but **not the same shape**.

### Legal / corporate (authoritative for ownership & contracts)

```
Motiv MIA (parent company)
    ↓
Visual Era (subsidiary — company / brand)
    ↓
VERA (platform / product)
```

| Entity | Legal role |
|--------|------------|
| **Motiv MIA** | Parent company |
| **Visual Era** | Subsidiary of Motiv MIA |
| **VERA** | Product / platform operated under Visual Era |

### Platform / GitHub (authoritative for repos & engineering)

On GitHub, **orgs stay separate on purpose** — even though Motiv MIA is the legal parent. **Vera-Platforms is not nested inside the MotivMIA org.** Both orgs are administered by **`natew-dev`**.

```text
natew-dev (personal GitHub user — login, SSH, day-to-day PRs)
    ├── MotivMIA (GitHub org) — incubator / umbrella engineering
    └── Vera-Platforms (GitHub org) — production / Visual Era product repos
            └── vera  ← canonical VERA application (this repo)
```

| GitHub entity | Platform role | Owns `vera`? |
|---------------|---------------|----------------|
| **`natew-dev`** | Personal developer identity | No (contributor via org membership) |
| **`MotivMIA`** | Incubator / umbrella org (engineering) | **No** |
| **`Vera-Platforms`** | Production org for Visual Era / VERA | **Yes** (`vera`) |

**Why separate on GitHub:** Clear blast radius, access control, and product CI/deploy boundaries — without implying Motiv MIA is “less than” Visual Era legally; it is the **holding** layer, not the product runtime owner.

### Entity definitions (crosswalk)

| Name | Legal | GitHub / platform |
|------|-------|-------------------|
| **Motiv MIA** | Parent company | `MotivMIA` org — incubator repos, not `vera` |
| **Visual Era** | Subsidiary | Brand + `Vera-Platforms` org for production code |
| **VERA** | Product | `Vera-Platforms/vera` repository |

---

## Identity Structure

### 1. Personal Contributor Identity

**Account**: [`natew-dev`](https://github.com/natew-dev) (GitHub user)  
**Email**: Personal Gmail (for account login and recovery)  
**Purpose**: Personal identity; creates and administers **MotivMIA** and **Vera-Platforms** orgs  
**VERA repo**: Owned by [**Vera-Platforms**](https://github.com/Vera-Platforms) — e.g. [`vera`](https://github.com/Vera-Platforms/vera)

**Configuration**:
```bash
# GitHub account login uses personal Gmail
# This remains the primary identity for 2FA recovery and account security
```

---

### 2. Git Commit Identity

**Recommended Commit Email**: `admin@visual-era.com`  
**Alternative**: `dev@visual-era.com`  
**Purpose**: Identify commits as organizational work  

**Global Configuration**:
```bash
git config --global user.email "admin@visual-era.com"
git config --global user.name "Visual Era Team"
```

**Per-Repository Override** (if needed):
```bash
git config user.email "admin@visual-era.com"
git config user.name "Visual Era Team"
```

**Verification**:
```bash
# Check current global config
git config --global user.email

# Check repo-specific config
git config user.email
```

**GitHub Verification**: 
- To keep commits verified on GitHub, ensure `admin@visual-era.com` is added as a verified email on the **`natew-dev`** GitHub account.
- If using GPG signatures, sign commits with the organizational key.

---

### 3. Infrastructure Ownership

**Account**: `vera.platforms@gmail.com`  
**Purpose**: Root infrastructure and operations account  
**Access Level**: Owner/admin on all infrastructure services

**Manages**:
- Cloudflare (DNS, email routing, WAF)
- Vercel (platform hosting and deployments)
- Clerk (authentication provider)
- Supabase (database and backend services)
- Resend (email service)
- Domain registrar (account and recovery)
- All other platform infrastructure services

**Security**:
- 2FA enabled (hardware security key preferred)
- Stored in dedicated password manager
- Recovery codes stored in secure offline location
- Never used for day-to-day development
- Access limited to infrastructure changes only

---

### 4. Public/Business-Facing Email Aliases

These aliases route through **Cloudflare Email Routing** into `vera.platforms@gmail.com`:

| Alias | Purpose | Usage |
|-------|---------|-------|
| `admin@visual-era.com` | Administrative matters | System operations, alerts |
| `support@visual-era.com` | Customer/creator support | Support requests, inquiries |
| `hello@visual-era.com` | General inquiries | Contact form, intro emails |
| `legal@visual-era.com` | Legal matters | Contracts, legal notices |
| `security@visual-era.com` | Security issues | Bug reports, security disclosures |

**Routing Configuration** (Cloudflare):
```
admin@visual-era.com     → vera.platforms@gmail.com
support@visual-era.com   → vera.platforms@gmail.com
hello@visual-era.com     → vera.platforms@gmail.com
legal@visual-era.com     → vera.platforms@gmail.com
security@visual-era.com  → vera.platforms@gmail.com
```

---

## Repository Ownership

| Repo class | GitHub org | Example |
|------------|------------|---------|
| **VERA product (production)** | **Vera-Platforms** | https://github.com/Vera-Platforms/vera |
| **Incubator / other projects** | **MotivMIA** | https://github.com/MotivMIA/{repo} |

**Do not** assume `vera` lives under MotivMIA on GitHub. Legal parent/subsidiary (Motiv MIA → Visual Era) does **not** mean the Vera-Platforms org is inside the MotivMIA org.

### Why This Structure

1. **Organization Ownership**: Separates personal (`natew-dev`) from product (`Vera-Platforms`) and incubator (`MotivMIA`)
2. **Team Collaboration**: Grant access per org without sharing the personal account
3. **Scalability**: New products can use Vera-Platforms; experiments stay on MotivMIA
4. **Security**: Clear separation of personal vs. operational identities

---

## Operational Security Practices

### Authentication & Access Control

#### 2FA Strategy
- **GitHub Account** (`natew-dev`): TOTP (authenticator app) + backup codes
- **Infrastructure Account** (`vera.platforms@gmail.com`): Hardware security key (Yubikey or similar)
- All backup codes stored offline in encrypted container

#### SSH Keys
- Generate separate SSH keys for:
  - Development machine: `id_rsa_dev`
  - CI/CD: `id_rsa_ci` (deployed via secrets management)
  - Backup machine: `id_rsa_backup`
- Register public keys with GitHub organization

#### Personal Access Tokens (PAT)
- Use fine-grained PATs for GitHub integrations
- Scoped to specific repositories and permissions
- Rotated every 90 days
- Never stored in code or `.env` files (use secrets management)

### Password Management

- **Tool**: 1Password or Bitwarden (organization-wide)
- **Vaults**:
  - `Personal` — personal account credentials
  - `Operations` — infrastructure and business accounts
  - `Development` — API keys, tokens, secrets
- **Access Control**: Vault sharing policies per team role

### Recovery Strategy

| Account | Recovery Method | Location |
|---------|-----------------|----------|
| GitHub (`natew-dev`) | Backup codes + personal email | Encrypted offline storage |
| Infrastructure (`vera.platforms@gmail.com`) | Recovery codes + backup phone | Separate offline storage |
| Domain Registrar | Recovery email + phone | Stored in password manager |
| Cloudflare | Backup codes | Encrypted storage |

---

## Separation of Concerns

### Personal vs. Infrastructure

| Activity | Account | Identity |
|----------|---------|----------|
| Development commits | `natew-dev` (GitHub) | `admin@visual-era.com` (git) |
| VERA product repos | `Vera-Platforms` (org) | `natew-dev` (org owner) |
| Incubator repos | `MotivMIA` (org) | `natew-dev` (org owner) |
| Infrastructure changes | `vera.platforms@gmail.com` | `vera.platforms@gmail.com` |
| Email communications | Business aliases | Routes to vera.platforms@gmail.com |
| Account recovery | Personal Gmail | Used only for critical access |

### Why Separation Matters

1. **Security**: Infrastructure account never used for day-to-day work reduces exposure
2. **Auditability**: Clear separation makes it easy to identify which account performed actions
3. **Team Scaling**: New team members can access development without infrastructure access
4. **Incident Response**: Compromised dev account doesn't compromise infrastructure
5. **Compliance**: Separates personal identity from operational identity

---

## Git Configuration Reference

### Initial Setup

```bash
# Set global identity for Visual Era work
git config --global user.email "admin@visual-era.com"
git config --global user.name "Visual Era Team"

# Verify
git config --global --list | grep user
```

### Per-Repository Override

If working on a personal project in the same environment:

```bash
cd /path/to/personal-repo
git config user.email "personal@example.com"
git config user.name "Your Name"

# Verify
git config user.email
```

### SSH Configuration

Add to `~/.ssh/config`:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_dev
  AddKeysToAgent yes
```

### Commit Signing (Optional)

For GPG-signed commits:

```bash
# Generate organizational GPG key
gpg --gen-key

# Configure git to sign commits
git config --global user.signingKey YOUR_KEY_ID
git config --global commit.gpgSign true

# Commits will now be automatically signed
git commit -m "Your message"
```

---

## Architecture Diagram

```
                    natew-dev (personal GitHub user)
                              │
              ┌───────────────┴───────────────┐
              │                               │
    github.com/MotivMIA            github.com/Vera-Platforms
    (incubator org — sibling)      (production org — sibling)
              │                               │
    other / R&D repos                 github.com/Vera-Platforms/vera
                                              │
                              Visual Era product (VERA)
                              Contributors: natew-dev (+ team)
                              Git commits: admin@visual-era.com
                              Infrastructure owner: vera.platforms@gmail.com
                                (Vercel, Supabase, Clerk, Resend, Cloudflare)
```

```
┌─────────────────────────────────────────────────────────────┐
│              Email Routing (Cloudflare)                      │
│                                                               │
│  admin@visual-era.com     ──┐                                │
│  support@visual-era.com   ──┼──→ vera.platforms@gmail.com    │
│  hello@visual-era.com     ──┤                                │
│  legal@visual-era.com     ──┤                                │
│  security@visual-era.com  ──┘                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Notes

This structure is designed to support:

1. **Multiple products**: Production repos under **Vera-Platforms**; incubator work under **MotivMIA**
2. **Sibling orgs**: Add orgs under `natew-dev` — do not nest Vera-Platforms inside MotivMIA
3. **Team Expansion**: New team members get access to specific repos without infrastructure access
4. **Infrastructure Delegation**: Future infrastructure team can use dedicated infrastructure account
5. **Regional Variation**: Email routing and service accounts can be extended per region/market

---

## Quick Reference

### For New Team Members

1. Get invited to **`Vera-Platforms`** (for `vera` / product) and/or **`MotivMIA`** (for incubator repos)
2. Set local git identity:
   ```bash
   git config --global user.email "admin@visual-era.com"
   git config --global user.name "Visual Era Team"
   ```
3. Use your personal GitHub 2FA for access
4. Never access infrastructure accounts (unless explicitly authorized)

### For Infrastructure Changes

1. Use `vera.platforms@gmail.com` account
2. Never commit code with this account
3. Log all actions performed
4. Use hardware security key for 2FA

### For Email Communication

1. Use appropriate business alias (admin@, support@, etc.)
2. All mail routes through centralized vera.platforms@gmail.com
3. Forward to team members' personal email if needed via Cloudflare

---

## Security Checklist

- [ ] GitHub account (`natew-dev`) has 2FA enabled
- [ ] Infrastructure account (`vera.platforms@gmail.com`) has hardware key 2FA
- [ ] SSH keys generated and registered with GitHub
- [ ] Personal Access Tokens scoped to specific permissions
- [ ] Recovery codes stored offline in encrypted container
- [ ] Password manager configured with operational vaults
- [ ] Cloudflare email routing configured
- [ ] Git config set to `admin@visual-era.com`
- [ ] Team documentation reviewed and acknowledged
- [ ] Incident response procedure documented

---

## Support & Questions

For questions about operational identity, account access, or security practices:
- Security issues: security@visual-era.com
- Operational questions: admin@visual-era.com
- Account access: admin@visual-era.com
