'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { properties, Property, COMPANY_PHONE, COMPANY_PHONE_RAW, TAMIL_NADU_DISTRICTS } from '@/data/properties';
import PropertyCard from '@/components/PropertyCard';
import EnquiryModal from '@/components/EnquiryModal';
import LocationAdvantageMap from '@/components/LocationAdvantageMap';
import HeroCarousel from '@/components/HeroCarousel';
import { HeroBanner } from '@/lib/types';
import { api } from '@/lib/api';
import { mapProjectRecordToProperty } from './properties/PropertiesClient';

function StatCounter({ end, suffix = '+' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800; // ms
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOutProgress * end);
            setCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

const LIFESTYLE_ITEMS = [
  {
    id: 'family',
    tag: 'Community',
    title: 'Family-friendly Environment',
    subtitle: 'Peaceful & secure avenues',
    image: '/lifestyle_family.jpg',
    alt: 'Family-friendly Environment in Sree Hari Gated Community',
  },
  {
    id: 'parks',
    tag: 'Nature',
    title: 'Parks & Green Spaces',
    subtitle: 'Lush greenery & gardens',
    image: '/lifestyle_parks.jpg',
    alt: 'Parks and Green Landscaped Spaces',
  },
  {
    id: 'kids',
    tag: 'Recreation',
    title: "Children's Play Areas",
    subtitle: 'Safe equipment & parks',
    image: '/lifestyle_kids.jpg',
    alt: "Children's Play Areas in Gated Community",
  },
  {
    id: 'wellness',
    tag: 'Fitness',
    title: 'Wellness & Active Living',
    subtitle: 'Jogging & walking tracks',
    image: '/lifestyle_wellness.jpg',
    alt: 'Wellness and Active Living Walking Tracks',
  },
  {
    id: 'temple',
    tag: 'Spirituality',
    title: 'Community Temple',
    subtitle: 'Sacred peace & daily blessings',
    image: '/lifestyle_temple.jpg',
    alt: 'Community Temple inside Gated Community',
  },
];

const LOOPED_LIFESTYLE_ITEMS = [
  ...LIFESTYLE_ITEMS,
  ...LIFESTYLE_ITEMS,
  ...LIFESTYLE_ITEMS,
];

export default function HomeClient({ initialProjects }: { initialProjects?: any[] }) {
  const [selectedLocation, setSelectedLocation] = useState('Trichy (Tiruchirappalli)');
  const [selectedPlotSize, setSelectedPlotSize] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | undefined>(undefined);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [autoplayInterval, setAutoplayInterval] = useState<number>(6);

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

    async function loadSettings() {
      try {
        const res = await api.getPublicSettings();
        if (res && res.success && res.data) {
          if (Array.isArray(res.data.hero_banners)) {
            setHeroBanners(res.data.hero_banners);
          }
          if (res.data.hero_autoplay_interval) {
            setAutoplayInterval(Number(res.data.hero_autoplay_interval) || 6);
          }
        }
      } catch {
        // Silently keep default fallback
      }
    }

    loadProjects();
    loadSettings();
  }, [initialProjects]);

  const featuredProperties = (liveProperties.length > 0 ? liveProperties : properties).slice(0, 3);

  const handleOpenEnquiry = (projectName?: string) => {
    setActiveProject(projectName);
    setIsEnquiryOpen(true);
  };

  const lifestyleScrollRef = useRef<HTMLDivElement>(null);
  const [isLifestyleHovered, setIsLifestyleHovered] = useState(false);

  const getCardStep = () => {
    if (!lifestyleScrollRef.current) return 340;
    const firstChild = lifestyleScrollRef.current.firstElementChild as HTMLElement | null;
    return firstChild ? firstChild.offsetWidth + 20 : 340;
  };

  // On mount: start at middle set of cards for seamless bidirectional navigation
  useEffect(() => {
    const container = lifestyleScrollRef.current;
    if (!container) return;
    const step = getCardStep();
    const singleSetWidth = LIFESTYLE_ITEMS.length * step;
    container.scrollLeft = singleSetWidth;
  }, []);

  const scrollLifestyle = (direction: 'left' | 'right') => {
    const container = lifestyleScrollRef.current;
    if (!container) return;
    const step = getCardStep();
    const singleSetWidth = LIFESTYLE_ITEMS.length * step;

    if (direction === 'right' && container.scrollLeft >= singleSetWidth * 2 - 10) {
      container.scrollLeft -= singleSetWidth;
    } else if (direction === 'left' && container.scrollLeft <= singleSetWidth / 2) {
      container.scrollLeft += singleSetWidth;
    }

    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Passive listener to silently reposition when user scrolls near track ends (e.g. mobile swipe)
  useEffect(() => {
    const container = lifestyleScrollRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!container) return;
        const step = getCardStep();
        const singleSetWidth = LIFESTYLE_ITEMS.length * step;
        if (container.scrollLeft >= singleSetWidth * 2 - 10) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 20) {
          container.scrollLeft += singleSetWidth;
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Smooth periodic auto-scroll that advances one card at a time and loops seamlessly forward forever
  useEffect(() => {
    if (isLifestyleHovered) return;

    const interval = setInterval(() => {
      const container = lifestyleScrollRef.current;
      if (!container) return;

      const step = getCardStep();
      const singleSetWidth = LIFESTYLE_ITEMS.length * step;

      // If at or past the end of the second set, seamlessly wrap back to identical first/second set position without animation
      if (container.scrollLeft >= singleSetWidth * 2 - 10) {
        container.scrollLeft -= singleSetWidth;
      }

      // Smoothly advance 1 card forward
      container.scrollBy({ left: step, behavior: 'smooth' });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLifestyleHovered]);

  return (
    <div className="space-y-6 sm:space-y-12 pb-10 bg-[#fef9e6] font-sans">
      {/* 1. HERO SECTION CAROUSEL WITH DUAL-MODE SUPPORT (ZERO-CROP GRAPHIC FLYERS & DYNAMIC TEXT) */}
      <HeroCarousel
        banners={heroBanners}
        autoplayInterval={autoplayInterval}
        onOpenEnquiry={handleOpenEnquiry}
      />

      {/* 2. FEATURED PROJECTS SECTION (RECENTLY CREATED 3 PROJECTS FROM DATABASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 sm:pt-2">
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
            <div className="absolute -top-6 sm:-top-8 lg:-top-10 right-3 sm:right-6 lg:right-8 pointer-events-none z-10 select-none flex flex-col items-center">
              <span className="text-[10px] sm:text-[11px] font-black text-gray-800 tracking-tighter leading-none mb-0.5">N</span>
              <svg width="24" height="28" viewBox="0 0 36 36" fill="none" className="drop-shadow-xs sm:w-[26px] sm:h-[30px]">
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

            {/* Right Airspace (Soaring flock in the clear sky beside compass) */}
            <div className="absolute -top-[4%] sm:-top-[6%] lg:-top-[8%] right-[20%] sm:right-[18%] lg:right-[15%] w-[38px] sm:w-[55px] lg:w-[72px] z-20 pointer-events-none animate-crow-right select-none">
              <div className="relative w-full aspect-[463/525]">
                <Image
                  src="/masterplan_birds_right.png"
                  alt="Soaring birds flock right"
                  fill
                  className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                />
              </div>
            </div>

            {/* Left Airspace (Ascending flock in the clear sky beside layout) */}
            <div className="absolute top-[0%] sm:top-[1%] lg:top-[2%] left-[1%] sm:left-[-4%] lg:left-[-7%] w-[48px] sm:w-[72px] lg:w-[86px] z-20 pointer-events-none animate-crow-left select-none">
              <div className="relative w-full aspect-[459/646]">
                <Image
                  src="/masterplan_birds_left.png"
                  alt="Ascending crows flock left"
                  fill
                  className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
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

      {/* 5. LIFESTYLE SECTION WITH HORIZONTAL SNAP SCROLL & 5TH TEMPLE CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div className="space-y-1.5">
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

          {/* Navigation Scroll Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => scrollLifestyle('left')}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full bg-white border border-amber-200/90 text-[#006452] hover:bg-[#f7db49] shadow-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollLifestyle('right')}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full bg-white border border-amber-200/90 text-[#006452] hover:bg-[#f7db49] shadow-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Track with Seamless Looping Cards */}
        <div
          ref={lifestyleScrollRef}
          onMouseEnter={() => setIsLifestyleHovered(true)}
          onMouseLeave={() => setIsLifestyleHovered(false)}
          onTouchStart={() => setIsLifestyleHovered(true)}
          onTouchEnd={() => setIsLifestyleHovered(false)}
          className="flex overflow-x-auto gap-5 snap-x snap-mandatory scrollbar-none pb-4 pt-1"
        >
          {LOOPED_LIFESTYLE_ITEMS.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href="/contact"
              className="w-full sm:w-[calc(50%-10px)] lg:w-[calc((100%-2.5rem)/3)] flex-shrink-0 snap-center sm:snap-start relative h-72 sm:h-80 md:h-[340px] rounded-3xl overflow-hidden shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-2 transition-all duration-500 ease-out group cursor-pointer border border-amber-200/60 block"
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                  {item.tag}
                </span>
              </div>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white z-10">
                <div>
                  <span className="text-base sm:text-lg font-bold block leading-snug drop-shadow-sm">
                    {item.title}
                  </span>
                  <span className="text-xs text-white/80 font-medium">{item.subtitle}</span>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] group-hover:bg-[#f6d73c] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-all duration-300 ml-2">
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative overflow-hidden">
        {/* Subtle Background Lotus */}
        <div className="absolute -top-10 left-0 sm:left-4 md:left-8 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.16] pointer-events-none z-0">
          <Image src="/lotus_icon.png" alt="" fill className="object-contain" />
        </div>

        {/* Section Header */}
        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-widest block">
            YOUR BUYING ROADMAP
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#006452] tracking-tight">
            From Land to a Lifetime of Memories
          </h2>
          <p className="text-xs sm:text-[13px] text-gray-600 max-w-lg mx-auto leading-relaxed">
            A seamless, guided 5-step journey towards owning DTCP & RERA approved land in prime growth corridors.
          </p>
        </div>

        {/* Milestone Cards Grid with Connecting Visual Flow */}
        <div className="relative z-10 pt-2 pb-4">
          {/* Desktop Connecting Highway Bar */}
          <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-emerald-400 via-amber-400 via-[#D61F69] to-emerald-500 z-0 opacity-40 rounded-full" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10 items-stretch">
            {/* Step 01: Discover */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] p-5 sm:p-6 border border-amber-200/80 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(0,100,82,0.18)] hover:border-emerald-300 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden text-left">
              {/* Background Number Watermark */}
              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-amber-100/40 select-none pointer-events-none group-hover:text-emerald-100/60 transition-colors">
                01
              </span>

              <div className="space-y-4 relative z-10">
                {/* Milestone Node */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006452] border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                    <Search className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Step 01
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-[15px] sm:text-base text-[#006452] group-hover:text-[#D61F69] transition-colors leading-snug">
                    Explore Projects
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Browse prime DTCP & RERA approved communities across Trichy growth hubs.
                  </p>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="pt-4 border-t border-amber-100/80 mt-4 relative z-10 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span>Clear Titles</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Step 02: Select */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] p-5 sm:p-6 border border-amber-200/80 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(0,100,82,0.18)] hover:border-emerald-300 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden text-left">
              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-amber-100/40 select-none pointer-events-none group-hover:text-amber-100/70 transition-colors">
                02
              </span>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] transition-all duration-300">
                    <MapPin className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Step 02
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-[15px] sm:text-base text-[#006452] group-hover:text-[#D61F69] transition-colors leading-snug">
                    Choose Your Plot
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Pick your ideal size, direction, and corner lot with transparent masterplan pricing.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100/80 mt-4 relative z-10 flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span>Custom Sizes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Step 03: VIP Experience (FEATURED HERO CARD) */}
            <div 
              onClick={() => handleOpenEnquiry('Site Visit Booking - Your Journey')}
              className="group relative rounded-3xl bg-gradient-to-b from-[#fffef5] via-white to-[#fef6dc] p-5 sm:p-6 border-2 border-amber-400 shadow-md hover:shadow-[0_24px_45px_-10px_rgba(214,31,105,0.22)] hover:border-[#D61F69] hover:-translate-y-2.5 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden text-left cursor-pointer ring-4 ring-amber-300/20"
            >
              {/* Highlight Ribbon */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-[#D61F69] to-[#BE185D] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                Guided Tour
              </div>

              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-pink-100/50 select-none pointer-events-none group-hover:text-pink-100/80 transition-colors">
                03
              </span>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#f7db49] text-[#006452] border border-amber-300 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#D61F69] group-hover:text-white transition-all duration-300">
                    <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D61F69] bg-pink-100/90 px-2 py-0.5 rounded-full border border-pink-200 mr-14 sm:mr-0">
                    Step 03
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-[15px] sm:text-base text-[#006452] group-hover:text-[#D61F69] transition-colors leading-snug flex items-center gap-1.5">
                    <span>Book Site Visit</span>
                  </h3>
                  <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                    Walk the community in person with our executive guided property tour.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-200 mt-4 relative z-10">
                <button
                  type="button"
                  className="w-full bg-[#f7db49] hover:bg-[#f6d73c] group-hover:bg-[#D61F69] text-[#006452] group-hover:text-white text-xs font-black py-2 px-3 rounded-xl transition-all duration-300 shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Book Site Visit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 04: Secure */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] p-5 sm:p-6 border border-amber-200/80 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(0,100,82,0.18)] hover:border-emerald-300 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden text-left">
              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-amber-100/40 select-none pointer-events-none group-hover:text-blue-100/70 transition-colors">
                04
              </span>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] transition-all duration-300">
                    <FileCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Step 04
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-[15px] sm:text-base text-[#006452] group-hover:text-[#D61F69] transition-colors leading-snug">
                    Complete Purchase
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Transparent registration, bank loan clearance, and immediate deed handover.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100/80 mt-4 relative z-10 flex items-center justify-between text-[11px] font-bold text-blue-700">
                <span>Bank Loan Ready</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Step 05: Build */}
            <div className="group relative rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] p-5 sm:p-6 border border-amber-200/80 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(0,100,82,0.18)] hover:border-emerald-300 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden text-left">
              <span className="absolute -bottom-3 -right-2 text-7xl font-black text-amber-100/40 select-none pointer-events-none group-hover:text-emerald-100/70 transition-colors">
                05
              </span>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006452] border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] transition-all duration-300">
                    <Home className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Step 05
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-[15px] sm:text-base text-[#006452] group-hover:text-[#D61F69] transition-colors leading-snug">
                    Build Your Home
                  </h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Begin construction immediately with 24/7 security, blacktop roads & water.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-100/80 mt-4 relative z-10 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span>Immediate Handover</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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

        {/* Alternating Zigzag Cards with Smooth Scroll Count-Up */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 pb-8 sm:py-10">
          {/* Card 1: Happy Families (Base position / Lower) */}
          <div className="translate-y-2 sm:translate-y-4 lg:translate-y-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-3 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-0.5 sm:hover:translate-y-2 lg:hover:translate-y-4 transition-all duration-500 ease-out group">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] border border-pink-100/80 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] group-hover:border-amber-300 transition-all duration-300">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006452] block tracking-tight">
                <StatCounter end={100} suffix="+" />
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-bold block">
                Happy Families
              </span>
            </div>
          </div>

          {/* Card 2: Ongoing Projects (Lifted / Upward) */}
          <div className="-translate-y-2 sm:-translate-y-4 lg:-translate-y-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-3 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-4 sm:hover:-translate-y-6 lg:hover:-translate-y-8 transition-all duration-500 ease-out group">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] border border-pink-100/80 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] group-hover:border-amber-300 transition-all duration-300">
              <Building className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006452] block tracking-tight">
                <StatCounter end={3} suffix="+" />
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-bold block">
                Ongoing Projects
              </span>
            </div>
          </div>

          {/* Card 3: Years of Experience (Base position / Lower) */}
          <div className="translate-y-2 sm:translate-y-4 lg:translate-y-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-3 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-0.5 sm:hover:translate-y-2 lg:hover:translate-y-4 transition-all duration-500 ease-out group">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] border border-pink-100/80 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] group-hover:border-amber-300 transition-all duration-300">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006452] block tracking-tight">
                <StatCounter end={5} suffix="+" />
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-bold block">
                Years of Experience
              </span>
            </div>
          </div>

          {/* Card 4: Acres Planned (Lifted / Upward) */}
          <div className="-translate-y-2 sm:-translate-y-4 lg:-translate-y-6 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 text-center space-y-3 shadow-2xs hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:border-emerald-300/80 hover:-translate-y-4 sm:hover:-translate-y-6 lg:hover:-translate-y-8 transition-all duration-500 ease-out group">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-[#D61F69] border border-pink-100/80 flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 group-hover:bg-[#f7db49] group-hover:text-[#006452] group-hover:border-amber-300 transition-all duration-300">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006452] block tracking-tight">
                <StatCounter end={100} suffix="+" />
              </span>
              <span className="text-xs sm:text-sm text-gray-600 font-bold block">
                Acres Planned
              </span>
            </div>
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
