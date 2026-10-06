'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import Link from 'next/link';
import { History, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/delivery/history');
        const data = await res.json();
        if (data.deliveries) {
          setDeliveries(data.deliveries);
        }
      } catch (err) {
        console.error('Failed to load delivery history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <DeliveryLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed Archive</span>
            </div>
            <h1 className="text-2xl font-black text-white">Delivery History & Logs</h1>
            <p className="text-xs text-slate-400">Archive of completed, cancelled & historical delivery drops</p>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading delivery archive...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No completed delivery records found.</div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((del) => (
                <div key={del.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-white block">{del.order?.orderNumber || 'ORD-123'}</span>
                    <span className="text-slate-400">Supplier: {del.order?.supplier?.businessName} • Drop: {del.order?.city}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {del.earning && (
                      <span className="font-bold text-emerald-400 font-mono">₹{Number(del.earning.totalEarning)}</span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border ${
                        del.status === 'COMPLETED'
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                          : 'bg-rose-950 border-rose-500/40 text-rose-400'
                      }`}
                    >
                      {del.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DeliveryLayout>
  );
}
