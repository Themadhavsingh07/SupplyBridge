'use client';

import React, { useState, useEffect } from 'react';
import SupplierLayout from '@/components/supplier/SupplierLayout';
import Link from 'next/link';
import {
  ShoppingBag,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MessageSquare,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function SupplierOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/supplier/orders/${params.id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleOrderAction = async (action: 'CONFIRM' | 'START_PREPARING' | 'MARK_READY' | 'CANCEL') => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/supplier/orders/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      await fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SupplierLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading order information...</div>
      </SupplierLayout>
    );
  }

  if (error || !order) {
    return (
      <SupplierLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
            {error || 'Order not found'}
          </div>
          <Link href="/supplier/orders" className="text-xs font-bold text-emerald-400 hover:underline">
            ← Return to Orders Queue
          </Link>
        </div>
      </SupplierLayout>
    );
  }

  const currentStatus = order.status;

  return (
    <SupplierLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Navigation & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <Link href="/supplier/orders" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders Queue
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">{order.orderNumber}</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                {currentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {currentStatus === 'PLACED' && (
              <button
                onClick={() => handleOrderAction('CONFIRM')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                Confirm Order
              </button>
            )}

            {currentStatus === 'CONFIRMED' && (
              <button
                onClick={() => handleOrderAction('START_PREPARING')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
              >
                Start Preparing
              </button>
            )}

            {currentStatus === 'PREPARING' && (
              <button
                onClick={() => handleOrderAction('MARK_READY')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition"
              >
                Mark Ready for Pickup
              </button>
            )}

            {['PLACED', 'CONFIRMED', 'PREPARING'].includes(currentStatus) && (
              <button
                onClick={() => handleOrderAction('CANCEL')}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-rose-950/60 border border-rose-800 text-rose-400 hover:bg-rose-950 font-bold text-xs rounded-xl transition"
              >
                Cancel Order
              </button>
            )}

            <Link
              href={`/supplier/messages?customerId=${order.customer?.id}`}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-4 h-4" /> Message Customer
            </Link>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Order Items ({order.items?.length || 0})
              </h2>

              <div className="divide-y divide-slate-800">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-white">
                        {item.quantity}x
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{item.product?.name || 'Product Item'}</span>
                        <span className="text-[10px] text-slate-400">SKU: {item.product?.sku} • {item.product?.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-white block">₹{Number(item.totalPrice)}</span>
                      <span className="text-[10px] text-slate-400">₹{Number(item.unitPrice)} each</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-4 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotalAmount)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{Number(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax & Packaging</span>
                  <span>₹{Number(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Fee</span>
                  <span>₹{Number(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">₹{Number(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Order Fulfillment Audit Log
              </h2>
              <div className="space-y-3">
                {order.statusHistory?.map((h: any) => (
                  <div key={h.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white uppercase block">{h.newStatus.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">{h.reason || 'Status transitioned'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer & Fulfillment Info Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" /> Customer Details
              </h3>
              <div>
                <span className="font-bold text-sm text-white block">{order.customer?.user?.name}</span>
                <span className="text-xs text-slate-400 block">{order.customer?.user?.phone}</span>
              </div>

              {order.deliveryAddress && (
                <div className="pt-3 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" /> Delivery Location
                  </span>
                  <p className="text-xs text-slate-300">
                    {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city} - {order.deliveryAddress.postalCode}
                  </p>
                </div>
              )}
            </div>

            {/* Payment & Delivery Partner */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Payment & Dispatch
              </h3>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Payment Status</span>
                <span className="font-bold text-emerald-400">{order.payment?.status || 'PAID'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold text-white">{order.payment?.method || 'UPI / Online'}</span>
              </div>

              {order.delivery?.partner && (
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-400" /> Assigned Courier
                  </span>
                  <span className="font-bold text-white block">{order.delivery.partner.user?.name}</span>
                  <span className="text-[10px] text-slate-400">{order.delivery.partner.vehicleType} • {order.delivery.partner.vehicleNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
}
