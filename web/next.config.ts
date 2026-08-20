import type { NextConfig } from "next";

// Patching happens at require time; bundling breaks it.
const OTEL_EXTERNAL_PACKAGES = [
  "@opentelemetry/sdk-node",
  "@opentelemetry/auto-instrumentations-node",
  "@opentelemetry/instrumentation",
];

const nextConfig: NextConfig = {
  serverExternalPackages: OTEL_EXTERNAL_PACKAGES,
};

export default nextConfig;
