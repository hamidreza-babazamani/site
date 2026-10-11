/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kamyarkamali.ir",

  generateRobotsTxt: true,

  sitemapSize: 5000,

  exclude: ["/api/*", "/fa/admin", "/fa/admin/*", "/en/admin", "/en/admin/*"],

  alternateRefs: [
    {
      href: "https://kamyarkamali.ir/fa",
      hreflang: "fa",
    },
    {
      href: "https://kamyarkamali.ir/en",
      hreflang: "en",
    },
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/fa/admin", "/en/admin"],
      },
    ],

  },
};
