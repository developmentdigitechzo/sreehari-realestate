import React from 'react';
import { blogPosts } from '@/data/blogs';
import BlogDetailClient from './BlogDetailClient';

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialPost = blogPosts.find((p) => p.slug === slug);

  return <BlogDetailClient initialPost={initialPost} slug={slug} />;
}
