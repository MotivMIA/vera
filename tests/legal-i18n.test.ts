import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { getLegalSlugs } from "@/lib/legal/documents";
import { resolveLegalDocument } from "@/lib/legal/resolve-document";

const slugs = getLegalSlugs();

describe("legal document i18n", () => {
  it.each(routing.locales)("loads every legal slug for locale %s", async (locale) => {
    const documents = (await import(`../messages/legal/${locale}.json`)).default;

    for (const slug of slugs) {
      const raw = documents[slug as keyof typeof documents];
      const doc = resolveLegalDocument(slug, raw);
      expect(doc, `${locale}/${slug}`).not.toBeNull();
      expect(doc?.title.length).toBeGreaterThan(0);
      expect(doc?.blocks.length).toBeGreaterThan(0);
    }

    expect(Object.keys(documents).sort()).toEqual([...slugs].sort());
  });

  it("returns null for unknown slugs or malformed messages", () => {
    expect(resolveLegalDocument("unknown", {})).toBeNull();
    expect(resolveLegalDocument("terms", { title: "x" })).toBeNull();
  });
});
