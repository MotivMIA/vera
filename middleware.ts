import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/verify-identity(.*)",
  "/documents(.*)",
  "/success(.*)",
  "/api/didit/start(.*)",
  "/api/didit/status(.*)",
  "/api/documents/status(.*)",
  "/api/documents/submit(.*)",
  "/api/jotform/session(.*)",
]);

function collectAuthorizedParties(): string[] {
  const origins = new Set<string>();

  // Always allow local dev.
  origins.add("http://localhost:3001");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {
      // ignore malformed values
    }
  }

  // Vercel provides the deployed hostname without protocol.
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  return Array.from(origins);
}

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    // Protect against origin mixups / subdomain cookie leaking.
    // Keep this list tight; it must include your current origin(s).
    authorizedParties: collectAuthorizedParties(),
  },
);

export const config = {
  // Clerk recommended matcher: run middleware on all routes except static files and Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
