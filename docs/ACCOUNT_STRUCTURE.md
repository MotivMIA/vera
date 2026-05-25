# Account Structure & Ownership Reference

Complete reference of all accounts, their ownership, purpose, and security level.

## Account Summary

| Account | Type | Owner | Purpose | Security Level |
|---------|------|-------|---------|-----------------|
| `MotivMIA` | GitHub User | Personal | Contributor identity, repository access | Medium |
| `MotivMIA` | GitHub Org | Business | Repository ownership, team management | Medium-High |
| `admin@visual-era.com` | Email Alias | Business | Administrative operations, commits | Medium |
| `vera.platforms@gmail.com` | Gmail Account | Business | Infrastructure access, service ownership | **High** |
| Personal Gmail | Email | Personal | Account recovery, authentication | Low (personal use) |

---

## Detailed Account Specifications

### 1. GitHub Personal Account (`MotivMIA`)

**Type**: User account  
**Primary Email**: Personal Gmail (for login/recovery)  
**GitHub Email**: `MotivMIA@users.noreply.github.com` or `admin@visual-era.com` (verified)  
**Purpose**: Developer identity and repository contributor  

**Access**:
- Clone repositories via SSH
- Create and review pull requests
- Manage team issues
- Daily development work

**Security Configuration**:
- 2FA: Time-based One-Time Password (TOTP)
- Backup codes: Stored offline
- SSH keys: Development and CI/CD keys registered
- PATs: Fine-grained tokens per integration

**Do NOT Use For**:
- Infrastructure changes
- Service account management
- Sensitive business operations
- Accessing vera.platforms@gmail.com account

---

### 2. GitHub Organization (`MotivMIA`)

**Type**: Organization account  
**Owner**: MotivMIA personal account  
**Purpose**: Repository ownership and team coordination  

**Repositories**:
- `vera` (main platform repository)
- Future repositories for other VERA products
- Future subsidiaries' repositories

**Team Structure**:
```
MotivMIA Org
├── Developers (Read/Write to repos)
├── Maintainers (Admin access to repos)
└── Admins (Organization settings)
```

**Security**:
- Organization settings require review for additions
- Branch protection rules enforce code review
- Audit logs track organization changes

---

### 3. Git Commit Identity (`admin@visual-era.com`)

**Type**: Email alias  
**Routing**: Cloudflare → vera.platforms@gmail.com  
**Purpose**: Author identity in git commits  
**Configuration**: `git config --global user.email "admin@visual-era.com"`  

**Commits**:
- All VERA stack development commits use this identity
- Shows consistently across all repositories
- Verified on GitHub if email is added to MotivMIA account

**Example Commit**:
```
commit abc123def456...
Author: Visual Era Team <admin@visual-era.com>
Date:   Mon May 25 10:30:00 2026 +0000

    feat: add feature description
```

---

### 4. Infrastructure Account (`vera.platforms@gmail.com`)

**Type**: Gmail account  
**Role**: Root infrastructure owner  
**Purpose**: Centralized infrastructure and operations management  
**Access Level**: **Owner/Admin on all services**  

**Owns/Manages**:
- **Cloudflare**: DNS, email routing, WAF, analytics
- **Vercel**: Production deployments, environment variables
- **Clerk**: Authentication configuration, API keys
- **Supabase**: Database, backups, security settings
- **Resend**: Email service, templates
- **Domain Registrar**: Domain renewal, transfer settings
- **GitHub Organization**: Owner access (backup)
- **Stripe/Payment**: Payment configuration (future)

**Security Configuration**:
- 2FA: Hardware security key (Yubikey/Titan) **required**
- Recovery codes: Stored in encrypted offline storage
- Backup phone: Registered for account recovery
- Never used for development work
- Access logged and monitored

**Access Restrictions**:
- No daily development commits
- No casual code repository access
- Access only when infrastructure changes needed
- All actions documented

**Recovery**:
- Primary: Hardware security key
- Secondary: Recovery codes
- Tertiary: Backup phone and recovery email
- **Stored separately** from development credentials

