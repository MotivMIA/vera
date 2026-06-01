export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  blocks: LegalBlock[];
};

/** Canonical legal document slugs (URLs stay identical across locales). */
export const LEGAL_SLUGS = [
  "terms",
  "privacy",
  "code-of-conduct",
  "accessibility",
  "dmca",
  "refunds",
  "contact",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function getLegalSlugs(): LegalSlug[] {
  return [...LEGAL_SLUGS];
}
