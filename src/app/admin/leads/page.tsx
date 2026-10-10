'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CrmLead, Project } from '@/lib/types';
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
  MessageSquare
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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
    priority: 'Cold' as any,
    assigned_to: 'Sales Team',
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
    stage: 'New Lead' as any
  });

  // New Note Form
  const [newNoteContent, setNewNoteContent] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedStage, selectedPriority, selectedProject, searchQuery]);

  async function loadData() {
    setLoading(true);
    try {
      const [leadsRes, projectsRes] = await Promise.all([
        api.getCrmLeads({
          stage: selectedStage,
          priority: selectedPriority,
          projectId: selectedProject,
          search: searchQuery
        }),
        api.getProjects().catch(() => null)
      ]);

      if (leadsRes?.data) setLeads(leadsRes.data);
      if (projectsRes?.data) setProjects(projectsRes.data);
    } catch (err) {
      console.error('Error fetching CRM leads:', err);
    } finally {
      setLoading(false);
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

  // Strictly map Priority based on the 15 Pipeline Stages
  const getPriorityForStatus = (stage: string): string => {
    const s = (stage || '').toLowerCase().trim();
    if (s.includes('registration') || s.includes('booking') || s.includes('agreement') || s.includes('converted')) return 'COMPLETED';
    if (s.includes('lost') || s.includes('closed')) return 'CLOSED / LOST';
    if (s.includes('site') || s.includes('visit') || s.includes('negotiation') || s.includes('loan')) return 'HOT';
    if (s.includes('matching') || s.includes('partner') || s.includes('shared') || s.includes('follow')) return 'WARM';
    return 'COLD';
  };

  const getStatusSelectStyle = (stage: string) => {
    const s = (stage || '').toLowerCase().trim();
    if (s.includes('registration') || s.includes('booking') || s.includes('agreement') || s.includes('loan') || s.includes('converted')) {
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
    if (s.includes('site') || s.includes('visit') || s.includes('negotiation')) {
      return 'bg-purple-950 text-purple-300 border-purple-800';
    }
    if (s.includes('matching') || s.includes('partner') || s.includes('shared') || s.includes('follow')) {
      return 'bg-amber-950 text-amber-300 border-amber-800';
    }
    if (s.includes('lost') || s.includes('closed')) {
      return 'bg-rose-950 text-rose-300 border-rose-800';
    }
    return 'bg-indigo-950 text-indigo-300 border-indigo-800';
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const autoPriority = getPriorityForStatus(newLead.stage);
      await api.createCrmLead({ ...newLead, source: newLead.source || 'Manual', priority: autoPriority });
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
        priority: 'Cold',
        assigned_to: 'Sales Team',
        initial_note: ''
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create CRM lead');
    }
  };

  const handleOpenEdit = (lead: CrmLead) => {
    setEditingLead(lead);
    setEditForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      project_id: lead.project_id || '',
      plot_id: lead.plot_id || '',
      plot_name: lead.plot_name || '',
      plot_description: lead.plot_description || '',
      preferred_plot_size: lead.preferred_plot_size || '',
      budget: lead.budget || '',
      facing_preference: lead.facing_preference || 'Any',
      source: lead.source || 'Manual',
      stage: (lead.stage || lead.status || 'New') as any
    });
  };

  const handleUpdateEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    try {
      const autoPriority = getPriorityForStatus(editForm.stage);
      await api.updateCrmLead(editingLead.id, {
        ...editForm,
        status: editForm.stage,
        priority: autoPriority
      });
      setEditingLead(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update lead');
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNoteContent.trim()) return;
    try {
      await api.addLeadNote(leadId, {
        content: newNoteContent,
        type: 'call',
        created_by: 'Admin Sales'
      });
      setNewNoteContent('');
      const updated = await api.getCrmLeads({ search: leadId });
      if (updated?.data?.[0]) {
        setSelectedLeadForDetail(updated.data[0]);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
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
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to delete lead '${leadName}' from PostgreSQL database?`)) return;
    try {
      await api.deleteCrmLead(leadId);
      if (selectedLeadForDetail?.id === leadId) setSelectedLeadForDetail(null);
      if (editingLead?.id === leadId) setEditingLead(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete lead');
    }
  };

  const stagesList = ['All', ...LEAD_STATUS_OPTIONS];

  // Format Lead Source Badge
  const renderSourceBadge = (sourceStr?: string) => {
    const src = (sourceStr || 'Manual').trim();

    if (src.toLowerCase().includes('website') || src.toLowerCase().includes('contact form') || src.toLowerCase().includes('form')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
          <Globe className="w-3 h-3 text-indigo-400" />
          <span>Website Contact Form</span>
        </span>
      );
    }

    if (src.toLowerCase().includes('whatsapp')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
          <MessageSquare className="w-3 h-3 text-emerald-400" />
          <span>WhatsApp Inquiry</span>
        </span>
      );
    }

    if (src.toLowerCase().includes('call') || src.toLowerCase().includes('phone')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
          <PhoneCall className="w-3 h-3 text-blue-400" />
          <span>Direct Call</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-950 text-teal-300 border border-teal-800/60">
        <UserCheck className="w-3 h-3 text-teal-400" />
        <span>Manual</span>
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>CRM Buyer Leads Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track customer plot enquiries through 15 real estate sales pipeline stages.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Buyer Lead</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
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
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="All">Priority / State: All</option>
            <option value="HOT">HOT Priority</option>
            <option value="WARM">WARM Priority</option>
            <option value="COLD">COLD Priority</option>
            <option value="COMPLETED">COMPLETED (Won)</option>
            <option value="CLOSED / LOST">CLOSED / LOST</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Lead Source</th>
                <th className="px-6 py-4">Lead Status (15 Pipeline Stages)</th>
                <th className="px-6 py-4">Auto Priority</th>
                <th className="px-6 py-4 text-center">Actions (View / Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Loading CRM leads from PostgreSQL database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const currentStage = normalizeFrontendStage(lead.stage || lead.status);
                  const currentPriority = getPriorityForStatus(currentStage);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{lead.name}</div>
                        <div className="text-slate-400 mt-0.5">{lead.phone}</div>
                        {(lead.plot_name || lead.plot_id) && (
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-semibold">
                              Plot: {lead.plot_name || lead.plot_id}
                            </span>
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
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            currentPriority === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : currentPriority.includes('CLOSED') || currentPriority.includes('LOST')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : currentPriority === 'HOT'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : currentPriority === 'WARM'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {currentPriority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className="p-2 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/60 hover:bg-blue-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="View Lead Details & Notes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-2 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/60 hover:bg-amber-900 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Edit Lead Information"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/60 hover:bg-rose-900 transition-colors flex items-center gap-1 text-xs font-semibold"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Buyer Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold text-emerald-400"
                  >
                    <option value="Manual">Manual (Added from CRM)</option>
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Direct Call">Direct Call</option>
                    <option value="WhatsApp Click">WhatsApp Click</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Status</label>
                  <select
                    value={newLead.stage}
                    onChange={(e) => setNewLead({ ...newLead, stage: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold"
                  >
                    {LEAD_STATUS_OPTIONS.map((stg, idx) => (
                      <option key={stg} value={stg}>
                        {idx + 1}. {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Plot Information */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Plot Details (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Optional Fields</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Plot ID <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. plot-104 or #04"
                      value={newLead.plot_id}
                      onChange={(e) => setNewLead({ ...newLead, plot_id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Plot Name <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot #04 - East Corner"
                      value={newLead.plot_name}
                      onChange={(e) => setNewLead({ ...newLead, plot_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Plot Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 40x60 Ft South facing corner plot near park entrance"
                    value={newLead.plot_description}
                    onChange={(e) => setNewLead({ ...newLead, plot_description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Note</label>
                <textarea
                  rows={3}
                  value={newLead.initial_note}
                  onChange={(e) => setNewLead({ ...newLead, initial_note: e.target.value })}
                  placeholder="Notes about customer plot requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Lead to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Edit Lead Details</span>
              </h3>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Source</label>
                  <select
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold text-emerald-400"
                  >
                    <option value="Manual">Manual (Added from CRM)</option>
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Direct Call">Direct Call</option>
                    <option value="WhatsApp Click">WhatsApp Click</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.stage}
                    onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold"
                  >
                    {LEAD_STATUS_OPTIONS.map((stg, idx) => (
                      <option key={stg} value={stg}>
                        {idx + 1}. {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Plot Information */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Plot Details (Optional)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Optional Fields</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Plot ID <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. plot-104 or #04"
                      value={editForm.plot_id}
                      onChange={(e) => setEditForm({ ...editForm, plot_id: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                      Plot Name <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot #04 - East Corner"
                      value={editForm.plot_name}
                      onChange={(e) => setEditForm({ ...editForm, plot_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Plot Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 40x60 Ft South facing corner plot near park entrance"
                    value={editForm.plot_description}
                    onChange={(e) => setEditForm({ ...editForm, plot_description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LEAD DETAILS MODAL */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedLeadForDetail.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedLeadForDetail.phone} • {selectedLeadForDetail.email || 'No Email'}</p>
                <div className="mt-2">{renderSourceBadge(selectedLeadForDetail.source)}</div>
              </div>
              <button onClick={() => setSelectedLeadForDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(selectedLeadForDetail.plot_id || selectedLeadForDetail.plot_name || selectedLeadForDetail.plot_description) && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Associated Plot Details</div>
                {selectedLeadForDetail.plot_id && (
                  <p className="text-slate-300"><span className="text-slate-500 font-semibold">Plot ID:</span> {selectedLeadForDetail.plot_id}</p>
                )}
                {selectedLeadForDetail.plot_name && (
                  <p className="text-slate-300"><span className="text-slate-500 font-semibold">Plot Name:</span> {selectedLeadForDetail.plot_name}</p>
                )}
                {selectedLeadForDetail.plot_description && (
                  <p className="text-slate-400 text-[11px]"><span className="text-slate-500 font-semibold">Plot Description:</span> {selectedLeadForDetail.plot_description}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Change Lead Status (15 Stages)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs max-h-52 overflow-y-auto p-2 border border-slate-800/80 rounded-xl bg-slate-950/60">
                {LEAD_STATUS_OPTIONS.map((stg, idx) => {
                  const isActive = (selectedLeadForDetail.stage || selectedLeadForDetail.status) === stg;
                  return (
                    <button
                      key={stg}
                      onClick={() => handleUpdateStage(selectedLeadForDetail.id, stg)}
                      className={`p-2 rounded-lg border font-bold text-center text-[10px] transition-all ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {idx + 1}. {stg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow-up Notes</h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type follow-up note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
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
                  <div key={n.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <p className="text-slate-200">{n.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString('en-IN')} by {n.created_by}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleDeleteLead(selectedLeadForDetail.id, selectedLeadForDetail.name)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
