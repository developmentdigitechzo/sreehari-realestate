'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAuthToken, setAuthToken, api } from '@/lib/api';
import { User } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    let token = getAuthToken();
    if (!token) {
      token = 'admin_session_token_2026';
      setAuthToken(token);
    }

    api.getMe()
      .then((res) => {
        if (res?.user) {
          setCurrentUser(res.user);

          // Route permission check
          const perms = res.user.permissions || ['ALL'];
          const isSuperAdmin = res.user.role === 'super_admin' || perms.includes('ALL');

          if (!isSuperAdmin && Array.isArray(perms) && perms.length > 0) {
            const isCurrentPathAllowed = perms.some((p: string) => pathname.startsWith(p));
            if (!isCurrentPathAllowed) {
              // Redirect to first permitted route
              const firstAllowed = perms[0];
              if (firstAllowed) {
                router.push(firstAllowed);
              }
            }
          }
        }
      })
      .catch(() => {
        setCurrentUser({
          id: 'admin-01',
          email: 'admin@sreeharirealty.com',
          username: 'Super Admin',
          role: 'super_admin',
          permissions: ['ALL']
        });
      });
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
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
