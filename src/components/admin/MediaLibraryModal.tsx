'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  X,
  Upload,
  Video,
  Image as ImageIcon,
  Play,
  Check,
  Search,
  ExternalLink,
  Film,
  Sparkles,
  Layers,
  FolderOpen
} from 'lucide-react';

interface MediaItem {
  fileName: string;
  url: string;
  type: 'video' | 'image';
  sizeBytes?: number;
  createdAt?: string;
  title?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, type: 'video' | 'image') => void;
  filterType?: 'all' | 'video' | 'image';
  title?: string;
}

// Built-in verified media assets for Sree Hari Realty projects
const BUILT_IN_MEDIA: MediaItem[] = [
  {
    fileName: 'park-avenue-aerial-walkthrough.mp4',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-residential-suburb-with-houses-and-gardens-41551-large.mp4',
    type: 'video',
    title: 'Park Avenue Aerial Walkthrough Drone Video'
  },
  {
    fileName: 'youtube-sreehari-promo.url',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    type: 'video',
    title: 'Sree Hari Realty Showcase (YouTube)'
  },
  {
    fileName: 'hero-banner-park-avenue.jpg',
    url: '/project_park_avenue_new.jpg',
    type: 'image',
    title: 'Park Avenue Master Layout Banner'
  },
  {
    fileName: 'site-infrastructure-blacktop.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    title: 'Avenue Blacktop Road & Tree Plantation'
  },
  {
    fileName: 'villa-plots-development.jpg',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    title: 'Individual Villa Plot Boundary Demarcation'
  }
];

