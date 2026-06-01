import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileSignature,
  Fingerprint,
  Layers,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MarketingFeatureItem } from "@/components/marketing/marketing-feature-item";
import { MarketingQuoteCard } from "@/components/marketing/marketing-quote-card";
import { MarketingStepItem } from "@/components/marketing/marketing-step-item";
import { MarketingValueCard } from "@/components/marketing/marketing-value-card";
import { MarketingVisual } from "@/components/marketing/marketing-visual";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  accentCalloutClass,
  contentShellClass,
  fluidBodyClass,
  fluidH1Class,
  fluidH2Class,
  fluidInlinePaddingClass,
  panelShellClass,
} from "@/lib/brand/theme-classes";
import { cn } from "@/lib/utils";

const valueIcons = [TrendingUp, Shield, Users] as const;
const valueArtVariants = ["growth", "trust", "creators"] as const;

const whyIcons = [Sparkles, Shield, Users, Lock, Zap, Rocket] as const;
const featureIcons = [ClipboardList, FileSignature, Fingerprint, BadgeCheck] as const;

function SectionIntro({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <h2 className={cn(fluidH2Class, "text-balance text-foreground")}>{title}</h2>
      <p className={cn("mt-3", fluidBodyClass)}>{subtitle}</p>
    </div>
  );
}

