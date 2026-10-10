'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { GalleryItem } from '@/lib/types';
import { Image, Plus, Trash2, X } from 'lucide-react';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Roads & Infrastructure',
    image_url: '/images/gallery-1.jpg'
  });

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    setLoading(true);
    try {
      const res = await api.getGallery().catch(() => null);
      if (res?.data) setItems(res.data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addGalleryItem(formData);
      setIsModalOpen(false);
      setFormData({ title: '', category: 'Roads & Infrastructure', image_url: '/images/gallery-1.jpg' });
      loadGallery();
    } catch (err: any) {
      alert(err.message || 'Failed to add media item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media photo?')) return;
    try {
      await api.deleteGalleryItem(id);
      loadGallery();
    } catch (err: any) {
      alert(err.message || 'Failed to delete gallery item');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <Image className="w-7 h-7 text-emerald-400" />
            <span>Media & Site Photos Manager</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage site photos, blacktop roads, entrance gates, green parks, and plot layouts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <p className="col-span-4 text-center py-8 text-slate-500">Loading gallery...</p>
        ) : items.length === 0 ? (
          <p className="col-span-4 text-center py-8 text-slate-500">No media photos added yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
              <div className="h-40 bg-slate-800 flex items-center justify-center text-slate-600 relative overflow-hidden">
                <Image className="w-10 h-10 opacity-40" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-white text-xs truncate">{item.title}</h4>
                <p className="text-[10px] text-emerald-400 mt-0.5">{item.category}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Site Photo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="30ft Blacktop Roads with Streetlights"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Entrance Gate">Entrance Gate & Arch</option>
                  <option value="Parks & Play Areas">Parks & Play Areas</option>
                  <option value="Aerial Layouts">Aerial Layouts</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
