import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Add WASM file handling
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Add rule for WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource'
    });

    return config;
  }
};

export default nextConfig;
