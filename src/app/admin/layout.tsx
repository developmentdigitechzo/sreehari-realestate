'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAuthToken, removeAuthToken, api } from '@/lib/api';
import { User } from '@/lib/types';
import { applyCrmTheme, applyCrmThemeMode, getCrmThemeMode, setCrmThemeMode, CrmThemeMode } from '@/lib/theme';
import { Menu, Sun, Moon } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState<CrmThemeMode>('light'); // Light Theme is Default!
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // CRM Global Theme synchronization (Theme Mode + Brand Accent Color)
  useEffect(() => {
    // 1. Initialize Theme Mode (Default: Light)
    const initialMode = getCrmThemeMode();
    setThemeMode(initialMode);
    applyCrmThemeMode(initialMode);

    // 2. Initialize Brand Primary Color
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('crm_primary_color') : null;
    if (savedColor) {
      applyCrmTheme(savedColor);
    }

    // 3. Sync from backend settings
    api.getSettings().then((res) => {
      if (res?.data) {
        if (res.data.theme_mode && (res.data.theme_mode === 'light' || res.data.theme_mode === 'dark')) {
          if (typeof window !== 'undefined' && !localStorage.getItem('crm_theme_mode')) {
            setThemeMode(res.data.theme_mode);
            applyCrmThemeMode(res.data.theme_mode);
          }
        }
        if (res.data.primary_color) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('crm_primary_color', res.data.primary_color);
          }
          applyCrmTheme(res.data.primary_color);
        }
      }
    }).catch(() => null);

    const handleColorPreview = (e: any) => {
      if (e.detail?.color) {
        applyCrmTheme(e.detail.color);
      }
    };

    const handleThemeModeChange = (e: any) => {
      if (e.detail?.mode) {
        setThemeMode(e.detail.mode);
        applyCrmThemeMode(e.detail.mode);
      }
    };

    window.addEventListener('colorPreview', handleColorPreview);
    window.addEventListener('crmThemeModeChanged', handleThemeModeChange);
    return () => {
      window.removeEventListener('colorPreview', handleColorPreview);
      window.removeEventListener('crmThemeModeChanged', handleThemeModeChange);
    };
  }, []);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      router.replace('/admin/login');
      return;
    }

    // If user is already loaded in state, verify route permissions locally without redundant API calls
    if (currentUser) {
      const perms = currentUser.permissions || ['ALL'];
      const isSuperAdmin = currentUser.role === 'super_admin' || perms.includes('ALL');

      if (!isSuperAdmin && Array.isArray(perms) && perms.length > 0) {
        const isCurrentPathAllowed = perms.some((p: string) => pathname.startsWith(p));
        if (!isCurrentPathAllowed) {
          const firstAllowed = perms[0];
          if (firstAllowed && firstAllowed !== pathname) {
            router.replace(firstAllowed);
          }
        }
      }
      return;
    }

    // Initial session load
    api.getMe()
      .then((res) => {
        if (res?.success && res?.user) {
          setCurrentUser(res.user);

          // Route permission check
          const perms = res.user.permissions || ['ALL'];
          const isSuperAdmin = res.user.role === 'super_admin' || perms.includes('ALL');

          if (!isSuperAdmin && Array.isArray(perms) && perms.length > 0) {
            const isCurrentPathAllowed = perms.some((p: string) => pathname.startsWith(p));
            if (!isCurrentPathAllowed) {
              const firstAllowed = perms[0];
              if (firstAllowed && firstAllowed !== pathname) {
                router.replace(firstAllowed);
                return;
              }
            }
          }
          setLoading(false);
        } else {
          removeAuthToken();
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        removeAuthToken();
        router.replace('/admin/login');
      });
  }, [pathname, router, currentUser]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div data-admin-theme={themeMode} className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const getPageTitle = (path: string) => {
    if (path.startsWith('/admin/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/admin/leads')) return 'CRM Leads & Pipeline';
    if (path.startsWith('/admin/site-visits')) return 'Site Visit Manager';
    if (path.startsWith('/admin/projects')) return 'Project Management';
    if (path.startsWith('/admin/plots')) return 'Plots Inventory';
    if (path.startsWith('/admin/blogs')) return 'Blog Manager';
    if (path.startsWith('/admin/popups')) return 'Ad & Seasonal Popups';
    if (path.startsWith('/admin/gallery')) return 'Media Gallery';
    if (path.startsWith('/admin/settings')) return 'Settings & Homepage Banners';
    if (path.startsWith('/admin/staff')) return 'Staff & Permissions';
    return 'Admin CRM Suite';
  };

  const handleToggleTheme = () => {
    const nextMode: CrmThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    setCrmThemeMode(nextMode);
    api.updateSettings({ theme_mode: nextMode }).catch(() => null);
  };

  return (
    <div
      data-admin-theme={themeMode}
      className={`h-screen flex overflow-hidden ${themeMode === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} font-sans transition-colors duration-200`}
    >
      <Sidebar
        userEmail={currentUser?.email}
        username={currentUser?.username}
        role={currentUser?.role}
        permissions={currentUser?.permissions}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <main className={`flex-1 flex flex-col min-w-0 h-full ${themeMode === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} overflow-y-auto transition-colors duration-200`}>
        {/* Sticky Admin Top Header Bar */}
        <header
          className={`sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3.5 border-b shrink-0 shadow-sm transition-colors duration-200 ${
            themeMode === 'light'
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50 backdrop-blur-md'
              : 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`p-2 rounded-xl lg:hidden border transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700/60'
              }`}
              aria-label="Open CRM Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span
                className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider block transition-colors duration-200"
                style={{ color: 'var(--brand-text-accent)' }}
              >
                Admin Portal
              </span>
              <h2
                className={`text-sm md:text-base font-extrabold leading-tight ${
                  themeMode === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                {getPageTitle(pathname)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Mode Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                themeMode === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title={`Currently in ${themeMode === 'light' ? 'Light Theme (Default)' : 'Dark Theme'}. Click to toggle.`}
            >
              {themeMode === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold">Light</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold hidden sm:inline">
                    Switch to Dark
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold">Dark</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold hidden sm:inline">
                    Switch to Light
                  </span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
