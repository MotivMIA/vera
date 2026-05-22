import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

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
  "/api/onboarding/consent(.*)",
  "/api/onboarding/status(.*)",
]);

function collectAuthorizedParties(): string[] {
  const origins = new Set<string>();

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

/**
 * Clerk FAPI proxy was disabled — stale tabs still hit /__clerk/* and loop on handshake.
 * Send them to the app root so Clerk JS loads without a broken redirect_url chain.
 */
function redirectLegacyClerkProxy(req: NextRequest): NextResponse | null {
  if (!req.nextUrl.pathname.startsWith("/__clerk")) {
    return null;
  }

  const redirectParam = req.nextUrl.searchParams.get("redirect_url") ?? "";
  const isHandshakeLoop =
    req.nextUrl.pathname.includes("/client/handshake") &&
    (redirectParam.includes("/__clerk/") || redirectParam.length > 512);

  const target = new URL(isHandshakeLoop ? "/sign-in" : "/", req.url);
  target.search = "";
  return NextResponse.redirect(target);
}

const runClerkMiddleware = clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    authorizedParties: collectAuthorizedParties(),
  },
);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const legacyRedirect = redirectLegacyClerkProxy(req);
  if (legacyRedirect) {
    return legacyRedirect;
  }
  return runClerkMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
