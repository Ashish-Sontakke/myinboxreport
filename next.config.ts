import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // No backend by design — everything runs client-side.
  output: "export",
}

export default nextConfig
