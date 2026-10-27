'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  CheckCircle2,
  Calendar,
  Phone,
  MessageSquare,
  Sparkles,
  MapPin,
  TrendingUp,
  ArrowRight,
  HeartHandshake,
  Compass,
  Store,
  Layers,
  Check,
  Clock,
  Sparkle,
  Target,
  Rocket
} from 'lucide-react';
import {
  COMPANY_PHONE,
  COMPANY_PHONE_RAW,
  COMPANY_PHONE_SECONDARY,
  COMPANY_PHONE_SECONDARY_RAW,
  COMPANY_WHATSAPP
} from '@/data/properties';
import EnquiryModal from '@/components/EnquiryModal';

export default function AboutPage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('About Us Page');

  const handleOpenEnquiry = (projectName: string = 'About Us Page') => {
    setSelectedProject(projectName);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 font-sans">
      {/* 1. HERO HEADER BANNER WITH HD PANORAMIC BACKGROUND & CINEMATIC GRADIENT */}
      <section className="relative min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        {/* Exact HD Panoramic Background Image */}
        <Image
          src="/hero_about.jpg"
          alt="Sree Hari Realty Promoters Heritage & Communities"
          fill
          priority
          quality={95}
          className="object-cover object-[70%_center] sm:object-center"
        />

        {/* Balanced Cinematic Gradient (Smooth Dark Transition from Left to Preserve Background Scenery on Right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/35 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D61F69] animate-pulse" />
              <span>OUR JOURNEY & HERITAGE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Building Communities. <br />
              <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Creating Trust.</span>
            </h1>

            <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed max-w-xl drop-shadow-sm">
              From our humble beginnings with <strong className="text-amber-300 font-bold">Sree Hari Sweets in 1991</strong> to developing over <strong className="text-amber-300 font-bold">300+ acres</strong> of living gated communities, our journey has always been about people, trust, and lasting value.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE LEADERSHIP & EXECUTIVE SPOTLIGHT (Exact Match to BeyondWalls Reference Layout media_1791592585427.png) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="relative">
          {/* Main Card Container with Signature Warm Light Yellow / Cream Background matching Project Cards */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-[2.5rem] sm:rounded-[3rem] border-2 border-amber-200/90 shadow-xl overflow-visible grid grid-cols-1 lg:grid-cols-12 items-center relative">
            
            {/* Left Column: Leadership Narrative & Philosophy */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 space-y-6 z-10 relative order-2 lg:order-1">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#006452] bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 inline-block shadow-2xs">
                  ABOUT SREE HARI REALTY PROMOTERS
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#006452] tracking-tight leading-tight font-serif-title">
                  Creating Spaces. Building Communities. <br />
                  <span className="text-[#D61F69]">Earning Trust Since 1991.</span>
                </h2>
              </div>

              <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed font-normal">
                <p>
                  At <strong>Sree Hari Realty Promoters</strong>, our philosophy is anchored in an unshakeable commitment to people and community. What began with <strong>Sree Hari Sweets in 1991</strong> has flourished across three decades into a cherished household name in Trichy and Tamil Nadu, built on authentic quality, transparency, and personal relationships.
                </p>

                <p>
                  With more than <strong>300+ acres</strong> developed across Tamil Nadu through our parent venture, we focus on delivering real residential townships where families can comfortably live, grow, and prosper — with 100% DTCP and RERA legal perfection.
                </p>
              </div>

              {/* Founder / Leadership Sign-Off Block */}
              <div className="pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl font-black text-[#006452] tracking-tight">
                    Promoters & Executive Leadership
                  </h4>
                  <p className="text-xs text-gray-500 font-semibold tracking-wide">
                    Sree Hari Realty Promoters • Tiruchirappalli, Tamil Nadu
                  </p>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEnquiry('Leadership Spotlight')}
                    className="group inline-flex items-center justify-center gap-2 bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-6 py-3 rounded-full text-xs font-extrabold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="whitespace-nowrap">Connect With Us</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
                  </button>
                  <a
                    href={`tel:${COMPANY_PHONE_RAW}`}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-100/70 border border-amber-200 text-[#006452] hover:bg-[#f7db49] transition-all flex items-center justify-center shadow-xs flex-shrink-0"
                    title="Call Leadership Team"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Exact BeyondWalls Triangular Polygon in Logo Pink & Standout Cutout Person */}
            <div className="lg:col-span-5 relative flex items-end justify-center px-4 sm:px-6 pb-0 pt-8 sm:pt-10 lg:pt-0 min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] order-1 lg:order-2">
              
              {/* Exact BeyondWalls Rounded Triangular Polygon in Logo Pink #D61F69 (Fills the box with no awkward top gap) */}
              <div className="absolute -top-6 sm:-top-10 lg:-top-14 bottom-2 sm:bottom-3 right-2 sm:right-6 left-2 sm:left-6 flex items-center justify-center pointer-events-none z-0">
                <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="logoPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E61E6E" />
                      <stop offset="45%" stopColor="#D61F69" />
                      <stop offset="100%" stopColor="#8A0D3B" />
                    </linearGradient>
                  </defs>
                  {/* Smooth rounded triangle geometry matching media_1791592585427.png */}
                  <path
                    d="M 90,40 L 420,40 Q 470,40 470,90 L 445,410 Q 435,465 380,455 L 75,110 Q 45,55 90,40 Z"
                    fill="url(#logoPinkGrad)"
                  />
                </svg>
              </div>

              {/* Standout Cutout Portrait (Head and shoulders pop-out smoothly above card top) */}
              <div className="relative z-20 w-80 sm:w-96 lg:w-[440px] xl:w-[460px] h-[400px] sm:h-[480px] lg:h-[540px] -mt-8 sm:-mt-12 lg:-mt-16 pointer-events-none flex items-end justify-center">
                <Image
                  src="/executive_founder_cutout.png"
                  alt="Executive Promoter - Sree Hari Realty Promoters"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain object-bottom drop-shadow-2xl hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Bottom Ground Shadow */}
              <div className="absolute -bottom-2 w-52 sm:w-60 h-4 bg-black/20 blur-md rounded-full pointer-events-none z-0" />

            </div>

          </div>
        </div>
      </section>

      {/* 3. VISION & MISSION TEMPLATE (Fully Mobile Responsive & Directional Chevron on Desktop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200 inline-block">
            OUR GUIDING PURPOSE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#006452] tracking-tight font-serif-title">
            Our Vision & Mission
          </h2>
          <p className="text-[15px] text-gray-600">
            The enduring principles that guide every gated community we masterplan.
          </p>
        </div>

        {/* Directional Banners Container: Stacked & Responsive */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 py-2 sm:py-4">
          
          {/* 1. VISION (Mobile Rounded Card, Desktop Chevron Pointing RIGHT ->) */}
          <div className="w-full lg:max-w-5xl mr-auto relative group">
            {/* Soft Drop Shadow Box */}
            <div className="hidden md:block absolute inset-0 bg-black/10 transform translate-y-3 translate-x-2 blur-md pointer-events-none" />

            <div 
              className="relative bg-gradient-to-r from-[#D61F69] via-[#E11D48] to-[#BE185D] text-white p-6 sm:p-8 md:py-10 md:pl-10 md:pr-18 lg:pr-20 rounded-3xl md:rounded-l-3xl shadow-xl flex flex-col md:flex-row items-center md:items-start lg:items-center gap-5 sm:gap-6 md:gap-8 overflow-hidden md:[clip-path:polygon(0%_0%,calc(100%-48px)_0%,100%_50%,calc(100%-48px)_100%,0%_100%)]"
            >
              {/* Subtle Lotus Glow Watermark (Mobile: top-left corner away from text; Desktop: right chevron tip) */}
              <div className="absolute -left-4 -top-4 sm:-left-2 md:left-auto md:right-14 md:-top-8 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-10 sm:opacity-15 pointer-events-none">
                <Image src="/lotus_icon.png" alt="" fill className="object-contain brightness-0 invert" />
              </div>

              {/* Icon Container (Mobile friendly centered / Desktop left) */}
              <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Target className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white stroke-[2.2]" />
              </div>

              {/* Content Block */}
              <div className="space-y-3 text-center md:text-left z-10 flex-1 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-serif-title">
                    Vision
                  </h3>
                  <span className="hidden md:inline-block text-xs uppercase tracking-widest text-pink-200 font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                    Future-Ready Living
                  </span>
                </div>
                <p className="text-[14.5px] sm:text-[15.5px] text-pink-50 leading-relaxed font-normal max-w-2xl">
                  To become a trusted and widely recognized real estate development company known for creating <strong>well-planned, future-ready, and family-friendly living communities</strong> across Tamil Nadu that deliver generational prosperity.
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-[11px] font-bold text-pink-100">
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">Strategic Locations</span>
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">Family Wellbeing</span>
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">Enduring Value</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MISSION (Mobile Rounded Card, Desktop Chevron Pointing LEFT <-) */}
          <div className="w-full lg:max-w-5xl ml-auto relative group">
            {/* Soft Drop Shadow Box */}
            <div className="hidden md:block absolute inset-0 bg-black/10 transform translate-y-3 -translate-x-2 blur-md pointer-events-none" />

            <div 
              className="relative bg-gradient-to-r from-[#004d3f] via-[#006452] to-[#007a63] text-white p-6 sm:p-8 md:py-10 md:pr-10 md:pl-18 lg:pl-20 rounded-3xl md:rounded-r-3xl shadow-xl flex flex-col md:flex-row-reverse items-center md:items-start lg:items-center gap-5 sm:gap-6 md:gap-8 overflow-hidden md:[clip-path:polygon(48px_0%,100%_0%,100%_100%,48px_100%,0%_50%)]"
            >
              {/* Subtle Lotus Glow Watermark (Mobile: top-right corner away from text; Desktop: left chevron tip) */}
              <div className="absolute -right-4 -top-4 sm:-right-2 md:right-auto md:left-14 md:-top-8 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 opacity-10 sm:opacity-15 pointer-events-none">
                <Image src="/lotus_icon.png" alt="" fill className="object-contain brightness-0 invert" />
              </div>

              {/* Icon Container */}
              <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Rocket className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white stroke-[2.2] transform -rotate-45" />
              </div>

              {/* Content Block */}
              <div className="space-y-3 text-center md:text-right z-10 flex-1 w-full">
                <div className="flex flex-col md:flex-row-reverse md:items-center gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-serif-title">
                    Mission
                  </h3>
                  <span className="hidden md:inline-block text-xs uppercase tracking-widest text-emerald-200 font-bold bg-white/10 px-2.5 py-0.5 rounded-full">
                    Quality & Legal Trust
                  </span>
                </div>
                <p className="text-[14.5px] sm:text-[15.5px] text-emerald-50 leading-relaxed font-normal max-w-2xl ml-auto">
                  To identify high-potential growth locations, develop thoughtfully planned residential communities, and deliver genuine value to our customers through <strong>impeccable quality, 100% transparency, strict legal compliance, and trust</strong>.
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center md:justify-end gap-2 text-[11px] font-bold text-emerald-100">
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">100% DTCP & RERA</span>
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">Paved Roads & Sweet Water</span>
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/25">Clear Title Guarantee</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. OUR JOURNEY TIMELINE (Exact FurniFlex S-Curve Looping Ribbon Story media_1791592454381.png) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-200 inline-block shadow-2xs">
            THE SREE HARI JOURNEY STORY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#006452] tracking-tight font-serif-title">
            The Sree Hari Milestone Story
          </h2>
          <p className="text-[15px] sm:text-base text-gray-600 leading-relaxed">
            Transforming spaces with dedicated craftsmanship, legal transparency, and community living since 1991.
          </p>
        </div>

        {/* Continuous S-Curve Looping Ribbon Timeline (Exact FurniFlex Single Connected Track media_1791592454381.png) */}
        <div className="relative pt-4 pb-8">

          {/* STEP 1 (1991): Left Stadium Image with Top Curve & Left Loop -> Right Clean Text */}
          <div className="relative py-8 lg:py-12">
            {/* Seamless Connected Track Segment: Left U-loop */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[calc(50%+2px)] border-t-[10px] border-l-[10px] border-b-[10px] border-[#006452] rounded-l-[4.5rem] pointer-events-none z-0" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 px-2 sm:px-6">
              {/* Left Image: Pure Clean Stadium Framed Photo (ZERO Text, NO Shop Name) */}
              <div className="lg:col-span-6 relative">
                <div className="relative h-64 sm:h-76 lg:h-84 w-full rounded-3xl lg:rounded-l-full lg:rounded-r-2xl overflow-hidden border-4 border-[#006452] shadow-xl">
                  <Image
                    src="/milestone_1991_sweets.jpg"
                    alt="Traditional Confectionery & Sweet Craftsmanship 1991"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right Text Block: Clean on Cream Page */}
              <div className="lg:col-span-6 space-y-4 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-[#D61F69] shadow-xs">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest block">
                    1991 • ESTABLISHED
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title mt-1">
                    From Humble Beginnings: Sree Hari Sweets
                  </h3>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Our story began in 1990–1991 with <strong>Sree Hari Sweets</strong>, driven by a deep passion for uncompromised quality, authentic taste, and genuine customer care. What started as a modest local enterprise quickly blossomed into a beloved household institution in Trichy, earning generations of family faith.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#006452]">
                  <CheckCircle2 className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                  <span>36 Years of Community Goodwill & Trust</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 (2007): Left Clean Text -> Right Stadium Image with Connected Right Loop */}
          <div className="relative py-8 lg:py-12 -mt-[10px]">
            {/* Seamless Connected Track Segment: Right U-loop connects to Step 1 */}
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[calc(50%+2px)] border-t-[10px] border-r-[10px] border-b-[10px] border-[#006452] rounded-r-[4.5rem] pointer-events-none z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 px-2 sm:px-6">
              {/* Left Text Block */}
              <div className="lg:col-span-6 space-y-4 order-2 lg:order-1 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-[#006452] shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#006452] uppercase tracking-widest block">
                    2007 • SECTOR EXPANSION
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title mt-1">
                    Real Estate Expansion: 300+ Acres
                  </h3>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Building on decades of integrity, we entered the real estate development sector in 2007. Over the subsequent years, our parent venture successfully masterplanned and developed <strong>more than 300 acres</strong> across Tamil Nadu with 100% clear titles, setting a benchmark for secure property ownership.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#006452]">
                  <CheckCircle2 className="w-4 h-4 text-[#006452] flex-shrink-0" />
                  <span>300+ Acres Developed Across Tamil Nadu</span>
                </div>
              </div>

              {/* Right Image: Pure Clean Stadium Framed Photo (ZERO Text Badges) */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative h-64 sm:h-76 lg:h-84 w-full rounded-3xl lg:rounded-r-full lg:rounded-l-2xl overflow-hidden border-4 border-[#006452] shadow-xl">
                  <Image
                    src="/milestone_2007_realestate.jpg"
                    alt="Real Estate 300+ Acres Development"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 (2016): Left Stadium Image with Connected Left Loop -> Right Clean Text */}
          <div className="relative py-8 lg:py-12 -mt-[10px]">
            {/* Seamless Connected Track Segment: Left U-loop connects to Step 2 */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[calc(50%+2px)] border-t-[10px] border-l-[10px] border-b-[10px] border-[#006452] rounded-l-[4.5rem] pointer-events-none z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 px-2 sm:px-6">
              {/* Left Image: Pure Clean Stadium Framed Photo (ZERO Text, NO Shop Name) */}
              <div className="lg:col-span-6 relative">
                <div className="relative h-64 sm:h-76 lg:h-84 w-full rounded-3xl lg:rounded-l-full lg:rounded-r-2xl overflow-hidden border-4 border-[#006452] shadow-xl">
                  <Image
                    src="/milestone_2016_houseofsweets.jpg"
                    alt="House of Sweets Flagship Confectionery Showroom"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right Text Block */}
              <div className="lg:col-span-6 space-y-4 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100/70 border border-pink-200 flex items-center justify-center text-[#D61F69] shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest block">
                    2016 • REGIONAL EXPANSION
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title mt-1">
                    Innovation & Growth: House of Sweets
                  </h3>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  In 2016, we expanded our presence through <strong>Sree Hari Sweets – House of Sweets</strong> in Melapudur, Trichy. This iconic flagship strengthened our deep connection with tens of thousands of families, creating the trusted corporate anchor where our real estate operations thrive today.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#006452]">
                  <CheckCircle2 className="w-4 h-4 text-[#D61F69] flex-shrink-0" />
                  <span>Flagship Melapudur Headquarters & Central Hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 (2022 - 2025): Left Clean Text -> Right Stadium Image with Connected Right Loop */}
          <div className="relative py-8 lg:py-12 -mt-[10px]">
            {/* Seamless Connected Track Segment: Right U-loop connects to Step 3 */}
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[calc(50%+2px)] border-t-[10px] border-r-[10px] border-b-[10px] border-[#006452] rounded-r-[4.5rem] pointer-events-none z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 px-2 sm:px-6">
              {/* Left Text Block */}
              <div className="lg:col-span-6 space-y-4 order-2 lg:order-1 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-[#006452] shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#006452] uppercase tracking-widest block">
                    2022 – 2025 • PROVEN RECORD
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title mt-1">
                    Aishwarya Nagar & Sri Amman Nagar
                  </h3>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  In 2022, we launched <strong>Aishwarya Nagar</strong> near BHEL, Thirumayam. Following its completion, in 2025 we launched <strong>Sri Amman Nagar</strong> in Thiruverumbur, Trichy — which was <strong>100% sold out within 60 days</strong>. Today, happy families have built villas and live there safely.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#006452]">
                  <CheckCircle2 className="w-4 h-4 text-[#006452] flex-shrink-0" />
                  <span>100% Sold Out in 60 Days • Active Living Township</span>
                </div>
              </div>

              {/* Right Image: Pure Clean Stadium Framed Photo (ZERO Text Badges) */}
              <div className="lg:col-span-6 relative order-1 lg:order-2">
                <div className="relative h-64 sm:h-76 lg:h-84 w-full rounded-3xl lg:rounded-r-full lg:rounded-l-2xl overflow-hidden border-4 border-[#006452] shadow-xl">
                  <Image
                    src="/project_aishwarya_nagar.jpg"
                    alt="Aishwarya Nagar and Sri Amman Nagar Communities"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5 (2026 & Beyond): Left Stadium Image with Connected Left Loop -> Right Clean Text */}
          <div className="relative py-8 lg:py-12 -mt-[10px]">
            {/* Seamless Connected Track Segment: Left U-loop connects to Step 4 + Bottom finish bar */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[calc(50%+2px)] border-t-[10px] border-l-[10px] border-b-[10px] border-[#006452] rounded-l-[4.5rem] pointer-events-none z-0" />
            <div className="hidden lg:block absolute right-0 bottom-0 w-1/2 border-b-[10px] border-[#006452] pointer-events-none z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10 px-2 sm:px-6">
              {/* Left Image: Pure Clean Stadium Framed Photo (ZERO Text Badges) */}
              <div className="lg:col-span-6 relative">
                <div className="relative h-64 sm:h-76 lg:h-84 w-full rounded-3xl lg:rounded-l-full lg:rounded-r-2xl overflow-hidden border-4 border-[#006452] shadow-xl">
                  <Image
                    src="/project_park_avenue_new.jpg"
                    alt="Park Avenue Flagship Gated Township"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right Text Block */}
              <div className="lg:col-span-6 space-y-4 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100/70 border border-pink-200 flex items-center justify-center text-[#D61F69] shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest block">
                    2026 & BEYOND • THE FUTURE
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title mt-1">
                    Looking Ahead: Park Avenue Flagship
                  </h3>
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed">
                  Our flagship development <strong>Park Avenue</strong> represents the next pinnacle of gated living, featuring a grand monumental entrance arch, 40-foot asphalt avenues, sweet potable water, children&apos;s parks, and instant DTCP & RERA spot registration.
                </p>
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <Link
                    href="/properties"
                    className="group inline-flex items-center gap-2 bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-6 py-3 rounded-full text-xs font-extrabold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Explore Park Avenue Plots</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button
                    onClick={() => handleOpenEnquiry('Park Avenue Milestone')}
                    className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-[#006452] border border-amber-200 px-5 py-3 rounded-full text-xs font-bold transition shadow-xs cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Schedule Site Visit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. OUR REAL ESTATE PROJECTS PORTFOLIO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#006452] uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            PROVEN TRACK RECORD
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#006452] tracking-tight font-serif-title">
            Our Landmark Real Estate Projects
          </h2>
          <p className="text-[15px] text-gray-600">
            Each project is carefully chosen for accessibility, living comfort, and rapid capital appreciation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project 1: Aishwarya Nagar */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between group">
            <div className="relative h-52 w-full overflow-hidden bg-stone-100">
              <Image
                src="/project_aishwarya_nagar.jpg"
                alt="Aishwarya Nagar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-300 uppercase border border-amber-300/30">
                2022 • FIRST PROJECT
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#006452] tracking-tight">
                  Aishwarya Nagar
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#006452] font-semibold">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Near BHEL, Thirumayam, Pudukkottai</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Our maiden dedicated real estate project, carefully planned to provide customers with a well-connected, secure, and peaceful residential environment.
                </p>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-[#006452]">
                <span>Status: Completed & Handed Over</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Project 2: Sri Amman Nagar */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between group">
            <div className="relative h-52 w-full overflow-hidden bg-stone-100">
              <Image
                src="/project_sri_amman_nagar_new.jpg"
                alt="Sri Amman Nagar"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute top-3.5 left-3.5 bg-[#D61F69] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
                2025 • SOLD OUT IN 60 DAYS
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#006452] tracking-tight">
                  Sri Amman Nagar
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#006452] font-semibold">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Thiruverumbur, Trichy (Near BHEL, OFT & Manford School)</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Strategically located in Trichy&apos;s primary employment hub. Successfully sold out within <strong>60 days</strong> of launch. Today, vibrant families are building and living here happily.
                </p>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-[#D61F69]">
                <span>Status: 100% Sold Out in 60 Days</span>
                <CheckCircle2 className="w-4 h-4 text-[#D61F69]" />
              </div>
            </div>
          </div>

          {/* Project 3: Park Avenue */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl border-2 border-amber-200/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden flex flex-col justify-between group">
            <div className="relative h-52 w-full overflow-hidden bg-stone-100">
              <Image
                src="/project_park_avenue_new.jpg"
                alt="Park Avenue"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-106 transition-transform duration-700"
              />
              <div className="absolute top-3.5 left-3.5 bg-[#006452] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm">
                2026 • ONGOING FLAGSHIP
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#006452] tracking-tight">
                  Park Avenue
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#006452] font-semibold">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Trichy High-Growth Corridor</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Our third landmark project continuing our commitment to premier gated communities with grand arch entrance, paved avenues, and massive future appreciation.
                </p>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#D61F69]">
                  Plots Available for Booking
                </span>
                <button
                  onClick={() => handleOpenEnquiry('Park Avenue - About Us')}
                  className="group inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006452] bg-[#f7db49] hover:bg-[#f6d73c] px-4 py-1.5 rounded-full shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
                >
                  <span>Enquire</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OUR VALUES & REAL RESIDENTIAL COMMUNITIES (Matching Reference Image 3 Structure) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest bg-pink-50 px-4 py-1.5 rounded-full border border-pink-200 inline-block shadow-2xs">
            BEYOND EXPECTATIONS • FOUNDATIONAL VALUES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#006452] tracking-tight font-serif-title">
            Our Living Values & Communities
          </h2>
          <p className="text-[15px] sm:text-base text-gray-600 leading-relaxed">
            At Sree Hari Realty Promoters, we uphold four core values that define our approach to serving families, ensuring legal peace of mind, and creating lifelong community trust.
          </p>
        </div>

        {/* 3-Column Luxury Values Grid: Left 2 Rounded Cards | Center Tall Clean Family Photo | Right 2 Rounded Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: 2 Stacked Rounded Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            {/* Value Card 1: Unwavering Integrity */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 sm:p-8 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out flex-1 flex flex-col justify-between space-y-3 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006452] shadow-2xs group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#D61F69] uppercase tracking-widest bg-pink-50/80 px-3 py-1 rounded-full border border-pink-100">
                    FOSTERING TRUST
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight font-serif-title">
                    Unwavering Integrity
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pt-2">
                    Integrity is the bedrock of our company. We hold ourselves to the highest ethical and legal standards, guaranteeing 100% DTCP & TNRERA approved layouts, crystal-clear parent deeds, and instant spot registration for generational peace of mind.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2 text-xs font-bold text-[#006452]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>100% Clear Titles & Vetted Documentation</span>
              </div>
            </div>

            {/* Value Card 2: Strategic Growth Locations */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 sm:p-8 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out flex-1 flex flex-col justify-between space-y-3 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006452] shadow-2xs group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#D61F69] uppercase tracking-widest bg-pink-50/80 px-3 py-1 rounded-full border border-pink-100">
                    STRATEGIC CORRIDORS
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight font-serif-title">
                    Strategic Growth Locations
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pt-2">
                    We meticulously select micro-markets situated directly along active economic corridors, national highways, airport connections, and university zones—ensuring high capital appreciation while keeping daily family facilities close.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2 text-xs font-bold text-[#006452]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>High-Appreciation Employment Belts</span>
              </div>
            </div>
          </div>

          {/* Center Column: Tall, Elegant, Trustworthy Family-Oriented Photo (ZERO Text, Back-Facing Family) */}
          <div className="lg:col-span-4 flex">
            <div className="relative w-full h-[400px] sm:h-[480px] lg:h-auto lg:min-h-full rounded-3xl overflow-hidden shadow-xl border-2 border-amber-200/90 bg-stone-100 group">
              <Image
                src="/living_values_family_new.jpg"
                alt="Indian Family Living in Gated Community Township"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
              />
              {/* Subtle Warm Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
            </div>
          </div>

          {/* Right Column: 2 Stacked Rounded Cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            {/* Value Card 3: Immediate Construction Ready */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 sm:p-8 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out flex-1 flex flex-col justify-between space-y-3 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006452] shadow-2xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#D61F69] uppercase tracking-widest bg-pink-50/80 px-3 py-1 rounded-full border border-pink-100">
                    PLANNED LIVING
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight font-serif-title">
                    Immediate Construction Ready
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pt-2">
                    We deliver full-scale civil infrastructure—heavy-duty blacktop roads, sweet potable Cauvery/groundwater lines, electricity with bright streetlights, and perimeter compound walls—so families can build their luxury villas right away.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2 text-xs font-bold text-[#006452]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Water, Electricity & 40ft Tar Roads Delivered</span>
              </div>
            </div>

            {/* Value Card 4: Family-Centric Neighborhoods */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 sm:p-8 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out flex-1 flex flex-col justify-between space-y-3 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006452] shadow-2xs group-hover:scale-105 transition-transform">
                    <HeartHandshake className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-extrabold text-[#D61F69] uppercase tracking-widest bg-pink-50/80 px-3 py-1 rounded-full border border-pink-100">
                    COMMUNITY-FOCUSED
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight font-serif-title">
                    Family-Centric Neighborhoods
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pt-2">
                    We do not sell vacant speculative land. We nurture vibrant residential neighborhoods with landscaped children&apos;s parks, peaceful open spaces, and long-term security maintenance where multiple generations thrive together.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-amber-100 flex items-center gap-2 text-xs font-bold text-[#006452]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Children&apos;s Parks & 24/7 Gated Security</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. WHAT MAKES US DIFFERENT (5 CORE PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#D61F69] uppercase tracking-widest bg-pink-50 px-3.5 py-1.5 rounded-full border border-pink-200">
            THE SREE HARI ADVANTAGE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#006452] tracking-tight font-serif-title">
            What Makes Us Different
          </h2>
          <p className="text-[15px] text-gray-600">
            Why hundreds of families and investors place their lifelong trust in Sree Hari Realty Promoters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Pillar 01: Location First */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden group">
            {/* Top Hover Gradient Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006452] to-[#D61F69] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              {/* Header: Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#D61F69] transition-colors font-mono">
                  01
                </span>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006452] flex items-center justify-center border border-emerald-100 group-hover:bg-[#006452] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              {/* Title & Badge */}
              <h3 className="text-base font-extrabold text-[#006452] tracking-tight mt-4">
                Location First
              </h3>
              <div className="mt-1 mb-2.5">
                <span className="inline-flex items-center text-[10px] font-extrabold text-[#006452] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wide">
                  Prime Highway Corridors
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Carefully scouted high-growth zones along major highways, educational hubs & zero-flood corridors.
              </p>
            </div>

            {/* Sub-feature Highlight */}
            <div className="pt-3 mt-4 border-t border-amber-100 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006452] flex-shrink-0" />
              <span>Sweet Groundwater Access</span>
            </div>
          </div>

          {/* Pillar 02: Customer Centric */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006452] to-[#D61F69] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#D61F69] transition-colors font-mono">
                  02
                </span>
                <div className="w-11 h-11 rounded-2xl bg-pink-50 text-[#D61F69] flex items-center justify-center border border-pink-100 group-hover:bg-[#D61F69] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <HeartHandshake className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#006452] tracking-tight mt-4">
                Customer-Centric
              </h3>
              <div className="mt-1 mb-2.5">
                <span className="inline-flex items-center text-[10px] font-extrabold text-[#D61F69] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200/60 uppercase tracking-wide">
                  Flexible Payment Ease
                </span>
              </div>

              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Every layout is planned around homebuyer convenience, safety, and tailored 1-month payment schedules.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-amber-100 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D61F69] flex-shrink-0" />
              <span>₹1 Lakh Booking Advance</span>
            </div>
          </div>

          {/* Pillar 03: Community Focused */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006452] to-[#D61F69] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#D61F69] transition-colors font-mono">
                  03
                </span>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006452] flex items-center justify-center border border-emerald-100 group-hover:bg-[#006452] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#006452] tracking-tight mt-4">
                Community-Focused
              </h3>
              <div className="mt-1 mb-2.5">
                <span className="inline-flex items-center text-[10px] font-extrabold text-[#006452] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wide">
                  Gated Township Life
                </span>
              </div>

              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                We design spaces that naturally evolve into vibrant, living residential neighborhoods with parks and wide tar roads.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-amber-100 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006452] flex-shrink-0" />
              <span>Children&apos;s Park & Streetlights</span>
            </div>
          </div>

          {/* Pillar 04: Experience & Trust */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006452] to-[#D61F69] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#D61F69] transition-colors font-mono">
                  04
                </span>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 shadow-2xs">
                  <Award className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#006452] tracking-tight mt-4">
                Experience & Trust
              </h3>
              <div className="mt-1 mb-2.5">
                <span className="inline-flex items-center text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60 uppercase tracking-wide">
                  36 Years Legacy
                </span>
              </div>

              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Roots since 1991 and 300+ acres of development experience through our established parent enterprise.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-amber-100 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span>300+ Acres Handed Over</span>
            </div>
          </div>

          {/* Pillar 05: Quality & Transparency */}
          <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl p-6 border border-amber-100/90 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-1 sm:max-w-md sm:mx-auto lg:max-w-none w-full">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006452] to-[#D61F69] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#D61F69] transition-colors font-mono">
                  05
                </span>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006452] flex items-center justify-center border border-emerald-100 group-hover:bg-[#006452] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-[#006452] tracking-tight mt-4">
                100% Transparency
              </h3>
              <div className="mt-1 mb-2.5">
                <span className="inline-flex items-center text-[10px] font-extrabold text-[#006452] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 uppercase tracking-wide">
                  DTCP & RERA Approved
                </span>
              </div>

              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Crystal-clear 30-year parent deed lineage, transparent legal vetting, and approved bank loans with leading banks.
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-amber-100 flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006452] flex-shrink-0" />
              <span>Pre-Approved Bank Loans</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER (Matching Home Page Floral Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl px-6 sm:px-14 md:px-20 lg:px-28 py-10 sm:py-14 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden bg-[#fef9e6]">
          {/* Authentic High-Res Floral Jasmine & Lotus Cream Background Banner */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/cta_floral_banner.png"
              alt="Sree Hari Floral Landscape"
              fill
              priority
              quality={100}
              unoptimized
              className="object-cover object-center"
            />
          </div>

          <div className="space-y-2 text-center md:text-left relative z-10 max-w-md lg:max-w-lg">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#006452] tracking-tight leading-tight">
              Ready to Build <span className="text-[#D61F69]">Your Future?</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
              Get in touch with our team and take the first step towards owning your DTCP & RERA approved plot.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 relative z-10 flex-shrink-0">
            <button
              onClick={() => handleOpenEnquiry('About Us CTA')}
              className="group bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <span>Enquire Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href={`tel:${COMPANY_PHONE_RAW}`}
              className="group bg-white/95 hover:bg-white text-[#006452] hover:text-[#D61F69] border border-amber-200/90 hover:border-pink-300 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5 backdrop-blur-sm"
            >
              <Phone className="w-4 h-4 text-[#D61F69] transition-transform group-hover:scale-110" />
              <span>{COMPANY_PHONE}</span>
            </a>
          </div>
        </div>
      </section>

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        propertyName={selectedProject}
        title="Connect With Sree Hari Realty Promoters"
        subtitle="Speak with our property directors to find your ideal DTCP & RERA plot."
      />
    </div>
  );
}
