import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sreeharirealty.com';

// Fallback project slugs if API is temporarily unavailable during build
const FALLBACK_PROJECT_SLUGS = ['park-avenue', 'sri-amman-nagar', 'aishwarya-nagar'];
const FALLBACK_BLOG_SLUGS = [
  'why-investing-in-gated-plots-beats-apartments-in-2026',
  'essential-checklist-for-buying-dtcp-rera-approved-plots',
  'how-infrastructure-drives-plot-appreciation-in-developing-corridors'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static Public Routes (CRM /nimda strictly excluded)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/properties`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
    },
    {
      url: `${SITE_URL}/sitemap`,
      lastModified: now,
    },
  ];

  // Dynamic Projects
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projRes = await api.getPublicProjects();
    const projects = Array.isArray(projRes?.data) ? projRes.data : [];

    if (projects.length > 0) {
      projectRoutes = projects
        .filter((p: any) => p.slug && p.status !== 'Draft' && p.status !== 'Deleted')
        .map((p: any) => ({
          url: `${SITE_URL}/properties/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : now),
        }));
    } else {
      projectRoutes = FALLBACK_PROJECT_SLUGS.map((slug) => ({
        url: `${SITE_URL}/properties/${slug}`,
        lastModified: now,
      }));
    }
  } catch {
    projectRoutes = FALLBACK_PROJECT_SLUGS.map((slug) => ({
      url: `${SITE_URL}/properties/${slug}`,
      lastModified: now,
    }));
  }

  // Dynamic Blogs
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogRes = await api.getPublicBlogs();
    const blogs = Array.isArray(blogRes?.data) ? blogRes.data : [];

    if (blogs.length > 0) {
      blogRoutes = blogs
        .filter((b: any) => b.slug && b.status === 'Published')
        .map((b: any) => ({
          url: `${SITE_URL}/blog/${b.slug}`,
          lastModified: b.updated_at ? new Date(b.updated_at) : (b.created_at ? new Date(b.created_at) : now),
        }));
    } else {
      blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: now,
      }));
    }
  } catch {
    blogRoutes = FALLBACK_BLOG_SLUGS.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
    }));
  }

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
