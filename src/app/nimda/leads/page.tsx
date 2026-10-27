'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CrmLead, Project, Plot, StaffUser } from '@/lib/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  X,
  Globe,
  UserCheck,
  PhoneCall,
  MessageSquare,
  Calendar,
  Clock,
  Building2,
  MapPin,
  IndianRupee,
  Car,
  Loader2
} from 'lucide-react';

const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Initial Contact',
  'Requirement Analysis',
  'Property Matching',
  'Shared to Partner',
  'Property Shared',
  'Follow Up Pending',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Negotiation',
  'Booking',
  'Sale Agreement',
  'Bank Loan',
  'Registration',
  'Lost Closed'
];

function formatPlotBadge(raw?: string): string {
  if (!raw) return '';
  let str = raw.trim();
  // Strip redundant leading "Plot", "Plot:", "Plot #", "#"
  str = str.replace(/^(?:plot\s*[:#-]*\s*)+/gi, '').trim();
  str = str.replace(/^#+\s*/g, '').trim();
  // Clean duplicate "Facing" occurrences at the end
  str = str.replace(/(Facing\s*)+$/gi, 'Facing').trim();
  return str ? `Plot #${str}` : '';
}

function getPlotFullTitle(plot: Plot): string {
  const pNum = (plot.plot_number || '').trim();
  const title = (plot.title || '').trim();
  if (pNum && title && pNum.toLowerCase() !== title.toLowerCase()) {
    if (title.toLowerCase().startsWith(pNum.toLowerCase())) {
      return title;
    }
    return `${pNum} - ${title}`;
  }
  if (pNum) return pNum;
  if (title) return title;
  return `Plot #${plot.id}`;
}

function formatTimeForInput(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }
  if (trimmed.toLowerCase().includes('morning')) return '10:00';
  if (trimmed.toLowerCase().includes('afternoon')) return '14:00';
  if (trimmed.toLowerCase().includes('evening')) return '17:00';
  return '';
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [deletingLeadInfo, setDeletingLeadInfo] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<CrmLead | null>(null);
  const [editingLead, setEditingLead] = useState<CrmLead | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    project_id: '',
    plot_id: '',
    plot_name: '',
    plot_description: '',
    preferred_plot_size: '',
    budget: '',
    facing_preference: 'Any',
    source: 'Manual',
    stage: 'New Lead' as any,
    priority: 'Warm' as any,
    assigned_to: 'Sales Team',
    site_visit_date: '',
    site_visit_time: '',
    next_follow_up_date: '',
    next_follow_up_time: '',
    message: '',
    initial_note: ''
  });

  // Edit Lead Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    project_id: '',
    plot_id: '',
    plot_name: '',
    plot_description: '',
    preferred_plot_size: '',
    budget: '',
    facing_preference: 'Any',
    source: 'Manual',
    stage: 'New Lead' as any,
    priority: 'Warm' as any,
    assigned_to: 'Sales Team',
    site_visit_date: '',
    site_visit_time: '',
    next_follow_up_date: '',
    next_follow_up_time: '',
    message: ''
  });

  // New Note Form
  const [newNoteContent, setNewNoteContent] = useState('');

  const formatLeadDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStage, selectedPriority, selectedProject, searchQuery]);

  async function loadData() {
    setLoading(true);
    try {
      const [leadsRes, projectsRes, plotsRes, staffRes] = await Promise.all([
        api.getCrmLeads({
          stage: selectedStage,
          priority: selectedPriority,
          projectId: selectedProject,
          search: searchQuery
        }),
        api.getProjects().catch(() => null),
        api.getPlots().catch(() => null),
        api.getStaffList().catch(() => null)
      ]);

      if (leadsRes?.data) setLeads(leadsRes.data);
      if (projectsRes?.data) setProjects(projectsRes.data);
      if (plotsRes?.data) setPlots(plotsRes.data);
      if (staffRes?.data) setStaffList(staffRes.data);
    } catch (err) {
      console.error('Error fetching CRM leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function refreshLeadsOnly() {
    try {
      const leadsRes = await api.getCrmLeads({
        stage: selectedStage,
        priority: selectedPriority,
        projectId: selectedProject,
        search: searchQuery
      });
      if (leadsRes?.data) setLeads(leadsRes.data);
    } catch (err) {
      console.error('Error refreshing leads:', err);
    }
  }

  const normalizeFrontendStage = (stg?: string): string => {
    if (!stg) return 'New Lead';
    const s = stg.trim();
    if (s === 'New' || s === 'New Lead') return 'New Lead';
    if (s === 'Contacted' || s === 'Initial Contact') return 'Initial Contact';
    if (s === 'Follow-up' || s === 'Follow Up Pending') return 'Follow Up Pending';
    if (s === 'Converted' || s === 'Booking') return 'Booking';
    if (s === 'Closed' || s === 'Lost Closed') return 'Lost Closed';
    return s;
  };

  // Determine Priority: Never default to Cold. Default to Warm, or Hot if site visit/urgent.
  const getPriorityForStatus = (stage: string, userPriority?: string): string => {
    if (userPriority && userPriority.trim() !== '') {
      return userPriority.toUpperCase();
    }
    const s = (stage || '').toLowerCase().trim();
    if (s.includes('registration') || s.includes('booking') || s.includes('agreement') || s.includes('converted')) return 'COMPLETED';
    if (s.includes('lost') || s.includes('closed')) return 'CLOSED / LOST';
    if (s.includes('site') || s.includes('visit') || s.includes('negotiation') || s.includes('loan')) return 'HOT';
    return 'WARM';
  };

  const getStatusSelectStyle = (stage: string) => {
    const s = (stage || '').toLowerCase().trim();
    if (s.includes('registration') || s.includes('booking') || s.includes('agreement') || s.includes('loan') || s.includes('converted')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (s.includes('site') || s.includes('visit') || s.includes('negotiation')) {
      return 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
    }
    if (s.includes('matching') || s.includes('partner') || s.includes('shared') || s.includes('follow')) {
      return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    }
    if (s.includes('lost') || s.includes('closed')) {
      return 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
    }
    return 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLead(true);
    try {
      let targetStage = newLead.stage || 'New Lead';
      if (newLead.site_visit_date && (targetStage === 'New Lead' || targetStage === 'Follow Up Pending')) {
        targetStage = 'Site Visit Scheduled';
      } else if (newLead.next_follow_up_date && targetStage === 'New Lead') {
        targetStage = 'Follow Up Pending';
      }
      const targetPriority = newLead.priority || (newLead.site_visit_date ? 'Hot' : 'Warm');
      const createRes = await api.createCrmLead({ ...newLead, stage: targetStage, status: targetStage, source: newLead.source || 'Manual', priority: targetPriority });
      
      const matchedProject = projects.find(p => p.id === newLead.project_id);
      const enrichedNewLead = createRes?.data ? {
        ...createRes.data,
        project_name: matchedProject ? matchedProject.name : (newLead.project_id ? 'Linked Project' : 'General Plot Enquiry'),
        project_location: matchedProject ? `${matchedProject.location_area}, ${matchedProject.location_city}` : ''
      } : null;

      setIsAddModalOpen(false);
      setNewLead({
        name: '',
        phone: '',
        email: '',
        project_id: '',
        plot_id: '',
        plot_name: '',
        plot_description: '',
        preferred_plot_size: '',
        budget: '',
        facing_preference: 'Any',
        source: 'Manual',
        stage: 'New Lead',
        priority: 'Warm',
        assigned_to: 'Sales Team',
        site_visit_date: '',
        site_visit_time: '',
        next_follow_up_date: '',
        next_follow_up_time: '',
        message: '',
        initial_note: ''
      });
      if (enrichedNewLead) {
        setLeads((prev) => [enrichedNewLead, ...prev]);
      }
      refreshLeadsOnly();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to create CRM lead');
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleOpenEdit = (lead: CrmLead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || '',
      phone: (lead.phone || '').replace(/\D/g, '').slice(0, 10),
      email: lead.email || '',
      project_id: lead.project_id || '',
      plot_id: lead.plot_id || '',
      plot_name: lead.plot_name || '',
      plot_description: lead.plot_description || '',
      preferred_plot_size: lead.preferred_plot_size || '',
      budget: lead.budget || '',
      facing_preference: lead.facing_preference || 'Any',
      source: lead.source || 'Manual',
      stage: (lead.stage || lead.status || 'New Lead') as any,
      priority: (lead.priority || 'Warm') as any,
      assigned_to: lead.assigned_to || 'Sales Team',
      site_visit_date: lead.site_visit_date || '',
      site_visit_time: lead.site_visit_time || '',
      next_follow_up_date: lead.next_follow_up_date || '',
      next_follow_up_time: lead.next_follow_up_time || '',
      message: lead.message || ''
    });
  };

  const handleUpdateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSavingLead(true);
    try {
      let targetStage = editForm.stage || 'New Lead';
      if (editForm.site_visit_date && (targetStage === 'New Lead' || targetStage === 'Follow Up Pending')) {
        targetStage = 'Site Visit Scheduled';
      } else if (editForm.next_follow_up_date && targetStage === 'New Lead') {
        targetStage = 'Follow Up Pending';
      }
      const targetPriority = editForm.priority || (editForm.site_visit_date ? 'Hot' : 'Warm');
      const matchedProject = projects.find(p => p.id === editForm.project_id);
      await api.updateCrmLead(editingLead.id, {
        ...editForm,
        source: editForm.source,
        stage: targetStage,
        status: targetStage,
        priority: targetPriority
      });
      const updatedItem = {
        ...editingLead,
        ...editForm,
        source: editForm.source,
        stage: targetStage,
        status: targetStage,
        priority: targetPriority,
        project_name: matchedProject ? matchedProject.name : (editForm.project_id ? 'Linked Project' : 'General Plot Enquiry'),
        project_location: matchedProject ? `${matchedProject.location_area}, ${matchedProject.location_city}` : ''
      };
      setLeads((prev) =>
        prev.map((l) =>
          l.id === editingLead.id ? updatedItem : l
        )
      );
      if (selectedLeadForDetail && selectedLeadForDetail.id === editingLead.id) {
        setSelectedLeadForDetail({
          ...selectedLeadForDetail,
          ...updatedItem
        });
      }
      setEditingLead(null);
      refreshLeadsOnly();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update lead');
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNoteContent.trim()) return;
    try {
      const res = await api.addLeadNote(leadId, {
        content: newNoteContent,
        type: 'call',
        created_by: 'Admin Sales'
      });
      const noteObj = res?.data || {
        id: Date.now().toString(),
        content: newNoteContent.trim(),
        type: 'call',
        created_by: 'Admin Sales',
        created_at: new Date().toISOString()
      };
      setNewNoteContent('');
      if (selectedLeadForDetail && selectedLeadForDetail.id === leadId) {
        const existingNotes = Array.isArray(selectedLeadForDetail.notes) ? selectedLeadForDetail.notes : [];
        setSelectedLeadForDetail({
          ...selectedLeadForDetail,
          notes: [noteObj, ...existingNotes]
        });
      }
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, notes: [noteObj, ...(Array.isArray(l.notes) ? l.notes : [])] }
            : l
        )
      );
      refreshLeadsOnly();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to add note');
    }
  };

  const handleUpdateStage = async (leadId: string, stage: string) => {
    const autoPriority = getPriorityForStatus(stage);
    try {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, stage: stage as any, status: stage, priority: autoPriority }
            : l
        )
      );

      await api.updateCrmLead(leadId, { stage, status: stage, priority: autoPriority });

      if (selectedLeadForDetail && selectedLeadForDetail.id === leadId) {
        setSelectedLeadForDetail({
          ...selectedLeadForDetail,
          stage: stage as any,
          status: stage,
          priority: autoPriority
        });
      }
      refreshLeadsOnly();
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update lead status');
    }
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    setDeletingLeadInfo({ id: leadId, name: leadName });
  };

  const confirmDeleteLead = async () => {
    if (!deletingLeadInfo) return;
    try {
      await api.deleteCrmLead(deletingLeadInfo.id);
      setLeads((prev) => prev.filter((l) => l.id !== deletingLeadInfo.id));
      if (selectedLeadForDetail?.id === deletingLeadInfo.id) setSelectedLeadForDetail(null);
      if (editingLead?.id === deletingLeadInfo.id) setEditingLead(null);
      refreshLeadsOnly();
      setToastMessage('Lead deleted successfully');
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to delete lead');
    } finally {
      setDeletingLeadInfo(null);
    }
  };

  const stagesList = ['All', ...LEAD_STATUS_OPTIONS];

  // Format Lead Source Badge
  const renderSourceBadge = (sourceStr?: string) => {
    const src = (sourceStr || 'Manual').trim();

    if (src.toLowerCase() === 'contact form' || (src.toLowerCase().includes('contact') && src.toLowerCase().includes('form'))) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60">
          <Globe className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>Contact Form</span>
        </span>
      );
    }

    if (src.toLowerCase() === 'property form' || (src.toLowerCase().includes('property') && src.toLowerCase().includes('form')) || src.toLowerCase().includes('property detail')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60">
          <Globe className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span>Property Page</span>
        </span>
      );
    }

    if (src.toLowerCase() === 'blog form' || (src.toLowerCase().includes('blog') && src.toLowerCase().includes('form'))) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800/60">
          <Globe className="w-3 h-3 text-purple-500 dark:text-purple-400" />
          <span>Blog Form</span>
        </span>
      );
    }

    if (src.toLowerCase().includes('website') || src.toLowerCase().includes('form')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/60">
          <Globe className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          <span>{src.toLowerCase().includes('modal') ? 'Website Form' : src}</span>
        </span>
      );
    }

    if (src.toLowerCase().includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60">
          <MessageSquare className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          <span>WhatsApp Inquiry</span>
        </span>
      );
    }

    if (src.toLowerCase().includes('call') || src.toLowerCase().includes('phone')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/60">
          <PhoneCall className="w-3 h-3 text-blue-500 dark:text-blue-400" />
          <span>Direct Call</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-950 dark:text-teal-300 dark:border-teal-800/60">
        <UserCheck className="w-3 h-3 text-slate-500 dark:text-teal-400" />
        <span>{src}</span>
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Leads</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage customer enquiries and follow-ups.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex flex-wrap items-center gap-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        <div>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
          >
            {stagesList.map((stg) => (
              <option key={stg} value={stg}>
                Status: {stg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
          >
            <option value="All">Priority: All</option>
            <option value="HOT">HOT Priority</option>
            <option value="WARM">WARM Priority</option>
            <option value="COLD">COLD Priority</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CLOSED / LOST">LOST / CLOSED</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 dark:bg-slate-950/80 dark:text-slate-400 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Project & Budget</th>
                <th className="px-6 py-4">Date & Follow-up</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Loading CRM leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const currentStage = normalizeFrontendStage(lead.stage || lead.status);
                  const currentPriority = (lead.priority ? lead.priority.toUpperCase() : getPriorityForStatus(currentStage));
                  const matchedProject = projects.find((p) => p.id === lead.project_id);
                  const projectName = matchedProject?.name || matchedProject?.title || (lead as any).project_name || lead.project_interest || '—';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{lead.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{lead.phone}</div>
                        {lead.email && <div className="text-slate-500 text-[11px] truncate max-w-[180px]">{lead.email}</div>}
                        {(lead.plot_name || lead.plot_id) && (
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold dark:bg-emerald-950/80 dark:border-emerald-800/60 dark:text-emerald-300">
                              {formatPlotBadge(lead.plot_name || lead.plot_id)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{projectName}</span>
                        </div>
                        {lead.budget && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-300">
                            <IndianRupee className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{lead.budget}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                          {formatLeadDate(lead.created_at)}
                        </div>
                        {lead.assigned_to && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{lead.assigned_to}</span>
                          </div>
                        )}
                        {lead.next_follow_up_date && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60">
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Follow-up: {lead.next_follow_up_date} {lead.next_follow_up_time ? `(${lead.next_follow_up_time})` : ''}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {renderSourceBadge(lead.source)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={currentStage}
                          onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                          className={`border text-xs rounded-lg px-3 py-1.5 font-bold focus:outline-none cursor-pointer ${getStatusSelectStyle(currentStage)}`}
                        >
                          {LEAD_STATUS_OPTIONS.map((stg, idx) => (
                            <option key={stg} value={stg}>
                              {idx + 1}. {stg}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={currentPriority}
                          onChange={async (e) => {
                            const nextPri = e.target.value;
                            try {
                              await api.updateCrmLead(lead.id, { priority: nextPri });
                              setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, priority: nextPri } : l)));
                            } catch (err: any) {
                              setToastMessage('Failed to update priority: ' + err.message);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border focus:outline-none transition-colors ${
                            currentPriority === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
                              : currentPriority.includes('CLOSED') || currentPriority.includes('LOST')
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800/60'
                              : currentPriority === 'HOT'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800/60'
                              : currentPriority === 'WARM'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60'
                              : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          <option value="HOT">HOT</option>
                          <option value="WARM">WARM</option>
                          <option value="COLD">COLD</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CLOSED / LOST">CLOSED / LOST</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/60 dark:hover:bg-blue-900 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                            title="View Lead Details & Notes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/60 dark:hover:bg-amber-900 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                            title="Edit Lead Information"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800/60 dark:hover:bg-rose-900 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                            title="Delete Lead from PostgreSQL"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
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

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Buyer Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number * (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Name</label>
                  <select
                    value={newLead.project_id}
                    onChange={(e) => setNewLead({ ...newLead, project_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => {
                      const pName = p.name || p.title || 'Project';
                      const pLoc = p.location_area || p.location_city || p.location;
                      return (
                        <option key={p.id} value={p.id}>
                          {pName} {pLoc ? `(${pLoc})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Preferred Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25 Lakhs - ₹40 Lakhs"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Preferred Plot Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1200 sq.ft / 1500 sq.ft"
                    value={newLead.preferred_plot_size}
                    onChange={(e) => setNewLead({ ...newLead, preferred_plot_size: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lead Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-emerald-400"
                  >
                    <option value="Manual">Manual (Added from CRM)</option>
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Property Detail Page">Property Detail Page</option>
                    <option value="Direct Call">Direct Call</option>
                    <option value="WhatsApp Click">WhatsApp Click</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lead Status</label>
                  <select
                    value={newLead.stage}
                    onChange={(e) => setNewLead({ ...newLead, stage: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    {LEAD_STATUS_OPTIONS.map((stg, idx) => (
                      <option key={stg} value={stg}>
                        {idx + 1}. {stg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lead Priority</label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-amber-400"
                  >
                    <option value="Warm">Warm (Default)</option>
                    <option value="Hot">Hot (High Intent)</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Staff</label>
                  <select
                    value={newLead.assigned_to}
                    onChange={(e) => setNewLead({ ...newLead, assigned_to: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 font-semibold dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Sales Team">Sales Team (Default Pool)</option>
                    {staffList
                      .filter((s) => (s.status || '').toLowerCase() === 'active')
                      .map((staff) => (
                        <option key={staff.id} value={staff.username}>
                          {staff.username} ({staff.role || 'Staff'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Follow-Up Scheduling */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-3 dark:bg-slate-950/80 dark:border-blue-900/40">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Follow-Up Scheduling</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Follow-Up Date</label>
                    <input
                      type="date"
                      value={newLead.next_follow_up_date}
                      onChange={(e) => {
                        const d = e.target.value;
                        setNewLead((prev) => ({
                          ...prev,
                          next_follow_up_date: d,
                          stage: d && (!prev.stage || prev.stage === 'New Lead') ? 'Follow Up Pending' : prev.stage
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Follow-Up Time / Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:00 AM or Morning"
                      value={newLead.next_follow_up_time}
                      onChange={(e) => setNewLead({ ...newLead, next_follow_up_time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Site Visit Scheduling */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-3 dark:bg-slate-950/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Site Visit & Cab Pickup Details</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Visit Date</label>
                    <input
                      type="date"
                      value={newLead.site_visit_date}
                      onChange={(e) => {
                        const d = e.target.value;
                        setNewLead((prev) => ({
                          ...prev,
                          site_visit_date: d,
                          stage: d && (!prev.stage || prev.stage === 'New Lead' || prev.stage === 'Follow Up Pending') ? 'Site Visit Scheduled' : prev.stage
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Visit Time</label>
                    <input
                      type="time"
                      value={newLead.site_visit_time || ''}
                      onChange={(e) => setNewLead({ ...newLead, site_visit_time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Plot Information */}
              {(() => {
                const availablePlots = newLead.project_id
                  ? plots.filter((p) => p.project_id === newLead.project_id)
                  : plots;
                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Plot Selection & Details</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {newLead.project_id ? `${availablePlots.length} plots available` : 'Select project above to filter plots'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                        Select Specific Plot {newLead.project_id ? '(From Selected Project)' : ''}
                      </label>
                      <select
                        value={newLead.plot_id}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const matched = plots.find((p) => p.id === pId);
                          if (matched) {
                            const cleanName = getPlotFullTitle(matched);
                            const priceFormatted = matched.total_price_lakhs
                              ? `₹${matched.total_price_lakhs} Lakhs`
                              : matched.price
                              ? `₹${Number(matched.price).toLocaleString('en-IN')}`
                              : '';
                            const sizeFormatted = matched.area_sqft ? `${matched.area_sqft} sq.ft` : '';
                            setNewLead({
                              ...newLead,
                              plot_id: matched.id,
                              plot_name: cleanName,
                              plot_description: `${cleanName} | Area: ${sizeFormatted} | Facing: ${matched.facing || 'Standard'} | Status: ${matched.status || 'Available'}`.trim(),
                              budget: newLead.budget || priceFormatted,
                              preferred_plot_size: newLead.preferred_plot_size || sizeFormatted
                            });
                          } else {
                            setNewLead({
                              ...newLead,
                              plot_id: '',
                              plot_name: '',
                              plot_description: ''
                            });
                          }
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      >
                        <option value="">-- No Specific Plot (General Project Interest) --</option>
                        {availablePlots.map((plot) => {
                          const cleanLabel = getPlotFullTitle(plot);
                          const cleanFacing = plot.facing
                            ? (plot.facing.toLowerCase().includes('facing') ? plot.facing : `${plot.facing} Facing`)
                            : '';
                          return (
                            <option key={plot.id} value={plot.id}>
                              {cleanLabel} {plot.area_sqft ? `(${plot.area_sqft} sq.ft)` : ''} {cleanFacing ? `- ${cleanFacing}` : ''} [{plot.status || 'Available'}]
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                          Plot ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. plot-104 or #04"
                          value={newLead.plot_id}
                          onChange={(e) => setNewLead({ ...newLead, plot_id: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                          Plot Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Plot #04 - East Corner"
                          value={newLead.plot_name}
                          onChange={(e) => setNewLead({ ...newLead, plot_name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                        Plot Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 40x60 Ft South facing corner plot near park entrance"
                        value={newLead.plot_description}
                        onChange={(e) => setNewLead({ ...newLead, plot_description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Customer Requirements / Message</label>
                <textarea
                  rows={2}
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  placeholder="Customer requirements or specific needs..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Initial Note</label>
                <textarea
                  rows={2}
                  value={newLead.initial_note}
                  onChange={(e) => setNewLead({ ...newLead, initial_note: e.target.value })}
                  placeholder="Internal notes about lead..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Lead...</span>
                    </>
                  ) : (
                    <span>Save Lead to PostgreSQL</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Edit Lead Details</span>
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number * (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Project Name</label>
                  <select
                    value={editForm.project_id}
                    onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => {
                      const pName = p.name || p.title || 'Project';
                      const pLoc = p.location_area || p.location_city || p.location;
                      return (
                        <option key={p.id} value={p.id}>
                          {pName} {pLoc ? `(${pLoc})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Preferred Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25 Lakhs - ₹40 Lakhs"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Preferred Plot Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1200 sq.ft / 1500 sq.ft"
                    value={editForm.preferred_plot_size}
                    onChange={(e) => setEditForm({ ...editForm, preferred_plot_size: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Lead Source</label>
                  <select
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 dark:bg-slate-950 dark:border-slate-800 font-semibold"
                  >
                    <option value="Manual">Manual (Added from CRM)</option>
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Direct Call">Direct Call</option>
                    <option value="WhatsApp Click">WhatsApp Click</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-semibold"
                  >
                    {LEAD_STATUS_OPTIONS.map((stg, idx) => (
                      <option key={stg} value={stg}>
                        {idx + 1}. {stg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-amber-400 text-slate-900"
                  >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed / Lost">Closed / Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assigned Staff</label>
                  <select
                    value={editForm.assigned_to}
                    onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-semibold"
                  >
                    <option value="Sales Team">Sales Team (Default Pool)</option>
                    {staffList
                      .filter((s) => (s.status || '').toLowerCase() === 'active')
                      .map((staff) => (
                        <option key={staff.id} value={staff.username}>
                          {staff.username} ({staff.role || 'Staff'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Follow-Up Scheduling */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Follow-Up Scheduling</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Follow-Up Date</label>
                    <input
                      type="date"
                      value={editForm.next_follow_up_date}
                      onChange={(e) => {
                        const d = e.target.value;
                        setEditForm((prev) => ({
                          ...prev,
                          next_follow_up_date: d,
                          stage: d && (!prev.stage || prev.stage === 'New Lead') ? 'Follow Up Pending' : prev.stage
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Follow-Up Time / Slot</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:00 AM or Morning"
                      value={editForm.next_follow_up_time}
                      onChange={(e) => setEditForm({ ...editForm, next_follow_up_time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Site Visit Scheduling */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/60 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Site Visit Scheduling</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Visit Date</label>
                    <input
                      type="date"
                      value={editForm.site_visit_date}
                      onChange={(e) => {
                        const d = e.target.value;
                        setEditForm((prev) => ({
                          ...prev,
                          site_visit_date: d,
                          stage: d && (!prev.stage || prev.stage === 'New Lead' || prev.stage === 'Follow Up Pending') ? 'Site Visit Scheduled' : prev.stage
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-[11px]">Visit Time</label>
                    <input
                      type="time"
                      value={formatTimeForInput(editForm.site_visit_time)}
                      onChange={(e) => setEditForm({ ...editForm, site_visit_time: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Plot Information */}
              {(() => {
                const availablePlots = editForm.project_id
                  ? plots.filter((p) => p.project_id === editForm.project_id)
                  : plots;
                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Plot Selection & Details</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {editForm.project_id ? `${availablePlots.length} plots available` : 'Select project above to filter plots'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                        Select Specific Plot {editForm.project_id ? '(From Selected Project)' : ''}
                      </label>
                      <select
                        value={editForm.plot_id}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const matched = plots.find((p) => p.id === pId);
                          if (matched) {
                            const cleanName = getPlotFullTitle(matched);
                            const priceFormatted = matched.total_price_lakhs
                              ? `₹${matched.total_price_lakhs} Lakhs`
                              : matched.price
                              ? `₹${Number(matched.price).toLocaleString('en-IN')}`
                              : '';
                            const sizeFormatted = matched.area_sqft ? `${matched.area_sqft} sq.ft` : '';
                            setEditForm({
                              ...editForm,
                              plot_id: matched.id,
                              plot_name: cleanName,
                              plot_description: `${cleanName} | Area: ${sizeFormatted} | Facing: ${matched.facing || 'Standard'} | Status: ${matched.status || 'Available'}`.trim(),
                              budget: editForm.budget || priceFormatted,
                              preferred_plot_size: editForm.preferred_plot_size || sizeFormatted
                            });
                          } else {
                            setEditForm({
                              ...editForm,
                              plot_id: '',
                              plot_name: '',
                              plot_description: ''
                            });
                          }
                        }}
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg p-2 text-xs font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      >
                        <option value="">-- No Specific Plot (General Project Interest) --</option>
                        {availablePlots.map((plot) => {
                          const cleanLabel = getPlotFullTitle(plot);
                          const cleanFacing = plot.facing
                            ? (plot.facing.toLowerCase().includes('facing') ? plot.facing : `${plot.facing} Facing`)
                            : '';
                          return (
                            <option key={plot.id} value={plot.id}>
                              {cleanLabel} {plot.area_sqft ? `(${plot.area_sqft} sq.ft)` : ''} {cleanFacing ? `- ${cleanFacing}` : ''} [{plot.status || 'Available'}]
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                          Plot ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. plot-104 or #04"
                          value={editForm.plot_id}
                          onChange={(e) => setEditForm({ ...editForm, plot_id: e.target.value })}
                          className="w-full bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                          Plot Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Plot #04 - East Corner"
                          value={editForm.plot_name}
                          onChange={(e) => setEditForm({ ...editForm, plot_name: e.target.value })}
                          className="w-full bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-[11px]">
                        Plot Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 40x60 Ft South facing corner plot near park entrance"
                        value={editForm.plot_description}
                        onChange={(e) => setEditForm({ ...editForm, plot_description: e.target.value })}
                        className="w-full bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs"
                      />
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Customer Requirements / Message</label>
                <textarea
                  rows={2}
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  placeholder="Customer requirements or specific needs..."
                  className="w-full bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500 shadow-md shadow-amber-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEAD DETAILS MODAL */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedLeadForDetail.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedLeadForDetail.phone} • {selectedLeadForDetail.email || 'No Email'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {renderSourceBadge(selectedLeadForDetail.source)}
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 dark:text-slate-400 dark:bg-slate-950 dark:border-slate-800">
                    Created: <strong className="text-slate-800 dark:text-slate-200">{formatLeadDate(selectedLeadForDetail.created_at)}</strong>
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedLeadForDetail(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project & Budget Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Project & Location</span>
                </div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">
                  {(() => {
                    const mp = projects.find((p) => p.id === selectedLeadForDetail.project_id);
                    return mp?.name || mp?.title || (selectedLeadForDetail as any).project_name || selectedLeadForDetail.project_interest || 'General Real Estate Enquiry';
                  })()}
                </p>
                {(() => {
                  const mp = projects.find((p) => p.id === selectedLeadForDetail.project_id);
                  const loc = mp?.location_area || mp?.location_city || mp?.location;
                  return loc ? (
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>{loc}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-amber-700 dark:text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Budget & Preferences</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200">
                  <span className="text-slate-500 font-semibold">Budget: </span>
                  <strong className="text-amber-600 dark:text-amber-300 font-bold">{selectedLeadForDetail.budget || 'Not specified'}</strong>
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  <span className="text-slate-500 font-semibold">Preferred Size: </span>
                  <span>{selectedLeadForDetail.preferred_plot_size || 'Not specified'}</span>
                </p>
              </div>
            </div>

            {/* Assigned Staff & Scheduled Follow-Up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedLeadForDetail.assigned_to && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigned Staff / Executive</span>
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">
                    {selectedLeadForDetail.assigned_to}
                  </p>
                </div>
              )}

              {selectedLeadForDetail.next_follow_up_date && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-blue-700 dark:text-blue-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Scheduled Next Follow-Up</span>
                  </div>
                  <p className="text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                    <span>Date: {selectedLeadForDetail.next_follow_up_date}</span>
                    {selectedLeadForDetail.next_follow_up_time && (
                      <span className="text-blue-700 dark:text-blue-300 font-normal text-xs">
                        ({selectedLeadForDetail.next_follow_up_time})
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Scheduled Site Visit */}
            {selectedLeadForDetail.site_visit_date && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/60 rounded-xl text-xs space-y-2">
                <div className="font-bold text-purple-700 dark:text-purple-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Scheduled Site Visit</span>
                </div>
                <p className="text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                  <span>Date: {selectedLeadForDetail.site_visit_date}</span>
                  {selectedLeadForDetail.site_visit_time && (
                    <span className="text-purple-700 dark:text-purple-300 font-normal flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>{selectedLeadForDetail.site_visit_time}</span>
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Customer Message / Requirements */}
            {selectedLeadForDetail.message && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                  Customer Requirements / Message
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                  &ldquo;{selectedLeadForDetail.message}&rdquo;
                </p>
              </div>
            )}

            {(selectedLeadForDetail.plot_id || selectedLeadForDetail.plot_name || selectedLeadForDetail.plot_description) && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">Associated Plot Details</div>
                {selectedLeadForDetail.plot_id && (
                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 font-semibold">Plot ID:</span> {selectedLeadForDetail.plot_id}</p>
                )}
                {selectedLeadForDetail.plot_name && (
                  <p className="text-slate-700 dark:text-slate-300"><span className="text-slate-500 font-semibold">Plot Name:</span> {selectedLeadForDetail.plot_name}</p>
                )}
                {selectedLeadForDetail.plot_description && (
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]"><span className="text-slate-500 font-semibold">Plot Description:</span> {selectedLeadForDetail.plot_description}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Change Lead Status (15 Stages)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs max-h-52 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-slate-50 dark:bg-slate-950/60">
                {LEAD_STATUS_OPTIONS.map((stg, idx) => {
                  const isActive = (selectedLeadForDetail.stage || selectedLeadForDetail.status) === stg;
                  return (
                    <button
                      key={stg}
                      onClick={() => handleUpdateStage(selectedLeadForDetail.id, stg)}
                      className={`p-2 rounded-lg border font-bold text-center text-[10px] transition-all ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {idx + 1}. {stg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Follow-up Notes</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type follow-up note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
                <button
                  onClick={() => handleAddNote(selectedLeadForDetail.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                >
                  Save Note
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedLeadForDetail.notes?.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs dark:bg-slate-950 dark:border-slate-800">
                    <p className="text-slate-800 dark:text-slate-200">{n.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString('en-IN')} by {n.created_by}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleDeleteLead(selectedLeadForDetail.id, selectedLeadForDetail.name)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
        isOpen={Boolean(deletingLeadInfo)}
        title="Delete CRM Lead?"
        description={deletingLeadInfo ? `Are you sure you want to permanently delete lead '${deletingLeadInfo.name}' from the database?` : ''}
        confirmLabel="Delete Lead"
        onConfirm={confirmDeleteLead}
        onCancel={() => setDeletingLeadInfo(null)}
      />
    </div>
  );
}