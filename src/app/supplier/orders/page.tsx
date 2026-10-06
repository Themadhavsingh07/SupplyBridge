'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customer?: { name: string; phone: string };
  items?: any[];
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load supplier orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) => statusFilter === 'ALL' || o.status === statusFilter
  );

  return (
    <SupplierLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-400" /> Incoming Order Fulfillment
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm incoming customer orders, prepare fresh items, and mark ready for delivery pickup.
            </p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No orders matching filter</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 backdrop-blur-md hover:border-emerald-500/40 transition"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white text-base">{o.orderNumber}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Customer: {o.customer?.name || 'Aarav Sharma'} • Placed on {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-white">₹{o.total}</span>
                  <Link
                    href={`/supplier/orders/${o.id}`}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}
