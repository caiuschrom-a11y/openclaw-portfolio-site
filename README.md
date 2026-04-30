# _portfolio-site — master catalog landing page

Next.js static site that auto-discovers all 90 products by walking sibling
directories at build time. Reads each product's README.md + marketing/launch.md
and generates:

- `/` — homepage with all 90 products grouped by category
- `/products/<slug>` — one page per product (rendered from README + launch)
- `/api/checkout?slug=<slug>` — proxies to the unified-router for Stripe Checkout

## Run locally

```powershell
cd C:\openclaw-products\_portfolio-site
npm install
npm run dev   # http://localhost:3000
```

## Deploy to Vercel

```powershell
npx vercel --prod
```

Set env vars in Vercel:
- `ROUTER_URL` — the unified-router URL (e.g. `https://router.openclaw.dev`)

## Wiring

- The portfolio site is the **storefront** — public-facing
- The unified-router is the **billing brain** — receives the redirect from /api/checkout, creates the Stripe Checkout Session, returns the URL, and handles webhooks
- Stripe handles the actual money + customer collection

```
user clicks "Get started"
    │
    ▼
/api/checkout?slug=<slug>  (Next.js Edge route)
    │ POST
    ▼
unified-router /v1/checkout/<slug>/<tier>
    │
    ▼
Stripe Checkout Session created
    │
    ▼
redirect to Stripe-hosted checkout
    │ payment
    ▼
webhook → unified-router /webhook/stripe → fulfillment
```

## Roadmap
- [ ] Email-form before Stripe Checkout (so we own the lead)
- [ ] Per-product tier picker (Starter/Pro/Enterprise)
- [ ] Sitemap.xml generation
- [ ] OG images per product
- [ ] Newsletter signup at footer
