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

4. Run the app:

```bash
npm run dev
```

## Required Routes

- `/` split-screen premium signup homepage
- `/sign-in` Clerk sign in
- `/sign-up` Clerk sign up
- `/onboarding` consent capture
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

## Deployment

Deploy to Vercel and configure the environment variables from `.env.example`.

Recommended branch flow:

- `dev` for active development
- `staging` for preview validation
- `main` for production

Before deploying:

```bash
npm run typecheck
npm run build
```
