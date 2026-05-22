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

const STALE_CLERK_COOKIE_NAMES = ["__session", "__client_uat", "__clerk_db_jwt", "__refresh"] as const;

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

function clearStaleClerkCookies(response: NextResponse) {
  for (const name of STALE_CLERK_COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}

/**
 * Break stale /__clerk handshake loops only. Do not redirect /__clerk/npm/* — those
 * must reach clerkMiddleware frontendApiProxy or Clerk JS never loads.
 */
function redirectLegacyClerkProxy(req: NextRequest): NextResponse | null {
  if (!req.nextUrl.pathname.includes("/client/handshake")) {
    return null;
  }

  const redirectParam = req.nextUrl.searchParams.get("redirect_url") ?? "";
  const hsReason = req.nextUrl.searchParams.get("__clerk_hs_reason") ?? "";

  let redirectPath = "/";
  try {
    redirectPath = new URL(redirectParam, req.url).pathname;
  } catch {
    redirectPath = redirectParam;
  }

  const isBrokenHandshake =
    hsReason.includes("session-token-expired") ||
    hsReason.includes("refresh-non-eligible") ||
    redirectParam.includes("/__clerk/") ||
    redirectParam.length > 512 ||
    redirectPath === "/";

  if (isBrokenHandshake) {
    return clearStaleClerkCookies(NextResponse.redirect(new URL("/sign-in", req.url)));
  }

  const isHandshakeLoop = redirectParam.includes("/__clerk/") || redirectParam.length > 512;
  const target = new URL(isHandshakeLoop ? "/sign-in" : "/", req.url);
  target.search = "";
  const response = NextResponse.redirect(target);
  return isHandshakeLoop ? clearStaleClerkCookies(response) : response;
}

const runClerkMiddleware = clerkMiddleware(
  async (auth, req) => {
    if (!isProtectedRoute(req)) return;

    const authState = await auth();
    if (authState.userId) return;

    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return authState.redirectToSignIn({ returnBackUrl: req.url });
  },
  {
    authorizedParties: collectAuthorizedParties(),
    // Same-origin /__clerk — required because FAPI host clerk.visual-era.vercel.app is not on Vercel DNS.
    frontendApiProxy: { enabled: true },
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
