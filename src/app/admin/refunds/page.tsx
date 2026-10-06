'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/refunds');
      const data = await res.json();
      if (data.refunds) setRefunds(data.refunds);
    } catch (err) {
      console.error('Failed to load refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !amount || !reason) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: parseFloat(amount),
          reason,
          refundType: 'FULL',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Refund issued successfully');
        setOrderId('');
        setAmount('');
        setReason('');
        fetchRefunds();
      } else {
        alert(data.error || 'Failed to issue refund');
      }
    } catch (err) {
      alert('Refund execution error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/payments" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </Link>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Refund Operations</span>
          <h1 className="text-2xl font-black text-white">Refund Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Refund Form */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" /> Issue Customer Refund
            </h3>

            <form onSubmit={handleIssueRefund} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter exact Order ID"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 450.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Refund Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Damaged item, delayed delivery, missing item..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white h-24"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                {submitting ? 'Processing Refund...' : 'Process Refund'}
              </button>
            </form>
          </div>

          {/* Refund History Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white">Refund Transaction History</h3>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading refunds...</div>
              ) : refunds.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No refunds recorded yet.</div>
              ) : (
                refunds.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white block">Refund #{r.id}</span>
                      <span className="text-xs text-slate-400 font-mono">Order: {r.order?.orderNumber} • Reason: {r.reason}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-400 block text-sm">₹{r.amount}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
