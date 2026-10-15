import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kamyarkamali.ir"
).replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/admin/", "/fa/admin/", "/en/admin/"],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
