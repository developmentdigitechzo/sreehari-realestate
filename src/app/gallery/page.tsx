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
  category: 'Project' | 'Plots' | 'Videos';
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

export default function GalleryPage() {
  const [projectsGallery, setProjectsGallery] = useState<ProjectGalleryCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectGalleryCard | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [lightboxFilter, setLightboxFilter] = useState<'All' | 'Project' | 'Plots' | 'Videos'>('All');
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryProjectName, setEnquiryProjectName] = useState<string | undefined>(undefined);

  // Load projects and their plots to assemble project-based galleries
  useEffect(() => {
    async function loadProjectsWithMedia() {
      try {
        const res = await api.getPublicProjects();
        const rawProjects = res && res.success && Array.isArray(res.data) && res.data.length > 0
          ? res.data
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

        const cards: ProjectGalleryCard[] = await Promise.all(
          rawProjects.map(async (proj: any) => {
            const mediaList: MediaItem[] = [];
            const seenUrls = new Set<string>();

            // 1. Project Cover
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
            }

            // 2. Project Gallery Images
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

            // 3. Project Video
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

            // 4. Fetch Associated Plots for this project
            let plots: any[] = [];
            try {
              const plotsRes = await api.getPublicPlotsByProjectSlug(proj.slug);
              if (plotsRes && plotsRes.success && Array.isArray(plotsRes.data)) {
                plots = plotsRes.data;
              }
            } catch {
              plots = [];
            }

            plots.forEach((pl: any) => {
              const plotNum = pl.plot_number || 'Plot';
              const cleanTitle = pl.dimension_str ? `${pl.dimension_str} • ${pl.facing || 'Layout'}` : 'Villa Plot';

              // Plot Primary Image
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

              // Plot Gallery Images
              if (Array.isArray(pl.gallery_images)) {
                pl.gallery_images.forEach((img: string, gIdx: number) => {
                  if (img && !seenUrls.has(img)) {
                    seenUrls.add(img);
                    mediaList.push({
                      id: `plot-${pl.id}-gal-${gIdx}`,
                      type: 'image',
                      url: img,
                      badge: `${plotNum} Photo`,
                      subbadge: cleanTitle,
                      caption: `${plotNum} — Layout Photo #${gIdx + 1}`,
                      category: 'Plots',
                      plotNumber: plotNum
                    });
                  }
                });
              }

              // Plot Videos
              const plotVids = Array.isArray(pl.video_urls) && pl.video_urls.length > 0
                ? pl.video_urls
                : pl.video_url ? [pl.video_url] : [];

              plotVids.forEach((vUrl: string, vIdx: number) => {
                if (vUrl && !seenUrls.has(vUrl)) {
                  seenUrls.add(vUrl);
                  mediaList.push({
                    id: `plot-${pl.id}-vid-${vIdx}`,
                    type: 'video',
                    url: vUrl,
                    badge: `${plotNum} Video`,
                    subbadge: cleanTitle,
                    caption: `${plotNum} — Walkthrough Video`,
                    category: 'Videos',
                    plotNumber: plotNum
                  });
                }
              });
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

        setProjectsGallery(cards);
      } catch (err) {
        console.error('Failed to load project galleries:', err);
      }
    }

    loadProjectsWithMedia();
  }, []);

  // Dynamic filter categories
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

  // Lightbox media items for the currently opened project
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

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activeProject) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'ArrowRight') handleNextMedia();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, handleNextMedia, handlePrevMedia]);

  const openProjectLightbox = (project: ProjectGalleryCard, initialCategory: 'All' | 'Project' | 'Plots' | 'Videos' = 'All') => {
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

      {/* 2. Category Filter Pills */}
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

      {/* 5. Project Media Lightbox / Drawer Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] font-bold text-[#f7db49] uppercase tracking-widest block">
                  {activeProject.location} • GATED COMMUNITY
                </span>
                <h3 className="text-base sm:text-xl font-black text-white">
                  {activeProject.name}
                </h3>
              </div>

              {/* Inner Lightbox Filter Tabs */}
              <div className="hidden sm:flex items-center gap-1.5 ml-4 bg-white/10 p-1 rounded-xl border border-white/10">
                {(['All', 'Project', 'Plots', 'Videos'] as const).map((tab) => {
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
                      <span>{tab === 'Project' ? 'Infrastructure' : tab}</span>
                      <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-emerald-800 text-white' : 'bg-white/10 text-white/60'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Close Button and Counter */}
            <div className="flex items-center gap-3">
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
          <div className="relative flex-1 flex items-center justify-center my-3 max-h-[70vh]">
            {activeMediaItem ? (
              <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                {activeMediaItem.type === 'video' ? (
                  activeMediaItem.url.includes('youtube.com') || activeMediaItem.url.includes('youtu.be') ? (
                    <iframe
                      src={activeMediaItem.url.replace('watch?v=', 'embed/')}
                      title={activeMediaItem.caption}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full max-h-[65vh] rounded-2xl border-0 aspect-video"
                    />
                  ) : (
                    <video
                      key={activeMediaItem.url}
                      src={activeMediaItem.url}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[65vh] rounded-2xl object-contain"
                    />
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={activeMediaItem.url}
                      alt={activeMediaItem.caption}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col gap-1 max-w-[85%]">
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
                  <span className="bg-black/75 backdrop-blur-md text-slate-200 text-xs font-medium px-3 py-1 rounded-xl shadow-md border border-white/10 w-fit">
                    {activeMediaItem.caption}
                  </span>
                </div>

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

          {/* Bottom Thumbnail Strip */}
          {currentProjectMedia.length > 1 && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto max-w-5xl mx-auto w-full px-2">
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
