'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import LiveDeliveryMap from '@/components/maps/LiveDeliveryMap';
import { subscribeToOrderStatus } from '@/lib/supabase';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Store,
  Bike,
  ShieldCheck,
  MessageSquare,
  MapPin,
  Phone,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const steps = [
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchOrder();

    // Subscribe to Supabase Realtime for Order Status Updates
    const unsubscribe = subscribeToOrderStatus(orderId, (statusPayload) => {
      if (statusPayload.status) {
        setOrder((prev: any) => (prev ? { ...prev, status: statusPayload.status } : prev));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, user]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) setOrder(data.order);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupplier = async () => {
    if (!order) return;
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: order.supplierId,
          orderId: order.id,
          initialMessage: `Hi ${order.supplier.businessName}! Checking status on my order #${order.orderNumber}.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        <span>Loading live order tracking...</span>
      </div>
    );
  }

  if (!order) {
    return <div className="py-16 text-center text-xs text-slate-400">Order not found.</div>;
  }

  const currentStepIdx = steps.indexOf(order.status);

  const supplierCoords: [number, number] = [
    order.supplier.longitude || 77.5946,
    order.supplier.latitude || 12.9716,
  ];

  // Default customer coords around Koramangala / Indiranagar
  const customerCoords: [number, number] = [77.6412, 12.9716];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-white">Order #{order.orderNumber}</h1>
            <p className="text-xs text-slate-400">
              Status: <span className="text-emerald-400 font-bold">{order.status.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleContactSupplier}
          className="px-4 py-2 bg-teal-950 hover:bg-teal-900 border border-teal-500/30 text-teal-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span>Contact Supplier</span>
        </button>
      </div>

      {/* Mapbox Live Delivery Map with Supabase Realtime */}
      <LiveDeliveryMap
        orderId={order.id}
        supplierName={order.supplier.businessName}
        supplierLocation={supplierCoords}
        customerLocation={customerCoords}
        orderStatus={order.status}
        height="440px"
      />

      {/* Progress Stepper */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Fulfillment Lifecycle</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
          {steps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border text-[11px] font-bold transition ${
                  isCurrent
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                    : isDone
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <div>{step.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rider & Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Partner */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Bike className="w-4 h-4 text-emerald-400" />
            <span>Assigned Delivery Partner</span>
          </h3>

          {order.deliveryPartner ? (
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div>
                <h4 className="font-bold text-xs text-white">{order.deliveryPartner.name}</h4>
                <p className="text-[10px] text-slate-400">Phone: {order.deliveryPartner.phone}</p>
              </div>
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Supplier is preparing your order. Rider will be assigned shortly.</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white">Payment & Status</h3>
          <div className="text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span className="font-bold text-white">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className="text-emerald-400 font-bold">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
