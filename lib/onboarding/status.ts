import { cookies } from "next/headers";
import type { OnboardingStep } from "@/types/onboarding";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ONBOARDING_STEP_PATH } from "@/lib/onboarding/constants";

const DEV_CONSENT_COOKIE = "ve_consent_ack";

type OnboardingRow = {
  current_step: OnboardingStep;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
  esign_accepted_at: string | null;
  completed_at: string | null;
};

export type OnboardingSnapshot = {
  currentStep: OnboardingStep;
  consentComplete: boolean;
  identityVerified: boolean;
  documentsComplete: boolean;
};

function isConsentComplete(row: Pick<OnboardingRow, "terms_accepted_at" | "privacy_accepted_at" | "esign_accepted_at"> | null) {
  if (!row) return false;
  return Boolean(row.terms_accepted_at && row.privacy_accepted_at && row.esign_accepted_at);
}

async function devConsentAcknowledged() {
  if (process.env.NODE_ENV !== "development") return false;
  const jar = await cookies();
  return jar.get(DEV_CONSENT_COOKIE)?.value === "1";
}

export async function getOnboardingSnapshot(clerkUserId: string): Promise<OnboardingSnapshot> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const consentComplete = await devConsentAcknowledged();
    return {
      currentStep: consentComplete ? "identity" : "consent",
      consentComplete,
      identityVerified: false,
      documentsComplete: false,
    };
  }

  const [{ data: onboarding }, { data: verification }, { data: documents }] = await Promise.all([
    supabase
      .from("onboarding_status")
      .select("current_step,terms_accepted_at,privacy_accepted_at,esign_accepted_at,completed_at")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle(),
    supabase.from("verification_status").select("status").eq("clerk_user_id", clerkUserId).maybeSingle(),
    supabase.from("signed_documents").select("status").eq("clerk_user_id", clerkUserId),
  ]);

  const consentComplete = isConsentComplete(onboarding);
  const identityVerified = verification?.status === "verified";
  const documentsComplete =
    (documents ?? []).length >= 2 && (documents ?? []).every((doc) => doc.status === "signed");

  let currentStep: OnboardingStep = onboarding?.current_step ?? "consent";
  if (!consentComplete) currentStep = "consent";
  else if (!identityVerified) currentStep = "identity";
  else if (!documentsComplete) currentStep = "documents";
  else currentStep = "complete";

  return {
    currentStep,
    consentComplete,
    identityVerified,
    documentsComplete,
  };
}

export async function ensureUserRow(
  clerkUserId: string,
  options?: { email?: string | null; fullName?: string | null },
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const now = new Date().toISOString();
  await supabase.from("users").upsert({
    clerk_user_id: clerkUserId,
    email: options?.email ?? null,
    full_name: options?.fullName ?? null,
    updated_at: now,
  });
}

export async function recordConsentAccepted(
  clerkUserId: string,
  options?: { email?: string | null; fullName?: string | null },
) {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    if (process.env.NODE_ENV === "development") {
      const jar = await cookies();
      jar.set(DEV_CONSENT_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return;
  }

  await ensureUserRow(clerkUserId, options);

  await supabase.from("onboarding_status").upsert({
    clerk_user_id: clerkUserId,
    current_step: "identity",
    terms_accepted_at: now,
    privacy_accepted_at: now,
    esign_accepted_at: now,
    updated_at: now,
  });
}

export async function hasConsentAccepted(clerkUserId: string) {
  const snapshot = await getOnboardingSnapshot(clerkUserId);
  return snapshot.consentComplete;
}

/** Canonical path for the user's current onboarding step (post-auth redirects). */
export function resolveNextOnboardingPath(snapshot: OnboardingSnapshot): string {
  if (!snapshot.consentComplete) return ONBOARDING_STEP_PATH.consent;
  if (!snapshot.identityVerified) return ONBOARDING_STEP_PATH.identity;
  if (!snapshot.documentsComplete) return ONBOARDING_STEP_PATH.documents;
  return ONBOARDING_STEP_PATH.complete;
}

export function resolveOnboardingRedirect(snapshot: OnboardingSnapshot, pathname: string): string | null {
  const onboardingPaths = ["/onboarding/consent", "/verify-identity", "/documents", "/success"];
  if (!onboardingPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  if (!snapshot.consentComplete) {
    return pathname.startsWith("/onboarding/consent") ? null : "/onboarding/consent";
  }

  if (pathname.startsWith("/onboarding/consent")) {
    return "/verify-identity";
  }

  if (!snapshot.identityVerified) {
    return pathname.startsWith("/verify-identity") ? null : "/verify-identity";
  }

  if (pathname.startsWith("/verify-identity")) {
    return "/documents";
  }

  if (!snapshot.documentsComplete) {
    return pathname.startsWith("/documents") ? null : "/documents";
  }

  if (pathname.startsWith("/documents")) {
    return "/success";
  }

  if (pathname.startsWith("/success")) {
    return snapshot.currentStep === "complete" ? null : resolveNextOnboardingPath(snapshot);
  }

  return null;
}
