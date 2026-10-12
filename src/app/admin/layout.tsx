'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAuthToken, removeAuthToken, api } from '@/lib/api';
import { User } from '@/lib/types';
import { applyCrmTheme } from '@/lib/theme';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // CRM Global Theme synchronization
  useEffect(() => {
    const savedColor = typeof window !== 'undefined' ? localStorage.getItem('crm_primary_color') : null;
    if (savedColor) {
      applyCrmTheme(savedColor);
    }

    api.getSettings().then((res) => {
      if (res?.data?.primary_color) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('crm_primary_color', res.data.primary_color);
        }
        applyCrmTheme(res.data.primary_color);
      }
    }).catch(() => null);

    const handleColorPreview = (e: any) => {
      if (e.detail?.color) {
        applyCrmTheme(e.detail.color);
      }
    };

    window.addEventListener('colorPreview', handleColorPreview);
    return () => {
      window.removeEventListener('colorPreview', handleColorPreview);
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
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
    <div data-admin-theme="" className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        userEmail={currentUser?.email}
        username={currentUser?.username}
        role={currentUser?.role}
        permissions={currentUser?.permissions}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
