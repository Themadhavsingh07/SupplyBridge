'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import Link from 'next/link';
import { ShoppingBag, Store, MapPin, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AvailableDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery/orders');
      const data = await res.json();
      if (data.deliveries) {
        setDeliveries(data.deliveries);
      }
    } catch (err) {
      console.error('Failed to load available deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    setMessage(null);

    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/accept`, {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Delivery accepted! Redirecting to fulfillment console...');
        setTimeout(() => {
          window.location.href = `/delivery/orders/${orderId}`;
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to accept delivery');
      }
    } catch (err) {
      setMessage('Failed to accept delivery');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DeliveryLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pickup Queue</span>
            </div>
            <h1 className="text-2xl font-black text-white">Available Delivery Requests</h1>
            <p className="text-xs text-slate-400">Ready for pickup orders from nearby local suppliers</p>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            {message}
          </div>
        )}

        {/* Requests List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Scanning nearby store orders...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No available delivery requests right now.</p>
              <p className="text-[10px] text-slate-500">Ensure your status is set to ONLINE + AVAILABLE.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveries.map((req) => (
                <div key={req.orderId} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{req.orderNumber}</span>
                    <span className="text-xs font-black text-emerald-400 px-3 py-1 bg-emerald-950 border border-emerald-500/40 rounded-full">
                      Est. Earnings: ₹{req.estimatedEarnings}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">{req.supplierName}</strong>
                        <span className="text-slate-400">{req.supplierAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300 pt-2 border-t border-slate-800">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block">Customer Drop Area</strong>
                        <span className="text-slate-400">{req.customerArea}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(req.orderId)}
                    disabled={acceptingId === req.orderId}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>{acceptingId === req.orderId ? 'Accepting Request...' : 'Accept Delivery Job'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DeliveryLayout>
  );
}
