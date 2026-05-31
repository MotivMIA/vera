# Clerk — X (Twitter) sign-in / sign-up

The app uses Clerk **prebuilt** `<SignIn />` and `<SignUp />` components. Social buttons (Google, **X**, …) appear automatically when the provider is enabled in Clerk — no extra React code is required.

## 1. Enable X in Clerk (required)

Do this for **each instance** you use:

| Instance | When |
|----------|------|
| **Development** (`pk_test_`, e.g. immense-sawfish-81) | Local + Cursor Cloud dev |
| **Production** (`pk_live_`) | https://visual-era.com |

### Dashboard steps

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → select the instance (Development or Production).
2. Go to **Configure → SSO connections** (or **User & authentication → Social connections**).
3. **Add connection** → **For all users** → provider **X / Twitter** (v2).
4. Turn on **Enable for sign-up and sign-in**.
5. Save.

### Development (`pk_test_`) — skip Client ID if you can

If Clerk is asking for Client ID / Secret on the **Development** instance:

1. On the X connection screen, turn **off** **Use custom credentials** (if you see that toggle).
2. Save — Clerk uses built-in test credentials; no X Developer account needed.

If the toggle is missing or won’t save without credentials, use the production steps below with a dev callback URI from Clerk.

### Production (`pk_live_`) — Client ID & Secret required

Clerk **cannot** use shared X credentials on Production. You must create an OAuth app on X and paste keys into Clerk.

#### A. Copy the Redirect URI from Clerk first

On the X/Twitter connection page in Clerk (before or while adding credentials), find **Redirect URI** (or **Callback URL**). It looks like:

```text
https://<something>.clerk.accounts.dev/v1/oauth_callback
```

or, for production with your domain:

```text
https://clerk.visual-era.com/v1/oauth_callback
```

Copy that **exact** string — you will paste it into X in step B.

#### B. Create the app on X

1. Go to [developer.x.com](https://developer.x.com/) → sign in → **Developer Portal**.
2. **Projects & Apps** → create a **Project** (if needed) → **Add App** (or use default app).
3. Open the app → **User authentication settings** → **Set up** (or **Edit**).
4. Enable **OAuth 2.0**.
5. **Type of App:** **Web App** (confidential client).
6. **Callback URI / Redirect URL:** paste the URI from Clerk (step A). No trailing slash unless Clerk shows one.
7. **App permissions:** **Read** (minimum). Add write scopes only if Clerk lists them and you need them.
8. Save.

#### C. Copy keys into Clerk

1. In the X app → **Keys and tokens** (or **Consumer Keys** / **OAuth 2.0 Client ID and Secret**).
2. Copy **OAuth 2.0 Client ID** → Clerk **Client ID**.
3. Copy **OAuth 2.0 Client Secret** → Clerk **Client Secret** (show/regenerate if needed).
4. Clerk → X connection → **Use custom credentials** → paste both → **Save**.

Changes on X can take a few minutes to propagate. Then test on https://visual-era.com/sign-in.

Official guide: [Clerk — X/Twitter social connection](https://clerk.com/docs/guides/configure-auth-strategies/social-connections/x-twitter).

## 2. Verify

After enabling, load https://visual-era.com/sign-in (or local http://localhost:3001/sign-in with `pk_test_`).

You should see an **X** button with Google and email/password.

Optional API check (production):

```bash
curl -sS -H "Origin: https://visual-era.com" "https://visual-era.com/__clerk/v1/environment" \
  | python3 -c "import json,sys; print(list(json.load(sys.stdin).get('user_settings',{}).get('social',{}).keys()))"
```

Expect `oauth_x` (or similar) in the list alongside `oauth_google`.

## 3. App code (already wired)

- `lib/clerk/auth-component-props.ts` — `oauthFlow: "auto"` on SignIn/SignUp
- `lib/clerk/appearance.ts` — social buttons at top of auth cards
- Homepage auth card, `/sign-in`, `/sign-up`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No X button | Enable connection in the **correct** Clerk instance (test vs live keys in `.env` / Vercel). |
| Works locally, not prod | Configure **custom credentials** on Production instance. |
| Redirect error from X | Callback URI in X Developer Portal must match Clerk exactly. |
| Email step after X | Clerk now returns email from X when available; ensure Read scope is granted. |
