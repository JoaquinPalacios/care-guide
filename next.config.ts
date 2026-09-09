import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.localhost"],
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
