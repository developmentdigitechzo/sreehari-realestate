'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getAuthToken, removeAuthToken } from '@/lib/api';
import { Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { getCrmThemeMode } from '@/lib/theme';

export default function NimdaLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [brandLogo, setBrandLogo] = useState<string>('/logo_transparent.png');
  const [companyName, setCompanyName] = useState('Sree Hari Realty Promoters');

  useEffect(() => {
    setThemeMode(getCrmThemeMode());
    api.getSettings()
      .then((res) => {
        if (res?.data?.logo_url) setBrandLogo(res.data.logo_url);
        if (res?.data?.company_name) setCompanyName(res.data.company_name);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then((res) => {
          if (res?.success && res?.user) {
            router.replace('/nimda/dashboard');
          }
        })
        .catch(() => {
          removeAuthToken();
        });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login(email, password);

      let perms: string[] = res?.user?.permissions || ['ALL'];
      let targetPath = '/nimda/dashboard';

      if (!perms.includes('ALL') && !perms.includes('/nimda/dashboard') && !perms.includes('/admin/dashboard')) {
        const firstPerm = perms[0] || '/nimda/leads';
        targetPath = firstPerm.replace(/^\/admin/, '/nimda');
      }

      router.push(targetPath);
    } catch (err: any) {
      setError(err.message || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-admin-theme={themeMode} className="flex min-h-screen items-center justify-center bg-slate-950 p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-700/60 p-2 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40 mb-4 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogo || '/logo_transparent.png'}
              alt={companyName}
              className="max-h-full max-w-full object-contain"
              onError={() => setBrandLogo('/logo_transparent.png')}
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {companyName}
          </h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mt-1">
            Staff CRM Executive Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Staff Email Address (Gmail)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Staff CRM</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
