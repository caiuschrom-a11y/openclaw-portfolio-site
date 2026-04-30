import productsJson from "../data/products.json";

export interface ProductInfo {
  slug: string;
  title: string;
  pitch: string;
  category: string;
  pricing: string;
  readmeMarkdown: string;
  launchMarkdown?: string;
}

interface ProductRecord {
  slug: string;
  title: string;
  pitch: string;
  pricing: string;
  readmeMarkdown: string;
  launchMarkdown?: string;
}

const PRODUCTS_DATA = productsJson as ProductRecord[];

const _UNUSED_SKIP = new Set([
  "_shared", "_unified-router", "_portfolio-site", "_onboarding-emails",
  "__pycache__",
]);

const CATEGORY: Record<string, string> = {
  // Cloud-Claude
  coldmail: "communication", "voice-agent-smb": "communication",
  "reply-scorer": "communication", "shopify-support-bot": "communication",
  "meeting-notes-bot": "communication", "email-triage": "communication",
  "codebase-chatbot": "communication",
  // Code
  "code-review-bot": "developer", "doc-generator": "developer",
  "sdk-generator": "developer", "test-gen-service": "developer",
  "fine-tune-svc": "developer", "boilerplate-gen": "developer",
  "code-migrator": "developer", "codebase-security-auditor": "developer",
  // Content
  "seo-factory": "content", "newsletter-engine": "content",
  "kdp-factory": "content", "yt-faceless": "content",
  "linkedin-engine": "content", "etsy-printables": "content",
  "audiobook-factory": "content", "pinterest-factory": "content",
  "prompt-marketplace": "content", "yt-shorts": "content",
  "podcast-network": "content", "kids-stories": "content",
  "reddit-newsletter": "content",
  // Intel
  "pricing-intel": "intel", "brand-monitor": "intel",
  "rfp-grant-scorer": "intel", "ats-fingerprint-intel": "intel",
  "substack-thesis": "intel", "lead-list-builder": "intel",
  "crypto-newsletter": "intel", "review-monitor": "intel",
  "tradeshow-enricher": "intel", "job-intel-dashboard": "intel",
  "salary-data-license": "intel", "feedback-synth": "intel",
  "dao-helper": "intel", "arxiv-digest": "intel",
  "samgov-tracker": "intel", "competitor-matrix": "intel",
  "web-watcher": "intel",
  // Compliance + docs
  "gmb-autoposter": "ops", "section174-tax": "compliance",
  "receipt-bookkeeper": "ops", "chargeback-drafter": "ops",
  "legal-doc-drafter": "compliance", "hipaa-doc-intake": "compliance",
  "section1031-research": "compliance", "ofac-screener": "compliance",
  "ma-diligence": "compliance", "expense-policy": "compliance",
  "compliance-cal": "compliance", "estate-planning": "compliance",
  "legal-doc-reviewer": "compliance", "accounting-letters": "compliance",
  "journalist-toolkit": "compliance",
  // Real estate + finance
  "airbnb-arbitrage": "real-estate", "sports-ev-scanner": "finance",
  "probate-leads": "real-estate", "str-pricer": "real-estate",
  "off-market-finder": "real-estate", "section1031-research-2": "real-estate",
  // Reseller / e-commerce
  "domain-scout": "ecom", "reseller-arbitrage": "ecom",
  "liquidation-roi": "ecom", "dropship-launcher": "ecom",
  "bulk-listing-rewriter": "ecom",
  // MCP
  "mcp-trademark": "mcp", "mcp-patent": "mcp",
  "mcp-faa-notams": "mcp", "mcp-metar-taf": "mcp",
  // Service / packaging / misc
  "resume-service": "service", "dataset-foundry": "service",
  "chrome-ext-shipper": "service", "growth-assets": "service",
  "translation-svc": "service", "synthetic-data-gen": "service",
  "fiverr-gig-package": "service", "data-labeling-svc": "service",
  // SMB tools
  "wedding-bot": "smb", "calendar-cleanup": "ops",
  "saas-renewal-tracker": "ops", "survey-gen": "smb",
  "jd-rewriter": "smb", "lease-abstract": "smb",
  "crypto-tax": "finance", "ai-roadmap": "smb",
};

export const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication & Outreach",
  developer: "Developer Tools",
  content: "Content & Creator",
  intel: "Intelligence & Research",
  compliance: "Compliance & Legal",
  ops: "Business Operations",
  "real-estate": "Real Estate",
  finance: "Finance & Trading",
  ecom: "E-commerce & Reselling",
  mcp: "MCP Servers",
  service: "Services & Infrastructure",
  smb: "SMB Toolkit",
  other: "Other",
};

export function loadAllProducts(): ProductInfo[] {
  return PRODUCTS_DATA
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      pitch: p.pitch,
      category: CATEGORY[p.slug] || "other",
      pricing: p.pricing,
      readmeMarkdown: p.readmeMarkdown,
      launchMarkdown: p.launchMarkdown,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function loadProduct(slug: string): ProductInfo | null {
  return loadAllProducts().find((p) => p.slug === slug) || null;
}

export function groupByCategory(all: ProductInfo[]): Record<string, ProductInfo[]> {
  const grouped: Record<string, ProductInfo[]> = {};
  for (const p of all) {
    grouped[p.category] = grouped[p.category] || [];
    grouped[p.category].push(p);
  }
  return grouped;
}
