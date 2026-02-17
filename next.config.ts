import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.maxhub.vercel.app" }],
        destination: "https://maxhub.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
