'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { ShoppingBag, Search, Eye, AlertOctagon } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Manual Override Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('CANCELLED');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (search) query.append('search', search);

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !overrideReason) return;

    setOverrideLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: overrideStatus,
          reason: overrideReason,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        setOverrideReason('');
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Override failed');
      }
    } catch (err) {
      alert('Order override execution failed');
    } finally {
      setOverrideLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Operations Oversight</span>
          <h1 className="text-2xl font-black text-white">Platform Orders Management</h1>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Order Number, Customer, Supplier..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Order Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-6">Customer & Supplier</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-4 px-6 font-bold text-white text-sm font-mono">{o.orderNumber}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block">{o.customer?.name}</span>
                        <span className="text-slate-400 text-[11px]">Supplier: {o.supplier?.businessName}</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-400">₹{o.total}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/25 transition"
                        >
                          Manual Override
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Override Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-rose-500/40 space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Emergency Status Override: {selectedOrder.orderNumber}</h3>
              </div>

              <form onSubmit={handleOverrideSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">New Order Status</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PREPARING">PREPARING</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Audit Reason (Mandatory)</label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Enter detailed justification for manual status override..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white h-24"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-1/2 bg-slate-900 border border-slate-800 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={overrideLoading}
                    className="w-1/2 bg-rose-500 hover:bg-rose-400 text-slate-950 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-rose-500/20"
                  >
                    {overrideLoading ? 'Executing...' : 'Execute Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
