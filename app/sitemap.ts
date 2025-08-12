import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase-server';
import { collection, getDocs } from 'firebase/firestore';

// Base URL from environment variable or fallback
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rvinman2004.vercel.app';

// Common last modified date
const lastModified = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    // Main pages
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // Auth pages
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Add blog posts (published only)
  try {
    const snap = await getDocs(collection(db, 'blogPosts'));
    snap.forEach((doc) => {
      const d = doc.data() as any;
      if (d?.published === false) return; // skip private
      const createdAt = d?.createdAt?.toDate ? d.createdAt.toDate() : (d?.createdAt ? new Date(d.createdAt) : lastModified);
      urls.push({
        url: `${baseUrl}/blog/${doc.id}`,
        lastModified: createdAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (e) {
    // ignore errors; keep static urls
  }

  return urls;
}
