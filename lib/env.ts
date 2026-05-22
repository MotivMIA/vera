import { z } from "zod";

const optionalUrl = z.preprocess((value) => {
  if (value === "") return undefined;
  return value;
}, z.string().url().optional());

const serverEnvSchema = z.object({
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

export function getSiteUrl(preferredOrigin?: string | null) {
  const requestOrigin = toOrigin(preferredOrigin);
  if (requestOrigin) return requestOrigin;

  const configuredSiteUrl = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredSiteUrl) return configuredSiteUrl;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}
