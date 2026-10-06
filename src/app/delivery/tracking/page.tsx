'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import LiveDeliveryMap from '@/components/maps/LiveDeliveryMap';
import DeliveryGPSWatcher from '@/components/delivery/DeliveryGPSWatcher';
import Link from 'next/link';
import { Compass, Bike, ShoppingBag, ArrowRight } from 'lucide-react';

export default function DeliveryTrackingPage() {
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActive() {
      try {
        const res = await fetch('/api/delivery/earnings');
        const data = await res.json();
        if (data.metrics?.activeDelivery) {
          setActiveDelivery(data.metrics.activeDelivery);
        }
      } catch (err) {
        console.error('Failed to load active delivery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActive();
  }, []);

  return (
    <DeliveryLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live GPS Hub</span>
            </div>
            <h1 className="text-2xl font-black text-white">Active Delivery GPS Tracking</h1>
            <p className="text-xs text-slate-400">Realtime rider location broadcasting to customer map</p>
          </div>
        </div>

        {activeDelivery ? (
          <div className="space-y-4">
            <DeliveryGPSWatcher activeDeliveryId={activeDelivery.id} />
            <LiveDeliveryMap
              orderId={activeDelivery.orderId}
              supplierName="Green Valley Farms"
              supplierLocation={[77.209, 28.6139]}
              customerLocation={[77.215, 28.62]}
              orderStatus={activeDelivery.status}
            />
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4 backdrop-blur-md">
            <Bike className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-white">No Active Delivery in Progress</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Accept a delivery job from the Available Requests list to enable live turn-by-turn GPS tracking.
            </p>
            <Link
              href="/delivery/orders"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition"
            >
              <span>View Available Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </DeliveryLayout>
  );
}
