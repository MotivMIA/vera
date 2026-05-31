import Link from "next/link";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
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
    <footer className="border-t border-white/10 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <BrandLogo href="/" size="sm" showWordmark />

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="max-w-sm text-sm text-muted-foreground">
            Creator onboarding, identity verification, and management tools.
          </p>

          <nav aria-label="Legal" className="flex flex-wrap items-center gap-y-2">
            {footerLegalLinks.map((doc, index) => (
              <span key={doc.slug} className="inline-flex items-center">
                {index > 0 ? (
                  <span className="px-2 text-muted-foreground/40" aria-hidden>
                    |
                  </span>
                ) : null}
                <Link href={`/legal/${doc.slug}`} className={linkClassName}>
                  {doc.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

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

        <div className="space-y-1 text-xs text-muted-foreground/80">
          <p>© {currentYear} Visual Era. All rights reserved.</p>
          <p>
            Visual Era provides creator management services. Information on this site is not legal
            or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
