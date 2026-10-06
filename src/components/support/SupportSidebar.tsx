'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Headphones,
  Ticket,
  Users,
  Store,
  Bike,
  ShoppingBag,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';

const SUPPORT_NAV_ITEMS = [
  { name: 'Support Dashboard', href: '/support/dashboard', icon: Headphones },
  { name: 'Ticket Queue', href: '/support/tickets', icon: Ticket },
  { name: 'Customers', href: '/support/customers', icon: Users },
  { name: 'Suppliers', href: '/support/suppliers', icon: Store },
  { name: 'Delivery Partners', href: '/support/delivery-partners', icon: Bike },
];

export default function SupportSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 h-full flex flex-col justify-between backdrop-blur-xl">
      <div className="p-4 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/support/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-teal-500/20">
              SUP
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">SupplyBridge</span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
                Support Center
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {SUPPORT_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Admin Control Center */}
      <div className="p-4 border-t border-slate-800/60">
        <Link
          href="/admin/dashboard"
          className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Admin Center</span>
        </Link>
      </div>
    </aside>
  );
}
