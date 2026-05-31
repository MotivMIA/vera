import Link from "next/link";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { FOOTER_LEGAL_SLUGS, SOCIAL_LINKS } from "@/lib/brand/social";
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

const linkClassName =
  "text-sm text-muted-foreground transition hover:text-[var(--brand-magenta-bright)]";

const headingClassName =
  "text-sm font-semibold uppercase tracking-wide text-foreground transition hover:text-[var(--brand-magenta-bright)]";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  if (label.startsWith("X")) {
    return <X className="size-4" aria-hidden />;
  }
  if (label.startsWith("Instagram")) {
    return <InstagramIcon className="size-4" />;
  }
  return null;
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-3 md:gap-0 md:py-14">
          <section className="flex flex-col gap-5 md:pr-10 lg:pr-14">
            <BrandLogo href="/" size="sm" showWordmark />
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Creator onboarding, identity verification, and management tools for professional
              creators.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition hover:border-white/20 hover:text-[var(--brand-magenta-bright)]"
                >
                  <SocialIcon label={social.label} />
                </a>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-white/10 pt-10 md:border-l md:border-t-0 md:pl-10 md:pt-0 lg:pl-14">
            <h2 className={headingClassName}>Start onboarding</h2>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Create your account to begin identity verification and access creator management
              tools.
            </p>
            <Button asChild variant="accent" size="sm" className="w-fit">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </section>

          <nav
            aria-label="Legal"
            className="flex flex-col gap-4 border-t border-white/10 pt-10 md:border-l md:border-t-0 md:pl-10 md:pt-0 lg:pl-14"
          >
            <h2 className={headingClassName}>Legal</h2>
            <ul className="flex flex-col gap-3">
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

        <div className="flex flex-col gap-3 border-t border-white/10 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p>© {currentYear} Visual Era. All rights reserved.</p>
          <div className="flex flex-col gap-2 sm:items-end">
            <p className="max-w-md text-pretty leading-5">
              Information on this site is for general purposes only and is not legal or financial
              advice.
            </p>
            <nav aria-label="Footer legal links" className="flex items-center gap-3">
              {footerLegalLinks.map((doc, index) => (
                <span key={doc.slug} className="inline-flex items-center gap-3">
                  {index > 0 ? <span aria-hidden className="text-white/20">|</span> : null}
                  <Link href={`/legal/${doc.slug}`} className={linkClassName}>
                    {doc.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
