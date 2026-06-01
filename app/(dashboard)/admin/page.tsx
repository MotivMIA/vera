import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ADMIN_SPEC_URL =
  "https://github.com/natew-dev/vera/blob/main/docs/ADMIN_UI.md";

export default function SiteAdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">Coming soon</Badge>
      <h1 className="text-balance text-4xl font-semibold tracking-normal text-foreground">Site admin</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        Internal tools for marketing copy, locales, footer and navigation, default theme, and legal pages will live
        here. Onboarding and public marketing are unchanged until this module ships.
      </p>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Spec: <code className="text-foreground/90">docs/ADMIN_UI.md</code>
      </p>
      <Button asChild className="mt-8" variant="outline">
        <Link href={ADMIN_SPEC_URL} rel="noopener noreferrer" target="_blank">
          Read admin UI plan
        </Link>
      </Button>
    </main>
  );
}
