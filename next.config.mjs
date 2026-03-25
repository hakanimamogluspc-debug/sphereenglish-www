import { imageHosts } from './image-hosts.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
  },
  async redirects() {
    return [
      {
        // sphereenglish.com → www.sphereenglish.com (SEO canonical redirect)
        source: '/:path*',
        has: [{ type: 'host', value: 'sphereenglish.com' }],
        destination: 'https://www.sphereenglish.com/:path*',
        permanent: true,
      },
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: [/node_modules/],
      use: [{
        loader: '@dhiwise/component-tagger/nextLoader',
      }],
    });
    return config;
  },
};

export default nextConfig;
