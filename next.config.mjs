/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ✅ Use remotePatterns instead of domains (deprecated)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mrbpxpawmtaomvjbdgwp.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // ✅ Add turbopack config to fix the error
  turbopack: {},
}

export default nextConfig