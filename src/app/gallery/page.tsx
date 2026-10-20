'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  MapPin,
  Eye,
  Calendar,
  ArrowRight,
  Maximize2,
  Video,
  Play,
  Pause,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import EnquiryModal from '@/components/EnquiryModal';
import { api } from '@/lib/api';
import { properties as fallbackProperties } from '@/data/properties';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  badge: string;
  subbadge: string;
  caption: string;
  category: 'Project' | 'Plots' | 'Videos' | 'General';
  plotNumber?: string;
}

interface ProjectGalleryCard {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  coverImage: string;
  dtcpNumber: string;
  reraNumber?: string;
  status: string;
  media: MediaItem[];
  photoCount: number;
  videoCount: number;
  plotCount: number;
}

interface CarouselItem {
  id: string;
  title: string;
  project: string;
  category: string;
  url: string;
  type: 'image' | 'video';
  badge: string;
  subbadge: string;
  tag: string;
}

export default function GalleryPage() {
  const [projectsGallery, setProjectsGallery] = useState<ProjectGalleryCard[]>([]);
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectGalleryCard | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [lightboxFilter, setLightboxFilter] = useState<'All' | 'Project' | 'Plots' | 'Videos' | 'General'>('All');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryProjectName, setEnquiryProjectName] = useState<string | undefined>(undefined);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState<boolean>(true);
  const carouselContainerRef = React.useRef<HTMLDivElement>(null);

  // Load public projects, their plots, and standalone gallery photos
  useEffect(() => {
    async function loadAllMedia() {
      try {
        const [projRes, galRes] = await Promise.all([
          api.getPublicProjects().catch(() => ({ success: false, data: [] })),
          api.getPublicGallery().catch(() => ({ success: false, data: [] }))
        ]);

        const rawProjects = projRes && projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0
          ? projRes.data
          : fallbackProperties.map((p) => ({
              id: p.id,
              name: p.title,
              slug: p.slug,
              location_area: p.location,
              location_city: p.city,
              banner_image: p.heroImage,
              gallery_images: p.images,
              video_url: '',
              dtcp_number: p.dtcpNumber,
              rera_number: p.reraNumber,
              status: p.status
            }));

        const standaloneGallery: any[] = (galRes && galRes.success && Array.isArray(galRes.data)) ? galRes.data : [];

        // Carousel feed collection
        const carouselList: CarouselItem[] = [];
        const seenCarouselUrls = new Set<string>();

        // 1. Process Standalone General Site Photos (such as user-uploaded "hero mobile")
        const siteMediaList: MediaItem[] = [];
        standaloneGallery.forEach((item: any, idx: number) => {
          if (item.image_url) {
            const mItem: MediaItem = {
              id: `site-gal-${item.id || idx}`,
              type: 'image',
              url: item.image_url,
              badge: item.category || 'Site Photo',
              subbadge: 'Sree Hari Infrastructure',
              caption: item.title || 'Layout & Infrastructure Progress',
              category: 'General'
            };
            siteMediaList.push(mItem);

            if (!seenCarouselUrls.has(item.image_url)) {
              seenCarouselUrls.add(item.image_url);
              carouselList.push({
                id: `c-site-${item.id || idx}`,
                title: item.title || 'Site Infrastructure Photo',
                project: 'General Infrastructure',
                category: item.category || 'Roads & Utilities',
                url: item.image_url,
                type: 'image',
                badge: 'Site Asset',
                subbadge: 'Live Progress',
                tag: 'DTCP Layout'
              });
            }
          }
        });

        // 2. Process Projects and their plots
        const cards: ProjectGalleryCard[] = await Promise.all(
          rawProjects.map(async (proj: any) => {
            const mediaList: MediaItem[] = [];
            const seenUrls = new Set<string>();

            // Project Cover
            const cover = proj.banner_image || proj.heroImage || '/project_park_avenue_new.jpg';
            if (cover && !seenUrls.has(cover)) {
              seenUrls.add(cover);
              mediaList.push({
                id: `${proj.id}-cover`,
                type: 'image',
                url: cover,
                badge: 'Project Cover',
                subbadge: proj.name || 'Layout',
                caption: `${proj.name} — Grand Entrance & Main Layout`,
                category: 'Project'
              });

              if (!seenCarouselUrls.has(cover)) {
                seenCarouselUrls.add(cover);
                carouselList.push({
                  id: `c-proj-${proj.id}`,
                  title: `${proj.name} — Main Community Arch`,
                  project: proj.name,
                  category: 'Entrance & Roads',
                  url: cover,
                  type: 'image',
                  badge: 'Gated Township',
                  subbadge: proj.location_area || 'Trichy',
                  tag: 'DTCP & RERA'
                });
              }
            }

            // Project Gallery Images
            const projImages = Array.isArray(proj.gallery_images)
              ? proj.gallery_images
              : Array.isArray(proj.images)
              ? proj.images
              : [];

            projImages.forEach((img: string, idx: number) => {
              if (img && !seenUrls.has(img)) {
                seenUrls.add(img);
                mediaList.push({
                  id: `${proj.id}-gal-${idx}`,
                  type: 'image',
                  url: img,
                  badge: 'Project Infrastructure',
                  subbadge: proj.name,
                  caption: `${proj.name} — Infrastructure Development Photo #${idx + 1}`,
                  category: 'Project'
                });
              }
            });

            // Project Video
            if (proj.video_url && !seenUrls.has(proj.video_url)) {
              seenUrls.add(proj.video_url);
              mediaList.push({
                id: `${proj.id}-video`,
                type: 'video',
                url: proj.video_url,
                badge: 'Project Video Tour',
                subbadge: proj.name,
                caption: `${proj.name} — Drone Video Tour`,
                category: 'Videos'
              });
            }

            // Fetch Associated Plots
            let plots: any[] = [];
            try {
              const plotsRes = await api.getPublicPlotsByProjectSlug(proj.slug);
              if (plotsRes && plotsRes.success && Array.isArray(plotsRes.data)) {
                plots = plotsRes.data;
              }
            } catch {
              plots = [];
            }

            plots.forEach((pl: any, plIdx: number) => {
              const plotNum = pl.plot_number || `Plot #${plIdx + 1}`;
              const cleanTitle = pl.dimension_str ? `${pl.dimension_str} • ${pl.facing || 'Layout'}` : 'Villa Plot';

              if (pl.primary_image_url && !seenUrls.has(pl.primary_image_url)) {
                seenUrls.add(pl.primary_image_url);
                mediaList.push({
                  id: `plot-${pl.id}-pri`,
                  type: 'image',
                  url: pl.primary_image_url,
                  badge: plotNum,
                  subbadge: cleanTitle,
                  caption: `${plotNum} — ${cleanTitle}`,
                  category: 'Plots',
                  plotNumber: plotNum
                });
              }
            });

            const photoCount = mediaList.filter((m) => m.type === 'image').length;
            const videoCount = mediaList.filter((m) => m.type === 'video').length;

            return {
              id: proj.id,
              name: proj.name || 'Plotted Community',
              slug: proj.slug,
              location: proj.location_area || 'Trichy',
              city: proj.location_city || 'Trichy',
              coverImage: cover,
              dtcpNumber: proj.dtcp_number || proj.dtcpNumber || '100% DTCP Approved',
              reraNumber: proj.rera_number || proj.reraNumber || '',
              status: proj.status || 'Ongoing',
              media: mediaList,
              photoCount,
              videoCount,
              plotCount: plots.length
            };
          })
        );

        // 3. Add General Site Infrastructure card if there are standalone photos
        if (siteMediaList.length > 0) {
          cards.push({
            id: 'site-infrastructure-general',
            name: 'General Site & Infrastructure',
            slug: 'general-infrastructure',
            location: 'Trichy Region',
            city: 'Tamil Nadu',
            coverImage: siteMediaList[0]?.url || '/hero_gallery.jpg',
            dtcpNumber: 'Verified Quality',
            reraNumber: '',
            status: 'Live Infrastructure',
            media: siteMediaList,
            photoCount: siteMediaList.length,
            videoCount: 0,
            plotCount: 0
          });
        }

        setProjectsGallery(cards);
        setCarouselItems(carouselList);
      } catch (err) {
        console.error('Failed to load project galleries:', err);
      }
    }

    loadAllMedia();
  }, []);

  // Filter categories
  const categoryOptions = useMemo(() => {
    const list = ['All'];
    projectsGallery.forEach((p) => {
      if (!list.includes(p.name)) list.push(p.name);
    });
    return list;
  }, [projectsGallery]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projectsGallery;
    return projectsGallery.filter((p) => p.name === selectedCategory);
  }, [projectsGallery, selectedCategory]);

  // Lightbox media items
  const currentProjectMedia = useMemo(() => {
    if (!activeProject) return [];
    if (lightboxFilter === 'All') return activeProject.media;
    if (lightboxFilter === 'Videos') return activeProject.media.filter((m) => m.type === 'video');
    return activeProject.media.filter((m) => m.category === lightboxFilter);
  }, [activeProject, lightboxFilter]);

  const activeMediaItem = currentProjectMedia[activeMediaIndex] || currentProjectMedia[0];

  const handlePrevMedia = useCallback(() => {
    if (currentProjectMedia.length === 0) return;
    setActiveMediaIndex((prev) => (prev - 1 + currentProjectMedia.length) % currentProjectMedia.length);
  }, [currentProjectMedia.length]);

  const handleNextMedia = useCallback(() => {
    if (currentProjectMedia.length === 0) return;
    setActiveMediaIndex((prev) => (prev + 1) % currentProjectMedia.length);
  }, [currentProjectMedia.length]);

  const [singleViewingImage, setSingleViewingImage] = useState<CarouselItem | null>(null);

  // Lock body scroll when either lightbox is open
  useEffect(() => {
    const isAnyModalOpen = activeProject !== null || singleViewingImage !== null;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProject, singleViewingImage]);

  // Keyboard navigation for lightboxes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (singleViewingImage !== null) {
        if (e.key === 'Escape') setSingleViewingImage(null);
        return;
      }

      if (activeProject) {
        if (e.key === 'Escape') setActiveProject(null);
        if (e.key === 'ArrowLeft') handlePrevMedia();
        if (e.key === 'ArrowRight') handleNextMedia();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, singleViewingImage, handleNextMedia, handlePrevMedia]);

  const openProjectLightbox = (project: ProjectGalleryCard, initialCategory: 'All' | 'Project' | 'Plots' | 'Videos' | 'General' = 'All') => {
    setActiveProject(project);
    setLightboxFilter(initialCategory);
    setActiveMediaIndex(0);
  };

  return (
    <div className="space-y-12 pb-16 bg-[#fef9e6] font-sans min-h-screen">
      {/* 1. Page Header with Panoramic Background */}
      <section className="relative min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex items-center overflow-hidden bg-gray-950 border-b border-amber-900/30">
        <Image
          src="/hero_gallery.jpg"
          alt="Sree Hari Realty Promoters Gated Layout Gallery"
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
              <span>PROJECT-BASED GALLERIES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md font-serif-title">
              Gated Community <span className="text-[#D61F69] drop-shadow-[0_2px_12px_rgba(214,31,105,0.4)]">Galleries</span>
            </h1>

            <p className="text-white/90 text-xs sm:text-[15px] font-medium leading-relaxed max-w-xl drop-shadow-sm">
              Browse authentic layout developments, grand entrance arches, wide tar roads, and individual plot media across all Sree Hari Realty projects.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Featured Continuous Auto-Scroll Carousel Section (Matches Website Cream Theme) */}
      {carouselItems.length > 0 && (
        <section className="relative py-8 bg-[#fef9e6] border-y border-amber-200/80 overflow-hidden">
          <style>{`
            @keyframes galleryInfiniteMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .gallery-continuous-track {
              display: flex;
              gap: 1.25rem;
              width: max-content;
              animation: galleryInfiniteMarquee 48s linear infinite;
              will-change: transform;
            }
            .gallery-continuous-track:hover {
              animation-play-state: paused !important;
            }
          `}</style>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-[#006452] text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#006452]" />
                <span>Featured Project & Site Carousel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#006452] tracking-tight font-serif-title flex items-center gap-2">
                <span>Live Layout Developments</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 max-w-xl">
                Continuous walkthrough across DTCP layout arches, 40ft blacktop roads, and individual plot assets. Hover any card to pause.
              </p>
            </div>

            {/* Play/Pause & Scroll Navigation Controls */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition border cursor-pointer shadow-xs ${
                  isCarouselPlaying
                    ? 'bg-white hover:bg-emerald-50 text-[#006452] border-emerald-300'
                    : 'bg-[#006452] hover:bg-[#005041] text-white border-[#006452] shadow-md'
                }`}
                title={isCarouselPlaying ? 'Click to Pause Auto-Scroll' : 'Click to Resume Auto-Scroll'}
              >
                {isCarouselPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#006452]" />
                    <span>Auto-Scroll Active</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume Scroll</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (carouselContainerRef.current) {
                    carouselContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                  }
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-emerald-50 text-[#006452] border border-amber-200/90 flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (carouselContainerRef.current) {
                    carouselContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                  }
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-emerald-50 text-[#006452] border border-amber-200/90 flex items-center justify-center transition cursor-pointer shadow-xs"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Marquee Outer Container */}
          <div
            ref={carouselContainerRef}
            className="w-full overflow-x-hidden py-3"
          >
            <div
              className="gallery-continuous-track px-4"
              style={{
                animationPlayState: isCarouselPlaying ? 'running' : 'paused'
              }}
            >
              {[...carouselItems, ...carouselItems].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => setSingleViewingImage(item)}
                  className="w-72 sm:w-80 h-[360px] rounded-2xl bg-white border border-amber-200/90 hover:border-[#006452] shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,100,82,0.22)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden group shrink-0 relative"
                >
                  {/* Top Image Thumbnail Container */}
                  <div className="h-52 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url || '/project_park_avenue_new.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/project_park_avenue_new.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="bg-[#006452]/95 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider border border-emerald-300/40">
                        {item.badge}
                      </span>
                      <span className="bg-black/60 backdrop-blur-md text-[#f7db49] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick View Pill */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full bg-[#006452] text-white text-xs font-bold shadow-xl flex items-center gap-1.5 border border-emerald-300/40">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Photo</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-gradient-to-b from-white to-[#fffdf5]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-[#006452] font-semibold truncate">
                        <MapPin className="w-3 h-3 text-[#006452] shrink-0" />
                        <span className="truncate">{item.project} • {item.subbadge}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 line-clamp-1 group-hover:text-[#006452] transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    {/* Reference-style Footer with Tag Pill */}
                    <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">
                        Verified Development
                      </span>

                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10.5px] font-extrabold shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{item.tag}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Category Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition uppercase tracking-wider cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#006452] text-white shadow-md'
                  : 'bg-gradient-to-b from-white via-white to-[#fffdf5] text-gray-700 hover:border-amber-300 border border-amber-200/80 shadow-2xs'
              }`}
            >
              {cat === 'All' ? 'All Communities' : cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Project Gallery Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openProjectLightbox(project)}
                className="group relative bg-gradient-to-b from-white via-white to-[#fffdf5] rounded-3xl overflow-hidden border border-amber-200/80 hover:border-emerald-400 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,100,82,0.22)] hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer flex flex-col justify-between"
              >
                {/* Project Cover Container */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                  <Image
                    src={project.coverImage}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Sheen */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform ease-in-out pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10.5px] font-extrabold uppercase px-3 py-1 rounded-full border border-amber-300/30">
                      {project.status || 'Active Project'}
                    </span>
                    <span className="bg-[#006452]/90 backdrop-blur-md text-white text-[10.5px] font-bold px-3 py-1 rounded-full border border-emerald-300/40">
                      {project.dtcpNumber}
                    </span>
                  </div>

                  {/* Media Count Pills */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 z-10">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl border border-white/20 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{project.photoCount} Photos</span>
                    </span>

                    {project.videoCount > 0 && (
                      <span className="bg-[#D61F69]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-xl border border-pink-400/30 flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-white" />
                        <span>{project.videoCount} Video{project.videoCount > 1 ? 's' : ''}</span>
                      </span>
                    )}

                    {project.plotCount > 0 && (
                      <span className="bg-amber-500/90 backdrop-blur-md text-gray-950 text-[11px] font-bold px-3 py-1 rounded-xl border border-amber-300/40">
                        {project.plotCount} Associated Plots
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Info Bottom Panel */}
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#006452]" />
                      <span>{project.location}, {project.city}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#006452] tracking-tight font-serif-title group-hover:text-[#D61F69] transition-colors">
                      {project.name}
                    </h3>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between">
                    <span className="text-xs font-black text-[#006452] flex items-center gap-1 group-hover:text-[#D61F69]">
                      <Eye className="w-4 h-4" /> View Full Layout & Plot Media
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#f7db49] text-[#006452] flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-110 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 max-w-md mx-auto shadow-sm">
            <h3 className="text-lg font-bold text-[#006452]">No Projects Found</h3>
            <p className="text-xs text-gray-500 mt-1">Please select another community filter.</p>
          </div>
        )}
      </section>

      {/* 4. Bottom Site Visit Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-white via-white to-[#fffdf5] border border-amber-100/90 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <h2 className="font-heading-sc text-2xl sm:text-3xl font-extrabold text-[#006452]">
            Want to Inspect These Plotted Developments in Person?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Experience the wide tar roads, high groundwater table, and peaceful surroundings firsthand with an executive guided site visit.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setEnquiryProjectName(undefined);
                setIsEnquiryOpen(true);
              }}
              className="group inline-flex items-center gap-2 bg-[#f7db49] hover:bg-[#f6d73c] text-[#006452] px-7 py-3.5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-0.5"
            >
              <span>Schedule Weekend Site Visit</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Carousel Single-Image Viewer (Strictly Shows Only the Clicked Image, No Multi-Image Continuation) */}
      {singleViewingImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none overflow-hidden h-screen w-screen">
          {/* Top Bar with Correct Wording and Clean Metadata */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-3 shrink-0">
            <div className="min-w-0 pr-3">
              <span className="text-[10px] font-extrabold text-[#f7db49] uppercase tracking-widest block truncate">
                {singleViewingImage.project} • {singleViewingImage.subbadge || 'DEVELOPMENT ASSET'}
              </span>
              <h3 className="text-base sm:text-xl font-black text-white line-clamp-1 mt-0.5">
                {singleViewingImage.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="bg-[#006452] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  {singleViewingImage.badge}
                </span>
                <span className="bg-[#f7db49] text-gray-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  ★ {singleViewingImage.tag}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSingleViewingImage(null)}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/20 cursor-pointer shrink-0"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Viewport: 100% Clean Image, NO Text Overlaid On Top */}
          <div className="relative flex-1 flex items-center justify-center my-3 min-h-0 overflow-hidden">
            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
              <Image
                src={singleViewingImage.url}
                alt={singleViewingImage.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Project-Wise Media Lightbox / Drawer Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none overflow-hidden h-screen w-screen">
          {/* Top Bar - Centered Tabs Layout */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-white/10 gap-3 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-[#f7db49] uppercase tracking-widest block">
                {activeProject.location} • GATED COMMUNITY
              </span>
              <h3 className="text-base sm:text-xl font-black text-white">
                {activeProject.name}
              </h3>
            </div>

            {/* Inner Lightbox Filter Tabs - Centered */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10 mx-auto md:mx-0">
              {(['All', 'Project', 'Plots', 'Videos', 'General'] as const).map((tab) => {
                const count =
                  tab === 'All'
                    ? activeProject.media.length
                    : tab === 'Videos'
                    ? activeProject.media.filter((m) => m.type === 'video').length
                    : activeProject.media.filter((m) => m.category === tab).length;

                if (count === 0 && tab !== 'All') return null;

                const isActive = lightboxFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setLightboxFilter(tab);
                      setActiveMediaIndex(0);
                    }}
                    className={`text-xs px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#006452] text-white shadow-xs'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{tab === 'Project' ? 'Infrastructure' : tab === 'General' ? 'Site Photos' : tab}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-emerald-800 text-white' : 'bg-white/10 text-white/60'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Close Button and Counter */}
            <div className="flex items-center justify-end gap-3">
              {currentProjectMedia.length > 0 && (
                <span className="text-white/70 text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                  {activeMediaIndex + 1} / {currentProjectMedia.length}
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewport */}
          <div className="relative flex-1 flex items-center justify-center my-2 min-h-0 overflow-hidden">
            {activeMediaItem ? (
              <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                {activeMediaItem.type === 'video' ? (
                  activeMediaItem.url.includes('youtube.com') || activeMediaItem.url.includes('youtu.be') ? (
                    <iframe
                      src={activeMediaItem.url.replace('watch?v=', 'embed/')}
                      title={activeMediaItem.caption}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full max-h-[62vh] rounded-2xl border-0 aspect-video"
                    />
                  ) : (
                    <video
                      key={activeMediaItem.url}
                      src={activeMediaItem.url}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[62vh] rounded-2xl object-contain"
                    />
                  )
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={activeMediaItem.url}
                      alt={activeMediaItem.caption}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                )}

                {/* Left/Right Prev/Next Buttons */}
                {currentProjectMedia.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevMedia}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20 cursor-pointer shadow-lg z-30"
                      title="Previous (Left Arrow)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMedia}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20 cursor-pointer shadow-lg z-30"
                      title="Next (Right Arrow)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-white/60 text-sm">No media in this category.</div>
            )}
          </div>

          {/* Active Item Caption Strip (Outside Image, Never Laying On Top of Photos) */}
          {activeMediaItem && (
            <div className="py-1 px-4 text-center shrink-0 flex items-center justify-center gap-2 flex-wrap">
              <span className="bg-[#006452] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {activeMediaItem.badge}
              </span>
              <span className="text-white/80 text-xs font-medium truncate max-w-xl">
                {activeMediaItem.caption}
              </span>
            </div>
          )}

          {/* Bottom Thumbnail Strip */}
          {currentProjectMedia.length > 1 && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto max-w-4xl mx-auto w-full px-4 py-2 scroll-smooth shrink-0 scrollbar-thin">
              {currentProjectMedia.map((m, idx) => {
                const isSelected = activeMediaIndex === idx;
                return (
                  <button
                    key={m.id || idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                      isSelected ? 'border-[#f7db49] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {m.type === 'video' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white" />
                      </div>
                    ) : (
                      <Image src={m.url} alt="" fill className="object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        title="Schedule Layout Inspection"
        propertyName={enquiryProjectName}
      />
    </div>
  );
}
