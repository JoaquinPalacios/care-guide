import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.localhost"],
  serverExternalPackages: [
    "nodemailer",
    "jsdom",
    "dompurify",
    "@aws-sdk/client-s3",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
