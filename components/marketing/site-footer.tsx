import { getTranslations } from "next-intl/server";
import { AppStoreBadges } from "@/components/marketing/app-store-badges";
import { FooterDisclaimerRow } from "@/components/marketing/footer-disclaimer-row";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { APP_STORE_LINKS } from "@/lib/brand/app";
import { FOOTER_LEGAL_SLUGS, SOCIAL_LINKS } from "@/lib/brand/social";
import { contentShellClass } from "@/lib/brand/theme-classes";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

const linkClassName =
  "text-fluid-small text-muted-foreground transition hover:text-link-hover";

const headingClassName =
  "text-fluid-small font-semibold uppercase tracking-wide text-foreground transition hover:text-link-hover";

const footerMainClassName =
  "flex flex-row flex-wrap items-start justify-center gap-x-12 gap-y-10 py-12 md:py-14 lg:gap-x-16 xl:gap-x-20";

const footerColumnClassName =
  "flex flex-col items-center gap-4 text-center sm:items-start sm:text-left";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  const footerLegalLinks = FOOTER_LEGAL_SLUGS.map((slug) => {
    const doc = LEGAL_DOCUMENTS.find((entry) => entry.slug === slug);
    if (!doc) {
      throw new Error(`Missing footer legal document: ${slug}`);
    }
    const label = slug === "terms" ? t("terms") : t("privacy");
    return { ...doc, label };
  });

  return (
    <footer className="border-t border-border-default">
      <div className={cn(contentShellClass, "px-5 md:px-8")}>
        <div className={footerMainClassName}>
          <section className={`${footerColumnClassName} w-full max-w-xs sm:w-56 lg:w-60`}>
            <div className="flex justify-center sm:justify-start">
              <Link href="/" className="inline-flex rounded-lg transition-opacity hover:opacity-90">
                <BrandLogo size="sm" showWordmark />
              </Link>
            </div>
            <p className="text-fluid-small leading-fluid-body text-muted-foreground">
              {t("description")}
            </p>
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-lg transition hover:opacity-90"
                >
                  <SocialSpriteIcon variant={social.icon} className="size-7" />
                </a>
              ))}
            </div>
          </section>

          <section className={`${footerColumnClassName} w-full max-w-[12rem] sm:w-36`}>
            <h2 className={headingClassName}>{t("startOnboarding")}</h2>
            <Button asChild variant="accent" size="sm" className="w-fit">
              <Link href="/sign-up">{t("getStarted")}</Link>
            </Button>
          </section>

          <section
            aria-labelledby="footer-app-heading"
            className={`${footerColumnClassName} w-full max-w-md sm:w-72 lg:w-80`}
          >
            <h2 id="footer-app-heading" className={headingClassName}>
              {t("downloadApp")}
            </h2>
            <p className="font-serif text-fluid-small leading-fluid-body text-muted-foreground">
              {t("appTagline")}
            </p>
            <div className="flex justify-center sm:justify-start">
              <AppStoreBadges links={APP_STORE_LINKS} />
            </div>
          </section>

          <nav
            aria-label={t("legal")}
            className={`${footerColumnClassName} w-full max-w-[10rem] sm:w-32`}
          >
            <h2 className={headingClassName}>{t("legal")}</h2>
            <ul className="flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
              {footerLegalLinks.map((doc) => (
                <li key={doc.slug}>
                  <Link href={`/legal/${doc.slug}`} className={linkClassName}>
                    {doc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>

        <div className="border-t border-border-default py-6">
          <FooterDisclaimerRow />
        </div>
      </div>
    </footer>
  );
}
