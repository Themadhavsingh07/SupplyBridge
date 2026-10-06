'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Star,
  Ticket,
  BellRing,
  BarChart3,
  ShieldCheck,
  Settings,
  Headphones,
  Sparkles,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Store },
  { name: 'Delivery Partners', href: '/admin/delivery-partners', icon: Bike },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Complaints', href: '/admin/complaints', icon: AlertTriangle },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Notifications', href: '/admin/notifications', icon: BellRing },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 h-full flex flex-col justify-between backdrop-blur-xl">
      <div className="p-4 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20">
              SB
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">SupplyBridge</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                Admin Control
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switch to Support Mode Link */}
      <div className="p-4 border-t border-slate-800/60">
        <Link
          href="/support/dashboard"
          className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span>Support Tickets</span>
        </Link>
      </div>
    </aside>
  );
}
