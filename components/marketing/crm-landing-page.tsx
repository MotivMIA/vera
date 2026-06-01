import {
  Activity,
  BookOpen,
  Calendar,
  FileText,
  Headphones,
  LayoutDashboard,
  ListFilter,
  Lock,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wand2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getMessages, getTranslations } from "next-intl/server";
import {
  AnalyticsMockup,
  ChatMockup,
  FadeIn,
  FaqAccordion,
  FeatureCard,
  HeroMockup,
  LandingButton,
  LandingFooter,
  LandingHeader,
  LandingSection,
  PollCard,
  TestimonialCarousel,
  type FeatureCardAccent,
} from "@/components/marketing/landing";
import { buildMarketingFooterColumns } from "@/components/marketing/marketing-footer-columns";
import { Link } from "@/i18n/navigation";
import { SOCIAL_LINKS } from "@/lib/brand/social";
import { buildFooterLegalLinks } from "@/lib/marketing/footer-config";
import "@/lib/brand/landing-tokens.css";
import { cn } from "@/lib/utils";

const whyIcons = [Shield, Zap, Lock, Activity, Users, Headphones] as const;
const whyAccents: FeatureCardAccent[] = ["blue", "peach", "green", "lavender", "warm", "blue"];
const revenueIcons = [MessageSquare, Sparkles, Send, ListFilter] as const;
const analyticsIcons = [LayoutDashboard, Users, UserCog, Calendar] as const;
const copilotIcons = [Wand2, FileText, TrendingUp, BookOpen] as const;

const indices6 = [0, 1, 2, 3, 4, 5] as const;
const indices4 = [0, 1, 2, 3] as const;
const indices12 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const indices3 = [0, 1, 2] as const;

type CrmCommunityMessages = {
  polls: Record<
    string,
    {
      options: Record<string, { percent: number }>;
    }
  >;
};

function SectionHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2 className="landing-headline text-3xl md:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="landing-subhead mt-3 text-base md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

function mapCards(
  t: Awaited<ReturnType<typeof getTranslations<"CrmLanding">>>,
  prefix: string,
  indices: readonly number[],
  icons: readonly LucideIcon[],
  accents?: FeatureCardAccent[],
) {
  return indices.map((i) => ({
    title: t(`${prefix}.${i}.title` as Parameters<typeof t>[0]),
    body: t(`${prefix}.${i}.body` as Parameters<typeof t>[0]),
    icon: icons[i],
    accent: accents?.[i] ?? ("none" as FeatureCardAccent),
  }));
}

