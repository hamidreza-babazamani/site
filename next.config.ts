import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const publicMediaUrl = process.env.R2_PUBLIC_URL;
const remoteMedia = publicMediaUrl
  ? (() => {
      try {
        const url = new URL(publicMediaUrl);
        return [
          {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            port: url.port,
            pathname: `${url.pathname.replace(/\/$/, "")}/**`,
          },
        ];
      } catch {
        return [];
      }
    })()
  : [];

const nextConfig: NextConfig = {
  images: { remotePatterns: remoteMedia },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
