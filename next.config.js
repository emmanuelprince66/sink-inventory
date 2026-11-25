/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Add this to prevent double-mounting issues with camera
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sync360-bucket.s3.amazonaws.com",
        // hostname: "sync-bck-new.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Add camera permissions policy for all routes
  async headers() {
    return [
      // Camera permissions for all pages
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*",
          },
        ],
      },
      // Loaded into the service worker: always re-checked, so a deploy reaches
      // tills on their next visit.
      {
        source: "/offline-sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      // Service worker headers
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
