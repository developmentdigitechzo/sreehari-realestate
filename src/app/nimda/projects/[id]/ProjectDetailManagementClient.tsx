'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, Plot, LandmarkItem } from '@/lib/types';
import PlotFormModal from '@/components/admin/PlotFormModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
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
  FolderOpen,
  Droplets,
  Milestone,
  Trees,
  Sun,
  Fence,
  Zap,
  Award,
  RefreshCw,
  Check
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

export interface AmenityItem {
  icon?: string;
  title: string;
  desc?: string;
}

const AMENITY_PRESETS: AmenityItem[] = [
  {
    icon: 'Droplets',
    title: 'Sweet Potable Water',
    desc: 'Sweet groundwater available throughout all seasons at shallow depth with pipe provision.'
  },
  {
    icon: 'Milestone',
    title: 'Wide Blacktop Tar Roads',
    desc: 'Engineered heavy-duty asphalt roads designed for seamless two-way vehicular flow.'
  },
  {
    icon: 'Fence',
    title: 'Protective Boundary Walls',
    desc: 'Sturdy perimeter fencing and concrete boundary posts securing every individual plot.'
  },
  {
    icon: 'Award',
    title: 'Bank Loan Eligible',
    desc: 'Clear legal title certificates accepted by HDFC, SBI, PNB and all nationalized banks.'
  },
  {
    icon: 'Sun',
    title: 'Electricity & Streetlights',
    desc: 'High-voltage electric lines and bright LED streetlighting across all layout avenues.'
  },
  {
    icon: 'Trees',
    title: "Landscaped Children's Park",
    desc: 'Dedicated open space reserve with children play equipment and green avenue plantations.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Grand Entrance & 24/7 Security',
    desc: 'Monumental arch entrance with manned security, CCTV provision, and gated boundary.'
  },
  {
    icon: 'Zap',
    title: 'Instant Spot Patta',
    desc: '100% clear parent title deeds with DTCP & TNRERA compliance and fast spot registration.'
  }
];

function renderAmenityIcon(iconName?: string) {
  switch (iconName) {
    case 'Droplets': return <Droplets className="w-5 h-5 text-sky-500" />;
    case 'Milestone': return <Milestone className="w-5 h-5 text-amber-500" />;
    case 'Fence': return <Fence className="w-5 h-5 text-emerald-500" />;
    case 'Award': return <Award className="w-5 h-5 text-purple-500" />;
    case 'Sun': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'Trees': return <Trees className="w-5 h-5 text-green-500" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
    case 'Zap': return <Zap className="w-5 h-5 text-rose-500" />;
    default: return <Sparkles className="w-5 h-5 text-emerald-500" />;
  }
}

