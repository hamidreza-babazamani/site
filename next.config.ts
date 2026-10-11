import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const remoteMedia = [process.env.R2_PUBLIC_URL, process.env.IMAGEKIT_URL_ENDPOINT]
  .flatMap((mediaUrl) => {
    if (!mediaUrl) return [];
    try {
      const url = new URL(mediaUrl);
      return [{
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: `${url.pathname.replace(/\/$/, "")}/**`,
      }];
    } catch {
      return [];
    }
  });

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