export async function OfmMarketingPage() {
  const t = await getTranslations("OfmMarketing");

  return (
    <>
      <main className="relative flex-1 overflow-hidden">
        <div className="brand-page-glow absolute inset-0" aria-hidden />
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

        <div className={cn(contentShellClass, fluidInlinePaddingClass, "relative py-section-lg")}>
          <header className="mb-12 flex min-w-0 flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <Link href="/" className="inline-flex rounded-lg transition-opacity hover:opacity-90">
              <BrandLogo size="md" showWordmark />
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">{t("headerLogin")}</Link>
            </Button>
          </header>

          {/* Hero */}
          <section className="grid w-full min-w-0 items-center gap-fluid-gap-lg lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
            <div className="min-w-0 space-y-fluid-gap-md text-center lg:text-left">
              <p className="text-fluid-caption font-medium uppercase tracking-wide text-muted-foreground">
                {t("socialProof")}
              </p>
              <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-border-accent-strong bg-surface-accent-muted px-3 py-1 text-xs font-medium text-accent lg:mx-0">
                <Sparkles className="size-3" aria-hidden />
                {t("badge")}
              </div>
              <h1 className={cn(fluidH1Class, "text-balance")}>{t("title")}</h1>
              <p className={cn(fluidBodyClass, "mx-auto max-w-2xl lg:mx-0")}>{t("description")}</p>
              <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
                <Button asChild size="lg" variant="accent" className="w-full min-w-0 sm:w-auto">
                  <Link href="/sign-up">
                    {t("ctaApply")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full min-w-0 sm:w-auto">
                  <Link href="/login">{t("ctaLogin")}</Link>
                </Button>
              </div>
              <p className="text-fluid-caption text-muted-foreground">{t("heroNote")}</p>
            </div>

            <MarketingVisual
              src="/marketing/hero-primary.avif"
              alt={t("heroImageAlt")}
              priority
              glow
              className="aspect-[4/5] min-h-[16rem] w-full min-w-0 max-w-md justify-self-center sm:min-h-[20rem] lg:max-w-none lg:min-h-[24rem] lg:justify-self-end"
            />
          </section>

          {/* Trust strip */}
          <section
            aria-label={t("socialProof")}
            className="mx-auto mt-16 grid min-w-0 max-w-5xl gap-4 sm:grid-cols-3"
          >
            {([0, 1, 2] as const).map((index) => (
              <div
                key={index}
                className={cn(accentCalloutClass, "min-w-0 px-fluid-inline py-4 text-center sm:text-left")}
              >
                <p className="text-sm font-semibold text-foreground">{t(`trust.${index}.label`)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(`trust.${index}.detail`)}</p>
              </div>
            ))}
          </section>

          {/* Why choose */}
          <section className="mt-20 min-w-0">
            <SectionIntro title={t("whyTitle")} subtitle={t("whySubtitle")} />
            <div className="mx-auto mt-10 grid min-w-0 max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {([0, 1, 2, 3, 4, 5] as const).map((index) => {
                const Icon = whyIcons[index];
                return (
                  <MarketingFeatureItem
                    key={index}
                    icon={Icon}
                    title={t(`why.${index}.title`)}
                    body={t(`why.${index}.body`)}
                  />
                );
              })}
            </div>
          </section>

          {/* Feature grid */}
          <section className="mt-20 min-w-0">
            <SectionIntro title={t("featuresTitle")} subtitle={t("featuresSubtitle")} />
            <div className="mx-auto mt-10 grid min-w-0 max-w-5xl gap-4 md:grid-cols-2">
              {([0, 1, 2, 3] as const).map((index) => {
                const Icon = featureIcons[index];
                return (
                  <MarketingFeatureItem
                    key={index}
                    icon={Icon}
                    title={t(`features.${index}.title`)}
                    body={t(`features.${index}.body`)}
                  />
                );
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <Button asChild variant="accent">
                <Link href="/sign-up">
                  {t("ctaApply")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* How it works */}
          <section className="mt-20 min-w-0">
            <SectionIntro title={t("howTitle")} subtitle={t("howSubtitle")} className="mb-10" />
            <div className="grid min-w-0 items-start gap-fluid-gap-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]">
              <ol className="grid min-w-0 gap-4 sm:grid-cols-2">
                {([0, 1, 2, 3] as const).map((index) => (
                  <MarketingStepItem
                    key={index}
                    step={t(`steps.${index}.step`)}
                    title={t(`steps.${index}.title`)}
                    body={t(`steps.${index}.body`)}
                  />
                ))}
              </ol>
              <MarketingVisual
                src="/marketing/auth-ambient.avif"
                alt={t("howImageAlt")}
                overlay="ambient"
                className="aspect-[4/3] min-h-[14rem] w-full min-w-0 lg:min-h-[18rem]"
              />
            </div>
          </section>

          {/* Value pillars */}
          <section className="mt-20 min-w-0">
            <SectionIntro title={t("pillarsTitle")} subtitle={t("pillarsSubtitle")} className="mb-10" />
            <div className="mx-auto grid min-w-0 max-w-5xl gap-6 md:grid-cols-3">
              {([0, 1, 2] as const).map((index) => {
                const Icon = valueIcons[index];
                return (
                  <MarketingValueCard
                    key={index}
                    artVariant={valueArtVariants[index]}
                    icon={Icon}
                    title={t(`values.${index}.title`)}
                    body={t(`values.${index}.body`)}
                  />
                );
              })}
            </div>
          </section>

          {/* Creator voices (illustrative — replace with real testimonials when available) */}
          <section className="mt-20 min-w-0">
            <SectionIntro title={t("voicesTitle")} subtitle={t("voicesSubtitle")} className="mb-10" />
            <div className="mx-auto grid min-w-0 max-w-5xl gap-4 md:grid-cols-3">
              {([0, 1, 2] as const).map((index) => (
                <MarketingQuoteCard
                  key={index}
                  quote={t(`voices.${index}.quote`)}
                  attribution={t(`voices.${index}.attribution`)}
                />
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-20 min-w-0">
            <h2 className={cn(fluidH2Class, "text-center text-foreground")}>{t("faqTitle")}</h2>
            <dl className="mx-auto mt-10 grid min-w-0 max-w-3xl gap-4">
              {([0, 1, 2, 3, 4] as const).map((index) => (
                <div key={index} className={cn(panelShellClass, "min-w-0")}>
                  <dt className="text-base font-semibold text-foreground">{t(`faq.${index}.q`)}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">{t(`faq.${index}.a`)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Closing CTA */}
          <section
            className={cn(
              panelShellClass,
              "relative mx-auto mt-20 max-w-3xl min-w-0 overflow-hidden text-center ring-1 ring-accent/15",
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,var(--color-accent-soft),transparent)]"
              aria-hidden
            />
            <div className="relative z-[1]">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border-accent bg-surface-accent-muted text-accent shadow-[var(--shadow-glow)]">
                <Layers className="size-6" aria-hidden />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{t("closingTitle")}</h2>
              <p className={cn("mt-3", fluidBodyClass)}>{t("closingBody")}</p>
              <p className="mt-2 text-fluid-caption text-muted-foreground">{t("closingNote")}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="accent" size="lg" className="w-full min-w-0 sm:w-auto">
                  <Link href="/sign-up">
                    {t("ctaApply")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full min-w-0 sm:w-auto">
                  <Link href="/login">{t("ctaLogin")}</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
