'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Store, CheckCircle, XCircle, FileText, ArrowLeft } from 'lucide-react';

export default function SupplierVerificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/suppliers/verification');
      const data = await res.json();
      if (data.suppliers) setQueue(data.suppliers);
    } catch (err) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (supplierId: string, status: 'VERIFIED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Enter reason for rejection:') || 'Invalid KYC documents' : undefined;

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          status,
          rejectionReason: reason,
        }),
      });

      if (res.ok) fetchQueue();
    } catch (err) {
      alert('Verification decision submission failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Suppliers
        </Link>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">KYC Audit Queue</span>
          <h1 className="text-2xl font-black text-white">Pending Supplier Verifications</h1>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading verification queue...</div>
          ) : queue.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400 font-medium">
              🎉 All pending supplier applications have been reviewed!
            </div>
          ) : (
            queue.map((s) => (
              <div key={s.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-lg text-white">{s.businessName}</h3>
                  </div>

                  <p className="text-xs text-slate-400">
                    Owner: {s.user?.name} ({s.user?.email || s.user?.phone})
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                    <span>GST: {s.gstNumber || 'N/A'}</span>
                    <span>PAN: {s.panNumber || 'N/A'}</span>
                    <span>License: {s.fssaiLicense || 'N/A'}</span>
                  </div>

                  {s.documents?.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300 font-bold">{s.documents.length} Submitted Documents</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleDecision(s.id, 'REJECTED')}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleDecision(s.id, 'VERIFIED')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                  >
                    Approve & Verify
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
