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

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Clerk recommended matcher: run middleware on all routes except static files and Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
