import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { contentShellClass } from "@/lib/brand/theme-classes";
import { enforceOnboardingPath } from "@/lib/onboarding/guards";
import { ONBOARDING_CONSENT_PATH } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default async function OnboardingWelcomePage() {
  await enforceOnboardingPath("/onboarding");
  const t = await getTranslations("OnboardingWelcome");

  return (
    <main className={cn(contentShellClass, "min-h-screen px-5 py-6 md:px-8")}>
      <header className="flex items-center justify-between">
        <BrandLogo href="/" size="sm" showWordmark />
        <UserButton />
      </header>

      <section className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-16 text-center md:py-24">
        <Badge className="w-fit gap-2 border-border-accent-strong bg-surface-accent-muted text-accent">
          <Sparkles className="size-3" />
          {t("badge")}
        </Badge>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">{t("eyebrow")}</p>
          <h1 className="text-balance text-4xl font-semibold tracking-normal sm:text-5xl">{t("title")}</h1>
          <p className="text-base leading-7 text-muted-foreground">{t("description")}</p>
        </div>

        <Card className="glass-panel w-full rounded-2xl text-left">
          <CardContent className="space-y-6 p-8 sm:p-10">
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>{t("steps.consent")}</li>
              <li>{t("steps.identity")}</li>
              <li>{t("steps.documents")}</li>
            </ul>
            <Button asChild variant="accent" size="lg" className="w-full sm:w-auto">
              <Link href={ONBOARDING_CONSENT_PATH}>{t("cta")}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
