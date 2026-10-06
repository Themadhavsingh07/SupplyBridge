'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import DeliveryNavigationMap from '@/components/maps/DeliveryNavigationMap';
import DeliveryGPSWatcher from '@/components/delivery/DeliveryGPSWatcher';
import Link from 'next/link';
import {
  Bike,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  MessageSquare,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Camera,
} from 'lucide-react';

export default function DeliveryFulfillmentPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP State
  const [otpInput, setOtpInput] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/orders/${params.id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStageAction = async (stage: 'START' | 'ARRIVE_SUPPLIER' | 'CONFIRM_PICKUP' | 'ARRIVE_CUSTOMER') => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delivery/orders/${params.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update stage');
      }

      fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Stage action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length !== 6) {
      setOtpError('Please enter valid 6-digit OTP');
      return;
    }

    setActionLoading(true);
    setOtpError(null);

    try {
      const res = await fetch(`/api/delivery/orders/${params.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otpInput,
          proofImageUrl: proofUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP Verification Failed');
      }

      fetchOrder();
    } catch (err: any) {
      setOtpError(err.message || 'OTP Verification Failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DeliveryLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-400">Loading delivery console...</div>
      </DeliveryLayout>
    );
  }

  if (error || !order) {
    return (
      <DeliveryLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
            {error || 'Order not found'}
          </div>
          <Link href="/delivery/orders" className="text-xs font-bold text-emerald-400 hover:underline">
            ← Return to Available Requests
          </Link>
        </div>
      </DeliveryLayout>
    );
  }

  const deliveryStatus = order.delivery?.status || 'ASSIGNED';
  const supplierCoords: [number, number] = [
    Number(order.supplier?.longitude || 77.209),
    Number(order.supplier?.latitude || 28.6139),
  ];
  const customerCoords: [number, number] = [
    Number(order.longitude || 77.215),
    Number(order.latitude || 28.62),
  ];

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/delivery/orders" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white">{order.orderNumber}</h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                Stage: {deliveryStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <Link
            href={`/delivery/messages?orderId=${order.id}`}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-4 h-4" /> Chat
          </Link>
        </div>

        {/* Live GPS Watcher */}
        <DeliveryGPSWatcher activeDeliveryId={order.delivery?.id} />

        {/* Mobile Navigation Map */}
        <DeliveryNavigationMap
          pickupLocation={supplierCoords}
          dropoffLocation={customerCoords}
          stage={['ACCEPTED', 'STARTED', 'ARRIVED_AT_SUPPLIER'].includes(deliveryStatus) ? 'pickup' : 'dropoff'}
        />

        {/* Stage Progression Action Bar */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Fulfillment Actions</h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          {deliveryStatus === 'ACCEPTED' && (
            <button
              onClick={() => handleStageAction('START')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Journey to Supplier Store</span>
            </button>
          )}

          {deliveryStatus === 'STARTED' && (
            <button
              onClick={() => handleStageAction('ARRIVE_SUPPLIER')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Mark Arrived at Supplier Store</span>
            </button>
          )}

          {deliveryStatus === 'ARRIVED_AT_SUPPLIER' && (
            <button
              onClick={() => handleStageAction('CONFIRM_PICKUP')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Pickup & Start Customer Delivery</span>
            </button>
          )}

          {deliveryStatus === 'PICKUP_CONFIRMED' && (
            <button
              onClick={() => handleStageAction('ARRIVE_CUSTOMER')}
              disabled={actionLoading}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Mark Arrived at Customer Address</span>
            </button>
          )}

          {/* OTP Completion Input Box */}
          {deliveryStatus === 'ARRIVED_AT_CUSTOMER' && (
            <form onSubmit={handleCompleteOtp} className="space-y-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Enter 6-Digit Customer Delivery OTP</span>
              </div>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold">
                  {otpError}
                </div>
              )}

              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
                placeholder="1 2 3 4 5 6"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono font-black text-lg tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                {actionLoading ? 'Verifying OTP...' : 'Verify OTP & Complete Delivery'}
              </button>
            </form>
          )}

          {deliveryStatus === 'COMPLETED' && (
            <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold text-xs text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p>Delivery Successfully Completed!</p>
              <span className="text-[10px] text-slate-400">₹55.00 Earnings credited to your rider account.</span>
            </div>
          )}
        </div>

        {/* Address Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Pickup Supplier Store
            </span>
            <strong className="text-white text-sm block">{order.supplier?.businessName}</strong>
            <p className="text-slate-400">{order.supplier?.addressLine}, {order.supplier?.city}</p>
            <span className="text-[10px] text-slate-400 block pt-1">Phone: {order.supplier?.phone}</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] text-indigo-400 font-bold uppercase flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Delivery Customer Address
            </span>
            <strong className="text-white text-sm block">{order.deliveryName}</strong>
            <p className="text-slate-400">{order.addressLine}, {order.city} - {order.postalCode}</p>
            <span className="text-[10px] text-slate-400 block pt-1">Phone: {order.deliveryPhone}</span>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
}
