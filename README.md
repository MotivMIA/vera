# Visual Era

Visual Era is a premium creator onboarding portal built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style components, Clerk, Supabase, DIDIT-ready identity verification, and native in-app agreement signing.

## Stack

- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS
- shadcn-style reusable UI primitives
- Framer Motion
- Clerk authentication
- Supabase database and storage-ready architecture
- Vercel deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Add Clerk, Supabase, and DIDIT credentials.
   - Keep `.env.local` set to local values, especially:
     - `NEXT_PUBLIC_SITE_URL=http://localhost:3001`
   - In Vercel production, set `NEXT_PUBLIC_SITE_URL=https://visual-era.com`.
   - Do not copy production URLs back into `.env.local`.

4. Run the app:

```bash
npm run dev
```

## Local + Production without code changes

- Local callbacks and packet URLs now use the active request origin automatically.
- Production callbacks and packet URLs use your deployed Vercel origin.
- In Clerk, allow both local and production origins/redirect URLs:
  - `http://localhost:3001`
  - `http://localhost:3000` (optional if you use this port)
  - `https://visual-era.com`

## Required Routes

- `/` split-screen premium signup homepage
- `/sign-in` Clerk sign in
- `/sign-up` Clerk sign up
- `/verify-identity` DIDIT verification placeholder
- `/documents` in-app signing packet
- `/success` onboarding completion

## API Architecture

- `POST /api/didit/start` creates a secure verification session placeholder
- `POST /api/didit/webhook` validates DIDIT webhook signatures before processing status updates
- `GET /api/didit/status` returns verification status
- `GET /api/documents/status` returns in-app document signing progress
- `POST /api/documents/submit` validates signatures, generates signed PDFs, uploads them to Supabase Storage, and records references in `signed_documents`

The app does not store raw ID images. DIDIT should own identity document capture, verification, and document storage.

For embedded DIDIT verification, also set:

- `DIDIT_WORKFLOW_ID`
- `NEXT_PUBLIC_DIDIT_SDK_URL` (optional; defaults to `https://verify.didit.me/sdk.js`)

The verification page attempts a DIDIT SDK mount first and falls back to iframe if SDK loading is unavailable. Status polling is still handled server-side for reliability.

Optional legacy integration remains available if you later re-enable external signing providers.

## Supabase

Run `SUPABASE_SCHEMA.md` in the Supabase SQL editor. The schema includes:

- `users`
- `onboarding_status`
- `verification_status`
- `signed_documents`
- `audit_logs`

Server-side writes use `SUPABASE_SERVICE_ROLE_KEY`. Keep RLS enabled and avoid exposing sensitive metadata to browser clients.  
Signed documents are stored in a private Supabase Storage bucket named `signed-documents`; file paths are stored in `signed_documents.provider_document_id`.

## AI agents & CI/CD

- Read **[AGENTS.md](AGENTS.md)** — [CHATGPT + Cursor + Codex stack](docs/CHATGPT_CURSOR_CODEX_STACK.md)
- **`main`** protected: PR only, **CI checks** required
- Start: `./scripts/start-agent-task.sh cursor <feature>`
- Iterate: `./scripts/agent-quick-check.sh`
- Ship: `./scripts/agent-finish.sh "[cursor] title"`

## GitHub

| | |
|--|--|
| **Repository** | [github.com/Vera-Platforms/vera](https://github.com/Vera-Platforms/vera) |
| **Production URL** | [https://visual-era.com](https://visual-era.com) (Vercel: `visual-era.vercel.app`) |

Setup: [docs/ops/LOCAL_STACK_SETUP.md](docs/ops/LOCAL_STACK_SETUP.md) · [docs/ops/POST_MIGRATION_CONNECTIONS.md](docs/ops/POST_MIGRATION_CONNECTIONS.md) · [docs/ops/CUSTOM_DOMAIN_SETUP.md](docs/ops/CUSTOM_DOMAIN_SETUP.md)

## Deployment

Deploy to Vercel and configure the environment variables from `.env.example`.

Production tracks **`main`** after merge. Public URL: **https://visual-era.com**. If you see Vercel “Authentication Required” (401), you may be on a protected preview/deployment URL — see [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md).

Before merging or deploying:

```bash
npm run lint
npm run typecheck
npm run build
```
