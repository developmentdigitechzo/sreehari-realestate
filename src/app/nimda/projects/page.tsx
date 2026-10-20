'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Project, LandmarkItem, AmenityItem } from '@/lib/types';
import PlotFormModal from '@/components/admin/PlotFormModal';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  Building2,
  MapPin,
  X,
  ExternalLink,
  Upload,
  Video,
  Layers,
  FileText,
  Navigation,
  CheckCircle2,
  Compass,
  Eye,
  Grid,
  Sparkles,
  Droplets,
  Trees,
  Sun,
  Fence,
  Zap,
  Award,
  ShieldCheck,
  Milestone,
  Check
} from 'lucide-react';

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
    title: 'Landscaped Children\'s Park',
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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'amenities' | 'media' | 'landmarks'>('basic');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);

  // Plot Modal State for adding a plot directly from project cards
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [plotModalProject, setPlotModalProject] = useState<Project | null>(null);

  // Form Data with clean, fresh defaults (no fake pre-filled numbers)
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    status: 'Ongoing',
    location_city: 'Trichy',
    location_area: '',
    map_url: '',
    total_acres: '' as any,
    total_plots: '' as any,
    available_plots: '' as any,
    price_starting_lakhs: '' as any,
    dtcp_number: '',
    rera_number: '',
    hero_image: '',
    video_url: '',
    brochure_url: '',
    description: '',
    highlights: [] as string[],
    highlightsText: '',
    amenities: [] as AmenityItem[],
    nearby_landmarks: [] as LandmarkItem[]
  });

  // Amenity form draft & edit state
  const [newAmenity, setNewAmenity] = useState<AmenityItem>({
    icon: 'Droplets',
    title: '',
    desc: ''
  });
  const [editingAmenityIndex, setEditingAmenityIndex] = useState<number | null>(null);

  // Landmark form draft state & edit state
  const [newLandmark, setNewLandmark] = useState<LandmarkItem>({
    landmark: '',
    category: 'Worship',
    distance: '',
    time: '',
    map_url: ''
  });
  const [customCategory, setCustomCategory] = useState('');
  const [editingLandmarkIndex, setEditingLandmarkIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await api.getProjects();
      if (res?.data) setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreate = () => {
    setEditingProject(null);
    setActiveTab('basic');
    setFormData({
      name: '',
      tagline: '',
      status: 'Ongoing',
      location_city: 'Trichy',
      location_area: '',
      map_url: '',
      total_acres: '' as any,
      total_plots: '' as any,
      available_plots: '' as any,
      price_starting_lakhs: '' as any,
      dtcp_number: '',
      rera_number: '',
      hero_image: '',
      video_url: '',
      brochure_url: '',
      description: '',
      highlights: [],
      highlightsText: '',
      amenities: [],
      nearby_landmarks: []
    });
    setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
    setEditingAmenityIndex(null);
    setNewLandmark({
      landmark: '',
      category: 'Worship',
      distance: '',
      time: '',
      map_url: ''
    });
    setCustomCategory('');
    setEditingLandmarkIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setActiveTab('basic');
    const existingHighlights = project.highlights || [];
    let rawAmenities = project.amenities;
    if (typeof rawAmenities === 'string') {
      try { rawAmenities = JSON.parse(rawAmenities); } catch {}
    }
    let rawLandmarks = project.nearby_landmarks;
    if (typeof rawLandmarks === 'string') {
      try { rawLandmarks = JSON.parse(rawLandmarks); } catch {}
    }

    setFormData({
      name: project.name || '',
      tagline: project.tagline || '',
      status: project.status || 'Ongoing',
      location_city: project.location_city || 'Trichy',
      location_area: project.location_area || '',
      map_url: project.google_maps_embed_url || project.map_url || '',
      total_acres: project.total_extent_acres !== undefined ? project.total_extent_acres : (project.total_acres || ''),
      total_plots: project.total_plots_count !== undefined ? project.total_plots_count : (project.total_plots || ''),
      available_plots: project.available_plots_count !== undefined ? project.available_plots_count : (project.available_plots || ''),
      price_starting_lakhs: project.price_starting_lakhs || '',
      dtcp_number: project.dtcp_number || '',
      rera_number: project.rera_number || '',
      hero_image: project.banner_image || project.hero_image || '',
      video_url: project.video_url || '',
      brochure_url: project.brochure_url || '',
      description: project.description || '',
      highlights: existingHighlights,
      highlightsText: Array.isArray(existingHighlights) ? existingHighlights.join('\n') : '',
      amenities: Array.isArray(rawAmenities) ? [...rawAmenities] : [],
      nearby_landmarks: Array.isArray(rawLandmarks) ? [...rawLandmarks] : []
    });
    setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
    setEditingAmenityIndex(null);
    setNewLandmark({
      landmark: '',
      category: 'Worship',
      distance: '',
      time: '',
      map_url: ''
    });
    setCustomCategory('');
    setEditingLandmarkIndex(null);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia({ imageBase64: base64, filename: file.name });
        if (res && res.success && res.fileUrl) {
          setFormData((prev) => ({ ...prev, hero_image: res.fileUrl }));
        } else {
          alert('Failed to upload image. Please check backend connection.');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + err.message);
      setUploadingImage(false);
    }
  };

  const handleBrochureFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrochure(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia({ imageBase64: base64, filename: file.name });
        if (res && res.success && res.fileUrl) {
          setFormData((prev) => ({ ...prev, brochure_url: res.fileUrl }));
        } else {
          alert('Failed to upload brochure file.');
        }
        setUploadingBrochure(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Brochure upload error:', err);
      alert('Brochure upload failed: ' + err.message);
      setUploadingBrochure(false);
    }
  };

  // Amenity Management Handlers
  const handleSaveAmenity = () => {
    if (!newAmenity.title.trim()) {
      alert('Please enter amenity title');
      return;
    }
    if (editingAmenityIndex !== null) {
      setFormData((prev) => {
        const next = [...prev.amenities];
        next[editingAmenityIndex] = { ...newAmenity };
        return { ...prev, amenities: next };
      });
      setEditingAmenityIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, { ...newAmenity }]
      }));
    }
    setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
  };

  const handleEditAmenity = (index: number) => {
    const item = formData.amenities[index];
    if (item) {
      setNewAmenity({ ...item });
      setEditingAmenityIndex(index);
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
    if (editingAmenityIndex === index) {
      setEditingAmenityIndex(null);
      setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
    }
  };

  const handleAddPresetAmenity = (preset: AmenityItem) => {
    if (formData.amenities.some((a) => a.title.toLowerCase() === preset.title.toLowerCase())) {
      alert(`"${preset.title}" is already added.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, { ...preset }]
    }));
  };

  // Landmark Management Handlers
  const handleSaveLandmark = () => {
    if (!newLandmark.landmark.trim()) {
      alert('Please enter a landmark name');
      return;
    }
    const finalCategory =
      newLandmark.category === 'Other' && customCategory.trim()
        ? customCategory.trim()
        : newLandmark.category;

    if (editingLandmarkIndex !== null) {
      setFormData((prev) => {
        const next = [...prev.nearby_landmarks];
        next[editingLandmarkIndex] = { ...newLandmark, category: finalCategory };
        return { ...prev, nearby_landmarks: next };
      });
      setEditingLandmarkIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        nearby_landmarks: [...prev.nearby_landmarks, { ...newLandmark, category: finalCategory }]
      }));
    }
    setNewLandmark({
      landmark: '',
      category: 'Worship',
      distance: '',
      time: '',
      map_url: ''
    });
    setCustomCategory('');
  };

  const handleEditLandmark = (index: number) => {
    const item = formData.nearby_landmarks[index];
    if (item) {
      const isStd = ['Worship', 'Education', 'Healthcare', 'Entertainment', 'Transit', 'Shopping', 'Workplace'].includes(item.category || '');
      setNewLandmark({
        landmark: item.landmark || (item as any).name || '',
        category: isStd ? (item.category as any) : 'Other',
        distance: item.distance || '',
        time: item.time || '',
        map_url: item.map_url || ''
      });
      if (!isStd && item.category) {
        setCustomCategory(item.category);
      } else {
        setCustomCategory('');
      }
      setEditingLandmarkIndex(index);
    }
  };

  const handleRemoveLandmark = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nearby_landmarks: prev.nearby_landmarks.filter((_, i) => i !== index)
    }));
    if (editingLandmarkIndex === index) {
      setEditingLandmarkIndex(null);
      setNewLandmark({
        landmark: '',
        category: 'Worship',
        distance: '',
        time: '',
        map_url: ''
      });
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedHighlights = formData.highlightsText
      ? formData.highlightsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : formData.highlights;

    const payload = {
      name: formData.name,
      tagline: formData.tagline,
      status: formData.status,
      location_city: formData.location_city,
      location_area: formData.location_area,
      total_extent_acres: Number(formData.total_acres),
      total_acres: Number(formData.total_acres),
      total_plots_count: Number(formData.total_plots),
      total_plots: Number(formData.total_plots),
      available_plots_count: Number(formData.available_plots),
      available_plots: Number(formData.available_plots),
      price_starting_lakhs: Number(formData.price_starting_lakhs),
      dtcp_number: formData.dtcp_number,
      rera_number: formData.rera_number,
      banner_image: formData.hero_image,
      hero_image: formData.hero_image,
      video_url: formData.video_url,
      brochure_url: formData.brochure_url,
      google_maps_embed_url: formData.map_url,
      map_url: formData.map_url,
      description: formData.description,
      highlights: parsedHighlights,
      amenities: formData.amenities,
      nearby_landmarks: formData.nearby_landmarks
    };

    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
      } else {
        await api.createProject(payload);
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated plots will also be removed.')) return;
    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Land & Plot Projects Manager</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Manage projects, cover images, promotional videos, descriptions, verified location advantages, and plot inventory.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-3 text-center py-10 text-slate-500">Loading projects from database...</p>
        ) : projects.length === 0 ? (
          <p className="col-span-3 text-center py-10 text-slate-500">No projects added yet.</p>
        ) : (
          projects.map((proj) => {
            const coverImg = proj.banner_image || proj.hero_image || '/images/hero-bg.jpg';
            const acres = proj.total_extent_acres !== undefined ? proj.total_extent_acres : proj.total_acres;
            const plotsCount = proj.total_plots_count !== undefined ? proj.total_plots_count : proj.total_plots;
            const availableCount = proj.available_plots_count !== undefined ? proj.available_plots_count : proj.available_plots;
            const landmarksCount = Array.isArray(proj.nearby_landmarks) ? proj.nearby_landmarks.length : 0;

            return (
              <div
                key={proj.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm hover:shadow-md group"
              >
                <div>
                  {/* Project Cover Image Preview */}
                  <Link href={`/nimda/projects/${proj.id}`} className="block relative h-48 w-full bg-slate-950 overflow-hidden cursor-pointer">
                    <img
                      src={coverImg}
                      alt={proj.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                          proj.status === 'Ongoing'
                            ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/50'
                            : proj.status === 'Sold Out'
                            ? 'bg-rose-900/90 text-rose-200 border border-rose-500/50'
                            : 'bg-blue-900/90 text-blue-200 border border-blue-500/50'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 project-cover-overlay z-10">
                      <h3 className="text-lg font-extrabold text-white project-cover-title leading-tight drop-shadow-md group-hover:text-emerald-300 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-slate-100 project-cover-text line-clamp-1 mt-0.5 font-medium drop-shadow-sm">
                        {proj.tagline || `${acres || 0} Acres in ${proj.location_area || proj.location_city || 'Trichy'}`}
                      </p>
                    </div>
                  </Link>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 text-slate-200 hover:text-white rounded-lg bg-black/60 backdrop-blur-md hover:bg-black/90 transition cursor-pointer"
                      title="Quick Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-rose-300 hover:text-rose-100 rounded-lg bg-black/60 backdrop-blur-md hover:bg-rose-900/90 transition cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Project Details Body */}
                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Location
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right line-clamp-1 max-w-[180px]">
                        {proj.location_area || proj.location_city}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Total Extent</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{acres} Acres</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Plot Inventory</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {availableCount} / {plotsCount} Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Amenities & Standards</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{Array.isArray(proj.amenities) ? proj.amenities.length : 0} Standards</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Location Advantages</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{landmarksCount} Verified Hubs</span>
                    </div>

                    {proj.video_url && (
                      <div className="flex items-center gap-1 text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                        <Video className="w-3 h-3" /> Promotional Video Attached
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs gap-2">
                  <Link
                    href={`/properties/${proj.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Live</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPlotModalProject(proj);
                        setIsPlotModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                      title={`Add a new plot directly into ${proj.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Plot</span>
                    </button>

                    <Link
                      href={`/nimda/projects/${proj.id}?tab=plots`}
                      className="inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                    >
                      <Grid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Manage</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comprehensive Project Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl my-6 flex flex-col max-h-[92vh] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0 bg-slate-50 dark:bg-slate-950/80 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingProject ? `Edit Project: ${editingProject.name}` : 'Add New Gated Community'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">All saved data immediately reflects in the database and public project page.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Buttons */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-4 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Basic & Approvals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`py-3 px-4 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'content'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>2. Overview & Highlights</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('amenities')}
                className={`py-3 px-4 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'amenities'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Amenities & Standards ({formData.amenities.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`py-3 px-4 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>4. Media & Videos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('landmarks')}
                className={`py-3 px-4 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'landmarks'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>5. Location & Hubs ({formData.nearby_landmarks.length})</span>
              </button>
            </div>

            {/* Modal Form Scrollable Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* TAB 1: BASIC & APPROVALS */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Park Avenue"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Ongoing">Ongoing (Active Selling)</option>
                        <option value="Upcoming">Upcoming (New Launch)</option>
                        <option value="Completed">Completed</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Draft">Draft (Internal Only)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Premier Gated Plotted Community with Grand Entrance on Highway Corridor"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">City</label>
                      <input
                        type="text"
                        value={formData.location_city}
                        onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Area / Corridor *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Trichy-Pudukkottai Highway Corridor (Near Airport)"
                        value={formData.location_area}
                        onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Google Maps Location / Direction Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.map_url || ''}
                      onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Touching the property location on the frontend opens this exact Google Maps pin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">DTCP Approval Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. DTCP / 148 / 2024"
                        value={formData.dtcp_number}
                        onChange={(e) => setFormData({ ...formData, dtcp_number: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">TNRERA Approval Reference</label>
                      <input
                        type="text"
                        placeholder="e.g. TN/19/Layout/0284/2024"
                        value={formData.rera_number}
                        onChange={(e) => setFormData({ ...formData, rera_number: e.target.value })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Total Acres</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10.00"
                        value={formData.total_acres ?? ''}
                        onChange={(e) => setFormData({ ...formData, total_acres: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Total Plots</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={formData.total_plots ?? ''}
                        onChange={(e) => setFormData({ ...formData, total_plots: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Available Plots</label>
                      <input
                        type="number"
                        placeholder="e.g. 40"
                        value={formData.available_plots ?? ''}
                        onChange={(e) => setFormData({ ...formData, available_plots: e.target.value ? Number(e.target.value) : '' })}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERVIEW & HIGHLIGHTS */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Project Description & Overview *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Detailed overview describing location advantages, civil infrastructure, water quality, bank loans, and community standards..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Highlight key features such as entrance arch, 40ft blacktop roads, potable groundwater, park areas, and DTCP approvals.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Bullet Highlights (One per line)
                    </label>
                    <textarea
                      rows={5}
                      placeholder="e.g.&#10;5.37 Acres Gated Community with 101 DTCP Plots&#10;Sweet Potable Groundwater with Individual Pipe Lines&#10;Grand Monumental Entrance Arch & Blacktop Roads"
                      value={formData.highlightsText}
                      onChange={(e) => setFormData({ ...formData, highlightsText: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        Project Brochure (PDF or Link)
                      </label>
                      <label className="cursor-pointer text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingBrochure ? 'Uploading...' : 'Upload Brochure File'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleBrochureFileUpload}
                          className="hidden"
                          disabled={uploadingBrochure}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. /brochure_park_avenue.pdf or upload file above"
                      value={formData.brochure_url}
                      onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      When public visitors click &quot;Download Brochure&quot; on the website, this document will be provided.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: AMENITIES & DEVELOPMENT STANDARDS */}
              {activeTab === 'amenities' && (
                <div className="space-y-4">
                  {/* Preset quick buttons */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Quick Layout Standard Presets</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Click to add in 1 click</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {AMENITY_PRESETS.map((preset) => {
                        const isAdded = formData.amenities.some((a) => a.title.toLowerCase() === preset.title.toLowerCase());
                        return (
                          <button
                            key={preset.title}
                            type="button"
                            onClick={() => handleAddPresetAmenity(preset)}
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 opacity-60 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 shadow-2xs'
                            }`}
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>{preset.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add / Edit Form Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                      {editingAmenityIndex !== null ? (
                        <>
                          <Edit3 className="w-4 h-4 text-amber-500" />
                          <span>Edit Amenity #{editingAmenityIndex + 1}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Add Custom Amenity or Infrastructure Standard</span>
                        </>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Feature Icon</label>
                        <select
                          value={newAmenity.icon}
                          onChange={(e) => setNewAmenity({ ...newAmenity, icon: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white cursor-pointer"
                        >
                          <option value="Droplets">💧 Sweet Groundwater (Droplets)</option>
                          <option value="Milestone">🛣️ Blacktop Tar Roads (Milestone)</option>
                          <option value="Fence">🧱 Protective Boundary Wall (Fence)</option>
                          <option value="Award">🏦 Bank Loan Eligible (Award)</option>
                          <option value="Sun">⚡ Electricity & Streetlights (Sun)</option>
                          <option value="Trees">🌳 Landscaped Park (Trees)</option>
                          <option value="ShieldCheck">🛡️ Grand Arch & Security (ShieldCheck)</option>
                          <option value="Zap">📜 Spot Patta & Registration (Zap)</option>
                          <option value="Sparkles">✨ Infrastructure Standard (Sparkles)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Amenity Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Sweet Potable Water"
                          value={newAmenity.title}
                          onChange={(e) => setNewAmenity({ ...newAmenity, title: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Short Description / Benefits</label>
                        <input
                          type="text"
                          placeholder="e.g. Sweet groundwater available throughout all seasons at shallow depth."
                          value={newAmenity.desc}
                          onChange={(e) => setNewAmenity({ ...newAmenity, desc: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {editingAmenityIndex !== null ? (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifying item #{editingAmenityIndex + 1}</span>
                        </div>
                      ) : <div />}
                      <div className="flex items-center gap-2">
                        {editingAmenityIndex !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAmenityIndex(null);
                              setNewAmenity({ icon: 'Droplets', title: '', desc: '' });
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveAmenity}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          {editingAmenityIndex !== null ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Update Amenity</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Amenity</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Configured Amenities List */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      Configured Amenities & Standards ({formData.amenities.length})
                    </h5>

                    {formData.amenities.length === 0 ? (
                      <p className="text-slate-500 italic p-3 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                        No amenities configured yet. Click any quick preset above or create a custom one.
                      </p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {formData.amenities.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs gap-3"
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.desc}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditAmenity(idx)}
                                className="text-slate-400 hover:text-amber-500 p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer"
                                title="Edit Amenity"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAmenity(idx)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                title="Remove Amenity"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & VIDEOS */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {/* Cover Image Upload / URL */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cover / Banner Image *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        placeholder="/images/hero-bg.jpg or upload file"
                        value={formData.hero_image}
                        onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {formData.hero_image && (
                      <div className="mt-3 relative h-36 w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={formData.hero_image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded">
                          Cover Preview
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Project Video URL (YouTube, Vimeo, or MP4)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      When provided, a video showcase player will render on the public project detail page.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: LOCATION ADVANTAGES & HUBS */}
              {activeTab === 'landmarks' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                      {editingLandmarkIndex !== null ? (
                        <>
                          <Edit3 className="w-4 h-4 text-amber-500" />
                          <span>Edit Landmark #{editingLandmarkIndex + 1}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Add Verified Landmark, Transit Hub or Place of Worship</span>
                        </>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Landmark / Place Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Gundur Mathurakaliamman Temple"
                          value={newLandmark.landmark}
                          onChange={(e) => setNewLandmark({ ...newLandmark, landmark: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Category</label>
                        <select
                          value={newLandmark.category}
                          onChange={(e) => setNewLandmark({ ...newLandmark, category: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white cursor-pointer"
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
                      </div>

                      {newLandmark.category === 'Other' && (
                        <div className="sm:col-span-2">
                          <label className="block text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mb-1">
                            Specify Custom Category Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Cinema / Theatre, Sports Stadium, Amusement Park"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-600 rounded-lg p-2 text-slate-900 dark:text-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Distance (e.g. 1.8 km)</label>
                        <input
                          type="text"
                          placeholder="1.8 km"
                          value={newLandmark.distance}
                          onChange={(e) => setNewLandmark({ ...newLandmark, distance: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">Commute Time (e.g. 4 mins)</label>
                        <input
                          type="text"
                          placeholder="4 mins"
                          value={newLandmark.time}
                          onChange={(e) => setNewLandmark({ ...newLandmark, time: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {editingLandmarkIndex !== null ? (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editing landmark #{editingLandmarkIndex + 1}</span>
                        </div>
                      ) : <div />}
                      <div className="flex items-center gap-2">
                        {editingLandmarkIndex !== null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLandmarkIndex(null);
                              setNewLandmark({
                                landmark: '',
                                category: 'Worship',
                                distance: '',
                                time: '',
                                map_url: ''
                              });
                              setCustomCategory('');
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSaveLandmark}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          {editingLandmarkIndex !== null ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Update Landmark</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Landmark</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of current landmarks */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      Configured Landmarks ({formData.nearby_landmarks.length})
                    </h5>

                    {formData.nearby_landmarks.length === 0 ? (
                      <p className="text-slate-500 italic p-3 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800">
                        No landmarks added yet. Add verified nearby places of worship, colleges, theatres, or transit hubs above.
                      </p>
                    ) : (
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                        {formData.nearby_landmarks.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.category === 'Worship'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : item.category === 'Education'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : item.category === 'Healthcare'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : item.category === 'Entertainment'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {item.category || 'Transit'}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">{item.landmark || (item as any).name}</span>
                              <span className="text-slate-500 dark:text-slate-400">({item.distance} • {item.time})</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditLandmark(idx)}
                                className="text-slate-400 hover:text-amber-500 p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/50 cursor-pointer"
                                title="Edit Landmark"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveLandmark(idx)}
                                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="text-[11px] text-slate-500">
                  {editingProject ? 'Updating existing project' : 'Creating new project'}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Project</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Canonical Shared Plot Form Modal for quick plot adding */}
      <PlotFormModal
        isOpen={isPlotModalOpen}
        onClose={() => {
          setIsPlotModalOpen(false);
          setPlotModalProject(null);
        }}
        onSaved={() => {
          loadProjects();
          setIsPlotModalOpen(false);
          setPlotModalProject(null);
        }}
        initialProjectId={plotModalProject?.id}
        initialProjectName={plotModalProject?.name}
        projectsList={projects}
      />
    </div>
  );
}
