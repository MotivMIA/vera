export async function register() {
  delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    const { validateProductionEnv } = await import("@/lib/env");
    validateProductionEnv();
  }
}
