'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import SupplierVerificationBadge from '@/components/supplier/SupplierVerificationBadge';
import { ShieldCheck, Clock, AlertTriangle, FileText, CheckCircle2, UploadCloud, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SupplierVerificationPage() {
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitMessage, setResubmitMessage] = useState<string | null>(null);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supplier/verification');
      const data = await res.json();
      if (data.supplier) {
        setSupplier(data.supplier);
      }
    } catch (err) {
      console.error('Failed to load verification status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const handleFixAndResubmit = async () => {
    setResubmitting(true);
    setResubmitMessage(null);
    try {
      const res = await fetch('/api/supplier/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Resubmits updated documents for admin review
          gstNumber: supplier?.gstNumber,
          panNumber: supplier?.panNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResubmitMessage('Verification resubmitted successfully! Admin team is reviewing your documents.');
        fetchVerificationStatus();
      } else {
        setResubmitMessage(data.error || 'Resubmission failed');
      }
    } catch (err) {
      setResubmitMessage('Failed to resubmit application');
    } finally {
      setResubmitting(false);
    }
  };

  const status = supplier?.verificationStatus || 'PENDING';

  return (
    <SupplierLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Business Compliance</span>
            </div>
            <h1 className="text-2xl font-black text-white">Supplier Verification Tracker</h1>
            <p className="text-xs text-slate-400">KYC Verification & Merchant Accreditation</p>
          </div>

          <div className="flex items-center gap-3">
            <SupplierVerificationBadge status={status} size="lg" />
            <button
              onClick={fetchVerificationStatus}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Timeline Progress */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Verification Checklist</h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Application Submitted</span>
                <span className="text-xs text-slate-400">Store profile and business details registered in database.</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Documents Uploaded</span>
                <span className="text-xs text-slate-400">GSTIN, PAN & Business License stored in encrypted storage.</span>
              </div>
            </div>

            {/* Step 3 */}
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
                <span className="font-bold text-sm text-white block">Admin Verification Review</span>
                <span className="text-xs text-slate-400">Compliance team is verifying business tax IDs and store address.</span>
              </div>
            </div>

            {/* Step 4 */}
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
                <span className="font-bold text-sm text-white block">Verified Supplier Badge</span>
                <span className="text-xs text-slate-400">Verified status grants live store status and customer trust badge.</span>
              </div>
            </div>
          </div>

          {/* Rejection Alert */}
          {status === 'REJECTED' && (
            <div className="p-6 rounded-2xl bg-rose-950/60 border border-rose-800/50 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Application Rejected</span>
              </div>
              <p className="text-xs text-rose-200">
                Reason: {supplier?.rejectionReason || 'Uploaded document legibility issue. Please upload clear scan of GST certificate.'}
              </p>
              <button
                onClick={handleFixAndResubmit}
                disabled={resubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{resubmitting ? 'Submitting Fix...' : 'Fix and Resubmit Documents'}</span>
              </button>
            </div>
          )}

          {resubmitMessage && (
            <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              {resubmitMessage}
            </div>
          )}
        </div>

        {/* Uploaded Documents Summary */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Submitted Tax & Legal Records
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">GSTIN</span>
              <span className="text-sm font-bold text-white">{supplier?.gstNumber || '07AAAAA0000A1Z5'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">PAN Card</span>
              <span className="text-sm font-bold text-white">{supplier?.panNumber || 'ABCDE1234F'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Business License</span>
              <span className="text-sm font-bold text-white">{supplier?.businessLicense || 'LIC-2026-987654'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Submission Date</span>
              <span className="text-sm font-bold text-white">
                {supplier?.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-IN') : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}
