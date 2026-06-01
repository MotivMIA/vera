import { z } from "zod";
import { getClerkPublishableKey, getClerkSecretKey } from "@/lib/clerk/keys";

const optionalUrl = z.preprocess((value) => {
  if (value === "") return undefined;
  return value;
}, z.string().url().optional());

const productionRequiredKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const serverEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_SECRET_KEY_DEV: z.string().optional(),
  CLERK_SECRET_KEY_PROD: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DIDIT_API_KEY: z.string().optional(),
  DIDIT_WORKFLOW_ID: z.string().optional(),
  DIDIT_WEBHOOK_SECRET: z.string().optional(),
  DIDIT_WEBHOOK_SECRET_PREVIOUS: z.string().optional(),
  DIDIT_WEBHOOK_DEBUG: z
    .enum(["0", "1", "false", "true"])
    .optional()
    .transform((value) => value === "1" || value === "true"),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
  JOTFORM_API_KEY: z.string().optional(),
  JOTFORM_FORM_URL: optionalUrl,
  JOTFORM_CLIENT_AGREEMENT_URL: optionalUrl,
  JOTFORM_CONTENT_RELEASE_URL: optionalUrl,
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

function toOrigin(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing = productionRequiredKeys.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (!getClerkPublishableKey()) {
    throw new Error(
      "Missing Clerk publishable key in production (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD).",
    );
  }

  if (!getClerkSecretKey()) {
    throw new Error(
      "Missing Clerk secret key in production (CLERK_SECRET_KEY or CLERK_SECRET_KEY_PROD).",
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (siteUrl && !siteUrl.startsWith("https://")) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an https URL in production (e.g. https://visual-era.com). Empty or http values break Clerk on the custom domain.",
    );
  }

  getServerEnv();
}

export function getSiteUrl(preferredOrigin?: string | null) {
  const requestOrigin = toOrigin(preferredOrigin);
  if (requestOrigin) return requestOrigin;

  const configuredSiteUrl = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredSiteUrl) return configuredSiteUrl;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}
