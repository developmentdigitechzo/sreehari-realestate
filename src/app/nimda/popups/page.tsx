'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { PromotionalPopup } from '@/lib/types';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  X,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  MessageSquare,
  Globe,
  Tag,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Send,
  Loader2
} from 'lucide-react';

const DEFAULT_POPUP_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

const CATEGORIES = ['Festival', 'Seasonal Deal', 'New Launch', 'Exclusive Offer', 'Spot Discount'];
const STANDARD_FRONTEND_PAGES = [
  { path: '/', label: 'Home Page (/)' },
  { path: '/properties', label: 'All Properties & Layouts (/properties)' },
  { path: '/properties/park-avenue', label: 'Park Avenue Community (/properties/park-avenue)' },
  { path: '/properties/sri-amman-nagar', label: 'Sri Amman Nagar (/properties/sri-amman-nagar)' },
  { path: '/properties/aishwarya-nagar', label: 'Aishwarya Nagar (/properties/aishwarya-nagar)' },
  { path: '/about', label: 'About Sree Hari Realty (/about)' },
  { path: '/contact', label: 'Contact Us & Site Visit Booking (/contact)' },
  { path: '/faq', label: 'Frequently Asked Questions (/faq)' },
  { path: '/blog', label: 'Market Insights & Real Estate Blog (/blog)' },
  { path: '/gallery', label: 'Layout & Development Gallery (/gallery)' }
];
const LAYOUT_STYLES = [
  'Auto Detect (Side-by-Side for Vertical, Top Banner for Land)',
  'Top Banner + Content Card',
  'Full Poster Card'
];
const DELAYS = ['Immediate (0s)', '3s (Default)', '5s', '10s'];
const FREQUENCIES = ['Once per Session', 'Always on Every Page Load', 'Once per Day'];

