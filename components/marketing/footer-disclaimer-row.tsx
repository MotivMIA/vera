import { Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FooterLanguageSelector } from "@/components/marketing/footer-language-selector";
import type { MarketingFooterVariant } from "@/components/marketing/landing/landing-footer";
import { footerDisclaimerGridClass } from "@/lib/marketing/footer-grid";
import type { FooterLegalLink } from "@/lib/marketing/footer-config";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type FooterDisclaimerRowProps = {
  variant?: MarketingFooterVariant;
  columnCount: 1 | 2 | 3;
  disclaimer?: string;
  copyright?: string;
  legal: readonly FooterLegalLink[];
  showLanguageSelector?: boolean;
};

export async function FooterDisclaimerRow({
  variant = "site",
  columnCount,
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
    <p className="footer-disclaimer-copy mx-auto max-w-full text-balance text-pretty leading-relaxed">
      <span className="whitespace-nowrap">{copyrightText}</span>{" "}
      <span className={separatorClass} aria-hidden>
        ·
      </span>{" "}
      <span>{text}</span>
    </p>
  );

  const languageCell = showLanguageSelector ? (
    <div
      className={cn(
        "flex min-w-0 items-center justify-self-center md:justify-self-start",
        mutedClass,
        "text-xs leading-relaxed",
      )}
    >
      <div className="inline-flex shrink-0 items-center gap-1.5">
        <Globe className="size-3.5 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
        <FooterLanguageSelector
          className={cn(
            isLanding &&
              "text-[var(--landing-muted)] focus-visible:ring-[var(--landing-accent-orange)]",
          )}
        />
      </div>
    </div>
  ) : (
    <div className="hidden min-w-0 md:block" aria-hidden />
  );

  const legalCell = (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1",
        "md:justify-end md:justify-self-end",
        mutedClass,
        "text-xs leading-relaxed",
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
  );

  const disclaimerCell = (
    <div
      className={cn(
        "footer-disclaimer-center min-w-0 justify-self-stretch px-1 text-center md:px-2",
        columnCount === 2 && "md:col-span-2",
      )}
    >
      {copyrightDisclaimer}
    </div>
  );

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 items-center gap-y-4 text-xs leading-relaxed",
        "md:items-center md:gap-x-6 md:gap-y-3",
        footerDisclaimerGridClass(columnCount),
        mutedClass,
      )}
    >
      {columnCount === 2 ? (
        <>
          {languageCell}
          {legalCell}
          {disclaimerCell}
        </>
      ) : (
        <>
          {languageCell}
          {disclaimerCell}
          {legalCell}
        </>
      )}
    </div>
  );
}
