import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://cosmic.dev', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://cosmic.dev/#features', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://cosmic.dev/#pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://cosmic.dev/#contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];
}
