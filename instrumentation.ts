export async function register() {
  const { applyResolvedClerkEnv } = await import("@/lib/clerk/keys");
  applyResolvedClerkEnv();

  if (process.env.NEXT_PHASE === "phase-production-build") {
    const { validateProductionEnv } = await import("@/lib/env");
    validateProductionEnv();
  }
}
