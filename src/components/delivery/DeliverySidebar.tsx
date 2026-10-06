'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  History,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  Bike,
  Compass,
} from 'lucide-react';

export default function DeliverySidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/delivery/dashboard', icon: LayoutDashboard },
    { name: 'Available Deliveries', href: '/delivery/orders', icon: ShoppingBag },
    { name: 'Live Tracking', href: '/delivery/tracking', icon: Compass },
    { name: 'Earnings', href: '/delivery/earnings', icon: DollarSign },
    { name: 'Delivery History', href: '/delivery/history', icon: History },
    { name: 'Messages', href: '/delivery/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/delivery/notifications', icon: Bell },
    { name: 'Verification Status', href: '/delivery/verification', icon: ShieldCheck },
    { name: 'Settings & Profile', href: '/delivery/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 min-h-screen p-4 space-y-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
          <Bike className="w-6 h-6" />
        </div>
        <div>
          <span className="font-black text-white text-base block leading-tight">SupplyCourier</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Rider Fleet Console</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="font-bold text-white flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rider Safety & Insurance
        </div>
        <p className="text-[10px]">Active shift coverage & 24/7 helpline enabled.</p>
      </div>
    </aside>
  );
}
