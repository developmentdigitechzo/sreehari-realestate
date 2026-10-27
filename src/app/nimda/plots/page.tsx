'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plot, Project } from '@/lib/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import PlotFormModal, { formatPlotNumber } from '@/components/admin/PlotFormModal';
import {
  Grid,
  List as ListIcon,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FolderKanban,
  MapPin,
  Globe,
  Navigation,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  X,
  Upload,
  Download,
  FileSpreadsheet,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  Compass,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

// Standard dropdown values
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

// Helper to identify video embed type
function getVideoEmbedInfo(url: string): { type: 'youtube' | 'direct' | 'unknown'; embedUrl: string } {
  if (!url || typeof url !== 'string') return { type: 'unknown', embedUrl: '' };
  const trimmed = url.trim();
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  if (trimmed.match(/\.(mp4|webm|ogg)($|\?)/i) || trimmed.startsWith('/uploads/')) {
    return { type: 'direct', embedUrl: trimmed };
  }
  return { type: 'direct', embedUrl: trimmed };
}

export default function AdminPlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPlotId, setDeletingPlotId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View mode: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);

  // View Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPlot, setViewingPlot] = useState<Plot | null>(null);
  const [activeModalImageIdx, setActiveModalImageIdx] = useState(0);
  const [activeModalVideoIdx, setActiveModalVideoIdx] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [visibilityFilter, setVisibilityFilter] = useState('All Visibility');
  const [maxPriceFilter, setMaxPriceFilter] = useState('Max price (All)');
  const [projectFilter, setProjectFilter] = useState('All Projects');

  // Form State
  const [formData, setFormData] = useState<Partial<Plot>>({
    project_id: '',
    title: '',
    slug: '',
    type: 'Residential Plot',
    category: 'Sale',
    locality: '',
    road_corridor: '',
    taluk: 'Central',
    district: 'Trichy',
    plot_number: '',
    length_ft: 40,
    width_ft: 30,
    area_sqft: 1200,
    facing: 'North',
    approval_status: 'DTCP Approved',
    price_per_sqft: 1500,
    total_price_lakhs: 18.0,
    price: 1800000,
    currency: 'INR',
    status: 'Available',
    listing_visibility: 'Publish to Website & CRM',
    amenities: 'Clear Patta Title, Tar Road, Street Lights, Fenced, Water Connection',
    description: '',
    meta_title: '',
    meta_description: '',
    video_url: '',
    video_urls: [],
    latitude: '10.786999',
    longitude: '79.137827',
    primary_image_url: DEFAULT_PROPERTY_IMAGE,
    gallery_images: []
  });

  // "Other" dropdown state
  const [customFacing, setCustomFacing] = useState('');
  const [customType, setCustomType] = useState('');
  const [customApproval, setCustomApproval] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Video URL manager draft input
  const [newVideoInput, setNewVideoInput] = useState('');
  const [newImageInput, setNewImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [plotsRes, projRes] = await Promise.all([
        api.getPlots(),
        api.getProjects().catch(() => null)
      ]);
      if (plotsRes?.data) setPlots(plotsRes.data);
      if (projRes?.data) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !formData.project_id) {
          setFormData((f) => ({ ...f, project_id: projRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load plots data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPlotsSilently() {
    try {
      const [plotsRes, projRes] = await Promise.all([
        api.getPlots(),
        api.getProjects().catch(() => null)
      ]);
      if (plotsRes?.data) setPlots(plotsRes.data);
      if (projRes?.data) setProjects(projRes.data);
    } catch (err) {
      console.error('Failed to silently refresh plots:', err);
    }
  }

  // Filter Logic
  const filteredPlots = plots.filter((plot) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = plot.plot_number?.toLowerCase().includes(q);
      const matchTitle = plot.title?.toLowerCase().includes(q);
      const matchLocality = plot.locality?.toLowerCase().includes(q);
      const matchType = plot.type?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchLocality && !matchType) return false;
    }

    if (categoryFilter !== 'All Categories') {
      if (plot.category !== categoryFilter) return false;
    }

    if (statusFilter !== 'All Statuses') {
      if (plot.status !== statusFilter) return false;
    }

    if (visibilityFilter !== 'All Visibility') {
      if (plot.listing_visibility !== visibilityFilter) return false;
    }

    if (maxPriceFilter !== 'Max price (All)') {
      const lakhs = plot.total_price_lakhs || (plot.price ? plot.price / 100000 : 0);
      if (maxPriceFilter === 'Under 25 Lakhs' && lakhs > 25) return false;
      if (maxPriceFilter === 'Under 50 Lakhs' && lakhs > 50) return false;
      if (maxPriceFilter === 'Under 1 Crore' && lakhs > 100) return false;
      if (maxPriceFilter === 'Above 1 Crore' && lakhs <= 100) return false;
    }

    if (projectFilter !== 'All Projects') {
      if (plot.project_id !== projectFilter) return false;
    }

    return true;
  });

  // Sequential Plot ID Generator
  const getNextSequentialPlotId = (currentPlots: Plot[]) => {
    let maxNum = 100;
    (currentPlots || []).forEach((p) => {
      if (p.id) {
        const match = p.id.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    return `plot-${maxNum + 1}`;
  };

  const generateSlugFromPlotNumber = (plotNumber: string, plotId: string) => {
    const cleanNo = (plotNumber || '').replace(/^(?:plot\s*#*|#\s*)+/gi, '').trim();
    if (cleanNo) {
      const sanitized = cleanNo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return `property-plot-${sanitized}`;
    }
    return `property-${plotId || 'plot-105'}`;
  };

  // Open Create Modal
  const handleOpenCreate = (targetProjectId?: string) => {
    setEditingPlot(null);
    if (targetProjectId) {
      setProjectFilter(targetProjectId);
    }
    setIsPlotModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plot: Plot) => {
    setEditingPlot(plot);
    setIsPlotModalOpen(true);
  };

  const handleOpenView = (plot: Plot) => {
    setViewingPlot(plot);
    setActiveModalImageIdx(0);
    setActiveModalVideoIdx(0);
    setIsViewModalOpen(true);
  };

  const handleQuickStatusChange = async (plotId: string, newStatus: string) => {
    try {
      await api.updatePlot(plotId, { status: newStatus });
      setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, status: newStatus as any } : p)));
      if (viewingPlot && viewingPlot.id === plotId) {
        setViewingPlot((prev) => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      setToastMessage('Failed to update status: ' + err.message);
    }
  };

  // CSV Handlers
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Plot Number',
      'Project ID',
      'Project Name',
      'Type',
      'Category',
      'Area Sq.Ft',
      'Facing',
      'Price (Lakhs)',
      'Status',
      'Visibility'
    ];
    const rows = plots.map((p) => {
      const proj = projects.find((pr) => pr.id === p.project_id);
      return [
        p.id,
        `"${p.title || ''}"`,
        `"${formatPlotNumber(p.plot_number, p.title, p.id)}"`,
        p.project_id,
        `"${p.project_name || (proj ? proj.name : '')}"`,
        p.type || 'Plot',
        p.category || 'Sale',
        p.area_sqft,
        p.facing,
        p.total_price_lakhs || (p.price ? p.price / 100000 : 18),
        p.status,
        `"${p.listing_visibility || 'Publish to Website & CRM'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sree_hari_properties_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSampleCSV = () => {
    const sampleText = `Plot Number,Title,Type,Category,Locality,Area Sq.Ft,Facing,Price Lakhs,Status
Plot 01,"Premium Plot in Medical College Road",Residential Plot,Sale,"Sundaram Nagar",1200,North,18.0,Available
Plot 02,"Corner Villa Plot in Park Avenue",Corner Villa Plot,Sale,"Thiruverumbur",1800,North-East,27.0,Available`;

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + sampleText);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_properties_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((f) => ({
            ...f,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          }));
          setToastMessage('GPS Location captured successfully');
        },
        (err) => {
          setToastMessage('Could not capture location: ' + err.message);
        }
      );
    } else {
      setToastMessage('Geolocation is not supported by your browser.');
    }
  };

  // Image Upload Handler via Backend endpoint
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              const res = await api.uploadMedia({ imageBase64: base64, filename: file.name });
              if (res?.fileUrl) {
                resolve(res.fileUrl);
              } else {
                reject(new Error(res?.message || 'Upload failed'));
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentGallery = Array.isArray(formData.gallery_images) ? [...formData.gallery_images] : [];
      const updatedGallery = [...currentGallery, ...uploadedUrls];

      // If primary image is empty or default, set the first uploaded image as primary
      let primary = formData.primary_image_url;
      if (!primary || primary === DEFAULT_PROPERTY_IMAGE) {
        primary = updatedGallery[0];
      }

      setFormData((prev) => ({
        ...prev,
        gallery_images: updatedGallery,
        primary_image_url: primary
      }));
    } catch (err: any) {
      setToastMessage('Image upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!newImageInput.trim()) return;
    const url = newImageInput.trim();
    const currentGallery = Array.isArray(formData.gallery_images) ? [...formData.gallery_images] : [];
    const updatedGallery = [...currentGallery, url];
    let primary = formData.primary_image_url;
    if (!primary || primary === DEFAULT_PROPERTY_IMAGE) {
      primary = url;
    }
    setFormData((prev) => ({
      ...prev,
      gallery_images: updatedGallery,
      primary_image_url: primary
    }));
    setNewImageInput('');
  };

  // Set image as primary cover
  const handleSetPrimaryImage = (imgUrl: string) => {
    setFormData((prev) => ({ ...prev, primary_image_url: imgUrl }));
  };

  // Remove image from gallery
  const handleRemoveImage = (imgUrl: string) => {
    const currentGallery = Array.isArray(formData.gallery_images) ? [...formData.gallery_images] : [];
    const updatedGallery = currentGallery.filter((img) => img !== imgUrl);
    let primary = formData.primary_image_url;
    if (primary === imgUrl) {
      primary = updatedGallery.length > 0 ? updatedGallery[0] : DEFAULT_PROPERTY_IMAGE;
    }
    setFormData((prev) => ({
      ...prev,
      gallery_images: updatedGallery,
      primary_image_url: primary
    }));
  };

  // Add Video URL
  const handleAddVideoUrl = () => {
    if (!newVideoInput.trim()) return;
    const url = newVideoInput.trim();
    const currentVideos = Array.isArray(formData.video_urls) ? [...formData.video_urls] : [];
    const updatedVideos = [...currentVideos, url];
    setFormData((prev) => ({
      ...prev,
      video_urls: updatedVideos,
      video_url: prev.video_url || url
    }));
    setNewVideoInput('');
  };

  // Remove Video URL
  const handleRemoveVideoUrl = (index: number) => {
    const currentVideos = Array.isArray(formData.video_urls) ? [...formData.video_urls] : [];
    currentVideos.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      video_urls: currentVideos,
      video_url: currentVideos.length > 0 ? currentVideos[0] : ''
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project_id) {
      setToastMessage('Please select a project for this plot');
      return;
    }
    if (!formData.plot_number?.trim()) {
      setToastMessage('Plot number is required');
      return;
    }
    if (!formData.area_sqft || Number(formData.area_sqft) <= 0) {
      setToastMessage('Valid area in Sq.Ft is required');
      return;
    }

    // Resolve "Other" custom values
    const resolvedFacing = formData.facing === 'Other' ? (customFacing.trim() || 'North') : (formData.facing || 'North');
    const resolvedType = formData.type === 'Other' ? (customType.trim() || 'Residential Plot') : (formData.type || 'Residential Plot');
    const resolvedApproval = formData.approval_status === 'Other' ? (customApproval.trim() || 'DTCP Approved') : (formData.approval_status || 'DTCP Approved');
    const resolvedCategory = formData.category === 'Other' ? (customCategory.trim() || 'Sale') : (formData.category || 'Sale');

    const cleanNum = (formData.plot_number || '').replace(/^(?:plot\s*#*|#\s*)+/gi, '').trim();
    const formattedPlotNum = cleanNum ? `Plot #${cleanNum}` : (formData.plot_number || 'Plot Entry');
    const finalTitle = formData.title ? formData.title.trim() : '';

    const videoUrls = Array.isArray(formData.video_urls) ? formData.video_urls : (formData.video_url ? [formData.video_url] : []);
    const primaryVideo = videoUrls.length > 0 ? videoUrls[0] : (formData.video_url || '');

    const resolvedDimension = formData.dimension_str || (formData.length_ft && formData.width_ft ? `${formData.length_ft} x ${formData.width_ft} Ft` : '');

    try {
      const payload = {
        ...formData,
        plot_number: formattedPlotNum,
        title: finalTitle,
        slug: formData.slug || generateSlugFromPlotNumber(cleanNum, formData.id || 'plot-105'),
        dimension_str: resolvedDimension,
        dimension: resolvedDimension,
        facing: resolvedFacing,
        type: resolvedType,
        approval_status: resolvedApproval,
        category: resolvedCategory,
        video_url: primaryVideo,
        video_urls: videoUrls,
        primary_image_url: formData.primary_image_url || DEFAULT_PROPERTY_IMAGE,
        gallery_images: Array.isArray(formData.gallery_images) ? formData.gallery_images : []
      };

      if (editingPlot) {
        await api.updatePlot(editingPlot.id, payload);
      } else {
        await api.createPlot(payload);
      }
      setViewMode('grid');
      loadData();
    } catch (err: any) {
      setToastMessage(err.message || 'Plot operation failed');
    }
  };

  const handleDelete = (id: string) => {
    setDeletingPlotId(id);
  };

  const confirmDeletePlot = async () => {
    if (!deletingPlotId) return;
    try {
      await api.deletePlot(deletingPlotId);
      loadData();
      setToastMessage('Plot entry deleted successfully');
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to delete plot');
    } finally {
      setDeletingPlotId(null);
    }
  };

  // Helper to get active gallery list for viewing modal
  const getModalImages = (plot: Plot): string[] => {
    const list: string[] = [];
    if (plot.primary_image_url) list.push(plot.primary_image_url);
    if (Array.isArray(plot.gallery_images)) {
      plot.gallery_images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [DEFAULT_PROPERTY_IMAGE];
  };

  // Helper to get active video list for viewing modal
  const getModalVideos = (plot: Plot): string[] => {
    const list: string[] = [];
    if (Array.isArray(plot.video_urls)) {
      plot.video_urls.forEach((v) => {
        if (v && !list.includes(v)) list.push(v);
      });
    }
    if (plot.video_url && !list.includes(plot.video_url)) {
      list.push(plot.video_url);
    }
    return list;
  };

  const selectedProjectObj = projects.find((p) => p.id === projectFilter);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* VIEW MODE 1 & 2: GRID / TABLE INVENTORY CATALOG */}
      {(viewMode === 'grid' || viewMode === 'table') && (
        <>
          {/* Header Action Bar */}
          <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="hidden">
                  <span className="hidden">Plots</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-emerald-400" />
                  <span>Plots</span>
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Browse, filter, and manage plot inventory across all projects.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  title="Export Plots as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleSampleCSV}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  title="Download Sample CSV Template"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sample CSV</span>
                </button>

                <button
                  onClick={() => handleOpenCreate()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Plot</span>
                </button>
              </div>
            </div>

            {/* Distinction Notice linking to Project-First workflow */}
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <FolderKanban className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Project-First Workflow:</strong> Plots are grouped under projects. To manage plots within a specific project workspace, visit the{' '}
                  <Link href="/nimda/projects" className="underline font-bold text-white hover:text-emerald-300">
                    Projects Module
                  </Link>.
                </span>
              </div>
              <Link
                href="/nimda/projects"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-white font-semibold flex-shrink-0"
              >
                <span>Go to Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* FILTERS SECTION */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plot #, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Project Filter */}
              <div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="All Projects">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Sold">Sold</option>
                  <option value="Few Left">Few Left</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Sale">Sale</option>
                  <option value="Resale">Resale</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>

              {/* Layout Toggle (Grid vs Table) */}
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400 font-medium">Layout:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Card Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/80 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                  title="Table List View"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* GRID CARD LAYOUT */}
          {viewMode === 'grid' && (
            <div>
              {loading ? (
                <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  Loading plots inventory...
                </div>
              ) : filteredPlots.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {projectFilter !== 'All Projects' && selectedProjectObj
                        ? `No plots found in ${selectedProjectObj.name}`
                        : 'No plots match the selected filters'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                      {projectFilter !== 'All Projects' && selectedProjectObj
                        ? `Get started by adding the first plot to ${selectedProjectObj.name}.`
                        : 'Try adjusting your search criteria or add a new plot.'}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleOpenCreate(projectFilter !== 'All Projects' ? projectFilter : undefined)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {projectFilter !== 'All Projects' && selectedProjectObj
                          ? `Add Plot to ${selectedProjectObj.name}`
                          : 'Add New Plot'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlots.map((plot) => {
                    const priceVal = plot.price ? Number(plot.price) : (Number(plot.total_price_lakhs) > 0 ? Number(plot.total_price_lakhs) * 100000 : 0);
                    const priceLakhs = priceVal > 0 ? (priceVal / 100000).toFixed(2) : (Number(plot.total_price_lakhs) > 0 ? Number(plot.total_price_lakhs).toFixed(2) : '18.00');
                    const displayImage = plot.primary_image_url || DEFAULT_PROPERTY_IMAGE;
                    const cleanPlotNum = formatPlotNumber(plot.plot_number, plot.title, plot.id);
                    const parentProject = projects.find((p) => p.id === plot.project_id);
                    const projectName = plot.project_name || parentProject?.name || 'Linked Project';
                    const dimensionStr = plot.dimension || plot.dimension_str || (plot.length_ft && plot.width_ft ? `${plot.length_ft} x ${plot.width_ft} Ft` : '');

                    return (
                      <div
                        key={plot.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group"
                      >
                        {/* 1. Plot Image Thumbnail with Status Badge */}
                        <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                          <img
                            src={displayImage}
                            alt={cleanPlotNum}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                          {/* Top-right Status Pill */}
                          <div className="absolute top-3 right-3 z-10">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow ${
                                plot.status === 'Available'
                                  ? 'bg-emerald-600 text-white'
                                  : plot.status === 'Booked'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {plot.status}
                            </span>
                          </div>

                          {/* Image count indicator if multiple images */}
                          {Array.isArray(plot.gallery_images) && plot.gallery_images.length > 0 && (
                            <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              <ImageIcon className="w-3 h-3 text-emerald-400" />
                              <span>{plot.gallery_images.length + 1} Photos</span>
                            </div>
                          )}

                          {/* Video indicator */}
                          {(plot.video_url || (Array.isArray(plot.video_urls) && plot.video_urls.length > 0)) && (
                            <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 bg-pink-950/80 border border-pink-700/60 text-pink-300 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
                              <Play className="w-2.5 h-2.5 fill-pink-400" />
                              <span>Video</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2.5">
                            {/* 2. Correct Plot Number & Type */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                  {cleanPlotNum}
                                </h3>
                                {plot.type && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {plot.type} • {plot.category || 'Sale'}
                                  </span>
                                )}
                              </div>
                              {plot.approval_status && (
                                <span className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                                  {plot.approval_status}
                                </span>
                              )}
                            </div>

                            {/* 3. Parent Project Name with Workspace Link */}
                            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg w-fit">
                              <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <Link
                                href={`/nimda/projects/${plot.project_id}?tab=plots`}
                                className="text-[11px] font-bold text-emerald-300 hover:text-white hover:underline flex items-center gap-1"
                                title="Open this project's dedicated plot workspace"
                              >
                                <span>Project: {projectName}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                              </Link>
                            </div>

                            {/* 4. Dimensions & Area */}
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <span className="font-semibold text-white">
                                {dimensionStr ? `${dimensionStr} • ` : ''}
                                {plot.area_sqft ? `${Number(plot.area_sqft).toLocaleString()} Sq.Ft` : 'Area N/A'}
                              </span>
                            </div>

                            {/* 5. Facing & Location */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Compass className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span>{plot.facing || 'North'} Facing</span>
                              {(plot.locality || plot.district) && (
                                <span>• {[plot.locality, plot.district].filter(Boolean).join(', ')}</span>
                              )}
                            </div>

                            {/* 7. Price and Rate (CRM Confidential) */}
                            <div className="pt-2 border-t border-slate-800">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>CRM Price</span>
                                  </div>
                                  <div className="text-base font-black text-emerald-400">
                                    ₹ {priceLakhs} Lakhs
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] text-slate-500">Rate / Sq.Ft</div>
                                  <div className="text-xs font-bold text-slate-300">
                                    ₹ {plot.price_per_sqft || (plot.area_sqft && plot.price ? Math.round(Number(plot.price) / Number(plot.area_sqft)) : 1500)} / sqft
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 8. Bottom Actions Bar */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                            {/* Quick Status Select */}
                            <select
                              value={plot.status}
                              onChange={(e) => handleQuickStatusChange(plot.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                            >
                              <option value="Available">Available</option>
                              <option value="Few Left">Few Left</option>
                              <option value="Booked">Booked</option>
                              <option value="Sold">Sold</option>
                            </select>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenView(plot)}
                                title="View Plot Details"
                                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(plot)}
                                title="Edit Plot"
                                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(plot.id)}
                                title="Delete Plot"
                                className="p-2 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABLE LIST VIEW OPTION */}
          {viewMode === 'table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Plot Number / Title</th>
                      <th className="px-6 py-4">Parent Project</th>
                      <th className="px-6 py-4">Dimensions & Area</th>
                      <th className="px-6 py-4">Facing & Approval</th>
                      <th className="px-6 py-4">CRM Price & Rate</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          Loading plots inventory...
                        </td>
                      </tr>
                    ) : filteredPlots.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          No plot records found matching the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPlots.map((plot) => {
                        const cleanPlotNum = formatPlotNumber(plot.plot_number, plot.title, plot.id);
                        const parentProject = projects.find((p) => p.id === plot.project_id);
                        const projectName = plot.project_name || parentProject?.name || 'Linked Project';
                        const priceVal = plot.price ? Number(plot.price) : (Number(plot.total_price_lakhs) > 0 ? Number(plot.total_price_lakhs) * 100000 : 0);
                    const priceLakhs = priceVal > 0 ? (priceVal / 100000).toFixed(2) : (Number(plot.total_price_lakhs) > 0 ? Number(plot.total_price_lakhs).toFixed(2) : '18.00');
                        const dimensionStr = plot.dimension || plot.dimension_str || (plot.length_ft && plot.width_ft ? `${plot.length_ft} x ${plot.width_ft} Ft` : 'N/A');

                        return (
                          <tr key={plot.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-extrabold text-white text-sm">
                                {cleanPlotNum}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {plot.type || 'Plot'} {plot.locality ? `• ${plot.locality}` : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/nimda/projects/${plot.project_id}?tab=plots`}
                                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                              >
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{projectName}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div className="font-semibold">{dimensionStr}</div>
                              <div className="text-[11px] text-slate-400">{plot.area_sqft || 1200} Sq.Ft</div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                              <div className="font-medium">{plot.facing || 'North'} Facing</div>
                              <div className="text-[10px] text-emerald-400">{plot.approval_status || 'DTCP Approved'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-emerald-400 font-extrabold text-sm">
                                ₹ {priceLakhs} Lakhs
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ₹ {plot.price_per_sqft || 1500} / sqft
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={plot.status}
                                onChange={(e) => handleQuickStatusChange(plot.id, e.target.value)}
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                  plot.status === 'Available'
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                    : plot.status === 'Booked'
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-rose-950 text-rose-300 border-rose-800'
                                }`}
                              >
                                <option value="Available">Available</option>
                                <option value="Few Left">Few Left</option>
                                <option value="Booked">Booked</option>
                                <option value="Sold">Sold</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenView(plot)}
                                  title="View Details"
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(plot)}
                                  title="Edit Plot"
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(plot.id)}
                                  title="Delete Plot"
                                  className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 transition border border-rose-800/40 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}


      {/* CANONICAL SHARED PLOT FORM MODAL */}
      <PlotFormModal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        onSaved={(savedPlot?: Plot) => {
          if (editingPlot && editingPlot.id) {
            setPlots((prev) => prev.map((p) => (p.id === editingPlot.id ? { ...p, ...(savedPlot || {}) } : p)));
            setToastMessage('Plot updated successfully');
          } else if (savedPlot) {
            setPlots((prev) => [savedPlot, ...prev]);
            setToastMessage('New plot created successfully');
          }
          setIsPlotModalOpen(false);
          refreshPlotsSilently();
        }}
        plotToEdit={editingPlot}
        projectsList={projects}
        initialProjectId={projectFilter !== 'All Projects' ? projectFilter : undefined}
      />

      {/* PLOT DETAILS VIEW MODAL */}
      {isViewModalOpen && viewingPlot && (() => {
        const modalImages = getModalImages(viewingPlot);
        const modalVideos = getModalVideos(viewingPlot);
        const cleanPlotNum = formatPlotNumber(viewingPlot.plot_number, viewingPlot.title, viewingPlot.id);
        const parentProject = projects.find((p) => p.id === viewingPlot.project_id);
        const projectName = viewingPlot.project_name || parentProject?.name || 'Linked Project';
        const priceVal = viewingPlot.price ? Number(viewingPlot.price) : (Number(viewingPlot.total_price_lakhs) > 0 ? Number(viewingPlot.total_price_lakhs) * 100000 : 0);
        const priceLakhs = priceVal > 0 ? (priceVal / 100000).toFixed(2) : (Number(viewingPlot.total_price_lakhs) > 0 ? Number(viewingPlot.total_price_lakhs).toFixed(2) : '18.00');
        const dimensionStr = viewingPlot.dimension || viewingPlot.dimension_str || (viewingPlot.length_ft && viewingPlot.width_ft ? `${viewingPlot.length_ft} x ${viewingPlot.width_ft} Ft` : 'N/A');

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl my-6 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0 bg-white dark:bg-slate-950/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{cleanPlotNum}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${
                        viewingPlot.status === 'Available'
                          ? 'bg-emerald-600 text-white'
                          : viewingPlot.status === 'Booked'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {viewingPlot.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <Link
                      href={`/nimda/projects/${viewingPlot.project_id}?tab=plots`}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      <span>Project: {projectName}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>

                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
                {/* 1. Gallery Carousel */}
                <div className="space-y-2">
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={modalImages[activeModalImageIdx] || DEFAULT_PROPERTY_IMAGE}
                      alt={cleanPlotNum}
                      className="w-full h-full object-cover"
                    />

                    {/* Prev / Next Buttons */}
                    {modalImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx((prev) => (prev > 0 ? prev - 1 : modalImages.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
                          title="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx((prev) => (prev < modalImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
                          title="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Photo Counter */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                      {activeModalImageIdx + 1} / {modalImages.length}
                    </div>

                    {/* Cover Badge */}
                    {activeModalImageIdx === 0 && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                        PRIMARY COVER
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {modalImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {modalImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveModalImageIdx(idx)}
                          className={`relative h-14 w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                            idx === activeModalImageIdx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Video Player (YouTube or HTML5) */}
                {modalVideos.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-pink-400" />
                        <span>Plot Video Tour ({modalVideos.length})</span>
                      </span>

                      {/* Video Switcher Tabs if multiple */}
                      {modalVideos.length > 1 && (
                        <div className="flex items-center gap-1">
                          {modalVideos.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveModalVideoIdx(idx)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                                idx === activeModalVideoIdx ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Video {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      {(() => {
                        const curVideo = modalVideos[activeModalVideoIdx] || modalVideos[0];
                        const embedInfo = getVideoEmbedInfo(curVideo);

                        if (embedInfo.type === 'youtube') {
                          return (
                            <iframe
                              src={embedInfo.embedUrl}
                              title="YouTube video player"
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          );
                        }

                        return (
                          <video
                            src={embedInfo.embedUrl}
                            controls
                            className="w-full h-full object-contain bg-black"
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 3. Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Dimensions</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{dimensionStr}</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Total Area</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{viewingPlot.area_sqft || 1200} Sq.Ft</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Facing Direction</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{viewingPlot.facing || 'North'} Facing</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Approval Status</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{viewingPlot.approval_status || 'DTCP Approved'}</span>
                  </div>
                </div>

                {/* 4. Confidential CRM Pricing Card */}
                <div className="p-4 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CRM Pricing & Commercials (Strictly Confidential)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Never exposed to public frontend</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹ {priceLakhs} Lakhs
                      </div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                        ₹ {Number(priceVal || (Number(priceLakhs) * 100000)).toLocaleString('en-IN')} INR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Rate per Sq.Ft</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        ₹ {viewingPlot.price_per_sqft || (viewingPlot.area_sqft ? Math.round(Number(viewingPlot.price || 1800000) / Number(viewingPlot.area_sqft)) : 1500)} / sqft
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Locality, Corridor & Amenities */}
                <div className="space-y-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Locality & Road Corridor</span>
                      <div className="text-slate-200">
                        {[viewingPlot.locality, viewingPlot.road_corridor, viewingPlot.district].filter(Boolean).join(' • ') || 'Trichy Layout'}
                      </div>
                    </div>

                    {(viewingPlot.latitude && viewingPlot.longitude) && (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-slate-400 font-semibold block mb-0.5 text-[11px]">GPS Map Coordinates</span>
                          <div className="text-emerald-400 font-mono text-xs">{viewingPlot.latitude}, {viewingPlot.longitude}</div>
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${viewingPlot.latitude},${viewingPlot.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps Directions</span>
                        </a>
                      </div>
                    )}

                    {viewingPlot.amenities && (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Plot Amenities & Features</span>
                        <div className="text-slate-200">{viewingPlot.amenities}</div>
                      </div>
                    )}

                  {viewingPlot.description && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Description / Remarks</span>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-line">{viewingPlot.description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer with Actions */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0 bg-slate-50 dark:bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Quick Status:</span>
                  <select
                    value={viewingPlot.status}
                    onChange={(e) => handleQuickStatusChange(viewingPlot.id, e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Few Left">Few Left</option>
                    <option value="Booked">Booked</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenEdit(viewingPlot);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Edit Plot</span>
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
          {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Styled Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPlotId)}
        title="Delete Property Plot?"
        description="This action will permanently delete this plot entry from inventory and website."
        confirmLabel="Delete Plot"
        onConfirm={confirmDeletePlot}
        onCancel={() => setDeletingPlotId(null)}
      />
    </div>
  );
}