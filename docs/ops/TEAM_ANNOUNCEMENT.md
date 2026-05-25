# Team announcement — operational identity

Copy the block below into Slack or email after the identity docs PR is merged to `main`.

---

**Subject:** ACTION REQUIRED: Operational Identity Standardization

🎯 **ACTION REQUIRED: Operational Identity Standardization**

We've standardized GitHub/ops identity structure for Visual Era / VERA.

**New documentation (on `main`):**

- `docs/OPERATIONAL_IDENTITY.md` — complete guide
- `docs/ACCOUNT_STRUCTURE.md` — account reference and access matrix
- `docs/GIT_CONFIG_SETUP.md` — developer setup guide

**What you need to do:**

1. Update your git config:

   ```bash
   git config --global user.email "admin@visual-era.com"
   git config --global user.name "Visual Era Team"
   ```

2. Verify your settings:

   ```bash
   git config --global user.email
   ```

3. Enable 2FA on GitHub if you have not already.

4. Review the docs (~10 minutes).

**Questions?** → admin@visual-era.com or security@visual-era.com
