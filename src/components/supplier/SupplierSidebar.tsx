'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  MessageSquare,
  Tag,
  Star,
  BarChart3,
  ShieldCheck,
  Settings,
  Store,
} from 'lucide-react';

export default function SupplierSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/supplier/products', icon: Package },
    { label: 'Inventory', href: '/supplier/inventory', icon: Boxes },
    { label: 'Orders', href: '/supplier/orders', icon: ShoppingBag },
    { label: 'Customers', href: '/supplier/customers', icon: Users },
    { label: 'Messages', href: '/supplier/messages', icon: MessageSquare, badge: 'Live' },
    { label: 'Offers & Coupons', href: '/supplier/offers', icon: Tag },
    { label: 'Customer Reviews', href: '/supplier/reviews', icon: Star },
    { label: 'Analytics', href: '/supplier/analytics', icon: BarChart3 },
    { label: 'Verification', href: '/supplier/verification', icon: ShieldCheck },
    { label: 'Settings', href: '/supplier/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-4rem)] backdrop-blur-md">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white truncate max-w-[130px]">Supplier Hub</h3>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Merchant Console</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-md uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-[11px] text-slate-400">
        <span className="font-bold text-white block mb-0.5">SupplyBridge Verified</span>
        <span>Direct Supplier Network v2.4</span>
      </div>
    </aside>
  );
}
