import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared', '@portfolio/ui'],
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