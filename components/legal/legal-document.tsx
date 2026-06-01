import { Link } from "@/i18n/navigation";
import type { LegalDocument } from "@/lib/legal/documents";

type LegalDocumentViewProps = {
  document: LegalDocument;
  lastUpdatedLabel: string;
};

export function LegalDocumentView({ document, lastUpdatedLabel }: LegalDocumentViewProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-5 py-12 md:px-8 md:py-16">
      <header className="space-y-4 border-b border-border-default pb-8">
        <Link href="/" className="text-sm font-semibold tracking-wide text-foreground">
          Visual Era
        </Link>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-normal">{document.title}</h1>
          <p className="text-muted-foreground">{document.description}</p>
          <p className="text-sm text-muted-foreground">
            {lastUpdatedLabel} {document.lastUpdated}
          </p>
        </div>
      </header>
      <div className="space-y-6 text-base leading-7 text-muted-foreground">
        {document.blocks.map((block, index) => {
          if (block.type === "heading") {
            return (
              <h2 key={index} className="text-xl font-semibold text-foreground">
                {block.text}
              </h2>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={index} className="list-disc space-y-2 pl-6">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{block.text}</p>;
        })}
      </div>
    </article>
  );
}