---

### 5. Personal Gmail Account

**Type**: Email account  
**Purpose**: Account recovery and 2FA backup for MotivMIA GitHub account  
**Security Level**: Low (personal use, not operational)  

**Used For**:
- GitHub account login
- Recovery codes backup location
- Password reset tokens
- 2FA backup options

**Do NOT Use For**:
- Business communications
- Infrastructure access
- Public-facing contact

---

## Email Routing & Aliases

### Cloudflare Email Routing Configuration

```
Physical Account: vera.platforms@gmail.com
Logical Aliases:
  ├── admin@visual-era.com (operations, alerts, commits)
  ├── support@visual-era.com (customer/creator support)
  ├── hello@visual-era.com (general inquiries)
  ├── legal@visual-era.com (legal matters)
  └── security@visual-era.com (security disclosures)
```

### Email Alias Usage

| Alias | Use Cases | Reply From |
|-------|-----------|-----------|
| `admin@visual-era.com` | System alerts, infrastructure notifications, commit author | vera.platforms@gmail.com (displays as admin@visual-era.com) |
| `support@visual-era.com` | Support tickets, customer inquiries, help desk | vera.platforms@gmail.com (displays as support@visual-era.com) |
| `hello@visual-era.com` | General inquiries, partnerships, introductions | vera.platforms@gmail.com (displays as hello@visual-era.com) |
| `legal@visual-era.com` | Contracts, legal notices, compliance | vera.platforms@gmail.com (displays as legal@visual-era.com) |
| `security@visual-era.com` | Bug reports, security vulnerabilities, disclosure | vera.platforms@gmail.com (displays as security@visual-era.com) |

### Setting Up Email Aliases

In Cloudflare Email Routing:
1. Go to Email Routing tab
2. Add routing rule for each alias
3. Set destination to `vera.platforms@gmail.com`
4. Enable auto-reply if needed
5. Verify DNS records are propagated

---

## Service Account Ownership

### Current Services

| Service | Owner Account | Purpose | Admin Access |
|---------|---------------|---------|--------------|
| Cloudflare | vera.platforms@gmail.com | DNS, email, security | Full |
| Vercel | vera.platforms@gmail.com | Deployment platform | Full |
| Clerk | vera.platforms@gmail.com | Authentication | Full |
| Supabase | vera.platforms@gmail.com | Database backend | Full |
| Resend | vera.platforms@gmail.com | Email service | Full |
| GitHub Org | MotivMIA user (as owner) | Repositories | Organization Owner |

### Future Services

When adding new infrastructure:
1. Use `vera.platforms@gmail.com` as owner account
2. Add to this document
3. Document access procedures
4. Enable 2FA if available
5. Store recovery codes

---

## Access Matrix

### Who Can Access What

| Role | GitHub Dev Access | Commit Access | Infrastructure Access |
|------|------------------|----------------|----------------------|
| Developer | ✅ Read/Write repos | ✅ Via git config | ❌ None |
| Maintainer | ✅ Admin repos | ✅ Via git config | ❌ None |
| Operations | ⚠️ Read-only | ❌ Separate account | ✅ Full (vera.platforms) |
| Owner | ✅ Full | ✅ Via git config | ✅ Full (both accounts) |

### Adding New Team Members

**Developers** (most common):
1. Invite to MotivMIA GitHub organization
2. Assign to Developers team
3. Point to `docs/GIT_CONFIG_SETUP.md`
4. No infrastructure access

**Maintainers** (code review, deployment):
1. Invite to MotivMIA GitHub organization
2. Assign to Maintainers team
3. Grant write access to specific repos
4. No infrastructure access

**Operations** (infrastructure management):
1. Do NOT add to GitHub organization
2. Create separate account or federated access
3. Provide vera.platforms@gmail.com credentials
4. Document all infrastructure changes
5. Implement change review process

---

## Password & Credential Management

### Recommended Tool: 1Password / Bitwarden

