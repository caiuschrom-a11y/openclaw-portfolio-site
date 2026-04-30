import { loadProduct, loadAllProducts, CATEGORY_LABELS } from "@/lib/products";
import { marked } from "marked";
import { notFound } from "next/navigation";

const ROUTER = process.env.ROUTER_URL || "https://unified-router.vercel.app";

interface RouterSku {
  slug: string;
  name: string;
  description: string;
  pricing_model: string;
  metadata: Record<string, string>;
  price_cents?: number | null;
  currency?: string | null;
  interval?: string | null;
}

interface TierOption {
  label: string;
  description: string;
  pricing_model: string;
  query: string;
  priceLabel: string;
}

function formatPrice(sku: RouterSku): string {
  if (!sku.price_cents) return "";
  const dollars = sku.price_cents / 100;
  const formatted = dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  if (sku.interval === "month") return `${formatted}/mo`;
  if (sku.interval === "year") return `${formatted}/yr`;
  return formatted;
}

async function fetchTiers(slug: string): Promise<TierOption[]> {
  try {
    const r = await fetch(`${ROUTER}/v1/products`, { next: { revalidate: 600 } });
    if (!r.ok) return [];
    const d = (await r.json()) as { products: RouterSku[] };
    return d.products
      .filter((p) => p.slug === slug)
      .map((p) => {
        const rest = p.name.replace(slug, "").trim();
        const tier = rest.split(/\s+/)[0] || "Standard";
        return {
          label: rest || "Standard",
          description: p.description,
          pricing_model: p.pricing_model,
          query: tier,
          priceLabel: formatPrice(p),
        };
      });
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return loadAllProducts().map(p => ({ slug: p.slug }));
}

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = loadProduct(slug);
  if (!product) return {};
  const title = `${product.title} — openclaw`;
  const description = product.pitch || `Buy ${product.title} on openclaw.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = loadProduct(slug);
  if (!product) notFound();

  const readmeHtml = await marked.parse(product.readmeMarkdown);
  const launchHtml = product.launchMarkdown ? await marked.parse(product.launchMarkdown) : null;
  const tiers = await fetchTiers(slug);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <a href="/" style={{ color: "#737373", fontSize: 13, textDecoration: "none" }}>← All products</a>

      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <div style={{
          display: "inline-block", padding: "4px 10px", background: "#171717",
          border: "1px solid #262626", borderRadius: 4, fontSize: 12,
          color: "#a3a3a3", marginBottom: 16,
        }}>
          {CATEGORY_LABELS[product.category]}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>{product.title}</h1>
        {product.pitch && (
          <p style={{ fontSize: 18, color: "#a3a3a3", lineHeight: 1.6 }}>{product.pitch}</p>
        )}

        <div style={{
          marginTop: 24, padding: 20, background: "#0c0c0c",
          border: "1px solid #262626", borderRadius: 6,
        }}>
          {tiers.length > 0 ? (
            <>
              <div style={{ fontSize: 13, color: "#737373", marginBottom: 12 }}>
                {tiers.length === 1 ? "Available plan" : `Choose a plan (${tiers.length})`}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: tiers.length > 1 ? "repeat(auto-fit, minmax(220px, 1fr))" : "1fr", gap: 12, marginBottom: 16 }}>
                {tiers.map((t) => (
                  <a key={t.label} href={`/api/checkout?slug=${product.slug}&tier=${encodeURIComponent(t.query)}`}
                    style={{
                      display: "block", padding: "14px 16px", background: "#171717",
                      color: "#fafafa", textDecoration: "none", borderRadius: 6,
                      border: "1px solid #404040", transition: "border-color .15s",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                      {t.priceLabel && (
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#fafafa" }}>{t.priceLabel}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.4 }}>{t.description}</div>
                    <div style={{ fontSize: 11, color: "#737373", marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {t.pricing_model.replace(/_/g, " ")} · Get plan →
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <a href={`/api/checkout?slug=${product.slug}`}
              style={{
                display: "inline-block", padding: "10px 20px", background: "#fafafa",
                color: "#0a0a0a", textDecoration: "none", borderRadius: 6, fontWeight: 600,
                fontSize: 14, marginRight: 12,
              }}>
              Get started
            </a>
          )}
          <a href={`https://github.com/caiuschrom-a11y/${product.slug}`}
            style={{
              display: "inline-block", padding: "10px 20px", background: "transparent",
              color: "#fafafa", border: "1px solid #404040", textDecoration: "none",
              borderRadius: 6, fontWeight: 600, fontSize: 14,
            }}>
            Source on GitHub
          </a>
        </div>
      </div>

      {launchHtml && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Launch kit</h2>
          <div className="prose" style={{ color: "#d4d4d4", fontSize: 15, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: launchHtml }} />
        </section>
      )}

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Documentation</h2>
        <div className="prose" style={{ color: "#d4d4d4", fontSize: 15, lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: readmeHtml }} />
      </section>
    </main>
  );
}
