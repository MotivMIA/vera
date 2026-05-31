import Link from "next/link";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-5 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-xs text-muted-foreground/80">© {new Date().getFullYear()} Visual Era</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link
            href="/legal"
            className="text-muted-foreground transition hover:text-[var(--brand-magenta-bright)]"
          >
            Legal
          </Link>
          {LEGAL_DOCUMENTS.map((doc) => (
            <Link
              key={doc.slug}
              href={`/legal/${doc.slug}`}
              className="text-muted-foreground transition hover:text-[var(--brand-magenta-bright)]"
            >
              {doc.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
