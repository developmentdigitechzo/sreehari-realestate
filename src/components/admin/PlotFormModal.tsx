'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Plot, Project } from '@/lib/types';
import GpsLocationPicker from './GpsLocationPicker';
import {
  X,
  Save,
  Layers,
  Sparkles,
  Lock,
  Image as ImageIcon,
  Video,
  MapPin,
  CheckCircle2,
  Upload,
  Play,
  FileText,
  Building2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

const FACING_OPTIONS = [
  'North',
  'East',
  'West',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
  'Other'
];

const PLOT_TYPE_OPTIONS = [
  'Residential Plot',
  'Commercial Plot',
  'Corner Villa Plot',
  'Farm Land',
  'Industrial Plot',
  'Plot',
  'Other'
];

const APPROVAL_OPTIONS = [
  'DTCP Approved',
  'CMDA Approved',
  'RERA Approved',
  'Panchayat Approved',
  'Patta Land',
  'Other'
];

const CATEGORY_OPTIONS = [
  'Sale',
  'Resale',
  'Lease',
  'Other'
];

export function formatPlotNumber(plotNumber?: string, title?: string, id?: string): string {
  const pNum = (plotNumber || '').trim();
  const cleanTitle = (title || '').trim();

  if (pNum && cleanTitle && pNum.toLowerCase() !== cleanTitle.toLowerCase()) {
    if (cleanTitle.toLowerCase().startsWith(pNum.toLowerCase())) {
      return cleanTitle;
    }
    return `${pNum} - ${cleanTitle}`;
  }

  if (pNum) return pNum;
  if (cleanTitle) return cleanTitle;
  if (id && id.trim()) {
    const num = id.replace(/^[^\d]*/, '');
    if (num) return `Plot ${num}`;
  }
  return 'Plot Entry';
}

interface PlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedPlot: Plot) => void;
  onSuccess?: (savedPlot?: Plot) => void;
  plotToEdit?: Plot | null;
  initialProjectId?: string;
  initialProjectName?: string;
  projectsList?: Project[];
}

