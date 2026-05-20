import crypto from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { encryptMetadata } from "@/lib/security";
import type { DiditProviderStatus, DiditSessionMetadata, VerificationState } from "@/types/onboarding";

type CreateDiditSessionInput = {
  userId: string;
  callbackUrl?: string;
};

type CreateDiditSessionResponse = {
  session_id: string;
  session_token?: string;
  url: string;
  status: string;
};

type RetrieveDiditSessionResponse = {
  session_id: string;
  session_url?: string;
  status: string;
  decision?: unknown;
};

function normalizeDiditStatus(status: string): VerificationState {
  switch (status) {
    case "Approved":
      return "verified";
    case "Declined":
    case "Expired":
    case "Kyc Expired":
    case "Abandoned":
      return "failed";
    default:
      return "pending";
  }
}

export function mapDiditStatus(status: string | null | undefined) {
  return normalizeDiditStatus(status ?? "Not Started");
}

export function sanitizeDiditProviderStatus(status: string | null | undefined) {
  return status ?? "Not Started";
}

export function serializeDiditMetadata(metadata: DiditSessionMetadata) {
  return encryptMetadata(metadata);
}

export function getDiditConfig() {
  const env = getServerEnv();

  return {
    apiKey: env.DIDIT_API_KEY,
    workflowId: env.DIDIT_WORKFLOW_ID,
    webhookSecret: env.DIDIT_WEBHOOK_SECRET,
    configured: Boolean(env.DIDIT_API_KEY && env.DIDIT_WORKFLOW_ID),
  };
}

export async function createDiditSession(input: CreateDiditSessionInput) {
  const config = getDiditConfig();
  if (!config.configured || !config.apiKey || !config.workflowId) {
    return {
      live: false,
      sessionId: crypto.randomUUID(),
      embedUrl: null,
      sessionToken: null,
      providerStatus: "Not Started" as DiditProviderStatus,
      metadata: serializeDiditMetadata({ mode: "mock", rawStatus: "Not Started" }),
    };
  }

  let response: Response;
  try {
    response = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        workflow_id: config.workflowId,
        vendor_data: input.userId,
        callback: input.callbackUrl,
      }),
      cache: "no-store",
    });
  } catch {
    return {
      live: false,
      sessionId: crypto.randomUUID(),
      embedUrl: null,
      sessionToken: null,
      providerStatus: "Not Started" as DiditProviderStatus,
      metadata: serializeDiditMetadata({ mode: "mock", rawStatus: "Not Started" }),
    };
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unable to create DIDIT session (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as CreateDiditSessionResponse;

  return {
    live: true,
    sessionId: data.session_id,
    embedUrl: data.url,
    sessionToken: data.session_token ?? null,
    providerStatus: (data.status ?? "Not Started") as DiditProviderStatus,
    metadata: serializeDiditMetadata({
      embedUrl: data.url,
      sessionToken: data.session_token,
      callbackUrl: input.callbackUrl ?? null,
      rawStatus: data.status,
      mode: "live",
    }),
  };
}

export async function retrieveDiditSession(sessionId: string) {
  const config = getDiditConfig();
  if (!config.configured || !config.apiKey) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`https://verification.didit.me/v3/session/${sessionId}/decision/`, {
      headers: {
        accept: "application/json",
        "x-api-key": config.apiKey,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as RetrieveDiditSessionResponse;

  return {
    sessionId: data.session_id,
    providerStatus: (data.status ?? "Not Started") as DiditProviderStatus,
    appStatus: normalizeDiditStatus(data.status),
    embedUrl: data.session_url ?? null,
    decision: data.decision ?? null,
    metadata: serializeDiditMetadata({
      embedUrl: data.session_url,
      rawStatus: data.status,
      decision: data.decision ?? null,
      mode: "live",
    }),
  };
}

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        return accumulator;
      }, {});
  }

  return value;
}

// DIDIT V3 signature v2 canonicalization: shorten float-looking values then sort keys recursively.
function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shortenFloats);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, shortenFloats(v)]));
  }
  if (typeof value === "number" && !Number.isInteger(value) && value % 1 === 0) {
    return Math.trunc(value);
  }
  return value;
}

