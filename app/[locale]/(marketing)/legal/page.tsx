import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLegalSlugs } from "@/lib/legal/documents";
import { resolveLegalDocument } from "@/lib/legal/resolve-document";

export default async function LegalIndexPage() {
  const t = await getTranslations("Legal");

  const documents = getLegalSlugs()
    .map((slug) => {
      const raw = t.raw(`documents.${slug}`);
      return resolveLegalDocument(slug, raw);
    })
    .filter((doc): doc is NonNullable<typeof doc> => doc !== null);

  return (
    <main className="min-h-screen px-5 py-12 text-foreground md:px-8 md:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
            {t("homeLink")}
          </Link>
          <h1 className="text-4xl font-semibold">{t("indexTitle")}</h1>
          <p className="text-muted-foreground">{t("indexDescription")}</p>
        </header>
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/legal/${doc.slug}`}
                className="block rounded-xl border border-border-default bg-surface-panel px-5 py-4 transition hover:border-border-accent-hover hover:bg-surface-panel-hover"
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
