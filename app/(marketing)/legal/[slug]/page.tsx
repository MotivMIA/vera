import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { getLegalDocument, getLegalSlugs } from "@/lib/legal/documents";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getLegalSlugs().map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const document = getLegalDocument(slug);
  if (!document) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <LegalDocumentView document={document} />
      <div className="mx-auto max-w-3xl px-5 pb-10 md:px-8">
        <Link href="/legal" className="text-sm text-accent hover:underline">
          All legal documents
        </Link>
      </div>
    </main>
  );
}
