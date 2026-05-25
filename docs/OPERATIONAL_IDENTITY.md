# Operational Identity & GitHub Structure

This document standardizes the organizational hierarchy, account ownership, commit identity, and operational security practices for the Visual Era / VERA stack.

## Organizational Hierarchy

```
Motiv MIA (umbrella/holding organization)
    ↓
Visual Era (subsidiary/company)
    ↓
VERA (platform/product)
```

### Entity Definitions

| Entity | Role | Purpose |
|--------|------|---------|
| **Motiv MIA** | Umbrella organization | Holds all GitHub repositories and projects |
| **Visual Era** | Company/subsidiary | Business entity and brand |
| **VERA** | Product/platform | The primary software offering |

---

## Identity Structure

### 1. Personal Contributor Identity

**Account**: `MotivMIA` (GitHub user)  
**Email**: Personal Gmail (for account login and recovery)  
**Purpose**: Primary contributor identity across all repositories  
**Repositories**: VERA stack repositories are owned by the [**Vera-Platforms**](https://github.com/Vera-Platforms) GitHub organization (e.g. `vera`)

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
- To keep commits verified on GitHub, ensure `admin@visual-era.com` is added as a verified email on the `MotivMIA` GitHub account.
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

All repositories in the VERA stack are owned by the **Vera-Platforms** GitHub organization:

```
https://github.com/Vera-Platforms/vera
https://github.com/MotivMIA/{other-repos}
```

### Why This Structure

1. **Organization Ownership**: Separates personal from business identity
2. **Team Collaboration**: Enables team access without sharing personal account
3. **Scalability**: Supports future subsidiaries/products under one umbrella
4. **Security**: Clear separation of personal vs. operational identities

---

## Operational Security Practices

### Authentication & Access Control

#### 2FA Strategy
- **GitHub Account** (`MotivMIA`): TOTP (authenticator app) + backup codes
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
| GitHub (`MotivMIA`) | Backup codes + personal email | Encrypted offline storage |
| Infrastructure (`vera.platforms@gmail.com`) | Recovery codes + backup phone | Separate offline storage |
| Domain Registrar | Recovery email + phone | Stored in password manager |
| Cloudflare | Backup codes | Encrypted storage |

---

## Separation of Concerns

### Personal vs. Infrastructure

| Activity | Account | Identity |
|----------|---------|----------|
| Development commits | `MotivMIA` (GitHub) | `admin@visual-era.com` (git) |
| Repository management | `MotivMIA` (GitHub org) | `MotivMIA` user |
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
┌─────────────────────────────────────────────────────────────┐
│                    Motiv MIA (GitHub Org)                   │
│                  github.com/MotivMIA                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │             Visual Era (Company/Subsidiary)             │  │
│  │           Owned & Operated by MotivMIA Org              │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │   VERA Platform (Product/Repository)             │   │  │
│  │  │   github.com/Vera-Platforms/vera                       │   │  │
│  │  │                                                   │   │  │
│  │  │  Contributors:                                    │   │  │
│  │  │    - GitHub: MotivMIA user                        │   │  │
│  │  │    - Git Commits: admin@visual-era.com            │   │  │
│  │  │                                                   │   │  │
│  │  │  Infrastructure:                                  │   │  │
│  │  │    - Vercel (hosting)                             │   │  │
│  │  │    - Supabase (database)                          │   │  │
│  │  │    - Clerk (auth)                                 │   │  │
│  │  │    - Resend (email)                               │   │  │
│  │  │    - Cloudflare (DNS)                             │   │  │
│  │  │                                                   │   │  │
│  │  │  Owner Account:                                   │   │  │
│  │  │    - vera.platforms@gmail.com                     │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Future Product B / Subsidiary C would follow same pattern   │
└─────────────────────────────────────────────────────────────┘

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

1. **Multiple Subsidiaries**: Each subsidiary gets its own namespace under MotivMIA org
2. **Multiple Products**: Each product (like VERA) has separate repositories
3. **Team Expansion**: New team members get access to specific repos without infrastructure access
4. **Infrastructure Delegation**: Future infrastructure team can use dedicated infrastructure account
5. **Regional Variation**: Email routing and service accounts can be extended per region/market

---

## Quick Reference

### For New Team Members

1. Get invited to `MotivMIA` GitHub organization
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

- [ ] GitHub account (`MotivMIA`) has 2FA enabled
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
- Account access: [Contact MotivMIA]