**Vault Structure**:

```
Organizational Vault
├── Personal (shared with owner only)
│   └── MotivMIA GitHub personal account
│       └── Backup email credentials
│
├── Operations (limited to operations team)
│   └── vera.platforms@gmail.com
│       ├── Cloudflare credentials
│       ├── Vercel credentials
│       ├── Clerk credentials
│       ├── Supabase credentials
│       └── Resend credentials
│
└── Development (shared with dev team)
    ├── GitHub organization tokens
    ├── SSH keys (public only)
    └── API integration tokens
```

### Access Policies

- **Personal Vault**: Owner only
- **Operations Vault**: Operations team + Owner
- **Development Vault**: All developers + Maintainers + Owner

---

## Security Hardening Timeline

### Immediate (Week 1)
- [ ] Document current account structure (this document)
- [ ] Enable 2FA on MotivMIA GitHub account
- [ ] Add `admin@visual-era.com` to GitHub verified emails
- [ ] Configure git identity globally

### Short Term (Month 1)
- [ ] Setup hardware security key for vera.platforms@gmail.com
- [ ] Enable 2FA on all service accounts
- [ ] Setup password manager with vaults
- [ ] Store recovery codes offline

### Medium Term (Month 2-3)
- [ ] Setup audit logging for vera.platforms@gmail.com
- [ ] Document incident response procedures
- [ ] Create team access policy
- [ ] Setup alerts for infrastructure changes

### Long Term (Ongoing)
- [ ] Quarterly credential rotation
- [ ] Annual security audit
- [ ] Access review process
- [ ] Disaster recovery drills

---

## Incident Response

### If MotivMIA Account Compromised

1. **Immediate**:
   - Change password
   - Revoke SSH keys
   - Review repository access logs
   - Check for unauthorized deployments

2. **Short Term**:
   - Rotate all personal access tokens
   - Review recent commits
   - Audit team access
   - Notify other team members

3. **Follow Up**:
   - Update security documentation
   - Review and strengthen 2FA
   - Consider password manager breach
   - Implement additional monitoring

### If vera.platforms@gmail Compromised

1. **Immediate**:
   - Take infrastructure offline if necessary
   - Revoke all service API keys/tokens
   - Change all service passwords
   - Review recent infrastructure changes

2. **Short Term**:
   - Audit all service access logs
   - Update infrastructure configurations
   - Rotate all secrets
   - Redeploy with new credentials

3. **Follow Up**:
   - Investigate how account was compromised
   - Improve security controls
   - Notify affected services
   - Review and strengthen access policies

---

## Compliance Notes

### Regulatory Considerations

- **GDPR**: Ensure customer data is properly secured
- **SOC 2**: Audit trails for infrastructure changes
- **Payment Card Industry (PCI)**: If processing payments, ensure compliance

### Documentation

- Keep change logs for infrastructure modifications
- Maintain audit trails in each service
- Document access patterns and policies
- Store security incidents documentation

---

## Quick Reference Checklist

### For New Developer

- [ ] Invited to MotivMIA GitHub organization
- [ ] Personal 2FA setup on GitHub account
- [ ] Git configured with `admin@visual-era.com`
- [ ] SSH key setup and tested
- [ ] Reviewed this document
- [ ] Acknowledged account structure policy

### For New Infrastructure Admin

- [ ] Provided vera.platforms@gmail.com credentials
- [ ] Hardware security key setup
- [ ] Recovery codes stored offline
- [ ] Access to Operations vault in password manager
- [ ] Reviewed this document
- [ ] Reviewed OPERATIONAL_IDENTITY.md

---

## Related Documentation

- `OPERATIONAL_IDENTITY.md` — Comprehensive operational practices
- `GIT_CONFIG_SETUP.md` — Git configuration guide
- `SECURITY_CHECKLIST.md` — Security verification checklist

## Questions?

For questions about account structure or access:
- Email: admin@visual-era.com
- Security concerns: security@visual-era.com
