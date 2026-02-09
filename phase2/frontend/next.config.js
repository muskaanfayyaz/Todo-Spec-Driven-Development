const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@phase3/frontend'] = path.resolve(__dirname, '../../phase3/frontend');
    return config;
  },
}

module.exports = nextConfig
