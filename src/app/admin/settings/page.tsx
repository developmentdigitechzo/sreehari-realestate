'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Settings as SettingsIcon, Save, Upload, Trash2, Palette, Image as ImageIcon, CheckCircle2, Sun, Moon } from 'lucide-react';
import { applyCrmTheme, applyCrmThemeMode, getCrmThemeMode, setCrmThemeMode, CrmThemeMode } from '@/lib/theme';

const COLOR_PRESETS = [
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Teal Cyan', hex: '#14b8a6' },
  { name: 'Royal Blue', hex: '#3b82f6' },
  { name: 'Golden Amber', hex: '#f59e0b' },
  { name: 'Vibrant Orange', hex: '#eb5e28' },
  { name: 'Deep Purple', hex: '#8b5cf6' },
  { name: 'Soft Cream', hex: '#FFFCDD' },
];

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

  const [themeMode, setThemeMode] = useState<CrmThemeMode>('light'); // Light Theme default!
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Initialize active CRM theme mode (Default: Light)
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

        // Sync with real-time preview
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
        theme_mode: themeMode
      };
      await api.updateSettings(payload);
      setCrmThemeMode(themeMode);
      setMessage(`Settings and ${themeMode === 'light' ? 'Light Theme (Default)' : 'Dark Theme'} saved successfully across CRM.`);

      // Dispatch custom event to update sidebar logo & theme color in real-time
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

  const currentContrastText = getContrastTextColor(settings.primary_color);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
            <SettingsIcon className="w-7 h-7" style={{ color: settings.primary_color || '#10b981' }} />
            <span>Admin Office, Logo & Theme Settings</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure office details, upload brand logo, and customize your CRM theme color palette in real time.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* FIRST SECTION: COMPANY OFFICE & CONTACT INFORMATION CARD */}
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

        {/* SECTION 2: APPEARANCE & CRM THEME MODE CARD */}
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
            {/* Light Theme Card (Default) */}
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
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700" />
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Clean crisp light background, pure white cards, subtle gray dividers, and high-contrast text. Ideal for office work and daylight conditions.
                </p>

                {/* Mini Visual Preview Mockup */}
                <div className="rounded-xl border border-slate-300 bg-white p-3 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-16 bg-slate-800 rounded" />
                    <div className="h-2 w-6 bg-emerald-500 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded" />
                  <div className="h-1.5 w-3/4 bg-slate-200 rounded" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Default workspace theme</span>
                <span className={`font-bold ${themeMode === 'light' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {themeMode === 'light' ? '● Active Theme' : 'Click to activate'}
                </span>
              </div>
            </div>

            {/* Dark Theme Card */}
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
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>Dark Theme</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Deep slate low-light theme</p>
                    </div>
                  </div>
                  {themeMode === 'dark' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700" />
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Deep dark slate background, glowing borders, and luminous metrics. Reduces eye strain during late-night or low-light work sessions.
                </p>

                {/* Mini Visual Preview Mockup */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                    <div className="h-2 w-6 bg-emerald-500 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded" />
                  <div className="h-1.5 w-3/4 bg-slate-800 rounded" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Dark aesthetic mode</span>
                <span className={`font-bold ${themeMode === 'dark' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {themeMode === 'dark' ? '● Active Theme' : 'Click to activate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* THIRD SECTION: BRAND LOGO & THEME COLOR CUSTOMIZATION CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Palette className="w-5 h-5" style={{ color: settings.primary_color || '#10b981' }} />
              <span>Brand Logo & Theme Color</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize your CRM company logo and primary color palette. Changes preview in real-time.
            </p>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-3">
            <label className="block text-slate-200 font-bold text-sm">Logo</label>

            <div className="flex items-center gap-5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {/* Logo Preview Box */}
              <div className="w-24 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                {settings.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={settings.logo_url}
                    alt="Company Brand Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                    <span className="text-[10px] font-mono">No Logo</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
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
                      className="px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-semibold text-xs border border-rose-900/40 transition-colors inline-flex items-center gap-1.5"
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
                {/* Visual Color Block Preview */}
                <div
                  className="w-12 h-12 rounded-xl border border-white/20 shadow-lg shrink-0 transition-transform"
                  style={{ backgroundColor: settings.primary_color || '#10b981' }}
                  title="Active Brand Color Preview"
                />

                {/* Color Hex Input (Realtime color update on typing/pasting) */}
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

              {/* Color Presets */}
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
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
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
              className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Branding & Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
