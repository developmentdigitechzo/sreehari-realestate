'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Project } from '@/lib/types';
import { FolderKanban, Plus, Edit3, Trash2, Building2, MapPin, X } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    status: 'Ongoing',
    location_city: 'Trichy',
    location_area: 'Thiruverumbur',
    total_acres: 15,
    total_plots: 120,
    available_plots: 60,
    price_starting_lakhs: 18.5,
    hero_image: '/images/hero-bg.jpg'
  });

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
    setFormData({
      name: '',
      tagline: '',
      status: 'Ongoing',
      location_city: 'Trichy',
      location_area: 'Thiruverumbur',
      total_acres: 15,
      total_plots: 120,
      available_plots: 60,
      price_starting_lakhs: 18.5,
      hero_image: '/images/hero-bg.jpg'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      tagline: project.tagline || '',
      status: project.status || 'Ongoing',
      location_city: project.location_city || 'Trichy',
      location_area: project.location_area || '',
      total_acres: project.total_acres || 10,
      total_plots: project.total_plots || 50,
      available_plots: project.available_plots || 20,
      price_starting_lakhs: project.price_starting_lakhs || 15,
      hero_image: project.hero_image || '/images/hero-bg.jpg'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, formData);
      } else {
        await api.createProject(formData);
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-emerald-400" />
            <span>Land & Plot Projects Manager</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage gated community projects, plot inventory counts, and launching status.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-3 text-center py-10 text-slate-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="col-span-3 text-center py-10 text-slate-500">No projects added yet.</p>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      proj.status === 'Ongoing'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : proj.status === 'Sold Out'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {proj.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 rounded bg-rose-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-3">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{proj.tagline}</p>

                <div className="mt-4 space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Location</span>
                    <span className="font-semibold text-slate-200">{proj.location_area}, {proj.location_city}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Total Extent</span>
                    <span className="font-semibold text-slate-200">{proj.total_acres} Acres</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Plot Inventory</span>
                    <span className="font-semibold text-emerald-400">{proj.available_plots} / {proj.total_plots} Available</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Starting Price</span>
                <span className="font-extrabold text-white">₹{proj.price_starting_lakhs} Lakhs*</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Area / Corridor</label>
                  <input
                    type="text"
                    value={formData.location_area}
                    onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Acres</label>
                  <input
                    type="number"
                    value={formData.total_acres}
                    onChange={(e) => setFormData({ ...formData, total_acres: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Plots</label>
                  <input
                    type="number"
                    value={formData.total_plots}
                    onChange={(e) => setFormData({ ...formData, total_plots: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Available</label>
                  <input
                    type="number"
                    value={formData.available_plots}
                    onChange={(e) => setFormData({ ...formData, available_plots: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
