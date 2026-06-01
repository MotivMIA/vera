import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { collectClerkOrigins } from "@/lib/clerk/origins";
import { shouldUseClerkFrontendApiProxy } from "@/lib/clerk/proxy-url";
import { routing } from "@/i18n/routing";
import { shouldLocalizePathname } from "@/lib/i18n/middleware";
import { authSignInPath, DEFAULT_LOCALE } from "@/lib/routes";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const handleIntlRouting = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/verify-identity(.*)",
  "/documents(.*)",
  "/success(.*)",
  "/creator(.*)",
  "/admin(.*)",
  "/chatter(.*)",
  "/api/didit/start(.*)",
  "/api/didit/status(.*)",
  "/api/documents/status(.*)",
  "/api/documents/submit(.*)",
  "/api/jotform/session(.*)",
  "/api/onboarding/consent(.*)",
  "/api/onboarding/status(.*)",
]);

const STALE_CLERK_COOKIE_NAMES = ["__session", "__client_uat", "__clerk_db_jwt", "__refresh"] as const;

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
    return clearStaleClerkCookies(
      NextResponse.redirect(new URL(authSignInPath(DEFAULT_LOCALE), req.url)),
    );
  }

  const isHandshakeLoop = redirectParam.includes("/__clerk/") || redirectParam.length > 512;
  const target = new URL(isHandshakeLoop ? authSignInPath(DEFAULT_LOCALE) : "/", req.url);
  target.search = "";
  const response = NextResponse.redirect(target);
  return isHandshakeLoop ? clearStaleClerkCookies(response) : response;
}

export default clerkMiddleware(
  async (auth, req) => {
    const legacyRedirect = redirectLegacyClerkProxy(req);
    if (legacyRedirect) {
      return legacyRedirect;
    }

    if (!isProtectedRoute(req)) {
      if (shouldLocalizePathname(req.nextUrl.pathname)) {
        return handleIntlRouting(req);
      }
      return;
    }

    const authState = await auth();
    if (authState.userId) {
      if (shouldLocalizePathname(req.nextUrl.pathname)) {
        return handleIntlRouting(req);
      }
      return;
    }

    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return authState.redirectToSignIn({ returnBackUrl: req.url });
  },
  {
    authorizedParties: collectClerkOrigins(),
    // pk_live_ only — dev instances use hosted FAPI (*.clerk.accounts.dev).
    ...(shouldUseClerkFrontendApiProxy()
      ? {
          frontendApiProxy: {
            enabled: true,
          },
        }
      : {}),
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
