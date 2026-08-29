/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@gcc-portal/contracts"],
};

module.exports = nextConfig;