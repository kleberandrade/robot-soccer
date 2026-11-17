import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: [
    "@robot-soccer/engine",
    "@robot-soccer/protocol",
    "@robot-soccer/database",
  ],
  poweredByHeader: false,
  outputFileTracingIncludes: { "/docs/*": ["../../docs/articles/**/*.md"] },
};
export default config;
