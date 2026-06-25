import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  reactCompiler: true,
  reactStrictMode: false,
  typedRoutes: true,
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@anthropic-ai/sdk",
    "cheerio",
    "robots-parser",
    "sitemapper",
    "text-readability",
    "@vercel/blob",
    "workflow",
  ],
};

export default withWorkflow(nextConfig);
