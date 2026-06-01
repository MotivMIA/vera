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

/** Nav link + download cells — 2-col from sm, 3-col from md when there are three items. */
function footerNavBundleGridClass(navItemCount: number): string {
  if (navItemCount <= 1) return "grid-cols-1";
  if (navItemCount === 2) return "sm:grid-cols-2";
  return "sm:grid-cols-2 md:grid-cols-3";
}

/** lg+ one row: brand · download (fixed) · link column(s). Product + Support share one slot. */
const footerLgGridClass: Record<string, string> = {
  d1: "lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)_minmax(0,1fr)]",
  d0: "lg:grid-cols-[minmax(0,1.15fr)_minmax(10.5rem,13.5rem)]",
  n1: "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
  n0: "lg:grid-cols-[minmax(0,1.15fr)]",
};

function footerMainGridClass(linkColumnCount: number, hasDownload: boolean): string | false {
  if (linkColumnCount === 0 && !hasDownload) return false;
  const key = `${hasDownload ? "d" : "n"}${linkColumnCount}`;
  return footerLgGridClass[key] ?? false;
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
  /** Product + Support render in one grid slot so they stay visually grouped. */
  const linkGridSlots = columns.length > 1 ? 1 : columns.length;
  const navItemCount = linkGridSlots + (hasDownload ? 1 : 0);

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
          footerMainGridClass(linkGridSlots, hasDownload),
        )}
      >
        <div className={footerColumnClass}>
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

        {navItemCount > 0 ? (
          <div
            className={cn(
              "grid min-w-0 gap-x-6 gap-y-8 sm:gap-x-8 lg:contents lg:gap-y-0",
              footerNavBundleGridClass(navItemCount),
            )}
          >
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

            {columns.length > 0 ? (
              <div
                className={cn(
                  columns.length > 1 &&
                    "flex min-w-0 flex-wrap items-start gap-x-8 gap-y-8 sm:gap-x-10 lg:gap-x-10 xl:gap-x-12",
                  columns.length === 1 && footerColumnClass,
                )}
              >
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
            ) : null}
          </div>
        ) : null}
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
