import { AppStoreBadges } from "@/components/marketing/app-store-badges";
import { FooterDisclaimerRow } from "@/components/marketing/footer-disclaimer-row";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import { BrandLogo } from "@/components/brand/brand-logo";
import { APP_STORE_LINKS } from "@/lib/brand/app";
import type { SocialLink } from "@/lib/brand/social";
import { marketingFooterMarkClass } from "@/lib/brand/light-themes";
import { contentShellClass } from "@/lib/brand/theme-classes";
import {
  footerBrandCellClass,
  footerBrandGridClass,
  footerBrandSocialClass,
  footerDownloadBadgesClass,
  footerDownloadCellClass,
  footerDownloadGridClass,
  footerMainBandClass,
  footerMenuNavClass,
  footerMenusGridClass,
} from "@/lib/marketing/footer-grid";
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

const footerMenuColumnClass = "min-w-max shrink-0";
const footerMenuLabelClass = "whitespace-nowrap";

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

  const disclaimerColumnCount: 1 | 2 | 3 = showLanguageSelector ? 3 : 2;

  const mainBandClass =
    hasMenus || hasDownload ? footerMainBandClass : "grid min-w-0 grid-cols-1";

  const body = (
    <div className="flex min-w-0 flex-col gap-y-10 md:gap-y-12">
      <div className={mainBandClass}>
        <div className={cn(footerBrandCellClass, footerBrandGridClass)}>
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
            <div className={footerBrandSocialClass}>
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
          <div
            id="download"
            className={cn(footerDownloadCellClass, footerDownloadGridClass)}
          >
            <p className={cn(columnHeadingClass, "w-full")}>{appSection.title}</p>
            <div className={footerDownloadBadgesClass}>
              <AppStoreBadges
                links={APP_STORE_LINKS}
                size="sm"
                layout="row"
                className="min-w-0 items-center justify-center sm:justify-start"
              />
            </div>
          </div>
        ) : null}

        {hasMenus ? (
          <div className={footerMenusGridClass}>
            <nav aria-label="Footer" className={cn(footerMenuNavClass, "overflow-x-auto")}>
              {columns.map((col) => (
                <div key={col.title} className={footerMenuColumnClass}>
                  <p className={cn(columnHeadingClass, footerMenuLabelClass)}>{col.title}</p>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((link) => (
                      <li key={`${col.title}-${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className={cn(columnLinkClass, footerMenuLabelClass)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "border-t pt-9 md:pt-10",
          isLanding ? "border-[var(--landing-border)]" : "border-border-default",
        )}
      >
        <FooterDisclaimerRow
          variant={variant}
          columnCount={disclaimerColumnCount}
          disclaimer={disclaimer}
          copyright={copyright}
          legal={legal}
          showLanguageSelector={showLanguageSelector}
        />
      </div>
    </div>
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
