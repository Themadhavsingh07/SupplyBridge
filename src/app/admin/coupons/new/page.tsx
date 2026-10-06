'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, ArrowLeft } from 'lucide-react';

export default function NewAdminCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount || '0'),
          startDate,
          endDate,
        }),
      });

      if (res.ok) {
        router.push('/admin/coupons');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create coupon');
      }
    } catch (err) {
      alert('Coupon creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link href="/admin/coupons" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Coupons
        </Link>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Ticket className="w-5 h-5" />
            <h1 className="text-xl font-black text-white">Create New Coupon Campaign</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME50"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED">FIXED AMOUNT (₹)</option>
                  <option value="FREE_DELIVERY">FREE DELIVERY</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Discount Value</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 100'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Minimum Order Amount (₹)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20"
            >
              {submitting ? 'Creating Coupon...' : 'Publish Coupon Campaign'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
