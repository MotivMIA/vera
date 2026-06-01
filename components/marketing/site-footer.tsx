import Link from "next/link";
import { AppStoreBadges } from "@/components/marketing/app-store-badges";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { APP_FOOTER_TAGLINE, APP_STORE_LINKS } from "@/lib/brand/app";
import { FOOTER_LEGAL_SLUGS, SOCIAL_LINKS } from "@/lib/brand/social";
import { cn } from "@/lib/utils";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

const FOOTER_LEGAL_LABELS: Record<(typeof FOOTER_LEGAL_SLUGS)[number], string> = {
  terms: "Terms",
  privacy: "Privacy",
};

const footerLegalLinks = FOOTER_LEGAL_SLUGS.map((slug) => {
  const doc = LEGAL_DOCUMENTS.find((entry) => entry.slug === slug);
  if (!doc) {
    throw new Error(`Missing footer legal document: ${slug}`);
  }
  return { ...doc, label: FOOTER_LEGAL_LABELS[slug] };
});

const linkClassName = "text-sm text-muted-foreground transition hover:text-link-hover";

const headingClassName = cn(
  "text-sm font-semibold uppercase tracking-wide text-foreground transition",
  "hover:text-link-hover",
);

const footerMainClassName =
  "flex flex-row flex-wrap items-start justify-center gap-x-12 gap-y-10 py-12 md:py-14 lg:gap-x-16 xl:gap-x-20";

const footerColumnClassName =
  "flex flex-col items-center gap-4 text-center sm:items-start sm:text-left";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-default">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className={footerMainClassName}>
          <section className={`${footerColumnClassName} w-full max-w-xs sm:w-56 lg:w-60`}>
            <div className="flex justify-center sm:justify-start">
              <BrandLogo href="/" size="sm" showWordmark />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Creator onboarding, identity verification, and management tools for professional
              creators.
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
            <h2 className={headingClassName}>Start onboarding</h2>
            <Button asChild variant="accent" size="sm" className="w-fit">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </section>

          <section
            aria-labelledby="footer-app-heading"
            className={`${footerColumnClassName} w-full max-w-md sm:w-72 lg:w-80`}
          >
            <h2 id="footer-app-heading" className={headingClassName}>
              Download our free app
            </h2>
            <p className="font-serif text-sm leading-6 text-muted-foreground">{APP_FOOTER_TAGLINE}</p>
            <div className="flex justify-center sm:justify-start">
              <AppStoreBadges links={APP_STORE_LINKS} />
            </div>
          </section>

          <nav
            aria-label="Legal"
            className={`${footerColumnClassName} w-full max-w-[10rem] sm:w-32`}
          >
            <h2 className={headingClassName}>Legal</h2>
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

        <div className="border-t border-border-default py-5">
          <p className="flex flex-row flex-wrap justify-center items-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground md:flex-nowrap">
            <span>© {currentYear} All rights reserved.</span>
            <span aria-hidden>·</span>
            <span>
              Information on this site is for general purposes only and is not legal or financial
              advice.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
