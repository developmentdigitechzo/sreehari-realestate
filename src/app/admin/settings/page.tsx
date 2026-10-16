'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Trash2,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  Sun,
  Moon,
  Plus,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit2,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { applyCrmTheme, applyCrmThemeMode, getCrmThemeMode, setCrmThemeMode, CrmThemeMode } from '@/lib/theme';
import { HeroBanner } from '@/lib/types';

const COLOR_PRESETS = [
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Teal Cyan', hex: '#14b8a6' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Golden Amber', hex: '#f59e0b' },
  { name: 'Vibrant Orange', hex: '#eb5e28' },
  { name: 'Deep Purple', hex: '#8b5cf6' },
  { name: 'Soft Cream', hex: '#FFFCDD' },
];

export const DEFAULT_HERO_BANNER: HeroBanner = {
  id: 'default_entrance_hero',
  banner_type: 'overlay',
  image_url: '/hero_gate_entrance.png',
  title: 'A Better Place to Build Your Future',
  subtitle: 'Thoughtfully planned plots. A greener community. A place to call your own with 100% DTCP & RERA approved peace of mind.',
  badge_text: 'PREMIUM GATED COMMUNITY PLOTS',
  button1_text: 'Explore Plots',
  button1_link: '/properties',
  button2_text: 'Book Site Visit',
  button2_link: 'enquiry',
  button2_active: true,
  button_text: 'Explore Plots',
  button_link: '/properties',
  project_name: 'Park Avenue',
  active: true,
  order: 1
};

