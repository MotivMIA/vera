import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { routing } from "@/i18n/routing";
import { getLegalDocument, getLegalSlugs } from "@/lib/legal/documents";

type LegalPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getLegalSlugs().map((slug) => ({ locale, slug })),
  );
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const document = getLegalDocument(slug);
  if (!document) {
    notFound();
  }

  const t = await getTranslations("Legal");

  return (
    <main className="min-h-screen">
      <LegalDocumentView document={document} />
      <div className="mx-auto max-w-3xl px-5 pb-10 md:px-8">
        <Link href="/legal" className="text-sm text-accent hover:underline">
          {t("allDocuments")}
        </Link>
      </div>
    </main>
  );
}
