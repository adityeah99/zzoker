import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.saavncdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.jiosaavn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'saavn.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'saavn.sumit.co',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
