"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileSignature, PenLine, Send } from "lucide-react";

type DocState = "not_started" | "sent" | "signed" | "voided";
type DocType = "client_agreement" | "content_release";

type StatusResponse = {
  documents: { type: DocType; status: DocState; signedAt: string | null }[];
};

export function DocumentsStepIndicators() {
  const [stateByType, setStateByType] = useState<Record<DocType, DocState>>({
    client_agreement: "not_started",
    content_release: "not_started",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/documents/status", { cache: "no-store" });
        const data = (await response.json()) as StatusResponse;
        if (!response.ok || !active) return;
        const next: Record<DocType, DocState> = {
          client_agreement: "not_started",
          content_release: "not_started",
        };
        for (const doc of data.documents ?? []) next[doc.type] = doc.status;
        setStateByType(next);
      } catch {
        // Keep defaults; this panel is informative only.
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const releaseComplete = stateByType.content_release === "signed";
  const agreementComplete = stateByType.client_agreement === "signed";
  const finalSignatureComplete = releaseComplete && agreementComplete;

  const items: Array<{ key: string; label: string; Icon: typeof FileSignature; complete: boolean }> = [
    { key: "content_release", label: "Release form", Icon: Send, complete: releaseComplete },
    { key: "client_agreement", label: "Client agreement", Icon: FileSignature, complete: agreementComplete },
    { key: "final_signature", label: "Final signature", Icon: PenLine, complete: finalSignatureComplete },
  ];

  return (
    <div className="max-w-sm space-y-3">
      {items.map(({ key, label, Icon, complete }) => {
        return (
          <div key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className={`flex size-8 items-center justify-center rounded-lg ${complete ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-muted-foreground"}`}>
              <Icon className="size-4" />
            </span>
            <span className="text-sm text-foreground">{label}</span>
            <CheckCircle2 className={`ml-auto size-4 transition-colors ${complete ? "text-emerald-300" : "text-white/25"}`} />
          </div>
        );
      })}
    </div>
  );
}