export default function PlotFormModal({
  isOpen,
  onClose,
  onSaved,
  onSuccess,
  plotToEdit,
  initialProjectId,
  initialProjectName,
  projectsList
}: PlotFormModalProps) {
  const [projects, setProjects] = useState<Project[]>(projectsList || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'dimensions' | 'media' | 'location'>('basic');

  // Media Library state

  // Form Data State
  const [formData, setFormData] = useState<Partial<Plot>>({
    project_id: initialProjectId || '',
    title: '',
    slug: '',
    type: 'Residential Plot',
    category: 'Sale',
    locality: '',
    road_corridor: '',
    taluk: '',
    district: 'Trichy',
    plot_number: '',
    length_ft: '' as any,
    width_ft: '' as any,
    dimension_str: '',
    area_sqft: '' as any,
    facing: 'North',
    approval_status: 'DTCP Approved',
    price_per_sqft: '' as any,
    total_price_lakhs: '' as any,
    price: '' as any,
    currency: 'INR',
    status: 'Available',
    listing_visibility: 'Publish to Website & CRM',
    amenities: '',
    description: '',
    meta_title: '',
    meta_description: '',
    video_url: '',
    video_urls: [],
    latitude: '',
    longitude: '',
    primary_image_url: '',
    gallery_images: []
  });

  // "Other" dropdown state
  const [customFacing, setCustomFacing] = useState('');
  const [customType, setCustomType] = useState('');
  const [customApproval, setCustomApproval] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Draft inputs
  const [newVideoInput, setNewVideoInput] = useState('');
  const [newImageInput, setNewImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Track modal open state and edit target so form is initialized ONCE on open, NEVER mid-typing
  const prevIsOpenRef = useRef(false);
  const prevPlotIdRef = useRef<string | undefined>(undefined);

  // Load project list if not provided
  useEffect(() => {
    if (projectsList && projectsList.length > 0) {
      setProjects(projectsList);
    } else if (isOpen) {
      api.getProjects().then((res) => {
        if (res?.data) {
          setProjects(res.data);
          setFormData((prev) => {
            if (prev.project_id) return prev;
            const defaultId = initialProjectId || res.data[0]?.id || '';
            const proj = res.data.find((p: Project) => p.id === defaultId);
            return {
              ...prev,
              project_id: defaultId,
              latitude: prev.latitude || proj?.latitude || '',
              longitude: prev.longitude || proj?.longitude || ''
            };
          });
        }
      }).catch(() => null);
    }
  }, [projectsList, isOpen, initialProjectId]);

  // Sync edit data or new data ONLY when opened or when plotToEdit target changes
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const wasClosed = !prevIsOpenRef.current;
    const plotChanged = (plotToEdit?.id || 'new') !== (prevPlotIdRef.current || 'new');
    prevIsOpenRef.current = true;
    prevPlotIdRef.current = plotToEdit?.id;

    if (!wasClosed && !plotChanged) {
      return;
    }

    setActiveTab('basic');
    setSaveError('');

    if (plotToEdit) {
      // Editing existing plot
      const facingIsOther = !FACING_OPTIONS.filter((o) => o !== 'Other').includes(plotToEdit.facing);
      const typeIsOther = !PLOT_TYPE_OPTIONS.filter((o) => o !== 'Other').includes(plotToEdit.type || '');
      const approvalIsOther = !APPROVAL_OPTIONS.filter((o) => o !== 'Other').includes(plotToEdit.approval_status || '');
      const categoryIsOther = !CATEGORY_OPTIONS.filter((o) => o !== 'Other').includes(plotToEdit.category || '');

      setCustomFacing(facingIsOther ? plotToEdit.facing : '');
      setCustomType(typeIsOther ? (plotToEdit.type || '') : '');
      setCustomApproval(approvalIsOther ? (plotToEdit.approval_status || '') : '');
      setCustomCategory(categoryIsOther ? (plotToEdit.category || '') : '');

      const vUrls = Array.isArray(plotToEdit.video_urls) && plotToEdit.video_urls.length > 0
        ? plotToEdit.video_urls
        : (plotToEdit.video_url ? [plotToEdit.video_url] : []);

      setFormData({
        ...plotToEdit,
        project_id: plotToEdit.project_id || initialProjectId || '',
        facing: facingIsOther ? 'Other' : plotToEdit.facing,
        type: typeIsOther ? 'Other' : (plotToEdit.type || 'Residential Plot'),
        approval_status: approvalIsOther ? 'Other' : (plotToEdit.approval_status || 'DTCP Approved'),
        category: categoryIsOther ? 'Other' : (plotToEdit.category || 'Sale'),
        video_urls: vUrls,
        video_url: vUrls[0] || plotToEdit.video_url || '',
        gallery_images: Array.isArray(plotToEdit.gallery_images) ? plotToEdit.gallery_images : [],
        primary_image_url: plotToEdit.primary_image_url || DEFAULT_PROPERTY_IMAGE,
        latitude: plotToEdit.latitude || '',
        longitude: plotToEdit.longitude || ''
      });
    } else {
      // Adding new plot with clean, fresh values (no dummy numbers)
      const defaultPid = initialProjectId || (projects[0]?.id || (projectsList && projectsList[0]?.id) || '');
      const linkedProj = projects.find((p) => p.id === defaultPid) || (projectsList && projectsList.find((p) => p.id === defaultPid));

      setFormData({
        project_id: defaultPid,
        title: '',
        slug: '',
        type: 'Residential Plot',
        category: 'Sale',
        locality: '',
        road_corridor: '',
        taluk: '',
        district: 'Trichy',
        plot_number: '',
        length_ft: '' as any,
        width_ft: '' as any,
        dimension_str: '',
        area_sqft: '' as any,
        facing: 'North',
        approval_status: 'DTCP Approved',
        price_per_sqft: '' as any,
        total_price_lakhs: '' as any,
        price: '' as any,
        currency: 'INR',
        status: 'Available',
        listing_visibility: 'Publish to Website & CRM',
        amenities: '',
        description: '',
        meta_title: '',
        meta_description: '',
        video_url: '',
        video_urls: [],
        latitude: linkedProj?.latitude || '',
        longitude: linkedProj?.longitude || '',
        primary_image_url: '',
        gallery_images: []
      });
      setCustomFacing('');
      setCustomType('');
      setCustomApproval('');
      setCustomCategory('');
    }
  }, [isOpen, plotToEdit, initialProjectId]);

  if (!isOpen) return null;

  // Handlers for Images
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await readFileAsBase64(file);
        const res = await api.uploadMedia({
          imageBase64: base64,
          filename: file.name
        });
        if (res && res.success && res.fileUrl) {
          uploadedUrls.push(res.fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => {
          const currentGallery = Array.isArray(prev.gallery_images) ? [...prev.gallery_images] : [];
          const merged = [...currentGallery, ...uploadedUrls];
          return {
            ...prev,
            gallery_images: merged,
            primary_image_url: prev.primary_image_url || merged[0]
          };
        });
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
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

  const handleAddImageUrl = () => {
    if (!newImageInput.trim()) return;
    const url = newImageInput.trim();
    setFormData((prev) => {
      const currentGallery = Array.isArray(prev.gallery_images) ? [...prev.gallery_images] : [];
      if (!currentGallery.includes(url)) {
        currentGallery.push(url);
      }
      return {
        ...prev,
        gallery_images: currentGallery,
        primary_image_url: prev.primary_image_url || url
      };
    });
    setNewImageInput('');
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setFormData((prev) => {
      const filtered = (prev.gallery_images || []).filter((img) => img !== urlToRemove);
      let newPrimary = prev.primary_image_url;
      if (prev.primary_image_url === urlToRemove) {
        newPrimary = filtered[0] || '';
      }
      return {
        ...prev,
        gallery_images: filtered,
        primary_image_url: newPrimary
      };
    });
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      primary_image_url: url
    }));
  };

  // Handlers for Videos
  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Video file size exceeds 50MB limit. Please choose a smaller video.');
      return;
    }

    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const uploadRes = await api.uploadMedia({ imageBase64: base64, filename: file.name });
          if (uploadRes?.success && uploadRes?.fileUrl) {
            setFormData((prev) => {
              const currentVideos = Array.isArray(prev.video_urls) ? [...prev.video_urls] : [];
              if (!currentVideos.includes(uploadRes.fileUrl)) {
                currentVideos.unshift(uploadRes.fileUrl);
              }
              return {
                ...prev,
                video_url: uploadRes.fileUrl,
                video_urls: currentVideos
              };
            });
          } else {
            alert('Video upload failed: ' + (uploadRes?.message || 'Unknown error'));
          }
        } catch (err: any) {
          alert('Video upload failed: ' + err.message);
        } finally {
          setUploadingVideo(false);
          if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Error reading video file: ' + err.message);
      setUploadingVideo(false);
    }
  };

  const handleAddVideoUrl = () => {
    if (!newVideoInput.trim()) return;
    const url = newVideoInput.trim();
    setFormData((prev) => {
      const currentVideos = Array.isArray(prev.video_urls) ? [...prev.video_urls] : [];
      if (!currentVideos.includes(url)) {
        currentVideos.push(url);
      }
      return {
        ...prev,
        video_urls: currentVideos,
        video_url: currentVideos[0] || url
      };
    });
    setNewVideoInput('');
  };

  const handleRemoveVideoUrl = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.video_urls || []).filter((_, i) => i !== index);
      return {
        ...prev,
        video_urls: updated,
        video_url: updated[0] || ''
      };
    });
  };


  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');

    try {
      const resolvedFacing = formData.facing === 'Other' ? customFacing.trim() || 'North' : formData.facing;
      const resolvedType = formData.type === 'Other' ? customType.trim() || 'Plot' : formData.type;
      const resolvedApproval = formData.approval_status === 'Other' ? customApproval.trim() || 'DTCP Approved' : formData.approval_status;
      const resolvedCategory = formData.category === 'Other' ? customCategory.trim() || 'Sale' : formData.category;

      const rawPlotNum = (formData.plot_number || '').trim();
      const cleanNum = rawPlotNum.replace(/^(?:plot\s*#*|#\s*)+/gi, '').trim();
      const canonicalPlotNumber = cleanNum ? `Plot ${cleanNum}` : (formData.title || 'Plot Entry');

      const vUrls = Array.isArray(formData.video_urls) ? formData.video_urls : [];
      const primaryVideo = formData.video_url || vUrls[0] || '';

      const payload: any = {
        ...formData,
        plot_number: canonicalPlotNumber,
        title: formData.title ? formData.title.trim() : '',
        facing: resolvedFacing,
        type: resolvedType,
        approval_status: resolvedApproval,
        category: resolvedCategory,
        video_urls: vUrls,
        video_url: primaryVideo,
        gallery_images: formData.gallery_images || [],
        primary_image_url: formData.primary_image_url || DEFAULT_PROPERTY_IMAGE,
        latitude: (formData.latitude && formData.latitude.trim() !== '') ? formData.latitude.trim() : (plotToEdit?.latitude || ''),
        longitude: (formData.longitude && formData.longitude.trim() !== '') ? formData.longitude.trim() : (plotToEdit?.longitude || '')
      };

      let result: any;
      if (plotToEdit && plotToEdit.id) {
        // EDIT MODE: Update existing plot ID directly
        result = await api.updatePlot(plotToEdit.id, payload);
      } else {
        // ADD MODE: Create new plot entry
        result = await api.createPlot(payload);
      }

      if (result && result.success) {
        if (onSaved) onSaved(result.data || payload);
        if (onSuccess) onSuccess(result.data || payload);
        onClose();
      } else {
        throw new Error(result?.message || 'Failed to save plot record');
      }
    } catch (err: any) {
      console.error('PlotFormModal save error:', err);
      setSaveError(err.message || 'Error occurred while saving plot. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  const isEditMode = Boolean(plotToEdit && plotToEdit.id);
  const selectedProject = projects.find((p) => p.id === formData.project_id);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950/80 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isEditMode ? 'Edit Plot Entry' : 'Add New Plot Entry'}</span>
                  {isEditMode ? (
                    <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      ID: {plotToEdit?.id}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      New Record
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {initialProjectName || selectedProject?.name
                    ? `Managing plots for project: ${initialProjectName || selectedProject?.name}`
                    : 'Manage plot details, dimensions, commercials, media, and location.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean 4-Tab Navigation */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto">
            {[
              { id: 'basic', label: '1. Basic & Project', icon: FileText },
              { id: 'dimensions', label: '2. Dimensions & Pricing', icon: Layers },
              { id: 'media', label: '3. Photos & Video', icon: ImageIcon },
              { id: 'location', label: '4. Location & Details', icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
            {saveError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {saveError}
              </div>
            )}

            {/* TAB 1: BASIC INFORMATION & PARENT PROJECT */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Plot Identification & Visibility</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
                        Plot Number / Designation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Plot 01, Plot A-102"
                        value={formData.plot_number || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, plot_number: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
                        Listing Title (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. East Facing Corner Plot"
                        value={formData.title || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
                        Listing Visibility
                      </label>
                      <select
                        value={formData.listing_visibility || 'Publish to Website & CRM'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, listing_visibility: e.target.value as any }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="Publish to Website & CRM">Publish to Website & CRM</option>
                        <option value="Private CRM Only">Private CRM Only</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Plot Type</label>
                      <select
                        value={formData.type || 'Residential Plot'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {PLOT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {formData.type === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom plot type..."
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          className="mt-2 w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Category</label>
                      <select
                        value={formData.category || 'Sale'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {formData.category === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom category..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="mt-2 w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Parent Project Association *</span>
                  </h3>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
                      Select Master Project
                    </label>
                    <select
                      required
                      value={formData.project_id || ''}
                      onChange={(e) => {
                        const newPid = e.target.value;
                        const proj = projects.find((p) => p.id === newPid);
                        setFormData((prev) => ({
                          ...prev,
                          project_id: newPid,
                          latitude: prev.latitude || proj?.latitude || '',
                          longitude: prev.longitude || proj?.longitude || ''
                        }));
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="" disabled>-- Select Project --</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name} ({proj.location_area || proj.location_city || 'Trichy'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Associates this plot with its parent layout workspace and links it on the public project page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIMENSIONS & COMMERCIAL PRICING */}
            {activeTab === 'dimensions' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Plot Dimensions & Sizing</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Length (Ft)</label>
                      <input
                        type="number"
                        placeholder="e.g. 40"
                        value={formData.length_ft || ''}
                        onChange={(e) => {
                          const l = Number(e.target.value);
                          setFormData((prev) => {
                            const w = Number(prev.width_ft) || 0;
                            const area = l && w ? l * w : prev.area_sqft;
                            const rate = Number(prev.price_per_sqft) || 0;
                            const lakhs = rate && area ? (area * rate) / 100000 : prev.total_price_lakhs;
                            return {
                              ...prev,
                              length_ft: l || ('' as any),
                              area_sqft: area || ('' as any),
                              dimension_str: l && w ? `${l} x ${w} Ft` : prev.dimension_str,
                              total_price_lakhs: lakhs ? Number(lakhs.toFixed(2)) : ('' as any),
                              price: lakhs ? lakhs * 100000 : ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Width (Ft)</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={formData.width_ft || ''}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          setFormData((prev) => {
                            const l = Number(prev.length_ft) || 0;
                            const area = l && w ? l * w : prev.area_sqft;
                            const rate = Number(prev.price_per_sqft) || 0;
                            const lakhs = rate && area ? (area * rate) / 100000 : prev.total_price_lakhs;
                            return {
                              ...prev,
                              width_ft: w || ('' as any),
                              area_sqft: area || ('' as any),
                              dimension_str: l && w ? `${l} x ${w} Ft` : prev.dimension_str,
                              total_price_lakhs: lakhs ? Number(lakhs.toFixed(2)) : ('' as any),
                              price: lakhs ? lakhs * 100000 : ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Dimension Display</label>
                      <input
                        type="text"
                        placeholder="e.g. 40 x 30 Ft"
                        value={formData.dimension_str || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dimension_str: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Total Area (Sq.Ft) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1200"
                        value={formData.area_sqft || ''}
                        onChange={(e) => {
                          const area = Number(e.target.value);
                          setFormData((prev) => {
                            const rate = Number(prev.price_per_sqft) || 0;
                            const lakhs = rate && area ? (area * rate) / 100000 : prev.total_price_lakhs;
                            return {
                              ...prev,
                              area_sqft: area || ('' as any),
                              total_price_lakhs: lakhs ? Number(lakhs.toFixed(2)) : ('' as any),
                              price: lakhs ? lakhs * 100000 : ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Facing Direction *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={formData.facing || 'North'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, facing: e.target.value as any }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {FACING_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt} Facing
                          </option>
                        ))}
                      </select>

                      {formData.facing === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom facing (e.g. North-East Corner)"
                          value={customFacing}
                          onChange={(e) => setCustomFacing(e.target.value)}
                          className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800/60 pb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Commercial Pricing & Status</span>
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      <span>CRM Confidential</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Rate / Sq.Ft (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={formData.price_per_sqft || ''}
                        onChange={(e) => {
                          const rate = Number(e.target.value);
                          setFormData((prev) => {
                            const area = Number(prev.area_sqft) || 0;
                            const price = rate && area ? rate * area : prev.price;
                            const lakhs = price ? price / 100000 : prev.total_price_lakhs;
                            return {
                              ...prev,
                              price_per_sqft: rate || ('' as any),
                              price: price || ('' as any),
                              total_price_lakhs: lakhs ? Number(lakhs.toFixed(2)) : ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Total Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1800000"
                        value={formData.price || ''}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          setFormData((prev) => {
                            const area = Number(prev.area_sqft) || 1;
                            const rate = price ? Math.round(price / area) : prev.price_per_sqft;
                            const lakhs = price ? price / 100000 : ('' as any);
                            return {
                              ...prev,
                              price: price || ('' as any),
                              price_per_sqft: rate || ('' as any),
                              total_price_lakhs: lakhs ? Number(lakhs.toFixed(2)) : ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Total Price (in Lakhs)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 18.00"
                        value={formData.total_price_lakhs || ''}
                        onChange={(e) => {
                          const lakhs = Number(e.target.value);
                          setFormData((prev) => {
                            const price = lakhs ? lakhs * 100000 : ('' as any);
                            const area = Number(prev.area_sqft) || 1;
                            const rate = price ? Math.round(price / area) : prev.price_per_sqft;
                            return {
                              ...prev,
                              total_price_lakhs: lakhs || ('' as any),
                              price,
                              price_per_sqft: rate || ('' as any)
                            };
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Approval Status</label>
                      <select
                        value={formData.approval_status || 'DTCP Approved'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, approval_status: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                      >
                        {APPROVAL_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {formData.approval_status === 'Other' && (
                        <input
                          type="text"
                          required
                          placeholder="Type custom approval (e.g. LPS Approved)"
                          value={customApproval}
                          onChange={(e) => setCustomApproval(e.target.value)}
                          className="mt-2 w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Plot Status *</label>
                      <select
                        value={formData.status || 'Available'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer font-bold"
                      >
                        <option value="Available">Available (Green)</option>
                        <option value="Booked">Booked (Amber)</option>
                        <option value="Sold">Sold (Rose)</option>
                        <option value="Blocked">Blocked / Reserved</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PHOTOS & VIDEO */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Plot Photos & Cover Image</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Upload plot pictures or select from the media repository.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Images'}</span>
                      </button>
                    </div>
                  </div>

                  {/* URL Paste */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Or paste external image URL..."
                      value={newImageInput}
                      onChange={(e) => setNewImageInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                    {formData.primary_image_url && (
                      <div className="relative group h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow">
                        <img
                          src={formData.primary_image_url}
                          alt="Primary Cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow">
                          COVER
                        </div>
                      </div>
                    )}

                    {(Array.isArray(formData.gallery_images) ? formData.gallery_images : []).map((imgUrl, idx) => {
                      if (imgUrl === formData.primary_image_url) return null;
                      return (
                        <div
                          key={idx}
                          className="relative group h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition"
                        >
                          <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgUrl)}
                              className="self-end p-1 rounded-md bg-rose-600 text-white hover:bg-rose-500 transition cursor-pointer"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(imgUrl)}
                              className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-1 rounded hover:bg-emerald-500 transition text-center cursor-pointer"
                            >
                              Set Cover
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Videos Section */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Plot Video Walkthrough</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Upload an MP4 walkthrough video directly from your device.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={videoFileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleDirectVideoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingVideo}
                        onClick={() => videoFileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadingVideo ? 'Uploading Video...' : (formData.video_url ? 'Replace Video File' : 'Upload Video File')}</span>
                      </button>
                    </div>
                  </div>

                  {formData.video_url ? (
                    <div className="space-y-2 pt-1">
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 aspect-video max-h-56 flex items-center justify-center">
                        {formData.video_url.includes('youtube.com') || formData.video_url.includes('youtu.be') ? (
                          <iframe
                            src={formData.video_url.replace('watch?v=', 'embed/')}
                            title="Plot Video"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video
                            src={formData.video_url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">{formData.video_url}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveVideoUrl(0)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Remove Video"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-center space-y-1">
                      <Video className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">No video attached yet for this plot.</p>
                      <p className="text-[10.5px] text-slate-400">Click &ldquo;Upload Video File&rdquo; above or paste a video link below.</p>
                    </div>
                  )}

                  {/* External Video / YouTube URL */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Or paste external video link (e.g. YouTube or MP4 URL)..."
                      value={newVideoInput}
                      onChange={(e) => setNewVideoInput(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddVideoUrl}
                      className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Set Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LOCATION & SPECIFICATIONS */}
            {activeTab === 'location' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location Address & Amenities</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Locality / Neighborhood</label>
                      <input
                        type="text"
                        placeholder="e.g. Gundur / Airport Road"
                        value={formData.locality || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, locality: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Road / Prime Corridor</label>
                      <input
                        type="text"
                        placeholder="e.g. Pudukkottai Main Road"
                        value={formData.road_corridor || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, road_corridor: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">District</label>
                      <input
                        type="text"
                        placeholder="e.g. Trichy"
                        value={formData.district || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">Amenities (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 40ft Tar Road, Street Lights, Avenue Trees, Sweet Water, Fenced"
                      value={formData.amenities || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amenities: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <GpsLocationPicker
                    latitude={formData.latitude || ''}
                    longitude={formData.longitude || ''}
                    onChange={(lat, lng) => setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
                    label="Plot GPS Coordinates (Directions Navigation)"
                    helpText="Public visitors clicking 'Directions' will open turn-by-turn navigation directly to these coordinates."
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-3">
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plot Description & Key Selling Features</span>
                  </h3>

                  <textarea
                    rows={4}
                    placeholder="Describe unique characteristics, sweet groundwater depth, frontage, corner advantages, etc."
                    value={formData.description || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sticky bottom-0 bg-white/95 dark:bg-slate-900/95 py-3 -mx-6 px-6 z-10">
              <div className="flex items-center gap-2">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'dimensions') setActiveTab('basic');
                      if (activeTab === 'media') setActiveTab('dimensions');
                      if (activeTab === 'location') setActiveTab('media');
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                )}

                {activeTab !== 'location' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'basic') setActiveTab('dimensions');
                      if (activeTab === 'dimensions') setActiveTab('media');
                      if (activeTab === 'media') setActiveTab('location');
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Plot...' : (isEditMode ? 'Update Plot' : 'Create Plot')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

    </>
  );
}
