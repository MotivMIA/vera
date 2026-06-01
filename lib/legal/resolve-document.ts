import type { LegalBlock, LegalDocument } from "@/lib/legal/documents";
import { isLegalSlug } from "@/lib/legal/documents";

type LegalDocumentMessages = {
  title: string;
  description: string;
  lastUpdated: string;
  blocks: LegalBlock[];
};

function isLegalBlock(value: unknown): value is LegalBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as { type?: string };
  if (block.type === "paragraph" || block.type === "heading") {
    return typeof (value as { text?: unknown }).text === "string";
  }
  if (block.type === "list") {
    const items = (value as { items?: unknown }).items;
    return Array.isArray(items) && items.every((item) => typeof item === "string");
  }
  return false;
}

function isLegalDocumentMessages(value: unknown): value is LegalDocumentMessages {
  if (!value || typeof value !== "object") return false;
  const doc = value as LegalDocumentMessages;
  return (
    typeof doc.title === "string" &&
    typeof doc.description === "string" &&
    typeof doc.lastUpdated === "string" &&
    Array.isArray(doc.blocks) &&
    doc.blocks.every(isLegalBlock)
  );
}

/** Builds a typed legal document from next-intl `Legal.documents.{slug}` messages. */
export function resolveLegalDocument(slug: string, raw: unknown): LegalDocument | null {
  if (!isLegalSlug(slug) || !isLegalDocumentMessages(raw)) {
    return null;
  }
  return { slug, ...raw };
}
