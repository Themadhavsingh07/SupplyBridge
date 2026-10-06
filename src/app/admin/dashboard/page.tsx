'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import {
  Users,
  Store,
  Bike,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { RealtimeChannels } from '@/lib/realtime/channel-registry';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Supabase Realtime Subscription to admin:events channel
  useEffect(() => {
    if (!supabaseBrowser) return;

    const channel = supabaseBrowser
      .channel(RealtimeChannels.adminEvents())
      .on('broadcast', { event: '*' }, (payload: any) => {
        setRealtimeEvents((prev) => [payload.payload || payload, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      if (supabaseBrowser) {
        supabaseBrowser.removeChannel(channel);
      }
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-slate-800 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-3xl border border-slate-800"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const kpis = [
    { title: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Active Customers', value: stats?.activeCustomers || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Suppliers', value: stats?.totalSuppliers || 0, icon: Store, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Pending Verifications', value: stats?.pendingSuppliers || 0, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', alert: true },
    { title: 'Delivery Partners', value: stats?.deliveryPartners || 0, icon: Bike, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { title: 'Gross Revenue', value: `₹${(stats?.grossRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Platform Commission', value: `₹${(stats?.platformCommission || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Pending Complaints', value: stats?.pendingComplaints || 0, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Total Refunds', value: `₹${(stats?.totalRefunds || 0).toLocaleString()}`, icon: RotateCcw, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Operational Overview</span>
            <h1 className="text-2xl font-black text-white">SupplyBridge Admin Control</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/suppliers/verification"
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/25 transition flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Review Verification Queue ({stats?.pendingSuppliers || 0})</span>
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl bg-slate-900/60 border ${
                  kpi.alert ? 'border-amber-500/40 bg-amber-950/20' : 'border-slate-800'
                } backdrop-blur-md flex items-center justify-between gap-4`}
              >
                <div>
                  <span className="text-xs text-slate-400 font-medium block">{kpi.title}</span>
                  <span className="text-2xl font-black text-white mt-1 block">{kpi.value}</span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Realtime Platform Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Realtime Stream */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="font-bold text-base text-white">Live Platform Realtime Events</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Supabase Channel: admin:events
              </span>
            </div>

            <div className="space-y-3 min-h-[220px]">
              {realtimeEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-medium">
                  Listening for realtime order, verification & payment events...
                </div>
              ) : (
                realtimeEvents.map((evt, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-emerald-400 block">{evt.eventType || 'PLATFORM_EVENT'}</span>
                      <span className="text-slate-400 text-[11px]">{JSON.stringify(evt.payload || {})}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Admin Action Shortcuts */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-base text-white mb-2">Quick Admin Actions</h3>

            <Link
              href="/admin/users"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 hover:text-emerald-400 hover:border-emerald-500/30 transition flex items-center justify-between"
            >
              <span>Manage User Accounts</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link
              href="/admin/orders"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 hover:text-emerald-400 hover:border-emerald-500/30 transition flex items-center justify-between"
            >
              <span>Order Management & Manual Overrides</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link
              href="/admin/refunds"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 hover:text-emerald-400 hover:border-emerald-500/30 transition flex items-center justify-between"
            >
              <span>Process Customer Refunds</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link
              href="/admin/audit-logs"
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 hover:text-emerald-400 hover:border-emerald-500/30 transition flex items-center justify-between"
            >
              <span>Audit Trail Logs</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
