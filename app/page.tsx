import { loadAllProducts, groupByCategory, CATEGORY_LABELS } from "@/lib/products";
import Link from "next/link";

const ROUTER = process.env.ROUTER_URL || "https://unified-router.vercel.app";

export const revalidate = 600;

interface PaidSku {
  slug: string;
  price_cents: number | null;
  interval: string | null;
}

async function fetchPaidPrices(): Promise<Map<string, { minCents: number; interval: string | null }>> {
  const map = new Map<string, { minCents: number; interval: string | null }>();
  try {
    const r = await fetch(`${ROUTER}/v1/products`, { next: { revalidate: 600 } });
    if (!r.ok) return map;
    const d = (await r.json()) as { products: PaidSku[] };
    for (const p of d.products) {
      if (!p.price_cents) continue;
      const existing = map.get(p.slug);
      if (!existing || p.price_cents < existing.minCents) {
        map.set(p.slug, { minCents: p.price_cents, interval: p.interval });
      }
    }
  } catch {
    /* best effort */
  }
  return map;
}

function formatPriceLabel(p: { minCents: number; interval: string | null }): string {
  const dollars = p.minCents / 100;
  const formatted = dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  if (p.interval === "month") return `from ${formatted}/mo`;
  if (p.interval === "year") return `from ${formatted}/yr`;
  return `from ${formatted}`;
}

export default async function Home() {
  const all = loadAllProducts();
  const grouped = groupByCategory(all);
  const paidPrices = await fetchPaidPrices();
  const categoryOrder = [
    "communication", "developer", "content", "intel", "compliance",
    "ops", "real-estate", "finance", "ecom", "mcp", "service", "smb", "other",
  ];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 12, lineHeight: 1.1 }}>
          {all.length} narrowly-scoped revenue products.
        </h1>
        <p style={{ fontSize: 18, color: "#a3a3a3", maxWidth: 720, lineHeight: 1.6 }}>
          MCP servers, vertical B2B SaaS, content factories, compliance tools,
          niche-aware research products. Most run on local Qwen 30B at $0
          marginal LLM cost; a few use cloud Claude with prompt-cache for
          90%+ margin. Browse the catalog or jump to a category.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {categoryOrder.filter(c => grouped[c]).map(c => (
            <a key={c} href={`#${c}`}
              style={{
                padding: "6px 12px", background: "#171717", border: "1px solid #262626",
                borderRadius: 4, color: "#e5e5e5", textDecoration: "none", fontSize: 13,
              }}>
              {CATEGORY_LABELS[c]} ({grouped[c].length})
            </a>
          ))}
        </div>
      </div>

      {categoryOrder.map(cat => {
        if (!grouped[cat]) return null;
        return (
          <section key={cat} id={cat} style={{ marginBottom: 56 }}>
            <h2 style={{
              fontSize: 22, marginBottom: 16, paddingBottom: 8,
              borderBottom: "1px solid #262626",
            }}>
              {CATEGORY_LABELS[cat]}
              <span style={{ color: "#737373", fontSize: 14, marginLeft: 8, fontWeight: 400 }}>
                {grouped[cat].length}
              </span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {grouped[cat].map(p => {
                const livePrice = paidPrices.get(p.slug);
                return (
                  <Link key={p.slug} href={`/products/${p.slug}`}
                    style={{
                      padding: 16, background: "#171717", border: livePrice ? "1px solid #404040" : "1px solid #262626",
                      borderRadius: 8, textDecoration: "none", color: "#fafafa",
                      transition: "border-color 0.15s", position: "relative",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{p.title}</div>
                      {livePrice && (
                        <div style={{
                          fontSize: 11, color: "#84cc84", background: "#0c1f0c",
                          border: "1px solid #1f3a1f", padding: "2px 6px", borderRadius: 3,
                          fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8,
                        }}>
                          {formatPriceLabel(livePrice)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.5, minHeight: 38 }}>
                      {p.pitch || "—"}
                    </div>
                    {!livePrice && p.pricing && (
                      <div style={{ fontSize: 12, color: "#facc15", marginTop: 10, fontFamily: "monospace" }}>
                        {p.pricing}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
