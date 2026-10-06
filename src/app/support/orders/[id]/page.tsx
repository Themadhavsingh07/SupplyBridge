'use client';

import React, { useState, useEffect, use } from 'react';
import SupportLayout from '@/components/support/SupportLayout';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function SupportOrderDetailDiagnosticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const data = await res.json();
        if (data.order) setOrder(data.order);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SupportLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-900 rounded-3xl"></div>
        </div>
      </SupportLayout>
    );
  }

  if (!order) {
    return (
      <SupportLayout>
        <div className="text-center py-16 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Order Diagnostic Record Not Found</h2>
          <Link href="/support/tickets" className="text-teal-400 font-bold text-xs hover:underline">
            ← Back to Tickets
          </Link>
        </div>
      </SupportLayout>
    );
  }

  return (
    <SupportLayout>
      <div className="space-y-6">
        <Link href="/support/tickets" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Support Tickets
        </Link>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black text-2xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{order.orderNumber}</h1>
              <p className="text-xs text-slate-400">
                Customer: {order.customer?.name} • Supplier: {order.supplier?.businessName} • Amount: ₹{order.total}
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-xs">
            {order.status}
          </span>
        </div>
      </div>
    </SupportLayout>
  );
}