export default function AdminPopupsPage() {
  const [popups, setPopups] = useState<PromotionalPopup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingPopup, setIsSavingPopup] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PromotionalPopup | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<PromotionalPopup>>({
    title: '',
    subtitle: '',
    category: '',
    badge_tag: '',
    banner_image: '',
    highlights: '',
    cta_text: 'Claim Offer on WhatsApp',
    cta_action: 'whatsapp',
    whatsapp_number: '+91 73737 13559',
    custom_url: '',
    start_date: '',
    end_date: '',
    layout_style: 'Auto Detect (Side-by-Side for Vertical, Top Banner for Land)',
    display_delay: '3s (Default)',
    show_frequency: 'Once per Session',
    status: 'Active'
  });

  useEffect(() => {
    loadPopups();
  }, []);

  async function loadPopups() {
    setLoading(true);
    try {
      const res = await api.getPopups();
      if (res && res.success && Array.isArray(res.data)) {
        setPopups(res.data);
      } else {
        setPopups([]);
      }
    } catch (err) {
      console.error('Failed to load popups:', err);
      showToast('Error loading promotional popups');
    } finally {
      setLoading(false);
    }
  }

  async function refreshPopupsSilently(priorityPopup?: any) {
    try {
      const res = await api.getPopups();
      if (res && res.success && Array.isArray(res.data)) {
        let incoming: PromotionalPopup[] = res.data;
        if (priorityPopup && priorityPopup.id) {
          const idx = incoming.findIndex((p) => p.id === priorityPopup.id);
          if (idx !== -1) {
            incoming[idx] = { ...incoming[idx], ...priorityPopup };
          } else {
            incoming = [priorityPopup, ...incoming];
          }
        }
        setPopups(incoming);
      }
    } catch (err) {
      console.error('Failed to silently refresh popups:', err);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handleOpenCreate() {
    setEditingPopup(null);
    setFormData({
      title: '',
      subtitle: '',
      category: '',
      badge_tag: '',
      banner_image: '',
      highlights: '',
      cta_text: 'Claim Offer on WhatsApp',
      cta_action: 'whatsapp',
      whatsapp_number: '+91 73737 13559',
      custom_url: '',
      start_date: '',
      end_date: '',
      layout_style: 'Auto Detect (Side-by-Side for Vertical, Top Banner for Land)',
      display_delay: '3s (Default)',
      show_frequency: 'Once per Session',
      status: 'Active'
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(popup: PromotionalPopup) {
    setEditingPopup(popup);
    setFormData({
      title: popup.title || '',
      subtitle: popup.subtitle || '',
      category: popup.category || '',
      badge_tag: popup.badge_tag || '',
      banner_image: popup.banner_image || '',
      highlights: popup.highlights || '',
      cta_text: popup.cta_text || 'Claim Offer on WhatsApp',
      cta_action: popup.cta_action || 'whatsapp',
      whatsapp_number: popup.whatsapp_number !== undefined ? popup.whatsapp_number : '+91 73737 13559',
      custom_url: popup.custom_url || '',
      start_date: popup.start_date || '',
      end_date: popup.end_date || '',
      layout_style: popup.layout_style || 'Auto Detect (Side-by-Side for Vertical, Top Banner for Land)',
      display_delay: popup.display_delay || '3s (Default)',
      show_frequency: popup.show_frequency || 'Once per Session',
      status: popup.status || 'Active'
    });
    setIsModalOpen(true);
  }

  async function handleToggleStatus(popup: PromotionalPopup) {
    const nextStatus = popup.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updatePopup(popup.id, { status: nextStatus });
      if (res && res.success) {
        showToast(`Popup status changed to ${nextStatus}`);
        await loadPopups();
      } else {
        showToast(res.message || 'Failed to update popup status');
      }
    } catch (err: any) {
      showToast('Status update error: ' + err.message);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia({
          imageBase64: base64,
          filename: file.name
        });

        if (res && res.success && res.fileUrl) {
          setFormData((prev) => ({ ...prev, banner_image: res.fileUrl }));
          showToast('Image poster uploaded successfully');
        } else {
          showToast(res.message || 'Upload failed');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast('Upload error: ' + err.message);
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.title.trim()) {
      showToast('Please enter popup title before saving');
      return;
    }

    const payload = {
      ...formData,
      banner_image: formData.banner_image && formData.banner_image.trim() !== '' ? formData.banner_image.trim() : DEFAULT_POPUP_IMAGE
    };

    setIsSavingPopup(true);
    try {
      if (editingPopup && editingPopup.id) {
        const res = await api.updatePopup(editingPopup.id, payload);
        const updated = res?.data || { ...editingPopup, ...payload };
        setPopups((prev) => prev.map((p) => (p.id === editingPopup.id ? { ...p, ...updated } : p)));
        showToast('Promotional popup updated successfully');
        setIsModalOpen(false);
        refreshPopupsSilently(updated);
      } else {
        const res = await api.createPopup(payload);
        const created = res?.data;
        if (created) {
          setPopups((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        }
        showToast('New promotional popup published live!');
        setIsModalOpen(false);
        refreshPopupsSilently(created);
      }
    } catch (err: any) {
      showToast('Error saving popup: ' + err.message);
    } finally {
      setIsSavingPopup(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      const res = await api.deletePopup(deletingId);
      if (res && res.success) {
        showToast('Popup deleted successfully');
        await loadPopups();
      } else {
        showToast(res.message || 'Failed to delete popup');
      }
    } catch (err: any) {
      showToast('Delete error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Parse highlights for bullet list in live preview
  const highlightsList = (formData.highlights || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Popups
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage promotional banners, announcements, and festive offers
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> New Popup
        </button>
      </div>

      {/* Main Popups List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : popups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No promotional popups created</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create festive deals, special cashback offers, or new plot layout launch popup banners to engage website visitors.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Create First Popup
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popups.map((popup) => (
            <div
              key={popup.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              {/* Banner Poster Header */}
              <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={popup.banner_image || DEFAULT_POPUP_IMAGE}
                  alt={popup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_POPUP_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md uppercase tracking-wide border border-white/20">
                    {popup.badge_tag || 'FESTIVE OFFER'}
                  </span>
                </div>

                {/* Status Toggle Switch */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(popup)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md transition-colors cursor-pointer ${
                      popup.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-black/60 text-slate-300 border-white/20'
                    }`}
                  >
                    {popup.status === 'Active' ? '🟢 Active (Live)' : '⚪ Inactive (Draft)'}
                  </button>
                </div>
              </div>

              {/* Popup Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {popup.title}
                  </h3>
                  {popup.subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {popup.subtitle}
                    </p>
                  )}
                </div>

                {/* CTA Action Preview */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 gap-2">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium min-w-0 overflow-hidden">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{popup.cta_text || 'Claim Offer'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap ml-1">Delay: {popup.display_delay || '3s'}</span>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {popup.category || 'Festival'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(popup)}
                      title="Edit Popup"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(popup.id)}
                      title="Delete Popup"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PROMOTIONAL POPUP MODAL (SPLIT 2-COLUMN LAYOUT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {editingPopup ? 'Edit Promotional Popup' : 'Create Promotional Popup'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize banner visual poster, custom category, action buttons, and active dates.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Split Columns */}
            <div className="flex-1 overflow-hidden p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: FORM CONTROLS (col-span-7) */}
              <form onSubmit={handleSubmit} id="popupForm" className="lg:col-span-7 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)] pr-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Popup Title <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 🌾 Grand Pongal Property Mela 2026"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief 1-2 line description of this offer or announcement..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category / Campaign Type</label>
                      <span className="text-[10px] text-slate-500">Free-form or Select</span>
                    </div>
                    <input
                      type="text"
                      list="popup-category-list"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Festival, New Launch, or leave blank"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    />
                    <datalist id="popup-category-list">
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Badge Tag Text</label>
                      <span className="text-[10px] text-slate-500">Optional (blank = no badge)</span>
                    </div>
                    <input
                      type="text"
                      value={formData.badge_tag || ''}
                      onChange={(e) => setFormData({ ...formData, badge_tag: e.target.value })}
                      placeholder="e.g. 🎉 FESTIVE OFFER (Leave blank to hide)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Banner Poster Image URL + File Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Banner Poster Image (Land/Plot Landscape)</label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Best Size: 800 × 450 px (16:9)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.banner_image || ''}
                      onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-1500382017468-9049fed747ef..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Recommended dimensions: 800 × 450 pixels. Supports JPG, PNG, and WebP plot layout posters.
                  </p>

                  {/* Immediate Thumbnail Preview in Form */}
                  {formData.banner_image && formData.banner_image.trim() !== '' && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.banner_image}
                        alt="Uploaded Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_POPUP_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5">
                        <span className="text-[10px] text-white font-medium bg-black/60 px-2 py-0.5 rounded backdrop-blur-md">
                          Active Poster Image
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, banner_image: '' })}
                          className="text-[10px] text-rose-300 hover:text-white bg-rose-900/80 hover:bg-rose-800 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Highlights */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Key Highlights (1 point per line)</label>
                  <textarea
                    rows={3}
                    value={formData.highlights || ''}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    placeholder="Spot Patta Transfer & 0% Brokerage&#10;Ready for immediate plot construction&#10;Special ₹50,000 spot booking cashback"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 font-mono placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* CTA Button Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={formData.cta_text || ''}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      placeholder="e.g. Claim Festive Offer on WhatsApp"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">CTA Button Action</label>
                    <select
                      value={formData.cta_action || 'whatsapp'}
                      onChange={(e) => setFormData({ ...formData, cta_action: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="whatsapp">Open WhatsApp Direct Chat</option>
                      <option value="lead_form">Open Site Visit Lead Form</option>
                      <option value="call">Phone Call (Direct Dial)</option>
                      <option value="custom_url">Custom Website / Page URL</option>
                      <option value="none">No CTA Button (Announcement Only)</option>
                    </select>
                  </div>
                </div>

                {formData.cta_action === 'custom_url' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Destination Website / Link URL</label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Select Page or Enter Custom</span>
                    </div>

                    <select
                      value={
                        STANDARD_FRONTEND_PAGES.some((p) => p.path === formData.custom_url)
                          ? formData.custom_url
                          : formData.custom_url ? '__custom__' : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          if (STANDARD_FRONTEND_PAGES.some((p) => p.path === formData.custom_url)) {
                            setFormData({ ...formData, custom_url: '' });
                          }
                        } else {
                          setFormData({ ...formData, custom_url: val });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose a website page or select custom link --</option>
                      {STANDARD_FRONTEND_PAGES.map((p) => (
                        <option key={p.path} value={p.path}>
                          {p.label}
                        </option>
                      ))}
                      <option value="__custom__">★ Other / Enter Custom URL or External Link...</option>
                    </select>

                    {/* Custom Input shown when custom URL is selected or entered */}
                    {(!STANDARD_FRONTEND_PAGES.some((p) => p.path === formData.custom_url)) && (
                      <div className="pt-1 space-y-1">
                        <input
                          type="text"
                          value={formData.custom_url || ''}
                          onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                          placeholder="Type custom internal path (e.g. /properties/my-layout) or external https://..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Enter any custom internal route or external website link (starting with https://).
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(formData.cta_action === 'whatsapp' || formData.cta_action === 'call') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {formData.cta_action === 'whatsapp' ? 'WhatsApp Number (with Country Code)' : 'Phone Call Number (Direct Dial)'}
                      </label>
                      <span className="text-[10px] text-slate-500">Type custom or leave default</span>
                    </div>
                    <input
                      type="text"
                      value={formData.whatsapp_number || ''}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="+91 73737 13559"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      Company Live Line: +91 73737 13559. You can type another support/agent number if preferred.
                    </p>
                  </div>
                )}

                {formData.cta_action === 'lead_form' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
                    Clicking the CTA button triggers the on-site Site Visit Booking / Lead Generation form modal.
                  </div>
                )}

                {formData.cta_action === 'none' && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                    CTA button is disabled. This popup will render as a clean informational announcement or visual flyer without a button.
                  </div>
                )}

                {/* Dates & Layout Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date || ''}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Popup Layout Style</label>
                  <select
                    value={formData.layout_style || LAYOUT_STYLES[0]}
                    onChange={(e) => setFormData({ ...formData, layout_style: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {LAYOUT_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Display Delay</label>
                    <select
                      value={formData.display_delay || '3s (Default)'}
                      onChange={(e) => setFormData({ ...formData, display_delay: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {DELAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Show Frequency</label>
                    <select
                      value={formData.show_frequency || 'Once per Session'}
                      onChange={(e) => setFormData({ ...formData, show_frequency: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500/50 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Active">🟢 Active (Live)</option>
                      <option value="Inactive">⚪ Inactive (Draft)</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* RIGHT COLUMN: LIVE REALTIME PREVIEW (col-span-5) */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Live Realtime Preview
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {formData.layout_style === 'Full Poster Card'
                        ? 'Full Poster'
                        : formData.layout_style === 'Top Banner + Content Card'
                        ? 'Top Banner'
                        : 'Side-by-Side'}
                    </span>
                  </div>

                  {/* 1. PREVIEW: FULL POSTER CARD */}
                  {formData.layout_style === 'Full Poster Card' && (
                    <div className="bg-slate-900 border border-amber-400/30 rounded-3xl overflow-hidden shadow-2xl relative group" data-poster-preview="true">
                      <div className="relative h-96 w-full bg-slate-950 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.banner_image && formData.banner_image.trim() !== '' ? formData.banner_image : DEFAULT_POPUP_IMAGE}
                          alt="Preview Poster"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_POPUP_IMAGE;
                          }}
                        />

                        {/* Top Overlays */}
                        {Boolean(formData.badge_tag && formData.badge_tag.trim()) && (
                          <div className="absolute top-3 left-3 z-10">
                            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-gradient-to-r from-[#D61F69] to-pink-600 text-white shadow-lg uppercase tracking-wider border border-white/20">
                              {formData.badge_tag}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 backdrop-blur-md">
                            <X className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Bottom Gradient Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-5 space-y-2.5 z-10 image-overlay-text">
                          {Boolean(formData.category && formData.category.trim()) && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300">
                              {formData.category}
                            </span>
                          )}
                          <h3 className="text-base font-bold text-white leading-snug font-serif">
                            {formData.title || '🌾 Your Offer Title Here'}
                          </h3>
                          {formData.subtitle && (
                            <p className="text-[11px] text-white/90 line-clamp-2 leading-relaxed">
                              {formData.subtitle}
                            </p>
                          )}

                          {highlightsList.length > 0 && (
                            <div className="space-y-1 py-0.5">
                              {highlightsList.slice(0, 6).map((hl, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[11px] text-white">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">{hl}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* CTA Button */}
                          {formData.cta_action !== 'none' && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (formData.cta_action === 'lead_form') {
                                    showToast('Action: Opens Site Visit Lead Form modal on website');
                                  } else if (formData.cta_action === 'call') {
                                    showToast(`Action: Phone dialer to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                  } else if (formData.cta_action === 'custom_url') {
                                    showToast(`Action: Navigates to ${formData.custom_url || '/'}`);
                                  } else {
                                    showToast(`Action: Opens WhatsApp direct chat to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                  }
                                }}
                                className="w-full py-2.5 bg-gradient-to-r from-[#D61F69] via-pink-600 to-[#006452] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-white/20 transition cursor-pointer"
                              >
                                {formData.cta_action === 'lead_form' ? (
                                  <Send className="w-3.5 h-3.5" />
                                ) : formData.cta_action === 'call' ? (
                                  <Phone className="w-3.5 h-3.5" />
                                ) : formData.cta_action === 'custom_url' ? (
                                  <ExternalLink className="w-3.5 h-3.5" />
                                ) : (
                                  <MessageSquare className="w-3.5 h-3.5" />
                                )}
                                <span>{formData.cta_text || 'Claim Offer on WhatsApp'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. PREVIEW: TOP BANNER + CONTENT CARD */}
                  {formData.layout_style === 'Top Banner + Content Card' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group">
                      <div className="relative h-44 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.banner_image && formData.banner_image.trim() !== '' ? formData.banner_image : DEFAULT_POPUP_IMAGE}
                          alt="Preview Poster"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_POPUP_IMAGE;
                          }}
                        />

                        {/* Badge Tag */}
                        {Boolean(formData.badge_tag && formData.badge_tag.trim()) && (
                          <div className="absolute top-3 left-3">
                            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#006452] text-white shadow-lg uppercase tracking-wider border border-white/20">
                              {formData.badge_tag}
                            </span>
                          </div>
                        )}

                        {/* Close X */}
                        <div className="absolute top-3 right-3">
                          <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/20 backdrop-blur-md">
                            <X className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                        <div className="space-y-1">
                          {Boolean(formData.category && formData.category.trim()) && (
                            <span className="text-[10px] font-bold text-[#D61F69] uppercase tracking-wider block">
                              {formData.category}
                            </span>
                          )}
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug font-serif">
                            {formData.title || '🌾 Your Offer Title Here'}
                          </h3>
                          {formData.subtitle && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {formData.subtitle}
                            </p>
                          )}
                        </div>

                        {highlightsList.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {highlightsList.map((hl, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <span>{hl}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.cta_action !== 'none' && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (formData.cta_action === 'lead_form') {
                                  showToast('Action: Opens Site Visit Lead Form modal on website');
                                } else if (formData.cta_action === 'call') {
                                  showToast(`Action: Phone dialer to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                } else if (formData.cta_action === 'custom_url') {
                                  showToast(`Action: Navigates to ${formData.custom_url || '/'}`);
                                } else {
                                  showToast(`Action: Opens WhatsApp direct chat to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                }
                              }}
                              className="w-full py-2.5 bg-[#006452] hover:bg-[#005243] text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 border border-emerald-400/30 cursor-pointer"
                            >
                              {formData.cta_action === 'lead_form' ? (
                                <Send className="w-3.5 h-3.5" />
                              ) : formData.cta_action === 'call' ? (
                                <Phone className="w-3.5 h-3.5" />
                              ) : formData.cta_action === 'custom_url' ? (
                                <ExternalLink className="w-3.5 h-3.5" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5" />
                              )}
                              <span>{formData.cta_text || 'Claim Offer on WhatsApp'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. PREVIEW: AUTO DETECT / SIDE-BY-SIDE SPLIT */}
                  {formData.layout_style !== 'Full Poster Card' && formData.layout_style !== 'Top Banner + Content Card' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative grid grid-cols-12 group">
                      {/* Left: Image */}
                      <div className="col-span-5 relative min-h-[220px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.banner_image && formData.banner_image.trim() !== '' ? formData.banner_image : DEFAULT_POPUP_IMAGE}
                          alt="Preview Poster"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_POPUP_IMAGE;
                          }}
                        />

                        {/* Badge Tag */}
                        {Boolean(formData.badge_tag && formData.badge_tag.trim()) && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#D61F69] text-white shadow-lg uppercase tracking-wider border border-white/20">
                              {formData.badge_tag}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Content */}
                      <div className="col-span-7 p-3.5 space-y-2.5 bg-white dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100">
                        <div className="space-y-1">
                          {Boolean(formData.category && formData.category.trim()) && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                              {formData.category}
                            </span>
                          )}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug font-serif">
                            {formData.title || '🌾 Your Offer Title Here'}
                          </h3>
                          {formData.subtitle && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {formData.subtitle}
                            </p>
                          )}

                          {highlightsList.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {highlightsList.slice(0, 6).map((hl, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-700 dark:text-slate-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="truncate">{hl}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {formData.cta_action !== 'none' && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (formData.cta_action === 'lead_form') {
                                  showToast('Action: Opens Site Visit Lead Form modal on website');
                                } else if (formData.cta_action === 'call') {
                                  showToast(`Action: Phone dialer to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                } else if (formData.cta_action === 'custom_url') {
                                  showToast(`Action: Navigates to ${formData.custom_url || '/'}`);
                                } else {
                                  showToast(`Action: Opens WhatsApp direct chat to ${formData.whatsapp_number || '+91 73737 13559'}`);
                                }
                              }}
                              className="w-full py-2 bg-gradient-to-r from-[#006452] to-[#004f41] hover:opacity-95 text-white font-bold text-[11px] rounded-lg shadow-md flex items-center justify-center gap-1.5 border border-emerald-400/30 cursor-pointer"
                            >
                              {formData.cta_action === 'lead_form' ? (
                                <Send className="w-3 h-3" />
                              ) : formData.cta_action === 'call' ? (
                                <Phone className="w-3 h-3" />
                              ) : formData.cta_action === 'custom_url' ? (
                                <ExternalLink className="w-3.5 h-3.5" />
                              ) : (
                                <MessageSquare className="w-3 h-3" />
                              )}
                              <span className="truncate">{formData.cta_text || 'Claim Offer'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center italic">
                  Live preview changes layout and CTA action automatically as you edit.
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="popupForm"
                disabled={isSavingPopup}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingPopup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Popup...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Publish Popup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Delete Promotional Popup?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action will remove this ad popup banner from website display.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Delete Popup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
