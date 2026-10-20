'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CrmLead } from '@/lib/types';
import {
  Building2,
  Grid,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  Plus,
  ArrowUpRight,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<CrmLead[]>([]);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [dashRes, crmStatsRes, leadsRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getCrmStats().catch(() => null),
        api.getCrmLeads({}).catch(() => null)
      ]);

      if (dashRes?.data) setStats(dashRes.data);
      if (crmStatsRes?.data) setCrmStats(crmStatsRes.data);
      if (leadsRes?.data && Array.isArray(leadsRes.data)) {
        setRecentLeads(leadsRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading database stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Active Projects',
      value: stats?.total_projects ?? stats?.projects?.total ?? 0,
      subtitle: `${stats?.ongoing_projects ?? stats?.projects?.ongoing ?? 0} Ongoing Township`,
      icon: Building2,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-600',
      href: '/nimda/projects',
      badge: 'Manage Projects',
    },
    {
      title: 'Plot Inventory',
      value: stats?.total_plots ?? stats?.plots?.total ?? 0,
      subtitle: `${stats?.available_plots ?? stats?.plots?.available ?? 0} Plots Available`,
      icon: Grid,
      color: 'from-emerald-600 to-teal-700',
      bgColor: 'bg-emerald-600',
      href: '/nimda/plots',
      badge: 'View All Plots',
    },
    {
      title: 'Total CRM Leads',
      value: crmStats?.total_leads ?? stats?.total_leads ?? stats?.leads?.total ?? (recentLeads?.length || 0),
      subtitle: `${crmStats?.hot_leads ?? stats?.hot_leads ?? stats?.leads?.hot ?? 0} Hot Buyer Leads`,
      icon: Users,
      color: 'from-violet-600 to-purple-600',
      bgColor: 'bg-purple-600',
      href: '/nimda/leads',
      badge: 'Lead Pipeline',
    },
    {
      title: 'Scheduled Visits',
      value: crmStats?.site_visits_scheduled ?? stats?.site_visits_scheduled ?? 0,
      subtitle: 'Site Visits Planned',
      icon: Calendar,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-600',
      href: '/nimda/site-visits',
      badge: 'Visit Calendar',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Real Estate CRM Executive Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live database overview of plot inventory, active gated communities, buyer leads & site visits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer disabled:opacity-60"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link
            href="/nimda/leads"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Manage CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Database Metrics Cards (Clickable & Visible Icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer block"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    {card.subtitle}
                  </p>
                </div>

                {/* Explicitly styled Icon container: Guaranteed 100% visible in light & dark themes */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} ${card.bgColor} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-6 h-6 text-white shrink-0" strokeWidth={2.2} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
                <span className="font-medium text-[11px]">{card.badge}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* CRM Pipeline Stats & Recent DB Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Buyer Leads from DB */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Recent Buyer Enquiries & Leads
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Newest plot enquiries loaded directly from database
              </p>
            </div>
            <Link
              href="/nimda/leads"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Leads</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {!recentLeads || recentLeads.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">
                No active buyer leads in database.
              </p>
            ) : (
              recentLeads.map((lead) => {
                const phoneStr = lead?.phone || '';
                const cleanPhone = phoneStr.replace(/[^0-9]/g, '');

                return (
                  <div key={lead.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {lead.name || 'Unnamed Lead'}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            lead.priority === 'Hot'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60'
                              : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60'
                          }`}
                        >
                          {lead.priority || 'Warm'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {phoneStr || 'No phone'} • {lead.project_name || 'General Plot Enquiry'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {phoneStr && (
                        <a
                          href={`tel:${phoneStr}`}
                          className="p-2 rounded-lg bg-slate-100 text-emerald-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-slate-700 transition-colors"
                          title="Call Lead"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-emerald-900/50 transition-colors"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Conversion & Pipeline Summary from DB */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white tracking-wide border-b border-slate-800/80 pb-4">
            CRM Sales Conversion Rate
          </h2>

          <div className="text-center py-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              Lead-to-Plot Conversion Rate
            </p>
            <p className="text-4xl font-extrabold text-emerald-400 mt-2">
              {crmStats?.conversion_rate_percent ?? 0}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Token Paid & Registered Plot Deals
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pipeline Stage Breakdown
            </p>
            <div className="space-y-2 text-xs">
              <Link
                href="/nimda/leads"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 transition-colors cursor-pointer group"
              >
                <span className="text-slate-300 group-hover:text-white transition-colors">New Enquiries</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {crmStats?.pipeline_stages?.new ?? 0}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </span>
              </Link>
              <Link
                href="/nimda/leads"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 transition-colors cursor-pointer group"
              >
                <span className="text-slate-300 group-hover:text-white transition-colors">Contacted / Follow-up</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {crmStats?.pipeline_stages?.contacted ?? 0}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </span>
              </Link>
              <Link
                href="/nimda/site-visits"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 transition-colors cursor-pointer group"
              >
                <span className="text-amber-400 font-semibold group-hover:text-amber-300 transition-colors">Site Visit Scheduled</span>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  {crmStats?.pipeline_stages?.site_visit ?? 0}
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500 transition-colors" />
                </span>
              </Link>
              <Link
                href="/nimda/leads"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 transition-colors cursor-pointer group"
              >
                <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">Token Paid / Registered</span>
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  {crmStats?.pipeline_stages?.registered ?? 0}
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 transition-colors" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
