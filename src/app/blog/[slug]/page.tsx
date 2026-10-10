import React from 'react';
import { notFound } from 'next/navigation';
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
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
