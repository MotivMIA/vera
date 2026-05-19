import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { retrieveDiditSession } from "@/lib/didit";
import { decryptMetadata } from "@/lib/security";
import type { InternalDocumentType } from "@/types/onboarding";
import type { DiditSessionMetadata } from "@/types/onboarding";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const DOCUMENT_TYPES: InternalDocumentType[] = ["client_agreement", "content_release"];
const DOCUMENT_BUCKET = "signed-documents";

type Prefill = {
  signerName?: string | null;
  signerEmail?: string | null;
  dateOfBirth?: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idIssuedBy?: string | null;
};

function collectStringValues(value: unknown, out: Map<string, string>, path = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStringValues(item, out, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") return;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const lowered = key.toLowerCase();
    const nextPath = path ? `${path}.${lowered}` : lowered;
    if (typeof raw === "string" && raw.trim()) {
      const normalized = raw.trim();
      out.set(lowered, normalized);
      out.set(nextPath, normalized);
      continue;
    }
    collectStringValues(raw, out, nextPath);
  }
}

function pickValue(store: Map<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = store.get(key);
    if (value) return value;
  }
  return null;
}

function pickPathContains(store: Map<string, string>, terms: string[]) {
  for (const [path, value] of store.entries()) {
    if (terms.every((term) => path.includes(term))) return value;
  }
  return null;
}

function normalizeDateForInput(value: string | null) {
  if (!value) return null;
  const candidate = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return candidate;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function buildPrefillFromMetadata(metadata: DiditSessionMetadata | null): Prefill {
  const values = new Map<string, string>();
  collectStringValues(metadata?.decision, values);

  const firstName =
    pickValue(values, ["first_name", "firstname", "given_name", "forename"]) ??
    pickPathContains(values, ["first", "name"]) ??
    pickPathContains(values, ["given", "name"]);
  const lastName =
    pickValue(values, ["last_name", "lastname", "surname", "family_name"]) ??
    pickPathContains(values, ["last", "name"]) ??
    pickPathContains(values, ["family", "name"]);
  const fullName =
    pickValue(values, ["full_name", "name"]) ??
    pickPathContains(values, ["full", "name"]) ??
    pickPathContains(values, ["holder", "name"]);
  const fallbackName = [firstName, lastName].filter(Boolean).join(" ").trim() || null;

  return {
    signerName: fullName ?? fallbackName,
    signerEmail: pickValue(values, ["email", "email_address"]) ?? pickPathContains(values, ["email"]),
    dateOfBirth:
      normalizeDateForInput(pickValue(values, ["date_of_birth", "dob", "birth_date"])) ??
      normalizeDateForInput(pickPathContains(values, ["birth"])) ??
      normalizeDateForInput(pickPathContains(values, ["dob"])),
    idType:
      pickValue(values, ["document_type", "id_type"]) ??
      pickPathContains(values, ["document", "type"]) ??
      pickPathContains(values, ["id", "type"]),
    idNumber:
      pickValue(values, ["document_number", "id_number", "doc_number"]) ??
      pickPathContains(values, ["document", "number"]) ??
      pickPathContains(values, ["id", "number"]),
    idIssuedBy:
      pickValue(values, ["issuing_country", "issuing_state", "issuing_authority", "issuer"]) ??
      pickPathContains(values, ["issuing"]) ??
      pickPathContains(values, ["issuer"]),
  };
}

function safeDecryptMetadata(payload: string | null | undefined) {
  try {
    return decryptMetadata<DiditSessionMetadata>(payload ?? null);
  } catch {
    return null;
  }
}

export async function GET() {
  const authState = await auth().catch(() => ({ userId: process.env.NODE_ENV === "development" ? "local-preview-user" : null }));
  const userId = authState.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerk = await currentUser().catch(() => null);
  const clerkName =
    `${clerk?.firstName ?? ""} ${clerk?.lastName ?? ""}`.trim() ||
    clerk?.fullName ||
    clerk?.username ||
    null;
  const clerkEmail = clerk?.emailAddresses?.[0]?.emailAddress ?? null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      documents: DOCUMENT_TYPES.map((type) => ({ type, status: "not_started", signedAt: null })),
      complete: false,
      supabaseConfigured: false,
      prefill: { signerName: clerkName, signerEmail: clerkEmail },
    });
  }

  const { data, error } = await supabase
    .from("signed_documents")
    .select("document_type,status,signed_at,provider_document_id")
    .eq("clerk_user_id", userId)
    .in("document_type", DOCUMENT_TYPES);

  if (error) {
    console.error("documents/status query error", error);
    return NextResponse.json({
      documents: DOCUMENT_TYPES.map((type) => ({ type, status: "not_started", signedAt: null })),
      complete: false,
      supabaseConfigured: true,
      databaseIssue: error.message,
      prefill: { signerName: clerkName, signerEmail: clerkEmail },
    });
  }

  const byType = new Map((data ?? []).map((row) => [row.document_type, row]));
  const documents = await Promise.all(
    DOCUMENT_TYPES.map(async (type) => {
      const row = byType.get(type);
      let downloadUrl: string | null = null;
      const storagePath = row?.provider_document_id;
      if (storagePath) {
        const signed = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(storagePath, 60 * 60);
        downloadUrl = signed.data?.signedUrl ?? null;
      }
      return {
        type,
        status: row?.status ?? "not_started",
        signedAt: row?.signed_at ?? null,
        downloadUrl,
      };
    }),
  );

  const complete = documents.every((doc) => doc.status === "signed");
  const { data: verification } = await supabase
    .from("verification_status")
    .select("provider_session_id,metadata_encrypted")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  let metadata = safeDecryptMetadata(verification?.metadata_encrypted ?? null);
  let prefill = buildPrefillFromMetadata(metadata);

  const missingCritical = !prefill.signerName || !prefill.signerEmail;
  if (missingCritical && verification?.provider_session_id) {
    try {
      const live = await retrieveDiditSession(verification.provider_session_id);
      if (live) {
        metadata = safeDecryptMetadata(live.metadata) ?? metadata;
        prefill = buildPrefillFromMetadata(metadata);
        await supabase
          .from("verification_status")
          .update({
            metadata_encrypted: live.metadata,
            updated_at: new Date().toISOString(),
          })
          .eq("provider_session_id", verification.provider_session_id);
      }
    } catch {
      // Keep local metadata/clerk fallback when live DIDIT refresh is unavailable.
    }
  }

  prefill = {
    signerName: prefill.signerName ?? clerkName,
    signerEmail: prefill.signerEmail ?? clerkEmail,
    dateOfBirth: prefill.dateOfBirth ?? null,
    idType: prefill.idType ?? null,
    idNumber: prefill.idNumber ?? null,
    idIssuedBy: prefill.idIssuedBy ?? null,
  };

  return NextResponse.json({ documents, complete, prefill, supabaseConfigured: true });
}
