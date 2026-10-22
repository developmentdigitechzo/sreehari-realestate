'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Globe,
  Home,
  Building2,
  BookOpen,
  MapPin,
  Phone,
  HelpCircle,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const FALLBACK_PROJECTS = [
  {
    id: 'proj-park-avenue',
    slug: 'park-avenue',
    name: 'Park Avenue — Phase I & II',
    status: 'Ready to Construct',
    location_area: 'Panjappur',
    location_city: 'Trichy',
    total_plots_count: 85
  },
  {
    id: 'proj-sri-amman-nagar',
    slug: 'sri-amman-nagar',
    name: 'Sri Amman Nagar',
    status: 'Ongoing',
    location_area: 'Somarasampettai',
    location_city: 'Trichy',
    total_plots_count: 64
  },
  {
    id: 'proj-aishwarya-nagar',
    slug: 'aishwarya-nagar',
    name: 'Aishwarya Nagar',
    status: 'Sold Out',
    location_area: 'Airport Road',
    location_city: 'Trichy',
    total_plots_count: 42
  }
];

const FALLBACK_BLOGS = [
  {
    id: 'b1',
    slug: 'why-investing-in-gated-plots-beats-apartments-in-2026',
    title: 'Why Investing in Gated Community Plots Beats Apartments in 2026',
    category: 'Investment Guide',
    excerpt: 'Detailed capital appreciation analysis comparing landed plots versus high-rise apartments in expanding corridors.',
    created_at: '2026-10-15'
  },
  {
    id: 'b2',
    slug: 'essential-checklist-for-buying-dtcp-rera-approved-plots',
    title: 'Essential Legal Checklist for Buying DTCP & RERA Approved Plots in Tamil Nadu',
    category: 'Legal & Approvals',
    excerpt: 'A step-by-step buyer checklist for verifying patta, encumbrance certificates (EC), DTCP plan layout sanction, and RERA registration.',
    created_at: '2026-10-10'
  },
  {
    id: 'b3',
    slug: 'how-infrastructure-drives-plot-appreciation-in-developing-corridors',
    title: 'How Infrastructure Corridors Drive Land Appreciation in Trichy',
    category: 'Market Trends',
    excerpt: 'Examining the massive growth catalysts around Panjappur New Integrated Bus Stand, ring roads, and industrial corridors.',
    created_at: '2026-10-05'
  }
];

const staticSections = [
  { name: 'Home Page', href: '/', desc: 'Welcome to Sree Hari Realty Promoters Trichy', icon: Home },
  { name: 'All Residential Projects & Plots', href: '/properties', desc: 'Browse DTCP and RERA approved gated communities', icon: Building2 },
  { name: 'Real Estate & Investment Blog', href: '/blog', desc: 'Insights, legal checklists, and market trends', icon: BookOpen },
  { name: 'Media Gallery', href: '/gallery', desc: 'Photos and project layout walkthroughs', icon: ImageIcon },
  { name: 'About Sree Hari Realty', href: '/about', desc: 'Our heritage, promoter leadership, and commitments', icon: Globe },
  { name: 'Contact & Office Directions', href: '/contact', desc: 'Trichy headquarters, phone numbers, and inquiry forms', icon: Phone },
  { name: 'Frequently Asked Questions (FAQ)', href: '/faq', desc: 'Answers on legal documentation, bank loans, and site visits', icon: HelpCircle },
];

export default function SitemapClient() {
  const [projects, setProjects] = useState<any[]>(FALLBACK_PROJECTS);
  const [blogs, setBlogs] = useState<any[]>(FALLBACK_BLOGS);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, blogRes] = await Promise.all([
          api.getPublicProjects().catch(() => ({ data: [] })),
          api.getPublicBlogs().catch(() => ({ data: [] }))
        ]);
        if (Array.isArray(projRes?.data) && projRes.data.length > 0) {
          setProjects(projRes.data.filter((p: any) => p.status !== 'Draft' && p.status !== 'Deleted'));
        }
        if (Array.isArray(blogRes?.data) && blogRes.data.length > 0) {
          setBlogs(blogRes.data.filter((b: any) => b.status === 'Published'));
        }
      } catch {
        // Fallback remains active
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-800">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-br from-[#0c2b23] via-[#004d40] to-[#002f26] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Complete Website Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            HTML Site Directory &amp; Sitemap
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Quickly navigate across all public pages, residential plot developments, legal FAQs, and property investment articles by Sree Hari Realty Promoters.
          </p>
        </div>
      </section>

      {/* Main Content Directory */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section 1: Core Public Portals */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">Main Website Portals</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staticSections.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-[#006452] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-[#006452] transition-colors text-sm flex items-center gap-1">
                      <span>{item.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Section 2: Gated Community Projects */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">
              Residential Projects &amp; Layout Communities ({projects.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <Link
                key={proj.id || proj.slug}
                href={`/properties/${proj.slug || proj.id}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {proj.status || 'Ongoing'}
                  </span>
                  {proj.total_plots_count && (
                    <span className="text-xs text-slate-500 font-medium">
                      {proj.total_plots_count} Plots
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#006452] text-sm flex items-center justify-between">
                  <span>{proj.name || proj.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{proj.location_area || 'Trichy'}, {proj.location_city || 'Tamil Nadu'}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Blog Articles & Investment Guides */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-slate-900">
              Real Estate Guidance &amp; Articles ({blogs.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((article) => (
              <Link
                key={article.id || article.slug}
                href={`/blog/${article.slug}`}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {article.category || 'Real Estate'}
                  </span>
                  {article.created_at && (
                    <span className="text-[11px] text-slate-400">
                      {new Date(article.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-[#006452] text-sm leading-snug line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
