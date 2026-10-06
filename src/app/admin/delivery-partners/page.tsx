'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Bike, Search, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);

      const res = await fetch(`/api/admin/delivery-partners?${query.toString()}`);
      const data = await res.json();
      if (data.deliveryPartners) setPartners(data.deliveryPartners);
    } catch (err) {
      console.error('Failed to load delivery partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleVerify = async (partnerId: string, status: 'VERIFIED' | 'SUSPENDED') => {
    try {
      const res = await fetch('/api/admin/delivery-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPartnerId: partnerId, status }),
      });
      if (res.ok) fetchPartners();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Fleet Management</span>
            <h1 className="text-2xl font-black text-white">Delivery Partners</h1>
          </div>
          <Link
            href="/admin/delivery-partners/verification"
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition"
          >
            Review Rider Verification Queue →
          </Link>
        </div>

        {/* Search */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800">
          <form onSubmit={(e) => { e.preventDefault(); fetchPartners(); }} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Rider Name, Phone, Vehicle Number..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Partners Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Rider Name</th>
                  <th className="py-4 px-6">Vehicle & License</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading delivery partners...</td>
                  </tr>
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No delivery partners found.</td>
                  </tr>
                ) : (
                  partners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white text-sm">{p.user?.name}</td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-[11px]">
                        {p.vehicleType} • {p.vehicleNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-400">⭐ {Number(p.rating || 4.8)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.isVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {p.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/delivery-partners/${p.id}`}
                          className="inline-flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                        {!p.isVerified ? (
                          <button
                            onClick={() => handleVerify(p.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                          >
                            Verify Rider
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(p.id, 'SUSPENDED')}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500/25 transition"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
