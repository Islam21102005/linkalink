import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    unoptimized: true, // Отключаем оптимизацию для всех изображений (решает проблемы с загрузкой на мобильных)
  },
};

export default nextConfig;