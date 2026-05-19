"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSignature, Loader2, Lock, PenLine, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocState = "not_started" | "sent" | "signed" | "voided";
type DocType = "client_agreement" | "content_release";

type StatusResponse = {
  documents: { type: DocType; status: DocState; signedAt: string | null }[];
  complete: boolean;
  supabaseConfigured?: boolean;
  prefill?: {
    signerName?: string | null;
    signerEmail?: string | null;
    dateOfBirth?: string | null;
    idType?: string | null;
    idNumber?: string | null;
    idIssuedBy?: string | null;
  } | null;
  error?: string;
};

type PrefillIdentity = NonNullable<StatusResponse["prefill"]>;

const MANAGER_NAME = "Nathan Williams";
const MANAGER_ALIAS = "Nathan Williams d/b/a Visual Era";

const emptyClient = {
  signerName: "",
  signerEmail: "",
  clientHandle: "",
  signatureName: "",
  termsAccepted: false,
  esignAccepted: false,
};

const emptyRelease = {
  signerName: "",
  signerEmail: "",
  idType: "",
  idNumber: "",
  idIssuedBy: "",
  dateOfBirth: "",
  signatureName: "",
  ageConfirmed: false,
};

const CLIENT_TERMS = [
  {
    heading: "1. PURPOSE",
    items: [
      "1.1 Engagement. Client desires to develop, operate, and monetize personal brand accounts across digital subscription platforms, social media platforms, and other monetized fan-based or NSFW content services (collectively, the Platforms).",
      "1.2 Services. Manager agrees to provide management and strategic services in connection with such Platforms as detailed in Section 2.",
    ],
  },
  {
    heading: "2. SCOPE OF SERVICES",
    items: [
      "2.1 Management Duties. Manager shall provide account setup and optimization, branding strategy, content planning, monetization and pricing strategy, and promotional growth campaigns.",
      "2.2 Engagement. Manager may manage subscriber engagement and communicate with platform support teams if specifically authorized by Client.",
      "2.3 Performance Tracking. Manager shall provide regular performance tracking and reporting of account growth and revenue.",
      "2.4 Final Approval. Client retains final approval over all content posted to the Platforms.",
    ],
  },
  {
    heading: "3. DEFINITION OF PLATFORMS",
    items: [
      "3.1 Included Services. Platforms include all subscription-based services, fan-access platforms, social media, and any digital service used by Client to monetize content.",
      "3.2 Future Platforms. This Agreement applies to all existing Platforms and any future Platforms adopted by the Client during the Term.",
    ],
  },
  {
    heading: "4. AUTHORITY & OWNERSHIP",
    items: [
      "4.1 Limited Authority. Client grants Manager authority to access accounts, communicate with subscribers within guidelines, and adjust pricing or promotional offers.",
      "4.2 Ownership. Client retains 100% ownership of all accounts, branding, and likeness. Manager acquires no ownership interest in the Client's intellectual property.",
    ],
  },
  {
    heading: "5. COMPENSATION",
    items: [
      "5.1 Commission. Manager shall receive 30% of Net Revenue generated through managed Platforms.",
      "5.2 Net Revenue Defined. Gross earnings minus platform fees, processing fees, refunds, chargebacks, and pre-approved advertising expenses.",
      "5.3 Payment Schedule. Commissions are calculated monthly and due within 10 days following month-end.",
      "5.4 Verification. Client shall provide Manager with accurate revenue statements or view-only dashboard access for audit purposes.",
    ],
  },
  {
    heading: "6. TERM",
    items: [
      "6.1 Initial Term. This Agreement shall be for a total term of twelve (12) months. After which, the Agreement will expire.",
      "6.2 Content Rights. Upon expiration or termination of the Agreement, all rights, ownership, and control of all content shall revert solely to the Client, and the Manager shall transfer all account access within five (5) business days with no further rights, claims, or interest in the content thereafter.",
    ],
  },
  {
    heading: "7. TERMINATION",
    items: [
      "7.1 Termination for Cause. Either party may terminate immediately upon a material breach of the Agreement.",
      "7.2 Voluntary Termination. Either party may terminate at any time with written notice, and the cancellation will take effect at the end of the current monthly period.",
      "7.3 Post-Termination Obligations. The Manager must transfer credentials and account access without unnecessary delay.",
    ],
  },
  {
    heading: "8. CLIENT REPRESENTATIONS",
    items: [
      "8.1 Eligibility. Client warrants they are at least 18 years of age.",
      "8.2 Content Legality. Client warrants all content is lawful, consensual, and original.",
      "8.3 Compliance. Client agrees to comply with all Platform Terms of Service and Florida law.",
    ],
  },
  {
    heading: "9. CONFIDENTIALITY & NON-DISPARAGEMENT",
    items: [
      "9.1 Confidentiality. Both parties shall keep revenue, subscriber data, and marketing strategies strictly confidential.",
      "9.2 Non-Disparagement. Neither party shall make disparaging or defamatory remarks about the other in any public forum or social media.",
      "9.3 Federal Carve-out. Per the Speak Out Act, nothing herein restricts the reporting of sexual harassment or assault.",
    ],
  },
  {
    heading: "10. INDEPENDENT CONTRACTOR",
    items: ["10.1 Relationship. Manager is an independent contractor. This Agreement does not create an employer-employee relationship, partnership, or joint venture."],
  },
  {
    heading: "11. LIMITATION OF LIABILITY",
    items: ["11.1 Cap on Damages. Total liability for either party is capped at the total compensation paid to Manager in the three (3) months preceding the claim."],
  },
  {
    heading: "12. GOVERNING LAW & DISPUTES",
    items: [
      "12.1 Venue. This Agreement is governed by the laws of the State of Florida.",
      "12.2 Attorneys' Fees. In any action to enforce this Agreement, the prevailing party shall be entitled to recover reasonable attorneys' fees and costs.",
    ],
  },
] as const;

