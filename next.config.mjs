/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sic.cultura.gob.mx',
      },
      {
        protocol: 'https',
        hostname: 'cicese.edu.mx',
      },
    ],
  },
};

export default nextConfig;
