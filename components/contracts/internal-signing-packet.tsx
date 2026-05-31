"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Download, FileSignature, Loader2, PenLine, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MANAGER_ALIAS,
  MANAGER_NAME,
  type ContractDocumentState,
  type ContractDocumentType,
} from "@/lib/contracts/constants";

type DocState = ContractDocumentState;
type DocType = ContractDocumentType;

type StatusResponse = {
  documents: { type: DocType; status: DocState; signedAt: string | null; downloadUrl?: string | null }[];
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

const emptyClient = {
  signerName: "",
  signerEmail: "",
  clientHandle: "",
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
  ageConfirmed: false,
};

type SignatureMode = "draw" | "type";
type SignatureValue = { mode: SignatureMode; typedName: string; drawnDataUrl: string };

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
  "I am a participant in sexually explicit and/or non-sexually explicit media content which is intended to be posted on the Platform.",
  "I was at least 18 years old when all such media content was created.",
  "I give the Platform the absolute right and permission to allow the Creator to create, upload, use, re-use, display, publish and distribute such content on the Platform.",
  "I am aware that this content may be used for commercial reasons.",
  "I acknowledge and agree that (i) I am not entitled to any payments from the Platform in relation to the publication of such content, (ii) the Platform will distribute any earnings generated from such content to the Creator, and that (iii) the Platform is not a party to any agreement I may have with the Creator regarding the publication of such content on the Platform.",
  "I am aware that I can at any time withdraw my consent by contacting the Platform's support team in writing.",
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

function SignatureField({
  idPrefix,
  disabled,
  signature,
  onChange,
  suggestedTypedName,
}: {
  idPrefix: string;
  disabled: boolean;
  signature: SignatureValue;
  onChange: (next: SignatureValue) => void;
  suggestedTypedName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const drawnDataRef = useRef(signature.drawnDataUrl);

  useEffect(() => {
    drawnDataRef.current = signature.drawnDataUrl;
  }, [signature.drawnDataUrl]);

  const repaintFromDataUrl = useCallback(
    (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas || !dataUrl) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      const image = new Image();
      image.onload = () => {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
        context.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight);
      };
      image.src = dataUrl;
    },
    [canvasRef],
  );

  const resetCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 1) : 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#f6f4ef";
    if (drawnDataRef.current) repaintFromDataUrl(drawnDataRef.current);
  }, [repaintFromDataUrl]);

  useEffect(() => {
    if (signature.mode !== "draw") return;
    resetCanvasSize();
    const onResize = () => resetCanvasSize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resetCanvasSize, signature.mode]);

  const beginStroke = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      drawingRef.current = true;
      canvas.setPointerCapture(event.pointerId);
      const rect = canvas.getBoundingClientRect();
      context.beginPath();
      context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    },
    [disabled],
  );

  const moveStroke = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
  }, []);

  const endStroke = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawingRef.current = false;
      canvas.releasePointerCapture(event.pointerId);
      const dataUrl = canvas.toDataURL("image/png");
      onChange({ ...signature, drawnDataUrl: dataUrl });
    },
    [onChange, signature],
  );

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }
    onChange({ ...signature, drawnDataUrl: "" });
  }, [onChange, signature]);

  return (
    <div className="space-y-2 rounded-lg border border-white/10 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-sm text-foreground">Signature</Label>
        <div className="ml-auto inline-flex rounded-lg border border-white/10 p-1">
          <Button
            type="button"
            variant={signature.mode === "draw" ? "secondary" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => onChange({ ...signature, mode: "draw" })}
            disabled={disabled}
          >
            Draw
          </Button>
          <Button
            type="button"
            variant={signature.mode === "type" ? "secondary" : "ghost"}
            className="h-8 px-3 text-xs"
            onClick={() => onChange({ ...signature, mode: "type", typedName: signature.typedName || suggestedTypedName })}
            disabled={disabled}
          >
            Type
          </Button>
        </div>
      </div>

      {signature.mode === "draw" ? (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            className="h-36 w-full touch-none rounded-lg border border-white/10 bg-black/40"
            onPointerDown={beginStroke}
            onPointerMove={moveStroke}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
          />
          <div className="flex justify-end">
            <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={clearSignature} disabled={disabled}>
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-typed-signature`}>Typed signature</Label>
          <Input
            id={`${idPrefix}-typed-signature`}
            value={signature.typedName}
            onChange={(event) => onChange({ ...signature, typedName: event.target.value })}
            disabled={disabled}
            placeholder="Type your legal name"
          />
        </div>
      )}
    </div>
  );
}

function DocumentStepCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="glass-panel rounded-2xl">
      <CardContent className="space-y-4 p-4">{children}</CardContent>
    </Card>
  );
}

function LegalTextPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4 pr-3 text-sm leading-6 text-muted-foreground">
      {children}
    </div>
  );
}

function NativeCheckboxRow({
  id,
  checked,
  onCheckedChange,
  disabled,
  children,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-2 rounded-lg border border-white/10 p-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        disabled={disabled}
        className="mt-1 size-4 shrink-0 rounded border-white/20 bg-white/[0.04] accent-accent"
      />
      <span className="text-sm leading-6 text-muted-foreground">{children}</span>
    </label>
  );
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
  const [downloadUrls, setDownloadUrls] = useState<Record<DocType, string | null>>({
    client_agreement: null,
    content_release: null,
  });
  const [clientForm, setClientForm] = useState(emptyClient);
  const [releaseForm, setReleaseForm] = useState(emptyRelease);
  const [finalSignature, setFinalSignature] = useState<SignatureValue>({ mode: "draw", typedName: "", drawnDataUrl: "" });
  const [prefill, setPrefill] = useState<PrefillIdentity | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("/api/documents/status", { cache: "no-store" });
      const data = (await response.json()) as StatusResponse;
      if (!response.ok) throw new Error(data.error ?? "Unable to load document status.");

      const next = { client_agreement: "not_started", content_release: "not_started" } as Record<DocType, DocState>;
      const links = { client_agreement: null, content_release: null } as Record<DocType, string | null>;
      for (const doc of data.documents) next[doc.type] = doc.status;
      for (const doc of data.documents) links[doc.type] = doc.downloadUrl ?? null;
      setDocuments(next);
      setDownloadUrls(links);
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
    }));
    setFinalSignature((prev) => ({ ...prev, typedName: prev.typedName || prefill.signerName || "" }));

    setReleaseForm((prev) => ({
      ...prev,
      signerName: prefill.signerName ?? "",
      signerEmail: prefill.signerEmail ?? "",
      idType: prefill.idType ?? "",
      idNumber: prefill.idNumber ?? "",
      idIssuedBy: prefill.idIssuedBy ?? "",
      dateOfBirth: prefill.dateOfBirth ?? "",
    }));
  }, [prefill]);

  useEffect(() => {
    const clerkEmail = user?.primaryEmailAddress?.emailAddress?.trim();
    const clerkName = deriveNameFromUser(user);
    if (clerkName) {
      setClientForm((prev) => ({
        ...prev,
        signerName: prev.signerName || clerkName,
      }));
      setReleaseForm((prev) => ({
        ...prev,
        signerName: prev.signerName || clerkName,
      }));
      setFinalSignature((prev) => ({ ...prev, typedName: prev.typedName || clerkName }));
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

  const missingClientFields = useMemo(() => {
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

  const releaseReadyForBundle = missingIdentityForRelease.length === 0 && releaseForm.ageConfirmed;
  const clientReadyForBundle = missingClientFields.length === 0 && clientForm.termsAccepted && clientForm.esignAccepted;
  const signatureReady =
    finalSignature.mode === "type" ? isFilled(finalSignature.typedName) : isFilled(finalSignature.drawnDataUrl);

  const clientSigned = documents.client_agreement === "signed";
  const releaseSigned = documents.content_release === "signed";
  const pendingDocs = ([
    ["content_release", releaseSigned],
    ["client_agreement", clientSigned],
  ] as const)
    .filter(([, signed]) => !signed)
    .map(([type]) => type);

  const canSubmitBundle =
    supabaseConfigured &&
    releaseReadyForBundle &&
    clientReadyForBundle &&
    signatureReady &&
    pendingDocs.length > 0 &&
    submitting === null &&
    !loadingStatus;

  useEffect(() => {
    if (releaseSigned && clientSigned) {
      setActiveStep(3);
      return;
    }
    if (releaseSigned && !clientSigned) {
      setActiveStep(2);
      return;
    }
    setActiveStep(1);
  }, [clientSigned, releaseSigned]);

  async function submitAllDocuments() {
    setSubmitting("content_release");
    try {
      const signedAt = new Date().toISOString();
      const sharedSignature = {
        signatureName: finalSignature.mode === "type" ? finalSignature.typedName : clientForm.signerName,
        signatureMethod: finalSignature.mode,
        signatureImageDataUrl: finalSignature.mode === "draw" ? finalSignature.drawnDataUrl : undefined,
        signedAt,
      };

      for (const documentType of pendingDocs) {
        const payload =
          documentType === "client_agreement"
            ? {
                signerName: clientForm.signerName,
                signerEmail: clientForm.signerEmail,
                clientHandle: clientForm.clientHandle || undefined,
                creatorAlias: MANAGER_ALIAS,
                termsAccepted: clientForm.termsAccepted,
                esignAccepted: clientForm.esignAccepted,
                ...sharedSignature,
              }
            : {
                signerName: releaseForm.signerName,
                signerEmail: releaseForm.signerEmail,
                idType: releaseForm.idType,
                idNumber: releaseForm.idNumber,
                idIssuedBy: releaseForm.idIssuedBy,
                dateOfBirth: releaseForm.dateOfBirth,
                ageConfirmed: releaseForm.ageConfirmed,
                ...sharedSignature,
              };

        const response = await fetch("/api/documents/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ documentType, payload }),
        });
        const data = (await response.json()) as { error?: string; details?: string[]; complete?: boolean };
        if (!response.ok) throw new Error(data.details?.[0] ?? data.error ?? "Unable to submit document.");
      }

      toast.success("Both agreements signed and stored.");
      await loadStatus();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit both documents.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-4">
      {!supabaseConfigured ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-red-200">
          Supabase is not fully configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env</code>, then restart <code>npm run dev</code>.
        </div>
      ) : null}

      {activeStep === 1 ? (
        <DocumentStepCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Send className="size-5 text-accent" />
              Step 1: Release form
            </h3>
            <LegalTextPanel>
              <p className="text-base font-medium text-foreground">Release form</p>
              <p>
                This release form applies to any media content which features me that is posted on the platform by {MANAGER_ALIAS} (the &quot;Creator&quot;) for as long as their account is available on the platform.
              </p>
              <p>I confirm that:</p>
              <ul className="list-disc space-y-2 pl-6">
                {RELEASE_POINTS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </LegalTextPanel>
            {missingIdentityForRelease.length > 0 ? (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                DIDIT identity data is incomplete for: {missingIdentityForRelease.join(", ")}.
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-signer-name">Full legal name on ID (from DIDIT)</Label>
                <Input id="release-signer-name" value={releaseForm.signerName} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-signer-email">Email (from DIDIT)</Label>
                <Input id="release-signer-email" value={releaseForm.signerEmail} disabled />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-id-type">Type of ID (from DIDIT)</Label>
                <Input id="release-id-type" value={releaseForm.idType} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-id-number">ID number (from DIDIT)</Label>
                <Input id="release-id-number" value={releaseForm.idNumber} disabled />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-issued">ID issuing state/country (from DIDIT)</Label>
                <Input id="release-issued" value={releaseForm.idIssuedBy} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-dob">Date of birth (from DIDIT)</Label>
                <Input id="release-dob" value={releaseForm.dateOfBirth} disabled />
              </div>
            </div>
            <NativeCheckboxRow
              id="release-age"
              checked={releaseForm.ageConfirmed}
              onCheckedChange={(checked) => setReleaseForm((prev) => ({ ...prev, ageConfirmed: checked }))}
              disabled={releaseSigned}
            >
                I confirm that I am at least 18 years old and can enter into a legally binding contract. I confirm that I have read and understood this document before signing it. I acknowledge this document may be shared with third parties in accordance with applicable law and/or platform policies, and that my electronic signature is valid and legally binding.
            </NativeCheckboxRow>
            <Button onClick={() => setActiveStep(2)} disabled={!releaseReadyForBundle}>
              Continue to client agreement
            </Button>
        </DocumentStepCard>
      ) : null}

      {activeStep === 2 ? (
        <DocumentStepCard>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileSignature className="size-5 text-accent" />
              Step 2: Client agreement
            </h3>
            <LegalTextPanel>
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
            </LegalTextPanel>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="client-signer-name">Client legal name</Label>
                <Input
                  id="client-signer-name"
                  value={clientForm.signerName}
                  onChange={(event) => setClientForm((prev) => ({ ...prev, signerName: event.target.value }))}
                  disabled={clientSigned}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-signer-email">Client email</Label>
                <Input
                  id="client-signer-email"
                  type="email"
                  value={clientForm.signerEmail}
                  onChange={(event) => setClientForm((prev) => ({ ...prev, signerEmail: event.target.value }))}
                  disabled={clientSigned}
                />
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
              <NativeCheckboxRow
                id="client-terms"
                checked={clientForm.termsAccepted}
                onCheckedChange={(checked) => setClientForm((prev) => ({ ...prev, termsAccepted: checked }))}
                disabled={clientSigned}
              >
                  I accept the management agreement terms.
              </NativeCheckboxRow>
              <NativeCheckboxRow
                id="client-esign"
                checked={clientForm.esignAccepted}
                onCheckedChange={(checked) => setClientForm((prev) => ({ ...prev, esignAccepted: checked }))}
                disabled={clientSigned}
              >
                  I agree my typed name is my legal e-signature.
              </NativeCheckboxRow>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                Back
              </Button>
              <Button onClick={() => setActiveStep(3)} disabled={!clientReadyForBundle}>
                Continue to final signature
              </Button>
            </div>
        </DocumentStepCard>
      ) : null}

      {activeStep === 3 ? (
        <DocumentStepCard>
            <h3 className="text-lg font-semibold">Step 3: Final signature</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Use one signature below to execute both the Release Form and Client Agreement.
            </p>
            <SignatureField
              idPrefix="bundle"
              disabled={clientSigned && releaseSigned}
              signature={finalSignature}
              onChange={setFinalSignature}
              suggestedTypedName={clientForm.signerName || releaseForm.signerName}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant="outline" onClick={() => setActiveStep(2)}>
                Back
              </Button>
              <Button onClick={() => void submitAllDocuments()} disabled={!canSubmitBundle}>
                {submitting ? <Loader2 className="animate-spin" /> : <PenLine />}
                {clientSigned && releaseSigned ? "All documents signed" : "Sign and submit both documents"}
              </Button>
            </div>
            {releaseSigned && downloadUrls.content_release ? (
              <Button asChild variant="outline">
                <a href={downloadUrls.content_release} target="_blank" rel="noreferrer">
                  <Download />
                  Download release PDF
                </a>
              </Button>
            ) : null}
            {clientSigned && downloadUrls.client_agreement ? (
              <Button asChild variant="outline">
                <a href={downloadUrls.client_agreement} target="_blank" rel="noreferrer">
                  <Download />
                  Download client agreement PDF
                </a>
              </Button>
            ) : null}
        </DocumentStepCard>
      ) : null}
    </div>
  );
}
