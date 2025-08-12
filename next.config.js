/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remove the entire eslint block
  //
  images: {
    remotePatterns: [new URL("https://sync-bck-new.s3.amazonaws.com/**")],
  },
};

export default nextConfig;
