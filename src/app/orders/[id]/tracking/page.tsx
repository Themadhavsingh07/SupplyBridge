'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/common/Header';
import MobileNav from '@/components/common/MobileNav';
import Link from 'next/link';
import {
  Bike,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import LiveDeliveryMap from '@/components/maps/LiveDeliveryMap';
import RealtimeStatusIndicator from '@/components/common/RealtimeStatusIndicator';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { RealtimeChannels } from '@/lib/realtime/channel-registry';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  updatedAt?: string;
}

interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: string;
  supplierName: string;
  supplierLat: number;
  supplierLng: number;
  deliveryAddress: string;
  customerLat: number;
  customerLng: number;
  driverName: string;
  driverPhone: string;
  driverVehicle: string;
  driverRating: number;
  currentLocation: LocationState | null;
  isStale?: boolean;
  staleSinceMinutes?: number;
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<TrackingData | null>(null);
  const [driverLoc, setDriverLoc] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInitialTracking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      const orderData = await res.json();
      if (!orderData.order) {
        setErrorMsg('Order not found');
        return;
      }

      const o = orderData.order;
      const driver = o.delivery?.deliveryPartner?.user;
      const vehicle = o.delivery?.deliveryPartner?.vehicleNumber || 'EV Scooter';
      const currLoc = o.delivery?.currentLocation;

      // Check location staleness (e.g. > 3 mins)
      let isStale = false;
      let staleSinceMinutes = 0;
      if (currLoc?.updatedAt) {
        const diffMs = Date.now() - new Date(currLoc.updatedAt).getTime();
        staleSinceMinutes = Math.floor(diffMs / 60000);
        if (staleSinceMinutes >= 3) {
          isStale = true;
        }
      }

      const initial: TrackingData = {
        orderId: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        supplierName: o.supplier?.businessName || 'Local Supplier',
        supplierLat: Number(o.supplier?.latitude || 12.9716),
        supplierLng: Number(o.supplier?.longitude || 77.5946),
        deliveryAddress: o.addressLine || 'Customer Address',
        customerLat: Number(o.latitude || 12.975),
        customerLng: Number(o.longitude || 77.6),
        driverName: driver?.name || 'Assigned Delivery Rider',
        driverPhone: driver?.phone || '+91 9876543210',
        driverVehicle: vehicle,
        driverRating: Number(o.delivery?.deliveryPartner?.rating || 4.8),
        currentLocation: currLoc
          ? {
              latitude: Number(currLoc.latitude),
              longitude: Number(currLoc.longitude),
              heading: currLoc.heading ? Number(currLoc.heading) : null,
              speed: currLoc.speed ? Number(currLoc.speed) : null,
              updatedAt: currLoc.updatedAt,
            }
          : null,
        isStale,
        staleSinceMinutes,
      };

      setData(initial);
      if (initial.currentLocation) {
        setDriverLoc(initial.currentLocation);
      } else {
        setDriverLoc({
          latitude: initial.supplierLat,
          longitude: initial.supplierLng,
          heading: 90,
        });
      }
    } catch (err: any) {
      setErrorMsg('Failed to load live tracking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialTracking();
  }, [id]);

  // Subscribe to Supabase Realtime Channel for Live Location
  useEffect(() => {
    if (!id || !supabaseBrowser) return;

    const channelName = RealtimeChannels.orderTracking(id);
    const channel = supabaseBrowser
      .channel(channelName)
      .on('broadcast', { event: 'DELIVERY_LOCATION_UPDATED' }, (payload: any) => {
        if (payload.payload?.latitude && payload.payload?.longitude) {
          setDriverLoc({
            latitude: payload.payload.latitude,
            longitude: payload.payload.longitude,
            heading: payload.payload.heading,
            speed: payload.payload.speed,
            updatedAt: payload.payload.timestamp || new Date().toISOString(),
          });
          setData((prev) => (prev ? { ...prev, isStale: false } : prev));
        }
      })
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      if (supabaseBrowser) {
        supabaseBrowser.removeChannel(channel);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-4 border border-slate-800 flex items-center justify-center">
            <Bike className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Connecting to Mapbox Live GPS & Supabase Realtime...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">{errorMsg || 'Tracking Unavailable'}</h2>
          <Link href="/orders" className="inline-block mt-4 text-emerald-400 font-bold text-sm hover:underline">
            ← Back to Orders
          </Link>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3">
            <Link href={`/orders/${id}`} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/orders" className="hover:text-emerald-400 transition">My Orders</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-100 font-bold">{data.orderNumber}</span>
              </div>
              <h1 className="text-lg font-black text-white mt-0.5">Live Delivery Tracking</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <RealtimeStatusIndicator
              status={isSubscribed ? 'CONNECTED' : 'CONNECTING'}
              lastUpdated={driverLoc?.updatedAt ? new Date(driverLoc.updatedAt).toLocaleTimeString() : undefined}
            />
            <button
              onClick={fetchInitialTracking}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              title="Refresh tracking data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stale Location Warning Banner */}
        {data.isStale && (
          <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="block font-bold">⚠ Live location temporarily unavailable</span>
              <span className="text-[11px] text-amber-200 font-normal">
                Last updated {data.staleSinceMinutes} minutes ago. Delivery partner is on the way to your address.
              </span>
            </div>
          </div>
        )}

        {/* 6-Digit Delivery OTP Card */}
        {['OUT_FOR_DELIVERY', 'ARRIVED_AT_CUSTOMER', 'READY_FOR_PICKUP'].includes(data.status) && (
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/30 text-center space-y-2 backdrop-blur-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-xs font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Your Secure Delivery OTP</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400 py-1">
              7 4 9 2 0 1
            </div>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Share this 6-digit OTP with your delivery partner upon arrival to confirm delivery safely.
            </p>
          </div>
        )}

        {/* Main Grid: Map & Rider Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 backdrop-blur-md overflow-hidden">
              <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 relative">
                <LiveDeliveryMap
                  orderId={data.orderId}
                  supplierName={data.supplierName}
                  supplierLocation={[data.supplierLng, data.supplierLat]}
                  customerLocation={[data.customerLng, data.customerLat]}
                  initialDriverLocation={
                    driverLoc ? [driverLoc.longitude, driverLoc.latitude] : [data.supplierLng, data.supplierLat]
                  }
                  orderStatus={data.status}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Driver Profile */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Assigned Courier
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Clock className="w-3 h-3" /> ~8 mins
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
                  🛵
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{data.driverName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{data.driverVehicle} • ⭐ {data.driverRating}</p>
                </div>
              </div>

              <a
                href={`tel:${data.driverPhone}`}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" /> Call Rider ({data.driverPhone})
              </a>
            </div>

            {/* Route Timeline */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pickup Location</span>
                  <h4 className="font-bold text-xs text-white mt-0.5">{data.supplierName}</h4>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Delivery Address</span>
                  <h4 className="font-bold text-xs text-white mt-0.5">{data.deliveryAddress}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

