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

/** md+ evenly spaced top-level containers: brand | download | menu group. */
function footerTopRowGridClass(hasDownload: boolean, hasMenus: boolean): string {
  const count = 1 + (hasDownload ? 1 : 0) + (hasMenus ? 1 : 0);
  if (count <= 1) return "";
  if (count === 2) return "md:grid-cols-2";
  return "md:grid-cols-3";
}

/** Product / Company / Support stay inside the menu container. */
function footerMenuGroupGridClass(columnCount: number): string {
  if (columnCount <= 1) return "";
  if (columnCount === 2) return "grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
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
  const hasMenus = columns.length > 0;

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
          "grid min-w-0 grid-cols-1 items-start gap-y-10 gap-x-6 md:gap-x-8 lg:gap-x-10",
          footerTopRowGridClass(hasDownload, hasMenus),
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
                !isLanding && "justify-center md:justify-start",
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

        {hasMenus ? (
          <nav
            aria-label="Footer"
            className={cn(
              footerColumnClass,
              "grid min-w-0 items-start gap-x-6 gap-y-10",
              footerMenuGroupGridClass(columns.length),
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
          </nav>
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
