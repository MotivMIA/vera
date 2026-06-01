import { AppStoreBadges } from "@/components/marketing/app-store-badges";
import { FooterDisclaimerRow } from "@/components/marketing/footer-disclaimer-row";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import { BrandLogo } from "@/components/brand/brand-logo";
import { APP_STORE_LINKS } from "@/lib/brand/app";
import type { SocialLink } from "@/lib/brand/social";
import { marketingFooterMarkClass } from "@/lib/brand/light-themes";
import { contentShellClass } from "@/lib/brand/theme-classes";
import type { FooterLegalLink } from "@/lib/marketing/footer-config";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type MarketingFooterVariant = "landing" | "site";

type LandingFooterProps = {
  variant?: MarketingFooterVariant;
  tagline: string;
  columns: FooterColumn[];
  copyright: string;
  /** `null` = logo without link (CRM landing hero style). Default `/` for site. */
  logoHref?: string | null;
  socialLinks?: readonly SocialLink[];
  appSection?: { title: string };
  disclaimer: string;
  legal: readonly FooterLegalLink[];
  showLanguageSelector?: boolean;
};

const siteLinkClass =
  "text-fluid-small text-muted-foreground transition hover:text-link-hover";

const siteHeadingClass =
  "text-fluid-small font-semibold uppercase tracking-wide text-foreground";

const footerColumnClass = "min-w-0";

/** Brand spans full width on sm/md; nav cells share one row from lg. */
function footerBrandColSpanClass(linkColumnCount: number, hasDownload: boolean): string {
  const navCells = linkColumnCount + (hasDownload ? 1 : 0);
  if (navCells === 0) return "";
  return cn("sm:col-span-2", navCells >= 2 && "md:col-span-3", "lg:col-span-1");
}

/** One grid for brand + download + link columns — explicit cols per breakpoint. */
function footerResponsiveGridClass(linkColumnCount: number, hasDownload: boolean): string {
  const navCells = linkColumnCount + (hasDownload ? 1 : 0);
  if (navCells === 0) return "";

  const classes: string[] = ["sm:grid-cols-2"];
  if (navCells >= 2) classes.push("md:grid-cols-3");

  if (hasDownload) {
    if (linkColumnCount >= 3) {
      classes.push(
        "lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)_repeat(3,minmax(0,1fr))]",
      );
    } else if (linkColumnCount === 2) {
      classes.push(
        "lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)_repeat(2,minmax(0,1fr))]",
      );
    } else if (linkColumnCount === 1) {
      classes.push("lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)_minmax(0,1fr)]");
    } else {
      classes.push("lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)]");
    }
    return classes.join(" ");
  }

  if (linkColumnCount >= 3) {
    classes.push("lg:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,1fr))]");
  } else if (linkColumnCount === 2) {
    classes.push("lg:grid-cols-[minmax(0,1.15fr)_repeat(2,minmax(0,1fr))]");
  } else if (linkColumnCount === 1) {
    classes.push("lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]");
  }

  return classes.join(" ");
}

export function LandingFooter({
  variant = "landing",
  tagline,
  columns,
  copyright,
  logoHref = "/",
  socialLinks,
  appSection,
  disclaimer,
  legal,
  showLanguageSelector = true,
}: LandingFooterProps) {
  const isLanding = variant === "landing";
  const hasDownload = Boolean(appSection);
  const linkColumnCount = columns.length;

  const columnHeadingClass = isLanding
    ? "text-xs font-semibold uppercase tracking-wide text-[var(--landing-text)]"
    : siteHeadingClass;

  const columnLinkClass = isLanding
    ? "text-sm text-[var(--landing-muted)] transition hover:text-[var(--landing-text)]"
    : siteLinkClass;

  const taglineClass = isLanding
    ? "mt-4 max-w-xs text-sm leading-relaxed text-[var(--landing-muted)]"
    : "mt-4 max-w-xs text-fluid-small leading-fluid-body text-muted-foreground";

  const body = (
    <>
      <div
        className={cn(
          "grid min-w-0 grid-cols-1 gap-x-6 gap-y-10 sm:gap-x-8 lg:items-start lg:gap-x-8 xl:gap-x-10 lg:gap-y-0",
          footerResponsiveGridClass(linkColumnCount, hasDownload),
        )}
      >
        <div className={cn(footerColumnClass, footerBrandColSpanClass(linkColumnCount, hasDownload))}>
          {logoHref === null ? (
            <BrandLogo size={isLanding ? "md" : "sm"} showWordmark href={null} />
          ) : (
            <Link
              href={logoHref}
              className="inline-flex rounded-lg transition-opacity hover:opacity-90"
            >
              <BrandLogo size={isLanding ? "md" : "sm"} showWordmark />
            </Link>
          )}
          <p className={taglineClass}>{tagline}</p>
          {socialLinks && socialLinks.length > 0 ? (
            <div
              className={cn(
                "mt-4 flex flex-wrap items-center gap-3",
                !isLanding && "justify-center sm:justify-start",
              )}
            >
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition hover:opacity-90",
                    isLanding && "opacity-90 hover:opacity-100",
                  )}
                >
                  <SocialSpriteIcon
                    variant={social.icon}
                    className={cn("size-5", marketingFooterMarkClass)}
                  />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {appSection ? (
          <div id="download" className={footerColumnClass}>
            <p className={cn(columnHeadingClass, "break-words")}>{appSection.title}</p>
            <div className="mt-3 min-w-0 w-full max-w-[13.5rem]">
              <AppStoreBadges
                links={APP_STORE_LINKS}
                size="sm"
                layout="row"
                className="w-full min-w-0"
              />
            </div>
          </div>
        ) : null}

        {columns.map((col) => (
          <div key={col.title} className={footerColumnClass}>
            <p className={cn(columnHeadingClass, "break-words")}>{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={`${col.title}-${link.href}-${link.label}`}>
                  <Link href={link.href} className={cn(columnLinkClass, "break-words")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mt-14 border-t pt-9 md:mt-16 md:pt-10",
          isLanding ? "border-[var(--landing-border)]" : "border-border-default",
        )}
      >
        <FooterDisclaimerRow
          variant={variant}
          disclaimer={disclaimer}
          copyright={copyright}
          legal={legal}
          showLanguageSelector={showLanguageSelector}
        />
      </div>
    </>
  );

  if (isLanding) {
    return (
      <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-section-alt)]">
        <div className="landing-container py-12 md:py-16">{body}</div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border-default">
      <div className={cn(contentShellClass, "px-5 md:px-8")}>
        <div className="py-12 md:py-14">{body}</div>
      </div>
    </footer>
  );
}
