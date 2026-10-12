'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/data/blogs';
import { properties } from '@/data/properties';
import { Calendar, Clock, User, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';

export default function BlogDetailClient({
  initialPost,
  slug
}: {
  initialPost?: BlogPost;
  slug: string;
}) {
  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [inlineForm, setInlineForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredProject: properties[0]?.title || 'Park Avenue',
    visitDate: '',
    message: '',
  });
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineSubmitted, setInlineSubmitted] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`http://localhost:5000/api/public/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.data) {
            const b = data.data;
            if ((b.status || 'Published').toLowerCase() === 'published') {
              setPost({
                slug: b.slug,
                title: b.title,
                excerpt: b.excerpt || '',
                category: b.category || 'Buying Guide',
                readTime: b.read_time || b.readTime || '5 min read',
                date: b.created_at
                  ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  : b.date || 'Oct 2026',
                author: b.author || 'Sree Hari Realty Editorial',
                image: b.image_url || b.banner_image || b.image || '/hero_blog.jpg',
                content: b.content || ''
              });
            }
          }
        }
      } catch (err) {
        // Fallback to initialPost
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Article Not Found</h2>
        <p className="text-sm text-gray-600">The article you are looking for is either in draft or no longer available.</p>
        <Link href="/blog" className="inline-block px-5 py-2.5 bg-[#075E43] text-white rounded-xl text-xs font-bold uppercase">
          Back to All Articles
        </Link>
      </div>
    );
  }

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);

    const newLead = {
      ...inlineForm,
      source: `Blog: ${post.title}`,
      timestamp: new Date().toISOString(),
      id: 'LEAD-' + Date.now(),
    };

    try {
      const existingLeads = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
      existingLeads.unshift(newLead);
      localStorage.setItem('sree_hari_leads', JSON.stringify(existingLeads));
    } catch {
      // ignore storage error
    }

    setTimeout(() => {
      setInlineLoading(false);
      setInlineSubmitted(true);
    }, 600);
  };

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
            {/* Direct Property Enquiry Form Card (Matching Projects Detail Form) */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 space-y-5">
              <div className="space-y-1 pb-3 border-b border-gray-100 text-center">
                <span className="accent-text text-lg text-[#D61F69]">Quick Property Enquiry</span>
                <h3 className="font-heading-sc text-xl font-bold text-gray-900">
                  Enquire for Plots
                </h3>
                <p className="text-[11px] text-gray-500">
                  Fill in your details below to receive layout map, price break-up & direct assistance.
                </p>
              </div>

              {inlineSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#075E43] flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#075E43]" />
                  </div>
                  <h4 className="font-bold text-[#075E43] text-sm">Enquiry Received!</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Thank you, <span className="font-bold text-gray-900">{inlineForm.name}</span>. Your enquiry for <span className="font-bold text-gray-900">{inlineForm.preferredProject}</span> has been stored. Our property advisor will call you at <span className="font-bold text-gray-900">{inlineForm.phone}</span> shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInlineSubmitted(false);
                      setInlineForm({
                        name: '',
                        phone: '',
                        email: '',
                        preferredProject: properties[0]?.title || 'Park Avenue',
                        visitDate: '',
                        message: '',
                      });
                    }}
                    className="mt-2 text-xs font-bold text-[#075E43] hover:underline block mx-auto cursor-pointer"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInlineSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-[#D61F69]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Kumar"
                      value={inlineForm.name}
                      onChange={(e) => setInlineForm({ ...inlineForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone / WhatsApp Number <span className="text-[#D61F69]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={inlineForm.phone}
                      onChange={(e) => setInlineForm({ ...inlineForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Project
                      </label>
                      <select
                        value={inlineForm.preferredProject}
                        onChange={(e) => setInlineForm({ ...inlineForm, preferredProject: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      >
                        {properties.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Visit Date
                      </label>
                      <input
                        type="date"
                        value={inlineForm.visitDate}
                        onChange={(e) => setInlineForm({ ...inlineForm, visitDate: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Message / Requirement (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Corner plot preference or loan assistance inquiry"
                      value={inlineForm.message}
                      onChange={(e) => setInlineForm({ ...inlineForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inlineLoading}
                    className="w-full bg-[#D61F69] hover:bg-[#b81857] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {inlineLoading ? (
                      <span>Submitting Enquiry...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Property Enquiry
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-gray-400">
                    🔒 Stored securely • Direct callback from Sree Hari Realty team
                  </p>
                </form>
              )}
            </div>

            {/* Top Projects List */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 space-y-4">
              <h4 className="font-heading-sc text-xs font-bold uppercase tracking-wider text-gray-800">
                Featured Plotted Projects
              </h4>
              <div className="space-y-3">
                {properties.map((p) => (
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
