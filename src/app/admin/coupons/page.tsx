'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Ticket, Plus, Tag } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (couponId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, isActive: !isActive }),
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      alert('Toggle coupon failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Promotional Campaigns</span>
            <h1 className="text-2xl font-black text-white">Platform Coupons & Discounts</h1>
          </div>
          <Link
            href="/admin/coupons/new"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </Link>
        </div>

        {/* Coupons Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Min Order</th>
                  <th className="py-4 px-6">Usages</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">Loading coupons...</td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">No coupons active.</td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-emerald-400 font-mono text-sm">{c.code}</td>
                      <td className="py-4 px-6 font-bold text-white">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-4 px-6 text-slate-300">₹{c.minOrderAmount}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono">{c._count?.usages || 0} times</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            c.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggle(c.id, c.isActive)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs hover:bg-slate-700 transition"
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
