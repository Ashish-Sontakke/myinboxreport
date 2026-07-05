import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // No backend by design — everything runs client-side.
  output: "export",
  // Emit app/index.html so Cloudflare Pages can serve /app/ without
  // conflicting with the RSC payload directory Next also writes under app/.
  trailingSlash: true,
}

export default nextConfig
