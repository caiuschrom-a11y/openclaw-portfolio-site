import { MetadataRoute } from "next";
import { loadAllProducts } from "@/lib/products";

const SITE_URL = "https://portfolio-site-beta-swart-35.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = loadAllProducts();
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
