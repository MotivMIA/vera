import crypto from "node:crypto";
import { NextRequest } from "next/server";

export function createSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
}

export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const actual = signature.replace(/^sha256=/, "");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function getEncryptionKey() {
  const dedicated = process.env.AUDIT_ENCRYPTION_KEY?.trim();
  if (dedicated && dedicated.length >= 32) {
    return Buffer.from(dedicated.slice(0, 32), "utf8");
  }

  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 32);
  if (!legacy || legacy.length < 32) return null;
  return Buffer.from(legacy, "utf8");
}

export function encryptMetadata(metadata: unknown) {
  const key = getEncryptionKey();
  if (!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(metadata), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptMetadata<T>(payload: string | null | undefined) {
  if (!payload) return null as T | null;
  const key = getEncryptionKey();
  if (!key) return null as T | null;

  const [ivPart, tagPart, encryptedPart] = payload.split(".");
  if (!ivPart || !tagPart || !encryptedPart) return null as T | null;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}
