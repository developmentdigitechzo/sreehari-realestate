'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  MapPin,
  Trees,
  Leaf,
  ArrowRight,
  Phone,
  Search,
  Users,
  TrendingUp,
  Building,
  Compass,
  GraduationCap,
  Plane,
  Train,
  Bus,
  Activity,
  Maximize2,
  Tag,
  CalendarCheck,
  FileCheck,
  Home,
  ChevronDown
} from 'lucide-react';
import { properties, Property, COMPANY_PHONE, COMPANY_PHONE_RAW, TAMIL_NADU_DISTRICTS } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import LocationAdvantageMap from '@/components/LocationAdvantageMap';
import { api } from '@/lib/api';
import { mapProjectRecordToProperty } from './properties/PropertiesClient';

export default function HomeClient({ initialProjects }: { initialProjects?: any[] }) {
  const [selectedLocation, setSelectedLocation] = useState('Trichy (Tiruchirappalli)');
  const [selectedPlotSize, setSelectedPlotSize] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);

  const [liveProperties, setLiveProperties] = useState<Property[]>(() => {
    if (Array.isArray(initialProjects) && initialProjects.length > 0) {
      return initialProjects.map(mapProjectRecordToProperty);
    }
    return [];
  });
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(
    !initialProjects || initialProjects.length === 0
  );

  useEffect(() => {
    async function loadProjects() {
      try {
        if (!initialProjects || initialProjects.length === 0) {
          setIsLoadingProjects(true);
        }
        const res = await api.getPublicProjects();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Property[] = res.data.map(mapProjectRecordToProperty);
          setLiveProperties(mapped);
        } else if (!initialProjects || initialProjects.length === 0) {
          setLiveProperties(properties);
        }
      } catch {
        if (!initialProjects || initialProjects.length === 0) {
          setLiveProperties(properties);
        }
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, [initialProjects]);

  const featuredProperties = (liveProperties.length > 0 ? liveProperties : properties).slice(0, 3);

  const handleOpenEnquiry = (projectName?: string) => {
    setActiveProject(projectName);
    setIsEnquiryOpen(true);
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-10 bg-[#fef9e6] font-sans">
      {/* 1. HERO SECTION WITH ULTRA-HD PANORAMIC ENTRANCE & BALANCED CINEMATIC CONTRAST */}
      <section className="relative min-h-[500px] sm:min-h-[620px] lg:min-h-[680px] flex items-center overflow-hidden bg-gray-950">
        <Image
          src="/hero_gate_entrance.png"
          alt="Sree Hari Realty Promoters Gated Community Grand Entrance"
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-[64%_center] sm:object-center"
        />

        {/* Balanced Dual-Side Cinematic Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/60 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none z-0" />

        {/* Hero Content Positioned on Left Side */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative z-10 w-full flex items-center justify-start">
          <div className="max-w-xl lg:max-w-2xl text-left space-y-4 sm:space-y-5">
            {/* Top Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10.5px] sm:text-[11px] font-bold tracking-widest text-amber-300 uppercase border border-amber-300/30 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>PREMIUM GATED COMMUNITY PLOTS</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md">
                A Better Place to <br />
                <span className="animate-text-shine">
                  Build Your Future
                </span>
              </h1>
              <p className="text-white/90 text-sm sm:text-[15px] font-medium max-w-lg leading-relaxed pt-0.5 drop-shadow-sm">
                Thoughtfully planned plots. A greener community. A place to call your own with 100% DTCP & RERA approved peace of mind.
              </p>
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3.5">
              <Link
                href="/properties"
                className="bg-[#D61F69] hover:bg-[#BE185D] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>Explore Plots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="bg-white/95 hover:bg-white text-gray-950 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-white/40 shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5 whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[#D61F69]" />
                <span>Book Site Visit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROJECTS SECTION (RECENTLY CREATED 3 PROJECTS FROM DATABASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
              RECENT COMMUNITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
              Our Premium Communities
            </h2>
          </div>

          <Link
            href="/properties"
            className="mt-3 sm:mt-0 text-xs font-bold text-[#D61F69] hover:underline flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingProjects ? (
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white/80 rounded-3xl p-5 border border-amber-100 shadow-sm animate-pulse space-y-4 h-[440px] flex flex-col justify-between"
              >
                <div className="h-56 bg-amber-100/60 rounded-2xl w-full" />
                <div className="space-y-2.5">
                  <div className="h-6 bg-amber-200/50 rounded-md w-3/4" />
                  <div className="h-4 bg-amber-100/60 rounded-md w-1/2" />
                  <div className="h-5 bg-amber-100/50 rounded-md w-2/3" />
                </div>
                <div className="h-10 bg-amber-200/60 rounded-full w-full mt-2" />
              </div>
            ))
          ) : (
            featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEnquire={(name) => handleOpenEnquiry(name)}
              />
            ))
          )}
        </div>
      </section>

      {/* 3. WHY SREE HARI SECTION */}
      <section className="bg-[#fef9e6] py-2 sm:py-4 relative overflow-hidden" id="amenities">
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 opacity-[0.14] pointer-events-none">
          <Image src="/lotus_icon.png" alt="" fill className="object-contain" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left 4 Arched Cards */}
            <div className="lg:col-span-8 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Safe & Secure */}
              <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-t-[44px] rounded-b-2xl p-6 border border-amber-100/90 hover:border-emerald-300/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:-translate-y-2 transition-all duration-500 ease-out text-center flex flex-col items-center justify-start group cursor-default">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#006452] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#006452] tracking-tight group-hover:text-[#D61F69] transition-colors">
                  Safe & Secure
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  Gated entry and 24/7 security.
                </p>
              </div>

              {/* Card 2: Green Living */}
              <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-t-[44px] rounded-b-2xl p-6 border border-amber-100/90 hover:border-emerald-300/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:-translate-y-2 transition-all duration-500 ease-out text-center flex flex-col items-center justify-start group cursor-default">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#006452] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                  <Leaf className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#006452] tracking-tight group-hover:text-[#D61F69] transition-colors">
                  Green Living
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  Landscaped parks and open spaces.
                </p>
              </div>

              {/* Card 3: Modern Amenities */}
              <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-t-[44px] rounded-b-2xl p-6 border border-amber-100/90 hover:border-emerald-300/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:-translate-y-2 transition-all duration-500 ease-out text-center flex flex-col items-center justify-start group cursor-default">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#006452] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#006452] tracking-tight group-hover:text-[#D61F69] transition-colors">
                  Modern Amenities
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  Recreational and lifestyle facilities.
                </p>
              </div>

              {/* Card 4: Future Value */}
              <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-t-[44px] rounded-b-2xl p-6 border border-amber-100/90 hover:border-emerald-300/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.18)] hover:-translate-y-2 transition-all duration-500 ease-out text-center flex flex-col items-center justify-start group cursor-default">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#006452] flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                  <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#006452] tracking-tight group-hover:text-[#D61F69] transition-colors">
                  Future Value
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  A smart investment for generations.
                </p>
              </div>
            </div>

            {/* Right Text */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-3">
              <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                WHY SREE HARI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] leading-tight tracking-tight">
                More Than a Plot, <br />
                <span className="text-[#D61F69]">A Community.</span>
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                We create gated communities that offer security, modern amenities and long-term value, helping you build a brighter future.
              </p>
              <div className="pt-1">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-[#f7db49] text-[#006452] hover:bg-[#f6d73c] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer"
                >
                  <span>Know More About Us</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE THE MASTERPLAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 my-2">
        <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                EXPLORE THE MASTERPLAN
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#006452] tracking-tight leading-tight font-serif-title">
                A Well-Planned <br className="hidden sm:inline" />
                Community
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md pt-1">
                Discover a thoughtfully designed layout with green spaces, modern infrastructure and amenities for a better everyday life.
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => handleOpenEnquiry('Explore Masterplan')}
                className="inline-flex items-center gap-2 bg-[#f7db49] text-[#006452] hover:bg-[#f6d73c] font-extrabold text-xs px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <span>Explore Masterplan</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Legend Pills Under Left Text */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-700 pt-3 font-semibold border-t border-amber-200/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D61F69]" /> Plots
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /> Parks & Greenery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> Amenities
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-600" /> Roads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Community Spaces
              </span>
            </div>
          </div>

          {/* Right Column: Seamless Masterplan */}
          <div className="lg:col-span-7 relative">
            {/* North Direction Compass Rose */}
            <div className="absolute -top-7 sm:-top-9 lg:-top-10 right-[6%] sm:right-[8%] pointer-events-none z-10 select-none flex flex-col items-center">
              <span className="text-[11px] font-black text-gray-800 tracking-tighter leading-none mb-0.5">N</span>
              <svg width="26" height="30" viewBox="0 0 36 36" fill="none" className="drop-shadow-xs">
                <line x1="18" y1="2" x2="18" y2="34" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />
                <line x1="2" y1="18" x2="34" y2="18" stroke="#4b5563" strokeWidth="0.8" opacity="0.6" />
                <circle cx="18" cy="18" r="9" stroke="#6b7280" strokeWidth="0.7" strokeDasharray="1.5 2" opacity="0.5" />
                <polygon points="18,4 16,18 18,16.5" fill="#18181b" />
                <polygon points="18,4 20,18 18,16.5" fill="#52525b" />
                <polygon points="18,32 16,18 18,19.5" fill="#a1a1aa" />
                <polygon points="18,32 20,18 18,19.5" fill="#d4d4d8" />
                <polygon points="32,18 18,16 19.5,18" fill="#52525b" />
                <polygon points="32,18 18,20 19.5,18" fill="#71717a" />
                <polygon points="4,18 18,16 16.5,18" fill="#d4d4d8" />
                <polygon points="4,18 18,20 16.5,18" fill="#a1a1aa" />
                <circle cx="18" cy="18" r="1.5" fill="#18181b" stroke="#ffffff" strokeWidth="0.6" />
              </svg>
            </div>

            {/* Right Airspace */}
            <div className="absolute top-[13%] sm:top-[14%] lg:top-[15%] right-[5%] sm:right-[6.5%] lg:right-[7%] w-[48px] sm:w-[54px] lg:w-[60px] z-20 pointer-events-none animate-crow-right select-none">
              <div className="relative w-full aspect-[45/45]">
                <Image
                  src="/masterplan_birds_right.png"
                  alt="Horizontal soaring birds string"
                  fill
                  className="object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
                />
              </div>
            </div>

            {/* Left Airspace */}
            <div className="absolute top-[12%] sm:top-[13%] lg:top-[14%] left-[-4.5%] sm:left-[-3%] lg:left-[-3.5%] w-[76px] sm:w-[84px] lg:w-[90px] z-20 pointer-events-none animate-crow-left select-none">
              <div className="relative w-full aspect-[75/95]">
                <Image
                  src="/masterplan_birds_left.png"
                  alt="Soaring birds flock"
                  fill
                  className="object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
                />
              </div>
            </div>

            {/* Masterplan Image Container */}
            <div className="relative w-full h-[280px] sm:h-[380px] md:h-[420px] lg:h-[450px] select-none scale-100 sm:scale-[1.03] lg:scale-[1.05] transition-transform duration-500 ease-out">
              <Image
                src="/masterplan_zoomed.png"
                alt="A Well-Planned Community Masterplan"
                fill
                priority
                className="object-contain"
              />

              {/* Pin Tooltips */}
              <div className="absolute top-[12%] sm:top-[16%] left-[50%] sm:left-[46%] -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold shadow-md flex items-center gap-1 sm:gap-1.5 border border-amber-200/80 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap z-10">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D61F69] flex-shrink-0" />
                <span>Plots Area</span>
              </div>

              <div className="absolute top-[38%] sm:top-[42%] left-[4%] sm:left-[14%] lg:left-[20%] bg-white/95 backdrop-blur-sm text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold shadow-md flex items-center gap-1 sm:gap-1.5 border border-amber-200/80 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap z-10">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] flex-shrink-0" />
                <span>Children&apos;s Park</span>
              </div>

              <div className="absolute top-[54%] sm:top-[48%] right-[4%] sm:right-[10%] lg:right-[14%] bg-white/95 backdrop-blur-sm text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold shadow-md flex items-center gap-1 sm:gap-1.5 border border-amber-200/80 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap z-10">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#3B82F6] flex-shrink-0" />
                <span>Clubhouse</span>
              </div>

              <div className="absolute bottom-[10%] sm:bottom-[16%] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold shadow-md flex items-center gap-1 sm:gap-1.5 border border-amber-200/80 hover:scale-105 transition-transform cursor-pointer whitespace-nowrap z-10">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Main Entry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LIFESTYLE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-1.5 mb-6">
          <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
            LIFESTYLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
            Designed for Your Everyday
          </h2>
          <p className="text-[15px] text-gray-700 max-w-2xl leading-relaxed">
            Open spaces, fresh air and a peaceful community — the perfect setting for a better life tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Card 1: Family-friendly Environment */}
          <Link
            href="/contact"
            className="relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer border border-amber-200/60 block"
          >
            <Image
              src="/lifestyle_family.jpg"
              alt="Family-friendly Environment in Sree Hari Gated Community"
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Community
              </span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <span className="text-base sm:text-lg font-bold block leading-snug drop-shadow-sm">
                  Family-friendly Environment
                </span>
                <span className="text-xs text-white/80 font-medium">Peaceful & secure avenues</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] group-hover:bg-[#f6d73c] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-all duration-300 ml-2">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Card 2: Parks & Green Spaces */}
          <Link
            href="/contact"
            className="relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer border border-amber-200/60 block"
          >
            <Image
              src="/lifestyle_parks.jpg"
              alt="Parks and Green Landscaped Spaces"
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Nature
              </span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <span className="text-base sm:text-lg font-bold block leading-snug drop-shadow-sm">
                  Parks & Green Spaces
                </span>
                <span className="text-xs text-white/80 font-medium">Lush greenery & gardens</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] group-hover:bg-[#f6d73c] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-all duration-300 ml-2">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Card 3: Children's Play Areas */}
          <Link
            href="/contact"
            className="relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer border border-amber-200/60 block"
          >
            <Image
              src="/lifestyle_kids.jpg"
              alt="Children's Play Areas in Gated Community"
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Recreation
              </span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <span className="text-base sm:text-lg font-bold block leading-snug drop-shadow-sm">
                  Children&apos;s Play Areas
                </span>
                <span className="text-xs text-white/80 font-medium">Safe equipment & parks</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] group-hover:bg-[#f6d73c] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-all duration-300 ml-2">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Card 4: Wellness & Active Living */}
          <Link
            href="/contact"
            className="relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer border border-amber-200/60 block"
          >
            <Image
              src="/lifestyle_wellness.jpg"
              alt="Wellness and Active Living Walking Tracks"
              fill
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                Fitness
              </span>
            </div>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
              <div>
                <span className="text-base sm:text-lg font-bold block leading-snug drop-shadow-sm">
                  Wellness & Active Living
                </span>
                <span className="text-xs text-white/80 font-medium">Jogging & walking tracks</span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] group-hover:bg-[#f6d73c] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-all duration-300 ml-2">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. LOCATION ADVANTAGE WITH TAMIL NADU & TRICHY GEOGRAPHIC SPOKE MAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#fef9e6] p-6 sm:p-8 rounded-3xl border border-amber-200/80 shadow-sm">
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                LOCATION ADVANTAGE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] leading-tight tracking-tight">
                Well Connected <br />
                in the Heart of <br className="hidden sm:inline" />
                <span className="text-[#D61F69]">Trichy</span>
              </h2>
            </div>

            <p className="text-[14px] sm:text-[15px] text-gray-700 leading-relaxed">
              Prime location in <strong>Trichy</strong> with rapid highway access to top universities, medical colleges, the International Airport, and the Panjappur Integrated Bus Terminal.
            </p>

            <div className="pt-2">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 text-xs sm:text-[13px] font-extrabold text-[#006452] bg-[#f7db49] hover:bg-[#f6d73c] px-6 py-3 rounded-full shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
              >
                <span>Book a Site Visit</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 bg-gradient-to-b from-white via-[#fffef7] to-[#fef9e6] p-3 sm:p-5 rounded-3xl border border-amber-200/90 shadow-sm relative overflow-hidden">
            <LocationAdvantageMap />
          </div>
        </div>
      </section>

      {/* 7. YOUR JOURNEY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative overflow-hidden">
        <div className="absolute -top-10 left-0 sm:left-4 md:left-8 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.20] pointer-events-none z-0">
          <Image src="/lotus_icon.png" alt="" fill className="object-contain" />
        </div>

        <div className="max-w-xl mx-auto space-y-1.5 relative z-10">
          <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
            YOUR JOURNEY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
            From Land to a Lifetime of Memories
          </h2>
          <p className="text-xs text-gray-600">
            A seamless 5-step journey towards owning your ideal plot in a secure gated community.
          </p>
        </div>

        <div className="relative z-10">
          <div className="hidden md:block absolute top-1/2 left-[8%] right-[8%] -translate-y-7 h-[2px] bg-gradient-to-r from-amber-200 via-pink-200 to-emerald-200 z-0 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
            {/* Step 01 */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <span className="w-9 h-9 rounded-full bg-white text-[#D61F69] group-hover:bg-[#D61F69] group-hover:text-white font-extrabold text-xs flex items-center justify-center mx-auto shadow-xs border border-pink-200 transition-colors duration-300">
                  01
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-pink-50 text-gray-700 group-hover:text-[#D61F69] flex items-center justify-center transition-colors duration-300">
                <Search className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#006452] group-hover:text-[#D61F69] transition-colors">
                  Explore
                </h4>
                <p className="text-xs text-gray-500 font-medium">Our Projects</p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <span className="w-9 h-9 rounded-full bg-white text-[#D61F69] group-hover:bg-[#D61F69] group-hover:text-white font-extrabold text-xs flex items-center justify-center mx-auto shadow-xs border border-pink-200 transition-colors duration-300">
                  02
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-pink-50 text-gray-700 group-hover:text-[#D61F69] flex items-center justify-center transition-colors duration-300">
                <MapPin className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#006452] group-hover:text-[#D61F69] transition-colors">
                  Choose
                </h4>
                <p className="text-xs text-gray-500 font-medium">Your Plot</p>
              </div>
            </div>

            {/* Step 03 */}
            <div 
              onClick={() => handleOpenEnquiry('Site Visit Booking - Your Journey')}
              className="group relative p-5 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border-2 border-amber-300/80 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out text-center space-y-3 flex flex-col items-center cursor-pointer"
            >
              <div className="relative">
                <span className="w-9 h-9 rounded-full bg-[#f7db49] text-[#006452] font-extrabold text-xs flex items-center justify-center mx-auto shadow-sm border border-amber-300">
                  03
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 group-hover:bg-[#f7db49] text-[#006452] flex items-center justify-center transition-colors duration-300">
                <CalendarCheck className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#006452] group-hover:text-[#D61F69] transition-colors">
                  Book
                </h4>
                <p className="text-xs text-gray-500 font-medium">A Site Visit</p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <span className="w-9 h-9 rounded-full bg-white text-[#D61F69] group-hover:bg-[#D61F69] group-hover:text-white font-extrabold text-xs flex items-center justify-center mx-auto shadow-xs border border-pink-200 transition-colors duration-300">
                  04
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-pink-50 text-gray-700 group-hover:text-[#D61F69] flex items-center justify-center transition-colors duration-300">
                <FileCheck className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#006452] group-hover:text-[#D61F69] transition-colors">
                  Complete
                </h4>
                <p className="text-xs text-gray-500 font-medium">The Purchase</p>
              </div>
            </div>

            {/* Step 05 */}
            <div className="group relative p-5 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out text-center space-y-3 flex flex-col items-center">
              <div className="relative">
                <span className="w-9 h-9 rounded-full bg-white text-[#D61F69] group-hover:bg-[#D61F69] group-hover:text-white font-extrabold text-xs flex items-center justify-center mx-auto shadow-xs border border-pink-200 transition-colors duration-300">
                  05
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-emerald-50 text-gray-700 group-hover:text-[#006452] flex items-center justify-center transition-colors duration-300">
                <Home className="w-5 h-5 transition-transform group-hover:scale-110 duration-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#006452] group-hover:text-[#006452] transition-colors">
                  Build
                </h4>
                <p className="text-xs text-gray-500 font-medium">Your Future Home</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST & CREDIBILITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-xl mx-auto space-y-1">
          <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
            TRUST & CREDIBILITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
            A Name You Can Trust
          </h2>
          <p className="text-xs text-gray-600">
            Our commitment to quality, transparency and customer satisfaction has earned the trust of many families.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-2 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out group">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006452] block tracking-tight">100+</span>
            <span className="text-xs text-gray-600 font-medium">Happy Families</span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-2 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out group">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Building className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006452] block tracking-tight">3+</span>
            <span className="text-xs text-gray-600 font-medium">Ongoing Projects</span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-2 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out group">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006452] block tracking-tight">5+</span>
            <span className="text-xs text-gray-600 font-medium">Years of Experience</span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-2 shadow-2xs hover:shadow-[0_16px_32px_-12px_rgba(0,100,82,0.18)] hover:border-emerald-300/80 hover:-translate-y-1.5 transition-all duration-500 ease-out group">
            <div className="w-10 h-10 rounded-full bg-pink-50 text-[#D61F69] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006452] block tracking-tight">100+</span>
            <span className="text-xs text-gray-600 font-medium">Acres Planned</span>
          </div>
        </div>
      </section>

      {/* 9. READY TO FIND YOUR PERFECT PLOT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl px-6 sm:px-14 md:px-20 lg:px-28 py-10 sm:py-14 border border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden bg-[#fef9e6]">
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
              Ready to Find <span className="text-[#D61F69]">Your Perfect Plot?</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed">
              Get in touch with our team and take the first step towards your dream DTCP & RERA approved property.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-4 relative z-10 flex-shrink-0">
            <button
              onClick={() => handleOpenEnquiry()}
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
              <span>Talk to Our Team</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        propertyName={activeProject}
      />
    </div>
  );
}
