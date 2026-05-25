/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {
      enabled: false,
    },
  },
}

module.exports = nextConfig