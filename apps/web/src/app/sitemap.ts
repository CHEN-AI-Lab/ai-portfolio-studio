import type { MetadataRoute } from 'next';

const locales = ['zh-CN', 'en'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aicreative.studio';
  const routes: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/works', priority: 0.8 },
    { path: '/about', priority: 0.7 },
  ];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route.priority,
    }))
  );
}