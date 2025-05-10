/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remove the entire eslint block
  images: {
    domains: ["sync-bck.s3.amazonaws.com"],
  },
};

export default nextConfig;