const RELEASE_POINTS = [
  "I am a participant in media content intended for publication on Platform services.",
  "I was at least 18 years old when all such media content was created.",
  "I grant permission for Creator publication and distribution on the Platform.",
  "I understand this content may be used for commercial purposes.",
  "I can withdraw consent by contacting Platform support in writing.",
] as const;

function isFilled(value: string) {
  return value.trim().length > 0;
}

function toTitleCase(value: string) {
  return value
    .split(/[.\-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function deriveNameFromUser(user: ReturnType<typeof useUser>["user"]) {
  const first = user?.firstName?.trim() ?? "";
  const last = user?.lastName?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (user?.fullName?.trim()) return user.fullName.trim();
  if (user?.username?.trim()) return toTitleCase(user.username.trim());
  const email = user?.primaryEmailAddress?.emailAddress?.trim();
  if (!email) return "";
  const local = email.split("@")[0] ?? "";
  return toTitleCase(local);
}

export function InternalSigningPacket() {
  const router = useRouter();
  const { user } = useUser();
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState<DocType | null>(null);
  const [documents, setDocuments] = useState<Record<DocType, DocState>>({
    client_agreement: "not_started",
    content_release: "not_started",
  });
  const [clientForm, setClientForm] = useState(emptyClient);
  const [releaseForm, setReleaseForm] = useState(emptyRelease);
  const [prefill, setPrefill] = useState<PrefillIdentity | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [],
  );

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("/api/documents/status", { cache: "no-store" });
      const data = (await response.json()) as StatusResponse;
      if (!response.ok) throw new Error(data.error ?? "Unable to load document status.");

      const next = { client_agreement: "not_started", content_release: "not_started" } as Record<DocType, DocState>;
      for (const doc of data.documents) next[doc.type] = doc.status;
      setDocuments(next);
      setPrefill(data.prefill ?? null);
      setSupabaseConfigured(data.supabaseConfigured !== false);

      if (data.complete) router.push("/success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load signing status.");
    } finally {
      setLoadingStatus(false);
    }
  }, [router]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (!prefill) return;

    setClientForm((prev) => ({
      ...prev,
      signerName: prefill.signerName ?? "",
      signerEmail: prefill.signerEmail ?? "",
      signatureName: prev.signatureName || prefill.signerName || "",
    }));

    setReleaseForm((prev) => ({
      ...prev,
      signerName: prefill.signerName ?? "",
      signerEmail: prefill.signerEmail ?? "",
      idType: prefill.idType ?? "",
      idNumber: prefill.idNumber ?? "",
      idIssuedBy: prefill.idIssuedBy ?? "",
      dateOfBirth: prefill.dateOfBirth ?? "",
      signatureName: prev.signatureName || prefill.signerName || "",
    }));
  }, [prefill]);

  useEffect(() => {
    const clerkEmail = user?.primaryEmailAddress?.emailAddress?.trim();
    const clerkName = deriveNameFromUser(user);
    if (clerkName) {
      setClientForm((prev) => ({
        ...prev,
        signerName: prev.signerName || clerkName,
        signatureName: prev.signatureName || clerkName,
      }));
      setReleaseForm((prev) => ({
        ...prev,
        signerName: prev.signerName || clerkName,
        signatureName: prev.signatureName || clerkName,
      }));
    }
    if (!clerkEmail) return;

    setClientForm((prev) => ({
      ...prev,
      signerEmail: prev.signerEmail || clerkEmail,
    }));
    setReleaseForm((prev) => ({
      ...prev,
      signerEmail: prev.signerEmail || clerkEmail,
    }));
  }, [user, user?.primaryEmailAddress?.emailAddress]);

  const missingIdentityForClient = useMemo(() => {
    const missing: string[] = [];
    if (!isFilled(clientForm.signerName)) missing.push("Legal name");
    if (!isFilled(clientForm.signerEmail)) missing.push("Email");
    return missing;
  }, [clientForm.signerEmail, clientForm.signerName]);

  const missingIdentityForRelease = useMemo(() => {
    const missing: string[] = [];
    if (!isFilled(releaseForm.signerName)) missing.push("Legal name");
    if (!isFilled(releaseForm.signerEmail)) missing.push("Email");
    if (!isFilled(releaseForm.idType)) missing.push("ID type");
    if (!isFilled(releaseForm.idNumber)) missing.push("ID number");
    if (!isFilled(releaseForm.idIssuedBy)) missing.push("ID issuing state/country");
    if (!isFilled(releaseForm.dateOfBirth)) missing.push("Date of birth");
    return missing;
  }, [releaseForm.dateOfBirth, releaseForm.idIssuedBy, releaseForm.idNumber, releaseForm.idType, releaseForm.signerEmail, releaseForm.signerName]);

  const canSignClient =
    supabaseConfigured &&
    missingIdentityForClient.length === 0 &&
    clientForm.termsAccepted &&
    clientForm.esignAccepted &&
    isFilled(clientForm.signatureName) &&
    submitting === null &&
    !loadingStatus;

  const canSignRelease =
    supabaseConfigured &&
    missingIdentityForRelease.length === 0 &&
    releaseForm.ageConfirmed &&
    isFilled(releaseForm.signatureName) &&
    submitting === null &&
    !loadingStatus;

  async function submitDocument(documentType: DocType) {
    setSubmitting(documentType);
    try {
      const signedAt = new Date().toISOString();
      const payload =
        documentType === "client_agreement"
          ? {
              signerName: clientForm.signerName,
              signerEmail: clientForm.signerEmail,
              clientHandle: clientForm.clientHandle || undefined,
              creatorAlias: MANAGER_ALIAS,
              signatureName: clientForm.signatureName,
              termsAccepted: clientForm.termsAccepted,
              esignAccepted: clientForm.esignAccepted,
              signedAt,
            }
          : {
              signerName: releaseForm.signerName,
              signerEmail: releaseForm.signerEmail,
              idType: releaseForm.idType,
              idNumber: releaseForm.idNumber,
              idIssuedBy: releaseForm.idIssuedBy,
              dateOfBirth: releaseForm.dateOfBirth,
              signatureName: releaseForm.signatureName,
              ageConfirmed: releaseForm.ageConfirmed,
              signedAt,
            };

      const response = await fetch("/api/documents/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentType, payload }),
      });
      const data = (await response.json()) as { error?: string; details?: string[]; complete?: boolean };
      if (!response.ok) throw new Error(data.details?.[0] ?? data.error ?? "Unable to submit document.");

      toast.success(`${documentType === "client_agreement" ? "Client agreement" : "Release form"} signed.`);
      if (data.complete) {
        router.push("/success");
        return;
      }
      await loadStatus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit document.");
    } finally {
      setSubmitting(null);
    }
  }

  const clientSigned = documents.client_agreement === "signed";
  const releaseSigned = documents.content_release === "signed";

  return (
    <div className="space-y-4">
      {!supabaseConfigured ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-red-200">
          Supabase is not fully configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env</code>, then restart <code>npm run dev</code>.
        </div>
      ) : null}

      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileSignature className="size-5 text-accent" />
              Step 1: Client agreement
            </h3>
            {clientSigned ? (
              <span className="inline-flex items-center gap-1 text-sm text-emerald-300">
                <CheckCircle2 className="size-4" />
                Signed
              </span>
            ) : null}
          </div>

          <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4 pr-3 text-sm leading-6 text-muted-foreground">
            <p className="text-base font-medium text-foreground">Welcome to Visual Era</p>
            <p>This Management Agreement is between {MANAGER_NAME} (Manager) and {clientForm.signerName || "Client"} (Client).</p>
            {CLIENT_TERMS.map((section) => (
              <div key={section.heading} className="space-y-1.5">
                <p className="font-semibold text-foreground">{section.heading}</p>
                {section.items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ))}
          </div>

          {missingIdentityForClient.length > 0 ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              DIDIT identity data is incomplete for: {missingIdentityForClient.join(", ")}.
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-signer-name">Client legal name (from DIDIT)</Label>
              <div className="relative">
                <Input id="client-signer-name" value={clientForm.signerName} disabled />
                <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-signer-email">Client email (from DIDIT)</Label>
              <div className="relative">
                <Input id="client-signer-email" type="email" value={clientForm.signerEmail} disabled />
                <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client-handle">Optional handle / stage name</Label>
            <Input
              id="client-handle"
              value={clientForm.clientHandle}
              onChange={(event) => setClientForm((prev) => ({ ...prev, clientHandle: event.target.value }))}
              disabled={clientSigned}
              placeholder="@yourname"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-white/10 p-3">
              <Checkbox
                id="client-terms"
                checked={clientForm.termsAccepted}
                onCheckedChange={(value) => setClientForm((prev) => ({ ...prev, termsAccepted: value === true }))}
                disabled={clientSigned}
              />
              <Label htmlFor="client-terms" className="leading-6 text-muted-foreground">
                I accept the management agreement terms.
              </Label>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-white/10 p-3">
              <Checkbox
                id="client-esign"
                checked={clientForm.esignAccepted}
                onCheckedChange={(value) => setClientForm((prev) => ({ ...prev, esignAccepted: value === true }))}
                disabled={clientSigned}
              />
              <Label htmlFor="client-esign" className="leading-6 text-muted-foreground">
                I agree my typed name is my legal e-signature.
              </Label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Manager signature</Label>
              <Input value={MANAGER_NAME} disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Manager date</Label>
              <Input value={todayLabel} disabled />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-signature">Client typed signature</Label>
            <Input
              id="client-signature"
              value={clientForm.signatureName}
              onChange={(event) => setClientForm((prev) => ({ ...prev, signatureName: event.target.value }))}
              disabled={clientSigned}
            />
          </div>

          <Button onClick={() => void submitDocument("client_agreement")} disabled={!canSignClient || clientSigned}>
            {submitting === "client_agreement" ? <Loader2 className="animate-spin" /> : <PenLine />}
            {clientSigned ? "Agreement signed" : "Sign client agreement"}
          </Button>
        </CardContent>
      </Card>

      {clientSigned ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Send className="size-5 text-accent" />
                Step 2: Release form
              </h3>
              {releaseSigned ? (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  Signed
                </span>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
              <p className="text-base font-medium text-foreground">Release form</p>
              {RELEASE_POINTS.map((line) => (
                <p key={line}>- {line}</p>
              ))}
            </div>

            {missingIdentityForRelease.length > 0 ? (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                DIDIT identity data is incomplete for: {missingIdentityForRelease.join(", ")}.
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-signer-name">Full legal name on ID (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-signer-name" value={releaseForm.signerName} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-signer-email">Email (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-signer-email" value={releaseForm.signerEmail} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-id-type">Type of ID (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-id-type" value={releaseForm.idType} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-id-number">ID number (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-id-number" value={releaseForm.idNumber} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-issued">ID issuing state/country (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-issued" value={releaseForm.idIssuedBy} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-dob">Date of birth (from DIDIT)</Label>
                <div className="relative">
                  <Input id="release-dob" value={releaseForm.dateOfBirth} disabled />
                  <Lock className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-white/10 p-3">
              <Checkbox
                id="release-age"
                checked={releaseForm.ageConfirmed}
                onCheckedChange={(value) => setReleaseForm((prev) => ({ ...prev, ageConfirmed: value === true }))}
                disabled={releaseSigned}
              />
              <Label htmlFor="release-age" className="leading-6 text-muted-foreground">
                I confirm I was at least 18 when this content was created and can enter a legally binding contract.
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-signature">Typed signature</Label>
              <Input
                id="release-signature"
                value={releaseForm.signatureName}
                onChange={(event) => setReleaseForm((prev) => ({ ...prev, signatureName: event.target.value }))}
                disabled={releaseSigned}
              />
            </div>

            <Button onClick={() => void submitDocument("content_release")} disabled={!canSignRelease || releaseSigned}>
              {submitting === "content_release" ? <Loader2 className="animate-spin" /> : <PenLine />}
              {releaseSigned ? "Release form signed" : "Sign release form"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Step 2 unlocks after the client agreement is signed.
        </div>
      )}
    </div>
  );
}
