/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://kamyarkamali.ir",

  generateRobotsTxt: true,

  sitemapSize: 5000,

  exclude: ["/api/*"],

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
      },
    ],

    additionalSitemaps: ["https://kamyarkamali.ir/sitemap-0.xml"],
  },
};
