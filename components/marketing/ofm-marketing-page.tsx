import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles, TrendingUp, Shield, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  contentShellClass,
  fluidBodyClass,
  fluidH1Class,
  fluidInlinePaddingClass,
  panelShellClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

const valueIcons = [TrendingUp, Shield, Users] as const;

export async function OfmMarketingPage() {
  const t = await getTranslations("OfmMarketing");

  return (
    <>
      <main className="relative flex-1 overflow-hidden">
        <div className="brand-page-glow absolute inset-0" aria-hidden />
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

        <div className={cn(contentShellClass, fluidInlinePaddingClass, "relative py-section-lg")}>
          <header className="mb-12 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <Link href="/" className="inline-flex rounded-lg transition-opacity hover:opacity-90">
              <BrandLogo size="md" showWordmark />
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">{t("headerLogin")}</Link>
            </Button>
          </header>

          <section className="mx-auto max-w-3xl space-y-fluid-gap-md text-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border-accent-strong bg-surface-accent-muted px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="size-3" aria-hidden />
              {t("badge")}
            </div>
            <h1 className={fluidH1Class}>{t("title")}</h1>
            <p className={cn(fluidBodyClass, "mx-auto max-w-2xl")}>{t("description")}</p>
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button asChild size="lg" variant="accent" className="w-full sm:w-auto">
                <Link href="/sign-up">
                  {t("ctaApply")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/login">{t("ctaLogin")}</Link>
              </Button>
            </div>
          </section>

          <section className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
            {([0, 1, 2] as const).map((index) => {
              const Icon = valueIcons[index];
              return (
                <article key={index} className={cn(panelShellClass, "space-y-3 text-center md:text-left")}>
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border-accent bg-surface-accent-muted text-accent md:mx-0">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{t(`values.${index}.title`)}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{t(`values.${index}.body`)}</p>
                </article>
              );
            })}
          </section>

          <section className={cn(panelShellClass, "mx-auto mt-16 max-w-3xl text-center")}>
            <h2 className="text-2xl font-semibold text-foreground">{t("closingTitle")}</h2>
            <p className={cn("mt-3", fluidBodyClass)}>{t("closingBody")}</p>
            <Button asChild className="mt-6" variant="accent">
              <Link href="/sign-up">{t("ctaApply")}</Link>
            </Button>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
