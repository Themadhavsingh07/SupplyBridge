'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, History } from 'lucide-react';

export default function DeliveryEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetch('/api/delivery/earnings');
        const result = await res.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error('Failed to load earnings summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  return (
    <DeliveryLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rider Payout Audit</span>
            </div>
            <h1 className="text-2xl font-black text-white">Earnings & Payout Ledger</h1>
            <p className="text-xs text-slate-400">Authoritative base fees, distance surge, tips & payout transactions</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Today's Earnings</span>
            <div className="text-2xl font-black text-white">₹{data?.todayEarnings || 0}</div>
            <span className="text-[10px] text-emerald-400 font-bold">{data?.todayDeliveries || 0} Deliveries</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">This Week</span>
            <div className="text-2xl font-black text-white">₹{data?.weekEarnings || 0}</div>
            <span className="text-[10px] text-slate-400">7-Day Total</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">This Month</span>
            <div className="text-2xl font-black text-white">₹{data?.monthEarnings || 0}</div>
            <span className="text-[10px] text-slate-400">Monthly Accumulation</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400">Avg / Delivery</span>
            <div className="text-2xl font-black text-emerald-400">₹{data?.avgEarningsPerDelivery || 0}</div>
            <span className="text-[10px] text-slate-400">Net Rate</span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Completed Delivery Earnings Log
          </h2>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading payout records...</div>
          ) : !data?.recentEarnings || data.recentEarnings.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No completed earnings records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order Number</th>
                    <th className="py-3 px-4">Base Fee</th>
                    <th className="py-3 px-4">Distance Surge</th>
                    <th className="py-3 px-4">Tip</th>
                    <th className="py-3 px-4">Total Payout</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {data.recentEarnings.map((earn: any) => (
                    <tr key={earn.id}>
                      <td className="py-3 px-4 font-bold text-white font-mono">{earn.delivery?.order?.orderNumber || 'ORD-987'}</td>
                      <td className="py-3 px-4 font-mono">₹{Number(earn.baseFee)}</td>
                      <td className="py-3 px-4 font-mono">₹{Number(earn.distanceSurge)}</td>
                      <td className="py-3 px-4 font-mono">₹{Number(earn.tip)}</td>
                      <td className="py-3 px-4 font-black text-emerald-400 font-mono">₹{Number(earn.totalEarning)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                          {earn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DeliveryLayout>
  );
}
