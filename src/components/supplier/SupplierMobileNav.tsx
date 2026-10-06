'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, ShieldCheck } from 'lucide-react';

export default function SupplierMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/supplier/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/supplier/products', icon: Package },
    { label: 'Orders', href: '/supplier/orders', icon: ShoppingBag },
    { label: 'Inbox', href: '/supplier/messages', icon: MessageSquare },
    { label: 'Verify', href: '/supplier/verification', icon: ShieldCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