function getContrastTextColor(hexColor?: string) {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#090d16' : '#ffffff';
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'hero_banners'>('branding');

  const [settings, setSettings] = useState({
    company_name: 'Sree Hari Realty Promoters',
    phone_primary: '+91 98424 01991',
    phone_whatsapp: '+91 98424 01991',
    email_primary: 'contact@sreeharirealty.com',
    office_address: 'No. 12, Main Road, Thiruverumbur, Trichy - 620013',
    working_hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
    logo_url: '',
    primary_color: '#10b981',
    theme_mode: 'light' as CrmThemeMode
  });

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [autoplayInterval, setAutoplayInterval] = useState<number>(6);

  const [themeMode, setThemeMode] = useState<CrmThemeMode>('light');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Banner Modal States
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerModalUploading, setBannerModalUploading] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<HeroBanner>>({
    banner_type: 'graphic',
    image_url: '',
    mobile_image_url: '',
    title: '',
    subtitle: '',
    badge_text: '',
    button1_text: 'Explore Plots',
    button1_link: '/properties',
    button2_text: 'Book Site Visit',
    button2_link: 'enquiry',
    button2_active: true,
    project_name: '',
    active: true,
    order: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerDesktopFileRef = useRef<HTMLInputElement>(null);
  const bannerMobileFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const activeMode = getCrmThemeMode();
    setThemeMode(activeMode);
    applyCrmThemeMode(activeMode);

    loadSettings();

    const handleThemeChange = (e: any) => {
      if (e.detail?.mode) {
        setThemeMode(e.detail.mode);
      }
    };
    window.addEventListener('crmThemeModeChanged', handleThemeChange);
    return () => window.removeEventListener('crmThemeModeChanged', handleThemeChange);
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await api.getSettings().catch(() => null);
      if (res?.data) {
        const loadedColor = res.data.primary_color || '#10b981';
        const loadedThemeMode = (res.data.theme_mode === 'dark' || res.data.theme_mode === 'light')
          ? res.data.theme_mode
          : getCrmThemeMode();

        setSettings({
          company_name: res.data.company_name || 'Sree Hari Realty Promoters',
          phone_primary: res.data.phone_primary || '+91 98424 01991',
          phone_whatsapp: res.data.phone_whatsapp || '+91 98424 01991',
          email_primary: res.data.email_primary || 'contact@sreeharirealty.com',
          office_address: res.data.office_address || 'No. 12, Main Road, Thiruverumbur, Trichy - 620013',
          working_hours: res.data.working_hours || 'Mon - Sat: 9:00 AM - 7:00 PM',
          logo_url: res.data.logo_url || '',
          primary_color: loadedColor,
          theme_mode: loadedThemeMode
        });

        // Pre-load default slide into the list if empty so client can edit/turn it off
        if (Array.isArray(res.data.hero_banners) && res.data.hero_banners.length > 0) {
          const mapped = res.data.hero_banners.map((b: any, idx: number) => ({
            ...b,
            button1_text: b.button1_text || b.button_text || 'Explore Plots',
            button1_link: b.button1_link || b.button_link || '/properties',
            button2_text: b.button2_text || 'Book Site Visit',
            button2_link: b.button2_link || 'enquiry',
            button2_active: b.button2_active !== false,
            order: b.order || idx + 1
          }));
          setHeroBanners(mapped);
        } else {
          setHeroBanners([DEFAULT_HERO_BANNER]);
        }

        if (res.data.hero_autoplay_interval) {
          setAutoplayInterval(Number(res.data.hero_autoplay_interval) || 6);
        }

        handleColorChange(loadedColor);
        setThemeMode(loadedThemeMode);
        applyCrmThemeMode(loadedThemeMode);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleThemeModeChange = (newMode: CrmThemeMode) => {
    setThemeMode(newMode);
    setCrmThemeMode(newMode);
    setSettings((prev) => ({ ...prev, theme_mode: newMode }));
    setMessage(`Switched to ${newMode === 'light' ? 'Light Theme (Default)' : 'Dark Theme'} mode. Remember to save settings.`);
  };

  const handleColorChange = (newColor: string) => {
    setSettings((prev) => ({ ...prev, primary_color: newColor }));
    if (typeof window !== 'undefined' && newColor) {
      localStorage.setItem('crm_primary_color', newColor);
      applyCrmTheme(newColor);
      window.dispatchEvent(new CustomEvent('colorPreview', { detail: { color: newColor } }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setSettings((prev) => ({ ...prev, logo_url: res.fileUrl }));
          setMessage('Logo uploaded successfully! Click "Save Branding & Settings" to apply.');
        } else {
          alert(res.message || 'Logo upload failed');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload error: ' + err.message);
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, logo_url: '' }));
    setMessage('Logo removed. Click "Save Branding & Settings" to update.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...settings,
        theme_mode: themeMode,
        hero_banners: heroBanners,
        hero_autoplay_interval: autoplayInterval
      };
      await api.updateSettings(payload);
      setCrmThemeMode(themeMode);
      setMessage(`Settings and ${themeMode === 'light' ? 'Light Theme (Default)' : 'Dark Theme'} saved successfully across CRM.`);

      if (typeof window !== 'undefined') {
        localStorage.setItem('crm_primary_color', settings.primary_color);
        window.dispatchEvent(new Event('settingsUpdated'));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // HERO BANNER CAROUSEL ACTIONS
  // =========================================================================

  const handleOpenAddBanner = () => {
    setEditingBannerId(null);
    setBannerForm({
      banner_type: 'graphic',
      image_url: '',
      mobile_image_url: '',
      title: '',
      subtitle: '',
      badge_text: 'NEW LAUNCH',
      button1_text: 'Explore Plots',
      button1_link: '/properties',
      button2_text: 'Book Site Visit',
      button2_link: 'enquiry',
      button2_active: true,
      project_name: '',
      active: true,
      order: heroBanners.length + 1
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (banner: HeroBanner) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      ...banner,
      button1_text: banner.button1_text || banner.button_text || 'Explore Plots',
      button1_link: banner.button1_link || banner.button_link || '/properties',
      button2_text: banner.button2_text || 'Book Site Visit',
      button2_link: banner.button2_link || 'enquiry',
      button2_active: banner.button2_active !== false,
      project_name: banner.project_name || banner.title || ''
    });
    setIsBannerModalOpen(true);
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerModalUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia({
          imageBase64: base64,
          filename: file.name
        });

        if (res && res.success && res.fileUrl) {
          if (isMobile) {
            setBannerForm((prev) => ({ ...prev, mobile_image_url: res.fileUrl }));
          } else {
            setBannerForm((prev) => ({ ...prev, image_url: res.fileUrl }));
          }
        } else {
          alert(res.message || 'Image upload failed');
        }
        setBannerModalUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload error: ' + err.message);
      setBannerModalUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.image_url) {
      alert('Please provide or upload a banner image.');
      return;
    }

    let updatedBanners: HeroBanner[] = [];

    if (editingBannerId) {
      updatedBanners = heroBanners.map((b) =>
        b.id === editingBannerId
          ? ({
              ...b,
              ...bannerForm,
              button_text: bannerForm.button1_text,
              button_link: bannerForm.button1_link
            } as HeroBanner)
          : b
      );
    } else {
      const newBanner: HeroBanner = {
        id: `banner_${Date.now()}`,
        banner_type: bannerForm.banner_type || 'graphic',
        image_url: bannerForm.image_url || '',
        mobile_image_url: bannerForm.mobile_image_url || '',
        title: bannerForm.title || '',
        subtitle: bannerForm.subtitle || '',
        badge_text: bannerForm.badge_text || '',
        button1_text: bannerForm.button1_text || 'Explore Plots',
        button1_link: bannerForm.button1_link || '/properties',
        button2_text: bannerForm.button2_text || 'Book Site Visit',
        button2_link: bannerForm.button2_link || 'enquiry',
        button2_active: bannerForm.button2_active !== false,
        button_text: bannerForm.button1_text || 'Explore Plots',
        button_link: bannerForm.button1_link || '/properties',
        project_name: bannerForm.project_name || '',
        active: bannerForm.active ?? true,
        order: bannerForm.order || heroBanners.length + 1
      };
      updatedBanners = [...heroBanners, newBanner];
    }

    setHeroBanners(updatedBanners);
    setIsBannerModalOpen(false);

    try {
      await api.updateSettings({
        hero_banners: updatedBanners,
        hero_autoplay_interval: autoplayInterval
      });
      setMessage('Hero banners updated and saved successfully.');
    } catch (err: any) {
      console.error('Failed to auto-save banners:', err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner slide?')) return;
    const updated = heroBanners.filter((b) => b.id !== id);
    setHeroBanners(updated);

    try {
      await api.updateSettings({
        hero_banners: updated,
        hero_autoplay_interval: autoplayInterval
      });
      setMessage('Hero banner removed successfully.');
    } catch (err: any) {
      console.error('Failed to update after deletion:', err);
    }
  };

  const handleToggleBannerActive = async (id: string) => {
    const updated = heroBanners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setHeroBanners(updated);

    try {
      await api.updateSettings({
        hero_banners: updated,
        hero_autoplay_interval: autoplayInterval
      });
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroBanners.length) return;

    const copy = [...heroBanners];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((b, idx) => ({ ...b, order: idx + 1 }));
    setHeroBanners(reordered);

    try {
      await api.updateSettings({
        hero_banners: reordered,
        hero_autoplay_interval: autoplayInterval
      });
    } catch (err: any) {
      console.error('Failed to reorder banners:', err);
    }
  };

  const currentContrastText = getContrastTextColor(settings.primary_color);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <SettingsIcon className="w-7 h-7" style={{ color: settings.primary_color || '#10b981' }} />
            <span>Admin Settings & Homepage Banners</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure branding, CRM themes, and manage auto-sliding Hero Banners for the public website.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & General Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hero_banners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'hero_banners'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Banners & Carousel</span>
          {heroBanners.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950">
              {heroBanners.length}
            </span>
          )}
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: BRANDING & GENERAL OFFICE SETTINGS
          ========================================================================= */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">Company Office & Contact Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set primary helpline numbers, WhatsApp routing, and official address.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Company / Brand Name</label>
                <input
                  type="text"
                  value={settings.company_name || ''}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Primary Call Phone (10 Digits)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit phone"
                    value={settings.phone_primary ? settings.phone_primary.replace(/\D/g, '').slice(0, 10) : ''}
                    onChange={(e) => setSettings({ ...settings, phone_primary: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">WhatsApp Number (10 Digits)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit phone"
                    value={settings.phone_whatsapp ? settings.phone_whatsapp.replace(/\D/g, '').slice(0, 10) : ''}
                    onChange={(e) => setSettings({ ...settings, phone_whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Office Email</label>
                <input
                  type="email"
                  value={settings.email_primary || ''}
                  onChange={(e) => setSettings({ ...settings, email_primary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Trichy Office Address</label>
                <textarea
                  rows={3}
                  value={settings.office_address || ''}
                  onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Working Hours</label>
                <input
                  type="text"
                  value={settings.working_hours || ''}
                  onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: APPEARANCE & CRM THEME MODE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Appearance & CRM Theme Mode</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your CRM workspace visual theme. Light Theme is the default for daylight productivity; Dark Theme provides high-contrast nighttime comfort.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => handleThemeModeChange('light')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  themeMode === 'light'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>Light Theme</span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Default
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">High-clarity daylight theme</p>
                      </div>
                    </div>
                    {themeMode === 'light' ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700" />
                    )}
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleThemeModeChange('dark')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  themeMode === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Dark Theme</h3>
                        <p className="text-[11px] text-slate-400">Deep luxury night mode</p>
                      </div>
                    </div>
                    {themeMode === 'dark' ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BRAND IDENTITY & PRIMARY COLOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: settings.primary_color || '#10b981' }} />
                <span>Brand Identity & Primary Color</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your official company logo and choose the primary accent color.
              </p>
            </div>

            {/* Logo Upload Section */}
            <div className="space-y-3">
              <label className="block text-slate-200 font-bold text-sm">Company logo</label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="w-28 h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt="Brand Logo"
                      className="max-w-full max-h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center text-slate-500">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">No logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" style={{ color: settings.primary_color || '#10b981' }} />
                      <span>{uploading ? 'Uploading...' : 'Upload logo'}</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {settings.logo_url && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs border border-rose-900/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Recommended transparent PNG or SVG logo image. Max file size: 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Color Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="block text-slate-200 font-bold text-sm">Primary color</label>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/20 shadow-lg shrink-0 transition-transform"
                    style={{ backgroundColor: settings.primary_color || '#10b981' }}
                    title="Active Brand Color Preview"
                  />

                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      value={settings.primary_color || '#10b981'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#FFFCDD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="color"
                      value={settings.primary_color && settings.primary_color.startsWith('#') && (settings.primary_color.length === 7 || settings.primary_color.length === 4) ? settings.primary_color : '#10b981'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute right-2 top-2 w-7 h-7 rounded-lg cursor-pointer bg-transparent border-none"
                      title="Choose Custom Color Picker"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleColorChange(preset.hex)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          settings.primary_color?.toLowerCase() === preset.hex.toLowerCase()
                            ? 'bg-slate-800 border-white text-white shadow-sm ring-1 ring-white/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.hex }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: settings.primary_color || '#10b981',
                  color: currentContrastText
                }}
                className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 text-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Branding & Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 2: HERO BANNERS & CAROUSEL MANAGEMENT (HYBRID & ZERO-CROP)
          ========================================================================= */}
      {activeTab === 'hero_banners' && (
        <div className="space-y-6 text-xs">
          {/* Top Controls Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Homepage Hero Banners & Slider</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage promotional posters (Casagrand zero-crop flyers) and photos with dynamic text. Reorder slides, toggle visibility, and configure two buttons.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Autoplay Interval Control */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-[11px]">Slide Delay:</span>
                <select
                  value={autoplayInterval}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    setAutoplayInterval(val);
                    await api.updateSettings({ hero_autoplay_interval: val }).catch(() => null);
                  }}
                  className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value={5} className="bg-slate-900 text-white">5 seconds</option>
                  <option value={6} className="bg-slate-900 text-white">6 seconds (Default)</option>
                  <option value={7} className="bg-slate-900 text-white">7 seconds</option>
                  <option value={8} className="bg-slate-900 text-white">8 seconds</option>
                </select>
              </div>

              {/* Add New Slide Button */}
              <button
                type="button"
                onClick={handleOpenAddBanner}
                className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Banner Slide</span>
              </button>
            </div>
          </div>

          {/* Banners List */}
          {heroBanners.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-white font-bold text-sm">No Custom Banners Added Yet</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Click &quot;Add Banner Slide&quot; to upload promotional project flyers or photos that will auto-slide every {autoplayInterval} seconds.
              </p>
              <button
                type="button"
                onClick={handleOpenAddBanner}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Slide</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {heroBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    banner.active
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Left: Preview thumbnail & details */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Thumbnail */}
                    <div className="w-28 sm:w-36 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          Slide #{index + 1}
                        </span>

                        {banner.banner_type === 'graphic' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Graphic Flyer (Zero-Crop)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Photo + Dynamic Text
                          </span>
                        )}

                        {banner.active ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Inactive (Hidden)
                          </span>
                        )}
                      </div>

                      <h4 className="text-white font-bold text-sm">
                        {banner.title || (banner.banner_type === 'graphic' ? 'Marketing Flyer Poster' : 'Untitled Slide')}
                      </h4>

                      {banner.subtitle && (
                        <p className="text-slate-400 text-xs line-clamp-1 max-w-md">
                          {banner.subtitle}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                        {banner.banner_type === 'overlay' ? (
                          <>
                            <span>Btn 1: {banner.button1_text || banner.button_text || 'Explore Plots'}</span>
                            {banner.button2_active !== false && (
                              <span>Btn 2: {banner.button2_text || 'Book Site Visit'}</span>
                            )}
                          </>
                        ) : (
                          <span>Click Link: {banner.button1_link || banner.button_link || 'enquiry'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveBanner(index, 'up')}
                      title="Move slide up"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === heroBanners.length - 1}
                      onClick={() => handleMoveBanner(index, 'down')}
                      title="Move slide down"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner.id)}
                      title={banner.active ? 'Hide slide from homepage' : 'Show slide on homepage'}
                      className={`p-2 rounded-xl border cursor-pointer ${
                        banner.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'
                      }`}
                    >
                      {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanner(banner)}
                      title="Edit slide"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      title="Delete slide"
                      className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-900/50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT BANNER SLIDE MODAL (STREAMLINED & CONCISE)
          ========================================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 md:p-7 space-y-5 shadow-2xl animate-fade-in text-xs text-slate-900 dark:text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{editingBannerId ? 'Edit Slide' : 'Add Banner Slide'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner Style Selector */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">Slide Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, banner_type: 'graphic' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    bannerForm.banner_type === 'graphic'
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Graphic Poster</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Full flyer (text already in image)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, banner_type: 'overlay' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    bannerForm.banner_type === 'overlay'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Photo + Text</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Photo with title and buttons
                  </p>
                </button>
              </div>
            </div>

            {/* Desktop Banner Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                Banner Image <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Image URL or upload below"
                  value={bannerForm.image_url || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => bannerDesktopFileRef.current?.click()}
                  disabled={bannerModalUploading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold inline-flex items-center gap-1.5 shrink-0 border border-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{bannerModalUploading ? 'Uploading...' : 'Upload'}</span>
                </button>
                <input
                  ref={bannerDesktopFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerFileUpload(e, false)}
                  className="hidden"
                />
              </div>

              {bannerForm.image_url && (
                <div className="mt-1.5 w-full h-28 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                  <img
                    src={bannerForm.image_url}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Optional Mobile Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                Mobile Image <span className="text-[10.5px] font-normal text-slate-500">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Optional mobile image URL"
                  value={bannerForm.mobile_image_url || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, mobile_image_url: e.target.value })}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => bannerMobileFileRef.current?.click()}
                  disabled={bannerModalUploading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold inline-flex items-center gap-1.5 shrink-0 border border-slate-300 dark:border-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <input
                  ref={bannerMobileFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerFileUpload(e, true)}
                  className="hidden"
                />
              </div>
            </div>

            {/* DYNAMIC TEXT FIELDS (Only when banner_type === 'overlay') */}
            {bannerForm.banner_type === 'overlay' ? (
              <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. PREMIUM PLOTS"
                      value={bannerForm.badge_text || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, badge_text: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. A Better Place to Build Your Future"
                      value={bannerForm.title || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={bannerForm.subtitle || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Button 1 */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-slate-500 text-[10.5px] mb-1">Button 1 Text</label>
                    <input
                      type="text"
                      placeholder="Explore Plots"
                      value={bannerForm.button1_text || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, button1_text: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10.5px] mb-1">Button 1 Link</label>
                    <input
                      type="text"
                      placeholder="/properties"
                      value={bannerForm.button1_link || ''}
                      onChange={(e) => setBannerForm({ ...bannerForm, button1_link: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Button 2 */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Button 2</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500">
                      <input
                        type="checkbox"
                        checked={bannerForm.button2_active ?? true}
                        onChange={(e) => setBannerForm({ ...bannerForm, button2_active: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Enable</span>
                    </label>
                  </div>

                  {(bannerForm.button2_active ?? true) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="Book Site Visit"
                        value={bannerForm.button2_text || ''}
                        onChange={(e) => setBannerForm({ ...bannerForm, button2_text: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="enquiry or /contact"
                        value={bannerForm.button2_link || ''}
                        onChange={(e) => setBannerForm({ ...bannerForm, button2_link: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* GRAPHIC FLYER CLICK ACTION */
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs">
                  Click Link / Action
                </label>
                <input
                  type="text"
                  placeholder="enquiry or /properties or project URL"
                  value={bannerForm.button1_link || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, button1_link: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Active Toggle */}
            <div className="flex items-center gap-2.5">
              <input
                id="activeBannerToggle"
                type="checkbox"
                checked={bannerForm.active ?? true}
                onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="activeBannerToggle" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                Active on public homepage
              </label>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBanner}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md cursor-pointer"
              >
                {editingBannerId ? 'Update Slide' : 'Save Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
