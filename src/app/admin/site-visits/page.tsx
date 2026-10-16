'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { SiteVisit, Plot } from '@/lib/types';
import {
  CalendarCheck,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  X,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Building2,
  Calendar,
  AlertCircle,
  Filter,
  Check,
  XCircle,
  ChevronDown
} from 'lucide-react';

const STATUSES = ['All Statuses', 'Requested', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdminSiteVisitsPage() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    pendingRequests: 0,
    confirmedVisits: 0,
    completedVisits: 0,
    pickupNeededCount: 0
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [plotFilter, setPlotFilter] = useState('All Plots');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Plot Combobox State
  const [isPlotDropdownOpen, setIsPlotDropdownOpen] = useState(false);
  const plotDropdownRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SiteVisit>>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    project_id: '',
    project_name: '',
    visit_date: '',
    visit_time: '10:00',
    preferred_plot_size: '',
    pickup_needed: false,
    pickup_location: '',
    status: 'Requested',
    assigned_staff: 'Sales Team',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plotDropdownRef.current && !plotDropdownRef.current.contains(event.target as Node)) {
        setIsPlotDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchLatestPlots() {
    try {
      const res = await api.getPlots();
      if (res && res.success && Array.isArray(res.data)) {
        setPlots(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to load plots inventory:', err);
    }
    return [];
  }

  async function loadData() {
    setLoading(true);
    try {
      const [visitsRes, plotsRes, statsRes] = await Promise.all([
        api.getSiteVisits(),
        api.getPlots(),
        api.getSiteVisitStats()
      ]);

      if (visitsRes && visitsRes.success && Array.isArray(visitsRes.data)) {
        setSiteVisits(visitsRes.data);
      } else {
        setSiteVisits([]);
      }

      if (plotsRes && plotsRes.success && Array.isArray(plotsRes.data)) {
        setPlots(plotsRes.data);
      }

      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load site visits:', err);
      showToast('Error loading site visit requests');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function handleOpenCreate() {
    await fetchLatestPlots();
    setEditingVisit(null);
    setIsPlotDropdownOpen(false);
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      project_id: '',
      project_name: '',
      visit_date: new Date().toISOString().split('T')[0],
      visit_time: '10:00',
      preferred_plot_size: '',
      pickup_needed: false,
      pickup_location: '',
      status: 'Requested',
      assigned_staff: 'Sales Team',
      notes: ''
    });
    setIsFormModalOpen(true);
  }

  async function handleOpenEdit(visit: SiteVisit) {
    await fetchLatestPlots();
    setEditingVisit(visit);
    setIsPlotDropdownOpen(false);
    setFormData({
      customer_name: visit.customer_name || '',
      customer_phone: (visit.customer_phone || '').replace(/\D/g, '').slice(0, 10),
      customer_email: visit.customer_email || '',
      project_id: visit.project_id || '',
      project_name: visit.project_name || '',
      visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
      visit_time: visit.visit_time || '10:00',
      preferred_plot_size: visit.preferred_plot_size || '',
      pickup_needed: Boolean(visit.pickup_needed),
      pickup_location: visit.pickup_location || '',
      status: visit.status || 'Requested',
      assigned_staff: visit.assigned_staff || 'Sales Team',
      notes: visit.notes || ''
    });
    setIsFormModalOpen(true);
  }

  async function handleQuickStatusChange(visit: SiteVisit, newStatus: SiteVisit['status']) {
    try {
      const res = await api.updateSiteVisit(visit.id, { status: newStatus });
      if (res && res.success) {
        showToast(`Site visit status updated to ${newStatus}`);
        await loadData();
      } else {
        showToast(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      showToast('Status update error: ' + err.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone || !formData.visit_date) {
      alert('Please fill customer name, phone number, and visit date');
      return;
    }

    try {
      if (editingVisit && editingVisit.id) {
        const res = await api.updateSiteVisit(editingVisit.id, formData);
        if (res && res.success) {
          showToast('Site visit updated successfully');
        } else {
          showToast(res.message || 'Failed to update site visit');
        }
      } else {
        const res = await api.createSiteVisit(formData);
        if (res && res.success) {
          showToast('New site visit scheduled successfully');
        } else {
          showToast(res.message || 'Failed to schedule site visit');
        }
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('Error saving site visit: ' + err.message);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      const res = await api.deleteSiteVisit(deletingId);
      if (res && res.success) {
        showToast('Site visit record deleted');
        await loadData();
      } else {
        showToast(res.message || 'Failed to delete site visit');
      }
    } catch (err: any) {
      showToast('Delete error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Filter site visits
  const filteredVisits = siteVisits.filter((visit) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      visit.customer_name.toLowerCase().includes(q) ||
      visit.customer_phone.includes(q) ||
      (visit.customer_email && visit.customer_email.toLowerCase().includes(q)) ||
      (visit.project_name && visit.project_name.toLowerCase().includes(q)) ||
      (visit.pickup_location && visit.pickup_location.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'All Statuses' || visit.status === statusFilter;

    const matchesPlot =
      plotFilter === 'All Plots' ||
      (visit.project_name && visit.project_name.toLowerCase().includes(plotFilter.toLowerCase())) ||
      visit.project_id === plotFilter;

    return matchesSearch && matchesStatus && matchesPlot;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Site Visit Manager
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer site visit bookings, cab pickup requests & plot tour schedules
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 border border-emerald-400/30 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Schedule Site Visit
        </button>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <p className="text-2xl font-bold text-white">{stats.totalVisits}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">New Requests</span>
          <p className="text-2xl font-bold text-amber-400">{stats.pendingRequests}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">Confirmed Visits</span>
          <p className="text-2xl font-bold text-blue-400">{stats.confirmedVisits}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Completed Tours</span>
          <p className="text-2xl font-bold text-emerald-400">{stats.completedVisits}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Pickups Needed
          </span>
          <p className="text-2xl font-bold text-purple-400">{stats.pickupNeededCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, phone, plot, pickup point..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={plotFilter}
            onChange={(e) => setPlotFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="All Plots">All Plots</option>
            {plots.map((p) => {
              const label = `${p.plot_number || 'Plot'}${p.title ? ` - ${p.title}` : ''}`;
              return (
                <option key={p.id} value={p.plot_number || p.title || p.id}>
                  {label} ({p.area_sqft} Sq.Ft)
                </option>
              );
            })}
          </select>

          {(searchQuery || statusFilter !== 'All Statuses' || plotFilter !== 'All Plots') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Statuses');
                setPlotFilter('All Plots');
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-xs text-slate-400 px-1">
        Showing <strong className="text-emerald-400">{filteredVisits.length}</strong> of{' '}
        <strong className="text-slate-200">{siteVisits.length}</strong> site visit requests
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No site visits found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When customers book a site visit on your website, their booking request will appear here automatically.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Schedule Manual Visit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                {/* Status & Project Row */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                      visit.status === 'Confirmed'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : visit.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : visit.status === 'Cancelled'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {visit.status || 'Requested'}
                  </span>

                  <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 max-w-[200px] truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="truncate">{visit.project_name || 'Plot Not Assigned'}</span>
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400 shrink-0" /> {visit.customer_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <a
                      href={`tel:${visit.customer_phone}`}
                      className="hover:text-emerald-400 font-mono flex items-center gap-1 text-emerald-300"
                    >
                      <Phone className="w-3.5 h-3.5" /> {visit.customer_phone}
                    </a>
                    {visit.customer_email && (
                      <span className="flex items-center gap-1 text-slate-400 truncate max-w-[180px]">
                        <Mail className="w-3.5 h-3.5" /> {visit.customer_email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Pickup Box */}
                <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-emerald-400" /> {visit.visit_date}
                    </span>
                    <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> {visit.visit_time || '10:00 AM'}
                    </span>
                  </div>

                  {visit.pickup_needed ? (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-purple-300 font-medium">
                      <Car className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="truncate">Pickup: {visit.pickup_location || 'Customer Location'}</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
                      Direct customer arrival (No cab pickup needed)
                    </div>
                  )}
                </div>

                {/* Staff & Notes */}
                {visit.notes && (
                  <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50">
                    &ldquo;{visit.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {visit.status !== 'Confirmed' && (
                    <button
                      onClick={() => handleQuickStatusChange(visit, 'Confirmed')}
                      title="Confirm Site Visit"
                      className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Confirm
                    </button>
                  )}
                  {visit.status !== 'Completed' && (
                    <button
                      onClick={() => handleQuickStatusChange(visit, 'Completed')}
                      title="Mark Completed"
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(visit)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(visit.id)}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT SITE VISIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingVisit ? 'Edit Site Visit Request' : 'Schedule New Customer Site Visit'}
                </h3>
                <p className="text-xs text-slate-400">Manage customer tour date, pickup details & staff assignment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Customer Name <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. R. Vignesh Kumar"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Phone Number <span className="text-emerald-500">* (10 Digits)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.customer_phone || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, customer_phone: val });
                    }}
                    placeholder="10-digit number"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.customer_email || ''}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Plot Selection with Search / Type from Plot Inventory */}
                <div className="space-y-1.5 relative" ref={plotDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Plot (Select from Inventory or Type)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {plots.length} in Plot Inventory
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={formData.project_name || ''}
                      onFocus={() => {
                        fetchLatestPlots();
                        setIsPlotDropdownOpen(true);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = plots.find(
                          (p) =>
                            `${p.plot_number || ''}${p.title ? ` - ${p.title}` : ''}`.toLowerCase() === val.toLowerCase() ||
                            (p.plot_number && p.plot_number.toLowerCase() === val.toLowerCase())
                        );
                        setFormData({
                          ...formData,
                          project_name: val,
                          project_id: matched ? matched.id : '',
                          preferred_plot_size: matched && matched.area_sqft ? `${matched.area_sqft} Sq.Ft` : formData.preferred_plot_size
                        });
                        setIsPlotDropdownOpen(true);
                      }}
                      placeholder="Type plot number or click arrow to choose..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        if (!isPlotDropdownOpen) fetchLatestPlots();
                        setIsPlotDropdownOpen(!isPlotDropdownOpen);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Toggle plot dropdown"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isPlotDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                    </button>
                  </div>

                  {/* Combobox Dropdown Menu */}
                  {isPlotDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-md">
                      {plots.filter((p) => {
                        const query = (formData.project_name || '').toLowerCase().trim();
                        if (!query) return true;
                        const num = (p.plot_number || '').toLowerCase();
                        const tit = (p.title || '').toLowerCase();
                        const proj = (p.project_name || '').toLowerCase();
                        const loc = (p.locality || '').toLowerCase();
                        return num.includes(query) || tit.includes(query) || proj.includes(query) || loc.includes(query);
                      }).length === 0 ? (
                        <div className="p-3 text-center">
                          <p className="text-xs text-slate-400">
                            No exact plot found in inventory matching &ldquo;{formData.project_name}&rdquo;
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsPlotDropdownOpen(false)}
                            className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-medium rounded-lg transition-colors"
                          >
                            Use &ldquo;{formData.project_name}&rdquo; as custom plot
                          </button>
                        </div>
                      ) : (
                        plots
                          .filter((p) => {
                            const query = (formData.project_name || '').toLowerCase().trim();
                            if (!query) return true;
                            const num = (p.plot_number || '').toLowerCase();
                            const tit = (p.title || '').toLowerCase();
                            const proj = (p.project_name || '').toLowerCase();
                            const loc = (p.locality || '').toLowerCase();
                            return num.includes(query) || tit.includes(query) || proj.includes(query) || loc.includes(query);
                          })
                          .map((plot) => {
                            const displayLabel = `${plot.plot_number || 'Plot'}${plot.title ? ` - ${plot.title}` : ''}`;
                            const isSelected = formData.project_name === displayLabel || formData.project_id === plot.id;
                            return (
                              <button
                                key={plot.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    project_name: displayLabel,
                                    project_id: plot.id,
                                    preferred_plot_size: plot.area_sqft ? `${plot.area_sqft} Sq.Ft` : formData.preferred_plot_size
                                  });
                                  setIsPlotDropdownOpen(false);
                                }}
                                className={`w-full text-left p-3 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-3 ${
                                  isSelected ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-white">
                                      {plot.plot_number || 'Plot'}
                                    </span>
                                    {plot.title && (
                                      <span className="text-[11px] text-slate-300 truncate">
                                        {plot.title}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    {plot.project_name && <span>{plot.project_name}</span>}
                                    {plot.project_name && <span>•</span>}
                                    <span>{plot.area_sqft} Sq.Ft</span>
                                    {plot.facing && (
                                      <>
                                        <span>•</span>
                                        <span>{plot.facing} Facing</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                      plot.status === 'Available'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : plot.status === 'Booked'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    }`}
                                  >
                                    {plot.status || 'Available'}
                                  </span>
                                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                                </div>
                              </button>
                            );
                          })
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Visit Date <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.visit_date || ''}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Preferred Visit Time <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.visit_time && formData.visit_time.includes(':') ? formData.visit_time : '10:00'}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Status</label>
                  <select
                    value={formData.status || 'Requested'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Requested">Requested (New Web Booking)</option>
                    <option value="Confirmed">Confirmed (Car & Staff Assigned)</option>
                    <option value="Completed">Completed (Tour Done)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Assigned Staff / Driver</label>
                  <input
                    type="text"
                    value={formData.assigned_staff || 'Sales Team'}
                    onChange={(e) => setFormData({ ...formData, assigned_staff: e.target.value })}
                    placeholder="e.g. Driver Ramesh / Sales Team"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Pickup Option Switch */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-purple-400" /> Cab Pickup Service
                    </label>
                    <p className="text-[11px] text-slate-400">Provide guided pickup & drop for customer</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={Boolean(formData.pickup_needed)}
                    onChange={(e) => setFormData({ ...formData, pickup_needed: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {formData.pickup_needed && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-xs font-medium text-slate-300">Pickup Location / Landmark</label>
                    <input
                      type="text"
                      value={formData.pickup_location || ''}
                      onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                      placeholder="e.g. Central Railway Station / Airport"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Special Requirements & Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Looking for East facing plot, family visiting together..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-medium rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Site Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Delete Site Visit Record?</h3>
              <p className="text-xs text-slate-400">
                This action will remove this site visit booking from the CRM database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