export default function ProjectDetailManagementClient({ projectId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'error' | 'warning' } | null>(null);
  const [deletingPlotInfo, setDeletingPlotInfo] = useState<{ id: string; plotNumber: string } | null>(null);
  const [isDeletingProjectModalOpen, setIsDeletingProjectModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4000);
  };
  const initialTab = (searchParams.get('tab') as any) || 'plots';

  const [project, setProject] = useState<any>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plots' | 'amenities' | 'media' | 'landmarks' | 'settings'>(initialTab);

  // Plot Filtering
  const [plotSearch, setPlotSearch] = useState('');
  const [plotStatusFilter, setPlotStatusFilter] = useState('All');

  // Plot Modal (Add / Edit)
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
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
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState<'basic' | 'content' | 'amenities' | 'media' | 'landmarks'>('basic');
  const [newHighlightInput, setNewHighlightInput] = useState('');

  // Landmark draft for in-page Tab 4
  const [newLandmark, setNewLandmark] = useState<LandmarkItem>({
    landmark: '',
    category: 'Worship',
    distance: '',
    time: '',
    map_url: ''
  });
  const [customCategory, setCustomCategory] = useState('');

  // Landmark draft for Edit Project Modal Tab 4
  const [modalLandmark, setModalLandmark] = useState<LandmarkItem>({
    landmark: '',
    category: 'Worship',
    distance: '',
    time: '',
    map_url: ''
  });
  const [modalCustomCategory, setModalCustomCategory] = useState('');

  // Amenity draft for in-page Tab
  const [newAmenity, setNewAmenity] = useState<AmenityItem>({
    icon: 'Droplets',
    title: '',
    desc: ''
  });
  const [editingAmenityIndex, setEditingAmenityIndex] = useState<number | null>(null);

  // Amenity draft for Edit Project Modal
  const [modalAmenity, setModalAmenity] = useState<AmenityItem>({
    icon: 'Droplets',
    title: '',
    desc: ''
  });
  const [modalEditingAmenityIndex, setModalEditingAmenityIndex] = useState<number | null>(null);

  // Landmark editing index
  const [editingLandmarkIndex, setEditingLandmarkIndex] = useState<number | null>(null);
  const [modalEditingLandmarkIndex, setModalEditingLandmarkIndex] = useState<number | null>(null);

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
        let rawAmenities = res.data.amenities;
        if (typeof rawAmenities === 'string') {
          try {
            rawAmenities = JSON.parse(rawAmenities);
          } catch {}
        }
        setProjectFormData({
          name: res.data.name || '',
          slug: res.data.slug || '',
          meta_title: res.data.meta_title || '',
          meta_description: res.data.meta_description || '',
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
          amenities: Array.isArray(rawAmenities) ? rawAmenities : [],
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
        slug: projectFormData.slug || project.slug,
        meta_title: projectFormData.meta_title,
        meta_description: projectFormData.meta_description
      };
      const res = await api.updateProject(projectId, payload);
      if (res?.success) {
        setIsEditProjectModalOpen(false);
        await loadProjectDetails();
        showToast('Project overview successfully updated!');
      } else {
        showToast(res?.message || 'Failed to update project', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleOpenEditProjectModal = () => {
    setEditModalTab('basic');
    setIsEditProjectModalOpen(true);
  };

  // --- IN-PAGE AMENITIES HANDLERS ---
  const handleSaveAmenity = () => {
    if (!newAmenity.title.trim()) return;
    if (editingAmenityIndex !== null) {
      setProjectFormData((prev: any) => {
        const next = [...(prev.amenities || [])];
        next[editingAmenityIndex] = { ...newAmenity };
        return { ...prev, amenities: next };
      });
      setEditingAmenityIndex(null);
    } else {
      setProjectFormData((prev: any) => ({
        ...prev,
        amenities: [...(prev.amenities || []), { ...newAmenity }]
      }));
    }
    setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
  };

  const handleEditAmenity = (index: number) => {
    const item = projectFormData?.amenities?.[index];
    if (item) {
      setNewAmenity({ ...item });
      setEditingAmenityIndex(index);
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setProjectFormData((prev: any) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_: any, i: number) => i !== index)
    }));
    if (editingAmenityIndex === index) {
      setEditingAmenityIndex(null);
      setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
    }
  };

  const handleAddPresetAmenity = (preset: AmenityItem) => {
    const current = projectFormData?.amenities || [];
    if (current.some((a: any) => (a.title || '').toLowerCase() === preset.title.toLowerCase())) {
      showToast(`"${preset.title}" is already added.`, 'warning');
      return;
    }
    setProjectFormData((prev: any) => ({
      ...prev,
      amenities: [...(prev.amenities || []), { ...preset }]
    }));
  };

  // --- MODAL AMENITIES HANDLERS ---
  const handleSaveModalAmenity = () => {
    if (!modalAmenity.title.trim()) return;
    if (modalEditingAmenityIndex !== null) {
      setProjectFormData((prev: any) => {
        const next = [...(prev.amenities || [])];
        next[modalEditingAmenityIndex] = { ...modalAmenity };
        return { ...prev, amenities: next };
      });
      setModalEditingAmenityIndex(null);
    } else {
      setProjectFormData((prev: any) => ({
        ...prev,
        amenities: [...(prev.amenities || []), { ...modalAmenity }]
      }));
    }
    setModalAmenity({ icon: 'Droplets', title: '', desc: '' });
  };

  const handleEditModalAmenity = (index: number) => {
    const item = projectFormData?.amenities?.[index];
    if (item) {
      setModalAmenity({ ...item });
      setModalEditingAmenityIndex(index);
    }
  };

  const handleRemoveModalAmenity = (index: number) => {
    setProjectFormData((prev: any) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_: any, i: number) => i !== index)
    }));
    if (modalEditingAmenityIndex === index) {
      setModalEditingAmenityIndex(null);
      setModalAmenity({ icon: 'Droplets', title: '', desc: '' });
    }
  };

  // --- LANDMARK EDIT HANDLERS ---
  const handleEditLandmark = (idx: number) => {
    const item = projectFormData?.nearby_landmarks?.[idx];
    if (item) {
      setNewLandmark({
        landmark: item.landmark || item.name || '',
        category: item.category || 'Transit',
        distance: item.distance || '',
        time: item.time || '',
        map_url: item.map_url || ''
      });
      setEditingLandmarkIndex(idx);
    }
  };

  const handleEditModalLandmark = (idx: number) => {
    const item = projectFormData?.nearby_landmarks?.[idx];
    if (item) {
      setModalLandmark({
        landmark: item.landmark || item.name || '',
        category: item.category || 'Transit',
        distance: item.distance || '',
        time: item.time || '',
        map_url: item.map_url || ''
      });
      setModalEditingLandmarkIndex(idx);
    }
  };

  const handleAddModalLandmark = () => {
    if (!modalLandmark.landmark.trim()) return;
    const resolvedCat = modalLandmark.category === 'Other' ? (modalCustomCategory.trim() || 'Other') : modalLandmark.category;
    const itemToAdd = {
      ...modalLandmark,
      category: resolvedCat,
      landmark: modalLandmark.landmark.trim()
    };
    if (modalEditingLandmarkIndex !== null) {
      setProjectFormData((prev: any) => {
        const next = [...(prev.nearby_landmarks || [])];
        next[modalEditingLandmarkIndex] = itemToAdd;
        return { ...prev, nearby_landmarks: next };
      });
      setModalEditingLandmarkIndex(null);
    } else {
      setProjectFormData((prev: any) => ({
        ...prev,
        nearby_landmarks: [...(prev.nearby_landmarks || []), itemToAdd]
      }));
    }
    setModalLandmark({
      landmark: '',
      category: 'Worship',
      distance: '',
      time: '',
      map_url: ''
    });
    setModalCustomCategory('');
  };

  const handleRemoveModalLandmark = (idx: number) => {
    setProjectFormData((prev: any) => ({
      ...prev,
      nearby_landmarks: (prev.nearby_landmarks || []).filter((_: any, i: number) => i !== idx)
    }));
    if (modalEditingLandmarkIndex === idx) {
      setModalEditingLandmarkIndex(null);
      setModalLandmark({ landmark: '', category: 'Worship', distance: '', time: '', map_url: '' });
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

  const handleDeletePlot = (plotId: string, plotNumber: string) => {
    setDeletingPlotInfo({ id: plotId, plotNumber });
  };

  const confirmDeletePlot = async () => {
    if (!deletingPlotInfo) return;
    try {
      await api.deletePlot(deletingPlotInfo.id);
      await refreshPlots();
      showToast(`Plot ${deletingPlotInfo.plotNumber} deleted successfully`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete plot', 'error');
    } finally {
      setDeletingPlotInfo(null);
    }
  };

  const confirmDeleteProjectPermanent = async () => {
    try {
      await api.deleteProject(projectId);
      router.push('/nimda/projects');
    } catch (err: any) {
      showToast('Delete failed: ' + err.message, 'error');
    } finally {
      setIsDeletingProjectModalOpen(false);
    }
  };

  const handleQuickStatusChange = async (plotId: string, newStatus: string) => {
    try {
      await api.updatePlot(plotId, { status: newStatus });
      setPlots(prev => prev.map(p => p.id === plotId ? { ...p, status: newStatus as any } : p));
    } catch (err: any) {
      showToast('Failed to update plot status: ' + err.message, 'error');
    }
  };

  // --- PROJECT SETTINGS & MEDIA SAVE ---
  const handleSaveProject = async () => {
    setProjectSaving(true);
    try {
      const res = await api.updateProject(projectId, projectFormData);
      if (res?.success) {
        showToast('Project details successfully saved!');
        if (res?.data) setProject((prev: any) => ({ ...prev, ...res.data }));
        await loadProjectDetails();
      } else {
        showToast(res?.message || 'Failed to update project', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
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
          showToast('Upload failed: ' + (uploadRes?.message || 'Unknown error'), 'error');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Upload error: ' + err.message, 'error');
      setUploadingImage(false);
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrochure(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadMedia({ imageBase64: base64, filename: file.name });
        if (uploadRes?.success && uploadRes?.fileUrl) {
          setProjectFormData((prev: any) => ({ ...prev, brochure_url: uploadRes.fileUrl }));
        } else {
          showToast('Upload failed: ' + (uploadRes?.message || 'Unknown error'), 'error');
        }
        setUploadingBrochure(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Upload error: ' + err.message, 'error');
      setUploadingBrochure(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadRes = await api.uploadMedia({ imageBase64: base64, filename: file.name });
        if (uploadRes?.success && uploadRes?.fileUrl) {
          setProjectFormData((prev: any) => ({ ...prev, video_url: uploadRes.fileUrl }));
        } else {
          showToast('Upload failed: ' + (uploadRes?.message || 'Unknown error'), 'error');
        }
        setUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Upload error: ' + err.message, 'error');
      setUploadingVideo(false);
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenEditProjectModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </button>

          <Link
            href={`/properties/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>View Public Page</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Project Workspace
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    project.status === 'Ongoing'
                      ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/40'
                      : project.status === 'Sold Out'
                      ? 'bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-500/40'
                      : 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-500/40'
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  ID: {project.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{project.location_area}, {project.location_city}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span>{project.total_extent_acres || 0} Acres Extent</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl flex-wrap">
            <div className="px-3 border-r border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Plots</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{plots.length}</div>
            </div>
            <div className="px-3 border-r border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Available</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{availableCount}</div>
            </div>
            <div className="px-3 border-r border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Booked</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{bookedCount}</div>
            </div>
            <div className="px-3">
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">Sold</div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{soldCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 overflow-x-auto">
          {[
            { id: 'plots', label: 'Plot Inventory', icon: Grid, count: plots.length },
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'amenities', label: 'Amenities & Standards', icon: Sparkles, count: projectFormData?.amenities?.length || 0 },
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
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search plot number, facing, or dimension..."
                  value={plotSearch}
                  onChange={e => setPlotSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={plotStatusFilter}
                onChange={e => setPlotStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available Only</option>
                <option value="Booked">Booked Only</option>
                <option value="Sold">Sold Only</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddPlot}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plot to {project.name}</span>
            </button>
          </div>

          {/* Plots Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
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
                        <tr key={plot.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{plot.plot_number}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {plot.dimension || plot.dimension_str || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                            {plot.area_sqft} Sq.Ft
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {plot.facing || 'North Facing'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {plot.approval_status || 'DTCP Approved'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
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
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                                  : plot.status === 'Booked'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
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
                                className="p-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                                title="View Plot Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditPlot(plot)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                                title="Edit Plot"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePlot(plot.id, plot.plot_number)}
                                className="p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Project Overview & Specifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Project tagline, narrative description, infrastructure highlights, and legal compliance.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Tagline & Narrative</h3>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{project.tagline}</p>
                <div className="text-slate-800 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {project.description || 'No description provided.'}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Key Infrastructure Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(project.highlights || []).map((hl: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-800 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Legal & Compliance</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-slate-500 font-semibold text-[10px] uppercase">DTCP Approval</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">{project.dtcp_number || '100% DTCP Approved'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold text-[10px] uppercase">RERA Registration</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">{project.rera_number || 'TNRERA Approved Layout'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold text-[10px] uppercase">Total Layout Area</div>
                    <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">{project.total_extent_acres} Acres</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold text-[10px] uppercase">Total Capacity</div>
                    <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5">{project.total_plots_count} Plots Designed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AMENITIES & DEVELOPMENT STANDARDS */}
      {activeTab === 'amenities' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Amenities & Development Standards</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Civil infrastructure, ground water, roads, electricity, security and park facilities.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Amenities'}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Quick Preset Amenities (Click to Add)
              </span>
              <div className="flex flex-wrap gap-2">
                {AMENITY_PRESETS.map((preset, idx) => {
                  const isAdded = (projectFormData.amenities || []).some(
                    (a: any) => (a.title || '').toLowerCase() === preset.title.toLowerCase()
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddPresetAmenity(preset)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isAdded
                          ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 cursor-pointer shadow-sm'
                      }`}
                    >
                      {renderAmenityIcon(preset.icon)}
                      <span>{preset.title}</span>
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amenity Builder */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{editingAmenityIndex !== null ? 'Edit Development Standard' : 'Create Custom Amenity / Development Standard'}</span>
                </h4>
                {editingAmenityIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAmenityIndex(null);
                      setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Standard Icon</label>
                  <select
                    value={newAmenity.icon || 'Droplets'}
                    onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Droplets">💧 Sweet Groundwater</option>
                    <option value="Milestone">🛣️ Paved Blacktop Roads</option>
                    <option value="Fence">🧱 Protective Boundary Wall</option>
                    <option value="Award">📜 Clear Bank Title / Patta</option>
                    <option value="Sun">💡 EB & Street Lighting</option>
                    <option value="Trees">🌳 Avenue Trees & Park</option>
                    <option value="ShieldCheck">🛡️ Gated Entrance & Security</option>
                    <option value="Zap">⚡ Instant Registration</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Standard Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 40ft & 33ft Wide Blacktop Tar Roads"
                    value={newAmenity.title}
                    onChange={(e) => setNewAmenity({ ...newAmenity, title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Description / Civil Specs</label>
                  <input
                    type="text"
                    placeholder="Brief description of the civil works, materials, or features..."
                    value={newAmenity.desc || ''}
                    onChange={(e) => setNewAmenity({ ...newAmenity, desc: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveAmenity}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-2.5 rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{editingAmenityIndex !== null ? 'Update Standard' : 'Add Amenity'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Configured Amenities List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Configured Amenities & Standards ({(projectFormData.amenities || []).length})
                </h4>
              </div>

              {(projectFormData.amenities || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No amenities configured yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click any quick preset above or build a custom standard.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(projectFormData.amenities || []).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                          {renderAmenityIcon(item.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h5>
                          {item.desc && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleEditAmenity(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Edit Amenity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Remove Amenity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA */}
      {activeTab === 'media' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Project Cover & Gallery Media</span>
              </h3>
              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Media Changes'}</span>
              </button>
            </div>

            {/* Cover Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cover Banner Image URL</label>
                <input
                  type="text"
                  value={projectFormData.banner_image || ''}
                  onChange={e => setProjectFormData({ ...projectFormData, banner_image: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-lg">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Cover Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'banner_image')} />
                  </label>
                  {uploadingImage && <span className="text-[11px] text-amber-500 font-medium">Uploading...</span>}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Cover Preview</span>
                <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img
                    src={projectFormData.banner_image || '/images/hero-bg.jpg'}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Promotional Video */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span>Promotional Video (YouTube, Vimeo, or MP4)</span>
                </h4>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-pink-700 dark:text-pink-300 hover:text-pink-800 dark:hover:text-pink-200 bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-700/60 px-3 py-1.5 rounded-xl transition font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVideo ? 'Uploading...' : 'Upload Video File'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={uploadingVideo}
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL"
                value={projectFormData.video_url || ''}
                onChange={e => setProjectFormData({ ...projectFormData, video_url: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Project Brochure Upload & Link */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Project Brochure Document (PDF / Image)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    This file is downloaded when public website visitors click &quot;Download Brochure&quot;.
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-lg">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingBrochure ? 'Uploading...' : 'Upload Brochure File'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleBrochureUpload}
                    disabled={uploadingBrochure}
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="e.g. /brochure_park_avenue.pdf or upload file above"
                value={projectFormData.brochure_url || ''}
                onChange={e => setProjectFormData({ ...projectFormData, brochure_url: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gallery Images */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Gallery Images Carousel ({projectFormData.gallery_images?.length || 0})
                </h4>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-lg">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo to Gallery</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(projectFormData.gallery_images || []).map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative group h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        const next = projectFormData.gallery_images.filter((_: any, i: number) => i !== idx);
                        setProjectFormData({ ...projectFormData, gallery_images: next });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-sm"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Location Advantages & Strategic Connectivity</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Verified nearby places of worship, universities, transit hubs, and healthcare.
                </p>
              </div>

              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Hubs'}</span>
              </button>
            </div>

            {/* Repeater List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(projectFormData.nearby_landmarks || []).map((lm: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {lm.category || 'Transit'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{lm.name || lm.landmark}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>{lm.distance || 'Close proximity'}</span>
                      {lm.time && <span>• {lm.time}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditLandmark(idx)}
                      className="text-slate-400 hover:text-emerald-500 p-1.5 transition cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Edit landmark"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = projectFormData.nearby_landmarks.filter((_: any, i: number) => i !== idx);
                        setProjectFormData({ ...projectFormData, nearby_landmarks: next });
                        if (editingLandmarkIndex === idx) {
                          setEditingLandmarkIndex(null);
                          setNewLandmark({ landmark: '', category: 'Worship', distance: '', time: '', map_url: '' });
                        }
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1.5 transition cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Remove landmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Hub Row */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {editingLandmarkIndex !== null ? 'Edit Verified Landmark / Location Advantage' : 'Add Verified Landmark, Transit Hub or Place of Worship'}
                </h4>
                {editingLandmarkIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLandmarkIndex(null);
                      setNewLandmark({ landmark: '', category: 'Worship', distance: '', time: '', map_url: '' });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Hub Name (e.g. Gundur Mathurakaliamman Temple)"
                  value={newLandmark.landmark}
                  onChange={e => setNewLandmark({ ...newLandmark, landmark: e.target.value })}
                  className="sm:col-span-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newLandmark.category}
                  onChange={e => setNewLandmark({ ...newLandmark, category: e.target.value as any })}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Worship">Places of Worship (Temple / Mosque / Church)</option>
                  <option value="Education">Education & Universities</option>
                  <option value="Transit">Transit, Airport & Bus Stand</option>
                  <option value="Healthcare">Healthcare & Hospitals</option>
                  <option value="Shopping">Shopping & Markets</option>
                  <option value="Workplace">Workplace & Industries</option>
                  <option value="Entertainment">Entertainment, Theatre & Cinema</option>
                  <option value="Other">Other (Custom Category)</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dist (e.g. 2 km)"
                    value={newLandmark.distance}
                    onChange={e => setNewLandmark({ ...newLandmark, distance: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newLandmark.landmark.trim()) return;
                      const cat = newLandmark.category === 'Other' && customCategory.trim()
                        ? customCategory.trim()
                        : newLandmark.category;
                      const itemToAdd = {
                        name: newLandmark.landmark.trim(),
                        landmark: newLandmark.landmark.trim(),
                        category: cat,
                        distance: newLandmark.distance || 'Short drive',
                        time: newLandmark.time || ''
                      };
                      if (editingLandmarkIndex !== null) {
                        setProjectFormData((prev: any) => {
                          const next = [...(prev.nearby_landmarks || [])];
                          next[editingLandmarkIndex] = itemToAdd;
                          return { ...prev, nearby_landmarks: next };
                        });
                        setEditingLandmarkIndex(null);
                      } else {
                        setProjectFormData((prev: any) => ({
                          ...prev,
                          nearby_landmarks: [...(prev.nearby_landmarks || []), itemToAdd]
                        }));
                      }
                      setNewLandmark({ landmark: '', category: 'Worship', distance: '', time: '', map_url: '' });
                      setCustomCategory('');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    {editingLandmarkIndex !== null ? 'Update' : 'Add'}
                  </button>
                </div>

                {newLandmark.category === 'Other' && (
                  <div className="sm:col-span-4">
                    <label className="block text-emerald-700 dark:text-emerald-400 text-[11px] font-bold mb-1">
                      Specify Custom Category Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Multiplex Cinema, Theatre, Sports Stadium, Amusement Park"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === 'settings' && projectFormData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Project Parameters & Publishing Controls</span>
              </h3>
              <button
                onClick={handleSaveProject}
                disabled={projectSaving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{projectSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Project Name</label>
                <input
                  type="text"
                  value={projectFormData.name}
                  onChange={e => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Publishing Status</label>
                <select
                  value={projectFormData.status}
                  onChange={e => setProjectFormData({ ...projectFormData, status: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1 cursor-pointer"
                >
                  <option value="Ongoing">Ongoing (Active Selling)</option>
                  <option value="Upcoming">Upcoming (Pre-Launch)</option>
                  <option value="Completed">Completed</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Draft">Draft (Internal Only)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Extent (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={projectFormData.total_extent_acres}
                  onChange={e => setProjectFormData({ ...projectFormData, total_extent_acres: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location Area</label>
                <input
                  type="text"
                  value={projectFormData.location_area}
                  onChange={e => setProjectFormData({ ...projectFormData, location_area: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  value={projectFormData.location_city}
                  onChange={e => setProjectFormData({ ...projectFormData, location_city: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">DTCP Registration Number</label>
                <input
                  type="text"
                  value={projectFormData.dtcp_number}
                  onChange={e => setProjectFormData({ ...projectFormData, dtcp_number: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">RERA Approval Number</label>
                <input
                  type="text"
                  value={projectFormData.rera_number}
                  onChange={e => setProjectFormData({ ...projectFormData, rera_number: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Maps Embed URL</label>
                <input
                  type="text"
                  value={projectFormData.google_maps_embed_url}
                  onChange={e => setProjectFormData({ ...projectFormData, google_maps_embed_url: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 mt-1"
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

            {/* URL Slug & SEO Metadata Section */}
            <div className="p-4 bg-emerald-50/50 dark:bg-slate-950/70 border border-emerald-200/80 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Search Engine Optimization & Custom URL</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Google Indexing Standards</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                    Project URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const s = (projectFormData.name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                      setProjectFormData((prev: any) => ({ ...prev, slug: s }));
                    }}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                    title="Sync slug with current project name"
                  >
                    <RefreshCw className="w-3 h-3" /> Sync with Name
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/80 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 font-mono">
                    /projects/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. park-avenue"
                    value={projectFormData.slug || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-r-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Public URL: https://sreeharirealty.com/projects/{projectFormData.slug || 'project-slug'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      Meta Title (Search Engine Title)
                    </label>
                    <span className={`text-[10px] font-mono ${(projectFormData.meta_title || '').length > 60 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {(projectFormData.meta_title || '').length} / 50 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Park Avenue Gated Plots near Trichy Airport"
                    value={projectFormData.meta_title || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, meta_title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      Meta Description (Search Engine Snippet)
                    </label>
                    <span className={`text-[10px] font-mono ${(projectFormData.meta_description || '').length > 160 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {(projectFormData.meta_description || '').length} / 150 characters
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="e.g. DTCP approved residential villa plots in Park Avenue, Trichy. 40ft blacktop roads, sweet groundwater, 100% bank loans."
                    value={projectFormData.meta_description || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, meta_description: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-rose-200 dark:border-rose-950 pt-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Danger Zone: Delete Project</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Deleting this project will permanently remove it and all {plots.length} linked plots from the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeletingProjectModalOpen(true)}
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
                    <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">{dimensionStr}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Total Area</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs mt-0.5 block">{viewingPlot.area_sqft || 1200} Sq.Ft</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Facing</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 block">{viewingPlot.facing || 'North'}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Approval</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs mt-0.5 block">{viewingPlot.approval_status || 'DTCP Approved'}</span>
                  </div>
                </div>

                {/* Confidential CRM Price Card */}
                <div className="p-4 bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>CRM Pricing (Strictly Confidential)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Never exposed to public frontend</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        ₹ {priceLakhs} Lakhs
                      </div>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                        ₹ {priceVal.toLocaleString('en-IN')} INR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Rate per Sq.Ft</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition cursor-pointer border border-slate-200 dark:border-slate-700"
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


      {/* EDIT PROJECT OVERVIEW & SPECIFICATIONS MODAL */}
      {isEditProjectModalOpen && projectFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950/80 sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Project: {project.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ID: {project.id} • Slug: {project.slug} (Preserved)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditProjectModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto flex-shrink-0">
              {[
                { id: 'basic', label: '1. Basic Info', icon: FileText },
                { id: 'content', label: '2. Overview & Legal', icon: Layers },
                { id: 'amenities', label: '3. Amenities & Standards', icon: Sparkles, count: projectFormData.amenities?.length || 0 },
                { id: 'media', label: '4. Media & Brochure', icon: ImageIcon },
                { id: 'landmarks', label: '5. Location Advantages', icon: Compass, count: projectFormData.nearby_landmarks?.length }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = editModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditModalTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProjectOverview} className="p-6 overflow-y-auto space-y-6 text-xs flex-1 bg-white dark:bg-slate-900">
              {/* TAB 1: BASIC INFO */}
              {editModalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={projectFormData.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProjectFormData((prev: any) => ({
                            ...prev,
                            name: val,
                            meta_title: (!prev.meta_title || prev.meta_title === (prev.name || '').slice(0, 50)) ? val.slice(0, 50) : prev.meta_title
                          }));
                        }}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Publish Status *</label>
                      <select
                        value={projectFormData.status || 'Ongoing'}
                        onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                      >
                        <option value="Ongoing">Ongoing (Active Selling)</option>
                        <option value="Upcoming">Upcoming (Pre-Launch)</option>
                        <option value="Completed">Completed</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  {/* Project URL Slug Input */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Project URL Slug *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const s = (projectFormData.name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                          setProjectFormData((prev: any) => ({ ...prev, slug: s }));
                        }}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                        title="Sync slug with current project name"
                      >
                        <RefreshCw className="w-3 h-3" /> Sync with Name
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800/80 px-3 py-2.5 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 font-mono">
                        /projects/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. park-avenue"
                        value={projectFormData.slug || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-r-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Public URL: https://sreeharirealty.com/projects/{projectFormData.slug || 'project-slug'}</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Tagline / Catchphrase</label>
                    <input
                      type="text"
                      placeholder="e.g. Trichy's Most Coveted Gated Community on Airport Corridor"
                      value={projectFormData.tagline || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, tagline: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">City</label>
                      <input
                        type="text"
                        value={projectFormData.location_city || 'Trichy'}
                        onChange={(e) => setProjectFormData({ ...projectFormData, location_city: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Locality / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Gundur / Airport Road"
                        value={projectFormData.location_area || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, location_area: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Total Extent (Acres)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10.00"
                        value={projectFormData.total_extent_acres || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, total_extent_acres: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Total Plots Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={projectFormData.total_plots_count || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, total_plots_count: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Available Plots Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 40"
                        value={projectFormData.available_plots_count || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, available_plots_count: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">DTCP Number</label>
                      <input
                        type="text"
                        placeholder="e.g. DTCP / 148 / 2024"
                        value={projectFormData.dtcp_number || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, dtcp_number: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">RERA Number</label>
                      <input
                        type="text"
                        placeholder="e.g. TN/19/Layout/0284/2024"
                        value={projectFormData.rera_number || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, rera_number: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <GpsLocationPicker
                    latitude={projectFormData.latitude || ''}
                    longitude={projectFormData.longitude || ''}
                    onChange={(lat, lng) => setProjectFormData({ ...projectFormData, latitude: lat, longitude: lng })}
                    label="Master Project GPS Coordinates"
                    helpText="Powers driving directions and turn-by-turn navigation for public website visitors."
                  />

                  {/* SEO Metadata Box */}
                  <div className="p-4 bg-emerald-50/60 dark:bg-slate-950/70 border border-emerald-200/80 dark:border-slate-800 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Search Engine Optimization (SEO Meta Tags)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Google Search Preview</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          Meta Title (Search Engine Title)
                        </label>
                        <span className={`text-[10px] font-mono ${(projectFormData.meta_title || '').length > 60 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                          {(projectFormData.meta_title || '').length} / 50 characters
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Park Avenue Gated Plots near Trichy Airport"
                        value={projectFormData.meta_title || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, meta_title: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Recommended: 45–60 characters. Auto-defaults to project name.</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          Meta Description (Search Engine Snippet)
                        </label>
                        <span className={`text-[10px] font-mono ${(projectFormData.meta_description || '').length > 160 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                          {(projectFormData.meta_description || '').length} / 150 characters
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="e.g. DTCP approved residential villa plots in Park Avenue, Trichy. 40ft blacktop roads, sweet groundwater, 100% bank loans. Inquire for spot booking offers."
                        value={projectFormData.meta_description || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, meta_description: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs leading-relaxed"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Recommended: 120–150 characters. Auto-defaults to overview snippet.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & LEGAL */}
              {editModalTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                      Project Narrative / Detailed Description *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Comprehensive project narrative describing layout advantages, potable water, wide roads, and living environment..."
                      value={projectFormData.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjectFormData((prev: any) => ({
                          ...prev,
                          description: val,
                          meta_description: (!prev.meta_description || prev.meta_description === (prev.description || prev.tagline).slice(0, 150)) ? val.slice(0, 150) : prev.meta_description
                        }));
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Plot Size Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 1200 - 2400 Sq.Ft"
                        value={projectFormData.plot_size_range || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, plot_size_range: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Price Range Display</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹ 18 - 36 Lakhs"
                        value={projectFormData.price_range || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, price_range: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Infrastructure Highlights */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Infrastructure Highlights</span>
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
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
                      >
                        Add
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(projectFormData.highlights || []).map((hl: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300"
                        >
                          <span className="truncate mr-2 font-medium">{hl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove highlight"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AMENITIES & DEVELOPMENT STANDARDS */}
              {editModalTab === 'amenities' && (
                <div className="space-y-4">
                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Quick Preset Amenities (Click to Add)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_PRESETS.map((preset, idx) => {
                        const isAdded = (projectFormData.amenities || []).some(
                          (a: any) => (a.title || '').toLowerCase() === preset.title.toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddPresetAmenity(preset)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                              isAdded
                                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 cursor-pointer shadow-sm'
                            }`}
                          >
                            {renderAmenityIcon(preset.icon)}
                            <span>{preset.title}</span>
                            {isAdded ? (
                              <Check className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add / Edit Form */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{modalEditingAmenityIndex !== null ? 'Edit Development Standard' : 'Add Custom Amenity / Development Standard'}</span>
                      </h4>
                      {modalEditingAmenityIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalEditingAmenityIndex(null);
                            setModalAmenity({ icon: 'Droplets', title: '', desc: '' });
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Standard Icon</label>
                        <select
                          value={modalAmenity.icon || 'Droplets'}
                          onChange={(e) => setModalAmenity({ ...modalAmenity, icon: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Droplets">💧 Sweet Groundwater</option>
                          <option value="Milestone">🛣️ Paved Blacktop Roads</option>
                          <option value="Fence">🧱 Protective Boundary Wall</option>
                          <option value="Award">📜 Clear Bank Title / Patta</option>
                          <option value="Sun">💡 EB & Street Lighting</option>
                          <option value="Trees">🌳 Avenue Trees & Park</option>
                          <option value="ShieldCheck">🛡️ Gated Entrance & Security</option>
                          <option value="Zap">⚡ Instant Registration</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Standard Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. 40ft & 33ft Wide Blacktop Tar Roads"
                          value={modalAmenity.title}
                          onChange={(e) => setModalAmenity({ ...modalAmenity, title: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Description / Specs</label>
                        <input
                          type="text"
                          placeholder="Brief description of the civil works, materials, or features..."
                          value={modalAmenity.desc || ''}
                          onChange={(e) => setModalAmenity({ ...modalAmenity, desc: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleSaveModalAmenity}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition cursor-pointer shadow-sm text-xs flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{modalEditingAmenityIndex !== null ? 'Update' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Configured Amenities in Modal */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Configured Amenities ({(projectFormData.amenities || []).length})
                    </h4>
                    {(projectFormData.amenities || []).length === 0 ? (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-xs">
                        No amenities configured yet. Click any quick preset above or add a custom one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(projectFormData.amenities || []).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs shadow-sm"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 pr-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                {renderAmenityIcon(item.icon)}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                  {item.title}
                                </span>
                                {item.desc && (
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditModalAmenity(idx)}
                                className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveModalAmenity(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: VISUAL MEDIA & BROCHURE */}
              {editModalTab === 'media' && (
                <div className="space-y-4">
                  {/* Cover Banner Image */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Cover Banner Image URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={projectFormData.banner_image || ''}
                        onChange={(e) => setProjectFormData({ ...projectFormData, banner_image: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex-shrink-0">
                        <Upload className="w-4 h-4" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'banner_image')}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {projectFormData.banner_image && (
                      <div className="mt-3 relative h-36 w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={projectFormData.banner_image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded">
                          Cover Preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Walkthrough Video URL */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold">Project Walkthrough Video URL</label>
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 dark:text-pink-400 hover:underline">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingVideo ? 'Uploading...' : 'Upload Video File'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          onChange={handleVideoUpload}
                          className="hidden"
                          disabled={uploadingVideo}
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                      value={projectFormData.video_url || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, video_url: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Project Brochure */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold">Project Brochure Document (PDF / Link)</label>
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingBrochure ? 'Uploading...' : 'Upload Brochure PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={handleBrochureUpload}
                          disabled={uploadingBrochure}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. /brochure_park_avenue.pdf or upload file above"
                      value={projectFormData.brochure_url || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, brochure_url: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: LOCATION ADVANTAGES */}
              {editModalTab === 'landmarks' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Add Nearby Landmark, Hub, Theatre or Institution
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Landmark / Facility Name (e.g. Cauvery Multiplex, BHEL Hospital)"
                          value={modalLandmark.landmark}
                          onChange={(e) => setModalLandmark({ ...modalLandmark, landmark: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <select
                          value={modalLandmark.category}
                          onChange={(e) => setModalLandmark({ ...modalLandmark, category: e.target.value as any })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Education">Education & Schools</option>
                          <option value="Transit">Transit & Railway / Bus</option>
                          <option value="Healthcare">Healthcare & Hospitals</option>
                          <option value="Worship">Worship & Temples</option>
                          <option value="Entertainment">Entertainment, Theatre & Cinema</option>
                          <option value="Shopping">Shopping & Markets</option>
                          <option value="Workplace">Workplace & IT / Industry</option>
                          <option value="Other">Other (Custom Category)</option>
                        </select>
                      </div>
                    </div>

                    {modalLandmark.category === 'Other' && (
                      <div>
                        <input
                          type="text"
                          placeholder="Type custom category (e.g. Cinema Theatre, Park, Stadium)..."
                          value={modalCustomCategory}
                          onChange={(e) => setModalCustomCategory(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-emerald-500 rounded-xl p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Distance (e.g. 2.5 km)"
                        value={modalLandmark.distance}
                        onChange={(e) => setModalLandmark({ ...modalLandmark, distance: e.target.value })}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Time (e.g. 5 Mins)"
                        value={modalLandmark.time}
                        onChange={(e) => setModalLandmark({ ...modalLandmark, time: e.target.value })}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddModalLandmark}
                        className="w-full col-span-2 sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl transition cursor-pointer shadow-sm text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{modalEditingLandmarkIndex !== null ? 'Update' : 'Add Landmark'}</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Landmarks */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Configured Landmarks ({projectFormData.nearby_landmarks?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(projectFormData.nearby_landmarks || []).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs shadow-sm"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {item.landmark || item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {item.category || 'Transit'}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {item.distance} • {item.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditModalLandmark(idx)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveModalLandmark(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Save Bar */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 p-4 -mx-6 -mb-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  {editModalTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editModalTab === 'content') setEditModalTab('basic');
                        if (editModalTab === 'amenities') setEditModalTab('content');
                        if (editModalTab === 'media') setEditModalTab('amenities');
                        if (editModalTab === 'landmarks') setEditModalTab('media');
                      }}
                      className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                  )}

                  {editModalTab !== 'landmarks' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editModalTab === 'basic') setEditModalTab('content');
                        if (editModalTab === 'content') setEditModalTab('amenities');
                        if (editModalTab === 'amenities') setEditModalTab('media');
                        if (editModalTab === 'media') setEditModalTab('landmarks');
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
                    onClick={() => setIsEditProjectModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={projectSaving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{projectSaving ? 'Saving Changes...' : 'Save Project Details'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in ${
            toastMessage.type === 'error'
              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300'
              : toastMessage.type === 'warning'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
          }`}
        >
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="hover:opacity-75 cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Styled Confirm Delete Plot Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPlotInfo)}
        title="Delete Plot?"
        description={deletingPlotInfo ? `Are you sure you want to delete ${deletingPlotInfo.plotNumber}? This will remove it from this project's inventory.` : ''}
        confirmLabel="Delete Plot"
        onConfirm={confirmDeletePlot}
        onCancel={() => setDeletingPlotInfo(null)}
      />

      {/* Styled Confirm Delete Project Modal */}
      <ConfirmModal
        isOpen={isDeletingProjectModalOpen}
        title="Permanently Delete Project?"
        description={`Are you absolutely sure you want to permanently delete "${project?.name || 'this project'}" and all its plots? This action cannot be undone.`}
        confirmLabel="Permanently Delete"
        onConfirm={confirmDeleteProjectPermanent}
        onCancel={() => setIsDeletingProjectModalOpen(false)}
      />
    </div>
  );
}
