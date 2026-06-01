import { getTranslations } from "next-intl/server";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";
import { Link } from "@/i18n/navigation";

export default async function LegalIndexPage() {
  const t = await getTranslations("Legal");

  return (
    <main className="min-h-screen px-5 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
            {t("homeLink")}
          </Link>
          <h1 className="text-4xl font-semibold">{t("indexTitle")}</h1>
          <p className="text-muted-foreground">{t("indexDescription")}</p>
        </header>
        <ul className="space-y-3">
          {LEGAL_DOCUMENTS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/legal/${doc.slug}`}
                className="block rounded-xl border border-white/10 bg-white/[0.035] px-5 py-4 transition hover:border-accent/30"
              >
                <p className="font-medium text-foreground">{doc.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
