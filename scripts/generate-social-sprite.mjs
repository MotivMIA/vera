#!/usr/bin/env node
/**
 * Generates public/social-sprite.svg from Simple Icons (simple-icons package).
 * Icon list: lib/brand/site-social-icons.ts
 * Run: npm run sprites:social
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as simpleIcons from "simple-icons";
import { SITE_SOCIAL_ICON_MAP } from "../lib/brand/site-social-icons.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_PATH = join(ROOT, "public", "social-sprite.svg");
const REPORT_PATH = join(ROOT, "docs", "social-sprite-report.json");

/** Build slug → icon index from package exports */
function buildSlugIndex() {
  const index = new Map();
  for (const key of Object.keys(simpleIcons)) {
    if (!key.startsWith("si")) continue;
    const icon = simpleIcons[key];
    if (icon?.slug && icon.path) {
      index.set(icon.slug, icon);
    }
  }
  return index;
}

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSymbol(id, icon) {
  const pathD = escapeXml(icon.path.trim());
  return `  <symbol id="${id}" viewBox="0 0 24 24">\n    <path fill="currentColor" d="${pathD}"/>\n  </symbol>`;
}

async function main() {
  const slugIndex = buildSlugIndex();
  const generated = [];
  const missing = [];
  const symbols = [];

  for (const [id, { slug, label }] of Object.entries(SITE_SOCIAL_ICON_MAP)) {
    const icon = slugIndex.get(slug);
    if (!icon) {
      missing.push({ id, slug });
      console.warn(
        `[sprites:social] Missing icon: id="${id}" (simple-icons slug "${slug}" not found)`,
      );
      continue;
    }
    symbols.push(buildSymbol(id, icon));
    generated.push({ id, slug, title: icon.title ?? label });
  }

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
    symbols.join("\n"),
    "</svg>",
    "",
  ].join("\n");

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, svg, "utf8");

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  const requested = Object.keys(SITE_SOCIAL_ICON_MAP).length;
  const report = {
    generatedAt: new Date().toISOString(),
    package: "simple-icons",
    config: "lib/brand/site-social-icons.ts",
    output: "public/social-sprite.svg",
    requested,
    generated: generated.length,
    missing: missing.length,
    icons: generated,
    missingIcons: missing,
  };
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `[sprites:social] Wrote ${OUTPUT_PATH} — ${generated.length}/${requested} symbols, ${missing.length} missing`,
  );
  if (missing.length > 0) {
    console.log(
      `[sprites:social] Missing: ${missing.map((m) => m.id).join(", ")}`,
    );
    console.log(`[sprites:social] Report: docs/social-sprite-report.json`);
  }

  process.exitCode = missing.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error("[sprites:social] Failed:", err);
  process.exit(1);
});
