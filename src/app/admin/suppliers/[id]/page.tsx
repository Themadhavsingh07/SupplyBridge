'use client';

import React, { useState, useEffect, use } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Store, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupplier() {
      try {
        const res = await fetch(`/api/admin/suppliers/${id}`);
        const data = await res.json();
        if (data.supplier) setSupplier(data.supplier);
      } catch (err) {
        console.error('Failed to load supplier detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!supplier) {
    return (
      <AdminLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Supplier Not Found</h2>
          <Link href="/admin/suppliers" className="text-emerald-400 font-bold text-xs hover:underline">
            ← Back to Suppliers
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Suppliers
        </Link>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-black text-2xl">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{supplier.businessName}</h1>
              <p className="text-xs text-slate-400">Owner: {supplier.user?.name} • GST: {supplier.gstNumber || 'N/A'}</p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            {supplier.verificationStatus}
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
