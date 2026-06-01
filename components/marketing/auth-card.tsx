"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClerkDegraded,
  ClerkFailed,
  SignIn,
  SignUp,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clerkSignInComponentProps,
  clerkSignUpComponentProps,
} from "@/lib/clerk/auth-component-props";
import { clerkAppearance } from "@/lib/clerk/appearance";
import {
  isClerkProductionKeyClient,
  isLocalDevHost,
  shouldUseClerkProxyClient,
} from "@/lib/clerk/client-env";
import { ONBOARDING_ENTRY_PATH } from "@/lib/routes";

type AuthMode = "sign-up" | "sign-in";

type ClerkEmbedRouting = { routing: "hash" } | { routing: "path"; path: string };

function useClerkEmbedRouting(): ClerkEmbedRouting {
  const pathname = usePathname() ?? "/";

  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) {
    return { routing: "path", path: "/sign-up" };
  }
  if (pathname === "/sign-in" || pathname.startsWith("/sign-in/")) {
    return { routing: "path", path: "/sign-in" };
  }

  return { routing: "hash" };
}

function useClerkProxyBlocked(): boolean {
  const shouldProbe = shouldUseClerkProxyClient();
  const [blocked, setBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    if (!shouldProbe) {
      setBlocked(false);
      return;
    }

    let cancelled = false;
    const localWithLiveKey =
      isLocalDevHost(window.location.hostname) && isClerkProductionKeyClient();

    if (localWithLiveKey) {
      setBlocked(true);
    }

    async function probe() {
      try {
        const res = await fetch("/__clerk/v1/environment", {
          headers: { Origin: window.location.origin },
        });
        const data = (await res.json()) as { errors?: Array<{ code?: string }> };
        if (cancelled) return;

        const hostInvalid = data.errors?.some((e) => e.code === "host_invalid") ?? false;
        setBlocked(hostInvalid);
      } catch {
        if (!cancelled && !localWithLiveKey) {
          setBlocked(false);
        }
      }
    }

    void probe();
    return () => {
      cancelled = true;
    };
  }, [shouldProbe]);

  if (!shouldProbe) return false;
  return blocked ?? false;
}

