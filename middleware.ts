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
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|ttf|map)).*)", "/api/(.*)"],
};
