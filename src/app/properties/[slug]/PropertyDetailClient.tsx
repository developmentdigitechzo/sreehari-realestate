'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  COMPANY_PHONE,
  COMPANY_PHONE_RAW,
  COMPANY_WHATSAPP,
} from '@/data/properties';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  Trees,
  Sun,
  Droplets,
  Milestone,
  Fence,
  Sparkles,
  Zap,
  Award,
  ArrowLeft,
  Send,
  CheckCircle,
  ExternalLink,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Video,
  Play,
  X,
  Compass,
  GraduationCap,
  Plane,
  HeartPulse,
  ShoppingBag,
  Building,
  Filter,
  Eye,
  Info,
  Edit3,
  Plus,
  Lock
} from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';
import { WhatsAppSvgIcon } from '@/components/FloatingCTA';
import { api } from '@/lib/api';

export default function PropertyDetailClient({ property }: { property: any }) {
  // Live state with hydration from backend
  const [currentProject, setCurrentProject] = useState<any>(property);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPlotName, setEnquiryPlotName] = useState<string | undefined>(undefined);

  // Plot Details Modal state
  const [selectedPlot, setSelectedPlot] = useState<any | null>(null);

  // Plot filtering states
  const [plotFacingFilter, setPlotFacingFilter] = useState('All');
  const [plotStatusFilter, setPlotStatusFilter] = useState('All');

  // Location Advantages category tab
  const [activeLocationCategory, setActiveLocationCategory] = useState('All');

  // Video modal / player state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Inline enquiry form state
  const [inlineForm, setInlineForm] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
    preferredVariant: '',
    visitDate: '',
    visitTime: '',
    message: '',
  });
  const [inlineSubmitted, setInlineSubmitted] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [showGreetingPopup, setShowGreetingPopup] = useState(false);

  // Authorized Admin / Staff detection (for preview link only)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('crm_auth_token') || localStorage.getItem('sree_hari_token');
      if (token) {
        setIsAdmin(true);
      }
    }
  }, []);

  // Hydrate from live backend on client mount to ensure fresh CRM updates
  useEffect(() => {
    async function hydrateProject() {
      try {
        const res = await api.getPublicProjectBySlug(property.slug);
        if (res && res.success && res.data) {
          setCurrentProject((prev: any) => ({
            ...prev,
            ...res.data,
            plots: Array.isArray(res.data.plots) && res.data.plots.length > 0 ? res.data.plots : prev.plots
          }));
        }
      } catch (err) {
        // Keeps initial property values
      }
    }
    hydrateProject();
  }, [property.slug]);

  // Project Gallery Category filter & viewer state (strictly project-level media)
  const [galleryFilter, setGalleryFilter] = useState<'All' | 'Project' | 'Videos'>('All');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isGalleryLightboxOpen, setIsGalleryLightboxOpen] = useState(false);
  const [activePlotMediaIndex, setActivePlotMediaIndex] = useState(0);

  // Merge images list fallback for backward compatibility
  const projectImages: string[] = useMemo(() => {
    const list: string[] = [];
    if (currentProject.heroImage) list.push(currentProject.heroImage);
    if (currentProject.banner_image && !list.includes(currentProject.banner_image)) {
      list.push(currentProject.banner_image);
    }
    if (Array.isArray(currentProject.gallery_images)) {
      currentProject.gallery_images.forEach((img: string) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (Array.isArray(currentProject.images)) {
      currentProject.images.forEach((img: string) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/project_park_avenue_new.jpg'];
  }, [currentProject]);

  // Plots list (combines backend plots and plotVariants fallback, with strictly NO price exposed)
  const plotsList = useMemo(() => {
    if (Array.isArray(currentProject.plots) && currentProject.plots.length > 0) {
      return currentProject.plots;
    }
    // Fallback to plotVariants
    if (Array.isArray(currentProject.plotVariants)) {
      return currentProject.plotVariants.map((v: any, idx: number) => ({
        id: `variant-${idx}`,
        plot_number: `Plot Variant #${idx + 1}`,
        dimension_str: v.dimension,
        dimension: v.dimension,
        area_sqft: v.sqft,
        facing: v.facing,
        status: v.status || 'Available',
        approval_status: currentProject.dtcpNumber || '100% DTCP Approved',
        description: `Premium ${v.facing} plot measuring ${v.dimension} (${v.sqft} Sq.Ft) with sweet groundwater access and blacktop road frontage.`,
        primary_image_url: currentProject.heroImage || '/project_park_avenue_new.jpg',
        gallery_images: []
      }));
    }
    return [];
  }, [currentProject]);

  // Project-Only Gallery (Cover, Layout Photos, Project Video Tour - strictly NO plot media)
  const unifiedGallery = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'image' | 'video';
      url: string;
      badge: string;
      subbadge: string;
      caption: string;
      category: 'Project' | 'Videos';
    }> = [];

    const seenUrls = new Set<string>();

    // 1. Project Cover
    const coverUrl = currentProject.heroImage || currentProject.banner_image || '/project_park_avenue_new.jpg';
    if (coverUrl && !seenUrls.has(coverUrl)) {
      seenUrls.add(coverUrl);
      list.push({
        id: 'proj-cover',
        type: 'image',
        url: coverUrl,
        badge: 'Project Cover',
        subbadge: currentProject.title || currentProject.name || 'Layout',
        caption: `${currentProject.title} — Main Entrance & Master Layout`,
        category: 'Project'
      });
    }

    // 2. Project Gallery Images
    if (Array.isArray(currentProject.gallery_images)) {
      currentProject.gallery_images.forEach((img: string, idx: number) => {
        if (img && !seenUrls.has(img)) {
          seenUrls.add(img);
          list.push({
            id: `proj-gallery-${idx}`,
            type: 'image',
            url: img,
            badge: 'Project Infrastructure',
            subbadge: currentProject.title,
            caption: `${currentProject.title} — On-Ground Infrastructure Photo #${idx + 1}`,
            category: 'Project'
          });
        }
      });
    }

    // 3. Project Walkthrough Video
    if (currentProject.video_url && !seenUrls.has(currentProject.video_url)) {
      seenUrls.add(currentProject.video_url);
      list.push({
        id: 'proj-video',
        type: 'video',
        url: currentProject.video_url,
        badge: 'Project Video Tour',
        subbadge: currentProject.title,
        caption: `${currentProject.title} — Video Tour & Aerial Drone View`,
        category: 'Videos'
      });
    }

    return list.length > 0
      ? list
      : [{
          id: 'fallback-cover',
          type: 'image' as const,
          url: '/project_park_avenue_new.jpg',
          badge: 'Project Cover',
          subbadge: currentProject.title || 'Layout',
          caption: currentProject.title,
          category: 'Project' as const
        }];
  }, [currentProject]);

  // Filtered gallery items
  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'All') return unifiedGallery;
    if (galleryFilter === 'Videos') return unifiedGallery.filter((item) => item.type === 'video');
    return unifiedGallery.filter((item) => item.category === galleryFilter);
  }, [unifiedGallery, galleryFilter]);

  const activeMediaItem = filteredGallery[activeGalleryIndex] || filteredGallery[0] || unifiedGallery[0];

  const handlePrevGalleryMedia = () => {
    setActiveGalleryIndex((prev) => (prev - 1 + filteredGallery.length) % filteredGallery.length);
  };

  const handleNextGalleryMedia = () => {
    setActiveGalleryIndex((prev) => (prev + 1) % filteredGallery.length);
  };

  // Keyboard navigation for gallery lightbox
  useEffect(() => {
    if (!isGalleryLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsGalleryLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrevGalleryMedia();
      if (e.key === 'ArrowRight') handleNextGalleryMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryLightboxOpen, filteredGallery.length]);

  // Filtered plots
  const filteredPlots = useMemo(() => {
    return plotsList.filter((p: any) => {
      const matchFacing =
        plotFacingFilter === 'All' ||
        (p.facing && p.facing.toLowerCase().includes(plotFacingFilter.toLowerCase()));
      const matchStatus =
        plotStatusFilter === 'All' ||
        (p.status && p.status.toLowerCase().includes(plotStatusFilter.toLowerCase()));
      return matchFacing && matchStatus;
    });
  }, [plotsList, plotFacingFilter, plotStatusFilter]);

  // Location advantages list
  const rawLandmarks: any[] = useMemo(() => {
    if (Array.isArray(currentProject.nearby_landmarks) && currentProject.nearby_landmarks.length > 0) {
      return currentProject.nearby_landmarks;
    }
    if (Array.isArray(currentProject.locationAdvantages)) {
      return currentProject.locationAdvantages;
    }
    return [];
  }, [currentProject]);

  // Filtered location advantages by category
  const filteredLandmarks = useMemo(() => {
    if (activeLocationCategory === 'All') return rawLandmarks;
    return rawLandmarks.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      const landName = (item.landmark || '').toLowerCase();
      if (activeLocationCategory === 'Worship') {
        return cat === 'worship' || landName.includes('temple') || landName.includes('masjid') || landName.includes('church') || landName.includes('mosque');
      }
      if (activeLocationCategory === 'Education') {
        return cat === 'education' || landName.includes('college') || landName.includes('university') || landName.includes('school') || landName.includes('iim');
      }
      if (activeLocationCategory === 'Transit') {
        return cat === 'transit' || landName.includes('airport') || landName.includes('bus') || landName.includes('railway') || landName.includes('station') || landName.includes('highway');
      }
      if (activeLocationCategory === 'Healthcare') {
        return cat === 'healthcare' || landName.includes('hospital') || landName.includes('medical') || landName.includes('clinic');
      }
      return true;
    });
  }, [rawLandmarks, activeLocationCategory]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % projectImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
  };

  const handleOpenPlotEnquiry = (plot: any) => {
    setSelectedPlot(null); // Close plot modal
    setEnquiryPlotName(`${plot.plot_number} (${plot.dimension_str || plot.dimension})`);
    setIsEnquiryOpen(true);
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineLoading(true);
    setInlineError('');

    try {
      const notesContent = [
        inlineForm.budget ? `Preferred Budget: ${inlineForm.budget}` : null,
        inlineForm.preferredVariant ? `Plot: ${inlineForm.preferredVariant}` : null,
        inlineForm.message || null
      ].filter(Boolean).join(' | ');

      if (inlineForm.visitDate) {
        await api.submitPublicSiteVisit({
          customer_name: inlineForm.name,
          customer_phone: inlineForm.phone,
          customer_email: inlineForm.email,
          project_name: currentProject.title,
          visit_date: inlineForm.visitDate,
          visit_time: inlineForm.visitTime,
          preferred_plot_size: inlineForm.budget || inlineForm.preferredVariant,
          notes: notesContent,
          source: 'Property Detail Page',
        });
      } else {
        await api.submitPublicLead({
          name: inlineForm.name,
          phone: inlineForm.phone,
          email: inlineForm.email,
          preferred_plot_size: inlineForm.budget || inlineForm.preferredVariant,
          message: `[${currentProject.title}] ${notesContent}`.trim(),
          source: 'Property Detail Page',
          visit_date: inlineForm.visitDate,
          visit_time: inlineForm.visitTime,
        });
      }

      // Save to localStorage as backup
      try {
        const existingLeads = JSON.parse(localStorage.getItem('sree_hari_leads') || '[]');
        existingLeads.unshift({
          ...inlineForm,
          propertyName: currentProject.title,
          source: 'Property Detail Page',
          timestamp: new Date().toISOString(),
          id: 'LEAD-' + Date.now(),
        });
        localStorage.setItem('sree_hari_leads', JSON.stringify(existingLeads));
      } catch {}

      setInlineSubmitted(true);
      setShowGreetingPopup(true);

      // Reset form fields
      setInlineForm({
        name: '',
        phone: '',
        email: '',
        budget: '',
        preferredVariant: '',
        visitDate: '',
        visitTime: '',
        message: '',
      });
    } catch (err: any) {
      console.error('Property inline submit error:', err);
      setInlineError(err.message || 'Submission failed. Please try again.');
    } finally {
      setInlineLoading(false);
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#006452]" />,
    Milestone: <Milestone className="w-5 h-5 text-[#006452]" />,
    Trees: <Trees className="w-5 h-5 text-[#006452]" />,
    Sun: <Sun className="w-5 h-5 text-[#006452]" />,
    Droplets: <Droplets className="w-5 h-5 text-[#006452]" />,
    Fence: <Fence className="w-5 h-5 text-[#006452]" />,
    Sparkles: <Sparkles className="w-5 h-5 text-[#006452]" />,
    Zap: <Zap className="w-5 h-5 text-[#006452]" />,
    Award: <Award className="w-5 h-5 text-[#006452]" />,
  };

  const mapDirectionLink =
    currentProject.latitude && currentProject.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${currentProject.latitude},${currentProject.longitude}`
      : currentProject.mapUrl ||
        currentProject.google_maps_embed_url ||
        `https://maps.google.com/?q=${encodeURIComponent((currentProject.title || currentProject.name) + ' ' + (currentProject.location_area || currentProject.location || 'Trichy'))}`;

  const whatsappMessage = encodeURIComponent(
    `Hi Sree Hari Realty, I am interested in ${currentProject.title} (${currentProject.location}). Please send me the master layout plan and plot availability chart.`
  );

  return (
    <div className="min-h-screen bg-[#fef9e6] font-sans pb-16">
      {/* 1. HERO SECTION WITH RICH COVER IMAGE & ACTIONS */}
      <section className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        <Image
          src={projectImages[0]}
          alt={currentProject.title}
          fill
          priority
          quality={95}
          className="object-cover object-[center_35%]"
        />

        {/* Balanced Cinematic Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10 w-full space-y-5">
          {/* Back Navigation Button */}
          <div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/70 text-xs font-bold border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>All Plotted Communities</span>
            </Link>
          </div>

          <div className="max-w-3xl space-y-3.5">
            {/* Top Approval & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D61F69] text-white text-[11px] font-extrabold uppercase tracking-widest shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{currentProject.status}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 text-[11px] font-bold border border-emerald-400/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentProject.dtcpNumber || '100% DTCP Approved'}</span>
              </span>

              {currentProject.reraNumber && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-400/40">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentProject.reraNumber}</span>
                </span>
              )}
            </div>

            {/* Main Project Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              {currentProject.title}
            </h1>

            {/* Tagline */}
            <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed max-w-2xl drop-shadow-sm">
              {currentProject.tagline}
            </p>

            {/* Interactive Location Link */}
            <div className="pt-1">
              <a
                href={mapDirectionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/95 hover:text-amber-300 text-xs sm:text-sm font-semibold transition group/loc"
                title="Open exact Google Maps location"
              >
                <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover/loc:bg-[#D61F69] group-hover/loc:border-[#D61F69] transition">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 group-hover/loc:text-white" />
                </div>
                <span className="underline underline-offset-4">{currentProject.location}</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </a>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="#plot-inventory"
                className="bg-[#D61F69] hover:bg-[#be185d] text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Explore Plot Inventory</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setEnquiryPlotName(undefined);
                  setIsEnquiryOpen(true);
                }}
                className="bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Site Visit</span>
              </button>

              {currentProject.video_url && (
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-[#D61F69] fill-[#D61F69]" />
                  <span>Watch Video</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* LEFT 8 COLUMNS: Overview, Media Carousel, Plots, Location Advantages, Amenities */}
          <div className="lg:col-span-8 space-y-10">
            {/* 2.1 Overview & Key Metrics */}
            <section className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                  COMMUNITY OVERVIEW
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
                  About {currentProject.title}
                </h2>
              </div>

              {/* 4 Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-[#fef9e6] border border-amber-200/80">
                  <span className="block text-xl sm:text-2xl font-black text-[#006452]">
                    {currentProject.total_extent_acres || currentProject.total_acres || 5.37}
                  </span>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Acres Extent</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#fef9e6] border border-amber-200/80">
                  <span className="block text-xl sm:text-2xl font-black text-[#006452]">
                    {currentProject.total_plots_count || currentProject.total_plots || 101}
                  </span>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Total Plots</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#fef9e6] border border-amber-200/80">
                  <span className="block text-xl sm:text-2xl font-black text-[#006452]">
                    {currentProject.available_plots_count !== undefined
                      ? currentProject.available_plots_count
                      : (currentProject.availableUnits || 38)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Available Plots</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#fef9e6] border border-amber-200/80">
                  <span className="block text-xl sm:text-2xl font-black text-[#006452]">100%</span>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Sweet Water</span>
                </div>
              </div>

              {/* Description Paragraph */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                <p>{currentProject.description}</p>
              </div>

              {/* Highlights Checklist */}
              {Array.isArray(currentProject.highlights) && currentProject.highlights.length > 0 && (
                <div className="pt-2 border-t border-amber-100/80 space-y-3">
                  <h3 className="text-xs font-bold text-[#006452] uppercase tracking-wider">
                    Project Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentProject.highlights.map((highlight: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 2.2 Project Video Showcase Section (when video is available) */}
            {currentProject.video_url && (
              <section className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                      PROJECT MEDIA
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight">
                      Walkthrough & Drone Video
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D61F69] bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                    <Video className="w-3.5 h-3.5" />
                    <span>Live Video</span>
                  </div>
                </div>

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                  {currentProject.video_url.includes('youtube.com') || currentProject.video_url.includes('youtu.be') ? (
                    <iframe
                      src={currentProject.video_url.replace('watch?v=', 'embed/')}
                      title="Project Video Walkthrough"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      src={currentProject.video_url}
                      controls
                      poster={projectImages[0]}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </section>
            )}

            {/* 2.3 Project-Only Media Gallery */}
            <section className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                    PROJECT INFRASTRUCTURE GALLERY
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#006452] tracking-tight">
                    On-Ground Infrastructure & Layout Views
                  </h2>
                </div>
              </div>

              {/* Main Media Screen Viewer */}
              {filteredGallery.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative h-72 sm:h-[420px] w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-amber-200/80 group">
                    {activeMediaItem.type === 'video' ? (
                      activeMediaItem.url.includes('youtube.com') || activeMediaItem.url.includes('youtu.be') ? (
                        <iframe
                          src={activeMediaItem.url.replace('watch?v=', 'embed/')}
                          title={activeMediaItem.caption}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <video
                          key={activeMediaItem.url}
                          src={activeMediaItem.url}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <Image
                        src={activeMediaItem.url}
                        alt={activeMediaItem.caption}
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => setIsGalleryLightboxOpen(true)}
                      />
                    )}

                    {/* Media Identification Badge Overlay */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#006452]/90 backdrop-blur-md text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md border border-emerald-400/40">
                          {activeMediaItem.badge}
                        </span>
                        {activeMediaItem.type === 'video' && (
                          <span className="bg-[#D61F69] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Play className="w-3 h-3 fill-white" /> Video
                          </span>
                        )}
                      </div>
                      <span className="bg-black/75 backdrop-blur-md text-slate-200 text-[11px] font-semibold px-3 py-1 rounded-xl shadow-md border border-white/10 w-fit">
                        {activeMediaItem.subbadge}
                      </span>
                    </div>

                    {/* Expand Button */}
                    <button
                      type="button"
                      onClick={() => setIsGalleryLightboxOpen(true)}
                      className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer"
                      title="Expand Lightbox"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>

                    {/* Left / Right Navigation Controls */}
                    {filteredGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevGalleryMedia}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer hover:scale-105"
                          title="Previous Item"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextGalleryMedia}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer hover:scale-105"
                          title="Next Item"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Counter Pill */}
                    <div className="absolute bottom-3 right-4 z-20 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      {activeGalleryIndex + 1} / {filteredGallery.length}
                    </div>
                  </div>

                  {/* Thumbnails Row with Distinct Project vs Plot Badges */}
                  {filteredGallery.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1">
                      {filteredGallery.map((item, idx) => {
                        const isSelected = activeGalleryIndex === idx;
                        return (
                          <button
                            key={item.id || idx}
                            type="button"
                            onClick={() => setActiveGalleryIndex(idx)}
                            className={`group relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition cursor-pointer bg-slate-900 ${
                              isSelected
                                ? 'border-[#D61F69] ring-2 ring-[#D61F69]/40 scale-105'
                                : 'border-transparent opacity-75 hover:opacity-100 hover:border-emerald-400'
                            }`}
                          >
                            <Image
                              src={item.type === 'video' ? (currentProject.heroImage || '/project_park_avenue_new.jpg') : item.url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                            {item.type === 'video' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1 text-[9px] text-white font-bold truncate text-center">
                              {item.badge}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#fffdf8] rounded-2xl border border-amber-200">
                  <p className="text-xs text-gray-500">No media available in this category.</p>
                </div>
              )}
            </section>

            {/* 2.4 Available Plot Dimensions & Plot Inventory (WITH ZERO PRICES) */}
            <section
              id="plot-inventory"
              className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                    PLOT INVENTORY & DIMENSIONS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
                    Available Layout Plots
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click any plot to view specifications, facing, dimensions, and enquire directly.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={plotFacingFilter}
                    onChange={(e) => setPlotFacingFilter(e.target.value)}
                    className="text-xs bg-[#fffdf8] border border-amber-200/90 rounded-xl px-3 py-1.5 font-semibold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="All">All Facings</option>
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="South">South</option>
                    <option value="Corner">Corner</option>
                  </select>

                  <select
                    value={plotStatusFilter}
                    onChange={(e) => setPlotStatusFilter(e.target.value)}
                    className="text-xs bg-[#fffdf8] border border-amber-200/90 rounded-xl px-3 py-1.5 font-semibold text-gray-800 cursor-pointer focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Few Left">Few Left / Booked</option>
                    <option value="Sold">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Plot Cards Grid */}
              {filteredPlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPlots.map((plot: any, idx: number) => {
                    const isAvailable =
                      (plot.status || '').toLowerCase() === 'available' ||
                      (plot.status || '').toLowerCase() === 'few left';

                    return (
                      <div
                        key={plot.id || idx}
                        onClick={() => setSelectedPlot(plot)}
                        className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                          isAvailable
                            ? 'bg-white hover:bg-[#fffdf8] border-amber-200/80 hover:border-emerald-400 shadow-2xs hover:shadow-md hover:-translate-y-1'
                            : 'bg-stone-50 border-stone-200 opacity-80'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-[#006452] group-hover:text-[#D61F69] transition">
                              {plot.plot_number}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                (plot.status || '').toLowerCase() === 'available'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : (plot.status || '').toLowerCase() === 'few left'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {plot.status || 'Available'}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Dimensions:</span>
                              <span className="font-bold text-gray-800">
                                {plot.dimension_str || plot.dimension || 'Standard'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Total Area:</span>
                              <span className="font-bold text-gray-800">{plot.area_sqft} Sq.Ft</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Facing:</span>
                              <span className="font-medium text-gray-800">{plot.facing}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action */}
                        <div className="pt-2 border-t border-amber-100/70 flex items-center justify-between text-[11px] text-[#006452] font-bold group-hover:text-[#D61F69]">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </span>
                          <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#fffdf8] rounded-2xl border border-amber-100 p-6">
                  <p className="text-xs text-gray-500">No plots match the selected facing or status filter.</p>
                </div>
              )}
            </section>

            {/* 2.5 Creative Location Advantages & Connectivity Section */}
            <section className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                    STRATEGIC CONNECTIVITY
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
                    Location Advantages & Landmarks
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verified transit times, institutions, and spiritual landmarks in the immediate vicinity.
                  </p>
                </div>
              </div>

              {/* Landmarks Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredLandmarks.map((item: any, idx: number) => {
                  const cat = item.category || 'Transit';
                  const isWorship =
                    cat.toLowerCase() === 'worship' ||
                    (item.landmark || '').toLowerCase().includes('temple') ||
                    (item.landmark || '').toLowerCase().includes('masjid') ||
                    (item.landmark || '').toLowerCase().includes('church');

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 hover:border-emerald-300/80 transition-all duration-300 flex items-center justify-between gap-3 shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006452] flex items-center justify-center shrink-0 shadow-2xs">
                          {isWorship ? (
                            <Compass className="w-4 h-4" />
                          ) : cat === 'Education' ? (
                            <GraduationCap className="w-4 h-4" />
                          ) : cat === 'Healthcare' ? (
                            <HeartPulse className="w-4 h-4" />
                          ) : (
                            <Plane className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug">
                            {item.landmark}
                          </h4>
                          <span className="text-[10.5px] text-gray-500 font-medium">
                            {cat} Corridor
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block bg-[#006452] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-2xs">
                          {item.distance}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-bold mt-0.5">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exact GPS Navigation Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-amber-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#006452] uppercase tracking-wider">
                      Turn-by-Turn GPS Navigation
                    </h4>
                    <p className="text-[11px] text-gray-600">
                      Open exact driving directions to {currentProject.title} main entrance in Google Maps.
                    </p>
                  </div>
                </div>

                <a
                  href={mapDirectionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#006452] hover:bg-[#004d3f] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#f7db49]" />
                  <span>Open Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>

            {/* 2.6 Civil Amenities & Standards */}
            <section className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 sm:p-8 rounded-3xl border border-amber-100/90 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block mb-1">
                  INFRASTRUCTURE EXCELLENCE
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight">
                  Amenities & Development Standards
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(currentProject.amenities || []).map((amenity: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 shadow-2xs hover:border-emerald-300 transition space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      {iconMap[amenity.icon] || <ShieldCheck className="w-5 h-5 text-[#006452]" />}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#006452]">{amenity.title}</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{amenity.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: Action Sidebar & Direct Enquiry Form */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Schedule Your Visit */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 rounded-3xl shadow-sm border border-amber-100/90 space-y-5">
              <div className="space-y-1 text-center pb-4 border-b border-amber-100/80">
                <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                  SCHEDULE YOUR VISIT
                </span>
                <h3 className="text-xl font-extrabold text-[#006452]">
                  Book Site Inspection
                </h3>
                <p className="text-[11px] text-gray-500">
                  Executive guided site visits provided across Trichy for your family.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setEnquiryPlotName(undefined);
                    setIsEnquiryOpen(true);
                  }}
                  className="w-full bg-[#006452] hover:bg-[#004d3f] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5"
                >
                  <Calendar className="w-4 h-4 text-[#f7db49]" />
                  <span>Book Site Visit</span>
                </button>

                <a
                  href={`https://wa.me/${COMPANY_WHATSAPP}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:-translate-y-0.5"
                >
                  <WhatsAppSvgIcon className="w-4 h-4 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={`tel:${COMPANY_PHONE_RAW}`}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#006452] border border-emerald-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call: {COMPANY_PHONE}</span>
                </a>
              </div>

              {/* Bank Loan Assurance */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#006452]" />
                  <span>Bank Loan Tie-Ups</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Pre-approved with HDFC, PNB, SIB, SBI & all major banks with fast 7-day loan sanctions.
                </p>
              </div>
            </div>

            {/* Card 2: Quick Property Enquiry Form */}
            <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] p-6 rounded-3xl shadow-sm border border-amber-100/90 space-y-4">
              <div className="space-y-1 text-center pb-3 border-b border-amber-100/80">
                <span className="text-[11px] font-bold text-[#D61F69] uppercase tracking-wider block">
                  QUICK ENQUIRY
                </span>
                <h4 className="text-lg font-extrabold text-[#006452]">
                  Enquire for {currentProject.title}
                </h4>
                <p className="text-[11px] text-gray-500">
                  Direct assistance, layout blueprints & price breakdown.
                </p>
              </div>

              <form onSubmit={handleInlineSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={inlineForm.name}
                    onChange={(e) => setInlineForm({ ...inlineForm, name: e.target.value })}
                    className="w-full bg-[#fffdf8] border border-amber-200/90 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-[#006452]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 XXXXX"
                    value={inlineForm.phone}
                    onChange={(e) => setInlineForm({ ...inlineForm, phone: e.target.value })}
                    className="w-full bg-[#fffdf8] border border-amber-200/90 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-[#006452]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Preferred Budget</label>
                  <select
                    value={inlineForm.budget}
                    onChange={(e) => setInlineForm({ ...inlineForm, budget: e.target.value })}
                    className="w-full bg-[#fffdf8] border border-amber-200/90 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-[#006452] cursor-pointer"
                  >
                    <option value="">Select Preferred Budget</option>
                    <option value="₹ 15 - 25 Lakhs">₹ 15 - 25 Lakhs</option>
                    <option value="₹ 25 - 35 Lakhs">₹ 25 - 35 Lakhs</option>
                    <option value="₹ 35 - 50 Lakhs">₹ 35 - 50 Lakhs</option>
                    <option value="₹ 50 Lakhs+">₹ 50 Lakhs & Above</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Message (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Interested in North facing plot..."
                    value={inlineForm.message}
                    onChange={(e) => setInlineForm({ ...inlineForm, message: e.target.value })}
                    className="w-full bg-[#fffdf8] border border-amber-200/90 rounded-xl p-2.5 text-gray-800 focus:outline-none focus:border-[#006452]"
                  />
                </div>

                {inlineError && <p className="text-rose-600 text-[11px]">{inlineError}</p>}

                <button
                  type="submit"
                  disabled={inlineLoading}
                  className="w-full bg-[#D61F69] hover:bg-[#be185d] text-white font-extrabold py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 hover:shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{inlineLoading ? 'Submitting...' : 'Submit Enquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INDIVIDUAL PLOT DETAILS POPUP MODAL (WITH NO PRICES) */}
      {selectedPlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-amber-100 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-100 p-5 bg-[#fef9e6]">
              <div>
                <span className="text-[10px] font-bold text-[#D61F69] uppercase tracking-wider block">
                  {currentProject.title}
                </span>
                <h3 className="text-xl font-extrabold text-[#006452]">
                  {selectedPlot.plot_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlot(null)}
                className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-gray-900 flex items-center justify-center border border-amber-200/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Plot Image Preview or Dedicated Plot Card */}
              {(() => {
                const photos: string[] = [];
                if (selectedPlot.primary_image_url) photos.push(selectedPlot.primary_image_url);
                if (Array.isArray(selectedPlot.gallery_images)) {
                  selectedPlot.gallery_images.forEach((img: string) => {
                    if (img && !photos.includes(img)) photos.push(img);
                  });
                }

                const currentPhoto = photos[activePlotMediaIndex] || photos[0];

                if (photos.length > 0) {
                  return (
                    <div className="space-y-2">
                      <div className="relative h-52 sm:h-56 w-full rounded-2xl overflow-hidden bg-slate-900 border border-amber-200/80 shadow-inner">
                        <Image
                          src={currentPhoto}
                          alt={selectedPlot.plot_number}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase shadow-sm ${
                              (selectedPlot.status || '').toLowerCase() === 'available'
                                ? 'bg-emerald-600 text-white'
                                : (selectedPlot.status || '').toLowerCase() === 'few left'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {selectedPlot.status || 'Available'}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
                          {selectedPlot.plot_number} • Photo {activePlotMediaIndex + 1} of {photos.length}
                        </div>
                      </div>

                      {photos.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {photos.map((pUrl, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setActivePlotMediaIndex(pIdx)}
                              className={`relative w-14 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                                activePlotMediaIndex === pIdx ? 'border-[#006452] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <Image src={pUrl} alt="" fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-[#004d3f] to-[#006452] text-white flex flex-col justify-between h-44 shadow-md relative overflow-hidden border border-emerald-400/20">
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20 text-emerald-200">
                        {currentProject.title}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          (selectedPlot.status || '').toLowerCase() === 'available'
                            ? 'bg-emerald-500 text-white'
                            : (selectedPlot.status || '').toLowerCase() === 'few left'
                            ? 'bg-amber-400 text-gray-950'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {selectedPlot.status || 'Available'}
                      </span>
                    </div>

                    <div className="z-10 space-y-1">
                      <h3 className="text-2xl font-black tracking-tight text-white font-serif-title">
                        {selectedPlot.plot_number}
                      </h3>
                      <p className="text-xs text-emerald-100 font-medium">
                        {selectedPlot.dimension_str || selectedPlot.dimension || 'Standard Plot'} • {selectedPlot.facing || 'Layout'} Facing • {selectedPlot.area_sqft} Sq.Ft
                      </p>
                    </div>

                    <div className="absolute right-[-15px] bottom-[-15px] w-32 h-32 opacity-15 pointer-events-none text-white">
                      <Maximize2 className="w-full h-full stroke-[1.2]" />
                    </div>
                  </div>
                );
              })()}

              {/* Specifications Grid (WITHOUT PRICE) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#fef9e6] border border-amber-200/70">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Dimensions</span>
                  <span className="text-sm font-extrabold text-[#006452]">
                    {selectedPlot.dimension_str || selectedPlot.dimension || 'Standard'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fef9e6] border border-amber-200/70">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Area</span>
                  <span className="text-sm font-extrabold text-[#006452]">
                    {selectedPlot.area_sqft} Sq.Ft
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fef9e6] border border-amber-200/70">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Facing Direction</span>
                  <span className="text-sm font-extrabold text-gray-900">
                    {selectedPlot.facing || 'North'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#fef9e6] border border-amber-200/70">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Approval Status</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    {selectedPlot.approval_status || '100% DTCP Approved'}
                  </span>
                </div>
              </div>

              {/* Plot Description */}
              {selectedPlot.description && (
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-xs">Plot Overview & Highlights</h4>
                  <p className="text-gray-600 leading-relaxed text-xs">{selectedPlot.description}</p>
                </div>
              )}

              {/* Plot Specific Videos */}
              {(() => {
                const videos: string[] = [];
                if (Array.isArray(selectedPlot.video_urls)) {
                  selectedPlot.video_urls.forEach((v: string) => {
                    if (v && !videos.includes(v)) videos.push(v);
                  });
                }
                if (selectedPlot.video_url && !videos.includes(selectedPlot.video_url)) {
                  videos.push(selectedPlot.video_url);
                }

                if (videos.length === 0) return null;

                return (
                  <div className="space-y-2 pt-1">
                    <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#D61F69]" />
                      <span>{selectedPlot.plot_number} Walkthrough Video</span>
                    </h4>
                    {videos.map((vUrl, vIdx) => (
                      <div key={vIdx} className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-pink-200">
                        {vUrl.includes('youtube.com') || vUrl.includes('youtu.be') ? (
                          <iframe
                            src={vUrl.replace('watch?v=', 'embed/')}
                            title={`${selectedPlot.plot_number} Video`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video
                            src={vUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Plot Exact GPS Navigation Link if set */}
              {selectedPlot.latitude && selectedPlot.longitude && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Exact Plot GPS Coordinates</span>
                      <span className="text-[10.5px] text-gray-500 font-mono">
                        {selectedPlot.latitude}, {selectedPlot.longitude}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlot.latitude},${selectedPlot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006452] hover:bg-[#004d3f] text-white font-bold rounded-lg text-[11px] shadow-2xs"
                  >
                    <span>Directions to Plot</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-amber-100 bg-[#fffdf5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlot(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              {(selectedPlot.status || '').toLowerCase() !== 'sold' &&
              (selectedPlot.status || '').toLowerCase() !== 'sold out' ? (
                <button
                  type="button"
                  onClick={() => handleOpenPlotEnquiry(selectedPlot)}
                  className="bg-[#006452] hover:bg-[#004d3f] text-white font-extrabold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire for this Plot</span>
                </button>
              ) : (
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  Plot Sold Out
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. VIDEO MODAL POPUP */}
      {isVideoModalOpen && currentProject.video_url && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={currentProject.video_url.replace('watch?v=', 'embed/')}
              title="Project Walkthrough Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* 5. GREETING / THANK YOU POPUP FOR INLINE SUBMISSION */}
      {showGreetingPopup && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-amber-200 animate-scale-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-[#006452] flex items-center justify-center shadow-inner">
              <CheckCircle className="w-8 h-8 text-[#006452]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-[#006452]">
                Thank You for Your Enquiry!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your enquiry for <strong>{currentProject.title}</strong> has been registered successfully. Our property advisor will reach out to you shortly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGreetingPopup(false)}
              className="bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] font-extrabold px-6 py-2.5 rounded-full text-xs transition shadow-xs cursor-pointer"
            >
              Done & Return to Property
            </button>
          </div>
        </div>
      )}

      {/* 6. GLOBAL ENQUIRY / SITE VISIT MODAL */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => {
          setIsEnquiryOpen(false);
          setEnquiryPlotName(undefined);
        }}
        propertyName={currentProject.title}
        plotName={enquiryPlotName}
      />

      {/* 7. FULLSCREEN UNIFIED GALLERY LIGHTBOX MODAL */}
      {isGalleryLightboxOpen && activeMediaItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="bg-[#D61F69] text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
                {activeMediaItem.badge}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold truncate text-white">{activeMediaItem.caption}</h4>
                <p className="text-xs text-white/70 truncate">{activeMediaItem.subbadge}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono text-white/80 bg-white/10 px-3 py-1 rounded-full">
                {activeGalleryIndex + 1} / {filteredGallery.length}
              </span>
              <button
                type="button"
                onClick={() => setIsGalleryLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Media Viewer */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {filteredGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevGalleryMedia}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-[#D61F69] text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer shadow-xl hover:scale-105"
                  title="Previous Media"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNextGalleryMedia}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-[#D61F69] text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer shadow-xl hover:scale-105"
                  title="Next Media"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}

            <div className="w-full h-full max-h-[75vh] flex items-center justify-center">
              {activeMediaItem.type === 'video' ? (
                activeMediaItem.url.includes('youtube.com') || activeMediaItem.url.includes('youtu.be') ? (
                  <iframe
                    src={activeMediaItem.url.replace('watch?v=', 'embed/')}
                    title={activeMediaItem.caption}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full max-w-4xl aspect-video rounded-2xl shadow-2xl border border-white/10"
                  />
                ) : (
                  <video
                    src={activeMediaItem.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[72vh] max-w-full rounded-2xl shadow-2xl border border-white/10 bg-black"
                  />
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeMediaItem.url}
                  alt={activeMediaItem.caption}
                  className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
                />
              )}
            </div>
          </div>

          {/* Bottom Thumbnails */}
          {filteredGallery.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 border-t border-white/10 max-w-full">
              {filteredGallery.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => setActiveGalleryIndex(idx)}
                  className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    activeGalleryIndex === idx
                      ? 'border-[#D61F69] scale-105 shadow-md ring-2 ring-[#D61F69]/40'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.type === 'video' ? (currentProject.heroImage || '/project_park_avenue_new.jpg') : item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
