import Link from "next/link";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Visual Era</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Creator onboarding, identity verification, and management tools.
          </p>
        </div>
        <nav className="grid gap-2 sm:grid-cols-2">
          <Link href="/legal" className="text-sm text-muted-foreground hover:text-foreground">
            Legal hub
          </Link>
          {LEGAL_DOCUMENTS.map((doc) => (
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