function AuthTabs({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
      <button
        type="button"
        onClick={() => onModeChange("sign-up")}
        className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
          mode === "sign-up" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
        }`}
      >
        Create account
      </button>
      <button
        type="button"
        onClick={() => onModeChange("sign-in")}
        className={`rounded-[0.9rem] px-4 py-2.5 text-sm font-medium transition ${
          mode === "sign-in" ? "bg-white text-[#090a0d]" : "text-[#9da3af] hover:text-[#f6f4ef]"
        }`}
      >
        Sign in
      </button>
    </div>
  );
}

function AuthLoadingShell() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
        <div className="rounded-[0.9rem] bg-white py-2.5 text-center text-sm font-medium text-[#090a0d]">
          Create account
        </div>
        <div className="rounded-[0.9rem] py-2.5 text-center text-sm font-medium text-[#9da3af]">Sign in</div>
      </div>
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <LoaderCircle className="size-5 animate-spin text-accent" />
      </div>
    </div>
  );
}

function ClerkProxyBlockedNotice() {
  const isLocal =
    typeof window !== "undefined" && isLocalDevHost(window.location.hostname);
  const usingLiveKey = isClerkProductionKeyClient();

  return (
    <div
      className="rounded-2xl border border-accent/25 bg-accent/10 px-5 py-6 text-sm leading-6 text-[#d7dbe2]"
      role="alert"
    >
      <p className="font-medium text-foreground">Sign-in cannot load on this host</p>
      {isLocal && usingLiveKey ? (
        <>
          <p className="mt-2 text-muted-foreground">
            Local dev needs Clerk <strong className="font-medium text-foreground">development</strong>{" "}
            keys (<code className="text-xs text-accent">pk_test_</code> /{" "}
            <code className="text-xs text-accent">sk_test_</code>). Your{" "}
            <code className="text-xs text-accent">.env.local</code> uses production{" "}
            <code className="text-xs text-accent">pk_live_</code>, which only works on{" "}
            <a
              href="https://visual-era.com/sign-in"
              className="text-accent underline-offset-2 hover:text-[var(--brand-magenta-bright)] hover:underline"
            >
              visual-era.com
            </a>{" "}
            via the registered <code className="text-xs text-accent">/__clerk</code> proxy.
          </p>
          <p className="mt-3 text-muted-foreground">
            Add development keys to{" "}
            <code className="text-xs text-accent">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV</code> /{" "}
            <code className="text-xs text-accent">CLERK_SECRET_KEY_DEV</code> in{" "}
            <code className="text-xs text-accent">.env.local</code> (keep production keys in{" "}
            <code className="text-xs text-accent">*_PROD</code> — no manual swapping). Omit{" "}
            <code className="text-xs text-accent">NEXT_PUBLIC_CLERK_PROXY_URL</code> for{" "}
            <code className="text-xs text-accent">pk_test_</code>, then restart{" "}
            <code className="text-xs text-accent">npm run dev</code>. See{" "}
            <code className="text-accent/90">docs/ops/LOCAL_ENV.md</code>.
          </p>
        </>
      ) : (
        <p className="mt-2 text-muted-foreground">
          The Clerk Frontend API proxy for this origin returned{" "}
          <code className="text-xs text-accent">host_invalid</code>. Production keys require a
          registered proxy at <code className="text-xs text-accent">/__clerk</code> — see{" "}
          <code className="text-accent/90">docs/ops/CLERK_PROXY_SETUP.md</code> or run{" "}
          <code className="text-xs text-accent">npm run smoke:clerk-proxy</code>.
        </p>
      )}
    </div>
  );
}

function AuthUnavailableNotice() {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 text-sm leading-6 text-muted-foreground"
      role="alert"
    >
      <p className="font-medium text-foreground">Authentication is temporarily unavailable</p>
      <p className="mt-2">Refresh the page. If the problem continues, try again in a few minutes.</p>
    </div>
  );
}

function ClerkAuthPanel({ mode }: { mode: AuthMode }) {
  const routingProps = useClerkEmbedRouting();
  const shellClass =
    "auth-clerk-embed overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6";

  if (mode === "sign-up") {
    return (
      <div className={shellClass}>
        <SignUp
          key="sign-up"
          {...clerkSignUpComponentProps}
          {...routingProps}
          appearance={clerkAppearance}
        />
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <SignIn
        key="sign-in"
        {...clerkSignInComponentProps}
        {...routingProps}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function AuthCardContent({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (isSignedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-[#f6f4ef]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#9da3af]">Authenticated</p>
            <h3 className="mt-2 text-2xl font-semibold">Continue onboarding</h3>
          </div>
          <UserButton />
        </div>
        <div className="rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm leading-6 text-[#d7dbe2]">
          <ShieldCheck className="mb-3 size-5 text-accent" />
          Your account is active and ready to continue.
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href={ONBOARDING_ENTRY_PATH}>
            Continue onboarding
            <ArrowRight className="ml-auto size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthTabs mode={mode} onModeChange={setMode} />
      <ClerkAuthPanel mode={mode} />
      <p className="mt-4 text-center text-xs text-[#6b7280]">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="text-accent underline-offset-2 hover:text-[var(--brand-magenta-bright)] hover:underline"
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              className="text-accent underline-offset-2 hover:text-[var(--brand-magenta-bright)] hover:underline"
              onClick={() => setMode("sign-up")}
            >
              Create an account
            </button>
          </>
        )}
      </p>
    </>
  );
}

export type AuthCardProps = {
  initialMode?: AuthMode;
};

export function AuthCard({ initialMode = "sign-up" }: AuthCardProps) {
  const { isLoaded } = useAuth();
  const proxyBlocked = useClerkProxyBlocked();

  if (proxyBlocked) {
    return (
      <div className="w-full max-w-md">
        <ClerkProxyBlockedNotice />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {!isLoaded ? <AuthLoadingShell /> : null}
      <ClerkFailed>
        <AuthUnavailableNotice />
      </ClerkFailed>
      <ClerkDegraded>
        <AuthUnavailableNotice />
      </ClerkDegraded>
      {isLoaded ? <AuthCardContent initialMode={initialMode} /> : null}
    </div>
  );
}
