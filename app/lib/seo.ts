import type { Metadata } from "next";

export type SiteLocale = "fa" | "en";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://kamyarkamali.ir"
).replace(/\/+$/, "");

export function getLocalizedAlternates(
  locale: SiteLocale,
  pathname = "",
): Metadata["alternates"] {
  const path = pathname ? `/${pathname.replace(/^\/+|\/+$/g, "")}` : "";

  return {
    canonical: `${siteUrl}/${locale}${path}`,

    languages: {
      fa: `${siteUrl}/fa${path}`,
      en: `${siteUrl}/en${path}`,
      "x-default": `${siteUrl}/fa${path}`,
    },
  };
}
