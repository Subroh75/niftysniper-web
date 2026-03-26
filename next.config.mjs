/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['niftysniper.co', 'localhost:3000'] } },
  images: { domains: ['avatars.githubusercontent.com'] },
}
export default nextConfig
