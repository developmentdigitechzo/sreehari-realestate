'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/data/blogs';
import { properties } from '@/data/properties';
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';

export default function BlogDetailClient({ post }: { post: BlogPost }) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Header & Article Title */}
      <section className="bg-[#fef9e6] border-b border-gray-200/70 py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E43] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Articles
          </Link>

          <div className="space-y-3">
            <span className="bg-[#075E43] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="bold-text text-2xl sm:text-4xl lg:text-5xl text-[#04432F] leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#075E43]" />
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#075E43]" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#075E43]" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Article Content & Sidebar Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Body */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-md">
              <Image src={post.image} alt={post.title} fill priority className="object-cover" />
            </div>

            <div
              className="prose max-w-none text-gray-700 text-xs sm:text-sm leading-relaxed space-y-4 [&>h2]:font-heading-sc [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-[#04432F] [&>h3]:font-heading-sc [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-gray-900 [&>p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Box */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#075E43] text-[#C5A869] flex items-center justify-center font-bold text-base flex-shrink-0">
                SH
              </div>
              <div>
                <h4 className="font-heading-sc text-sm font-bold text-gray-900">
                  {post.author}
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Published by Sree Hari Realty Promoters - Legal & Research Division, specializing in DTCP and RERA gated layouts.
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* CTA Box */}
            <div className="bg-[#075E43] text-white p-6 rounded-2xl shadow-lg space-y-4 text-center">
              <span className="accent-text text-xl text-[#C5A869]">Looking for Land?</span>
              <h3 className="font-heading-sc text-lg font-bold text-white">
                Explore DTCP Approved Villa Plots
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Ready to register gated community plots starting from just ₹9.2 Lakhs with spot registration support.
              </p>
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="w-full bg-white text-[#075E43] font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow hover:bg-gray-100 transition"
              >
                Book Free Site Visit
              </button>
            </div>

            {/* Top Projects List */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 space-y-4">
              <h4 className="font-heading-sc text-xs font-bold uppercase tracking-wider text-gray-800">
                Featured Plotted Projects
              </h4>
              <div className="space-y-3">
                {properties.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.slug}`}
                    className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <Image src={p.heroImage} alt="" fill className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-gray-900 group-hover:text-[#075E43] line-clamp-1">
                        {p.title}
                      </h5>
                      <span className="text-[10px] text-gray-500 block">{p.location}</span>
                      <span className="text-[11px] font-bold text-[#075E43] block">
                        ₹{p.pricePerSqFt} / sq.ft
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        title="Schedule a Site Visit"
      />
    </div>
  );
}
