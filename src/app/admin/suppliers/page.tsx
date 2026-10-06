'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Store, Search, CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('verificationStatus', statusFilter);
      if (search) query.append('search', search);

      const res = await fetch(`/api/admin/suppliers?${query.toString()}`);
      const data = await res.json();
      if (data.suppliers) setSuppliers(data.suppliers);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [statusFilter]);

  const handleStatusChange = async (supplierId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, status }),
      });
      if (res.ok) fetchSuppliers();
    } catch (err) {
      alert('Failed to update verification status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Merchant Directory</span>
            <h1 className="text-2xl font-black text-white">Suppliers Management</h1>
          </div>
          <Link
            href="/admin/suppliers/verification"
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition"
          >
            Review Pending Verification Queue →
          </Link>
        </div>

        {/* Search Bar & Filter */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form onSubmit={(e) => { e.preventDefault(); fetchSuppliers(); }} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Business Name, GST, PAN..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Verification Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Suppliers Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Business Name</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">GST / PAN</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading suppliers...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No suppliers found.</td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white text-sm">{s.businessName}</td>
                      <td className="py-4 px-6 text-slate-300">{s.user?.name}</td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                        {s.gstNumber || 'NO GST'} / {s.panNumber || 'NO PAN'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            s.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : s.verificationStatus === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {s.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/suppliers/${s.id}`}
                          className="inline-flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                        {s.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleStatusChange(s.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                          >
                            Approve
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
