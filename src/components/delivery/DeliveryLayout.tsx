'use client';

import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import DeliveryHeader from './DeliveryHeader';
import DeliverySidebar from './DeliverySidebar';
import DeliveryMobileNav from './DeliveryMobileNav';
import Link from 'next/link';
import { Bike, ShieldAlert } from 'lucide-react';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center animate-pulse">
            <Bike className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-400">Authenticating Rider Console...</span>
        </div>
      </div>
    );
  }

  // RBAC Access Check
  if (!user || (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white">Delivery Partner Access Required</h2>
          <p className="text-xs text-slate-400">
            This dashboard is restricted to registered and authenticated delivery partner accounts.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/delivery/register"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Register as Delivery Partner
            </Link>
            <Link href="/login" className="w-full py-2.5 bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition">
              Sign In with Existing Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DeliveryHeader />

      <div className="flex-1 flex">
        <DeliverySidebar />
        <main className="flex-1 pb-20 lg:pb-8">{children}</main>
      </div>

      <DeliveryMobileNav />
    </div>
  );
}
