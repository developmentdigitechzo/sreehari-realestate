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
  FolderOpen,
  Edit3,
  Trash2,
  Save,
  AlertTriangle
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

// Built-in verified media assets for Sree Hari Realty projects (managed in persistent library database)
const BUILT_IN_MEDIA: MediaItem[] = [];

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

  // Edit Modal State
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setActiveTab(filterType);
      setSelectedMedia(null);
      setPreviewingVideoUrl(null);
      setUploadError('');
      setEditingMedia(null);
    }
  }, [isOpen, filterType]);

  async function loadMedia() {
    setLoading(true);
    try {
      const res = await api.getUploadedMedia();
      let serverFiles: MediaItem[] = [];
      if (res && res.success && Array.isArray(res.files)) {
        serverFiles = res.files.map((f: any) => ({
          fileName: f.fileName || f.filename,
          url: f.url,
          type: f.type || (f.url.match(/\.(mp4|webm|mov|ogg)$/i) ? 'video' : 'image'),
          sizeBytes: f.sizeBytes,
          createdAt: f.createdAt,
          title: f.title || f.fileName || f.filename
        }));
      }
      setMediaList(serverFiles);
    } catch (err) {
      console.error('Failed to load media list:', err);
      setMediaList([]);
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
        const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|webm|mov|ogg)$/i));
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

  const handleAddCustomUrl = async () => {
    if (!customUrl.trim()) return;
    const trimmed = customUrl.trim();
    const isVideo =
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      Boolean(trimmed.match(/\.(mp4|webm|mov|ogg)($|\?)/i));

    const defaultTitle = trimmed.split('/').pop()?.split('?')[0] || (isVideo ? 'External Video' : 'External Image');

    try {
      const res = await api.addExternalMedia({
        url: trimmed,
        type: isVideo ? 'video' : 'image',
        title: defaultTitle
      });

      if (res && res.success && res.item) {
        const newItem: MediaItem = {
          fileName: res.item.fileName || defaultTitle,
          url: res.item.url,
          type: res.item.type,
          title: res.item.title || defaultTitle,
          createdAt: res.item.createdAt
        };
        setMediaList((prev) => [newItem, ...prev.filter((m) => m.url !== trimmed)]);
        setSelectedMedia(newItem);
      } else {
        const fallbackItem: MediaItem = {
          fileName: defaultTitle,
          url: trimmed,
          type: isVideo ? 'video' : 'image',
          title: defaultTitle
        };
        setMediaList((prev) => [fallbackItem, ...prev.filter((m) => m.url !== trimmed)]);
        setSelectedMedia(fallbackItem);
      }
      setCustomUrl('');
    } catch (err: any) {
      console.error('Failed to add external media:', err);
      alert('Could not save external media link to database');
    }
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

  // Delete media item permanently from database and disk
  const handleDeleteMedia = async (item: MediaItem) => {
    const label = item.title || item.fileName;
    if (!confirm(`Are you sure you want to permanently delete "${label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const identifier = item.fileName || item.url.split('/').pop() || item.url;
      await api.deleteMedia(identifier);
      setMediaList((prev) => prev.filter((m) => m.url !== item.url && m.fileName !== item.fileName));
      if (selectedMedia?.url === item.url) {
        setSelectedMedia(null);
        setPreviewingVideoUrl(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete media asset');
    }
  };

  // Start edit media title
  const handleStartEdit = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitleInput(item.title || item.fileName);
  };

  // Save edited media
  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    const newTitle = editTitleInput.trim() || editingMedia.fileName;
    setEditSaving(true);
    try {
      const identifier = editingMedia.fileName || editingMedia.url.split('/').pop() || editingMedia.url;
      await api.updateMedia(identifier, { title: newTitle });
      setMediaList((prev) =>
        prev.map((m) => (m.url === editingMedia.url ? { ...m, title: newTitle } : m))
      );
      if (selectedMedia?.url === editingMedia.url) {
        setSelectedMedia((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
      setEditingMedia(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save media information');
    } finally {
      setEditSaving(false);
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Manage, edit, upload, or choose high-resolution assets & walkthrough videos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subheader: Filter Tabs, Search & Custom URL input */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/30 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Files ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTab === 'video' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos ({mediaList.filter((m) => m.type === 'video').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('image')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                activeTab === 'image' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images ({mediaList.filter((m) => m.type === 'image').length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search media by title or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* External URL Quick Add */}
        <div className="px-6 py-2.5 bg-slate-950/20 border-b border-slate-800/80 flex items-center gap-2">
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="url"
            placeholder="Paste external Image or YouTube/MP4 Video URL to add to library..."
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
          <div className="px-6 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
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
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt={item.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}

                        {/* Badge for Type */}
                        <div className="absolute top-1.5 left-1.5 z-10">
                          {isVideo ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-950/90 text-pink-300 border border-pink-700/60 px-1.5 py-0.5 rounded shadow">
                              VIDEO
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded shadow">
                              IMAGE
                            </span>
                          )}
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow z-10">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* In-Card Quick Actions (Edit & Delete on Hover) */}
                        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(item);
                            }}
                            title="Edit Media Label"
                            className="w-6 h-6 rounded-md bg-slate-900/90 hover:bg-emerald-600 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(item);
                            }}
                            title="Delete File"
                            className="w-6 h-6 rounded-md bg-slate-900/90 hover:bg-rose-600 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="p-2 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-200 truncate" title={item.title || item.fileName}>
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
                  <h4 className="text-sm font-bold text-white mt-0.5 truncate" title={selectedMedia.title || selectedMedia.fileName}>
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
                    // eslint-disable-next-line @next/next/no-img-element
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

                {/* Item Management Buttons (Edit & Delete) */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(selectedMedia)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(selectedMedia)}
                    className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
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

        {/* EDIT MEDIA MODAL POPUP */}
        {editingMedia && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  Edit Media Details
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Display Title / Label</label>
                  <input
                    type="text"
                    value={editTitleInput}
                    onChange={(e) => setEditTitleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Master Layout View"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Media File URL</label>
                  <p className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-2.5 rounded-xl break-all border border-slate-800 select-all">
                    {editingMedia.url}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editSaving ? 'Saving...' : 'Save Title'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