function normalizeSecrets(secretOrSecrets: string | string[] | undefined) {
  if (!secretOrSecrets) return [];
  const values = Array.isArray(secretOrSecrets) ? secretOrSecrets : [secretOrSecrets];
  return values.map((value) => value.trim()).filter(Boolean);
}

export function verifyDiditWebhook(
  rawBody: string,
  payload: Record<string, unknown>,
  headers: Headers,
  secretOrSecrets: string | string[] | undefined,
) {
  const secrets = normalizeSecrets(secretOrSecrets);
  if (secrets.length === 0) return false;
  const compareHex = (expected: string, actual: string) => {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(actual, "utf8");
    if (expectedBuffer.length !== actualBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  };

  const timestamp = headers.get("x-timestamp");
  if (!timestamp) return false;

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return false;
  }

  const signatureV2 = headers.get("x-signature-v2");
  if (signatureV2) {
    const canonical = JSON.stringify(sortObjectKeys(shortenFloats(payload)));
    for (const secret of secrets) {
      const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
      if (compareHex(expected, signatureV2)) {
        return true;
      }
    }
  }

  const signature = headers.get("x-signature");
  if (signature) {
    for (const secret of secrets) {
      const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
      if (compareHex(expected, signature)) {
        return true;
      }
    }
  }

  const simpleSignature = headers.get("x-signature-simple");
  if (simpleSignature) {
    const simpleTimestamps = [String(payload.timestamp ?? ""), String(headers.get("x-timestamp") ?? "")].filter(Boolean);
    for (const ts of simpleTimestamps) {
      const canonical = [ts, String(payload.session_id ?? ""), String(payload.status ?? ""), String(payload.webhook_type ?? "")].join(":");
      for (const secret of secrets) {
        const expected = crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex");
        if (compareHex(expected, simpleSignature)) {
          return true;
        }
      }
    }
  }

  return false;
}

export function getDiditWebhookDebug(rawBody: string, payload: Record<string, unknown>, headers: Headers, secretOrSecrets: string | string[] | undefined) {
  const secrets = normalizeSecrets(secretOrSecrets);
  const timestamp = headers.get("x-timestamp");
  const signatureV2 = headers.get("x-signature-v2");
  const signature = headers.get("x-signature");
  const signatureSimple = headers.get("x-signature-simple");
  const canonicalV2 = JSON.stringify(sortObjectKeys(shortenFloats(payload)));

  const simpleTimestamps = [String(payload.timestamp ?? ""), String(timestamp ?? "")].filter(Boolean);
  const expected = secrets.map((secret, secretIndex) => {
    const v2 = crypto.createHmac("sha256", secret).update(canonicalV2, "utf8").digest("hex");
    const raw = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const simple = simpleTimestamps.map((ts) => {
      const canonical = [ts, String(payload.session_id ?? ""), String(payload.status ?? ""), String(payload.webhook_type ?? "")].join(":");
      return {
        timestamp: ts,
        hashPrefix: crypto.createHmac("sha256", secret).update(canonical, "utf8").digest("hex").slice(0, 12),
      };
    });
    return {
      secretIndex,
      v2Prefix: v2.slice(0, 12),
      rawPrefix: raw.slice(0, 12),
      simple,
    };
  });

  return {
    hasSignatureV2: Boolean(signatureV2),
    hasSignature: Boolean(signature),
    hasSignatureSimple: Boolean(signatureSimple),
    incomingV2Prefix: signatureV2?.slice(0, 12) ?? null,
    incomingRawPrefix: signature?.slice(0, 12) ?? null,
    incomingSimplePrefix: signatureSimple?.slice(0, 12) ?? null,
    timestamp,
    timestampSkewSeconds: timestamp ? Math.round(Date.now() / 1000 - Number(timestamp)) : null,
    bodyKeys: Object.keys(payload).sort(),
    xHeaders: Array.from(headers.entries())
      .filter(([key]) => key.toLowerCase().startsWith("x-"))
      .map(([key, value]) => ({ key, valuePrefix: value.slice(0, 48) })),
    expected,
  };
}
