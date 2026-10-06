'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import { ShieldCheck, Clock, AlertTriangle, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export default function DeliveryVerificationPage() {
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery/verification');
      const data = await res.json();
      if (data.partner) {
        setPartner(data.partner);
      }
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const status = partner?.verificationStatus || 'PENDING';

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">KYC Compliance</span>
            </div>
            <h1 className="text-2xl font-black text-white">Delivery Partner Verification</h1>
            <p className="text-xs text-slate-400">Rider Verification & Onboarding Checklist</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border uppercase ${
                status === 'VERIFIED'
                  ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                  : status === 'UNDER_REVIEW'
                  ? 'bg-amber-950 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </span>
            <button
              onClick={fetchStatus}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Verification Steps</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Registration Details Submitted</span>
                <span className="text-xs text-slate-400">Rider name, phone, and vehicle specs recorded.</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Bank Account & Payout Info Linked</span>
                <span className="text-xs text-slate-400">Bank account and UPI payout details configured.</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  status === 'UNDER_REVIEW'
                    ? 'bg-amber-950 border border-amber-500 text-amber-400 animate-pulse'
                    : status === 'VERIFIED'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {status === 'VERIFIED' ? '✓' : '●'}
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Document Review & Vehicle Check</span>
                <span className="text-xs text-slate-400">Fleet admin team is inspecting government ID and driving license.</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  status === 'VERIFIED'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {status === 'VERIFIED' ? '✓' : '○'}
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Verified Rider Accreditation</span>
                <span className="text-xs text-slate-400">Active status grants access to live delivery order assignments.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
}
