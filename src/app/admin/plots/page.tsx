'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plot, Project } from '@/lib/types';
import {
  Grid,
  List as ListIcon,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  MapPin,
  Globe,
  Sparkles,
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
  Tag,
  Phone,
  MessageSquare
} from 'lucide-react';

const DEFAULT_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

export default function AdminPlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode: 'grid' (card grid like reference img 2 & 3), 'table', 'form'
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'form'>('grid');
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

  // View Profile Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPlot, setViewingPlot] = useState<Plot | null>(null);

  // ALL 7 FILTERS from Reference Image 4
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [adTypeFilter, setAdTypeFilter] = useState('All Ad Types');
  const [visibilityFilter, setVisibilityFilter] = useState('All Visibility');
  const [maxPriceFilter, setMaxPriceFilter] = useState('Max price (All)');

  // Form State containing all 5 sections
  const [formData, setFormData] = useState<Partial<Plot>>({
    project_id: '',
    title: '',
    slug: '',
    type: 'Plot',
    category: 'Sale',
    locality: '',
    road_corridor: '',
    taluk: 'Central',
    district: 'City',
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
    latitude: '10.786999',
    longitude: '79.137827',
    primary_image_url: DEFAULT_PROPERTY_IMAGE,
    gallery_images: []
  });

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

  // Filter Logic matching Image 4
  const filteredPlots = plots.filter((plot) => {
    // 1. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = plot.plot_number?.toLowerCase().includes(q);
      const matchTitle = plot.title?.toLowerCase().includes(q);
      const matchLocality = plot.locality?.toLowerCase().includes(q);
      const matchType = plot.type?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchLocality && !matchType) return false;
    }

    // 2. Category Filter
    if (categoryFilter !== 'All Categories') {
      if (plot.category !== categoryFilter) return false;
    }

    // 3. Status Filter
    if (statusFilter !== 'All Statuses') {
      if (plot.status !== statusFilter) return false;
    }

    // 4. Visibility Filter
    if (visibilityFilter !== 'All Visibility') {
      if (plot.listing_visibility !== visibilityFilter) return false;
    }

    // 5. Max Price Filter
    if (maxPriceFilter !== 'Max price (All)') {
      const lakhs = plot.total_price_lakhs || (plot.price ? plot.price / 100000 : 0);
      if (maxPriceFilter === 'Under 25 Lakhs' && lakhs > 25) return false;
      if (maxPriceFilter === 'Under 50 Lakhs' && lakhs > 50) return false;
      if (maxPriceFilter === 'Under 1 Crore' && lakhs > 100) return false;
      if (maxPriceFilter === 'Above 1 Crore' && lakhs <= 100) return false;
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

  // Clean Slug Generator
  const generateSlugFromPlotNumber = (plotNumber: string, plotId: string) => {
    const cleanNo = (plotNumber || '').replace(/^plot\s*#?/gi, '').trim();
    if (cleanNo) {
      const sanitized = cleanNo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      return `property-plot-${sanitized}`;
    }
    return `property-${plotId || 'plot-105'}`;
  };

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingPlot(null);
    const defaultProj = projects[0]?.id || '';
    const newPlotId = getNextSequentialPlotId(plots);
    const initialSlug = `property-${newPlotId}`;

    setFormData({
      id: newPlotId,
      project_id: defaultProj,
      title: '',
      slug: initialSlug,
      type: 'Plot',
      category: 'Sale',
      locality: '',
      road_corridor: '',
      taluk: 'Central',
      district: 'Trichy',
      plot_number: '',
      length_ft: '' as any,
      width_ft: '' as any,
      area_sqft: '' as any,
      facing: '',
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
      latitude: '',
      longitude: '',
      primary_image_url: '',
      gallery_images: []
    });
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (plot: Plot) => {
    setEditingPlot(plot);
    const cleanNum = (plot.plot_number || '').replace(/^plot\s*#?/gi, '').trim();
    const formattedTitle = plot.title && !plot.title.includes('#Plot #') ? plot.title : (cleanNum ? `Plot #${cleanNum}` : 'Plot Entry');
    const autoSlug = plot.slug && !plot.slug.includes('property-Plot #04') ? plot.slug : generateSlugFromPlotNumber(cleanNum, plot.id);

    setFormData({
      ...plot,
      id: plot.id,
      title: formattedTitle,
      slug: autoSlug,
      plot_number: cleanNum ? `Plot #${cleanNum}` : plot.plot_number || '',
      type: plot.type || 'Plot',
      category: plot.category || 'Sale',
      locality: plot.locality || '',
      road_corridor: plot.road_corridor || '',
      taluk: plot.taluk || 'Central',
      district: plot.district || 'Trichy',
      length_ft: plot.length_ft || 40,
      width_ft: plot.width_ft || 30,
      area_sqft: plot.area_sqft || 1200,
      facing: plot.facing || 'North',
      approval_status: plot.approval_status || 'DTCP Approved',
      price_per_sqft: plot.price_per_sqft || 1500,
      total_price_lakhs: plot.total_price_lakhs || 18.0,
      price: plot.price || (plot.total_price_lakhs ? plot.total_price_lakhs * 100000 : 1800000),
      currency: plot.currency || 'INR',
      status: plot.status || 'Available',
      listing_visibility: plot.listing_visibility || 'Publish to Website & CRM',
      amenities: plot.amenities || 'Clear Patta Title, Tar Road',
      description: plot.description || '',
      meta_title: plot.meta_title || formattedTitle || '',
      meta_description: plot.meta_description || plot.description || '',
      video_url: plot.video_url || '',
      latitude: plot.latitude || '10.786999',
      longitude: plot.longitude || '79.137827',
      primary_image_url: plot.primary_image_url || DEFAULT_PROPERTY_IMAGE,
      gallery_images: plot.gallery_images || []
    });
    setViewMode('form');
  };

  const handleOpenView = (plot: Plot) => {
    setViewingPlot(plot);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = async (plotId: string, newStatus: string) => {
    try {
      await api.updatePlot(plotId, { status: newStatus });
      setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, status: newStatus as any } : p)));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Plot Number',
      'Project ID',
      'Type',
      'Category',
      'Area Sq.Ft',
      'Facing',
      'Price (Lakhs)',
      'Status',
      'Visibility'
    ];
    const rows = plots.map((p) => [
      p.id,
      `"${p.title || ''}"`,
      `"${p.plot_number}"`,
      p.project_id,
      p.type || 'Plot',
      p.category || 'Sale',
      p.area_sqft,
      p.facing,
      p.total_price_lakhs || (p.price ? p.price / 100000 : 18),
      p.status,
      `"${p.listing_visibility || 'Publish to Website & CRM'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sree_hari_properties_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV Handler
  const handleSampleCSV = () => {
    const sampleText = `Plot Number,Title,Type,Category,Locality,Area Sq.Ft,Facing,Price Lakhs,Status
Plot 101,"Premium Plot in Medical College Road",Plot,Sale,"Sundaram Nagar",1200,North,18.0,Available
Plot 102,"Corner Villa Plot in Park Avenue",Villa,Sale,"Thiruverumbur",1800,North-East,27.0,Available`;

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
          alert(`Captured Location: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        },
        (err) => {
          alert('Could not capture location: ' + err.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        plot_number: formData.plot_number || 'Plot',
        title: formData.title || `Plot #${formData.plot_number}`,
        slug: formData.slug || `property-${formData.plot_number}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        primary_image_url: formData.primary_image_url || DEFAULT_PROPERTY_IMAGE
      };

      if (editingPlot) {
        await api.updatePlot(editingPlot.id, payload);
      } else {
        await api.createPlot(payload);
      }
      setViewMode('grid');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Plot operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property entry?')) return;
    try {
      await api.deletePlot(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plot');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* VIEW MODE 1 & 2: GRID / TABLE INVENTORY CATALOG */}
      {(viewMode === 'grid' || viewMode === 'table') && (
        <>
          {/* Header Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>Plots Inventory Suite</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1 flex items-center gap-3">
                <Building2 className="w-7 h-7 text-emerald-400" />
                <span>Plots Inventory</span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Browse, list, and manage your plot catalog.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5 text-teal-400" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleSampleCSV}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sample CSV</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>Add plot</span>
              </button>
            </div>
          </div>

          {/* FILTERS MATCHING REFERENCE UI */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Search */}
              <div className="md:col-span-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. All Dates */}
              <div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="All Dates">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
              </div>

              {/* 3. All Categories */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>

              {/* 4. All Statuses */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Sold">Sold</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-800/60">
              {/* 6. All Visibility */}
              <div>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="All Visibility">All Visibility</option>
                  <option value="Publish to Website & CRM">Publish to Website & CRM</option>
                  <option value="CRM Only">CRM Only</option>
                </select>
              </div>

              {/* 7. Max Price (All) */}
              <div>
                <select
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="Max price (All)">Max price (All)</option>
                  <option value="Under 25 Lakhs">Under 25 Lakhs</option>
                  <option value="Under 50 Lakhs">Under 50 Lakhs</option>
                  <option value="Under 1 Crore">Under 1 Crore</option>
                  <option value="Above 1 Crore">Above 1 Crore</option>
                </select>
              </div>

              {/* View Layout Toggle (Grid vs Table) */}
              <div className="md:col-span-2 flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400 font-medium">Layout View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg border transition-all ${
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
                  className={`p-2 rounded-lg border transition-all ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center py-12 text-slate-500">
                  Loading properties catalog...
                </div>
              ) : filteredPlots.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  No property listings found matching the selected filters.
                </div>
              ) : (
                filteredPlots.map((plot) => {
                  const priceLakhs = plot.total_price_lakhs || (plot.price ? plot.price / 100000 : 18);
                  const displayImage = plot.primary_image_url || DEFAULT_PROPERTY_IMAGE;

                  return (
                    <div
                      key={plot.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col group"
                    >
                      {/* Top Property Image with Badges */}
                      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={displayImage}
                          alt={plot.title || 'Property'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40"></div>

                        {/* Badges Stack */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            🛡️ FREE AD
                          </span>
                          <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
                            🌐 PUBLIC
                          </span>
                        </div>

                        {/* Availability Pill */}
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow ${
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
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Visibility Banner */}
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Live on Public Website & CRM</span>
                          </div>

                          {/* Property Title */}
                          <h3 className="text-sm font-extrabold text-white line-clamp-2 hover:text-emerald-400 transition-colors">
                            {plot.title || `Plot #${plot.plot_number}`}
                          </h3>

                          {/* Locality & Type line */}
                          <p className="text-slate-400 text-xs">
                            {plot.locality || plot.district ? [plot.locality, plot.district].filter(Boolean).join(', ') : 'Plot Layout'} • Plot • {plot.category || 'Sale'}
                          </p>

                          {/* Listing Desk tag */}
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded-lg w-fit">
                            <Phone className="w-3 h-3" />
                            <span>Listing Desk: Sree Hari Realty (+91 98424 01991)</span>
                          </div>

                          {/* Pricing & Inquiries Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            {priceLakhs > 0 ? (
                              <div className="text-lg font-black text-emerald-400">
                                ₹ {priceLakhs.toFixed(2)} Lakhs
                              </div>
                            ) : (
                              <div className="text-xs font-semibold text-slate-400">
                                Price on Request
                              </div>
                            )}
                            <div className="flex items-center gap-1 bg-slate-950 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                              <MessageSquare className="w-3 h-3 text-slate-400" />
                              <span>0 Inquiries</span>
                            </div>
                          </div>

                          {/* Plot Specifications */}
                          <div className="text-[11px] text-slate-400 pt-1">
                            {[
                              plot.length_ft && plot.width_ft ? `${plot.length_ft} x ${plot.width_ft} Ft` : null,
                              plot.area_sqft ? `${plot.area_sqft} Sq.Ft` : null,
                              plot.facing || null,
                              plot.approval_status || null
                            ].filter(Boolean).join(' • ') || 'Land Plot Entry'}
                          </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          {/* Quick Status Select */}
                          <select
                            value={plot.status}
                            onChange={(e) => handleStatusChange(plot.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                          >
                            <option value="Available">Available</option>
                            <option value="Booked">Booked</option>
                            <option value="Sold">Sold</option>
                            <option value="Blocked">Blocked</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenView(plot)}
                              title="View Details"
                              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(plot)}
                              title="Edit Property"
                              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(plot.id)}
                              title="Delete Property"
                              className="p-2 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 transition-colors border border-rose-800/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
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
                      <th className="px-6 py-4">Title / Plot No</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Dimensions & Area</th>
                      <th className="px-6 py-4">Facing & Approval</th>
                      <th className="px-6 py-4">Rate / Sq.Ft</th>
                      <th className="px-6 py-4">Total Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          Loading property inventory...
                        </td>
                      </tr>
                    ) : filteredPlots.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No property/plot records found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPlots.map((plot) => (
                        <tr key={plot.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-white text-sm">
                            <div className="flex items-center gap-2">
                              <span>{plot.title || `#${plot.plot_number}`}</span>
                              {plot.type && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-300 rounded">
                                  {plot.type}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              Plot: #{plot.plot_number} {plot.locality ? `• ${plot.locality}` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{plot.project_name || 'Township Project'}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {plot.length_ft || 40} x {plot.width_ft || 30} Ft ({plot.area_sqft || 1200} Sq.Ft)
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-medium">
                            <div>{plot.facing || 'North'}</div>
                            <div className="text-[10px] text-emerald-400">{plot.approval_status || 'DTCP Approved'}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">₹{plot.price_per_sqft || 1500}</td>
                          <td className="px-6 py-4 text-emerald-400 font-bold">
                            ₹{plot.total_price_lakhs || (plot.price ? (plot.price / 100000).toFixed(2) : '18.0')} Lakhs
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                plot.status === 'Available'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                  : plot.status === 'Booked'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              }`}
                            >
                              {plot.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenView(plot)}
                                title="View Details"
                                className="p-1.5 rounded bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 transition-colors border border-blue-800/40"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(plot)}
                                title="Edit Property"
                                className="p-1.5 rounded bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 transition-colors border border-amber-800/40"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(plot.id)}
                                title="Delete Property"
                                className="p-1.5 rounded bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 transition-colors border border-rose-800/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 3: DEDICATED FULL VERTICAL SCROLLABLE FORM */}
      {viewMode === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
          {/* Top Back Header */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-3.5 py-1.5 rounded-lg transition-all w-fit mb-3"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plots Inventory</span>
              </button>

              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                PLOTS INVENTORY FORM
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {editingPlot ? 'Edit Plot Entry' : 'Add Plot Entry'}
              </h2>
              <p className="text-slate-400 text-xs">
                New listing — enter title, category, price, photos, and location details
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60"
              >
                Save Plot
              </button>
            </div>
          </div>

          {/* SECTION 1: BASICS */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>BASICS</span>
              </h3>
            </div>

            {/* Read-Only Auto-Generated Plot ID & Property Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center justify-between">
                  <span>Plot ID</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded">🔒 Auto-Generated (Read Only)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.id || ''}
                  className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center justify-between">
                  <span>Property Slug</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded">🔒 Auto-Generated (Read Only)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.slug || ''}
                  className="w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot #04 - Gated Community Plot"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: val,
                      meta_title: val
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Project *</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Plot Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot #04 or 102"
                  value={formData.plot_number || ''}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    const cleanNum = rawVal.replace(/^plot\s*#?/gi, '').trim();
                    const autoTitle = cleanNum ? `Plot #${cleanNum}` : rawVal;
                    const autoSlug = generateSlugFromPlotNumber(cleanNum, formData.id || 'plot-105');

                    setFormData((prev) => ({
                      ...prev,
                      plot_number: rawVal,
                      title: prev.title ? prev.title : autoTitle,
                      slug: autoSlug
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Type (Text Input) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Residential Plot, Commercial Plot, Farmland"
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Area / Locality *</label>
                <input
                  type="text"
                  placeholder="e.g. New Bus Stand Extension, Medical College Road"
                  value={formData.locality || ''}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Road / Prime Corridor</label>
                <input
                  type="text"
                  placeholder="e.g. Trichy Main Highway Corridor"
                  value={formData.road_corridor || ''}
                  onChange={(e) => setFormData({ ...formData, road_corridor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Taluk</label>
                <select
                  value={formData.taluk || ''}
                  onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">- Select Taluk -</option>
                  <option value="Central">Central</option>
                  <option value="Pattukkottai">Pattukkottai</option>
                  <option value="Kumbakonam">Kumbakonam</option>
                  <option value="Orathanadu">Orathanadu</option>
                  <option value="Thiruvaiyaru">Thiruvaiyaru</option>
                  <option value="Budalur">Budalur</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">District *</label>
                <select
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">- Select District -</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Pudukkottai">Pudukkottai</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Facing</label>
                <select
                  value={formData.facing || ''}
                  onChange={(e) => setFormData({ ...formData, facing: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">- Select Facing -</option>
                  <option value="North">North</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="South">South</option>
                  <option value="North-East">North-East Corner</option>
                  <option value="North-West">North-West Corner</option>
                  <option value="South-East">South-East Corner</option>
                  <option value="South-West">South-West Corner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Length (Ft)</label>
                <input
                  type="number"
                  value={formData.length_ft}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    const area = l * (formData.width_ft || 0);
                    const lakhs = (area * (formData.price_per_sqft || 1500)) / 100000;
                    setFormData({
                      ...formData,
                      length_ft: l,
                      area_sqft: area,
                      total_price_lakhs: Number(lakhs.toFixed(2)),
                      price: lakhs * 100000
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Width (Ft)</label>
                <input
                  type="number"
                  value={formData.width_ft}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    const area = (formData.length_ft || 0) * w;
                    const lakhs = (area * (formData.price_per_sqft || 1500)) / 100000;
                    setFormData({
                      ...formData,
                      width_ft: w,
                      area_sqft: area,
                      total_price_lakhs: Number(lakhs.toFixed(2)),
                      price: lakhs * 100000
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Area (sqft)</label>
                <input
                  type="number"
                  readOnly
                  value={formData.area_sqft}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Approval Status (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DTCP Approved, RERA Approved"
                  value={formData.approval_status}
                  onChange={(e) => setFormData({ ...formData, approval_status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & AVAILABILITY */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>PRICING & AVAILABILITY</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Price / Sq.Ft (₹)</label>
                <input
                  type="number"
                  value={formData.price_per_sqft}
                  onChange={(e) => {
                    const rate = Number(e.target.value);
                    const lakhs = ((formData.area_sqft || 0) * rate) / 100000;
                    setFormData({
                      ...formData,
                      price_per_sqft: rate,
                      total_price_lakhs: Number(lakhs.toFixed(2)),
                      price: lakhs * 100000
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Price * (e.g. 13500000)</label>
                <input
                  type="number"
                  placeholder="e.g. 13500000"
                  value={formData.price}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setFormData({ ...formData, price: p, total_price_lakhs: Number((p / 100000).toFixed(2)) });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Total Price (Lakhs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_price_lakhs}
                  onChange={(e) => {
                    const l = Number(e.target.value);
                    setFormData({ ...formData, total_price_lakhs: l, price: l * 100000 });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-bold focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Availability *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Sold">Sold</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  Listing Visibility (Post Target) *
                </label>
                <select
                  value={formData.listing_visibility}
                  onChange={(e) => setFormData({ ...formData, listing_visibility: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                >
                  <option value="Publish to Website & CRM">Publish to Website & CRM</option>
                  <option value="CRM Only">CRM Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: DETAILS */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>DETAILS</span>
              </h3>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Pool, Gym, Parking, Clear Patta Title"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5">Description</label>
              <textarea
                rows={4}
                placeholder="Enter detailed property description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                    meta_description: e.target.value.substring(0, 160)
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 4: SEARCH ENGINE OPTIMIZATION (SEO METADATA) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>SEARCH ENGINE OPTIMIZATION (SEO METADATA)</span>
              </h3>
              <span className="text-[10px] text-slate-500">Defaults will auto-fill from Title & Description if left blank</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 text-xs font-semibold">Meta Title</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(formData.meta_title || '').length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Premium Villa in Anna Nagar"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Optimal length: 50–60 characters</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 text-xs font-semibold">Meta Description</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(formData.meta_description || '').length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Enter meta description summary..."
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Optimal length: 150–160 characters</p>
              </div>
            </div>

            {/* Google Snippet Box */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                GOOGLE SEARCH SNIPPET PREVIEW
              </div>
              <div className="text-base font-semibold text-blue-400 hover:underline cursor-pointer">
                {formData.meta_title || formData.title || 'Property Title'} | Sree Hari Realty
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                https://www.sreeharirealty.com/plots/{formData.slug || 'property-slug'}
              </div>
              <div className="text-xs text-slate-300">
                {formData.meta_description ||
                  formData.description ||
                  'Detailed property listing and Patta verified estate on Sree Hari Realty.'}
              </div>
            </div>
          </div>

          {/* SECTION 5: MEDIA & LOCATION */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>MEDIA & LOCATION</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                  YouTube / Facebook Video Links
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Upload Video File(s)</label>
                <div className="border-2 border-dashed border-slate-800 bg-slate-950/60 hover:bg-slate-950 p-4 rounded-xl text-center cursor-pointer transition-colors">
                  <Video className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-300">Upload Video (.mp4 / .mov)</span>
                </div>
              </div>
            </div>

            {/* Geolocation */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold text-white flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>GPS Map Coordinates</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/50"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use my current location</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Latitude</label>
                  <input
                    type="text"
                    placeholder="e.g. 10.786999"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1.5">Longitude</label>
                  <input
                    type="text"
                    placeholder="e.g. 79.137827"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Primary Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or leave blank for default image"
                  value={formData.primary_image_url}
                  onChange={(e) => setFormData({ ...formData, primary_image_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Upload Gallery Photos</label>
                <div className="border-2 border-dashed border-slate-800 bg-slate-950/60 hover:border-emerald-500/60 p-8 rounded-xl text-center cursor-pointer transition-colors">
                  <ImageIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    Click to Upload Property Images (.png / .jpg)
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">High resolution site layout & boundary photos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-6 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-end gap-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60"
            >
              Save Plot
            </button>
          </div>
        </form>
      )}

      {/* VIEW MODAL */}
      {isViewModalOpen && viewingPlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {viewingPlot.title || `Plot #${viewingPlot.plot_number}`}
                </h3>
                <p className="text-xs text-slate-400">
                  {viewingPlot.project_name} • Plot #{viewingPlot.plot_number}
                </p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Property Hero Image Preview */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={viewingPlot.primary_image_url || DEFAULT_PROPERTY_IMAGE}
                alt={viewingPlot.title || 'Property'}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded">
                {viewingPlot.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Type</span>
                <div className="text-white font-bold text-sm mt-0.5">{viewingPlot.type || 'Plot'}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Dimensions</span>
                <div className="text-white font-bold text-sm mt-0.5">
                  {viewingPlot.length_ft || 40} x {viewingPlot.width_ft || 30} Ft
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Area (sqft)</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{viewingPlot.area_sqft || 1200} Sq.Ft</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Facing</span>
                <div className="text-white font-bold text-sm mt-0.5">{viewingPlot.facing || 'North'}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Rate / Sq.Ft</span>
                <div className="text-white font-bold text-sm mt-0.5">₹{viewingPlot.price_per_sqft || 1500}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Total Price</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">
                  ₹{viewingPlot.total_price_lakhs || '18.0'} Lakhs
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Locality & Corridor</span>
                <div className="text-slate-200">
                  {viewingPlot.locality || 'Medical College Road Corridor'}, {viewingPlot.district || 'City'}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Amenities</span>
                <div className="text-slate-200">{viewingPlot.amenities || 'Clear Patta Title, Tar Road'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:from-emerald-500 hover:to-teal-400"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
