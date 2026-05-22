import { getServerEnv, getSiteUrl } from "@/lib/env";

export type SigningDocument = {
  key: "client_agreement" | "content_release";
  title: string;
  description: string;
  status: "ready" | "missing";
  url: string | null;
};

type SigningPacketInput = {
  token: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  siteUrl?: string | null;
};

function appendSharedParams(urlString: string, input: SigningPacketInput) {
  const url = new URL(urlString);
  url.searchParams.set("session", input.token);
  url.searchParams.set("clerkUserId", input.userId);
  if (input.email) url.searchParams.set("email", input.email);
  if (input.name) url.searchParams.set("name", input.name);
  return url.toString();
}

export function buildSigningPacket(input: SigningPacketInput) {
  const env = getServerEnv();
  const siteUrl = getSiteUrl(input.siteUrl);

  const docs: SigningDocument[] = [
    {
      key: "client_agreement",
      title: "Client agreement",
      description: "Management agreement covering services, compensation, and obligations.",
      status: env.JOTFORM_CLIENT_AGREEMENT_URL ? "ready" : "missing",
      url: env.JOTFORM_CLIENT_AGREEMENT_URL ? appendSharedParams(env.JOTFORM_CLIENT_AGREEMENT_URL, input) : null,
    },
    {
      key: "content_release",
      title: "Release form",
      description: "Release covering content usage, licensing, and publication permissions.",
      status: env.JOTFORM_CONTENT_RELEASE_URL ? "ready" : "missing",
      url: env.JOTFORM_CONTENT_RELEASE_URL ? appendSharedParams(env.JOTFORM_CONTENT_RELEASE_URL, input) : null,
    },
  ];

  const readyDocs = docs.filter((doc) => doc.status === "ready");

  return {
    packetUrl: `${siteUrl}/documents`,
    documents: docs,
    readyCount: readyDocs.length,
  };
}
