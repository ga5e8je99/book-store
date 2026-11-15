/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['bcryptjs'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

