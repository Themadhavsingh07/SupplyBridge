'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingBag } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('monthly');
  const [analytics, setAnalytics] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const [aRes, fRes] = await Promise.all([
          fetch(`/api/admin/analytics?range=${range}`),
          fetch('/api/admin/analytics/finance'),
        ]);

        const aData = await aRes.json();
        const fData = await fRes.json();

        if (aData.analytics) setAnalytics(aData.analytics);
        if (fData.financials) setFinancials(fData.financials);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [range]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Executive Reports</span>
            <h1 className="text-2xl font-black text-white">Platform Analytics & Financials</h1>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 font-bold focus:outline-none"
          >
            <option value="daily">Daily Overview</option>
            <option value="weekly">Weekly Range</option>
            <option value="monthly">Monthly Range</option>
            <option value="yearly">Yearly Breakdown</option>
          </select>
        </div>

        {/* Financial Overview Cards */}
        {financials && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Gross Merchandise Value</span>
              <span className="text-2xl font-black text-white mt-1 block">₹{financials.gmv?.toLocaleString()}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Platform Commission</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{financials.platformCommission?.toLocaleString()}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Delivery Payouts</span>
              <span className="text-2xl font-black text-teal-400 mt-1 block">₹{financials.totalDeliveryPayouts?.toLocaleString()}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs text-slate-400 font-medium block">Net Platform Revenue</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">₹{financials.netRevenue?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Orders Status Distribution</h3>
            <div className="space-y-3">
              {analytics?.ordersByStatus?.map((o: any) => (
                <div key={o.status} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="font-bold text-white">{o.status}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-400">{o.count} Orders</span>
                    <span className="font-bold text-emerald-400">₹{o.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Verification Distribution */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Supplier Verification Pipeline</h3>
            <div className="space-y-3">
              {analytics?.suppliersByStatus?.map((s: any) => (
                <div key={s.status} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                  <span className="font-bold text-white">{s.status}</span>
                  <span className="font-mono font-bold text-emerald-400">{s.count} Suppliers</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
