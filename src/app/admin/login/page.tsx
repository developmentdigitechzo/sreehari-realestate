'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Lock, Mail, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sreeharirealty.com');
  const [password, setPassword] = useState('AdminPassword@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login(email, password);

      let perms = res?.user?.permissions || ['ALL'];
      let targetPath = '/admin/dashboard';

      if (!perms.includes('ALL') && !perms.includes('/admin/dashboard')) {
        targetPath = perms[0] || '/admin/leads';
      }

      router.push(targetPath);
    } catch (err: any) {
      setError(err.message || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-emerald-950/60 mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Sree Hari Realty Promoters
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
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

        {/* Quick Demo Logins for Testing */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-left space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Login Presets (Click to Auto-fill)</span>
          </p>

          <button
            onClick={() => fillQuickLogin('admin@sreeharirealty.com', 'AdminPassword@2026')}
            className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <p className="text-white font-semibold">Super Admin (All Modules Access)</p>
              <p className="text-slate-400 text-[10px] font-mono">admin@sreeharirealty.com</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">Full Access</span>
          </button>

          <button
            onClick={() => fillQuickLogin('vignesh.sales@gmail.com', 'AdminPassword@2026')}
            className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <p className="text-white font-semibold">R. Vignesh (Sales Manager)</p>
              <p className="text-slate-400 text-[10px] font-mono">vignesh.sales@gmail.com</p>
            </div>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">4 Modules</span>
          </button>

          <button
            onClick={() => fillQuickLogin('karthik.marketing@gmail.com', 'AdminPassword@2026')}
            className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 transition-colors flex items-center justify-between text-xs"
          >
            <div>
              <p className="text-white font-semibold">Karthik S. (Marketing Exec)</p>
              <p className="text-slate-400 text-[10px] font-mono">karthik.marketing@gmail.com</p>
            </div>
            <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/40">3 Modules</span>
          </button>
        </div>
      </div>
    </div>
  );
}