export async function CrmLandingPage() {
  const t = await getTranslations("CrmLanding");
  const tFooter = await getTranslations("Footer");
  const messages = await getMessages();
  const community = (messages.CrmLanding as { community: CrmCommunityMessages }).community;
  const year = new Date().getFullYear();

  const resourceItems = indices3.map((i) => ({
    label: t(`resources.${i}.label`),
    href: t(`resources.${i}.href`),
  }));

  const whyCards = mapCards(t, "why", indices6, whyIcons, whyAccents);
  const revenueCards = mapCards(t, "revenue", indices4, revenueIcons, [
    "peach",
    "lavender",
    "blue",
    "green",
  ]);
  const analyticsCards = mapCards(t, "analytics", indices4, analyticsIcons, [
    "blue",
    "green",
    "warm",
    "lavender",
  ]);
  const copilotCards = mapCards(t, "copilot", indices4, copilotIcons, [
    "lavender",
    "peach",
    "green",
    "blue",
  ]);
  const featureGridCards = mapCards(t, "featuresGrid", indices12, whyIcons); // icons cycle

  const testimonials = indices3.map((i) => ({
    quote: t(`testimonials.${i}.quote`),
    name: t(`testimonials.${i}.name`),
    role: t(`testimonials.${i}.role`),
  }));

  const faqItems = indices6.map((i) => ({
    id: `faq-${i}`,
    question: t(`faq.${i}.q`),
    answer: t(`faq.${i}.a`),
  }));

  const polls = ([0, 1] as const).map((pollIndex) => ({
    question: t(`community.polls.${pollIndex}.question`),
    options: indices3.map((optIndex) => ({
      label: t(`community.polls.${pollIndex}.options.${optIndex}.label`),
      percent: community.polls[String(pollIndex)].options[String(optIndex)].percent,
    })),
    accent: (pollIndex === 0 ? "blue" : "lavender") as "blue" | "lavender",
  }));

  const footerColumns = buildMarketingFooterColumns(t);

  return (
    <div className="crm-landing relative flex min-h-screen flex-col">
      <LandingHeader
        nav={[
          { label: t("header.pricing"), href: "/sign-up" },
          { label: t("header.download"), href: "/#download" },
        ]}
        resourcesLabel={t("header.resources")}
        resourcesItems={resourceItems}
        helpLabel={t("header.help")}
        helpHref="/legal"
        startTrial={t("header.startTrial")}
        signUpHref="/sign-up"
      />

      <main className="flex-1">
        {/* Hero */}
        <LandingSection className="!pt-8 md:!pt-12">
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
            <FadeIn className="min-w-0 text-center lg:text-left">
              <p className="landing-eyebrow">{t("hero.eyebrow")}</p>
              <h1 className="landing-headline mt-3 text-4xl sm:text-5xl lg:text-[3.25rem]">
                {t("hero.title")}
              </h1>
              <p className="landing-subhead mx-auto mt-4 max-w-xl text-base md:text-lg lg:mx-0">
                {t("hero.description")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <LandingButton size="lg" asChild>
                  <Link href="/sign-up">{t("hero.ctaPrimary")}</Link>
                </LandingButton>
                <LandingButton variant="secondary" size="lg" asChild>
                  <Link href="/sign-up">{t("hero.ctaSecondary")}</Link>
                </LandingButton>
              </div>
              <p className="mt-3 text-xs font-medium text-[var(--landing-muted)]">
                {t("hero.note")}
              </p>
            </FadeIn>
            <FadeIn delay={0.1} className="min-w-0">
              <HeroMockup />
            </FadeIn>
          </div>
        </LandingSection>

        {/* Why choose */}
        <LandingSection id="why">
          <FadeIn>
            <SectionHeading title={t("why.title")} subtitle={t("why.subtitle")} />
          </FadeIn>
          <div className="mt-10 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.05}>
                <FeatureCard
                  title={card.title}
                  body={card.body}
                  icon={card.icon}
                  accent={card.accent}
                  className="h-full"
                />
              </FadeIn>
            ))}
          </div>
        </LandingSection>

        {/* Revenue / growth */}
        <LandingSection className="bg-[var(--landing-section-alt)]">
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <div className="min-w-0">
              <FadeIn>
                <SectionHeading
                  title={t("revenue.title")}
                  subtitle={t("revenue.subtitle")}
                  className="lg:text-left"
                />
              </FadeIn>
              <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2">
                {revenueCards.map((card, i) => (
                  <FadeIn key={card.title} delay={i * 0.06}>
                    <FeatureCard
                      title={card.title}
                      body={card.body}
                      icon={card.icon}
                      accent={card.accent}
                      compact
                      className="h-full"
                    />
                  </FadeIn>
                ))}
              </div>
            </div>
            <FadeIn delay={0.15} className="min-w-0">
              <AnalyticsMockup />
            </FadeIn>
          </div>
        </LandingSection>

        {/* Analytics / operations */}
        <LandingSection>
          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
            <FadeIn className="order-2 min-w-0 lg:order-1">
              <AnalyticsMockup />
            </FadeIn>
            <div className="order-1 min-w-0 lg:order-2">
              <FadeIn>
                <SectionHeading
                  title={t("analytics.title")}
                  subtitle={t("analytics.subtitle")}
                  className="lg:text-left"
                />
              </FadeIn>
              <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2">
                {analyticsCards.map((card, i) => (
                  <FadeIn key={card.title} delay={i * 0.06}>
                    <FeatureCard
                      title={card.title}
                      body={card.body}
                      icon={card.icon}
                      accent={card.accent}
                      compact
                      className="h-full"
                    />
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </LandingSection>

        {/* AI Copilot */}
        <LandingSection id="copilot" className="bg-[var(--landing-accent-lavender)]/30">
          <FadeIn>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex rounded-full bg-[var(--landing-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--landing-accent-orange)] shadow-sm">
                {t("copilot.badge")}
              </span>
              <SectionHeading title={t("copilot.title")} subtitle={t("copilot.subtitle")} />
            </div>
          </FadeIn>
          <div className="mt-10 grid min-w-0 items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {copilotCards.map((card, i) => (
                <FadeIn key={card.title} delay={i * 0.06}>
                  <FeatureCard
                    title={card.title}
                    body={card.body}
                    icon={card.icon}
                    accent={card.accent}
                    compact
                    className="h-full bg-[var(--landing-surface)]"
                  />
                </FadeIn>
              ))}
            </div>
            <FadeIn delay={0.12} className="min-w-0 lg:sticky lg:top-24">
              <ChatMockup />
            </FadeIn>
          </div>
        </LandingSection>

        {/* Testimonials */}
        <LandingSection>
          <FadeIn>
            <SectionHeading title={t("testimonials.title")} subtitle={t("testimonials.subtitle")} />
          </FadeIn>
          <div className="mt-10">
            <TestimonialCarousel items={testimonials} />
          </div>
        </LandingSection>

        {/* Features grid */}
        <LandingSection id="features">
          <FadeIn>
            <SectionHeading title={t("featuresGrid.title")} subtitle={t("featuresGrid.subtitle")} />
          </FadeIn>
          <div className="mt-10 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureGridCards.map((card, i) => (
              <FadeIn key={card.title} delay={(i % 4) * 0.04}>
                <FeatureCard
                  title={card.title}
                  body={card.body}
                  icon={whyIcons[i % whyIcons.length]}
                  accent={whyAccents[i % whyAccents.length]}
                  compact
                  className="h-full"
                />
              </FadeIn>
            ))}
          </div>
        </LandingSection>

        {/* Community proof */}
        <LandingSection className="bg-[var(--landing-section-alt)]">
          <FadeIn>
            <SectionHeading title={t("community.title")} subtitle={t("community.subtitle")} />
          </FadeIn>
          <div className="mt-10 grid min-w-0 gap-6 md:grid-cols-2">
            {polls.map((poll) => (
              <FadeIn key={poll.question}>
                <PollCard
                  question={poll.question}
                  options={poll.options}
                  accent={poll.accent}
                />
              </FadeIn>
            ))}
          </div>
        </LandingSection>

        {/* FAQ */}
        <LandingSection id="faq">
          <FadeIn>
            <SectionHeading title={t("faq.title")} className="mb-10" />
          </FadeIn>
          <FadeIn>
            <FaqAccordion items={faqItems} />
          </FadeIn>
        </LandingSection>

        {/* Final CTA */}
        <LandingSection compact>
          <FadeIn>
            <div className="landing-card mx-auto max-w-2xl rounded-[var(--landing-radius-lg)] px-6 py-10 text-center md:px-12 md:py-14">
              <h2 className="landing-headline text-3xl md:text-4xl">{t("finalCta.title")}</h2>
              <p className="landing-subhead mx-auto mt-3 max-w-lg text-base">{t("finalCta.body")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <LandingButton size="lg" asChild>
                  <Link href="/sign-up">{t("finalCta.primary")}</Link>
                </LandingButton>
                <LandingButton variant="secondary" size="lg" asChild>
                  <Link href="/sign-up">{t("finalCta.secondary")}</Link>
                </LandingButton>
              </div>
              <p className="mt-4 text-xs text-[var(--landing-muted)]">{t("finalCta.note")}</p>
            </div>
          </FadeIn>
        </LandingSection>
      </main>

      <LandingFooter
        variant="landing"
        logoHref={null}
        tagline={t("footer.tagline")}
        columns={footerColumns}
        socialLinks={SOCIAL_LINKS}
        appSection={{ title: tFooter("downloadApp") }}
        legal={buildFooterLegalLinks(tFooter)}
        copyright={tFooter("copyright", { year })}
        disclaimer={tFooter("disclaimer")}
      />
    </div>
  );
}
