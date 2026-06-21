import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared', '@portfolio/ui'],
  webpack: (config) => {
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'i1.hdslb.com',
      },
      {
        protocol: 'http',
        hostname: 'i0.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'djwwsekihbbwdnivimbf.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/zh-CN',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);