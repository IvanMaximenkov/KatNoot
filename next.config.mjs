/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.geojson$/,
      type: "json"
    });
    return config;
  }
};

export default nextConfig;
