/**
 * Headless check: HomeBranding motto h1 must use ≤2 lines at key viewports.
 * Usage: node scripts/verify-motto-lines.mjs (dev server on :3001)
 */
import { chromium } from "playwright";

const BASE = process.env.MOTTO_VERIFY_URL ?? "http://localhost:3001/en";

/** Count distinct line tops via per-character Range rects. */
function lineCountScript() {
  const el = document.querySelector("h1.brand-motto, h1.brand-motto--compact");
  if (!el?.firstChild || el.firstChild.nodeType !== Node.TEXT_NODE) return -1;
  const text = el.firstChild;
  const range = document.createRange();
  const tops = new Set();
  for (let i = 0; i < text.length; i++) {
    range.setStart(text, i);
    range.setEnd(text, i + 1);
    const { top, width } = range.getBoundingClientRect();
    if (width > 0) tops.add(Math.round(top));
  }
  return tops.size;
}

const cases = [
  { width: 320, height: 700, selector: "h1.brand-motto--compact", label: "compact 320" },
  { width: 390, height: 844, selector: "h1.brand-motto--compact", label: "compact 390" },
  { width: 430, height: 932, selector: "h1.brand-motto--compact", label: "compact 430" },
  { width: 1024, height: 800, selector: "h1.brand-motto:not(.brand-motto--compact)", label: "full 1024" },
  { width: 1280, height: 800, selector: "h1.brand-motto:not(.brand-motto--compact)", label: "full 1280" },
  { width: 1440, height: 900, selector: "h1.brand-motto:not(.brand-motto--compact)", label: "full 1440" },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

for (const { width, height, label } of cases) {
  await page.setViewportSize({ width, height });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("h1.brand-motto, h1.brand-motto--compact", { timeout: 15_000 });
  const lines = await page.evaluate(lineCountScript);
  const visible = await page.evaluate(() => {
    const compact = document.querySelector("h1.brand-motto--compact");
    const full = document.querySelector("h1.brand-motto:not(.brand-motto--compact)");
    const pick =
      compact && getComputedStyle(compact.closest(".lg\\:hidden") ?? compact).display !== "none"
        ? compact
        : full;
    return pick?.textContent?.trim() ?? "";
  });
  results.push({ label, width, lines, ok: lines > 0 && lines <= 2, text: visible });
}

await browser.close();

console.table(results);
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error("Motto exceeded 2 lines:", failed);
  process.exit(1);
}
console.log("All motto viewports ≤2 lines.");
