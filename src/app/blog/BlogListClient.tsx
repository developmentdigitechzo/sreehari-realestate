'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogPosts as fallbackPosts } from '@/data/blogs';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogListClient() {
  const [blogPosts, setBlogPosts] = useState<any[]>(fallbackPosts);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('http://localhost:5000/api/public/blogs');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
            const mapped = data.data.map((post: any) => ({
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt || '',
              category: post.category || 'Buying Guide',
              readTime: post.read_time || post.readTime || '5 min read',
              date: post.created_at
                ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : post.date || 'Oct 2026',
              author: post.author || 'Sree Hari Research Desk',
              image: post.image_url || post.banner_image || post.image || '/hero_blog.jpg',
              content: post.content || ''
            }));
            setBlogPosts(mapped);
          }
        }
      } catch (err) {
        // Fallback silently remains active
      }
    }

    fetchBlogs();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Page Header WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_blog.jpg"
          alt="Sree Hari Realty Promoters Land Investment Insights"
          fill
          priority
          quality={95}
          className="object-cover object-[70%_center] sm:object-center"
        />

        {/* Balanced Cinematic Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>KNOWLEDGE & INSIGHTS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Land Investment <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Insights</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Equip yourself with comprehensive guides on DTCP approvals, Patta documentation, capital growth corridors, and plot vs apartment ROI calculations.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post: any) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-lg transition flex flex-col h-full group"
            >
              <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#075E43] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {post.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-heading-sc text-lg font-bold text-gray-900 group-hover:text-[#075E43] transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-700">{post.author}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-bold text-[#075E43] group-hover:text-[#04432F] flex items-center gap-1"
                  >
                    Read Article <ArrowRight className="w-3.5 h-3.5 text-[#C5A869]" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
