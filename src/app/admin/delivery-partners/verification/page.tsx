'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Bike, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function DeliveryPartnerVerificationQueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/delivery-partners/verification');
      const data = await res.json();
      if (data.deliveryPartners) setQueue(data.deliveryPartners);
    } catch (err) {
      console.error('Failed to load rider verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (deliveryPartnerId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/delivery-partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPartnerId, status }),
      });
      if (res.ok) fetchQueue();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/delivery-partners" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Delivery Partners
        </Link>

        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">Rider KYC Review</span>
          <h1 className="text-2xl font-black text-white">Pending Rider Verifications</h1>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading rider queue...</div>
          ) : queue.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-400 font-medium">
              🎉 No pending delivery partner KYC applications!
            </div>
          ) : (
            queue.map((p) => (
              <div key={p.id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Bike className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-lg text-white">{p.user?.name}</h3>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">
                    Vehicle: {p.vehicleType} • Number: {p.vehicleNumber || 'N/A'} • License: {p.drivingLicenseNumber || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleDecision(p.id, 'REJECTED')}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleDecision(p.id, 'VERIFIED')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
                  >
                    Approve Rider
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
