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
  X
} from 'lucide-react';

import { applyCrmTheme, getContrastTextColor } from '@/lib/theme';

interface SidebarProps {
  userEmail?: string;
  username?: string;
  role?: string;
  permissions?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  userEmail,
  username,
  role,
  permissions = ['ALL'],
  isOpen = false,
  onClose
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('Sree Hari Realty');
  const [primaryColor, setPrimaryColor] = useState<string>('#10b981');

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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Responsive Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen lg:h-full lg:sticky lg:top-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header with Dynamic Logo & Brand Name */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {brandLogo ? (
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-700/60 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-md">
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

          {/* Close button for mobile drawer */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area (Hidden scrollbar) */}
        <nav className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-h-0 p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Staff CRM Navigation ({visibleNavItems.length} Modules)
          </div>
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                style={isActive ? { backgroundColor: primaryColor, color: contrastText } : {}}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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

        {/* Footer Profile & Logout - Matching User Reference Image */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-base shrink-0 shadow-sm">
                {(username || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 truncate">
                <p className="text-sm font-bold text-white truncate leading-tight">
                  {username || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5 font-medium">
                  {userEmail || 'admin@sreeharirealty.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout from CRM"
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-950/70 hover:border-rose-800/80 text-rose-400 hover:text-rose-200 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
              aria-label="Logout CRM"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
