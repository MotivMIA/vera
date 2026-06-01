"use client";

import { useTranslations } from "next-intl";
import { ClerkDegraded, ClerkFailed, UserButton, useAuth } from "@clerk/nextjs";
import { Link } from "@/i18n/navigation";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteAuthForm } from "@/components/marketing/site-auth-form";
import {
  isClerkProductionKeyClient,
  isLocalDevHost,
  shouldUseClerkProxyClient,
} from "@/lib/clerk/client-env";
import {
  accentCalloutClass,
  authCardWidthClass,
  borderDefaultClass,
  fluidH2Class,
  linkAccentClass,
  panelShellClass,
  panelSurfaceClass,
} from "@/lib/brand/theme-classes";
import { ONBOARDING_ENTRY_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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

function AuthLoadingShell() {
  return (
    <div
      className={cn(
        "flex min-h-72 items-center justify-center rounded-2xl border",
        borderDefaultClass,
        panelSurfaceClass,
      )}
    >
      <LoaderCircle className="size-5 animate-spin text-accent" />
    </div>
  );
}

function ClerkProxyBlockedNotice() {
  const t = useTranslations("Auth.notices");
  const isLocal =
    typeof window !== "undefined" && isLocalDevHost(window.location.hostname);
  const usingLiveKey = isClerkProductionKeyClient();

  return (
    <div
      className={cn(accentCalloutClass, "px-fluid-inline py-fluid-card-y text-fluid-small leading-6 text-[#d7dbe2]")}
      role="alert"
    >
      <p className="font-medium text-foreground">{t("proxyBlockedTitle")}</p>
      {isLocal && usingLiveKey ? (
        <>
          <p className="mt-2 text-muted-foreground">
            {t("proxyBlockedLocalLead")}{" "}
            <a
              href="https://visual-era.com/sign-in"
              className={cn("text-accent", linkAccentClass)}
            >
              {t("proxyBlockedLocalSite")}
            </a>{" "}
            {t("proxyBlockedLocalTail")}
          </p>
          <p className="mt-3 text-muted-foreground">{t("proxyBlockedLocalHint")}</p>
        </>
      ) : (
        <p className="mt-2 text-muted-foreground">{t("proxyBlockedProd")}</p>
      )}
    </div>
  );
}

function AuthUnavailableNotice() {
  const t = useTranslations("Auth.notices");

  return (
    <div
      className={cn(panelShellClass, "text-fluid-small leading-6 text-muted-foreground")}
      role="alert"
    >
      <p className="font-medium text-foreground">{t("unavailableTitle")}</p>
      <p className="mt-2">{t("unavailableBody")}</p>
    </div>
  );
}

function AuthCardContent() {
  const t = useTranslations("Auth");
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className={cn(panelShellClass, "p-7")}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-fluid-small uppercase tracking-[0.22em] text-[#9da3af]">
              {t("authenticated.eyebrow")}
            </p>
            <h3 className={cn("mt-2", fluidH2Class)}>{t("authenticated.title")}</h3>
          </div>
          <UserButton />
        </div>
        <div className={cn(accentCalloutClass, "p-4 text-fluid-small leading-6 text-[#d7dbe2]")}>
          <ShieldCheck className="mb-3 size-5 text-accent" />
          {t("authenticated.body")}
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href={ONBOARDING_ENTRY_PATH}>
            {t("authenticated.cta")}
            <ArrowRight className="ml-auto size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return <SiteAuthForm />;
}

export function AuthCard() {
  const { isLoaded } = useAuth();
  const proxyBlocked = useClerkProxyBlocked();

  if (proxyBlocked) {
    return (
      <div className={authCardWidthClass}>
        <ClerkProxyBlockedNotice />
      </div>
    );
  }

  return (
    <div className={authCardWidthClass}>
      {!isLoaded ? <AuthLoadingShell /> : null}
      <ClerkFailed>
        <AuthUnavailableNotice />
      </ClerkFailed>
      <ClerkDegraded>
        <AuthUnavailableNotice />
      </ClerkDegraded>
      {isLoaded ? <AuthCardContent /> : null}
    </div>
  );
}
