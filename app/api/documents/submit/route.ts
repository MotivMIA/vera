import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { z } from "zod";
import { buildSignedDocumentPdf } from "@/lib/pdf/build-signed-document";
import { recordAuditLog } from "@/lib/onboarding/audit";
import { getClientIp } from "@/lib/security";
import { getSupabaseAdminOrThrow } from "@/lib/supabase/server";
import type { InternalDocumentType } from "@/types/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const shared = {
  signerName: z.string().min(2).max(120),
  signerEmail: z.string().email(),
  signatureName: z.string().min(2).max(120),
  signatureMethod: z.enum(["draw", "type"]).optional(),
  signatureImageDataUrl: z.string().startsWith("data:image/").max(2_000_000).optional(),
  signedAt: z.string().datetime(),
};

const clientAgreementSchema = z.object({
  documentType: z.literal("client_agreement"),
  payload: z.object({
    ...shared,
    creatorAlias: z.string().min(2).max(120),
    clientHandle: z.string().trim().max(80).optional(),
    termsAccepted: z.literal(true),
    esignAccepted: z.literal(true),
  }),
});

const releaseFormSchema = z.object({
  documentType: z.literal("content_release"),
  payload: z.object({
    ...shared,
    idType: z.string().min(2).max(120),
    idNumber: z.string().min(3).max(120),
    idIssuedBy: z.string().min(2).max(120),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ageConfirmed: z.literal(true),
  }),
});

const submitSchema = z.union([clientAgreementSchema, releaseFormSchema]);
const DOC_TYPES: InternalDocumentType[] = ["client_agreement", "content_release"];
const DOCUMENT_BUCKET = "signed-documents";

async function ensureDocumentBucket(supabase: ReturnType<typeof getSupabaseAdminOrThrow>) {
  const { data: existing } = await supabase.storage.getBucket(DOCUMENT_BUCKET);
  if (existing) return;
  await supabase.storage.createBucket(DOCUMENT_BUCKET, { public: false });
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid document payload.",
        details: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      },
      { status: 400 },
    );
  }

  let supabase;
  try {
    supabase = getSupabaseAdminOrThrow();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Supabase is not configured for server-side signing.",
      },
      { status: 500 },
    );
  }

  const { data: verification } = await supabase
    .from("verification_status")
    .select("status")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (verification?.status && verification.status !== "verified") {
    return NextResponse.json({ error: "Identity verification must be completed before signing documents." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const pdfBytes = await buildSignedDocumentPdf({
    documentType: parsed.data.documentType,
    payload: parsed.data.payload,
  });
  const fileSafeSignedAt = parsed.data.payload.signedAt.replace(/[:.]/g, "-");
  const filePath = `${userId}/${parsed.data.documentType}/${fileSafeSignedAt}.pdf`;
  await ensureDocumentBucket(supabase);
  const { error: uploadError } = await supabase.storage.from(DOCUMENT_BUCKET).upload(filePath, Buffer.from(pdfBytes), {
    contentType: "application/pdf",
    upsert: true,
  });
  if (uploadError) {
    return NextResponse.json({ error: `Unable to store signed PDF: ${uploadError.message}` }, { status: 500 });
  }

  await supabase.from("signed_documents").upsert({
    clerk_user_id: userId,
    document_type: parsed.data.documentType,
    provider: "internal",
    provider_document_id: filePath,
    status: "signed",
    signed_at: parsed.data.payload.signedAt,
    updated_at: now,
  });

  await recordAuditLog({
    clerkUserId: userId,
    action: "documents.signed",
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
    metadata: {
      documentType: parsed.data.documentType,
      signerName: parsed.data.payload.signerName,
      signerEmail: parsed.data.payload.signerEmail,
      signatureName: parsed.data.payload.signatureName,
      clientHandle: parsed.data.documentType === "client_agreement" ? parsed.data.payload.clientHandle ?? null : null,
      submittedAt: parsed.data.payload.signedAt,
      documentPayload: parsed.data.payload,
    },
  });

  const { data: docs } = await supabase
    .from("signed_documents")
    .select("document_type,status")
    .eq("clerk_user_id", userId)
    .in("document_type", DOC_TYPES);

  const complete = DOC_TYPES.every((type) => docs?.some((doc) => doc.document_type === type && doc.status === "signed"));

  if (complete) {
    await supabase.from("onboarding_status").upsert({
      clerk_user_id: userId,
      current_step: "complete",
      completed_at: now,
      updated_at: now,
    });
  } else {
    await supabase.from("onboarding_status").upsert({
      clerk_user_id: userId,
      current_step: "documents",
      updated_at: now,
    });
  }

  return NextResponse.json({ ok: true, complete });
}
