import Link from "next/link";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FOOTER_LEGAL_SLUGS, SOCIAL_LINKS } from "@/lib/brand/social";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

const footerLegalLinks = FOOTER_LEGAL_SLUGS.map((slug) => {
  const doc = LEGAL_DOCUMENTS.find((entry) => entry.slug === slug);
  if (!doc) {
    throw new Error(`Missing footer legal document: ${slug}`);
  }
  return doc;
});

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
  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <BrandLogo href="/" size="sm" showWordmark />
          <p className="max-w-sm text-sm text-muted-foreground">
            Creator onboarding, identity verification, and management tools.
          </p>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition hover:border-white/20 hover:text-foreground"
              >
                <SocialIcon label={social.label} />
              </a>
            ))}
          </div>
        </div>
        <nav className="grid gap-2 sm:grid-cols-2">
          <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground">
            Legal hub
          </Link>
          {footerLegalLinks.map((doc) => (
            <Link
              key={doc.slug}
              href={`/legal/${doc.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {doc.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
