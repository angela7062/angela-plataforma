/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hmkuczuoqlawheywrvyq.supabase.co',
      },
    ],
  },
};

export default nextConfig;
