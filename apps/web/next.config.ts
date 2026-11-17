import type { NextConfig } from "next";
const config: NextConfig = {
  transpilePackages: [
    "@robot-soccer/engine",
    "@robot-soccer/protocol",
    "@robot-soccer/database",
  ],
  poweredByHeader: false,
};
export default config;
