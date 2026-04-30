import type { Metadata } from "next";

const SITE_URL = "https://portfolio-site-beta-swart-35.vercel.app";
const TITLE = "openclaw — 90 revenue products";
const DESC = "A catalog of 90 narrowly-scoped AI products. MCP servers, B2B SaaS, content factories, compliance tools, e-commerce arbitrage. Pay once or subscribe — instant API key delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: "openclaw",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        margin: 0,
        background: "#0a0a0a",
        color: "#e5e5e5",
        minHeight: "100vh",
      }}>
        <header style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 24px",
          borderBottom: "1px solid #262626",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <a href="/" style={{ textDecoration: "none", color: "#fafafa", fontWeight: 700, fontSize: 18 }}>
            openclaw
          </a>
          <nav style={{ display: "flex", gap: 24 }}>
            <a href="/" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: 14 }}>Catalog</a>
            <a href="https://github.com/caiuschrom-a11y" style={{ color: "#a3a3a3", textDecoration: "none", fontSize: 14 }}>GitHub</a>
          </nav>
        </header>
        {children}
        <footer style={{
          maxWidth: 1200, margin: "60px auto 0", padding: "32px 24px",
          borderTop: "1px solid #262626", color: "#737373", fontSize: 13,
        }}>
          openclaw — 90 product catalog · Built with local Qwen + Claude · 2026
        </footer>
      </body>
    </html>
  );
}
