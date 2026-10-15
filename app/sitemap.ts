import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kamyarkamali.ir"
).replace(/\/+$/, "");

const pages = [
  {
    path: "",
    priority: 1,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/projects",
    priority: 0.9,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/services",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/contact",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const faUrl = `${siteUrl}/fa${page.path}`;
    const enUrl = `${siteUrl}/en${page.path}`;

    return (["fa", "en"] as const).map((locale) => ({
      url: locale === "fa" ? faUrl : enUrl,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          fa: faUrl,
          en: enUrl,
        },
      },
    }));
  });
}
