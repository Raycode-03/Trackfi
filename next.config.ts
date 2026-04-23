import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com'
      },
       {
        protocol: 'https',
        hostname: 'assets.trustwallet.com'
      },
       {
        protocol: 'https',
        hostname: 'assets.coingecko.com'
      },
    ],
  },
  webpack: (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
  }
  return config
}
};

export default nextConfig;