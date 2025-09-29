/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental.appDir as it's now stable in Next.js 14
  distDir: 'apps/web/dist',
}

module.exports = nextConfig
