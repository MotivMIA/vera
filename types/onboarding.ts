export type VerificationState = "pending" | "verified" | "failed";
export type DocumentState = "not_started" | "sent" | "signed" | "voided";
export type OnboardingStep = "consent" | "identity" | "documents" | "complete";
export type DiditProviderStatus =
  | "Not Started"
  | "In Progress"
  | "Awaiting User"
  | "In Review"
  | "Approved"
  | "Declined"
  | "Resubmitted"
  | "Expired"
  | "Kyc Expired"
  | "Abandoned";

export type AuditAction =
  | "consent.accepted"
  | "verification.started"
  | "verification.webhook.received"
  | "verification.status.updated"
  | "documents.session.created"
  | "documents.signed";

export type InternalDocumentType = "client_agreement" | "content_release";

export type VerificationSession = {
  id: string;
  clerkUserId: string;
  diditSessionId?: string;
  status: VerificationState;
  secureTokenHash: string;
  expiresAt: string;
};

export type DiditSessionMetadata = {
  embedUrl?: string;
  sessionToken?: string;
  callbackUrl?: string | null;
  rawStatus?: string;
  webhookType?: string;
  decision?: unknown;
  mode?: "live" | "mock";
};
