'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, Plot, LandmarkItem } from '@/lib/types';
import PlotFormModal from '@/components/admin/PlotFormModal';
import MediaLibraryModal from '@/components/admin/MediaLibraryModal';
import GpsLocationPicker from '@/components/admin/GpsLocationPicker';
import {
  ArrowLeft,
  Building2,
  Grid,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  Upload,
  Video,
  FileText,
  Navigation,
  CheckCircle2,
  MapPin,
  Compass,
  DollarSign,
  Search,
  Image as ImageIcon,
  Save,
  AlertTriangle,
  Layers,
  Sparkles,
  X,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Play,
  Lock,
  FolderOpen
} from 'lucide-react';

interface Props {
  projectId: string;
}

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

export default function ProjectDetailManagementClient({ projectId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'plots';

  const [project, setProject] = useState<any>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'plots' | 'landmarks' | 'settings'>(initialTab);

  // Plot Filtering
  const [plotSearch, setPlotSearch] = useState('');
  const [plotStatusFilter, setPlotStatusFilter] = useState('All');

  // Plot Modal (Add / Edit)
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [plotSaving, setPlotSaving] = useState(false);

  // View Plot Modal state
  const [isViewPlotModalOpen, setIsViewPlotModalOpen] = useState(false);
  const [viewingPlot, setViewingPlot] = useState<Plot | null>(null);
  const [activeModalImageIdx, setActiveModalImageIdx] = useState(0);
  const [activeModalVideoIdx, setActiveModalVideoIdx] = useState(0);

  // Settings / Project Edit Form State
  const [projectFormData, setProjectFormData] = useState<any>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [newHighlightInput, setNewHighlightInput] = useState('');

  // Landmark draft
  const [newLandmark, setNewLandmark] = useState<LandmarkItem>({
    landmark: '',
    category: 'Worship',
    distance: '',
    time: '',
    map_url: ''
  });

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  async function loadProjectDetails() {
    setLoading(true);
    try {
      const res = await api.getProjectById(projectId);
      if (res?.data) {
        setProject(res.data);
        setPlots(res.data.plots || []);
        setProjectFormData({
          name: res.data.name || '',
          slug: res.data.slug || '',
          tagline: res.data.tagline || '',
          description: res.data.description || '',
          status: res.data.status || 'Ongoing',
          location_city: res.data.location_city || 'Trichy',
          location_area: res.data.location_area || '',
          total_extent_acres: res.data.total_extent_acres || 0,
          total_plots_count: res.data.total_plots_count || 0,
          available_plots_count: res.data.available_plots_count || 0,
          price_range: res.data.price_range || '',
          plot_size_range: res.data.plot_size_range || '',
          dtcp_number: res.data.dtcp_number || '',
          rera_number: res.data.rera_number || '',
          banner_image: res.data.banner_image || '',
          video_url: res.data.video_url || '',
          brochure_url: res.data.brochure_url || '',
          google_maps_embed_url: res.data.google_maps_embed_url || '',
          gallery_images: Array.isArray(res.data.gallery_images) ? res.data.gallery_images : [],
          highlights: Array.isArray(res.data.highlights) ? res.data.highlights : [],
          nearby_landmarks: Array.isArray(res.data.nearby_landmarks) ? res.data.nearby_landmarks : [],
          latitude: res.data.latitude || '',
          longitude: res.data.longitude || ''
        });
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddHighlight = () => {
    if (!newHighlightInput.trim()) return;
    setProjectFormData((prev: any) => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlightInput.trim()]
    }));
    setNewHighlightInput('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setProjectFormData((prev: any) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSaveProjectOverview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setProjectSaving(true);
    try {
      const payload = {
        ...projectFormData,
        slug: project.slug
      };
      const res = await api.updateProject(projectId, payload);
      if (res?.success) {
        setIsEditProjectModalOpen(false);
        await loadProjectDetails();
        alert('Project overview successfully updated!');
      } else {
        alert(res?.message || 'Failed to update project');
      }
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setProjectSaving(false);
    }
  };

  // Reload just plots for this project
  async function refreshPlots() {
    try {
      const res = await api.getProjectById(projectId);
      if (res?.data?.plots) {
        setPlots(res.data.plots);
      }
    } catch (err) {
      console.error('Failed to refresh plots:', err);
    }
  }

  // --- PLOT HANDLERS ---
  const handleOpenAddPlot = () => {
    setEditingPlot(null);
    setIsPlotModalOpen(true);
  };

  const handleOpenEditPlot = (plot: Plot) => {
    setEditingPlot(plot);
    setIsPlotModalOpen(true);
  };

  const handleOpenViewPlot = (plot: Plot) => {
    setViewingPlot(plot);
    setActiveModalImageIdx(0);
    setActiveModalVideoIdx(0);
    setIsViewPlotModalOpen(true);
  };

  const handleDeletePlot = async (plotId: string, plotNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${plotNumber}? This will remove it from this project's inventory.`)) return;
    try {
      await api.deletePlot(plotId);
      await refreshPlots();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plot');
    }
  };

  const handleQuickStatusChange = async (plotId: string, newStatus: string) => {
    try {
      await api.updatePlot(plotId, { status: newStatus });
      setPlots(prev => prev.map(p => p.id === plotId ? { ...p, status: newStatus as any } : p));
    } catch (err: any) {
      alert('Failed to update plot status: ' + err.message);
    }
  };

  // --- PROJECT SETTINGS & MEDIA SAVE ---
  const handleSaveProject = async () => {
    setProjectSaving(true);
    try {
      const res = await api.updateProject(projectId, projectFormData);
      if (res?.success) {
        alert('Project details successfully saved!');
        await loadProjectDetails();
      } else {
        alert(res?.message || 'Failed to update project');
      }
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'banner_image' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadMedia({ imageBase64: base64, filename: file.name });
        if (uploadRes?.success && uploadRes?.fileUrl) {
          if (field === 'banner_image') {
            setProjectFormData((prev: any) => ({ ...prev, banner_image: uploadRes.fileUrl }));
          } else {
            setProjectFormData((prev: any) => ({
              ...prev,
              gallery_images: [...(prev.gallery_images || []), uploadRes.fileUrl]
            }));
          }
        } else {
          alert('Upload failed: ' + (uploadRes?.message || 'Unknown error'));
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload error: ' + err.message);
      setUploadingImage(false);
    }
  };

  // Filtered plots for this project
  const filteredPlots = plots.filter(plot => {
    if (plotSearch.trim()) {
      const q = plotSearch.toLowerCase();
      const matchNum = plot.plot_number?.toLowerCase().includes(q);
      const matchFacing = plot.facing?.toLowerCase().includes(q);
      const matchDim = (plot.dimension || plot.dimension_str || '').toLowerCase().includes(q);
      if (!matchNum && !matchFacing && !matchDim) return false;
    }
    if (plotStatusFilter !== 'All') {
      if (plot.status !== plotStatusFilter) return false;
    }
    return true;
  });

  const availableCount = plots.filter(p => p.status === 'Available').length;
  const bookedCount = plots.filter(p => p.status === 'Booked' || p.status === 'Few Left').length;
  const soldCount = plots.filter(p => p.status === 'Sold' || p.status === 'Sold Out').length;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-[500px] flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Loading project and plot inventory from database...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-white">Project Not Found</h2>
        <p className="text-sm text-slate-400">The requested project ID does not exist in the database.</p>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Projects List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </button>

          <Link
            href={`/properties/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Project Workspace
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    project.status === 'Ongoing'
                      ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40'
                      : project.status === 'Sold Out'
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-500/40'
                      : 'bg-blue-900/80 text-blue-200 border border-blue-500/40'
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  ID: {project.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-slate-400 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{project.location_area}, {project.location_city}</span>
                <span className="text-slate-600">•</span>
                <span>{project.total_extent_acres || 0} Acres Extent</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl flex-wrap">
            <div className="px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Plots</div>
              <div className="text-lg font-bold text-white">{plots.length}</div>
            </div>
            <div className="px-3 border-r border-slate-800">
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">Available</div>
              <div className="text-lg font-bold text-emerald-400">{availableCount}</div>
            </div>
            <div className="px-3 border-r border-slate-800">
              <div className="text-[10px] text-amber-400 font-semibold uppercase">Booked</div>
              <div className="text-lg font-bold text-amber-400">{bookedCount}</div>
            </div>
            <div className="px-3">
              <div className="text-[10px] text-rose-400 font-semibold uppercase">Sold</div>
              <div className="text-lg font-bold text-rose-400">{soldCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto">
          {[
            { id: 'plots', label: 'Plot Inventory', icon: Grid, count: plots.length },
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'media', label: 'Project Media', icon: ImageIcon },
            { id: 'landmarks', label: 'Location Advantages', icon: Compass, count: projectFormData?.nearby_landmarks?.length },
            { id: 'settings', label: 'Project Settings', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PLOT INVENTORY */}
      {activeTab === 'plots' && (
        <div className="space-y-6">
          {/* Action Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plot number, facing, or dimension..."
                  value={plotSearch}
                  onChange={e => setPlotSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={plotStatusFilter}
                onChange={e => setPlotStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available Only</option>
                <option value="Booked">Booked Only</option>
                <option value="Sold">Sold Only</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddPlot}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plot to {project.name}</span>
            </button>
          </div>

          {/* Plots Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Plot Number</th>
                    <th className="py-3.5 px-4">Dimension</th>
                    <th className="py-3.5 px-4">Area (Sq.Ft)</th>
                    <th className="py-3.5 px-4">Facing</th>
                    <th className="py-3.5 px-4">Approval</th>
                    <th className="py-3.5 px-4">CRM Price (Confidential)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {filteredPlots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No plots found in {project.name} matching the criteria. Click &quot;Add Plot&quot; to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredPlots.map(plot => {
                      const priceVal = plot.price ? Number(plot.price) : (plot.total_price_lakhs ? Number(plot.total_price_lakhs) * 100000 : 0);
                      const priceLakhs = (priceVal / 100000).toFixed(2);

                      return (
                        <tr key={plot.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>{plot.plot_number}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {plot.dimension || plot.dimension_str || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-semibold">
                            {plot.area_sqft} Sq.Ft
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {plot.facing || 'North Facing'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                              {plot.approval_status || 'DTCP Approved'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-emerald-400 text-sm">
                              ₹ {priceLakhs} L
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ₹{plot.price_per_sqft || Math.round(priceVal / (plot.area_sqft || 1))}/sq.ft
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={plot.status}
                              onChange={e => handleQuickStatusChange(plot.id, e.target.value)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                plot.status === 'Available'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : plot.status === 'Booked'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                  : 'bg-rose-950/80 text-rose-300 border-rose-800'
                              }`}
                            >
                              <option value="Available">Available</option>
                              <option value="Booked">Booked</option>
                              <option value="Sold">Sold</option>
                              <option value="Few Left">Few Left</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenViewPlot(plot)}
                                className="p-1.5 text-slate-300 hover:text-emerald-400 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                                title="View Plot Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditPlot(plot)}
                                className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                                title="Edit Plot"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlot(plot.id, plot.plot_number)}
                                className="p-1.5 text-rose-400 hover:text-rose-200 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 transition cursor-pointer"
                                title="Delete Plot"
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
        </div>
      )}

      {/* TAB 2: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-base font-bold text-white">Project Overview & Specifications</h2>
              <p className="text-xs text-slate-400">View and update project tagline, narrative, infrastructure highlights, and legal compliance.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditProjectModalOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Project Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Project Tagline & Narrative</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditProjectModalOpen(true)}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-emerald-400 text-sm font-semibold">{project.tagline}</p>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {project.description || 'No description provided.'}
                </div>
              </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-white">Key Infrastructure Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(project.highlights || []).map((hl: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-white">Legal & Compliance</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 font-semibold text-[10px] uppercase">DTCP Approval</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">{project.dtcp_number || '100% DTCP Approved'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold text-[10px] uppercase">RERA Registration</div>
                  <div className="font-bold text-emerald-400 text-sm mt-0.5">{project.rera_number || 'TNRERA Approved Layout'}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold text-[10px] uppercase">Total Layout Area</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{project.total_extent_acres} Acres</div>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold text-[10px] uppercase">Total Capacity</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{project.total_plots_count} Plots Designed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB 3: MEDIA */}
      {activeTab === 'media' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span>Project Cover & Gallery Media</span>
              </h3>
              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Media Changes'}</span>
              </button>
            </div>

            {/* Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Cover Banner Image URL</label>
                <input
                  type="text"
                  value={projectFormData.banner_image}
                  onChange={e => setProjectFormData({ ...projectFormData, banner_image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-900/60 px-3 py-1.5 rounded-lg">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Cover Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'banner_image')} />
                  </label>
                  {uploadingImage && <span className="text-[11px] text-amber-400">Uploading...</span>}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">Cover Preview</span>
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={projectFormData.banner_image || '/project_park_avenue_new.jpg'}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Promotional Video */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span>Promotional Video (YouTube, Vimeo, or MP4)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-pink-300 hover:text-pink-200 bg-pink-950/80 border border-pink-700/60 px-3 py-1.5 rounded-xl transition"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Select from Video Library</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                value={projectFormData.video_url}
                onChange={e => setProjectFormData({ ...projectFormData, video_url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gallery Images */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Gallery Images Carousel ({projectFormData.gallery_images?.length || 0})
                </h4>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-900/60 px-3 py-1.5 rounded-lg">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo to Gallery</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(projectFormData.gallery_images || []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative group h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const next = projectFormData.gallery_images.filter((_: any, i: number) => i !== idx);
                        setProjectFormData({ ...projectFormData, gallery_images: next });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-900/90 hover:bg-rose-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOCATION ADVANTAGES */}
      {activeTab === 'landmarks' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span>Location Advantages & Strategic Connectivity</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Verified nearby places of worship, universities, transit hubs, and healthcare.
                </p>
              </div>

              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Hubs'}</span>
              </button>
            </div>

            {/* Repeater List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(projectFormData.nearby_landmarks || []).map((lm: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {lm.category || 'Transit'}
                      </span>
                      <span className="text-xs font-bold text-white">{lm.name || lm.landmark}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{lm.distance || 'Close proximity'}</span>
                      {lm.time && <span>• {lm.time}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const next = projectFormData.nearby_landmarks.filter((_: any, i: number) => i !== idx);
                      setProjectFormData({ ...projectFormData, nearby_landmarks: next });
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition cursor-pointer"
                    title="Remove landmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Hub Row */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Add Verified Landmark / Place of Worship</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Hub Name (e.g. Gundur Mathurakaliamman Temple)"
                  value={newLandmark.landmark}
                  onChange={e => setNewLandmark({ ...newLandmark, landmark: e.target.value })}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newLandmark.category}
                  onChange={e => setNewLandmark({ ...newLandmark, category: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Worship">Places of Worship</option>
                  <option value="Education">Education & Universities</option>
                  <option value="Transit">Transit & Highway</option>
                  <option value="Healthcare">Healthcare & Hospitals</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dist (e.g. 2 km)"
                    value={newLandmark.distance}
                    onChange={e => setNewLandmark({ ...newLandmark, distance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newLandmark.landmark.trim()) return;
                      setProjectFormData((prev: any) => ({
                        ...prev,
                        nearby_landmarks: [
                          ...(prev.nearby_landmarks || []),
                          {
                            name: newLandmark.landmark.trim(),
                            landmark: newLandmark.landmark.trim(),
                            category: newLandmark.category,
                            distance: newLandmark.distance || 'Short drive',
                            time: newLandmark.time || ''
                          }
                        ]
                      }));
                      setNewLandmark({ landmark: '', category: 'Worship', distance: '', time: '', map_url: '' });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Project Parameters & Publishing Controls</span>
              </h3>
              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Project Name</label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Publishing Status</label>
                <select
                  value={projectFormData.status}
                  onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1 cursor-pointer"
                >
                  <option value="Ongoing">Ongoing (Active Selling)</option>
                  <option value="Upcoming">Upcoming (Pre-Launch)</option>
                  <option value="Completed">Completed</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Draft">Draft (Internal Only)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Total Extent (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={projectFormData.total_extent_acres}
                  onChange={e => setProjectFormData({ ...projectFormData, total_extent_acres: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Location Area</label>
                <input
                  type="text"
                  value={projectFormData.location_area}
                  onChange={e => setProjectFormData({ ...projectFormData, location_area: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">City</label>
                <input
                  type="text"
                  value={projectFormData.location_city}
                  onChange={e => setProjectFormData({ ...projectFormData, location_city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">DTCP Registration Number</label>
                <input
                  type="text"
                  value={projectFormData.dtcp_number}
                  onChange={e => setProjectFormData({ ...projectFormData, dtcp_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">RERA Approval Number</label>
                <input
                  type="text"
                  value={projectFormData.rera_number}
                  onChange={e => setProjectFormData({ ...projectFormData, rera_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Google Maps Embed URL</label>
                <input
                  type="text"
                  value={projectFormData.google_maps_embed_url}
                  onChange={e => setProjectFormData({ ...projectFormData, google_maps_embed_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>
            </div>

            {/* GPS Map Coordinates for Driving Directions */}
            <div className="pt-2">
              <GpsLocationPicker
                latitude={projectFormData.latitude || ''}
                longitude={projectFormData.longitude || ''}
                onChange={(lat, lng) => setProjectFormData({ ...projectFormData, latitude: lat, longitude: lng })}
                label="Master Project GPS Coordinates"
                helpText="Public visitors clicking 'Get Driving Directions' on the project detail page will be routed directly to these coordinates."
              />
            </div>

            {/* Danger Zone */}
            <div className="border-t border-rose-950 pt-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-rose-400">Danger Zone: Delete Project</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deleting this project will permanently remove it and all {plots.length} linked plots from the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Are you absolutely sure you want to permanently delete "${project.name}" and all its plots? This cannot be undone.`)) return;
                    try {
                      await api.deleteProject(projectId);
                      router.push('/admin/projects');
                    } catch (err: any) {
                      alert('Delete failed: ' + err.message);
                    }
                  }}
                  className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CANONICAL SHARED PLOT FORM MODAL --- */}
      <PlotFormModal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        onSaved={() => {
          loadProjectDetails();
          setIsPlotModalOpen(false);
        }}
        plotToEdit={editingPlot}
        initialProjectId={project.id}
        initialProjectName={project.name}
        projectsList={[project]}
      />


      {/* --- PLOT DETAILS VIEW MODAL --- */}
      {isViewPlotModalOpen && viewingPlot && (() => {
        const modalImages = (() => {
          const list: string[] = [];
          if (viewingPlot.primary_image_url) list.push(viewingPlot.primary_image_url);
          if (Array.isArray(viewingPlot.gallery_images)) {
            viewingPlot.gallery_images.forEach((img) => {
              if (img && !list.includes(img)) list.push(img);
            });
          }
          return list.length > 0 ? list : ['/project_park_avenue_new.jpg'];
        })();

        const modalVideos = (() => {
          const list: string[] = [];
          if (Array.isArray(viewingPlot.video_urls)) {
            viewingPlot.video_urls.forEach((v) => {
              if (v && !list.includes(v)) list.push(v);
            });
          }
          if (viewingPlot.video_url && !list.includes(viewingPlot.video_url)) {
            list.push(viewingPlot.video_url);
          }
          return list;
        })();

        const priceVal = viewingPlot.price ? Number(viewingPlot.price) : (viewingPlot.total_price_lakhs ? Number(viewingPlot.total_price_lakhs) * 100000 : 0);
        const priceLakhs = (priceVal / 100000).toFixed(2);
        const dimensionStr = viewingPlot.dimension || viewingPlot.dimension_str || (viewingPlot.length_ft && viewingPlot.width_ft ? `${viewingPlot.length_ft} x ${viewingPlot.width_ft} Ft` : 'N/A');

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-6 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{viewingPlot.plot_number}</h3>
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
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Project: {project.name}
                  </p>
                </div>

                <button
                  onClick={() => setIsViewPlotModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Image Carousel */}
                <div className="space-y-2">
                  <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={modalImages[activeModalImageIdx] || '/project_park_avenue_new.jpg'}
                      alt={viewingPlot.plot_number}
                      className="w-full h-full object-cover"
                    />

                    {modalImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx((prev) => (prev > 0 ? prev - 1 : modalImages.length - 1))}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModalImageIdx((prev) => (prev < modalImages.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {activeModalImageIdx + 1} / {modalImages.length}
                    </div>
                  </div>

                  {modalImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {modalImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveModalImageIdx(idx)}
                          className={`relative h-12 w-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                            idx === activeModalImageIdx ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Player */}
                {modalVideos.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-pink-400" />
                        <span>Plot Video Tour ({modalVideos.length})</span>
                      </span>

                      {modalVideos.length > 1 && (
                        <div className="flex items-center gap-1">
                          {modalVideos.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveModalVideoIdx(idx)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                idx === activeModalVideoIdx ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Video {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
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

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Dimensions</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{dimensionStr}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Area</span>
                    <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{viewingPlot.area_sqft || 1200} Sq.Ft</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Facing</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{viewingPlot.facing || 'North'}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Approval</span>
                    <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{viewingPlot.approval_status || 'DTCP Approved'}</span>
                  </div>
                </div>

                {/* Confidential CRM Price Card */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-800/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CRM Pricing (Strictly Confidential)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Never exposed to public frontend</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-xl font-black text-white">
                        ₹ {priceLakhs} Lakhs
                      </div>
                      <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                        ₹ {priceVal.toLocaleString('en-IN')} INR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Rate per Sq.Ft</div>
                      <div className="text-sm font-bold text-white">
                        ₹ {viewingPlot.price_per_sqft || (viewingPlot.area_sqft ? Math.round(priceVal / viewingPlot.area_sqft) : 3000)} / sqft
                      </div>
                    </div>
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

                {viewingPlot.description && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Description / Remarks</span>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">{viewingPlot.description}</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 flex-shrink-0 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-medium">Quick Status:</span>
                  <select
                    value={viewingPlot.status}
                    onChange={async (e) => {
                      const newStat = e.target.value;
                      await handleQuickStatusChange(viewingPlot.id, newStat);
                      setViewingPlot(prev => prev ? { ...prev, status: newStat as any } : null);
                    }}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
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
                      setIsViewPlotModalOpen(false);
                      handleOpenEditPlot(viewingPlot);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Plot</span>
                  </button>
                  <button
                    onClick={() => setIsViewPlotModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs hover:from-emerald-500 hover:to-teal-400 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Media Library Modal for Project Videos */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        filterType="video"
        title="Select Promotional Video for Project"
        onSelect={(url) => {
          if (projectFormData) {
            setProjectFormData({ ...projectFormData, video_url: url });
          }
        }}
      />

      {/* EDIT PROJECT OVERVIEW & SPECIFICATIONS MODAL */}
      {isEditProjectModalOpen && projectFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Edit Project: {project.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {project.id} • Slug: {project.slug} (Preserved)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditProjectModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProjectOverview} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* 1. Basic Info */}
              <div className="space-y-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>1. Project Identity & Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1.5">Project Name *</label>
                    <input
                      type="text"
                      required
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Publish Status *</label>
                    <select
                      value={projectFormData.status || 'Ongoing'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Ongoing">Ongoing (Active Selling)</option>
                      <option value="Upcoming">Upcoming (Pre-Launch)</option>
                      <option value="Completed">Completed</option>
                      <option value="Sold Out">Sold Out</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Tagline / Catchphrase</label>
                  <input
                    type="text"
                    placeholder="e.g. Trichy's Most Coveted Gated Community on Airport Corridor"
                    value={projectFormData.tagline || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Project Narrative / Detailed Description</label>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive project narrative..."
                    value={projectFormData.description || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Infrastructure Highlights */}
              <div className="space-y-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>2. Infrastructure Highlights</span>
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 40ft & 33ft Wide Blacktop Tar Roads"
                    value={newHighlightInput}
                    onChange={(e) => setNewHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(projectFormData.highlights || []).map((hl: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300"
                    >
                      <span className="truncate mr-2 font-medium">{hl}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remove highlight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Legal, Approvals & Capacities */}
              <div className="space-y-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>3. Legal Approvals & Layout Capacity</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">DTCP Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DTCP / 148 / 2024"
                      value={projectFormData.dtcp_number || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, dtcp_number: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">RERA Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TN/19/Layout/0284/2024"
                      value={projectFormData.rera_number || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, rera_number: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Total Extent (Acres)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={projectFormData.total_extent_acres || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, total_extent_acres: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Total Plots Count</label>
                    <input
                      type="number"
                      value={projectFormData.total_plots_count || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, total_plots_count: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Available Plots Count</label>
                    <input
                      type="number"
                      value={projectFormData.available_plots_count || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, available_plots_count: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Plot Size Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 1200 - 2400 Sq.Ft"
                      value={projectFormData.plot_size_range || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, plot_size_range: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Price Range Display</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹ 18 - 36 Lakhs"
                      value={projectFormData.price_range || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, price_range: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Location & GPS Map Coordinates */}
              <div className="space-y-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>4. Location & Interactive Map Coordinates</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Locality / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Gundur / Airport Road"
                      value={projectFormData.location_area || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, location_area: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">City</label>
                    <input
                      type="text"
                      value={projectFormData.location_city || 'Trichy'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, location_city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <GpsLocationPicker
                  latitude={projectFormData.latitude || ''}
                  longitude={projectFormData.longitude || ''}
                  onChange={(lat, lng) => setProjectFormData({ ...projectFormData, latitude: lat, longitude: lng })}
                  label="Master Project GPS Coordinates"
                  helpText="Use Current Location or Select on Map with a draggable pin. This directs visitors using Google Maps."
                />
              </div>

              {/* 5. Project Media */}
              <div className="space-y-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>5. Project Cover & Walkthrough Video</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Cover Banner Image URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={projectFormData.banner_image || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, banner_image: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex-shrink-0">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'banner_image')}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Project Walkthrough Video URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                      value={projectFormData.video_url || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, video_url: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Save Bar */}
              <div className="sticky bottom-0 bg-slate-950/95 border-t border-slate-800 p-4 -mx-6 -mb-6 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsEditProjectModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{projectSaving ? 'Saving Changes...' : 'Save Project Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
