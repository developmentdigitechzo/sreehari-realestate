'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SiteVisit, Plot, Project, CrmLead, StaffUser } from '@/lib/types';
import {
  CalendarCheck,
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Check
} from 'lucide-react';

const STATUSES = ['All Statuses', 'Requested', 'Confirmed', 'Completed', 'Cancelled'];

export default function AdminSiteVisitsPage() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    pendingRequests: 0,
    confirmedVisits: 0,
    completedVisits: 0
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [projectFilter, setProjectFilter] = useState('All Projects');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    status: 'Requested',
    assigned_staff: 'Sales Team',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [visitsRes, plotsRes, projectsRes, leadsRes, staffRes] = await Promise.all([
        api.getSiteVisits(),
        api.getPlots().catch(() => ({ data: [] })),
        api.getProjects().catch(() => ({ data: [] })),
        api.getCrmLeads().catch(() => ({ data: [] })),
        api.getStaffList().catch(() => ({ data: [] }))
      ]);

      let visitsList: SiteVisit[] = [];
      if (visitsRes && visitsRes.success && Array.isArray(visitsRes.data)) {
        visitsList = visitsRes.data;
        setSiteVisits(visitsList);
      } else {
        setSiteVisits([]);
      }

      if (plotsRes && plotsRes.success && Array.isArray(plotsRes.data)) {
        setPlots(plotsRes.data);
      }

      if (projectsRes && projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
      }

      if (leadsRes && leadsRes.success && Array.isArray(leadsRes.data)) {
        setCrmLeads(leadsRes.data);
      }

      if (staffRes && staffRes.success && Array.isArray(staffRes.data)) {
        setStaffList(staffRes.data);
      }

      // Compute statistics dynamically
      const totalVisits = visitsList.length;
      const pendingRequests = visitsList.filter((v) => (v.status || '').toLowerCase() === 'requested').length;
      const confirmedVisits = visitsList.filter((v) => (v.status || '').toLowerCase() === 'confirmed').length;
      const completedVisits = visitsList.filter((v) => (v.status || '').toLowerCase() === 'completed').length;

      setStats({
        totalVisits,
        pendingRequests,
        confirmedVisits,
        completedVisits
      });
    } catch (err) {
      console.error('Failed to load site visits data:', err);
      showToast('Error loading site visit requests');
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleOpenCreate() {
    setEditingVisit(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      project_id: projects[0]?.id || '',
      project_name: projects[0]?.name || projects[0]?.title || '',
      visit_date: new Date().toISOString().split('T')[0],
      visit_time: '10:00',
      preferred_plot_size: '',
      status: 'Requested',
      assigned_staff: 'Sales Team',
      notes: ''
    });
    setIsFormModalOpen(true);
  }

  function handleOpenEdit(visit: SiteVisit) {
    setEditingVisit(visit);
    setFormData({
      customer_name: visit.customer_name || '',
      customer_phone: (visit.customer_phone || '').replace(/\D/g, '').slice(-10),
      customer_email: visit.customer_email || '',
      project_id: visit.project_id || '',
      project_name: visit.project_name || '',
      visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
      visit_time: visit.visit_time || '10:00',
      preferred_plot_size: visit.preferred_plot_size || '',
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
      const payload = {
        ...formData,
        pickup_needed: false,
        pickup_location: ''
      };

      if (editingVisit && editingVisit.id) {
        const res = await api.updateSiteVisit(editingVisit.id, payload);
        if (res && res.success) {
          showToast('Site visit updated successfully');
        } else {
          showToast(res.message || 'Failed to update site visit');
        }
      } else {
        const res = await api.createSiteVisit(payload);
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

  // Filtered Site Visits
  const filteredVisits = siteVisits.filter((visit) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      visit.customer_name.toLowerCase().includes(q) ||
      visit.customer_phone.includes(q) ||
      (visit.customer_email && visit.customer_email.toLowerCase().includes(q)) ||
      (visit.project_name && visit.project_name.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'All Statuses' || (visit.status || '').toLowerCase() === statusFilter.toLowerCase();

    const matchesProject =
      projectFilter === 'All Projects' ||
      (visit.project_name && visit.project_name.toLowerCase().includes(projectFilter.toLowerCase())) ||
      visit.project_id === projectFilter;

    return matchesSearch && matchesStatus && matchesProject;
  });

  // Filtered Plots for the current modal selection
  const modalPlots = formData.project_id
    ? plots.filter((p) => p.project_id === formData.project_id || (p.project_name && formData.project_name && p.project_name.toLowerCase().includes(formData.project_name.toLowerCase())))
    : plots;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Site Visit Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customer plot tour bookings, calendar schedules & staff assignments
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Schedule Site Visit
        </button>
      </div>

      {/* Stat Cards Row (4 Columns - Clean & Balanced) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Total Bookings</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVisits}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider dark:text-amber-400">New Requests</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingRequests}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider dark:text-blue-400">Confirmed Visits</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.confirmedVisits}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider dark:text-emerald-400">Completed Tours</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedVisits}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name, phone, project..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
          >
            <option value="All Projects">All Projects</option>
            {projects.map((p) => {
              const label = p.name || p.title || 'Project';
              return (
                <option key={p.id} value={label}>
                  {label}
                </option>
              );
            })}
          </select>

          {(searchQuery || statusFilter !== 'All Statuses' || projectFilter !== 'All Projects') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Statuses');
                setProjectFilter('All Projects');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
        Showing <strong className="text-emerald-700 dark:text-emerald-400">{filteredVisits.length}</strong> of{' '}
        <strong className="text-slate-800 dark:text-slate-200">{siteVisits.length}</strong> site visit requests
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 border border-slate-200 rounded-2xl h-56 animate-pulse dark:bg-slate-900 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm dark:bg-slate-900/40 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No site visits found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            When customers book a site visit on your website, their booking request will appear here automatically.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Schedule Manual Visit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white border border-slate-200 hover:border-emerald-400/60 rounded-2xl p-5 shadow-sm hover:shadow-md space-y-4 flex flex-col justify-between transition-all group dark:bg-slate-900 dark:border-slate-800 dark:hover:border-emerald-500/30 dark:shadow-lg"
            >
              <div className="space-y-3">
                {/* Status & Project Row */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      visit.status === 'Confirmed'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                        : visit.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                        : visit.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                    }`}
                  >
                    {visit.status || 'Requested'}
                  </span>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 max-w-[200px] truncate flex items-center gap-1 dark:bg-slate-950 dark:border-slate-800 dark:text-emerald-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{visit.project_name || 'Park Avenue'}</span>
                  </span>
                </div>

                {/* Customer Details */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2 dark:text-white dark:group-hover:text-emerald-400">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{visit.customer_name}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <a
                      href={`tel:${visit.customer_phone}`}
                      className="hover:text-emerald-600 font-mono flex items-center gap-1 text-emerald-700 font-bold dark:text-emerald-300"
                    >
                      <Phone className="w-3.5 h-3.5" /> {visit.customer_phone}
                    </a>
                    {visit.customer_email && (
                      <span className="flex items-center gap-1 text-slate-500 truncate max-w-[180px] dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5" /> {visit.customer_email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Time Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 dark:bg-slate-950 dark:border-slate-800/90">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{visit.visit_date}</span>
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-mono text-[11px] font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{visit.visit_time || '10:00 AM'}</span>
                    </span>
                  </div>
                  {visit.preferred_plot_size && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/80 dark:border-slate-800/80 dark:text-slate-400">
                      Plot Interest: <strong className="text-slate-700 dark:text-slate-200">{visit.preferred_plot_size}</strong>
                    </div>
                  )}
                </div>

                {/* Staff & Notes */}
                {visit.notes && (
                  <p className="text-xs text-slate-600 italic line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 dark:bg-slate-950/50 dark:border-slate-800/50 dark:text-slate-400">
                    &ldquo;{visit.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {visit.status !== 'Confirmed' && (
                    <button
                      onClick={() => handleQuickStatusChange(visit, 'Confirmed')}
                      title="Confirm Site Visit"
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
                    >
                      <Check className="w-3 h-3" /> Confirm
                    </button>
                  )}
                  {visit.status !== 'Completed' && (
                    <button
                      onClick={() => handleQuickStatusChange(visit, 'Completed')}
                      title="Mark Completed"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(visit)}
                    title="Edit Site Visit"
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-emerald-400 dark:border-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(visit.id)}
                    title="Delete Site Visit"
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors dark:bg-slate-950 dark:hover:bg-rose-950 dark:text-slate-400 dark:hover:text-rose-400 dark:border-slate-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative dark:bg-slate-900 dark:border-slate-800">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingVisit ? 'Edit Site Visit Request' : 'Schedule Customer Site Visit'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage customer tour date, project selection & staff assignment</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Customer from Existing CRM Leads */}
              {!editingVisit && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5 dark:bg-slate-950 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Select Customer from CRM Leads</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Auto-fills customer info)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (!selId) return;
                      const selLead = crmLeads.find((l) => l.id === selId);
                      if (selLead) {
                        const matchedProj = projects.find(
                          (p) =>
                            p.id === selLead.project_id ||
                            (p.name && selLead.project_interest && p.name.toLowerCase() === selLead.project_interest.toLowerCase())
                        );
                        setFormData({
                          ...formData,
                          customer_name: selLead.name,
                          customer_phone: (selLead.phone || '').replace(/\D/g, '').slice(-10),
                          customer_email: selLead.email || '',
                          project_id: matchedProj ? matchedProj.id : (selLead.project_id || formData.project_id || ''),
                          project_name: matchedProj ? (matchedProj.name || matchedProj.title) : (selLead.project_name || selLead.project_interest || formData.project_name || '')
                        });
                      }
                    }}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg p-2 text-xs text-slate-900 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  >
                    <option value="">-- Choose from Existing CRM Leads --</option>
                    {crmLeads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.phone}) — {l.project_name || l.project_interest || 'General'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Customer Name <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name || ''}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. Anand Kumar"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone Number <span className="text-emerald-600">* (10 Digits)</span>
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={formData.customer_email || ''}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                {/* Project Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Select Project</span> <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.project_id || ''}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const pObj = projects.find((p) => p.id === pId);
                      setFormData({
                        ...formData,
                        project_id: pId,
                        project_name: pObj ? (pObj.name || pObj.title) : '',
                        preferred_plot_size: ''
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.title} {p.location_area ? `(${p.location_area})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Plot Selection (Optional) */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Select Specific Plot</span>
                      <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                    </label>
                    {formData.project_id && (
                      <span className="text-[10px] text-emerald-700 font-bold dark:text-emerald-400">
                        {modalPlots.length} plots in selected project
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.preferred_plot_size || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedPlot = plots.find((p) => p.plot_number === val);
                      setFormData({
                        ...formData,
                        preferred_plot_size: val,
                        notes: matchedPlot ? `Plot ${matchedPlot.plot_number} (${matchedPlot.area_sqft} Sq.Ft)` : formData.notes
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="">No specific plot (Full Project Tour)</option>
                    {modalPlots.map((p) => (
                      <option key={p.id} value={p.plot_number || p.id}>
                        {p.plot_number || 'Plot'}{p.title ? ` - ${p.title}` : ''} ({p.area_sqft} Sq.Ft{p.facing ? ` • ${p.facing} Facing` : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Visit Date <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.visit_date || ''}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Preferred Visit Time <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.visit_time && formData.visit_time.includes(':') ? formData.visit_time : '10:00'}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={formData.status || 'Requested'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Requested">Requested (New Web Booking)</option>
                    <option value="Confirmed">Confirmed (Car & Staff Assigned)</option>
                    <option value="Completed">Completed (Tour Done)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Staff / Guide</label>
                  <select
                    value={formData.assigned_staff || 'Sales Team'}
                    onChange={(e) => setFormData({ ...formData, assigned_staff: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Sales Team">Sales Team (Default)</option>
                    {staffList
                      .filter((s) => (s.status || '').toLowerCase() === 'active')
                      .map((s) => (
                        <option key={s.id} value={s.username}>
                          {s.username} ({s.role || 'Staff'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Special Requirements & Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Looking for East facing plot, family visiting together..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Site Visit Record?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action will remove this site visit booking from the CRM database.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
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
