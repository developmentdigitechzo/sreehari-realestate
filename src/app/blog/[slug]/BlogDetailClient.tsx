'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/data/blogs';
import { properties } from '@/data/properties';
import { Calendar, Clock, User, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';
import { api } from '@/lib/api';

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
    budget: '',
    preferredProject: '',
    visitDate: '',
    visitTime: '',
    message: '',
  });
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineSubmitted, setInlineSubmitted] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await api.getPublicBlogBySlug(slug);
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
                image: b.image_url || b.banner_image || b.image || '',
                content: b.content || ''
              });
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

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);

    try {
      const notesContent = [
        inlineForm.budget ? `Budget: ${inlineForm.budget}` : null,
        inlineForm.message ? `[Blog: ${post.title}] ${inlineForm.message}` : `Enquiry from Blog: ${post.title}`
      ].filter(Boolean).join(' | ');

      if (inlineForm.visitDate) {
        await api.submitPublicSiteVisit({
          customer_name: inlineForm.name,
          customer_phone: inlineForm.phone,
          customer_email: inlineForm.email,
          project_name: inlineForm.preferredProject || 'General Enquiry',
          visit_date: inlineForm.visitDate,
          visit_time: inlineForm.visitTime,
          preferred_plot_size: inlineForm.budget,
          notes: notesContent,
          source: 'Blog Form',
        });
      } else {
        await api.submitPublicLead({
          name: inlineForm.name,
          phone: inlineForm.phone,
          email: inlineForm.email,
          preferred_plot_size: inlineForm.budget,
          message: `[Blog: ${post.title}] Project: ${inlineForm.preferredProject || 'General Enquiry'}. ${inlineForm.budget ? `[Budget: ${inlineForm.budget}] ` : ''}${inlineForm.message || ''}`.trim(),
          source: 'Blog Form',
          visit_date: inlineForm.visitDate,
          visit_time: inlineForm.visitTime,
        });
      }

      const newLead = {
        ...inlineForm,
        source: 'Blog Form',
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

      setInlineSubmitted(true);
    } catch (err) {
      console.error('Blog inline submit error:', err);
    } finally {
      setInlineLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fef9e6] font-sans space-y-12 pb-16">
      {/* 1. Header & Article Title */}
      <section className="bg-[#fef9e6] border-b border-amber-200/70 py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006452] hover:text-[#D61F69] hover:underline uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Articles
          </Link>

          <div className="space-y-3">
            <span className="bg-[#006452] text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="bold-text text-2xl sm:text-4xl lg:text-5xl text-[#006452] leading-tight font-black tracking-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#006452]" />
                {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#006452]" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#006452]" />
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
            {post.image && post.image.trim() !== '' && (
              <div className="relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-md">
                <Image src={post.image} alt={post.title} fill priority className="object-cover" />
              </div>
            )}

            <div
              className="prose max-w-none text-gray-800 text-xs sm:text-sm leading-relaxed space-y-4
                [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:text-[#006452] [&>h1]:tracking-tight [&>h1]:mt-6 [&>h1]:mb-3
                [&>h2]:text-2xl [&>h2]:font-extrabold [&>h2]:text-[#006452] [&>h2]:tracking-tight [&>h2]:mt-5 [&>h2]:mb-2.5
                [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#006452] [&>h3]:mt-4 [&>h3]:mb-2
                [&>h4]:text-lg [&>h4]:font-bold [&>h4]:text-slate-900 [&>h4]:mt-3.5 [&>h4]:mb-1.5
                [&>h5]:text-base [&>h5]:font-bold [&>h5]:text-slate-900 [&>h5]:mt-3 [&>h5]:mb-1
                [&>h6]:text-sm [&>h6]:font-bold [&>h6]:text-slate-900 [&>h6]:mt-2.5 [&>h6]:mb-1
                [&>p]:leading-relaxed [&>p]:text-slate-700
                [&>blockquote]:border-l-4 [&>blockquote]:border-[#006452] [&>blockquote]:bg-[#006452]/5 [&>blockquote]:py-3 [&>blockquote]:px-4 [&>blockquote]:italic [&>blockquote]:rounded-r-xl [&>blockquote]:my-4 [&>blockquote]:text-slate-800
                [&_strong]:font-bold [&_strong]:text-slate-900
                [&_b]:font-bold [&_b]:text-slate-900
                [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-slate-300 [&_table]:my-4 [&_table]:text-xs sm:[&_table]:text-sm
                [&_thead]:bg-slate-100
                [&_th]:border [&_th]:border-slate-300 [&_th]:p-3 [&_th]:font-bold [&_th]:text-[#006452] [&_th]:text-left
                [&_td]:border [&_td]:border-slate-300 [&_td]:p-3 [&_td]:text-slate-700
                [&_tr:nth-child(even)]:bg-slate-50/60
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3
                [&_li]:text-slate-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#006452] text-[#f7db49] flex items-center justify-center font-bold text-base flex-shrink-0">
                SH
              </div>
              <div>
                <h4 className="font-heading-sc text-sm font-extrabold text-[#006452]">
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
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 rounded-3xl shadow-xs border border-pink-200/80 space-y-5">
              <div className="space-y-1 pb-3 border-b border-pink-100 text-center">
                <span className="accent-text text-lg text-[#D61F69]">Quick Property Enquiry</span>
                <h3 className="font-heading-sc text-xl font-extrabold text-[#006452]">
                  Enquire for Plots
                </h3>
                <p className="text-[11px] text-gray-500">
                  Fill in your details below to receive layout map, plot dimensions & direct assistance.
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
                        budget: '',
                        preferredProject: '',
                        visitDate: '',
                        visitTime: '',
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
                        Preferred Budget
                      </label>
                      <select
                        value={inlineForm.budget}
                        onChange={(e) => setInlineForm({ ...inlineForm, budget: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      >
                        <option value="">Select Budget</option>
                        <option value="Under 15 Lakhs">Under ₹15 Lakhs</option>
                        <option value="15 - 25 Lakhs">₹15L - ₹25 Lakhs</option>
                        <option value="25 - 40 Lakhs">₹25L - ₹40 Lakhs</option>
                        <option value="Above 40 Lakhs">₹40 Lakhs & Above</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Project
                      </label>
                      <select
                        value={inlineForm.preferredProject}
                        onChange={(e) => setInlineForm({ ...inlineForm, preferredProject: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      >
                        <option value="">Select Project</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Preferred Visit Time
                      </label>
                      <input
                        type="time"
                        value={inlineForm.visitTime}
                        onChange={(e) => setInlineForm({ ...inlineForm, visitTime: e.target.value })}
                        className="w-full px-2.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#D61F69] focus:ring-1 focus:ring-[#D61F69] outline-none transition bg-gray-50 focus:bg-white text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Message / Requirement
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
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 rounded-3xl border border-amber-100/90 shadow-xs space-y-4">
              <h4 className="font-heading-sc text-xs font-black uppercase tracking-wider text-[#006452]">
                Featured Plotted Projects
              </h4>
              <div className="space-y-3">
                {properties.map((p) => (
                  <Link
                    key={p.id}
                    href={`/properties/${p.slug}`}
                    className="flex items-center gap-3 group p-2 rounded-2xl hover:bg-amber-50/50 border border-transparent hover:border-amber-100 transition duration-200"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-amber-100">
                      <Image src={p.heroImage} alt="" fill className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-[#006452] group-hover:text-[#D61F69] line-clamp-1 transition-colors">
                        {p.title}
                      </h5>
                      <span className="text-[10px] text-gray-500 block">{p.location}</span>
                      <span className="text-[11px] font-bold text-[#006452] block">
                        Price on Request
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
        source="Blog Form"
        title="Schedule a Site Visit"
      />
    </div>
  );
}
