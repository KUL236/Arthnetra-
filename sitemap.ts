import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://arthnetra.netlify.app';
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/markets`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/invest`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/simulator`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/ai-mentor`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/auth`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
