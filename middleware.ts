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
  origins.add("http://localhost:3000");
  origins.add("http://localhost:3001");
  origins.add("http://127.0.0.1:3000");
  origins.add("http://127.0.0.1:3001");

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

  const branchUrl = process.env.VERCEL_BRANCH_URL;
  if (branchUrl) {
    try {
      origins.add(new URL(branchUrl.startsWith("http") ? branchUrl : `https://${branchUrl}`).origin);
    } catch {
      origins.add(`https://${branchUrl}`);
    }
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
    // Proxy Clerk Frontend API in middleware so /__clerk/npm/@clerk/*.js is not routed by App Router.
    frontendApiProxy: { enabled: true },
    // Protect against origin mixups / subdomain cookie leaking.
    authorizedParties: collectAuthorizedParties(),
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
