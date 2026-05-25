# Git Configuration Setup Guide

Quick reference for configuring git to work with the Visual Era stack.

## Quick Start

### One-time Global Setup

```bash
# Configure global git identity for Visual Era work
git config --global user.email "admin@visual-era.com"
git config --global user.name "Visual Era Team"

# Verify configuration
git config --global --list
```

### After Cloning a Repository

```bash
# Navigate to repository
cd vera

# Verify git config (should show admin@visual-era.com)
git config user.email

# If you cloned from a personal repo by mistake, override locally
git config user.email "admin@visual-era.com"
```

---

## Configuration Options

### Option 1: Global Configuration (Recommended)

Apply to all repositories on your machine:

```bash
git config --global user.email "admin@visual-era.com"
git config --global user.name "Visual Era Team"
```

**Files affected**: `~/.gitconfig`

**When to use**: Primary work machine dedicated to Visual Era development

---

### Option 2: Per-Repository Configuration

Override global config for a specific repository:

```bash
cd /path/to/vera
git config user.email "admin@visual-era.com"
git config user.name "Visual Era Team"
```

**Files affected**: `.git/config` in the repository

**When to use**: 
- Mixed personal and professional work on same machine
- Need different identity for different projects
- Contributing to multiple organizations

---

### Option 3: Conditional Configuration (Advanced)

Use conditional includes based on directory structure:

```bash
# In ~/.gitconfig
[includeIf "gitdir:/path/to/visual-era/"]
    path = ~/.gitconfig-visual-era

[includeIf "gitdir:/path/to/personal/"]
    path = ~/.gitconfig-personal
```

**Create ~/.gitconfig-visual-era**:
```
[user]
    email = admin@visual-era.com
    name = Visual Era Team
```

**Create ~/.gitconfig-personal**:
```
[user]
    email = personal@example.com
    name = Your Name
```

**When to use**: Managing multiple organizations with different identities

---

## Verification

### Check Current Configuration

```bash
# View global config
git config --global --list

# View repository-specific config
git config --local --list

# View a specific setting
git config user.email
```

### Verify Commits Use Correct Identity

```bash
# Make a test commit
git commit --allow-empty -m "test: verify git identity"

# Check the commit author
git log -1 --format="%an <%ae>"

# Output should show:
# Visual Era Team <admin@visual-era.com>
```

---

## SSH Configuration

### Setup SSH Key for GitHub

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "admin@visual-era.com" -f ~/.ssh/id_rsa_vera

# Add to SSH agent
ssh-add ~/.ssh/id_rsa_vera

# Display public key to add to GitHub
cat ~/.ssh/id_rsa_vera.pub
```

### Configure SSH for GitHub

Edit or create `~/.ssh/config`:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_vera
  AddKeysToAgent yes
  IdentitiesOnly yes
```

### Test SSH Connection

```bash
ssh -T git@github.com

# Expected output:
# Hi MotivMIA! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## Email Verification

### Add Commit Email to GitHub Account

For commits to show as verified on GitHub:

1. Go to GitHub Settings → Emails
2. Add `admin@visual-era.com` as a verified email address
3. Optionally set as primary
4. Verify the email (GitHub will send confirmation)

### Verify Commits Show Correctly

```bash
# After pushing commits
git log --oneline

# Check GitHub: commits should show your avatar and verified status
```

---

## GPG Signing (Optional)

### Generate GPG Key

```bash
# Generate a new GPG key
gpg --gen-key

# Follow prompts:
# - Name: Visual Era Team
# - Email: admin@visual-era.com
# - Passphrase: strong password

# List your keys
gpg --list-secret-keys --keyid-format=long
```

### Configure Git to Sign Commits

```bash
# Get your key ID from the output above (after sec rsa4096/)
export KEY_ID="your-key-id-here"

# Set as default signing key globally
git config --global user.signingKey $KEY_ID

# Enable automatic signing
git config --global commit.gpgSign true

# View signature in commits
git log --show-signature
```

### Sign Individual Commits

If not configured for automatic signing:

```bash
# Sign a single commit
git commit -S -m "your message"

# Amend a commit and sign it
git commit --amend -S --no-edit
```

---

## Troubleshooting

### Issue: Commits showing wrong email

```bash
# Check current config
git config user.email

# Reset to global config
git config --unset user.email

# Or override at commit time
GIT_AUTHOR_EMAIL=admin@visual-era.com git commit -m "message"
```

### Issue: SSH Key Not Working

```bash
# Debug SSH connection
ssh -vvv git@github.com

# Verify SSH agent has key
ssh-add -l

# Add key to agent
ssh-add ~/.ssh/id_rsa_vera
```

### Issue: GPG Signature Not Verifying

```bash
# Ensure gpg is installed
which gpg

# Verify key is available
gpg --list-keys admin@visual-era.com

# Sign a test commit
git commit --allow-empty -S -m "test"

# Check signature
git verify-commit HEAD
```

### Issue: Commits Show as Unverified

1. Ensure `admin@visual-era.com` is verified in GitHub settings
2. Use matching email in git config (case-sensitive)
3. If using GPG, ensure public key is added to GitHub
4. Wait a few minutes for GitHub to update

---

## Advanced: Pre-commit Hooks

Create a pre-commit hook to verify identity before committing:

**.git/hooks/pre-commit**:
```bash
#!/bin/bash

# Verify email is correct
EMAIL=$(git config user.email)
EXPECTED_EMAIL="admin@visual-era.com"

if [ "$EMAIL" != "$EXPECTED_EMAIL" ]; then
    echo "Error: Git email is '$EMAIL' but should be '$EXPECTED_EMAIL'"
    echo "Run: git config user.email '$EXPECTED_EMAIL'"
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Reference: Git Config Locations

| Scope | Location | Command |
|-------|----------|---------|
| Global | `~/.gitconfig` | `git config --global` |
| System | `/etc/gitconfig` | `git config --system` |
| Repository | `.git/config` | `git config --local` |
| Worktree | `.git/config.worktree` | `git config --worktree` |

Priority order (highest to lowest):
1. Worktree
2. Repository
3. Global
4. System

---

## Commands Quick Reference

```bash
# View all configurations
git config --global --list

# Set global email
git config --global user.email "admin@visual-era.com"

# Set global name
git config --global user.name "Visual Era Team"

# Set repository-specific email
git config user.email "admin@visual-era.com"

# Verify current setting
git config user.email

# Remove a setting
git config --global --unset user.email

# Edit config file directly
git config --global --edit
```

---

## Next Steps

1. ✅ Configure global git identity
2. ✅ Verify with `git config user.email`
3. ✅ Add `admin@visual-era.com` to GitHub account settings
4. ✅ Setup SSH key if needed
5. ✅ (Optional) Setup GPG signing
6. ✅ Make a test commit and verify it shows correctly

See `docs/OPERATIONAL_IDENTITY.md` for broader operational and security guidelines.
