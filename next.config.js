/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  exportPathMap: async () => ({
    '/': { page: '/' },
  }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
