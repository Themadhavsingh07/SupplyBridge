'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function SupplierAnalyticsPage() {
  const [range, setRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/supplier/analytics?range=${range}`);
        const data = await res.json();
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [range]);

  const summary = analytics?.summary || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
  const timeSeries = analytics?.revenueTimeSeries || [];
  const topProducts = analytics?.topProducts || [];
  const statusDistribution = analytics?.orderStatusDistribution || [];

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Date Selector */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Business Intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-white">Supplier Sales & Analytics</h1>
            <p className="text-xs text-slate-400">Server-side aggregated revenue, order distributions & top selling items</p>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            {(['today', '7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  range === r ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Period Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">₹{summary.totalRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-400 font-bold">Aggregated from PostgreSQL</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{summary.totalOrders}</div>
            <span className="text-[10px] text-slate-400">Across selected timeframe</span>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Average Order Value (AOV)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">₹{summary.averageOrderValue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-400">Net revenue per order</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Revenue Bar Visualizer */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue & Daily Sales Time Series
            </h2>

            {loading ? (
              <div className="text-center py-16 text-xs text-slate-400">Loading server aggregation...</div>
            ) : timeSeries.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">No revenue records in this date range.</div>
            ) : (
              <div className="space-y-3 pt-4">
                {timeSeries.map((t: any) => {
                  const maxRevenue = Math.max(...timeSeries.map((item: any) => item.revenue || 1));
                  const percentage = Math.round((t.revenue / maxRevenue) * 100);
                  return (
                    <div key={t.date} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">{t.date}</span>
                        <span className="font-bold text-emerald-400">₹{t.revenue} ({t.orders} orders)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" /> Order Status Distribution
            </h2>

            <div className="space-y-3">
              {statusDistribution.map((d: any) => (
                <div key={d.status} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white uppercase block">{d.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400">{d.count} Orders</span>
                  </div>
                  <span className="font-bold text-emerald-400">₹{d.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Products Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" /> Top Selling Store Items
          </h2>

          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No top products data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {topProducts.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-4 font-bold text-white">{p.unitsSold}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">₹{p.totalRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
