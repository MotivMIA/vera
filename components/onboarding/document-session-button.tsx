"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, FileWarning, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SigningDocument = {
  key: "client_agreement" | "content_release";
  title: string;
  description: string;
  status: "ready" | "missing";
  url: string | null;
};

type SigningPacketResponse = {
  documents?: SigningDocument[];
  readyCount?: number;
  error?: string;
};

export function DocumentSessionButton() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<SigningDocument[]>([]);

  async function createSession() {
    setLoading(true);
    try {
      const response = await fetch("/api/jotform/session", { method: "POST" });
      const data = (await response.json()) as SigningPacketResponse;
      if (!response.ok || !data.documents?.length) throw new Error(data.error ?? "Unable to create signing session.");
      setDocuments(data.documents);
      toast.success(`Signing links ready. ${data.readyCount ?? 0} form${data.readyCount === 1 ? "" : "s"} available.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button className="w-full" size="lg" onClick={createSession} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <ExternalLink />}
        Open signing packet
      </Button>

      {documents.length ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card key={document.key} className="border-white/10 bg-white/[0.03]">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {document.status === "ready" ? (
                      <CheckCircle2 className="size-4 text-emerald-300" />
                    ) : (
                      <FileWarning className="size-4 text-amber-300" />
                    )}
                    <p className="font-medium">{document.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>

                {document.url ? (
                  <Button asChild className="sm:min-w-44">
                    <a href={document.url} target="_blank" rel="noreferrer">
                      <ExternalLink />
                      Open form
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="sm:min-w-44">
                    Missing form
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
