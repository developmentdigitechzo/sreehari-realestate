'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAuthToken, removeAuthToken, api } from '@/lib/api';
import { User } from '@/lib/types';
import { applyCrmTheme, applyCrmThemeMode, getCrmThemeMode, setCrmThemeMode, CrmThemeMode } from '@/lib/theme';

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

  return (
    <div data-admin-theme={themeMode} className="flex min-h-screen bg-slate-950 text-slate-100 font-sans transition-colors duration-200">
      <Sidebar
        userEmail={currentUser?.email}
        username={currentUser?.username}
        role={currentUser?.role}
        permissions={currentUser?.permissions}
        currentThemeMode={themeMode}
        onToggleThemeMode={(newMode) => {
          setThemeMode(newMode);
          setCrmThemeMode(newMode);
          api.updateSettings({ theme_mode: newMode }).catch(() => null);
        }}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}
