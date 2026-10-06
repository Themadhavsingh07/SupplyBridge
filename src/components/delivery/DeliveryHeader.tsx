'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import DeliveryStatusToggle from './DeliveryStatusToggle';
import { Bike, Bell, LogOut, ExternalLink } from 'lucide-react';

export default function DeliveryHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Title & Status */}
        <div className="flex items-center gap-4">
          <Link href="/delivery/dashboard" className="flex items-center gap-2 font-black text-lg text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">
              Supply<span className="text-emerald-400">Courier</span>
            </span>
          </Link>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Delivery Partner Online Status Toggle */}
          <DeliveryStatusToggle initialOnline={false} initialAvailable={false} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-emerald-400 transition"
          >
            <span>Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/delivery/notifications"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <Bell className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-white block leading-tight truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Delivery Fleet</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-950/80 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
