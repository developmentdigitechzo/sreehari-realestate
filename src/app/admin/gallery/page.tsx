'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project, Plot, GalleryItem } from '@/lib/types';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Building2,
  MapPin,
  Film,
  Compass,
  Play,
  Upload,
  RefreshCw
} from 'lucide-react';

export interface UnifiedMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  category: string;
  source: 'Project' | 'Plot' | 'Site Photo';
  projectId?: string;
  projectName?: string;
  plotId?: string;
  plotNumber?: string;
  plotStatus?: string;
  dimensions?: string;
  facing?: string;
  areaSqft?: number;
  canDelete?: boolean;
  galleryId?: string;
}

function parseVideoEmbed(url: string): { type: 'youtube' | 'direct' | 'unknown'; embedUrl: string } {
  if (!url || typeof url !== 'string') return { type: 'unknown', embedUrl: '' };
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  }
  return { type: 'direct', embedUrl: trimmed };
}

export default function AdminGalleryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [sitePhotos, setSitePhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'Project' | 'Plot' | 'Site Photo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox / Slider Modal state
  const [sliderIndex, setSliderIndex] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Add Site Photo Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads & Infrastructure',
    image_url: '',
    project_id: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllMedia();
  }, []);

  async function loadAllMedia() {
    setLoading(true);
    try {
      const [projRes, plotRes, galleryRes] = await Promise.all([
        api.getProjects().catch(() => ({ data: [] })),
        api.getPlots().catch(() => ({ data: [] })),
        api.getGallery().catch(() => ({ data: [] }))
      ]);

      if (Array.isArray(projRes?.data)) setProjects(projRes.data);
      if (Array.isArray(plotRes?.data)) setPlots(plotRes.data);
      if (Array.isArray(galleryRes?.data)) setSitePhotos(galleryRes.data);
    } catch (err) {
      console.error('Failed to load gallery data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Build unified media items list from projects, plots, and standalone gallery photos
  const unifiedMedia: UnifiedMediaItem[] = useMemo(() => {
    const list: UnifiedMediaItem[] = [];
    const seenUrls = new Set<string>();

    const projectMap = new Map<string, Project>();
    projects.forEach((p) => {
      if (p.id) projectMap.set(p.id, p);
    });

    // 1. Project Media
    projects.forEach((proj) => {
      const pName = proj.name || 'Project';

      // Project Cover (hero_image or banner_image)
      const cover = proj.banner_image || proj.hero_image;
      if (cover && !seenUrls.has(`proj-cover-${proj.id}-${cover}`)) {
        seenUrls.add(`proj-cover-${proj.id}-${cover}`);
        list.push({
          id: `proj-cover-${proj.id}`,
          title: `${pName} — Cover Banner`,
          type: 'image',
          url: cover,
          category: 'Project Cover',
          source: 'Project',
          projectId: proj.id,
          projectName: pName
        });
      }

      // Project Gallery Images
      if (Array.isArray(proj.gallery_images)) {
        proj.gallery_images.forEach((img, idx) => {
          if (img && !seenUrls.has(`proj-gallery-${proj.id}-${img}`)) {
            seenUrls.add(`proj-gallery-${proj.id}-${img}`);
            list.push({
              id: `proj-gallery-${proj.id}-${idx}`,
              title: `${pName} — Layout Photo #${idx + 1}`,
              type: 'image',
              url: img,
              category: 'Project Layout / Roads',
              source: 'Project',
              projectId: proj.id,
              projectName: pName
            });
          }
        });
      }

      // Project Walkthrough / Promotional Video
      if (proj.video_url && !seenUrls.has(`proj-video-${proj.id}-${proj.video_url}`)) {
        seenUrls.add(`proj-video-${proj.id}-${proj.video_url}`);
        list.push({
          id: `proj-video-${proj.id}`,
          title: `${pName} — Master Video Tour`,
          type: 'video',
          url: proj.video_url,
          category: 'Project Video Tour',
          source: 'Project',
          projectId: proj.id,
          projectName: pName
        });
      }
    });

    // 2. Plot Media
    plots.forEach((plot) => {
      const parentProj = plot.project_id ? projectMap.get(plot.project_id) : undefined;
      const pName = parentProj?.name || plot.project_name || 'Project';
      const cleanPlotNum = (plot.plot_number || '').trim() || 'Plot';

      // Primary Plot Image
      if (plot.primary_image_url && !seenUrls.has(`plot-primary-${plot.id}-${plot.primary_image_url}`)) {
        seenUrls.add(`plot-primary-${plot.id}-${plot.primary_image_url}`);
        list.push({
          id: `plot-primary-${plot.id}`,
          title: `${pName} • ${cleanPlotNum} — Primary Photo`,
          type: 'image',
          url: plot.primary_image_url,
          category: 'Plot Photo',
          source: 'Plot',
          projectId: plot.project_id,
          projectName: pName,
          plotId: plot.id,
          plotNumber: cleanPlotNum,
          plotStatus: plot.status,
          dimensions: plot.dimension_str || plot.dimension,
          facing: plot.facing,
          areaSqft: plot.area_sqft
        });
      }

      // Plot Gallery Images
      if (Array.isArray(plot.gallery_images)) {
        plot.gallery_images.forEach((img, idx) => {
          if (img && !seenUrls.has(`plot-gal-${plot.id}-${img}`)) {
            seenUrls.add(`plot-gal-${plot.id}-${img}`);
            list.push({
              id: `plot-gal-${plot.id}-${idx}`,
              title: `${pName} • ${cleanPlotNum} — Angle #${idx + 1}`,
              type: 'image',
              url: img,
              category: 'Plot Gallery',
              source: 'Plot',
              projectId: plot.project_id,
              projectName: pName,
              plotId: plot.id,
              plotNumber: cleanPlotNum,
              plotStatus: plot.status,
              dimensions: plot.dimension_str || plot.dimension,
              facing: plot.facing,
              areaSqft: plot.area_sqft
            });
          }
        });
      }

      // Plot Video
      const allVideos: string[] = [];
      if (Array.isArray(plot.video_urls)) {
        plot.video_urls.forEach((v) => { if (v && !allVideos.includes(v)) allVideos.push(v); });
      }
      if (plot.video_url && !allVideos.includes(plot.video_url)) {
        allVideos.push(plot.video_url);
      }

      allVideos.forEach((vUrl, vIdx) => {
        if (!seenUrls.has(`plot-vid-${plot.id}-${vUrl}`)) {
          seenUrls.add(`plot-vid-${plot.id}-${vUrl}`);
          list.push({
            id: `plot-vid-${plot.id}-${vIdx}`,
            title: `${pName} • ${cleanPlotNum} — Video Walkthrough`,
            type: 'video',
            url: vUrl,
            category: 'Plot Video',
            source: 'Plot',
            projectId: plot.project_id,
            projectName: pName,
            plotId: plot.id,
            plotNumber: cleanPlotNum,
            plotStatus: plot.status,
            dimensions: plot.dimension_str || plot.dimension,
            facing: plot.facing,
            areaSqft: plot.area_sqft
          });
        }
      });
    });

    // 3. Standalone Site Photos
    sitePhotos.forEach((item) => {
      if (item.image_url && !seenUrls.has(`site-photo-${item.id}-${item.image_url}`)) {
        seenUrls.add(`site-photo-${item.id}-${item.image_url}`);
        const parentProj = item.project_id ? projectMap.get(item.project_id) : undefined;
        list.push({
          id: `site-photo-${item.id}`,
          title: item.title || 'Site Infrastructure Photo',
          type: 'image',
          url: item.image_url,
          category: item.category || 'Site Photos',
          source: 'Site Photo',
          projectId: item.project_id,
          projectName: parentProj?.name || 'General Site',
          canDelete: true,
          galleryId: item.id
        });
      }
    });

    return list;
  }, [projects, plots, sitePhotos]);

  // Available plots under currently selected project (or all plots)
  const availablePlotsForFilter = useMemo(() => {
    if (selectedProjectId === 'all') return plots;
    return plots.filter((p) => p.project_id === selectedProjectId);
  }, [plots, selectedProjectId]);

  // Filtered Media
  const filteredMedia = useMemo(() => {
    return unifiedMedia.filter((item) => {
      // Project filter
      if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) {
        return false;
      }
      // Plot filter
      if (selectedPlotId !== 'all' && item.plotId !== selectedPlotId) {
        return false;
      }
      // Media type filter
      if (selectedMediaType !== 'all' && item.type !== selectedMediaType) {
        return false;
      }
      // Source filter
      if (selectedSource !== 'all' && item.source !== selectedSource) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchProj = (item.projectName || '').toLowerCase().includes(q);
        const matchPlot = (item.plotNumber || '').toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchProj && !matchPlot && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [unifiedMedia, selectedProjectId, selectedPlotId, selectedMediaType, selectedSource, searchQuery]);

  // Slider controls
  const activeSlide = sliderIndex !== null && filteredMedia[sliderIndex] ? filteredMedia[sliderIndex] : null;

  const handlePrevSlide = useCallback(() => {
    if (sliderIndex === null || filteredMedia.length === 0) return;
    setSliderIndex((prev) => (prev! > 0 ? prev! - 1 : filteredMedia.length - 1));
  }, [sliderIndex, filteredMedia.length]);

  const handleNextSlide = useCallback(() => {
    if (sliderIndex === null || filteredMedia.length === 0) return;
    setSliderIndex((prev) => (prev! < filteredMedia.length - 1 ? prev! + 1 : 0));
  }, [sliderIndex, filteredMedia.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (sliderIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSliderIndex(null);
      if (e.key === 'ArrowLeft') handlePrevSlide();
      if (e.key === 'ArrowRight') handleNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sliderIndex, handlePrevSlide, handleNextSlide]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Direct file upload in Add Site Photo modal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File exceeds 25MB limit. Please upload an optimized image.');
      return;
    }

    setUploadingMedia(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const uploadRes = await api.uploadMedia({ imageBase64: base64, filename: file.name });
          if (uploadRes?.success && uploadRes?.fileUrl) {
            setFormData((prev) => ({
              ...prev,
              image_url: uploadRes.fileUrl,
              title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
            }));
          } else {
            alert('Upload failed: ' + (uploadRes?.message || 'Unknown error'));
          }
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        } finally {
          setUploadingMedia(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Error reading file: ' + err.message);
      setUploadingMedia(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url.trim()) {
      alert('Please provide or upload an image file first.');
      return;
    }
    try {
      await api.addGalleryItem({
        title: formData.title,
        category: formData.category,
        image_url: formData.image_url,
        project_id: formData.project_id || undefined
      });
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        category: 'Roads & Infrastructure',
        image_url: '',
        project_id: ''
      });
      loadAllMedia();
    } catch (err: any) {
      alert(err.message || 'Failed to add media item');
    }
  };

  const handleDeleteSitePhoto = async (galleryId: string) => {
    if (!confirm('Are you sure you want to delete this custom site photo?')) return;
    try {
      await api.deleteGalleryItem(galleryId);
      loadAllMedia();
      if (sliderIndex !== null) setSliderIndex(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete gallery item');
    }
  };

  // Stats
  const totalCount = unifiedMedia.length;
  const photoCount = unifiedMedia.filter((m) => m.type === 'image').length;
  const videoCount = unifiedMedia.filter((m) => m.type === 'video').length;
  const projectMediaCount = unifiedMedia.filter((m) => m.source === 'Project').length;
  const plotMediaCount = unifiedMedia.filter((m) => m.source === 'Plot').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Unified Media & Gallery Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
            <span>Project & Plot Media Library</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Central repository connecting all project banners, layout photos, promotional walkthrough videos, and individual plot media in one searchable gallery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadAllMedia()}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
            title="Refresh All Media"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/60"
          >
            <Plus className="w-4 h-4" />
            <span>Add Site Photo</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Media</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Photos & Layouts</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{photoCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <ImageIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Playable Videos</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{videoCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center text-amber-400">
            <Film className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Project Assets</p>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">{projectMediaCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Plot Assets</p>
            <p className="text-xl font-bold text-teal-400 mt-0.5">{plotMediaCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-950/50 border border-teal-800/40 flex items-center justify-center text-teal-400">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name, plot number (e.g. Plot 01), category..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedPlotId('all');
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plot Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Plots ({availablePlotsForFilter.length})</option>
              {availablePlotsForFilter.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.plot_number} {p.dimension_str ? `(${p.dimension_str})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Media Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Media</option>
              <option value="image" className="bg-slate-900 text-white">Photos Only ({photoCount})</option>
              <option value="video" className="bg-slate-900 text-white">Videos Only ({videoCount})</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Sources</option>
              <option value="Project" className="bg-slate-900 text-white">Project Level</option>
              <option value="Plot" className="bg-slate-900 text-white">Plot Level</option>
              <option value="Site Photo" className="bg-slate-900 text-white">Site Photos</option>
            </select>
          </div>

          {(selectedProjectId !== 'all' || selectedPlotId !== 'all' || selectedMediaType !== 'all' || selectedSource !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedProjectId('all');
                setSelectedPlotId('all');
                setSelectedMediaType('all');
                setSelectedSource('all');
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 underline px-1.5 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Media Grid Section */}
      {loading ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-white font-medium text-sm">Aggregating Project and Plot Media...</p>
          <p className="text-slate-500 text-xs mt-1">Connecting database records, layout photos, and video tours</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No media items found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            {searchQuery || selectedProjectId !== 'all' || selectedMediaType !== 'all'
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Add site photos, project banners, or plot images to populate this library.'}
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredMedia.length}</strong> items
            </span>
            <span className="text-slate-500 text-[11px]">Click any card to launch interactive slider</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item, index) => {
              const isVid = item.type === 'video';
              const embed = isVid ? parseVideoEmbed(item.url) : null;

              return (
                <div
                  key={item.id}
                  onClick={() => setSliderIndex(index)}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between shadow-md"
                >
                  {/* Thumbnail Container */}
                  <div className="h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    {isVid ? (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 relative">
                        {embed?.type === 'youtube' ? (
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <Film className="w-10 h-10 text-amber-400/80" />
                          </div>
                        ) : (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                          <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow ${
                          item.source === 'Project'
                            ? 'bg-indigo-600/90 text-white'
                            : item.source === 'Plot'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-teal-600/90 text-white'
                        }`}
                      >
                        {item.source}
                      </span>

                      {item.plotNumber && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow">
                          {item.plotNumber}
                        </span>
                      )}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isVid ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-500/40">
                          <Film className="w-3 h-3" />
                          <span>Video</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-emerald-300 border border-emerald-500/40">
                          <ImageIcon className="w-3 h-3" />
                          <span>Photo</span>
                        </span>
                      )}
                    </div>

                    {/* Category Label */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[80%]">
                        {item.category}
                      </span>

                      {item.canDelete && item.galleryId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSitePhoto(item.galleryId!);
                          }}
                          className="p-1 rounded bg-rose-950/90 text-rose-300 hover:bg-rose-900 border border-rose-800/60 transition"
                          title="Delete Site Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-emerald-400 transition">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{item.projectName || 'Sree Hari Layout'}</span>
                      </p>
                    </div>

                    {item.source === 'Plot' && (item.dimensions || item.facing) && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{item.dimensions || ''}</span>
                        <span className="text-emerald-400 font-medium">{item.facing || ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Lightbox / Slider Modal */}
      {sliderIndex !== null && activeSlide && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 shrink-0">
                Item {sliderIndex + 1} of {filteredMedia.length}
              </span>

              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {activeSlide.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-semibold">{activeSlide.projectName}</span>
                  {activeSlide.plotNumber && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{activeSlide.plotNumber}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{activeSlide.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(activeSlide.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                title="Copy Media URL"
              >
                {copiedUrl === activeSlide.url ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={activeSlide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                title="Open raw file in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Original</span>
              </a>

              {activeSlide.canDelete && activeSlide.galleryId && (
                <button
                  onClick={() => handleDeleteSitePhoto(activeSlide.galleryId!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs border border-rose-800/60 transition"
                  title="Delete site photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button
                onClick={() => setSliderIndex(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Media Player / Viewer */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Previous Button */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl border border-slate-700 transition"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Media Content */}
            <div className="w-full h-full max-h-[70vh] flex items-center justify-center">
              {activeSlide.type === 'video' ? (
                (() => {
                  const embed = parseVideoEmbed(activeSlide.url);
                  if (embed.type === 'youtube') {
                    return (
                      <iframe
                        src={embed.embedUrl}
                        title={activeSlide.title}
                        className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl border border-slate-800"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={activeSlide.url}
                      controls
                      autoPlay
                      playsInline
                      className="max-h-[68vh] max-w-full rounded-xl shadow-2xl border border-slate-800 bg-black"
                    />
                  );
                })()
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeSlide.url}
                  alt={activeSlide.title}
                  className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                />
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextSlide}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl border border-slate-700 transition"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip and Info */}
          <div className="border-t border-slate-800/80 pt-3 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Detail Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-300">
              {activeSlide.source === 'Plot' && (
                <>
                  {activeSlide.dimensions && (
                    <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      Dimensions: <strong className="text-white">{activeSlide.dimensions}</strong>
                    </span>
                  )}
                  {activeSlide.facing && (
                    <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      Facing: <strong className="text-emerald-400">{activeSlide.facing}</strong>
                    </span>
                  )}
                  {activeSlide.plotStatus && (
                    <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      Status: <strong className="text-amber-400">{activeSlide.plotStatus}</strong>
                    </span>
                  )}
                </>
              )}

              {activeSlide.projectId && (
                <Link
                  href={`/admin/projects/${activeSlide.projectId}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                >
                  <span>Open {activeSlide.projectName} Workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
              {filteredMedia.slice(Math.max(0, sliderIndex - 4), sliderIndex + 5).map((thumb) => {
                const realIdx = filteredMedia.findIndex((m) => m.id === thumb.id);
                const isCurrent = realIdx === sliderIndex;
                return (
                  <button
                    key={thumb.id}
                    onClick={() => setSliderIndex(realIdx)}
                    className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      isCurrent
                        ? 'border-emerald-400 scale-105 shadow-md shadow-emerald-950'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {thumb.type === 'video' ? (
                      <div className="w-full h-full bg-slate-950 flex items-center justify-center text-amber-400">
                        <Play className="w-3.5 h-3.5 fill-amber-400" />
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Site Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Add Site / Infrastructure Photo</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Upload a layout photo, blacktop road, or park view.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="30ft Blacktop Roads with Solar Streetlights"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Entrance Gate">Entrance Gate & Arch</option>
                  <option value="Parks & Play Areas">Parks & Play Areas</option>
                  <option value="Aerial Layouts">Aerial Layouts & Drone Views</option>
                  <option value="Water Tank & Utilities">Sweet Water & Utilities</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Associate With Project (Optional)</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">General Sree Hari Realty Photo</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Upload Photo File or Direct Image URL *</label>
                
                {/* File picker button */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 font-semibold text-xs transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMedia ? 'Uploading...' : 'Choose Image File from Device'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="https://... or upload above"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs font-mono"
                />

                {formData.image_url && (
                  <div className="mt-2 h-28 w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingMedia || !formData.image_url}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
