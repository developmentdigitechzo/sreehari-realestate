'use client';

import { useState, useEffect } from 'react';
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
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [crmStats, setCrmStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<CrmLead[]>([]);

  useEffect(() => {
    async function loadData() {
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
      }
    }

    loadData();
  }, []);

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
    },
    {
      title: 'Plot Inventory',
      value: stats?.total_plots ?? stats?.plots?.total ?? 0,
      subtitle: `${stats?.available_plots ?? stats?.plots?.available ?? 0} Plots Available`,
      icon: Grid,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Total CRM Leads',
      value: crmStats?.total_leads ?? stats?.total_leads ?? stats?.leads?.total ?? (recentLeads?.length || 0),
      subtitle: `${crmStats?.hot_leads ?? stats?.hot_leads ?? stats?.leads?.hot ?? 0} Hot Buyer Leads`,
      icon: Users,
      color: 'from-violet-600 to-purple-600',
    },
    {
      title: 'Scheduled Visits',
      value: crmStats?.site_visits_scheduled ?? stats?.site_visits_scheduled ?? 0,
      subtitle: 'Site Visits Planned',
      icon: Calendar,
      color: 'from-amber-600 to-orange-600',
    },
  ];

  return (
    <div className="p-8 space-y-8">
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
          <Link
            href="/admin/leads"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Manage CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Database Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
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
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
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
              href="/admin/leads"
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
                        <p className="text-sm font-semibold text-white truncate">
                          {lead.name || 'Unnamed Lead'}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            lead.priority === 'Hot'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {lead.priority || 'Warm'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {phoneStr || 'No phone'} • {lead.project_name || 'General Plot Enquiry'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${phoneStr}`}
                        className="p-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors"
                        title="Call Lead"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
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
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40">
                <span className="text-slate-300">New Enquiries</span>
                <span className="font-bold text-white">{crmStats?.pipeline_stages?.new ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40">
                <span className="text-slate-300">Contacted / Follow-up</span>
                <span className="font-bold text-white">{crmStats?.pipeline_stages?.contacted ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40">
                <span className="text-amber-400 font-semibold">Site Visit Scheduled</span>
                <span className="font-bold text-amber-300">{crmStats?.pipeline_stages?.site_visit ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40">
                <span className="text-emerald-400 font-semibold">Token Paid / Registered</span>
                <span className="font-bold text-emerald-300">{crmStats?.pipeline_stages?.registered ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
