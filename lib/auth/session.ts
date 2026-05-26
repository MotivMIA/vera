import { auth } from "@clerk/nextjs/server";

const DEV_PREVIEW_USER_ID = "local-preview-user";

export function getDevPreviewUserId(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  if (process.env.ALLOW_DEV_AUTH_BYPASS !== "true") return null;
  return DEV_PREVIEW_USER_ID;
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const devUserId = getDevPreviewUserId();
  if (devUserId) return devUserId;

  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}
