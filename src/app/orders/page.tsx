'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, Clock, ArrowRight, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function OrdersListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading order history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-black text-white">My Orders</h1>

      {orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border border-slate-800">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400">Explore products from verified suppliers and place your first order.</p>
          <Link
            href="/home"
            className="inline-flex px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Order #{order.orderNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{order.supplier?.businessName}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-white">₹{order.totalAmount}</span>
                  <p className="text-[10px] text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Order Items list */}
              <div className="space-y-1">
                {order.items.map((item: any) => (
                  <div key={item.id} className="text-xs text-slate-300 flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="font-semibold text-slate-400">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Delivery OTP: <span className="text-white font-mono font-bold">{order.otpCode}</span></span>
                
                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition border border-emerald-500/30"
                >
                  <span>Live Tracking & Map</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
