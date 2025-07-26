
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚀 This allows production builds to pass ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
