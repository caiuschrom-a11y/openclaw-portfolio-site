// Walks the sibling product directories and emits data/products.json so the
// Next.js build can render every product page without filesystem access to
// the parent monorepo. Run automatically by `prebuild` before `next build`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_ROOT = path.resolve(__dirname, "..");
const MONOREPO_ROOT = path.resolve(SITE_ROOT, "..");
const OUT_DIR = path.join(SITE_ROOT, "data");
const OUT_FILE = path.join(OUT_DIR, "products.json");

const SKIP = new Set([
  "_shared", "_unified-router", "_portfolio-site", "_onboarding-emails",
  "__pycache__", "node_modules", ".next", ".git",
]);

function firstPitchLine(md) {
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ") && lines[i].toLowerCase().includes("liner")) {
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const t = lines[j].trim();
        if (t) return t;
      }
    }
  }
  for (const l of lines) {
    const t = l.trim();
    if (t && !t.startsWith("#") && !t.startsWith("**")) return t;
  }
  return "";
}

function pricingHint(md) {
  const m = md.match(/\$[0-9][0-9,.\-/\s]+(?:\/(?:mo|month|year|yr))?(?:[\s,]+(?:per|or)[\s\S]{0,40})?/);
  return m ? m[0].trim().replace(/\s+/g, " ").slice(0, 60) : "";
}

// Skip if we're on Vercel (or any CI where the parent monorepo isn't checked
// out). The bundled data/products.json that ships with the deploy is the
// source of truth there — the prebuild only refreshes it during local work.
if (process.env.VERCEL || process.env.CI || !fs.existsSync(MONOREPO_ROOT) ||
    !fs.existsSync(path.join(MONOREPO_ROOT, "coldmail"))) {
  if (fs.existsSync(OUT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"));
    console.log(`[prebuild] using committed products.json (${existing.length} entries) — sibling dirs not present, skipping rebuild`);
    process.exit(0);
  }
  console.warn(`[prebuild] WARNING: no sibling products and no committed products.json — site will be empty`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, "[]", "utf-8");
  process.exit(0);
}

const products = [];
const entries = fs.readdirSync(MONOREPO_ROOT, { withFileTypes: true });
for (const e of entries) {
  if (!e.isDirectory() || SKIP.has(e.name) || e.name.startsWith(".")) continue;
  const readme = path.join(MONOREPO_ROOT, e.name, "README.md");
  if (!fs.existsSync(readme)) continue;
  let md;
  try { md = fs.readFileSync(readme, "utf-8"); } catch { continue; }

  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/—.*/, "").trim() : e.name;

  const launchPath = path.join(MONOREPO_ROOT, e.name, "marketing", "launch.md");
  let launch;
  if (fs.existsSync(launchPath)) {
    try { launch = fs.readFileSync(launchPath, "utf-8"); } catch {}
  }

  products.push({
    slug: e.name,
    title,
    pitch: launch ? firstPitchLine(launch) : firstPitchLine(md),
    pricing: pricingHint(md),
    readmeMarkdown: md,
    launchMarkdown: launch,
  });
}

products.sort((a, b) => a.slug.localeCompare(b.slug));

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(products, null, 2), "utf-8");
console.log(`[prebuild] wrote ${products.length} products to ${path.relative(SITE_ROOT, OUT_FILE)}`);
