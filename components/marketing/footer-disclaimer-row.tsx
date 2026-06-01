import { Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FooterLanguageSelector } from "@/components/marketing/footer-language-selector";
import type { MarketingFooterVariant } from "@/components/marketing/landing/landing-footer";
import type { FooterLegalLink } from "@/lib/marketing/footer-config";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type FooterDisclaimerRowProps = {
  variant?: MarketingFooterVariant;
  disclaimer?: string;
  copyright?: string;
  legal: readonly FooterLegalLink[];
  showLanguageSelector?: boolean;
};

export async function FooterDisclaimerRow({
  variant = "site",
  disclaimer,
  copyright,
  legal,
  showLanguageSelector = true,
}: FooterDisclaimerRowProps) {
  const t = await getTranslations("Footer");
  const currentYear = new Date().getFullYear();
  const isLanding = variant === "landing";
  const text = disclaimer ?? t("disclaimer");
  const copyrightText = copyright ?? t("copyright", { year: currentYear });

  const linkClass = isLanding
    ? "transition hover:text-[var(--landing-text)]"
    : "transition hover:text-link-hover";

  const mutedClass = isLanding ? "text-[var(--landing-muted)]" : "text-muted-foreground";

  const separatorClass = cn("shrink-0 opacity-70", mutedClass);

  const copyrightDisclaimer = (
    <p className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center [overflow-wrap:anywhere]">
      <span className="shrink-0">{copyrightText}</span>
      <span className={separatorClass} aria-hidden>
        ·
      </span>
      <span className="min-w-0">{text}</span>
    </p>
  );

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-y-4 text-xs leading-relaxed",
        "md:grid-cols-2 md:items-center md:gap-x-6 md:gap-y-3",
        "lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-y-0",
        mutedClass,
      )}
    >
      {showLanguageSelector ? (
        <div className="flex min-w-0 justify-self-start md:col-start-1 md:row-start-1 lg:col-start-1 lg:row-start-1">
          <div className="inline-flex shrink-0 items-center gap-1.5">
            <Globe
              className="size-3.5 shrink-0 opacity-70"
              strokeWidth={1.75}
              aria-hidden
            />
            <FooterLanguageSelector
              className={cn(
                isLanding &&
                  "text-[var(--landing-muted)] focus-visible:ring-[var(--landing-accent-orange)]",
              )}
            />
          </div>
        </div>
      ) : (
        <div className="hidden lg:block" aria-hidden />
      )}

      <div
        className={cn(
          "min-w-0 justify-self-center px-1",
          "md:col-span-2 md:row-start-2",
          "lg:col-span-1 lg:col-start-2 lg:row-start-1",
        )}
      >
        {copyrightDisclaimer}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1",
          "justify-self-start md:col-start-2 md:row-start-1 md:justify-self-end",
          "lg:col-start-3 lg:row-start-1",
        )}
      >
        {legal.map((item, index) => (
          <span key={item.href} className="inline-flex items-center gap-x-3">
            {index > 0 ? <span aria-hidden>·</span> : null}
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
