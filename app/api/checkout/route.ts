import { NextRequest, NextResponse } from "next/server";

// Forward checkout requests to the unified-router. The router does
// the actual Stripe Checkout Session creation and returns the URL.
const ROUTER = process.env.ROUTER_URL || "http://localhost:8090";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  let tier = req.nextUrl.searchParams.get("tier");
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  // If no tier was specified, pick the first tier the router knows about for
  // this product. Avoids 404 on products that don't have a "Starter" SKU.
  if (!tier) {
    try {
      const r = await fetch(`${ROUTER}/v1/products`);
      if (r.ok) {
        const d = await r.json();
        const match = (d.products || []).find((p: { slug: string }) => p.slug === slug);
        if (match) {
          const rest = (match.name as string).replace(slug, "").trim();
          tier = rest.split(/\s+/)[0] || "Starter";
        }
      }
    } catch {
      /* fall through */
    }
    if (!tier) tier = "Starter";
  }

  const email = req.nextUrl.searchParams.get("email") || "";
  // Omit customer_email when empty — Stripe Checkout will collect it
  // on the hosted page. Sending "" 400s on Stripe's side.
  const body: Record<string, unknown> = {};
  if (email) body.customer_email = email;

  let upstreamStatus = 0;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${ROUTER}/v1/checkout/${encodeURIComponent(slug)}/${encodeURIComponent(tier)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      upstreamStatus = r.status;
      if (!r.ok) {
        lastErr = await r.text();
        if (r.status >= 400 && r.status < 500) break; // don't retry 4xx
        continue;
      }
      const data = await r.json();
      if (data.checkout_url) return NextResponse.redirect(data.checkout_url);
      return NextResponse.json(data);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return NextResponse.json(
    { error: "checkout failed after retries", upstreamStatus, detail: lastErr.slice(0, 500) },
    { status: 502 },
  );
}
