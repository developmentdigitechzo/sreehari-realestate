'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeAuthToken, api } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FolderKanban,
  Grid,
  Image as ImageIcon,
  Settings,
  LogOut,
  Newspaper,
  Megaphone,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';

import { applyCrmTheme, getContrastTextColor, CrmThemeMode, getCrmThemeMode, setCrmThemeMode } from '@/lib/theme';

interface SidebarProps {
  userEmail?: string;
  username?: string;
  role?: string;
  permissions?: string[];
  currentThemeMode?: CrmThemeMode;
  onToggleThemeMode?: (mode: CrmThemeMode) => void;
}

export default function Sidebar({
  userEmail,
  username,
  role,
  permissions = ['ALL'],
  currentThemeMode,
  onToggleThemeMode
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('Sree Hari Realty');
  const [primaryColor, setPrimaryColor] = useState<string>('#10b981');
  const [themeMode, setThemeMode] = useState<CrmThemeMode>(currentThemeMode || getCrmThemeMode());

  useEffect(() => {
    if (currentThemeMode) setThemeMode(currentThemeMode);
  }, [currentThemeMode]);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.mode) setThemeMode(e.detail.mode);
    };
    window.addEventListener('crmThemeModeChanged', handleThemeChange);
    return () => window.removeEventListener('crmThemeModeChanged', handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const nextMode: CrmThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    if (onToggleThemeMode) {
      onToggleThemeMode(nextMode);
    } else {
      setCrmThemeMode(nextMode);
      api.updateSettings({ theme_mode: nextMode }).catch(() => null);
    }
  };

  useEffect(() => {
    loadBrandSettings();

    const handleUpdate = () => {
      loadBrandSettings();
    };

    const handleColorPreview = (e: any) => {
      if (e.detail?.color) {
        setPrimaryColor(e.detail.color);
        applyCrmTheme(e.detail.color);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('settingsUpdated', handleUpdate);
      window.addEventListener('colorPreview', handleColorPreview);
      return () => {
        window.removeEventListener('settingsUpdated', handleUpdate);
        window.removeEventListener('colorPreview', handleColorPreview);
      };
    }
  }, []);

  async function loadBrandSettings() {
    try {
      const savedColor = typeof window !== 'undefined' ? localStorage.getItem('crm_primary_color') : null;
      if (savedColor) {
        setPrimaryColor(savedColor);
        applyCrmTheme(savedColor);
      }

      const res = await api.getSettings().catch(() => null);
      if (res?.data) {
        if (res.data.logo_url) setBrandLogo(res.data.logo_url);
        else setBrandLogo(null);
        if (res.data.company_name) setBrandName(res.data.company_name);
        if (res.data.primary_color) {
          setPrimaryColor(res.data.primary_color);
          if (typeof window !== 'undefined') {
            localStorage.setItem('crm_primary_color', res.data.primary_color);
          }
          applyCrmTheme(res.data.primary_color);
        }
      }
    } catch {
      // fallback
    }
  }

  const handleLogout = () => {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_user');
      localStorage.removeItem('crm_primary_color');
    }
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'CRM Leads & Pipeline', href: '/admin/leads', icon: Users },
    { name: 'Site Visit Manager', href: '/admin/site-visits', icon: CalendarCheck },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Plots Inventory', href: '/admin/plots', icon: Grid },
    { name: 'Blog Manager', href: '/admin/blogs', icon: Newspaper },
    { name: 'Ad & Seasonal Popups', href: '/admin/popups', icon: Megaphone },
    { name: 'Media Gallery', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Settings & Office', href: '/admin/settings', icon: Settings },
    { name: 'Staff & Permissions', href: '/admin/staff', icon: ShieldCheck },
  ];

  // Filter items based on staff module access permissions
  const hasFullAccess = !permissions || permissions.includes('ALL') || role === 'super_admin' || role === 'admin';
  const visibleNavItems = hasFullAccess
    ? navItems
    : navItems.filter(item => permissions.includes(item.href));

  const contrastText = getContrastTextColor(primaryColor);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Header with Dynamic Logo & Brand Name */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          {brandLogo ? (
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogo}
                alt="Brand Logo"
                className="max-h-full max-w-full object-contain"
                onError={() => setBrandLogo(null)}
              />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shrink-0 transition-all duration-200"
              style={{ backgroundColor: primaryColor, color: contrastText }}
            >
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="truncate">
            <h1 className="font-bold text-white text-base leading-tight tracking-wide truncate">
              {brandName}
            </h1>
            <p className="text-xs font-semibold tracking-wider uppercase mt-0.5 transition-colors duration-200" style={{ color: primaryColor }}>
              Admin CRM Suite
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Staff CRM Navigation ({visibleNavItems.length} Modules)
          </div>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={isActive ? { backgroundColor: primaryColor, color: contrastText } : {}}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'shadow-md shadow-slate-950/40 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" style={isActive ? { color: contrastText } : {}} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Theme Toggle, Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5">
        {/* Quick Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 transition-all text-slate-300 group cursor-pointer"
          title={`Currently ${themeMode === 'light' ? 'Light Theme (Default)' : 'Dark Theme'}. Click to toggle.`}
        >
          <div className="flex items-center gap-2">
            {themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span className="font-semibold text-xs">
              {themeMode === 'light' ? 'Light Theme' : 'Dark Theme'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 group-hover:text-slate-200 transition-colors">
            {themeMode === 'light' ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {username || userEmail || 'Staff Member'}
            </p>
            <p className="text-[10px] font-mono truncate transition-colors duration-200" style={{ color: primaryColor }}>
              {role || 'Verified Staff Account'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout CRM</span>
        </button>
      </div>
    </aside>
  );
}
