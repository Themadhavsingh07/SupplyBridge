'use client';

import React, { useState, useEffect } from 'react';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import DeliveryGPSWatcher from '@/components/delivery/DeliveryGPSWatcher';
import Link from 'next/link';
import {
  Bike,
  DollarSign,
  ShoppingBag,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery/earnings');
      const earningsData = await res.json();

      const profileRes = await fetch('/api/delivery/profile');
      const profileData = await profileRes.json();

      const ordersRes = await fetch('/api/delivery/orders');
      const ordersData = await ordersRes.json();

      setData({
        earnings: earningsData,
        profile: profileData.partner,
        availableCount: ordersData.deliveries?.length || 0,
      });
    } catch (err) {
      console.error('Failed to load delivery dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = {
    todayDeliveries: data?.earnings?.todayDeliveries || 0,
    todayEarnings: data?.earnings?.todayEarnings || 0,
    totalEarnings: data?.earnings?.totalEarnings || 0,
    rating: Number(data?.profile?.rating || 4.8),
    totalDeliveries: data?.profile?.totalDeliveries || 0,
    isOnline: data?.profile?.isOnline || false,
    isAvailable: data?.profile?.isAvailable || false,
    verificationStatus: data?.profile?.verificationStatus || 'PENDING',
  };

  return (
    <DeliveryLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bike className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rider Fleet Console</span>
            </div>
            <h1 className="text-2xl font-black text-white">{user?.name || 'Delivery Partner'}</h1>
            <p className="text-xs text-slate-400">Live GPS Tracking & Quick-Commerce Fulfillment</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboard}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/delivery/orders"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Available Orders ({data?.availableCount || 0})</span>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Today's Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">₹{metrics.todayEarnings}</div>
            <span className="text-[10px] text-emerald-400 font-bold">Lifetime: ₹{metrics.totalEarnings}</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Today's Deliveries</span>
              <Bike className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.todayDeliveries}</div>
            <span className="text-[10px] text-slate-400">Completed Orders</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Rider Rating</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.rating} ★</div>
            <span className="text-[10px] text-slate-400">From {metrics.totalDeliveries} total drops</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Shift Status</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 uppercase">
              {metrics.isOnline ? 'Online' : 'Offline'}
            </div>
            <span className="text-[10px] text-slate-400">{metrics.verificationStatus} Verification</span>
          </div>
        </div>

        {/* Active GPS Watcher */}
        <DeliveryGPSWatcher activeDeliveryId="demo_active_id" />

        {/* Navigation Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/delivery/orders"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Find Delivery Jobs</h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Browse available ready-for-pickup orders from nearby local suppliers.
            </p>
          </Link>

          <Link
            href="/delivery/earnings"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Earnings & Payouts</h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              View base fees, surge bonuses, customer tips & bank payout records.
            </p>
          </Link>

          <Link
            href="/delivery/verification"
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">KYC Verification</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              Upload Driving License, Govt ID & RC documents for active delivery status.
            </p>
          </Link>
        </div>
      </div>
    </DeliveryLayout>
  );
}
