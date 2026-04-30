import { ImageResponse } from "next/og";
import { loadProduct } from "@/lib/products";

export const runtime = "edge";
export const alt = "openclaw product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const product = loadProduct(params.slug);
  const title = product?.title || params.slug;
  const pitch = (product?.pitch || "").slice(0, 180);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{
          fontSize: 24, color: "#a3a3a3", letterSpacing: 1, textTransform: "uppercase",
          fontWeight: 700, display: "flex",
        }}>
          openclaw
        </div>
        <div style={{
          marginTop: 64, fontSize: 72, fontWeight: 800, lineHeight: 1.05,
          letterSpacing: -1, display: "flex",
        }}>
          {title}
        </div>
        {pitch && (
          <div style={{
            marginTop: 32, fontSize: 28, color: "#a3a3a3", lineHeight: 1.4,
            display: "flex", maxWidth: 1000,
          }}>
            {pitch}
          </div>
        )}
        <div style={{ flex: 1, display: "flex" }} />
        <div style={{
          fontSize: 22, color: "#737373", borderTop: "1px solid #262626",
          paddingTop: 24, display: "flex", justifyContent: "space-between",
        }}>
          <div>portfolio-site-beta-swart-35.vercel.app</div>
          <div>90 narrowly-scoped revenue products</div>
        </div>
      </div>
    ),
    size,
  );
}
