/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow accessing dev assets from LAN IP seen in logs
    // Cross origin request detected from 192.168.56.1 to /_next/* resource
    allowedDevOrigins: ['http://192.168.56.1:3000'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
