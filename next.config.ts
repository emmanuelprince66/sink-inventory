/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Change to true if you want to allow build with TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Change to true if you want to allow build with ESLint errors
  },
  images: {
    domains: ["sync-bck.s3.amazonaws.com"],
  },
};

export default nextConfig;
