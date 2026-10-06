'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { CreditCard, Search, RotateCcw } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.payments) setPayments(data.payments);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Financial Transactions</span>
            <h1 className="text-2xl font-black text-white">Payment Ledger</h1>
          </div>
          <Link
            href="/admin/refunds"
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Issue Refund →
          </Link>
        </div>

        {/* Payments Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Payment ID</th>
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-6">Method</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">Loading payment ledger...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">No payment records found.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{p.id}</td>
                      <td className="py-4 px-6 font-bold text-white font-mono">{p.order?.orderNumber}</td>
                      <td className="py-4 px-6 font-bold text-slate-300">{p.paymentMethod}</td>
                      <td className="py-4 px-6 font-bold text-emerald-400">₹{p.amount}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()}
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