function getVideoEmbedInfo(url: string): { type: 'youtube' | 'direct' | 'unknown'; embedUrl: string } {
  if (!url || typeof url !== 'string') return { type: 'unknown', embedUrl: '' };
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  return { type: 'direct', embedUrl: trimmed };
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  filterType = 'all',
  title = 'Media Library & File Manager'
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image'>(filterType);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingVideoUrl, setPreviewingVideoUrl] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setActiveTab(filterType);
      setSelectedMedia(null);
      setPreviewingVideoUrl(null);
      setUploadError('');
    }
  }, [isOpen, filterType]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await api.getUploadedMedia();
      let serverFiles: MediaItem[] = [];
      if (res && res.success && Array.isArray(res.files)) {
        serverFiles = res.files.map((f: any) => ({
          fileName: f.fileName,
          url: f.url,
          type: f.type || (f.url.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image'),
          sizeBytes: f.sizeBytes,
          createdAt: f.createdAt,
          title: f.fileName
        }));
      }

      // Merge server uploads with built-in templates (avoiding URL duplicates)
      const existingUrls = new Set(serverFiles.map((f) => f.url));
      const combined = [...serverFiles];
      for (const b of BUILT_IN_MEDIA) {
        if (!existingUrls.has(b.url)) {
          combined.push(b);
        }
      }
      setMediaList(combined);
    } catch (err) {
      console.error('Failed to load media list:', err);
      setMediaList(BUILT_IN_MEDIA);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|ogg)$/i);
        const base64 = await readFileAsBase64(file);

        const res = await api.uploadMedia({
          imageBase64: base64,
          filename: file.name
        });

        if (res && res.success && res.fileUrl) {
          const newItem: MediaItem = {
            fileName: res.fileName || file.name,
            url: res.fileUrl,
            type: isVideo ? 'video' : 'image',
            sizeBytes: file.size,
            createdAt: new Date().toISOString(),
            title: file.name
          };
          setMediaList((prev) => [newItem, ...prev]);
          setSelectedMedia(newItem);
        } else {
          throw new Error(res?.message || 'Upload failed');
        }
      }
    } catch (err: any) {
      console.error('Upload media error:', err);
      setUploadError(err.message || 'File upload failed. Ensure file is within server limit.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    const isVideo =
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      Boolean(trimmed.match(/\.(mp4|webm|mov|ogg)($|\?)/i));

    const newItem: MediaItem = {
      fileName: trimmed.split('/').pop() || 'external-media',
      url: trimmed,
      type: isVideo ? 'video' : 'image',
      title: trimmed
    };

    setMediaList((prev) => [newItem, ...prev]);
    setSelectedMedia(newItem);
    setCustomUrl('');
  };

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    if (item.type === 'video') {
      setPreviewingVideoUrl(item.url);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedMedia) {
      onSelect(selectedMedia.url, selectedMedia.type);
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredItems = mediaList.filter((item) => {
    if (activeTab === 'video' && item.type !== 'video') return false;
    if (activeTab === 'image' && item.type !== 'image') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.fileName?.toLowerCase().includes(q);
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchUrl = item.url?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchUrl) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  {mediaList.length} Files
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Browse stored promotional videos, layout photos, or upload new files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Tabs, Search, Upload, Custom URL */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {/* Tab Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Files
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'image'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions: Upload & Add URL */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow shadow-emerald-950/60">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* External URL Quick Paste Bar */}
        <div className="px-6 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste direct video or image URL (YouTube, MP4, WebM, PNG, JPG)..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleAddCustomUrl}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Add to Library
          </button>
        </div>

        {uploadError && (
          <div className="px-6 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs">
            {uploadError}
          </div>
        )}

        {/* Modal Main Content: Grid & Preview Sidebar */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[380px]">
          {/* Media Grid (2 cols) */}
          <div className="md:col-span-2 p-6 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading media assets...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-2">
                <Film className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-semibold">No media files found</p>
                <p className="text-xs text-slate-500">
                  Upload a video/image or paste an external URL to add it.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredItems.map((item, idx) => {
                  const isSelected = selectedMedia?.url === item.url;
                  const isVideo = item.type === 'video';

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectMedia(item)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition flex flex-col bg-slate-950 ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Media Thumbnail */}
                      <div className="relative h-28 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        {isVideo ? (
                          <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center">
                            <Video className="w-8 h-8 text-pink-400 group-hover:scale-110 transition" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow">
                                <Play className="w-4 h-4 ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}

                        {/* Badge for Type */}
                        <div className="absolute top-1.5 left-1.5">
                          {isVideo ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-950/90 text-pink-300 border border-pink-700/60 px-1.5 py-0.5 rounded">
                              VIDEO
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded">
                              IMAGE
                            </span>
                          )}
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="p-2 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-200 truncate">
                          {item.title || item.fileName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">
                          {item.url}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview & Selection Sidebar (1 col) */}
          <div className="border-t md:border-t-0 md:border-l border-slate-800 p-6 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
            {selectedMedia ? (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Selected File Preview
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5 truncate">
                    {selectedMedia.title || selectedMedia.fileName}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                    Type: <span className="text-white font-semibold">{selectedMedia.type}</span>
                  </p>
                </div>

                {/* Live Preview Container */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black min-h-[160px] flex items-center justify-center">
                  {selectedMedia.type === 'video' ? (
                    (() => {
                      const embed = getVideoEmbedInfo(selectedMedia.url);
                      if (embed.type === 'youtube') {
                        return (
                          <iframe
                            src={embed.embedUrl}
                            className="w-full h-44 rounded-xl border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      }
                      return (
                        <video
                          src={embed.embedUrl}
                          controls
                          className="w-full h-44 object-contain rounded-xl"
                        />
                      );
                    })()
                  ) : (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.fileName}
                      className="w-full h-44 object-cover rounded-xl"
                    />
                  )}
                </div>

                {/* URL Details */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    File Location URL
                  </span>
                  <p className="text-xs text-emerald-300 font-mono break-all select-all">
                    {selectedMedia.url}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center space-y-2 py-10">
                <Film className="w-8 h-8 text-slate-600" />
                <p className="text-xs">Select any file from the grid to preview and insert.</p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedMedia}
                onClick={handleConfirmSelection}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use Selected {selectedMedia?.type === 'video' ? 'Video' : 'Media'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
